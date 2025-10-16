// src/controllers/notification-controller.js
const { Notification, NotificationPreference, User, Student, Parent } = require('../models');
const sendEmail = require('../services/sendEmail');
const sendSMS = require('../services/sendSMS');
const Joi = require('joi');

// ---------------- Helper to send notification directly ----------------
const sendNotificationDirect = async (notificationData) => {
  const { type, notificationId, email, phone, content } = notificationData;
  
  try {
    if (type === 'email' && email) {
      await sendEmail({ email, content, notificationId });
    } else if (type === 'sms' && phone) {
      await sendSMS({ phone, content, notificationId });
    }
    // in_app notifications are just stored in DB, no external call needed
    
    // Update notification status
    await Notification.update(
      { status: 'sent', sentAt: new Date() },
      { where: { id: notificationId } }
    );
  } catch (err) {
    console.error(`Failed to send notification ${notificationId}:`, err);
    await Notification.update(
      { status: 'failed' },
      { where: { id: notificationId } }
    );
  }
};

// ---------------- Validation ----------------
const validateSendNotification = (data) => {
  return Joi.object({
    studentId: Joi.number().integer().required(),
    target: Joi.string().valid('student', 'parents', 'both').required(),
    type: Joi.string().valid('email', 'sms', 'in_app').required(),
    eventType: Joi.string().valid(
      'grade_updated',
      'attendance_alert',
      'report_card',
      'exam_reminder',
      'custom'
    ).required(),
    content: Joi.string().required(),
  }).validate(data);
};

const validateBulkSendNotification = (data) => {
  return Joi.object({
    studentIds: Joi.array().items(Joi.number().integer()).required(),
    target: Joi.string().valid('student', 'parents', 'both').required(),
    type: Joi.string().valid('email', 'sms', 'in_app').required(),
    eventType: Joi.string().valid(
      'grade_updated',
      'attendance_alert',
      'report_card',
      'exam_reminder',
      'custom'
    ).required(),
    content: Joi.string().required(),
  }).validate(data);
};

const validateNotificationPreferences = (data) => {
  return Joi.object({
    emailEnabled: Joi.boolean().optional(),
    smsEnabled: Joi.boolean().optional(),
    inAppEnabled: Joi.boolean().optional(),
  }).validate(data);
};

// ---------------- Controller ----------------

// Send single notification
const sendNotification = async (req, res) => {
  try {
    const { error } = validateSendNotification(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentId, target, type, eventType, content } = req.body;
    const tenantId = req.user.tenantId;

    const student = await Student.findOne({ where: { id: studentId, tenantId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const notifications = [];

    // ---------------- Student ----------------
    if (target === 'student' || target === 'both') {
      const user = await User.findOne({ where: { id: student.userId, tenantId } });
      if (user) {
        const pref = await NotificationPreference.findOne({ where: { userId: user.id, tenantId } });
        if (!pref || pref[`${type}Enabled`]) {
          const notif = await Notification.create({
            tenantId,
            userId: user.id,
            type,
            eventType,
            content,
            status: 'pending',
          });
          notifications.push(notif);

          // Send notification directly (no queue)
          await sendNotificationDirect({
            notificationId: notif.id,
            type,
            email: user.email,
            phone: user.phone,
            content,
          });
        }
      }
    }

    // ---------------- Parents ----------------
    if (target === 'parents' || target === 'both') {
      const parents = await Parent.findAll({ where: { studentId: student.id, tenantId } });
      for (const parent of parents) {
        console.log("👪 Processing parent (single):", {
          id: parent.id,
          email: parent.email,
          phone: parent.phone,
          userId: parent.userId,
        });

        let allowSend = true;
        if (parent.userId) {
          const pref = await NotificationPreference.findOne({ where: { userId: parent.userId, tenantId } });
          if (pref && !pref[`${type}Enabled`]) {
            allowSend = false;
          }
        }

        if (allowSend) {
          const notif = await Notification.create({
            tenantId,
            userId: parent.userId || null,
            parentId: parent.id,
            type,
            eventType,
            content: `[PARENT NOTICE for ${student.firstName} ${student.lastName}] ${content}`,
            status: 'pending',
          });
          notifications.push(notif);

          // Send notification directly (no queue)
          await sendNotificationDirect({
            notificationId: notif.id,
            type,
            email: parent.email,
            phone: parent.phone,
            content: notif.content,
          });
        } else {
          console.log(`⚠️ Skipped parent ${parent.id} due to preferences`);
        }
      }
    }

    res.status(201).json({ success: true, data: notifications });
  } catch (err) {
    console.error('Error in sendNotification:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send bulk notifications
const bulkSendNotification = async (req, res) => {
  try {
    const { error } = validateBulkSendNotification(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const { studentIds, target, type, eventType, content } = req.body;
    const tenantId = req.user.tenantId;

    const notifications = [];

    for (const studentId of studentIds) {
      const student = await Student.findOne({ where: { id: studentId, tenantId } });
      if (!student) continue;

      // ---------------- Student ----------------
      if (target === 'student' || target === 'both') {
        const user = await User.findOne({ where: { id: student.userId, tenantId } });
        if (user) {
          const pref = await NotificationPreference.findOne({ where: { userId: user.id, tenantId } });
          if (!pref || pref[`${type}Enabled`]) {
            const notif = await Notification.create({
              tenantId,
              userId: user.id,
              type,
              eventType,
              content,
              status: 'pending',
            });
            notifications.push(notif);

            // Send notification directly (no queue)
            await sendNotificationDirect({
              notificationId: notif.id,
              type,
              email: user.email,
              phone: user.phone,
              content,
            });
          }
        }
      }

      // ---------------- Parents ----------------
      if (target === 'parents' || target === 'both') {
        const parents = await Parent.findAll({ where: { studentId: student.id, tenantId } });
        for (const parent of parents) {
          console.log("👪 Processing parent (bulk):", {
            id: parent.id,
            email: parent.email,
            phone: parent.phone,
            userId: parent.userId,
          });

          let allowSend = true;
          if (parent.userId) {
            const pref = await NotificationPreference.findOne({ where: { userId: parent.userId, tenantId } });
            if (pref && !pref[`${type}Enabled`]) {
              allowSend = false;
            }
          }

          if (allowSend) {
            const notif = await Notification.create({
              tenantId,
              userId: parent.userId || null,
              parentId: parent.id,
              type,
              eventType,
              content: `[PARENT NOTICE for ${student.firstName} ${student.lastName}] ${content}`,
              status: 'pending',
            });
            notifications.push(notif);

            // Send notification directly (no queue)
            await sendNotificationDirect({
              notificationId: notif.id,
              type,
              email: parent.email,
              phone: parent.phone,
              content: notif.content,
            });
          } else {
            console.log(`⚠️ Skipped parent ${parent.id} due to preferences`);
          }
        }
      }
    }

    res.status(201).json({ success: true, data: notifications });
  } catch (err) {
    console.error('Error in bulkSendNotification:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { tenantId, userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Set notification preferences
const setNotificationPreferences = async (req, res) => {
  try {
    const { error } = validateNotificationPreferences(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    const [prefs, created] = await NotificationPreference.findOrCreate({
      where: { tenantId, userId },
      defaults: { ...req.body },
    });

    if (!created) await prefs.update(req.body);

    res.json({ success: true, data: prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;

    const prefs = await NotificationPreference.findOne({ where: { tenantId, userId } });

    res.json({ success: true, data: prefs || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  sendNotification,
  bulkSendNotification,
  getNotifications,
  setNotificationPreferences,
  getNotificationPreferences,
};


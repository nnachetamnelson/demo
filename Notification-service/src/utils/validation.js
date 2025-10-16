const Joi = require('joi');

// Single notification
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

// Bulk notification
const validateBulkSendNotification = (data) => {
  return Joi.object({
    studentIds: Joi.array().items(Joi.number().integer()).min(1).required(),
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

// Notification preferences
const validateNotificationPreferences = (data) => {
  return Joi.object({
    emailEnabled: Joi.boolean().optional(),
    smsEnabled: Joi.boolean().optional(),
    inAppEnabled: Joi.boolean().optional(),
  }).validate(data);
};

module.exports = {
  validateSendNotification,
  validateBulkSendNotification,
  validateNotificationPreferences,
};

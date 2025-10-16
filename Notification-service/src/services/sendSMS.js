// src/services/sendSMS.js
const logger = require('../utils/logger');

// Dummy SMS sender (replace with Twilio, Vonage, etc.)
const sendSMS = async ({ phone, content, notificationId }) => {
  try {
    logger.info(`📱 Sending SMS to ${phone} | Notification: ${notificationId}`);
    // TODO: integrate with your real SMS provider
    // await twilioClient.messages.create({...});
    return { success: true };
  } catch (err) {
    logger.error(`❌ Failed to send SMS to ${phone}`, err);
    return { success: false, error: err.message };
  }
};

module.exports = sendSMS;


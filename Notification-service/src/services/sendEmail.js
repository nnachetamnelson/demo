// src/services/sendEmail.js
const logger = require('../utils/logger');

// Dummy email sender (replace with Nodemailer, SendGrid, etc.)
const sendEmail = async ({ email, content, notificationId }) => {
  try {
    logger.info(`📧 Sending email to ${email} | Notification: ${notificationId}`);
    // TODO: integrate with your real email provider
    // await transporter.sendMail({...});
    return { success: true };
  } catch (err) {
    logger.error(`❌ Failed to send email to ${email}`, err);
    return { success: false, error: err.message };
  }
};

module.exports = sendEmail;

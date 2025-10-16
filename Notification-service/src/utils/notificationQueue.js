const { getChannel } = require('../config/rabbitmq');
const { sendEmail, sendSMS, sendInApp } = require('./deliveryMethods');

const processNotificationQueue = async () => {
  const channel = getChannel();
  await channel.consume('notifications', async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      try {
        if (payload.type === 'email' && payload.email) await sendEmail(payload);
        if (payload.type === 'sms' && payload.phone) await sendSMS(payload);
        if (payload.type === 'in_app') await sendInApp(payload);

        // Acknowledge that the message was processed
        channel.ack(msg);
        console.log(`✅ Processed notification ${payload.notificationId}`);
      } catch (err) {
        console.error('❌ Failed to process notification', err);
        // optionally: channel.nack(msg, false, true); to retry
      }
    }
  });
};

module.exports = { processNotificationQueue };

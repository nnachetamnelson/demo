// src/utils/notificationProducer.js
const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE = "notifications";

let channel;

async function connectProducer() {
  if (!channel) {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
  }
  return channel;
}

/**
 * Publish a notification to RabbitMQ
 * @param {Object} payload - { token, type, eventType, content, userId?, parentId? }
 */
async function sendNotification(payload) {
  const ch = await connectProducer();

  // Ensure payload has required fields
  if (!payload.token || !payload.type || !payload.eventType || !payload.content) {
    throw new Error("Missing required fields in notification payload");
  }

  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });

  console.log(`📨 Notification queued: ${payload.eventType}`);
}

module.exports = { sendNotification };

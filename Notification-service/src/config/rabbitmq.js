// src/config/rabbitmq.js
const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE = "notifications";

let channel = null;

async function connectRabbitMQ() {
  if (channel) return channel; // reuse existing channel

  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });

  console.log("✅ RabbitMQ channel ready");
  return channel;
}

async function sendToQueue(message) {
  const ch = await connectRabbitMQ();
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log("📤 Sent to queue:", message);
}

module.exports = { connectRabbitMQ, sendToQueue };

// src/consumers/notificationConsumer.js
const amqp = require("amqplib");
const jwt = require("jsonwebtoken");
const Notification = require("../models/Notification");
const Parent = require("../models/Parent");
const User = require("../models/User");
const sendEmail = require("../services/sendEmail");
const sendSMS = require("../services/sendSMS");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE = "notifications";

async function startNotificationConsumer() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });

    console.log(`✅ Notification consumer listening on queue: ${QUEUE}`);

    channel.consume(
      QUEUE,
      async (msg) => {
        if (!msg) return;

        let data;
        try {
          data = JSON.parse(msg.content.toString());
        } catch (err) {
          console.error("❌ Invalid message format:", err.message);
          return channel.ack(msg);
        }

        const {
          token,
          tenantId: rawTenantId,
          userId: rawUserId,
          parentId,
          type,
          eventType,
          content,
        } = data;

        let tenantId = rawTenantId;
        let userId = rawUserId;

        try {
          // --- Decode token if provided ---
          if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            tenantId = decoded.tenantId || tenantId;
            userId = decoded.userId || userId;
          }

          // --- Debug log IDs before DB queries ---
          console.log("🔍 Notification payload resolved IDs:", {
            tenantId,
            userId,
            parentId,
          });

          // --- Validate required fields ---
          if (!tenantId || (!userId && !parentId) || !eventType || !type) {
            throw new Error("Missing required notification fields");
          }

          // --- Resolve recipient ---
          let recipient = null;
          if (parentId && !userId) {
            // ✅ Handle parent-only case
            recipient = await Parent.findOne({ where: { id: parentId, tenantId } });
          } else if (userId) {
            // ✅ Normal user case
            recipient = await User.findOne({ where: { id: userId, tenantId } });
          }

          if (!recipient) {
            throw new Error(
              `No recipient found for ${parentId ? `parentId=${parentId}` : `userId=${userId}`}`
            );
          }

          // --- Save notification row ---
          const notification = await Notification.create({
            tenantId,
            userId: userId || null,   // 👈 Safe: null if not present
            parentId: parentId || null,
            type,
            eventType,
            content,
            status: "pending",
          });

          // --- Deliver notification ---
          if (type === "email") {
            if (!recipient.email) throw new Error("No email address available");
            await sendEmail(recipient.email, `Notification: ${eventType}`, content);
          } else if (type === "sms") {
            if (!recipient.phone) throw new Error("No phone number available");
            await sendSMS(recipient.phone, content);
          } else if (type === "in_app") {
            // Stored in DB; frontend will fetch
          }

          // --- Update status ---
          notification.status = "sent";
          notification.sentAt = new Date();
          await notification.save();

          channel.ack(msg);
        } catch (err) {
          console.error("❌ Failed to process notification:", err.message);

          // Try to persist failure safely
          try {
            await Notification.create({
              tenantId: tenantId || null,
              userId: userId || null,     // 👈 Safe assignment
              parentId: parentId || null,
              type: type || "unknown",
              eventType: eventType || "unknown",
              content: content || "",
              status: "failed",
            });
          } catch (innerErr) {
            console.error("❌ Could not save failed notification:", innerErr.message);
          }

          channel.ack(msg);
        }
        
    
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ Notification consumer error:", err.message);
  }
}

module.exports = { startNotificationConsumer };

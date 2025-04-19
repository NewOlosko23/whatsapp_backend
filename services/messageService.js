import sessionService from "./sessionService.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

const isValidPhoneNumber = (number) => {
  return /^\d{10,15}$/.test(number);
};

// Send single message
const sendMessage = async (userId, phone, message) => {
  const user = await User.findById(userId);
  if (!user || user.instanceStatus !== "connected") {
    throw new Error("User instance is not connected");
  }

  if (!isValidPhoneNumber(phone)) {
    throw new Error("Phone number must be in international format (no + sign)");
  }

  const client = sessionService.getClient(userId);
  if (!client) {
    throw new Error("Client instance not found");
  }

  const chatId = `${phone}@c.us`;
  const msg = await client.sendMessage(chatId, message);

  // Save to DB
  await Message.create({
    userId,
    phone,
    message,
    messageId: msg.id.id,
    status: "sent_to_server",
    sentAt: new Date(),
  });
};

// Send messages to multiple numbers
const sendBulkMessages = async (userId, phones, message) => {
  const user = await User.findById(userId);
  if (!user || user.instanceStatus !== "connected") {
    throw new Error("User instance is not connected");
  }

  if (!Array.isArray(phones) || phones.length === 0) {
    throw new Error("Phones must be a non-empty array");
  }

  const client = sessionService.getClient(userId);
  if (!client) {
    throw new Error("Client instance not found");
  }

  const results = await Promise.allSettled(
    phones.map(async (phone) => {
      if (!isValidPhoneNumber(phone)) {
        throw new Error(`Invalid phone number format: ${phone}`);
      }

      try {
        const chatId = `${phone}@c.us`;
        const msg = await client.sendMessage(chatId, message);
        await Message.create({
          userId,
          phone,
          message,
          messageId: msg.id.id,
          status: "sent",
          sentAt: new Date(),
        });
      } catch (err) {
        throw new Error(`Failed to send to ${phone}: ${err.message}`);
      }
    })
  );

  const summary = results.map((result, idx) => ({
    phone: phones[idx],
    status: result.status,
    reason: result.reason?.message || null,
  }));

  return summary;
};

const getMessagesByUser = async (userId) => {
  return await Message.find({ userId }).sort({ sentAt: -1 });
};

export default { sendMessage, sendBulkMessages, getMessagesByUser };

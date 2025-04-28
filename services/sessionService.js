import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

const ackMap = {
  0: "sent",
  1: "delivered",
  2: "read",
};

// Map to store session clients per user
const clientMap = new Map();

const createSession = async (userId) => {
  if (clientMap.has(userId)) return null;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox"],
    },
  });

  clientMap.set(userId, client);

  return new Promise((resolve, reject) => {
    client.on("qr", async (qr) => {
      const qrCode = await qrcode.toDataURL(qr);
      resolve(qrCode);
    });

    client.on("ready", async () => {
      const user = await User.findById(userId);
      console.log(
        `✅ WhatsApp session connected: Client for ${
          user?.username || userId
        } is ready.`
      );

      await User.findByIdAndUpdate(userId, {
        instanceStatus: "active",
        instanceId: userId,
      });

      client.on("message_ack", async (msg, ack) => {
        if (![0, 1, 2].includes(ack)) return;

        try {
          const status = ackMap[ack];
          await Message.findOneAndUpdate(
            { messageId: msg.id.id },
            { status, updatedAt: new Date() }
          );
        } catch (err) {
          console.error("Failed to update message status:", err.message);
        }
      });

      resolve(null);
    });

    client.on("auth_failure", async (msg) => {
      const user = await User.findById(userId);
      console.error(`❌ Auth failure for ${user?.username || userId}:`, msg);
      clientMap.delete(userId);
      reject(new Error("Authentication failed"));
    });

    client.on("disconnected", async () => {
      const user = await User.findById(userId);
      console.log(`❌ Client for ${user?.username || userId} disconnected`);
      await User.findByIdAndUpdate(userId, {
        instanceStatus: "inactive",
        instanceId: null,
      });
      clientMap.delete(userId);
    });

    try {
      client.initialize();
    } catch (err) {
      console.error(`Error initializing client for ${userId}:`, err);
      clientMap.delete(userId);
      reject(err);
    }
  });
};

const endSession = async (userId) => {
  const client = clientMap.get(userId);
  const user = await User.findById(userId);

  if (client) {
    await client.destroy();
    clientMap.delete(userId);
    await User.findByIdAndUpdate(userId, {
      instanceStatus: "inactive",
      instanceId: null,
    });
    console.log(`🛑 Session ended for ${user?.username || userId}`);
  } else {
    throw new Error("Session not found");
  }
};

const getClient = (userId) => {
  return clientMap.get(userId);
};

// ✅ Restore session manually for a specific user
const restoreSession = async (userId) => {
  if (clientMap.has(userId)) {
    const user = await User.findById(userId);
    console.log(`⚠️ Session already exists for ${user?.username || userId}`);
    return;
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox"],
    },
  });

  clientMap.set(userId, client);

  client.on("ready", async () => {
    const user = await User.findById(userId);
    console.log(`✅ Session manually restored for ${user?.username || userId}`);
    await User.findByIdAndUpdate(userId, {
      instanceStatus: "active",
      instanceId: userId,
    });
  });

  client.on("auth_failure", async (msg) => {
    const user = await User.findById(userId);
    console.error(`❌ Auth failure for ${user?.username || userId}:`, msg);
    clientMap.delete(userId);
  });

  client.on("disconnected", async () => {
    const user = await User.findById(userId);
    console.log(`❌ Client for ${user?.username || userId} disconnected`);
    await User.findByIdAndUpdate(userId, {
      instanceStatus: "inactive",
      instanceId: null,
    });
    clientMap.delete(userId);
  });

  client.initialize();
};

const userStatus = (userId) => {
  const client = clientMap.get(userId);

  if (!client) return false;

  try {
    const isConnected =
      client?.info?.wid && client?.info?.pushname && client?.info?.me;
    return Boolean(isConnected);
  } catch (err) {
    console.error(
      `❌ Error checking session status for ${userId}:`,
      err.message
    );
    return false;
  }
};

export default {
  createSession,
  endSession,
  getClient,
  restoreSession,
  userStatus,
};

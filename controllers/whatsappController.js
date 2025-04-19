import User from "../models/userModel.js";
import whatsappSessionService from "../services/sessionService.js";
import whatsappMessageService from "../services/messageService.js";

const startSession = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const qrCode = await whatsappSessionService.createSession(userId);

    res.status(200).json({ success: true, qrCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const endSession = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await whatsappSessionService.endSession(userId);

    res
      .status(200)
      .json({ success: true, message: "Session ended successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleRestoreSession = async (req, res) => {
  const userId = req.params.userId;
  try {
    await whatsappSessionService.restoreSession(userId);
    res.status(200).json({ message: `Session restored for user ${userId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendSingleMessage = async (req, res) => {
  const { userId, phone, message } = req.body;

  try {
    // Fetch the user by ID
    const user = await User.findById(userId);

    // Handle invalid user
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if session is active
    if (user.instanceStatus !== "connected") {
      return res
        .status(400)
        .json({ success: false, message: "User instance is not connected" });
    }

    // Proceed to send message
    await whatsappMessageService.sendMessage(userId, phone, message);

    res.status(200).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendBulkMessages = async (req, res) => {
  const { userId, phone, message } = req.body;

  try {
    // Fetch the user by ID
    const user = await User.findById(userId);

    // Handle invalid user
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if session is active
    if (user.instanceStatus !== "connected") {
      return res
        .status(400)
        .json({ success: false, message: "User instance is not connected" });
    }

    // Validate phone list
    if (!Array.isArray(phone) || phone.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Phone list is required" });
    }

    // Send bulk messages
    await whatsappMessageService.sendBulkMessages(userId, phone, message);

    res.status(200).json({ success: true, message: "Bulk messages sent!" });
  } catch (error) {
    console.error("Error sending bulk messages:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkSessionStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const status = user.instanceStatus || "disconnected";

    res.status(200).json({
      success: true,
      instanceStatus: status,
      instanceId: user.instanceId || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await whatsappMessageService.getMessagesByUser(userId);

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserStatus = (req, res) => {
  const { userId } = req.params;

  try {
    const isLoggedIn = whatsappSessionService.userStatus(userId);

    return res.json({
      userId,
      status: isLoggedIn ? "connected" : "disconnected",
    });
  } catch (err) {
    console.error("Error checking user status:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  startSession,
  endSession,
  sendSingleMessage,
  sendBulkMessages,
  checkSessionStatus,
  getUserMessages,
  handleRestoreSession,
  getUserStatus,
};

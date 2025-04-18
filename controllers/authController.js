import admin from "../firebaseAdmin.js";
import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
  const { token, email, username, uid } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    if (decoded.uid !== uid) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        email,
        username,
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ uid: decoded.uid });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const link = await admin.auth().generatePasswordResetLink(email, {
      url: "http://localhost:5173/login",
    });

    res.status(200).json({
      success: true,
      message: "Reset link generated",
      resetLink: link,
    });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Could not send reset email" });
  }
};

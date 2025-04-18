import admin from "../firebaseAdmin.js";
import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
  const { uid, email, username } = req.body;

  if (!uid || !email || !username) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
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
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: "Missing UID" });
  }

  try {
    const user = await User.findOne({ uid });

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


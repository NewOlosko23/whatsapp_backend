import User from "../models/userModel.js";

export const registerUser = async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
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

// Login User
export const loginUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Missing email" });
  }

  try {
    const user = await User.findOne({ email });

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

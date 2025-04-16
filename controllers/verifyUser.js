import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided, access denied.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

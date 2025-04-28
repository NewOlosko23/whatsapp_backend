import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { verifyUser } from "../controllers/verifyUser.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

//verify user
router.get("/user", verifyUser);

export default router;

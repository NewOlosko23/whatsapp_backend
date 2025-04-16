import express from "express";
import whatsappController from "../controllers/whatsappController.js";

const router = express.Router();

// Start session route
router.post("/start-session", whatsappController.startSession);

// End session route
router.post("/end-session", whatsappController.endSession);

// Send single message
router.post("/send-message", whatsappController.sendSingleMessage);

// Send bulk messages
router.post("/send-bulk-messages", whatsappController.sendBulkMessages);

//get session status
router.get("/session-status/:userId", whatsappController.checkSessionStatus);

//get session status
router.get("/restore/:userId", whatsappController.handleRestoreSession);

//getUser Messages
router.get("/messages/:userId", whatsappController.getUserMessages);

//get user's session status
router.get("/session/status/:userId", whatsappController.getUserStatus);

export default router;

import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { ChatBot } from "../controller/chat.controller.js";
const router = express.Router();

router.post("/", protectRoute, ChatBot);
// router.post("/test", chatBot);

export default router;

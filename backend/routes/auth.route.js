import express from "express";
import {
  getProfile,
  login,
  logout,
  refreshToken,
  signup,
  updateProfile,
  verifyEmail,
} from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.get("/verify-email", verifyEmail);
router.patch("/update-profile", protectRoute, updateProfile);

export default router;

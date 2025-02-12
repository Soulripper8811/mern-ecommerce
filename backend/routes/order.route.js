import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllOrders,
  getSingleUser,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllOrders);
router.get("/user-order", protectRoute, getSingleUser);

router.patch("/:orderId", protectRoute, adminRoute, updateOrderStatus);

export default router;

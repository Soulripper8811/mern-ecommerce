import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getSalesData } from "../controller/analytics.controller.js";

const router = express.Router();

// Route to get overall analytics data
router.get("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();
    res.json(analyticsData);
  } catch (error) {
    console.error("Error in analytics route:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Route to get sales data based on date range and type
router.get("/sales", protectRoute, adminRoute, getSalesData);

export default router;

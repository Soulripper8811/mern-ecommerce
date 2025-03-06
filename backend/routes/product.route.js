import express from "express";
import {
  CommentOnProduct,
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductComments,
  getProductsByCategory,
  getRecommendedProducts,
  getSingleProduct,
  toggleFeaturedProduct,
} from "../controller/products.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Routes
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getSingleProduct);
router.get("/:id/comments", getProductComments);

// Protected Routes
router.post("/:id/comment", protectRoute, CommentOnProduct);

// Admin Routes
router.get("/", protectRoute, getAllProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/featured/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;

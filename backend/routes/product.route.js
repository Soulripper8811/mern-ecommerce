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

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/featured", getFeaturedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.post("/:id/comment", protectRoute, CommentOnProduct);
router.get("/:id/comments", getProductComments);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/:id", protectRoute, getSingleProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;

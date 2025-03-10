import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error in getAllProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featuredProducts");

    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts)); // ✅ Stops execution
    }

    // If not found in Redis, fetch from DB
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" }); // ✅ Stops execution if empty
    }

    await redis.set("featuredProducts", JSON.stringify(featuredProducts));

    res.status(200).json(featuredProducts); // ✅ Single response
  } catch (error) {
    console.error("Error in get featured controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url || "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: { comments: { $exists: true, $ne: [] } }, // Exclude products with no comments
      },
      {
        $addFields: {
          reviewCount: { $size: "$comments" }, // Count the number of comments
        },
      },
      {
        $sort: { reviewCount: -1 }, // Sort by highest number of comments
      },
      {
        $limit: 3, // Get top 3 products
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          reviewCount: 1, // Include the review count in response
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("Error in getRecommendedProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error in getProductsByCategory controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error in getSingleProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const CommentOnProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, message } = req.body;
    const user = req.user?.name || req.user?.email;

    if (!rating || !message) {
      return res.status(400).json({ error: "Rating and message are required" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.comments.push({ user, rating, message });
    await product.save();

    res.json({ message: "Comment added successfully", product });
  } catch (error) {
    console.error("Error in CommentOnProduct controller:", error.message);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const getProductComments = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select("comments");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product.comments);
  } catch (error) {
    console.error("Error in getProductComments controller:", error.message);
    res.status(500).json({ error: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    // The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}

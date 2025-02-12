import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      products,
    });
  } catch (error) {
    console.log("Error in get all products controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featuredProducts");
    if (featuredProducts) {
      res.status(200).json(JSON.parse(featuredProducts));
    }
    //if not in redis then get from db
    //.lean() is gonna convert the whole object to javascript object not like in mongoose document  means its return in plain object good for performance

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));
    res.status(200).json(featuredProducts);
  } catch (error) {}
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let clodudinaryResponse = null;
    if (image) {
      clodudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "product",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: clodudinaryResponse?.secure_url
        ? clodudinaryResponse.secure_url
        : "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    console.log("Error in create product controller", error.message);
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
        console.log("Image is deleted from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary", error.message);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in delete product controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 4 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in get products by category controller", error.message);
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
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in getSingleProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const CommentOnProduct = async (req, res) => {
  const { id } = req.params;
  const { rating, message } = req.body;
  const user = req.user?.name || req.user?.email; // Get user info from auth middleware

  if (!rating || !message) {
    return res.status(400).json({ error: "Rating and message are required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Add new comment
    const newComment = { user, rating, message };
    product.comments.push(newComment);
    await product.save();

    res.json({ message: "Comment added successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const getProductComments = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id).select("comments");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product.comments);
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
async function updateFeaturedProductsCache() {
  try {
    // The lean() method  is used to return plain JavaScript objects instead of full Mongoose documents. This can significantly improve performance

    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}

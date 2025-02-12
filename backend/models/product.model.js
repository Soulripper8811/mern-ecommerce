import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type: String, // You can store user ID if you have authentication
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    comments: {
      type: [CommentSchema], // Optional array of comments
      default: [],
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

export default Product;

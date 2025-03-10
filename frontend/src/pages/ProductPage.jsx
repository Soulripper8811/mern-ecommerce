import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import { ShoppingCart, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";

const ProductDetails = () => {
  const { user } = useUserStore();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const { addToCart } = useCartStore();
  const { fetchProductsByCategory, products } = useProductStore();
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) {
       
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.category) {
      fetchProductsByCategory(product.category);
    }
  }, [fetchProductsByCategory, product?.category]);

  const fetchComments = async () => {
    try {
      const res = await axiosInstance.get(`/products/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Added to cart!");
  };

  const handleSubmitComment = async () => {
    if (!message.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      await axiosInstance.post(`/products/${id}/comment`, {
        user: user.name, // Use user name instead of ID for display
        rating,
        message,
      });

      setMessage("");
      setRating(5);
      toast.success("Comment added!");
      fetchComments(); // Refetch comments instead of manually adding
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to add comment");
    }
  };

  if (!product)
    return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-10 px-5 py-10 text-white">
      {/* Left Section: Product Image & Info */}
      <div className="flex-1">
        <img
          className="w-full h-96 object-cover rounded-lg"
          src={product.image}
          alt={product.name}
        />
        <h2 className="text-3xl font-bold mt-5">{product.name}</h2>
        <p className="text-xl text-emerald-400 font-semibold">
          ${product.price} per sqft
        </p>
        <p className="mt-3 text-gray-300">{product.description}</p>
        {user&&<button
          className="mt-5 flex items-center gap-2 bg-emerald-600 px-5 py-2 text-lg font-medium text-white rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} />
          Add to Cart
        </button>}

        {/* Comments Section */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold">Customer Reviews</h3>

          {/* Comment Form */}
          {
              user&&(

             <>
          <div className="mt-5">
            <h4 className="text-lg font-medium">Leave a Review</h4>
            <div className="flex gap-2 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={22}
                  className={`cursor-pointer ${
                    star <= rating ? "text-yellow-400" : "text-gray-500"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            
                <textarea
                className="w-full p-2 text-black rounded-lg"
                rows="3"
                placeholder="Write a review..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <button
                className="mt-3 bg-blue-600 px-5 py-2 text-lg font-medium text-white rounded-lg hover:bg-blue-700"
                onClick={handleSubmitComment}
                >
              Submit Review
            </button>
          </div>
                  </>   
            )
            }

          {/* Display Comments */}
          {comments?.length > 0 ? (
            comments?.map((comment, index) => (
              <div
                key={index}
                className="mt-4 p-3 border border-gray-600 rounded-lg"
              >
                <p className="text-lg font-medium">{comment?.user}</p>
                <p className="text-yellow-400">
                  {"⭐".repeat(comment?.rating)}
                </p>
                <p className="text-gray-300">{comment?.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(comment?.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 mt-3">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Right Section: Suggested Products */}
      <div className="w-full md:w-1/3 border-l border-gray-700 px-5">
        <h3 className="text-xl font-semibold mb-4">Recommended Products</h3>
        {products
          .filter((p) => p._id !== product?._id)
          .map((item) => (
            <Link
              to={`/product/${item._id}`}
              key={item._id}
              className="flex gap-3 p-3 hover:bg-gray-800 rounded-lg transition"
            >
              <img
                className="w-16 h-16 object-cover rounded-md"
                src={item.image}
                alt={item.name}
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-emerald-400">₹{item.price}</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default ProductDetails;

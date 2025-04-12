import { useState } from "react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  
  // Local state for quantity to update UI dynamically
  const [availableQuantity, setAvailableQuantity] = useState(product.quantity);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }

    if (availableQuantity <= 0) {
      toast.error("This product is out of stock", { id: "outOfStock" });
      return;
    }

    // Add product to cart and update available quantity
    addToCart(product);
    setAvailableQuantity((prev) => prev - 1);
    toast.success("Product added to cart!");
  };

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl aspect-[4/3]">
          <img
            className="object-cover w-full h-full"
            src={product.image}
            alt={product.name}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20" />
        </div>
      </Link>

      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product.name}
        </h5>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <span className="text-3xl font-bold text-emerald-400">
            ₹{product.price} per sqft
          </span>
        </div>

        {/* Display Available Quantity */}
        <p className="text-gray-300">Available: {availableQuantity}</p>

        {/* Show "Out of Stock" message if quantity is zero */}
        {availableQuantity > 0 ? (
          <button
            className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={!user || availableQuantity <= 0}
          >
            <ShoppingCart size={22} className="mr-2" />
            Add to cart
          </button>
        ) : (
          <p className="text-red-500 font-bold">Out of Stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

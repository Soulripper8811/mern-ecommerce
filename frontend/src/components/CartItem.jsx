import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { useProductStore } from "../stores/useProductStore";
import { Link } from "react-router-dom";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();
  const { updateProductQuantity } = useProductStore();

  const handleUpdateQuantity = (newQuantity) => {
    if (newQuantity < 1) return; // Avoid setting quantity below 1

    // Calculate difference between new and old quantity
    const quantityChange = newQuantity - item.quantity;

    updateQuantity(item._id, newQuantity);
    updateProductQuantity(item._id, -quantityChange); // Decrease/increase product stock
  };

  const handleRemove = () => {
    // When removing item, add the quantity back to stock
    updateProductQuantity(item._id, item.quantity);
    removeFromCart(item._id);
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          <Link to={`/product/${item._id}`}>
            <img className="h-20 md:h-32 rounded object-cover" src={item.image} />
          </Link>
        </div>

        <div className="flex items-center justify-between md:order-3 md:justify-end">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
            >
              <Minus className="text-gray-300" />
            </button>
            <p>{item.quantity}</p>
            <button
              className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
            >
              <Plus className="text-gray-300" />
            </button>
          </div>

          <div className="text-end md:order-4 md:w-32">
            <p className="text-base font-bold text-emerald-400">
              ₹{item.price}
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
          <p className="text-base font-medium text-white hover:text-emerald-400 hover:underline">
            {item.name}
          </p>
          <p className="text-sm text-gray-400">{item.description}</p>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300 hover:underline"
              onClick={handleRemove}
            >
              <Trash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

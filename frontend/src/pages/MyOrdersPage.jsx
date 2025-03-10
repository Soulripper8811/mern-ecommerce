import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { PackageCheck, PackageX, Clock, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { user } = useUserStore();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await axiosInstance.get("/orders/user-order");
      setOrders(response.data);
    } catch (error) {
      
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto mt-10 p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold text-white mb-5">My Orders</h2>

      {orders.length > 0 ? (
        <div className="space-y-5">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              className="bg-gray-900 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleOrderDetails(order._id)}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">
                  Order ID: {order._id}
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-3 py-1 text-sm font-semibold rounded-md flex items-center ${
                      order.status === "Pending"
                        ? "bg-yellow-500 text-gray-900"
                        : order.status === "Shipped"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {order.status === "Pending" && <Clock className="mr-2" />}
                    {order.status === "Shipped" && <PackageCheck className="mr-2" />}
                    {order.status === "Delivered" && <PackageX className="mr-2" />}
                    {order.status}
                  </div>
                  {expandedOrder === order._id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
              </div>

              {/* Order Details - Expandable Section */}
              {expandedOrder === order._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 p-4 rounded-lg mt-3"
                >
                  <div className="text-gray-300">
                    <p className="mb-2">
                      <span className="font-semibold">Total Amount:</span> ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <p className="font-semibold mb-2">Products:</p>
                    <ul className="space-y-3">
                      {order.products.map((p) => (
                        <li key={p.product._id} className="flex items-center space-x-3 bg-gray-700 p-3 rounded-md">
                          {/* Clickable Product Image */}
                          <Link to={`/product/${p.product._id}`} className="flex gap-4">
                            <img
                              src={p.product.image}
                              alt={p.product.name}
                              className="w-16 h-16 object-cover rounded-md hover:opacity-80 transition-opacity"
                            />
                            <div>
                              <p className="text-white">{p.product.name}</p>
                              <p className="text-gray-400">
                                {p.quantity} x ₹{p.price.toFixed(2)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-gray-400">
                      <span className="font-semibold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400">
                      <span className="font-semibold">Delivery Address:</span>{" "}
                      {order.shippingAddress
                        ? `${order.shippingAddress.fullName}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
                        : "No address provided"}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">You have no orders yet.</p>
      )}
    </motion.div>
  );
};

export default MyOrdersPage;

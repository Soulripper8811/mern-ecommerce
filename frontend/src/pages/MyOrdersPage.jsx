import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PackageCheck, PackageX, Clock } from "lucide-react"; // Icons for order statuses
import axiosInstance from "../lib/axios";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await axiosInstance.get("/orders/user-order");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
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
              className="bg-gray-900 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">
                  Order ID: {order._id}
                </h3>
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

                  {order.status === "Shipped" && (
                    <PackageCheck className="mr-2" />
                  )}
                  {order.status === "Delivered" && (
                    <PackageX className="mr-2" />
                  )}
                  {order.status}
                </div>
              </div>

              <div className="text-gray-300">
                <p className="mb-2">
                  <span className="font-semibold">Total Amount:</span> $
                  {order.totalAmount.toFixed(2)}
                </p>
                <p className="font-semibold mb-2">Products:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {order.products.map((p) => (
                    <li key={p.product._id} className="text-gray-400">
                      {p.product.name} x {p.quantity} - ${p.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
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

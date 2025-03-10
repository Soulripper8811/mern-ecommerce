import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { PackageCheck, PackageX } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get("/orders");
      console.log("Orders fetched:", res.data); // Debugging log

      if (!res.data || !Array.isArray(res.data)) {
        throw new Error("Invalid order data received");
      }

      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log("Updating order:", orderId, "New Status:", newStatus);
      await axiosInstance.patch(`/orders/${orderId}`, { status: newStatus });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order?._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update status.");
    }
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto mt-10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-bold text-white mb-4">Admin Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Products
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {orders.length > 0 ? (
              orders.map((order) =>
                order ? ( // Ensure order is not null
                  <tr key={order._id} className="hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-white">
                      {order.user?.name || "Unknown User"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {order.products?.length > 0 ? (
                        order.products.map((p) =>
                          p?.product ? (
                            <p key={p.product._id}>
                              {p.product?.name} x {p.quantity}
                            </p>
                          ) : (
                            <p key={p.quantity}>Unknown Product x {p.quantity}</p>
                          )
                        )
                      ) : (
                        <p>No products</p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                      ₹{order.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        className="p-2 bg-gray-900 text-white rounded cursor-pointer w-full"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {order.status === "Pending" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "Shipped")}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 p-2 rounded"
                        >
                          <PackageX className="h-5 w-5" />
                        </button>
                      )}
                      {order.status === "Shipped" && (
                        <button
                          onClick={() => handleStatusChange(order._id, "Delivered")}
                          className="text-green-400 hover:text-green-300 transition-colors duration-200 p-2 rounded"
                        >
                          <PackageCheck className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ) : null
              )
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminOrders;

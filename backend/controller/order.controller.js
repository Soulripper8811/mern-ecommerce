import Order from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name") // Populate user name
      .populate({
        path: "products.product",
        select: "name price image", // Ensure name & image are selected
      })
      .lean(); // Convert Mongoose documents to plain objects

    res.json(orders);
  } catch (error) {
    console.error("Error in get all orders controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userId", userId);

    // Fetch orders for the user and populate product details
    const orders = await Order.find({ user: userId })
      .populate({
        path: "products.product",
        select: "name price image", // Ensure product details are included
      })
      .lean(); // Convert Mongoose documents to plain objects

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Filter out delivered orders
   

    res.json(orders);
  } catch (error) {
    console.error("Error in get single user orders controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//admin route only
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

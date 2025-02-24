import Order from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name")
      .populate("products.product", "name price image");
    res.json(orders);
  } catch (error) {
    console.log("Error in get all orders controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userId", userId);
    const order = await Order.find({
      user: userId,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const NotDeliveredOrder = order.filter(
      (order) => order.status !== "Delivered"
    );

    res.json(NotDeliveredOrder);
  } catch (error) {
    console.log("Error in get single order controller", error.message);
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

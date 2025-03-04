import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Fetch overall analytics data
export const getAnalyticsData = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
      users: totalUsers,
      products: totalProducts,
      totalSales,
      totalRevenue,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw new Error("Failed to fetch analytics data.");
  }
};

// Fetch sales data based on query params
export const getSalesData = async (req, res) => {
  try {
    let { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required." });
    }

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    let salesData;
    if (type === "daily") {
      salesData = await getDailySalesData(startDate, endDate);
    } else if (type === "monthly") {
      salesData = await getMonthlySalesData(startDate, endDate);
    } else if (type === "yearly") {
      salesData = await getYearlySalesData(startDate, endDate);
    } else {
      return res.status(400).json({ message: "Invalid type. Choose 'daily', 'monthly', or 'yearly'." });
    }

    res.status(200).json({ salesData });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Function to get daily sales data
export const getDailySalesData = async (startDate, endDate) => {
  try {
    return await getFormattedSalesData(startDate, endDate, "%Y-%m-%d");
  } catch (error) {
    console.error("Error fetching daily sales data:", error);
    throw error;
  }
};

// Function to get monthly sales data
export const getMonthlySalesData = async (startDate, endDate) => {
  try {
    return await getFormattedSalesData(startDate, endDate, "%Y-%m");
  } catch (error) {
    console.error("Error fetching monthly sales data:", error);
    throw error;
  }
};

// Function to get yearly sales data
export const getYearlySalesData = async (startDate, endDate) => {
  try {
    return await getFormattedSalesData(startDate, endDate, "%Y");
  } catch (error) {
    console.error("Error fetching yearly sales data:", error);
    throw error;
  }
};

// Reusable function for getting formatted sales data
const getFormattedSalesData = async (startDate, endDate, format) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return salesData.map(({ _id, sales, revenue }) => ({
      date: _id,
      sales,
      revenue,
    }));
  } catch (error) {
    throw error;
  }
};

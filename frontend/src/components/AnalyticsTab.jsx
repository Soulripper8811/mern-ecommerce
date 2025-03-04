import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [timeRange, setTimeRange] = useState("daily"); // "daily", "monthly", "yearly"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { data } = await axios.get("/analytics");
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to fetch analytics data.");
      }
    };

    const fetchSalesData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const startDate = new Date();

        if (timeRange === "daily") {
          startDate.setDate(today.getDate() - 7);
        } else if (timeRange === "monthly") {
          startDate.setMonth(today.getMonth() - 6);
        } else if (timeRange === "yearly") {
          startDate.setFullYear(today.getFullYear() - 3);
        }

        const { data } = await axios.get(
          `/analytics/sales?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}&type=${timeRange}`
        );
        setSalesData(data.salesData || []);
      } catch (err) {
        console.error("Error fetching sales data:", err);
        setError("Failed to fetch sales data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
    fetchSalesData();
  }, [timeRange]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard title="Total Users" value={analyticsData.users.toLocaleString()} icon={Users} />
        <AnalyticsCard title="Total Products" value={analyticsData.products.toLocaleString()} icon={Package} />
        <AnalyticsCard title="Total Sales" value={analyticsData.totalSales.toLocaleString()} icon={ShoppingCart} />
        <AnalyticsCard title="Total Revenue" value={`$${analyticsData.totalRevenue.toLocaleString()}`} icon={DollarSign} />
      </div>

      {/* Time Filter Dropdown */}
      <div className="mb-4">
        <label className="text-white mr-2">Select Time Range:</label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Sales Data Chart */}
      <motion.div
        className="bg-gray-800/60 rounded-lg p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={timeRange === "daily" ? "date" : timeRange === "monthly" ? "month" : "year"} 
              stroke="#D1D5DB" 
            />
            <YAxis yAxisId="left" stroke="#10B981" />
            <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#10B981" activeDot={{ r: 8 }} name="Sales" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3B82F6" activeDot={{ r: 8 }} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

// Analytics Card Component
const AnalyticsCard = ({ title, value, icon: Icon }) => (
  <motion.div
    className="bg-gray-800 rounded-lg p-6 shadow-lg relative"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);

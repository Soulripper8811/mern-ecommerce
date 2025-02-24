import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://mern-ecommerce-1-rirm.onrender.com",
  // import.meta.mode === "development" ? "http://localhost:5000/api" : "/api",
  withCredentials: true,
});
export default axiosInstance;

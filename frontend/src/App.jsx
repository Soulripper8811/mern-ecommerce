import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";

import Navbar from "./components/Navbar";
import toast, { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurcahseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ProductPage from "./pages/ProductPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ProfilePage from "./pages/ProfilePage";
import { useProductStore } from "./stores/useProductStore";
import ChatButton from "./components/ChatButton";
import axiosInstance from "./lib/axios";
import UpdateProductForm from "./pages/updateProductPage";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { products, fetchAllProducts } = useProductStore();
  const { getCartItems } = useCartStore();
  const [chatProducts, setChatProducts] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      getCartItems();
    }
  }, [user]);

  // ✅ Fixed: Using async/await properly and avoiding infinite re-renders
  const fetchProductsAll = async () => {
    try {
      const response = await axiosInstance.get("/products"); // ✅ Await added
      setChatProducts(response.data.products);
      console.log("Fetched Products:", response.data.products);
    } catch (error) {
      
    }
  };

  useEffect(() => {
    fetchProductsAll();
  }, []); // ✅ Runs only once when the component mounts

  useEffect(() => {
    fetchAllProducts(); // ✅ Fetching products for Zustand store
  }, []);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>
      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              user?.role === "admin" ? (
                <Navigate to="/secret-dashboard" />
              ) : (
                <HomePage />
              )
            }
          />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/secret-dashboard"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/secret-dashboard/:productId"
            element={
              user?.role === "admin" ? <UpdateProductForm /> : <Navigate to="/login" />
            }
          />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/cart"
            element={user ? <CartPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-success"
            element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchase-cancel"
            element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
          />
          {/* <Route
            path="/product/:id"
            element={user ? <ProductPage /> : <Navigate to="/login" />}
          /> */}
          <Route
            path="/product/:id"
            element={<ProductPage />}
          />
          <Route
            path="/myorder"
            element={user ? <MyOrdersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Toaster />
      {user && products.length > 0 && (
        <ChatButton products={chatProducts} userId={user._id} />
      )}
    </div>
  );
}

export default App;

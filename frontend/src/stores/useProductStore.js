import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  // ✅ Set products
  setProducts: (products) => set({ products }),

  // ✅ Fetch all products
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products");
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  // ✅ Fetch products by category
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },
  updateProduct: async (productId, updatedData) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`, updatedData);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId ? { ...product, ...updatedData } : product
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update product");
      set({ loading: false });
    }
  },

  // ✅ Fetch a single product
  fetchSingleProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/${productId}`);
      set({ loading: false });
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch product");
      set({ loading: false });
    }
  },

  // ✅ Create a product
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      set((state) => ({
        products: [...state.products, res.data],
        loading: false,
      }));
      toast.success("Product created successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create product");
      set({ loading: false });
    }
  },

  // ✅ Delete a product
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
        loading: false,
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete product");
      set({ loading: false });
    }
  },

  // ✅ Toggle featured product
  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/featured/${productId}`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
        loading: false,
      }));
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update product");
      set({ loading: false });
    }
  },
  decreaseProductQty: (productId) => {
    set((state) => ({
      products: state.products.map((product) =>
        product._id === productId
          ? { ...product, quantity: Math.max(0, product.quantity - 1) }
          : product
      ),
    }));
  },
  updateProductQuantity: (id, change) =>
    set((state) => ({
      products: state.products.map((p) =>
        p._id === id ? { ...p, quantity: p.quantity + change } : p
      ),
    })),
  increaseProductQty: (productId) => {
    set((state) => ({
      products: state.products.map((product) =>
        product._id === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      ),
    }));
  },

  // ✅ Fetch featured products
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
}));

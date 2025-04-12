import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, Save } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const categories = [
  "carpet-wooden",
  "PVC-carpet-marble",
  "carpet-vinyl-tiles",
  "flower-wallpaper",
  "geometric-wallpaper",
  "bricks-wallpaper",
  "3d-wallpaper",
];

const UpdateProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { fetchSingleProduct, updateProduct, loading } = useProductStore();

  const [product, setProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Fetch product details when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await fetchSingleProduct(productId);
        if (productData) {
          setProduct({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price || "",
            category: productData.category || "",
            image: productData.image || "",
            quantity: productData.quantity || "",
          });
          setImagePreview(productData.image || "");
        }
      } catch (error) {
        toast.error("Failed to fetch product details.");
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    const success = await updateProduct(productId, product);
    if (success) {
      toast.success("Product updated successfully!");
      navigate("/secret-dashboard");
    } else {
      toast.error("Failed to update product. Please try again.");
    }
  };

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProduct((prev) => ({ ...prev, image: reader.result }));
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loadingProduct) {
    return (
      <div className="text-center py-10 text-gray-300">
        <Loader className="animate-spin mx-auto h-10 w-10" />
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Update Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Product Name</label>
          <input
            type="text"
            value={product?.name || ""}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={product?.description || ""}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows="3"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Price</label>
          <input
            type="number"
            value={product?.price || ""}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            step="0.01"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Quantity</label>
          <input
            type="number"
            value={product?.quantity || ""}
            onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
            step="1"
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <select
            value={product?.category || ""}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          >
            <option disabled value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div className="mt-1 flex items-center">
          <input type="file" id="image" className="sr-only" accept="image/*" onChange={handleImageChange} />
          <label
            htmlFor="image"
            className="cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md text-sm text-gray-300 hover:bg-gray-600 focus:ring-emerald-500"
          >
            <Upload className="h-5 w-5 inline-block mr-2" />
            Upload Image
          </label>
          {imageLoading && <Loader className="h-5 w-5 animate-spin ml-3 text-gray-400" />}
          {imagePreview && !imageLoading && (
            <img src={imagePreview} alt="Preview" className="ml-3 h-12 w-12 rounded-md shadow-md" />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </motion.div>
  );
};

export default UpdateProductForm;

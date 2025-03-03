import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Loader, CheckCircle } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading, updateProfile } = useUserStore();

  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    address: user.address,
    profileImage: user.profileImage,
    isVerified: user.isVerified,
  });

  const [previewImage, setPreviewImage] = useState(user.profileImage || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        setPreviewImage(base64Image);
        setProfile((prev) => ({ ...prev, profileImage: base64Image }));
        toast.success("Profile image updated successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(profile);
    navigate("/profile");
  };

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Profile</h2>
      <div className="flex flex-col items-center mb-4">
        <label htmlFor="image" className="relative cursor-pointer">
          <img
            src={previewImage || "/placeholder-avatar.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-gray-600 object-cover"
          />
          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </label>
        {loading && <Loader className="h-5 w-5 animate-spin mt-2 text-white" />}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            readOnly
            type="email"
            value={profile.email}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Delivery Address
          </label>
          <textarea
            type="text"
            value={profile.address}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-300">Verified:</span>
          <CheckCircle
            className={`h-5 w-5 ${
              profile.isVerified ? "text-emerald-500" : "text-gray-500"
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium"
        >
          Save Profile
        </button>
      </form>
    </motion.div>
  );
};

export default ProfilePage;

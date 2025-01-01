import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.status(200).json(coupon || null);
  } catch (error) {
    console.log("Error in get coupons controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(200).json({ message: "Coupon is expired" });
    }
    res.json({
      message: "Coupon is valid",
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
    });
  } catch (error) {
    console.log("Error in validate coupon controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendMail } from "../lib/emailService.js";
import cloudinary from "../lib/cloudinary.js";
dotenv.config();

function genrateToken(userId) {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refreshToken:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60 //7days
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, //1day
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires: expirationTime,
      isVerified: false,
    });

    const verifyLink = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;
    await sendMail(
      user.email,
      "Verify Your Email",
      verifyLink,
      "Verify Email",
      "Please verify your email within 5 minutes, or your account will be deleted."
    );

    res.status(201).json({
      _id: user._id,
      message: "Verification email sent. Please verify within 5 minutes.",
    });

    setTimeout(async () => {
      const stillUnverifiedUser = await User.findOne({
        _id: user._id,
        isVerified: false,
      });

      if (stillUnverifiedUser) {
        await User.deleteOne({ _id: user._id });
        console.log(
          `User with email ${user.email} was deleted due to no verification.`
        );
      }
    }, 5 * 60 * 1000);
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first." });
    }

    const { accessToken, refreshToken } = genrateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; //jo name save karne ke time likha wahi likhna hoga
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refreshToken:${decoded.userId}`);
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.status(200).json({ message: "Logged out successfully" });
    }
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No Refresh token is provided" });
    }
    const decoded = await jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const storedToken = await redis.get(`refreshToken:${decoded.userId}`);
    if (storedToken !== refreshToken || !storedToken) {
      return res.status(401).json({ message: "Refresh token is invalid" });
    }
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, //1day
    });
    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refresh token controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in get profile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Invalid or missing token." });
    }

    // Find the user with the token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Check if the token is expired
    if (user.verificationTokenExpires < new Date()) {
      await User.deleteOne({ _id: user._id }); // Delete user since token expired
      return res.status(400).json({
        message: "Verification token expired. Please sign up again.",
      });
    }

    // Mark user as verified and remove token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error) {
    console.log("Error in email verification:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, profileImage } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let cloudinaryResponse = null;

    if (profileImage) {
      if (user.profileImage) {
        const publicId = user.profileImage.split("/").pop().split(".")[0];

        try {
          await cloudinary.uploader.destroy(`user/${publicId}`);
          console.log("Old profile image deleted from Cloudinary.");
        } catch (error) {
          console.error(
            "Error deleting old image from Cloudinary:",
            error.message
          );
        }
      }

      cloudinaryResponse = await cloudinary.uploader.upload(profileImage, {
        folder: "user",
      });

      user.profileImage = cloudinaryResponse.secure_url;
    }

    if (name) {
      user.name = name;
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

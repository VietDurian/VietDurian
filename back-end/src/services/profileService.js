import User from "../model/userModel.js";
import createError from "http-errors";

const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const updateProfile = async (userId, updateData) => {
  try {
    // Validate updateData - prevent updating password and role directly
    const { password, role, ...allowedData } = updateData;

    const user = await User.findByIdAndUpdate(userId, allowedData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw createError(404, "User not found");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const getPublicProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select(
      "full_name avatar phone email role created_at"
    );

    if (!user) {
      throw createError(404, "User not found");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

export const profileService = {
  getProfile,
  updateProfile,
  getPublicProfile,
};

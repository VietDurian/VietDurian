import { profileService } from "@/services/profileService.js";
import createError from "http-errors";

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      throw createError(401, "User not authenticated");
    }

    const profile = await profileService.getProfile(userId);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const updateData = req.body;

    if (!userId) {
      throw createError(401, "User not authenticated");
    }

    // Validate update data
    const allowedFields = ["full_name", "phone", "avatar"];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      throw createError(400, "No valid fields provided for update");
    }

    const updatedProfile = await profileService.updateProfile(
      userId,
      filteredData
    );

    res.status(200).json({
      code: 200,
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicProfile = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      throw createError(400, "User ID is required");
    }

    const publicProfile = await profileService.getPublicProfile(user_id);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Public profile retrieved successfully",
      data: publicProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const profileController = {
  getProfile,
  updateProfile,
  getPublicProfile,
};

import { profileService } from "@/services/profileService.js";
import { cloudinary } from "@/config/cloudinary.js";

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
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
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    // Validate update data
    const allowedFields = ["full_name", "phone", "avatar"];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // If avatar is provided as base64/dataURL, upload to Cloudinary and store URL
    if (
      typeof filteredData.avatar === "string" &&
      filteredData.avatar &&
      (filteredData.avatar.startsWith("data:image/") ||
        filteredData.avatar.startsWith("data:application/octet-stream"))
    ) {
      try {
        const result = await cloudinary.uploader.upload(filteredData.avatar, {
          folder: "vietdurian/avatars",
          resource_type: "image",
        });
        filteredData.avatar = result.secure_url;
      } catch (e) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Image upload failed",
        });
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        code: 400,
        message: "No valid fields provided for update",
      });
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
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: "User ID is required",
      });
    }

    const publicProfile = await profileService.getPublicProfile(userId);

    res.status(200).json({
      code: 200,
      success: true,
      message: `You have successfully retrieved the profile of ${publicProfile.full_name}`,
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

import { ratingService } from "@/services/ratingService.js";

// Create a new rating
const createRating = async (req, res, next) => {
  try {
    const { productId, stars, content } = req.body;
    const userId = req.user?.id || req.user?._id;

    // Validate required fields
    if (!productId || !stars) {
      return res.status(400).json({
        code: 400,
        message: "Product ID and stars are required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    // Validate stars range
    if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      return res.status(400).json({
        code: 400,
        message: "Stars must be an integer between 1 and 5",
      });
    }

    const newRating = await ratingService.createRating({
      userId,
      productId,
      stars,
      content: content || "",
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Rating created successfully",
      data: newRating,
    });
  } catch (error) {
    next(error);
  }
};

// Get all ratings for a product
const getProductRatings = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page, limit } = req.query;

    if (!productId) {
      return res.status(400).json({
        code: 400,
        message: "Product ID is required",
      });
    }

    const result = await ratingService.getProductRatings({
      productId,
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Product ratings retrieved successfully",
      data: result.data,
      statistics: result.statistics,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's rating for a product
const getUserProductRating = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!productId) {
      return res.status(400).json({
        code: 400,
        message: "Product ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    const rating = await ratingService.getUserProductRating({
      userId,
      productId,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "User rating retrieved successfully",
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

// Update a rating
const updateRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const { stars, content } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!ratingId) {
      return res.status(400).json({
        code: 400,
        message: "Rating ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    // Validate stars if provided
    if (stars && (stars < 1 || stars > 5 || !Number.isInteger(stars))) {
      return res.status(400).json({
        code: 400,
        message: "Stars must be an integer between 1 and 5",
      });
    }

    const updatedRating = await ratingService.updateRating({
      ratingId,
      userId,
      stars,
      content,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Rating updated successfully",
      data: updatedRating,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a rating
const deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!ratingId) {
      return res.status(400).json({
        code: 400,
        message: "Rating ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    await ratingService.deleteRating({
      ratingId,
      userId,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get user's all ratings
const getUserRatings = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { page, limit } = req.query;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: "User not authenticated",
      });
    }

    const result = await ratingService.getUserRatings({
      userId,
      page: page || 1,
      limit: limit || 10,
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "User ratings retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const ratingController = {
  createRating,
  getProductRatings,
  getUserProductRating,
  updateRating,
  deleteRating,
  getUserRatings,
};

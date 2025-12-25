import { Rating } from "@/model/ratingModel.js";
import createError from "http-errors";

// Create a new rating
const createRating = async ({ userId, productId, stars, content }) => {
  try {
    // Check if user already rated this product
    const existingRating = await Rating.findOne({
      user_id: userId,
      product_id: productId,
    });

    if (existingRating) {
      throw createError(
        400,
        "You have already rated this product. Please update your rating instead."
      );
    }

    // Validate stars
    if (!stars || stars < 1 || stars > 5) {
      throw createError(400, "Stars must be between 1 and 5");
    }

    const newRating = new Rating({
      user_id: userId,
      product_id: productId,
      stars,
      content: content || "",
    });

    const savedRating = await newRating.save();

    // Populate user and product details
    await savedRating.populate("user_id", "full_name avatar");
    await savedRating.populate("product_id", "name");

    return savedRating;
  } catch (error) {
    throw error;
  }
};

// Get all ratings for a product with statistics
const getProductRatings = async ({ productId, page = 1, limit = 10 }) => {
  try {
    if (!productId) {
      throw createError(400, "Product ID is required");
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get all ratings for this product
    const [ratings, total] = await Promise.all([
      Rating.find({ product_id: productId })
        .populate("user_id", "full_name avatar")
        .skip(skip)
        .limit(limitNumber)
        .sort({ created_at: -1 }),
      Rating.countDocuments({ product_id: productId }),
    ]);

    // Calculate statistics
    const allRatings = await Rating.find({ product_id: productId });

    const statistics = {
      totalRatings: total,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };

    if (allRatings.length > 0) {
      // Calculate average
      const sum = allRatings.reduce((acc, rating) => acc + rating.stars, 0);
      statistics.averageRating = (sum / allRatings.length).toFixed(1);

      // Calculate distribution
      allRatings.forEach((rating) => {
        statistics.ratingDistribution[rating.stars]++;
      });

      // Convert counts to percentages
      for (let star = 1; star <= 5; star++) {
        statistics.ratingDistribution[star] = {
          count: statistics.ratingDistribution[star],
          percentage: (
            (statistics.ratingDistribution[star] / allRatings.length) *
            100
          ).toFixed(1),
        };
      }
    }

    return {
      data: ratings,
      statistics,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get user's rating for a specific product
const getUserProductRating = async ({ userId, productId }) => {
  try {
    const rating = await Rating.findOne({
      user_id: userId,
      product_id: productId,
    })
      .populate("user_id", "full_name avatar")
      .populate("product_id", "name");

    if (!rating) {
      throw createError(404, "Rating not found");
    }

    return rating;
  } catch (error) {
    throw error;
  }
};

// Update a rating
const updateRating = async ({ ratingId, userId, stars, content }) => {
  try {
    // Verify ownership
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      throw createError(404, "Rating not found");
    }

    if (rating.user_id.toString() !== userId) {
      throw createError(403, "You can only update your own ratings");
    }

    // Validate stars if provided
    if (stars && (stars < 1 || stars > 5)) {
      throw createError(400, "Stars must be between 1 and 5");
    }

    // Update fields
    if (stars !== undefined) {
      rating.stars = stars;
    }
    if (content !== undefined) {
      rating.content = content;
    }

    const updatedRating = await rating.save();

    // Populate details
    await updatedRating.populate("user_id", "full_name avatar");
    await updatedRating.populate("product_id", "name");

    return updatedRating;
  } catch (error) {
    throw error;
  }
};

// Delete a rating
const deleteRating = async ({ ratingId, userId }) => {
  try {
    const rating = await Rating.findById(ratingId);

    if (!rating) {
      throw createError(404, "Rating not found");
    }

    // Verify ownership
    if (rating.user_id.toString() !== userId) {
      throw createError(403, "You can only delete your own ratings");
    }

    await Rating.findByIdAndDelete(ratingId);

    return { message: "Rating deleted successfully" };
  } catch (error) {
    throw error;
  }
};

// Get user's all ratings
const getUserRatings = async ({ userId, page = 1, limit = 10 }) => {
  try {
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [ratings, total] = await Promise.all([
      Rating.find({ user_id: userId })
        .populate("product_id", "name price")
        .skip(skip)
        .limit(limitNumber)
        .sort({ created_at: -1 }),
      Rating.countDocuments({ user_id: userId }),
    ]);

    return {
      data: ratings,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        itemsPerPage: limitNumber,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const ratingService = {
  createRating,
  getProductRatings,
  getUserProductRating,
  updateRating,
  deleteRating,
  getUserRatings,
};

import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Index for unique user rating per product
ratingSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

export { Rating };

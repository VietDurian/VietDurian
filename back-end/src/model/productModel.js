//Vo Lam Thuy Vi
import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const productSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeProduct",
      required: true,
    },
    diary_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Diary",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
      min: 0,
    },
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductImage",
      },
    ],
    view_count: {
      type: Number,
      default: 0,
    },
    rating: {
      type: mongoose.Types.Decimal128,
      default: 0,
      min: 0,
      max: 5,
    },
    harvest_start_date: {
      type: Date,
      required: true,
    },
    harvest_end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["active", "inactive"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Product = mongoose.model("Product", productSchema);
const ProductImage = mongoose.model("ProductImage", productImageSchema);

export { Product, ProductImage };

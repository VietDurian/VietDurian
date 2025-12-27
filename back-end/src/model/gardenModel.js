import mongoose from "mongoose";

const GardenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    crop_type: {
      type: String,
      required: true,
    },
    area: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    longitude: {
      type: Number,
    },
    latitude: {
      type: Number,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const GardenModel = mongoose.model("Garden", GardenSchema);
export { GardenModel };

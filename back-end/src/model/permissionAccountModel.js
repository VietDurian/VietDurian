import mongoose from "mongoose";

// Align schema with DB: permission_accounts
const permissionAccountSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requested_role: {
      type: String,
      enum: ["serviceProvider", "contentExpert"],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    document: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    collection: "permission_accounts",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const PermissionAccountModel = mongoose.model(
  "PermissionAccount",
  permissionAccountSchema
);
export { PermissionAccountModel };

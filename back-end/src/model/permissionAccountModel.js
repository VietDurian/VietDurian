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
      enum: ["serviceProvider", "contentExpert", "farmer"],
      required: false,
    },
    description: {
      type: String,
      default: "",
    },
    proofs: [
      {
        type: {
          type: String,
          enum: ["cccd_front", "cccd_back", "degree", "certificate", "other"],
          required: true,
        },
        url: { type: String, required: true },
        note: { type: String, default: "" },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    verify_cccd: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    rejection_reason: {
      type: String,
      default: "",
    },
  },
  {
    collection: "permission_accounts",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const PermissionAccountModel = mongoose.model(
  "PermissionAccount",
  permissionAccountSchema,
);
export { PermissionAccountModel };

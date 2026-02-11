//Vo Lam Thuy Vi
import mongoose from "mongoose";

const serviceProviderProfileSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        business_name: {
            type: String,
            required: true,
            trim: true,
        },
        services: {
            type: String,
            default: "",
            trim: true,
        },
        service_areas: {
            type: String,
            default: "",
            trim: true,
        },
        experience_year: {
            type: Number,
            default: 0,
            min: 0,
        },
        contact_phone: {
            type: String,
            default: "",
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

// Ensure one profile per user
// serviceProviderProfileSchema.index({ user_id: 1 }, { unique: true });

const ServiceProviderProfile = mongoose.model(
    "ServiceProviderProfile",
    serviceProviderProfileSchema
);

export default ServiceProviderProfile;

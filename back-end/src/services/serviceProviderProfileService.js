import createError from "http-errors";
import ServiceProviderProfile from "@/model/serviceProviderProfileModel.js";

const filterPayload = (payload = {}) => {
    const allowed = [
        "business_name",
        "services",
        "service_areas",
        "experience_year",
        "contact_phone",
        "description",
    ];
    const data = {};
    for (const key of allowed) {
        if (payload[key] !== undefined) data[key] = payload[key];
    }
    if (data.experience_year !== undefined) {
        const num = Number(data.experience_year);
        data.experience_year = Number.isFinite(num) && num >= 0 ? num : 0;
    }
    return data;
};

const addCapabilityProfile = async (userId, payload) => {
    try {
        const exists = await ServiceProviderProfile.findOne({ user_id: userId });
        if (exists) {
            throw createError(409, "Capability profile already exists for user");
        }

        const data = filterPayload(payload);
        if (!data.business_name) {
            throw createError(400, "'business_name' is required");
        }

        const profile = await ServiceProviderProfile.create({
            user_id: userId,
            ...data,
        });
        return profile;
    } catch (error) {
        throw error;
    }
};

const updateCapabilityProfile = async (userId, payload) => {
    try {
        const data = filterPayload(payload);
        const profile = await ServiceProviderProfile.findOneAndUpdate(
            { user_id: userId },
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!profile) {
            throw createError(404, "Capability profile not found");
        }
        return profile;
    } catch (error) {
        throw error;
    }
};

export const serviceProviderProfileService = {
    addCapabilityProfile,
    updateCapabilityProfile,
};

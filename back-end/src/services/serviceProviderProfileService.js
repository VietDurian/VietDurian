import createError from "http-errors";
import ServiceProviderProfile from "@/model/serviceProviderProfileModel.js";
import { cloudinary } from "@/config/cloudinary";

const isCloudinaryUrl = (value) =>
    typeof value === "string" && /^https?:\/\/res\.cloudinary\.com\//i.test(value);

const normalizeServices = (value) => {
    if (!Array.isArray(value)) {
        return value;
    }

    return value.map((item) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            return {};
        }

        const data = {};
        if (item.name !== undefined) {
            data.name = typeof item.name === "string" ? item.name.trim() : "";
        }
        if (item.image !== undefined) {
            data.image = typeof item.image === "string" ? item.image.trim() : "";
        }
        return data;
    });
};

const isValidServicesArray = (value) => {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(
            (item) =>
                item &&
                typeof item === "object" &&
                !Array.isArray(item) &&
                typeof item.name === "string" &&
                item.name.trim() &&
                typeof item.image === "string" &&
                item.image.trim()
        )
    );
};

const uploadServicesImages = async (services = []) => {
    const uploadedServices = [];

    for (const item of services) {
        const image = item.image;

        if (isCloudinaryUrl(image)) {
            uploadedServices.push(item);
            continue;
        }

        try {
            const result = await cloudinary.uploader.upload(image, {
                folder: "vietdurian/service-provider-services",
            });

            uploadedServices.push({
                ...item,
                image: result.secure_url,
            });
        } catch (error) {
            throw createError(400, "Upload ảnh dịch vụ lên Cloudinary thất bại");
        }
    }

    return uploadedServices;
};

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

    if (data.services !== undefined) {
        data.services = normalizeServices(data.services);
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

        if (!isValidServicesArray(data.services)) {
            throw createError(400, "Services phải là mảng, mỗi phần tử có name và image");
        }

        data.services = await uploadServicesImages(data.services);

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

        if (Object.prototype.hasOwnProperty.call(data, "services")) {
            if (!isValidServicesArray(data.services)) {
                throw createError(400, "Services phải là mảng, mỗi phần tử có name và image");
            }

            data.services = await uploadServicesImages(data.services);
        }

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

const getCapabilityProfile = async (userId) => {
    try {
        const profile = await ServiceProviderProfile.findOne({ user_id: userId });
        return profile;
    } catch (error) {
        throw error;
    }
};

export const serviceProviderProfileService = {
    addCapabilityProfile,
    updateCapabilityProfile,
    getCapabilityProfile,
};

import { serviceProviderProfileService } from "@/services/serviceProviderProfileService.js";

const addCapabilityProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;

        const profile = await serviceProviderProfileService.addCapabilityProfile(
            userId,
            req.body
        );

        res.status(201).json({
            code: 201,
            message: "Capability profile created successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

const updateCapabilityProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;

        const profile = await serviceProviderProfileService.updateCapabilityProfile(
            userId,
            req.body
        );

        res.status(200).json({
            code: 200,
            message: "Capability profile updated successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

const getCapabilityProfile = async (req, res, next) => {
    try {
        // Lấy user_id từ query hoặc từ user đăng nhập
        const userId = req.query.user_id || req.user?._id || req.user?.id;

        const profile = await serviceProviderProfileService.getCapabilityProfile(userId);

        if (!profile) {
            return res.status(404).json({
                code: 404,
                message: "Capability profile not found",
            });
        }

        res.status(200).json({
            code: 200,
            message: "Capability profile retrieved successfully",
            data: profile,
        });
    } catch (error) {
        next(error);
    }
};

export const serviceProviderProfileController = {
    addCapabilityProfile,
    updateCapabilityProfile,
    getCapabilityProfile,
};

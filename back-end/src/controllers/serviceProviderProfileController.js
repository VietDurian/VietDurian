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

export const serviceProviderProfileController = {
    addCapabilityProfile,
    updateCapabilityProfile,
};

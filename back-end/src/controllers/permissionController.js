// Vo Lam Thuy Vi
import { permissionService } from "@/services/permissionService.js";
import { proofUploadService } from "@/services/proofUploadService.js";

const getPermissionRequests = async (req, res, next) => {
    try {
        const requests = await permissionService.getPermissionRequests();
        res.status(200).json({
            code: 200,
            message: "Permission requests retrieved successfully",
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

const getPermissionRequestDetail = async (req, res, next) => {
    try {
        const { request_id } = req.params;
        const request = await permissionService.getPermissionRequestDetail(
            request_id
        );
        if (!request) {
            return res
                .status(404)
                .json({ code: 404, message: "Permission request not found" });
        }
        res.status(200).json({
            code: 200,
            message: "Permission request detail retrieved successfully",
            data: request,
        });
    } catch (error) {
        next(error);
    }
};

const searchPermissionRequests = async (req, res, next) => {
    try {
        const { status = "", keyword = "" } = req.query;
        const requests = await permissionService.searchPermissionRequests({
            status,
            keyword,
        });
        res.status(200).json({
            code: 200,
            message: "Permission requests searched successfully",
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

const sortPermissionRequests = async (req, res, next) => {
    try {
        const { status = "pending", sort = "desc" } = req.query;
        const requests = await permissionService.sortPermissionRequests({
            status,
            sort,
        });
        res.status(200).json({
            code: 200,
            message: "Permission requests sorted successfully",
            data: requests,
        });
    } catch (error) {
        next(error);
    }
};

const confirmAccount = async (req, res, next) => {
    try {
        const { request_id } = req.params;
        const adminId = req.user._id;
        const result = await permissionService.confirmPermissionRequest(
            request_id,
            adminId
        );
        res.status(200).json({
            code: 200,
            message: "Permission request approved successfully (proofs verified)",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const rejectAccount = async (req, res, next) => {
    try {
        const { request_id } = req.params;
        const { reason = "" } = req.body;
        const adminId = req.user._id;
        const result = await permissionService.rejectPermissionRequest(
            request_id,
            adminId,
            reason
        );
        res.status(200).json({
            code: 200,
            message: "Account upgrade rejected successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
const submitProofs = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { proofs } = req.body;

        const result = await permissionService.submitProofs(userId, proofs);

        res.status(200).json({
            code: 200,
            message: "Proofs submitted successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};
const isMyAccountApproved = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const result = await permissionService.isMyAccountApproved(userId);
        res.status(200).json({
            code: 200,
            message: "Account approval status retrieved successfully",
            data: result,
        });
    } catch (err) {
        next(err);
    }
};

const uploadProof = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { file, proofType } = req.body;

        if (!file || !proofType) {
            return res.status(400).json({
                code: 400,
                message: "File and proof type are required",
            });
        }

        // Validate proof type
        const validTypes = [
            "cccd_front",
            "cccd_back",
            "certificate",
            "degree",
            "other",
        ];
        if (!validTypes.includes(proofType)) {
            return res.status(400).json({
                code: 400,
                message: "Invalid proof type",
            });
        }

        // Upload file to Cloudinary
        const uploadResult = await proofUploadService.uploadProofFile(
            file,
            proofType,
        );

        res.status(200).json({
            code: 200,
            message: "Proof file uploaded successfully",
            data: uploadResult,
        });
    } catch (err) {
        next(err);
    }
};

export const permissionController = {
    getPermissionRequests,
    searchPermissionRequests,
    sortPermissionRequests,
    getPermissionRequestDetail,
    confirmAccount,
    rejectAccount,
    submitProofs,
    isMyAccountApproved,
    uploadProof,
};

// Vo Lam Thuy Vi
import { permissionService } from "@/services/permissionService.js";

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
        const { status = "pending", search = "" } = req.query;
        const requests = await permissionService.searchPermissionRequests({
            status,
            search,
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
            message: "Account upgrade approved successfully",
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

export const permissionController = {
    getPermissionRequests,
    searchPermissionRequests,
    sortPermissionRequests,
    getPermissionRequestDetail,
    confirmAccount,
    rejectAccount,
};

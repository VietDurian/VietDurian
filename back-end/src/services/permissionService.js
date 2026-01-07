// Vo Lam Thuy Vi
import { PermissionAccountModel } from "@/model/permissionAccountModel.js";
import User from "@/model/userModel.js";
import { notificationService } from "@/services/notificationService.js";

const getPermissionRequests = async () => {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
        ];

        // Default sort by created_at desc for stable listing
        pipeline.push({ $sort: { created_at: -1 } });

        return await PermissionAccountModel.aggregate(pipeline);
    } catch (error) {
        throw error;
    }
};

const getPermissionRequestDetail = async (request_id) => {
    try {
        const request = await PermissionAccountModel.findById(request_id)
            .populate("user_id", "full_name email avatar role is_verified is_banned")
            .lean();
        return request;
    } catch (error) {
        throw error;
    }
};

const searchPermissionRequests = async ({
    status = "pending",
    search = "",
}) => {
    try {
        const query = {};
        if (status) query.status = status;

        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.full_name": { $regex: search, $options: "i" } },
                        { "user.email": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }

        return await PermissionAccountModel.aggregate(pipeline);
    } catch (error) {
        throw error;
    }
};

const sortPermissionRequests = async ({
    status = "pending",
    sort = "desc",
}) => {
    try {
        const query = {};
        if (status) query.status = status;

        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            { $sort: { created_at: sort === "asc" ? 1 : -1 } },
        ];

        return await PermissionAccountModel.aggregate(pipeline);
    } catch (error) {
        throw error;
    }
};

const confirmPermissionRequest = async (request_id, adminId) => {
    try {
        const request = await PermissionAccountModel.findById(request_id);
        if (!request) throw new Error("Permission request not found");
        if (request.status !== "pending")
            throw new Error("Request already processed");

        // Update user role
        const user = await User.findById(request.user_id);
        if (!user) throw new Error("User not found");
        user.role = request.requested_role;
        await user.save();

        // Update request status
        request.status = "approved";
        await request.save();

        // Notify user
        try {
            await notificationService.createNotification({
                receiver_id: user._id,
                sender_id: adminId,
                entity_type: "permission_approval",
                message: `Your account upgrade to ${request.requested_role} has been approved.`,
            });
        } catch (err) {
            // Non-blocking
            console.error("Notification error:", err.message);
        }

        return request;
    } catch (error) {
        throw error;
    }
};

const rejectPermissionRequest = async (request_id, adminId, reason = "") => {
    try {
        const request = await PermissionAccountModel.findById(request_id);
        if (!request) throw new Error("Permission request not found");
        if (request.status !== "pending")
            throw new Error("Request already processed");

        request.status = "rejected";
        // store rejection reason in description field
        request.description = reason || request.description;
        await request.save();

        // Notify user
        try {
            await notificationService.createNotification({
                receiver_id: request.user_id,
                sender_id: adminId,
                entity_type: "permission_rejection",
                message: `Your account upgrade request was rejected${reason ? ": " + reason : ""
                    }.`,
            });
        } catch (err) {
            console.error("Notification error:", err.message);
        }

        return request;
    } catch (error) {
        throw error;
    }
};

export const permissionService = {
    getPermissionRequests,
    searchPermissionRequests,
    sortPermissionRequests,
    getPermissionRequestDetail,
    confirmPermissionRequest,
    rejectPermissionRequest,
};

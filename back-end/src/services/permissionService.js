// Vo Lam Thuy Vi
import { PermissionAccountModel } from "@/model/permissionAccountModel.js";
import User from "@/model/userModel.js";
import { notificationService } from "@/services/notificationService.js";
import { emailService } from "./emailService.js";

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

    pipeline.push({ $sort: { created_at: -1 } });
    return await PermissionAccountModel.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
};

const getPermissionRequestDetail = async (request_id) => {
  try {
    const request = await PermissionAccountModel.findById(request_id)
      .populate("user_id", "full_name email phone avatar role is_verified is_banned created_at updated_at")
      .lean();
    console.log("Request detail:", request);
    return request;

  } catch (error) {
    throw error;
  }
};

const searchPermissionRequests = async ({ status = "", keyword = "" }) => {
  try {
    const query = {};
    if (status !== "all") query.status = status;

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

    if (keyword) {
      pipeline.push({
        $match: {
          $or: [
            { "user.full_name": { $regex: keyword, $options: "i" } },
            { "user.email": { $regex: keyword, $options: "i" } },
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
      await emailService.sendPermissionStatusEmail({
        name: user.full_name || "User",
        email: user.email,
        status: "approved",
        role: request.requested_role,
      });
    } catch (err) {
      console.error("Email error (approved):", err.message);
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
    let user = null;
    try {
      user = await User.findById(request.user_id);
    } catch {
      /* bỏ qua */
    }
    try {
      await emailService.sendPermissionStatusEmail({
        name: user?.full_name || "User",
        email: user?.email,
        status: "rejected",
        role: request.requested_role,
        reason,
      });
    } catch (err) {
      console.error("Email error (rejected):", err.message);
    }

    return request;
  } catch (error) {
    throw error;
  }
};
const submitProofs = async (userId, proofs = []) => {
  const request = await PermissionAccountModel.findOne({
    user_id: userId,
  });

  if (!request) {
    const error = new Error(
      "Permission request not found or already processed",
    );
    error.status = 404;
    throw error;
  }

  const types = new Set(proofs.map((p) => p.type));
  const hasFront = types.has("cccd_front");
  const hasBack = types.has("cccd_back");
  const hasCertificate = types.has("certificate");
  if (!hasFront || !hasBack || !hasCertificate) {
    const error = new Error("CCCD front, back, and certificate are required");
    error.status = 400;
    throw error;
  }

  request.proofs = proofs;
  await request.save();
  return request;
};

const isMyAccountApproved = async (userId) => {
  const request = await PermissionAccountModel.findOne({
    user_id: userId,
  });

  if (!request) return false;

  return request.verify_cccd === "approved";
};
export const permissionService = {
  getPermissionRequests,
  searchPermissionRequests,
  sortPermissionRequests,
  getPermissionRequestDetail,
  confirmPermissionRequest,
  rejectPermissionRequest,
  submitProofs,
  isMyAccountApproved,
};

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
    const results = await PermissionAccountModel.aggregate(pipeline);
    // Always return verify_cccd as the main status
    return results.map((r) => ({
      ...r,
      status: r.verify_cccd, // FE will use verify_cccd as status
    }));
  } catch (error) {
    throw error;
  }
};

const getPermissionRequestDetail = async (request_id) => {
  try {
    const request = await PermissionAccountModel.findById(request_id)
      .populate(
        "user_id",
        "full_name email phone avatar role is_verified verify_cccd is_banned created_at updated_at",
      )
      .lean();
    return request;
  } catch (error) {
    throw error;
  }
};

const searchPermissionRequests = async ({ verify_cccd = "", keyword = "" }) => {
  try {
    const query = {};
    if (verify_cccd && verify_cccd !== "all") query.verify_cccd = verify_cccd;

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

    pipeline.push({ $sort: { created_at: -1 } });
    const results = await PermissionAccountModel.aggregate(pipeline);
    // Always return verify_cccd as the main status
    return results.map((r) => ({
      ...r,
      status: r.verify_cccd, // FE will use verify_cccd as status
    }));
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
    if (status) query.verify_cccd = status;

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

    const results = await PermissionAccountModel.aggregate(pipeline);
    // Always return verify_cccd as the main status
    return results.map((r) => ({
      ...r,
      status: r.verify_cccd, // FE will use verify_cccd as status
    }));
  } catch (error) {
    throw error;
  }
};

const confirmPermissionRequest = async (request_id, adminId) => {
  try {
    const request = await PermissionAccountModel.findById(request_id);
    if (!request) throw new Error("Permission request not found");

    if (request.verify_cccd !== "pending") {
      throw new Error("Request already processed");
    }

    const proofs = request.proofs || [];
    const types = new Set(proofs.map((p) => p.type));
    const hasFront = types.has("cccd_front");
    const hasBack = types.has("cccd_back");
    const hasCertificate = types.has("certificate");

    if (!hasFront || !hasBack || !hasCertificate) {
      const error = new Error("CCCD front, back, and certificate are required");
      error.status = 400;
      throw error;
    }

    request.verify_cccd = "approved";
    request.rejection_reason = "";
    await request.save();

    let user = null;
    try {
      user = await User.findById(request.user_id);
    } catch {}

    try {
      await emailService.sendPermissionStatusEmail({
        name: user?.full_name || "User",
        email: user?.email,
        status: "approved",
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

    if (request.verify_cccd !== "pending") {
      throw new Error("Request already processed");
    }

    request.verify_cccd = "rejected";
    request.rejection_reason = reason || "";
    await request.save();

    let user = null;
    try {
      user = await User.findById(request.user_id);
    } catch {}

    try {
      await emailService.sendPermissionStatusEmail({
        name: user?.full_name || "User",
        email: user?.email,
        status: "rejected",
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
  const types = new Set(proofs.map((p) => p.type));
  const hasFront = types.has("cccd_front");
  const hasBack = types.has("cccd_back");
  const hasCertificate = types.has("certificate");

  if (!hasFront || !hasBack || !hasCertificate) {
    const error = new Error("CCCD front, back, and certificate are required");
    error.status = 400;
    throw error;
  }

  let request = await PermissionAccountModel.findOne({ user_id: userId });

  if (!request) {
    request = new PermissionAccountModel({
      user_id: userId,
      proofs,
      verify_cccd: "pending",
      rejection_reason: "",
    });
  } else {
    request.proofs = proofs;
    request.verify_cccd = "pending";
    request.rejection_reason = "";
  }

  await request.save();
  return request;
};

const isMyAccountApproved = async (userId) => {
  const request = await PermissionAccountModel.findOne({ user_id: userId });

  if (!request) return false;

  return request.verify_cccd === "approved";
};
const getVerifyCCCDStatus = async (userId) => {
  const request = await PermissionAccountModel.findOne({ user_id: userId });

  if (!request) return "error at getVerifyCCCDStatus";

  return request.verify_cccd;
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
  getVerifyCCCDStatus,
};

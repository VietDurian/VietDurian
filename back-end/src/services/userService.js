// Vo Lam Thuy Vi
import User from "../model/userModel.js";
import createError from "http-errors";

const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw createError(404, "User not found");
  return user;
};



const banUser = async (id, is_banned) => {
  console.log(`Attempting to update user ${id} with is_banned=${is_banned}`);
  const user = await User.findByIdAndUpdate(id, { is_banned }, { new: true });

  if (!user) throw createError(404, "User not found");

  console.log(
    `User updated successfully: ${user.full_name}, is_banned=${user.is_banned}`
  );
  return user;
};



const searchUsers = async (query) => {
  const keyword = (query || "").trim();
  console.log("Searching with keyword:", keyword);
  if (!keyword) return [];

  // Tìm tất cả account chứa keyword trong tên hoặc email
  const allMatches = await User.find({
    $or: [
      { full_name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } },
    ],
  }).select("-password");

  // Nếu số lượng kết quả > 10, kiểm tra có nhiều account trùng tên/email không
  if (allMatches.length > 10) {
    // Lọc ra các account trùng tên hoặc email (không phân biệt hoa thường, so sánh exact)
    const lowerKeyword = keyword.toLowerCase();
    const exactMatches = allMatches.filter(
      (u) =>
        u.full_name.toLowerCase() === lowerKeyword ||
        u.email.toLowerCase() === lowerKeyword
    );
    // Nếu có nhiều account trùng tên/email, trả về hết các account này
    if (exactMatches.length > 0) {
      console.log(
        `Found ${exactMatches.length} exact matches for "${keyword}", returning all`
      );
      return exactMatches;
    }
  }
  // Nếu không, chỉ trả về tối đa 10 kết quả đầu tiên
  console.log(
    `Returning first 10 results out of ${allMatches.length} for "${keyword}"`
  );
  return allMatches.slice(0, 10);
};

const toPositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const filterUsers = async ({ role, is_banned, keyword, page, limit, excludeUserId }) => {
  const filter = {};
  if (role) filter.role = role;
  if (is_banned !== undefined) filter.is_banned = is_banned;
  if (excludeUserId) filter._id = { $ne: excludeUserId };

  const normalizedKeyword = (keyword || "").trim();
  if (normalizedKeyword) {
    filter.$or = [
      { full_name: { $regex: normalizedKeyword, $options: "i" } },
      { email: { $regex: normalizedKeyword, $options: "i" } },
    ];
  }

  const pageNumber = toPositiveInt(page);
  const limitNumber = toPositiveInt(limit);

  // Keep backward compatibility for old callers: without page/limit return full list.
  if (!pageNumber || !limitNumber) {
    return await User.find(filter).sort({ createdAt: -1 }).select("-password");
  }

  const skip = (pageNumber - 1) * limitNumber;
  const [users, totalItems] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .select("-password"),
    User.countDocuments(filter),
  ]);

  return {
    data: users,
    pagination: {
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limitNumber)),
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
    },
  };
};

const sortUsers = async ({ sortBy = "createdAt", order = "desc" }) => {
  return await User.find()
    .sort({ [sortBy]: order === "asc" ? 1 : -1 })
    .select("-password");
};

export const userService = {
  getAllUsers,
  getUserById,
  banUser,
  searchUsers,
  filterUsers,
  sortUsers,
};
module.exports = { userService };

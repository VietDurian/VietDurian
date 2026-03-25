// Vo Lam Thuy Vi
import { userService } from "../services/userService.js";

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await userService.getAllUsers(page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
const toggleBan = async (req, res, next) => {
  try {
    const { is_banned } = req.body;
    const userId = req.params.id;

    console.log(
      `Toggle ban request received: userId=${userId}, is_banned=${is_banned}`
    );

    if (typeof is_banned !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_banned must be a boolean (true or false)",
      });
    }

    const updatedUser = await userService.banUser(userId, is_banned);

    console.log(
      `Ban status updated: user=${updatedUser.full_name}, is_banned=${updatedUser.is_banned}`
    );

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.full_name} has been successfully ${is_banned ? "locked" : "unlocked"
        }`,
      data: updatedUser,
    });
  } catch (error) {
    console.error(`Error in toggleBan: ${error.message}`);
    next(error);
  }
};

const searchUser = async (req, res, next) => {
  try {
    const users = await userService.searchUsers(req.params.keyword);
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const filterUsers = async (req, res, next) => {
  try {
    const { role, is_banned, keyword, page, limit, excludeUserId } = req.query;
    const result = await userService.filterUsers({
      role,
      keyword,
      excludeUserId,
      is_banned:
        is_banned === "true" ? true : is_banned === "false" ? false : undefined,
      page,
      limit,
    });

    if (Array.isArray(result)) {
      return res.status(200).json({ success: true, data: result });
    }

    return res.status(200).json({
      success: true,
      data: result.data || [],
      pagination: result.pagination || null,
    });
  } catch (error) {
    next(error);
  }
};

const sortUsers = async (req, res, next) => {
  try {
    const { sortBy = "createdAt", order = "desc" } = req.query;
    const result = await userService.sortUsers({ sortBy, order });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  getAllUsers,
  getUserById,
  toggleBan,
  searchUser,
  filterUsers,
  sortUsers,
};
module.exports = { userController };

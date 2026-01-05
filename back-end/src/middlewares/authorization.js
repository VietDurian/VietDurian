/** Vo Lam Thuy Vi */
import createError from "http-errors";

// Hoặc cho phép nhiều role: admin và moderator/staff
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

// Chỉ admin mới được xem danh sách user
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(createError(403, "Only admins can perform this action"));
  }
  next();
};

// Yêu cầu đúng một role cụ thể
const hasRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return next(
        createError(
          403,
          `This action requires ${requiredRole} role. Your role is ${req.user.role}`
        )
      );
    }
    next();
  };
};

// Chỉ owner hoặc admin mới được xem chi tiết user
const checkOwner = (req, res, next) => {
  const userId = req.user._id.toString();
  const resourceUserId = req.params.userId || req.body.userId;

  if (userId !== resourceUserId && req.user.role !== "admin") {
    return next(
      createError(403, "You do not have permission to access this resource")
    );
  }
  next();
};

// Các role khác ngoại trừ admin nhu trader, serviceProvider, contentExpert, farmer
const isUser = (req, res, next) => {
  const nonUserRoles = ["admin"];
  if (nonUserRoles.includes(req.user.role)) {
    return next(
      createError(403, "This action is not allowed for your role")
    );
  }
  next();
}
export const authorizationMiddleware = {
  restrictTo,
  isAdmin,
  hasRole,
  checkOwner,
  isUser,
};

module.exports = { authorizationMiddleware };
module.exports.restrictTo = restrictTo;
module.exports.isAdmin = isAdmin;
module.exports.hasRole = hasRole;
module.exports.checkOwner = checkOwner;
module.exports.isUser = isUser;

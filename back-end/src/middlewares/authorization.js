/** Vo Lam Thuy Vi */
const createError = require("http-errors");

/**
 * @desc   Middleware to restrict access to certain roles
 * @param  {...string} roles - Allowed roles
 * @return {Function} Middleware function
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

/**
 * @desc   Middleware to check if user is admin
 * @param  {Object} req - Request object
 * @param  {Object} res - Response object
 * @param  {Function} next - Next middleware function
 */
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(createError(403, "Only admins can perform this action"));
  }
  next();
};

/**
 * @desc   Middleware to check if user has specific role
 * @param  {string} requiredRole - Required role
 * @return {Function} Middleware function
 */
exports.hasRole = (requiredRole) => {
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

/**
 * @desc   Middleware to check if user owns the resource
 * @param  {Object} req - Request object
 * @param  {Object} res - Response object
 * @param  {Function} next - Next middleware function
 */
exports.checkOwner = (req, res, next) => {
  const userId = req.user._id.toString();
  const resourceUserId = req.params.userId || req.body.userId;

  if (userId !== resourceUserId && req.user.role !== "admin") {
    return next(
      createError(403, "You do not have permission to access this resource")
    );
  }
  next();
};

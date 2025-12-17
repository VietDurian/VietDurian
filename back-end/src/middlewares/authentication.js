/** Vo Lam Thuy Vi */
import jwt from "jsonwebtoken";
import { verifyToken } from "../config/jwt.js";
import User from "../model/userModel.js";
import LogoutToken from "../model/logoutTokenModel.js";
import createError from "http-errors";

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        createError(401, "You are not logged in. Please log in to get access.")
      );
    }

    // Check if token is in the blacklist (logged out)
    const blacklistedToken = await LogoutToken.findOne({ token });
    if (blacklistedToken) {
      return next(
        createError(401, "Token is no longer valid. Please log in again.")
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return next(
        createError(401, "Invalid token or token expired. Please log in again.")
      );
    }

    // Check if user exists
    const user = await User.findById(decoded.decoded.id);
    if (!user) {
      console.log("⚠️ User not found in DB!");
      return next(
        createError(401, "The user belonging to this token no longer exists.")
      );
    }

    // Check if user is banned
    if (user.is_banned) {
      return next(
        createError(
          403,
          "Your account has been banned. Please contact support."
        )
      );
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(createError(401, "Not authorized to access this route"));
  }
};

const verifyResetToken = async (req, res, next) => {
  try {
    const token = req.params.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(createError(400, "Reset token is required"));
    }

    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return next(createError(400, "Invalid or expired reset token"));
    }

    const user = await User.findById(decoded.decoded.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(createError(400, "Invalid reset token"));
  }
};

export const authMiddleware = {
  protect,
  verifyResetToken,
};

module.exports = { authMiddleware };
module.exports.protect = protect;
module.exports.verifyResetToken = verifyResetToken;

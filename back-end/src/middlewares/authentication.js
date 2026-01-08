/** Vo Lam Thuy Vi */
import { verifyToken } from "../config/jwt.js";
import User from "../model/userModel.js";
import LogoutToken from "../model/logoutTokenModel.js";

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
      return res.status(401).json({
        code: 401,
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // Check if token is in the blacklist (logged out)
    const blacklistedToken = await LogoutToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        code: 401,
        message: "Token is no longer valid. Please log in again.",
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return res.status(401).json({
        code: 401,
        message: "Invalid token or token expired. Please log in again.",
      });
    }

    // Check if user exists
    const user = await User.findById(decoded.decoded.id);
    if (!user) {
      console.log("⚠️ User not found in DB!");
      return res.status(401).json({
        code: 401,
        message: "The user belonging to this token no longer exists.",
      });
    }

    // Check if user is banned
    if (user.is_banned) {
      return res.status(403).json({
        code: 403,
        message: "Your account has been banned. Please contact support.",
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: "Not authorized to access this route",
    });
  }
};

const verifyResetToken = async (req, res, next) => {
  try {
    const token = req.params.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ code: 400, message: "Reset token is required" });
    }

    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return res.status(400).json({ code: 400, message: "Invalid or expired reset token" });
    }

    const user = await User.findById(decoded.decoded.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(400).json({ code: 400, message: "Invalid reset token" });
  }
};

export const authMiddleware = {
  protect,
  verifyResetToken,
};

module.exports = { authMiddleware };
module.exports.protect = protect;
module.exports.verifyResetToken = verifyResetToken;

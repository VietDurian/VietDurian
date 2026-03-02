/** Vo Lam Thuy Vi */
import User from "../model/userModel.js";
import OTP from "../model/optModel.js";
import LogoutToken from "../model/logoutTokenModel.js";
import { generateToken, JWT_EXPIRES_IN } from "../config/jwt.js";
import createError from "http-errors";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import { PermissionAccountModel } from "@/model/permissionAccountModel.js";

// Google OAuth client - replace with your actual client ID
const GOOGLE_CLIENT_ID = process.env.YOUR_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const retricedRoles = ["serviceProvider", "contentExpert"];

const register = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw createError(400, "Email already in use");
    }

    const requestedRole = userData.role || "trader";
    const needApproval = retricedRoles.includes(requestedRole);

    //Create user
    const user = await User.create({
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
      avatar:
        "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg",
      role: needApproval ? "trader" : requestedRole,
      is_verified: false,
    });

    if (needApproval) {
      await PermissionAccountModel.create({
        user_id: user._id,
        requested_role: requestedRole,
        description: userData.description || "",
        document: userData.document || "",
        status: "pending",
      });
    }

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      user_id: user._id,
      code: otp,
      purpose: "verify_account",
      expires_at: expiryTime,
    });

    // Send OTP via email
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      await sendVerificationEmail(user.full_name, user.email, otp, "verify");
    } else {
      console.warn("⚠️ Email credentials not configured. OTP: " + otp);
    }

    const token = generateToken(user._id);

    const { password, ...userWithoutPassword } = user.toObject();

    return { user: userWithoutPassword, token, otp };
  } catch (error) {
    throw error;
  }
};

const checkEmailExists = async (email) => {
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
      throw createError(400, "Please provide email");
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    return !!existingUser;
  } catch (error) {
    throw error;
  }
};

const verifyEmail = async (email, otp) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "No user found with that email");
    }

    const otpRecord = await OTP.findOne({
      user_id: user._id,
      code: otp,
      purpose: "verify_account",
      is_used: false,
      expires_at: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw createError(400, "Invalid or expired OTP");
    }

    // Update user verification status
    user.is_verified = true;
    await user.save();

    // Mark OTP as used
    otpRecord.is_used = true;
    await otpRecord.save();

    const permission = await PermissionAccountModel.findOne({
      user_id: user._id,
      status: "pending",
    }).lean();

    const token = generateToken(user._id);

    return {
      user,
      token,
      need_upload_proofs: !!permission,
      requested_role: permission?.requested_role || null,
    };
  } catch (error) {
    throw error;
  }
};

const resendVerificationOtp = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "No user found with that email");
    }

    if (user.is_verified) {
      throw createError(400, "Email is already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      user_id: user._id,
      code: otp,
      purpose: "verify_account",
      expires_at: expiryTime,
    });

    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      await sendVerificationEmail(
        user.full_name || "User",
        user.email,
        otp,
        "verify",
      );
    } else {
      console.warn("⚠️ Email credentials not configured. OTP: " + otp);
    }

    return { message: "OTP resent successfully" };
  } catch (error) {
    throw error;
  }
};

const sendVerificationEmail = async (
  name,
  email,
  otpCode,
  purpose = "verify", // "verify" | "reset"
  subjectOverride,
) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn(`⚠️ Email not sent (missing credentials). OTP: ${otpCode}`);
      return true;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

    // Try to use template; fallback to inline OTP HTML
    const templateFile =
      purpose === "reset" ? "reset-otp.html" : "verify-email.html";
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "email-templates",
      templateFile,
    );

    let htmlContent;
    try {
      htmlContent = fs.readFileSync(templatePath, "utf8");
    } catch {
      htmlContent =
        purpose === "reset"
          ? `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Password Reset OTP</h2>
                <p>Hello ${name},</p>
                <p>Your OTP to reset password is: <strong>${otpCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
              </body>
            </html>
          `
          : `
            <html>
              <body style="font-family: Arial, sans-serif;">
                <h2>Email Verification</h2>
                <p>Hello ${name},</p>
                <p>Your OTP code is: <strong>${otpCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
              </body>
            </html>
          `;
    }

    htmlContent = htmlContent.replace(/{{name}}/g, name);
    htmlContent = htmlContent.replace(/{{otpCode}}/g, otpCode);

    await transporter.sendMail({
      from: process.env.GMAIL_USER || "noreply@vietdurian.com",
      to: email,
      subject:
        subjectOverride ??
        (purpose === "reset" ? "Your Password Reset OTP" : "Verify Your Email"),
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw createError(400, "Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, "Incorrect email or password");
    }

    if (user.is_banned) {
      throw createError(
        403,
        "Your account has been banned. Please contact support.",
      );
    }

    if (!user.is_verified) {
      throw createError(
        403,
        "Please verify your email address before logging in",
      );
    }

    const permission = await PermissionAccountModel.findOne({
      user_id: user._id,
    });

    if (permission && permission.status === "pending") {
      throw createError(
        403,
        "Your account upgrade request is still pending approval.",
      );
    }
    if (permission && permission.status === "rejected") {
      throw createError(403, "Your account upgrade request has been rejected.");
    }
    console.log("Đăng nhập thành công user logged in:", user._id);
    const token = generateToken(user._id);

    user.password = undefined;

    return { user, token };
  } catch (error) {
    throw error;
  }
};

const logout = async (userId, token) => {
  try {
    let expiryTime;
    if (JWT_EXPIRES_IN.endsWith("d")) {
      //1d = 1 day
      const days = parseInt(JWT_EXPIRES_IN);
      expiryTime = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else if (JWT_EXPIRES_IN.endsWith("h")) {
      const hours = parseInt(JWT_EXPIRES_IN);
      expiryTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    } else {
      // Default to 1 day if format is unrecognized
      expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    await LogoutToken.create({
      user_id: userId,
      token: token,
      expires_at: expiryTime,
    });
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "No user found with that email");
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await OTP.create({
      user_id: user._id,
      code: otp,
      purpose: "forgot_password",
      expires_at: expiryTime,
    });
    await sendVerificationEmail(user.full_name || "User", email, otp, "reset");
    return { message: "OTP sent to email" };
  } catch (error) {
    throw error;
  }
};

const verifyResetOtp = async (email, otp) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw createError(404, "No user found with that email");

    const otpRecord = await OTP.findOne({
      user_id: user._id,
      code: otp,
      purpose: "forgot_password", // was "reset_password"
      is_used: false,
      expires_at: { $gt: new Date() },
    });
    if (!otpRecord) throw createError(400, "Invalid or expired OTP");

    otpRecord.is_used = true;
    await otpRecord.save();

    if (!process.env.JWT_SECRET) {
      throw createError(500, "Missing JWT_SECRET");
    }
    const resetToken = jwt.sign(
      { uid: user._id.toString(), action: "reset_password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    return { resetToken };
  } catch (error) {
    throw error;
  }
};

const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.uid || payload.action !== "reset_password") {
      throw createError(400, "Invalid or expired reset token");
    }

    const user = await User.findById(payload.uid).select("+password");
    if (!user) {
      throw createError(404, "User not found");
    }
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      throw createError(
        400,
        "New password must be different from old password",
      );
    }
    user.password = newPassword;
    await user.save();
    return { message: "Password reset successfully" };
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw createError(400, "Invalid or expired reset token");
    }
    throw error;
  }
};

const googleLogin = async (token) => {
  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.YOUR_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        full_name: name || "",
        email,
        password: crypto.randomBytes(20).toString("hex"),
        avatar: picture || "",
        is_verified: true,
        role: "trader",
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    return { user, token: jwtToken };
  } catch (error) {
    throw createError(401, "Invalid Google token");
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw createError(404, "User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw createError(401, "Invalid current password");

  user.password = newPassword;
  await user.save();
};

export const authService = {
  register,
  checkEmailExists,
  verifyEmail,
  resendVerificationOtp,
  login,
  logout,
  forgotPassword,
  resetPasswordWithToken,
  verifyResetOtp,
  googleLogin,
  changePassword,
};
module.exports = { authService };

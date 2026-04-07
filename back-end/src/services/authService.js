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

const retricedRoles = ["serviceProvider", "contentExpert", "farmer"];

const register = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw createError(400, "Email đã được sử dụng");
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
        "https://res.cloudinary.com/di6lwnmsm/image/upload/v1773319504/%E1%B4%97_Avatar_scc196.jpg",
      role: needApproval ? requestedRole : "trader",
      is_verified: false,
    });

    if (needApproval) {
      await PermissionAccountModel.create({
        user_id: user._id,
        requested_role: requestedRole,
        description: userData.description || "",
        document: userData.document || "",
        status: "none",
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
      throw createError(400, "Vui lòng cung cấp địa chỉ email");
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
      throw createError(404, "Không tìm thấy người dùng với email đó");
    }

    const otpRecord = await OTP.findOne({
      user_id: user._id,
      code: otp,
      purpose: "verify_account",
      is_used: false,
      expires_at: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw createError(400, "OTP không hợp lệ hoặc đã hết hạn");
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
      throw createError(404, "Không tìm thấy người dùng với email đó");
    }

    if (user.is_verified) {
      throw createError(400, "Email đã được xác minh trước đó");
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
      console.warn("Email credentials not configured. OTP: " + otp);
    }

    return { message: "OTP đã được gửi lại đến email của bạn" };
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
      console.warn(
        `Email không được gửi (thiếu thông tin đăng nhập). OTP: ${otpCode}`,
      );
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
      throw createError(400, "Vui lòng cung cấp địa chỉ email và mật khẩu");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, "Sai địa chỉ email hoặc mật khẩu");
    }

    if (user.is_banned) {
      throw createError(
        403,
        "Tài khoản của bạn đã bị cấm. Vui lòng liên hệ hỗ trợ.",
      );
    }

    if (!user.is_verified) {
      throw createError(
        403,
        "Vui lòng xác minh địa chỉ email của bạn trước khi đăng nhập",
      );
    }

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
      throw createError(404, "Không tìm thấy người dùng với email đó");
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
    return { message: "OTP đã được gửi đến email của bạn" };
  } catch (error) {
    throw error;
  }
};

const verifyResetOtp = async (email, otp) => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw createError(404, "Không tìm thấy người dùng với email đó");

    const otpRecord = await OTP.findOne({
      user_id: user._id,
      code: otp,
      purpose: "forgot_password", // was "reset_password"
      is_used: false,
      expires_at: { $gt: new Date() },
    });
    if (!otpRecord) throw createError(400, "OTP không hợp lệ hoặc đã hết hạn");

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
      throw createError(400, "Không tìm thấy người dùng hoặc hành động không hợp lệ trong token");
    }

    const user = await User.findById(payload.uid).select("+password");
    if (!user) {
      throw createError(404, "Người dùng không tồn tại");
    }
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
      throw createError(
        400,
        "Mật khẩu mới phải khác với mật khẩu cũ",
      );
    }
    user.password = newPassword;
    await user.save();
    return { message: "Mật khẩu đã được đặt lại thành công" };
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw createError(400, "Token đặt lại không hợp lệ hoặc đã hết hạn");
    }
    throw error;
  }
};

const googleLogin = async (token) => {
  try {

    if (!token) {
      throw createError(400, "Token is required");
    }

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
      // Generate a strong random password for Google users
      // Must have: uppercase, lowercase, number, special char, min 12 chars
      const randomPwd = crypto.randomBytes(8).toString("hex"); // 16 hex chars
      const strongPassword = `Google${randomPwd}#1a`;

      // Create new user if not exists
      user = await User.create({
        full_name: name || "",
        email,
        password: strongPassword,
        avatar: picture || "",
        is_verified: true,
        role: "trader",
      });
      console.log("✅ New user created:", email);
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id);

    return { user, token: jwtToken };
  } catch (error) {
    console.error("❌ Google Login Error:", error.message);
    throw createError(401, "Invalid Google token");
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw createError(404, "User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw createError(400, "Invalid current password");

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

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

// Google OAuth client - replace with your actual client ID
const GOOGLE_CLIENT_ID =
  "141368667605-uuh35jb8su9oui61geubhuvg9h47cns8.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const register = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw createError(400, "Email already in use");
    }

    const user = await User.create({
      full_name: userData.full_name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || "",
      avatar: userData.avatar || "",
      role: userData.role || "trader",
      isVerify: false,
    });

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
      await sendVerificationEmail(user.full_name, user.email, otp);
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
    user.isVerify = true;
    await user.save();

    // Mark OTP as used
    otpRecord.is_used = true;
    await otpRecord.save();

    return { user };
  } catch (error) {
    throw error;
  }
};

const sendVerificationEmail = async (
  name,
  email,
  otpOrLink,
  isSendForgot = false
) => {
  try {
    // Check if email credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.warn(
        `⚠️ Email not sent (missing credentials). ${
          isSendForgot ? "Reset link" : "OTP"
        }: ${otpOrLink}`
      );
      return true; // Don't throw error, just skip email sending
    }

    console.log(
      `Sending ${isSendForgot ? "reset link" : "OTP"} to email: ${email}`
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "email-templates",
      isSendForgot ? "reset-password.html" : "verify-email.html"
    );

    let htmlContent;
    try {
      htmlContent = fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      // Fallback HTML if template file is missing
      htmlContent = isSendForgot
        ? `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Password Reset Request</h2>
              <p>Hello ${name},</p>
              <p>Please click the link below to reset your password:</p>
              <p><a href="${otpOrLink}">${otpOrLink}</a></p>
              <p>This link will expire in 24 hours.</p>
            </body>
          </html>
        `
        : `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Email Verification</h2>
              <p>Hello ${name},</p>
              <p>Your OTP code is: <strong>${otpOrLink}</strong></p>
              <p>This code will expire in 10 minutes.</p>
            </body>
          </html>
        `;
    }

    htmlContent = htmlContent.replace(/{{name}}/g, name);
    htmlContent = htmlContent.replace(/{{otpCode}}/g, otpOrLink);

    await transporter.sendMail({
      from: process.env.GMAIL_USER || "noreply@vietdurian.com",
      to: email,
      subject: isSendForgot ? "Reset Your Password" : "Verify Your Email",
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
        "Your account has been banned. Please contact support."
      );
    }

    if (!user.isVerify) {
      throw createError(
        403,
        "Please verify your email address before logging in"
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
      throw createError(404, "No user found with that email");
    }
    const token = generateToken(user._id);
    const link = `http://localhost:9999/reset-password?token=${token}`; // Update with your front-end URL
    await sendVerificationEmail(user.name, email, link, true);
    return { email };
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (user, newPassword) => {
  try {
    user.password = newPassword;
    await user.save();
    return { message: "Password reset successfully" };
  } catch (error) {
    throw createError(400, "Invalid or expired reset token");
  }
};

export const authService = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
module.exports = { authService };

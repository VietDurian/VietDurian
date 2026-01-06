/** Vo Lam Thuy Vi */
const { authService } = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, avatar, role } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: "Please provide full_name, email and password",
      });
    }

    const result = await authService.register({
      full_name,
      email,
      password,
      phone,
      avatar,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        code: 400,
        message: "Please provide email and otp",
      });
    }

    const result = await authService.verifyEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 400,
        message: "Please provide email and password",
      });
    }

    const result = await authService.login(email, password);

    // Set token in httpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const token = req.token;

    await authService.logout(userId, token);

    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Please provide email",
      });
    }

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email if it exists",
    });
  } catch (error) {
    next(error);
  }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        code: 400,
        message: "Please provide email and otp",
      });
    }

    const { resetToken } = await authService.verifyResetOtp(email, otp);

    res.status(200).json({
      success: true,
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Missing reset token",
      });
    }
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Please provide newPassword and confirmPassword",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Passwords do not match",
      });
    }

    const result = await authService.resetPasswordWithToken(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        code: 400,
        message: "Google token is required",
      });
    }

    const result = await authService.googleLogin(token);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  googleLogin,
  changePassword,
};

module.exports = { authController };

module.exports.register = register;
module.exports.verifyEmail = verifyEmail;
module.exports.login = login;
module.exports.logout = logout;
module.exports.forgotPassword = forgotPassword;
module.exports.verifyResetOtp = verifyResetOtp;
module.exports.resetPassword = resetPassword;
module.exports.googleLogin = googleLogin;
module.exports.changePassword = changePassword;

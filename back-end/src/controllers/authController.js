/** Vo Lam Thuy Vi */
import { authService } from "@/services/authService.js";
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, avatar, role } = req.body;

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
      message: "Người dùng đã được tạo thành công. Vui lòng kiểm tra email để xác minh tài khoản.",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkEmailExists = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng cung cấp địa chỉ email",
      });
    }

    const exists = await authService.checkEmailExists(email);

    res.status(200).json({
      success: true,
      data: { exists },
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
        message: "Vui lòng cung cấp địa chỉ email và mã OTP",
      });
    }

    const result = await authService.verifyEmail(email, otp);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Email đã được xác minh thành công",
      data: {
        user: result.user,
        token: result.token,
        need_upload_proofs: result.need_upload_proofs,
        requested_role: result.requested_role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng cung cấp địa chỉ email",
      });
    }

    await authService.resendVerificationOtp(email);

    res.status(200).json({
      success: true,
      message: "OTP đã được gửi lại thành công",
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
        message: "Vui lòng cung cấp địa chỉ email và mật khẩu",
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
      message: "Đăng nhập thành công",
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
      message: "Đăng xuất thành công",
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
        message: "Vui lòng cung cấp địa chỉ email",
      });
    }

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "OTP đã được gửi đến email của bạn nếu nó tồn tại",
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
        message: "Vui lòng cung cấp địa chỉ email và mã OTP",
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
        message: "Vui lòng cung cấp mật khẩu mới và xác nhận mật khẩu",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu xác nhận không khớp",
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
      message: "Mật khẩu đã được thay đổi thành công",
    });
  } catch (error) {
    next(error);
  }
};

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const authController = {
  register,
  checkEmailExists,
  verifyEmail,
  resendVerificationOtp,
  login,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  googleLogin,
  changePassword,
  checkAuth,
};

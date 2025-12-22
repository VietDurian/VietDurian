/** Vo Lam Thuy Vi */
const { authService } = require("../services/authService");
const createError = require("http-errors");

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, avatar, role } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      throw createError(400, "Please provide full_name, email and password");
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
        otp: result.otp,
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
      throw createError(400, "Please provide email and otp");
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
      throw createError(400, "Please provide email and password");
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
      throw createError(400, "Please provide email");
    }

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "Reset link sent to your email",
      data: {
        email: result.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const user = req.user; // From reset token middleware

    if (!newPassword || !confirmPassword) {
      throw createError(400, "Please provide newPassword and confirmPassword");
    }

    if (newPassword !== confirmPassword) {
      throw createError(400, "Passwords do not match");
    }

    const result = await authService.resetPassword(user, newPassword);

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
        success: false,
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
module.exports.resetPassword = resetPassword;
module.exports.googleLogin = googleLogin;
module.exports.changePassword = changePassword;

// const getCurrentUser = async (req, res, next) => {
//   try {
//     const userId = req.user._id;

//     const user = await authService.getCurrentUser(userId);

//     res.status(200).json({
//       success: true,
//       message: "User retrieved successfully",
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const changePassword = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       throw createError(
//         400,
//         "Please provide currentPassword, newPassword and confirmPassword"
//       );
//     }

//     if (newPassword !== confirmPassword) {
//       throw createError(400, "Passwords do not match");
//     }

//     await authService.changePassword(userId, currentPassword, newPassword);

//     res.status(200).json({
//       success: true,
//       message: "Password changed successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const googleLogin = async (req, res, next) => {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       throw createError(400, "Please provide Google token");
//     }

//     const result = await authService.googleLogin(token);

//     // Set token in httpOnly cookie
//     res.cookie("token", result.token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
//     });

//     res.status(200).json({
//       success: true,
//       message: "Google login successful",
//       data: {
//         user: result.user,
//         token: result.token,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

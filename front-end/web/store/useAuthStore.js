import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:8080";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isResendingOtp: false,
  isVerifyingEmail: false,
  isRequestingResetOtp: false,
  isVerifyingResetOtp: false,
  isResettingPassword: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      const user = res?.data;
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
        set({ authUser: user });
        get().connectSocket();
      }
    } catch (error) {
      console.log("Error in checkAuth: ", error);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      set({ authUser: null });
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success("Kiểm tra mail cho mã OTP");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyEmail: async (data) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email", data);
      toast.success("Xác nhận thành công! Đang chuyển hướng đến đăng nhập...");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xác nhận email thất bại");
      return null;
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  resendVerificationOtp: async (email) => {
    set({ isResendingOtp: true });
    try {
      const res = await axiosInstance.post("/auth/resend-verification-otp", {
        email,
      });
      toast.success("Đã gửi lại mã OTP");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gửi lại OTP thất bại");
      return null;
    } finally {
      set({ isResendingOtp: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isRequestingResetOtp: true });
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await axiosInstance.post("/auth/forgot-password", {
        email: normalizedEmail,
      });
      toast.success("Đã gửi mã OTP đến email");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể gửi mã OTP");
      return null;
    } finally {
      set({ isRequestingResetOtp: false });
    }
  },

  verifyResetOtp: async ({ email, otp }) => {
    set({ isVerifyingResetOtp: true });
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      const res = await axiosInstance.post("/auth/verify-reset-otp", {
        email: normalizedEmail,
        otp,
      });

      toast.success("Xác nhận OTP thành công");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xác nhận OTP thất bại");
      return null;
    } finally {
      set({ isVerifyingResetOtp: false });
    }
  },

  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });
      toast.success("Đổi mật khẩu thành công! Đang chuyển hướng đăng nhập...");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
      return null;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const { user, token } = res?.data?.data || {};

      if (!user || !token) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_token", token);

      set({ authUser: user });
      toast.success("Logged in successfully");
      get().connectSocket();

      return { user, token };
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
      return null;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      set({ authUser: null });
      await axiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      set({ authUser: null });
      get().disconnectSocket();
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    // listen for io.emit event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));

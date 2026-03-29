import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isCheckingEmail: false,
  isResendingOtp: false,
  isVerifyingEmail: false,
  isRequestingResetOtp: false,
  isVerifyingResetOtp: false,
  isResettingPassword: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true, // FIX: default true để tránh flash redirect trước khi check xong
  onlineUsers: [],
  ws: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true }); // FIX: set true trước khi check
    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res?.data;
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
        set({ authUser: user });
      }
    } catch (error) {
      console.log("Error in checkAuth: ", error);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success(res?.data?.message || "Đăng ký thành công");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng ký thất bại");
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  checkEmailExists: async (email) => {
    set({ isCheckingEmail: true });
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      if (!normalizedEmail) return false;
      const res = await axiosInstance.get("/auth/check-email", {
        params: { email: normalizedEmail },
      });
      return Boolean(res?.data?.data?.exists);
    } catch (error) {
      return null;
    } finally {
      set({ isCheckingEmail: false });
    }
  },

  verifyEmail: async (data) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email", data);
      toast.success(res?.data?.message || "Xác thực email thành công");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xác thực email thất bại");
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
      toast.success(res?.data?.message || "Đã gửi lại OTP");
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
      toast.success(res?.data?.message || "Đã gửi OTP đặt lại mật khẩu");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Quên mật khẩu thất bại");
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
      toast.success(res?.data?.message || "Xác thực OTP thành công");
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Xác thực OTP thất bại");
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
      toast.success(res?.data?.message || "Đặt lại mật khẩu thành công");
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
      toast.success(res?.data?.message || "Đăng nhập thành công");

      return { user, token };
    } catch (error) {
      const message = error?.response?.data?.message || "Đăng nhập thất bại";
      const normalizedMessage = message.toLowerCase();
      const requiresEmailVerification = normalizedMessage.includes(
        "vui lòng xác minh địa chỉ email của bạn trước khi đăng nhập",
      );
      toast.error(message);
      return {
        user: null,
        token: null,
        message,
        requiresEmailVerification,
      };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout"); // FIX: bỏ res vì không dùng
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng xuất thất bại");
    } finally {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      set({ authUser: null });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success(res?.data?.message || "Cập nhật hồ sơ thành công");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error?.response?.data?.message || "Cập nhật hồ sơ thất bại");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectWS: () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    let reconnectAttempts = 0;
    const MAX_ATTEMPTS = 10;
    let shouldReconnect = true;

    const connect = () => {
      const ws = new WebSocket(
        `wss://vietdurian-websocket.onrender.com/ws?token=${token}`,
      );

      ws.onopen = () => {
        console.log("[WS] Connected");
        reconnectAttempts = 0;
        set({ ws });
      };

      ws.onclose = () => {
        console.log("[WS] Disconnected");
        set({ ws: null });
        if (shouldReconnect && reconnectAttempts < MAX_ATTEMPTS) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
          reconnectAttempts++;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = (e) => console.error("[WS] Error", e);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "online_users") {
          set({ onlineUsers: msg.userIds });
        }

        if (msg.type === "message") {
          const authUser = get().authUser;
          const senderId = msg.payload?.senderId;
          const { users } = useChatStore.getState();
          const isExisting = users.some((u) => u._id === senderId);

          if (isExisting) {
            useChatStore.setState({
              users: users.map((u) =>
                u._id === senderId
                  ? {
                      ...u,
                      lastMessage: {
                        text: msg.payload?.text,
                        createdAt: msg.payload?.createdAt,
                      },
                    }
                  : u,
              ),
            });
          } else {
            useChatStore.getState().loadContacts();
          }

          const { selectedUser, messages } = useChatStore.getState();
          if (selectedUser?._id === senderId && senderId !== authUser?._id) {
            const alreadyExists = messages.some(
              (m) => m._id === msg.payload?._id,
            );
            if (!alreadyExists) {
              useChatStore.setState({ messages: [...messages, msg.payload] });
            }
          }
        }
      };

      set({
        _cancelReconnect: () => {
          shouldReconnect = false;
        },
      });
    };

    connect();
  },

  disconnectWS: () => {
    const { ws, _cancelReconnect } = get();
    _cancelReconnect?.(); // ← tắt reconnect trước
    ws?.close();
    set({ ws: null, _cancelReconnect: null });
  },
}));

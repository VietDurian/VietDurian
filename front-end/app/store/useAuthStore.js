import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppStore } from "./useAppStore";
import { parseProductChatText, useChatStore } from "./useChatStore";

const normalizeUserId = (value) => {
  if (typeof value === "object" && value?._id) return value._id;
  return value;
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080/api/v1";
const WS_BASE_URL =
  process.env.EXPO_PUBLIC_WS_URL ||
  "wss://vietdurian-websocket.onrender.com/ws";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: null,
  isCheckingEmail: false,
  isResendingOtp: false,
  isVerifyingEmail: false,
  isRequestingResetOtp: false,
  isVerifyingResetOtp: false,
  isResettingPassword: false,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  pendingVerificationEmail: "",
  onlineUsers: [],
  ws: null,
  _cancelReconnect: null,

  setPendingVerificationEmail: (email) =>
    set({ pendingVerificationEmail: email?.trim().toLowerCase() || "" }),

  checkAuth: async () => {
    const { navigate } = useAppStore.getState();
    set({ isCheckingAuth: true });
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem("auth_user"),
        AsyncStorage.getItem("auth_token"),
      ]);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        set({ authUser: parsedUser, token: storedToken });
        navigate("home");
        get().connectWS();
      }

      if (!storedToken) {
        set({ authUser: null, token: null });
        navigate("login");
        return;
      }

      const res = await axiosInstance.get("/auth/check");
      const user = res?.data;
      if (user) {
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
        set({ authUser: user, token: storedToken });
        navigate("home");
        get().connectWS();
      }
    } catch (error) {
      await AsyncStorage.removeItem("auth_user");
      await AsyncStorage.removeItem("auth_token");
      set({ authUser: null, token: null });
      navigate("login");
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    const { navigate } = useAppStore.getState();
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      const { user, token } = res?.data?.data || {};
      if (!user || !token) throw new Error("Invalid login response");

      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      await AsyncStorage.setItem("auth_token", token);

      set({ authUser: user, token });
      navigate("home");
      Toast.show({ type: "success", text1: "Đăng nhập thành công" });
      get().connectWS();
      return { user, token };
    } catch (error) {
      const message = error?.response?.data?.message || "Đăng nhập thất bại";
      const normalizedMessage = String(message).toLowerCase();
      const requiresEmailVerification = normalizedMessage.includes(
        "vui lòng xác minh địa chỉ email của bạn trước khi đăng nhập",
      );
      Toast.show({
        type: "error",
        text1: message,
      });
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
    const { navigate } = useAppStore.getState();
    try {
      await axiosInstance.post("/auth/logout");
      Toast.show({ type: "success", text1: "Đã đăng xuất" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Đăng xuất thất bại" });
    } finally {
      await AsyncStorage.removeItem("auth_user");
      await AsyncStorage.removeItem("auth_token");
      set({ authUser: null, token: null });
      navigate("login");
      get().disconnectWS();
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Kiểm tra mail cho mã OTP",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Đăng ký thất bại"),
      });
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
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Xác thực email thành công",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Xác thực email thất bại"),
      });
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
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Đã gửi lại OTP",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Gửi lại OTP thất bại"),
      });
      return null;
    } finally {
      set({ isResendingOtp: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isRequestingResetOtp: true });
    try {
      const normalizedEmail = email?.trim().toLowerCase();
      const res = await axiosInstance.post("/auth/forgot-password", {
        email: normalizedEmail,
      });
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Đã gửi OTP đặt lại mật khẩu",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Quên mật khẩu thất bại"),
      });
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
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Xác thực OTP thành công",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Xác thực OTP thất bại"),
      });
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
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Đặt lại mật khẩu thành công",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Đặt lại mật khẩu thất bại"),
      });
      return null;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      const updatedUser = res?.data;
      if (updatedUser) {
        await AsyncStorage.setItem("auth_user", JSON.stringify(updatedUser));
        set({ authUser: updatedUser });
      }
      Toast.show({
        type: "success",
        text1: res?.data?.message || "Cập nhật hồ sơ thành công",
      });
      return res?.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Cập nhật hồ sơ thất bại"),
      });
      return null;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectWS: async () => {
    const token = get().token || (await AsyncStorage.getItem("auth_token"));
    if (!token) return;

    const existing = get().ws;
    if (existing && existing.readyState === WebSocket.OPEN) return;

    let reconnectAttempts = 0;
    const MAX_ATTEMPTS = 10;
    let shouldReconnect = true;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE_URL}?token=${token}`);

      ws.onopen = () => {
        reconnectAttempts = 0;
        set({ ws });
      };

      ws.onclose = () => {
        set({ ws: null });
        if (shouldReconnect && reconnectAttempts < MAX_ATTEMPTS) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
          reconnectAttempts += 1;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        set({ onlineUsers: [] });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "online_users") {
            set({ onlineUsers: msg.userIds || [] });
          }

          if (msg.type === "message") {
            const authUser = get().authUser;
            const senderId = normalizeUserId(msg.payload?.senderId);
            const chatStore = useChatStore.getState();
            const users = chatStore.users || [];
            const isExisting = users.some((u) => u._id === senderId);

            if (isExisting) {
              useChatStore.setState({
                users: users.map((u) =>
                  u._id === senderId
                    ? {
                        ...u,
                        lastMessage: {
                          text: parseProductChatText(msg.payload?.text)
                            ? "Đã gửi một sản phẩm"
                            : msg.payload?.text,
                          createdAt: msg.payload?.createdAt,
                        },
                      }
                    : u,
                ),
              });
            } else {
              chatStore.loadContacts();
            }

            const { selectedUser, messages } = useChatStore.getState();
            const authUserId = normalizeUserId(authUser?._id);
            if (selectedUser?._id === senderId && senderId !== authUserId) {
              const alreadyExists = (messages || []).some(
                (m) => m._id === msg.payload?._id,
              );
              if (!alreadyExists) {
                useChatStore.setState({
                  messages: [...(messages || []), msg.payload],
                });
              }
            }
          }
        } catch {
          // Ignore malformed websocket messages.
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
    _cancelReconnect?.();
    ws?.close();
    set({ ws: null, _cancelReconnect: null, onlineUsers: [] });
  },

  connectSocket: () => get().connectWS(),
  disconnectSocket: () => get().disconnectWS(),
}));

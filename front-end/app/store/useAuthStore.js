import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { useAppStore } from "./useAppStore";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080/api/v1";
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const useAuthStore = create((set, get) => ({
  authUser: null,
  token: null,
  isLoggingIn: false,
  isSigningUp: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    const { navigate } = useAppStore.getState();
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem("auth_user"),
        AsyncStorage.getItem("auth_token"),
      ]);

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        set({ authUser: parsedUser, token: storedToken });
        navigate("home");
        get().connectSocket();
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
        get().connectSocket();
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

      console.log("SADSAHDHKJSADKJHSADKJ", res);
      const { user, token } = res?.data?.data || {};
      if (!user || !token) throw new Error("Invalid login response");

      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      await AsyncStorage.setItem("auth_token", token);

      set({ authUser: user, token });
      navigate("home");
      Toast.show({ type: "success", text1: "Đăng nhập thành công" });
      get().connectSocket();
      return { user, token };
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Đăng nhập thất bại",
      });
      return null;
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
      get().disconnectSocket();
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      Toast.show({ type: "success", text1: "Kiểm tra mail cho mã OTP" });
      return res?.data;
    } catch (error) {
      Toast.show({ type: "error", text1: error?.response?.data?.message });
      return null;
    } finally {
      set({ isSigningUp: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(SOCKET_BASE_URL, { query: { userId: authUser._id } });
    socket.connect();
    set({ socket });
    socket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));

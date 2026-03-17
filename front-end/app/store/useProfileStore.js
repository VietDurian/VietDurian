import { create } from "zustand";
import axios from "axios";

// ── API client ────────────────────────────────────────────────────────────────
const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

// Interceptor tự thêm Bearer token
apiClient.interceptors.request.use((config) => {
    try {
        const { useAuthStore } = require("./useAuthStore");
        const token = useAuthStore.getState?.()?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) { }
    return config;
});

// ── Store ─────────────────────────────────────────────────────────────────────
export const useProfileStore = create((set, get) => ({

    // ── State ─────────────────────────────────────────────────────────────────
    profileData: null,
    profileLoading: false,
    profileError: null,

    isSaving: false,
    saveError: null,

    isChangingPassword: false,
    changePasswordError: null,

    // ── Actions ───────────────────────────────────────────────────────────────

    // Lấy thông tin profile
    fetchProfile: async () => {
        set({ profileLoading: true, profileError: null });
        try {
            const res = await apiClient.get("/profile/me");
            const data = res.data?.data ?? res.data;
            set({ profileData: data, profileLoading: false });
            return { success: true, data };
        } catch (err) {
            console.error("[useProfileStore] fetchProfile:", err.message);
            set({
                profileError: "Không thể tải thông tin. Vui lòng thử lại.",
                profileLoading: false,
            });
            return { success: false };
        }
    },

    // Cập nhật profile (full_name, phone, avatar)
    updateProfile: async (payload) => {
        set({ isSaving: true, saveError: null });
        try {
            const res = await apiClient.put("/profile/update", payload);
            const data = res.data?.data ?? res.data;

            // Sau khi update thành công → fetch lại để đồng bộ
            await get().fetchProfile();

            set({ isSaving: false });
            return { success: true, data };
        } catch (err) {
            console.error("[useProfileStore] updateProfile:", err.message);
            set({
                saveError: "Cập nhật thất bại. Vui lòng thử lại.",
                isSaving: false,
            });
            return { success: false, message: err.message };
        }
    },

    // Đổi mật khẩu
    changePassword: async (currentPassword, newPassword) => {
        set({ isChangingPassword: true, changePasswordError: null });
        try {
            const res = await apiClient.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            set({ isChangingPassword: false });
            return { success: true };
        } catch (err) {
            console.error("[useProfileStore] changePassword:", err.message);
            const status = err.response?.status;
            let message = "Có lỗi xảy ra. Vui lòng thử lại.";
            if (status === 401) message = "Mật khẩu hiện tại không đúng!";
            else if (status === 400) message = err.response?.data?.message || "Mật khẩu mới không hợp lệ!";
            else if (status === 500) message = "Lỗi server! Vui lòng thử lại sau.";
            set({ isChangingPassword: false, changePasswordError: message });
            return { success: false, message };
        }
    },

    // Reset error
    clearErrors: () => set({ profileError: null, saveError: null, changePasswordError: null }),
}));
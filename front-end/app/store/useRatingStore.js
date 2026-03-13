import { create } from "zustand";
import axios from "axios";

// ── API client ────────────────────────────────────────────────────────────────
const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
    try {
        const { useAuthStore } = require("./useAuthStore");
        const token = useAuthStore.getState?.()?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (_) { }
    return config;
});

// ── Helper ────────────────────────────────────────────────────────────────────
const parseStars = (stars) => {
    if (typeof stars === "object" && stars?.$numberDecimal)
        return parseFloat(stars.$numberDecimal);
    return parseFloat(stars || 0);
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const useRatingStore = create((set, get) => ({

    // ── State ─────────────────────────────────────────────────────────────────
    averageRating: 0,
    totalRatings: 0,
    userOwnRating: null,    // review của user đang đăng nhập
    otherReviews: [],       // review của người khác

    ratingsLoading: false,
    ratingsError: null,
    submitting: false,

    // ── Actions ───────────────────────────────────────────────────────────────

    // Fetch tất cả ratings của 1 sản phẩm — clone logic web fetchRatings
    fetchRatings: async (productId, userId) => {
        if (!productId) return;
        set({ ratingsLoading: true, ratingsError: null });
        try {
            const res = await apiClient.get(`/ratings/product/${productId}`, {
                params: { page: 1, limit: 100 },
            });
            const response = res.data;

            if (response.success) {
                // Parse average
                const avgRating = response.statistics?.averageRating;
                const avgValue = typeof avgRating === "string"
                    ? parseFloat(avgRating)
                    : parseFloat(avgRating || 0);

                // Transform ratings
                const ratingsData = response.data || [];
                const formattedReviews = ratingsData.map((rating) => ({
                    id: rating._id,
                    userName: rating.user_id?.full_name || "Ẩn danh",
                    avatar: rating.user_id?.avatar || null,
                    rating: parseStars(rating.stars),
                    comment: rating.content,
                    date: (rating.created_at || rating.createdAt)
                        ? new Date(rating.created_at || rating.createdAt).toLocaleDateString("vi-VN")
                        : "",
                    userId: rating.user_id?._id || null,
                }));

                // Tách review của mình vs người khác
                if (userId) {
                    const own = formattedReviews.find((r) => r.userId === userId) ?? null;
                    const others = formattedReviews.filter((r) => r.userId !== userId);
                    set({ userOwnRating: own, otherReviews: others });
                } else {
                    set({ userOwnRating: null, otherReviews: formattedReviews });
                }

                set({
                    averageRating: avgValue,
                    totalRatings: response.statistics?.totalRatings || 0,
                    ratingsLoading: false,
                });
            }
        } catch (err) {
            console.error("[useRatingStore] fetchRatings:", err.message);
            set({ ratingsError: "Không thể tải đánh giá.", ratingsLoading: false });
        }
    },

    // Tạo rating mới
    createRating: async (productId, stars, content) => {
        set({ submitting: true });
        try {
            const res = await apiClient.post("/ratings", {
                productId,
                stars,
                content: content.trim(),
            });
            set({ submitting: false });
            return res.data;
        } catch (err) {
            console.error("[useRatingStore] createRating:", err.message);
            set({ submitting: false });
            throw err;
        }
    },

    // Cập nhật rating
    updateRating: async (ratingId, stars, content) => {
        set({ submitting: true });
        try {
            const res = await apiClient.put(`/ratings/${ratingId}`, {
                stars,
                content: content.trim(),
            });
            set({ submitting: false });
            return res.data;
        } catch (err) {
            console.error("[useRatingStore] updateRating:", err.message);
            set({ submitting: false });
            throw err;
        }
    },

    // Xoá rating
    deleteRating: async (ratingId) => {
        try {
            const res = await apiClient.delete(`/ratings/${ratingId}`);
            return res.data;
        } catch (err) {
            console.error("[useRatingStore] deleteRating:", err.message);
            throw err;
        }
    },

    // Reset khi unmount
    clearRatings: () => set({
        averageRating: 0,
        totalRatings: 0,
        userOwnRating: null,
        otherReviews: [],
        ratingsError: null,
    }),
}));
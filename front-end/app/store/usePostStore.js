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

// ── Helpers ───────────────────────────────────────────────────────────────────
const normalizePost = (post, favoritePostIds = new Set()) => {
    const author = post.author || post.author_id || {};
    return {
        id: post._id,
        authorId: author._id || author.id || "",
        userName: author.full_name || author.name || author.username || "Người dùng",
        userHandle: author.email || "",
        userAvatar: author.avatar || "",
        timestamp: post.created_at
            ? new Date(post.created_at).toLocaleDateString("vi-VN") +
            " " +
            new Date(post.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : "Vừa xong",
        category: post.category || "",
        title: post.title || "",
        content: post.content || "",
        contact: post.contact || "",
        image: post.image || null,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        status: post.status || "active",
        isLiked: favoritePostIds.has(post._id),
        // raw for fav tab
        _raw: post,
    };
};

const normalizeFavorite = (fav) => {
    const post = fav.post_id || {};
    const author = post.author_id || {};
    return {
        favId: fav._id,
        status: fav.status || "active",
        id: post._id || "",
        authorId: author._id || author.id || "",
        userName: author.full_name || author.name || "Người dùng",
        userHandle: author.email || "",
        userAvatar: author.avatar || "",
        timestamp: post.created_at
            ? new Date(post.created_at).toLocaleDateString("vi-VN") +
            " " +
            new Date(post.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
            : "",
        category: post.category || "",
        title: post.title || "",
        content: post.content || "",
        contact: post.contact || "",
        image: post.image || null,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        isLiked: true,
    };
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const usePostStore = create((set, get) => ({

    // ── Posts Feed State ────────────────────────────────────────────────────────
    posts: [],
    postsLoading: false,
    postsError: null,

    selectedCategory: "Tất cả",
    selectedSort: "newest",
    searchQuery: "",

    // ── Favorites State ─────────────────────────────────────────────────────────
    favorites: [],
    favoritesLoading: false,
    favoritesError: null,

    // ── Filter Actions ──────────────────────────────────────────────────────────
    setCategory: (cat) => set({ selectedCategory: cat }),
    setSort: (sort) => set({ selectedSort: sort }),
    setSearch: (q) => set({ searchQuery: q }),
    clearFilters: () => set({ selectedCategory: "Tất cả", selectedSort: "newest", searchQuery: "" }),

    // ── Fetch Posts ─────────────────────────────────────────────────────────────
    fetchPosts: async () => {
        const { selectedCategory, selectedSort, searchQuery } = get();
        set({ postsLoading: true, postsError: null });

        try {
            const params = new URLSearchParams();
            params.append("status", "active");
            if (selectedSort) params.append("sort", selectedSort);
            if (selectedCategory !== "Tất cả") params.append("category", selectedCategory);
            if (searchQuery.trim()) params.append("search", searchQuery.trim());

            const url = `/post/general${params.toString() ? `?${params.toString()}` : ""}`;

            // Fetch posts + favorites in parallel
            const [postsRes, favsRes] = await Promise.allSettled([
                apiClient.get(url),
                apiClient.get("/favorite"),
            ]);

            const postsData = postsRes.status === "fulfilled"
                ? (postsRes.value?.data?.data || [])
                : [];

            const favsData = favsRes.status === "fulfilled"
                ? (favsRes.value?.data?.data || favsRes.value?.data || [])
                : [];

            const favoritePostIds = new Set(
                favsData.map((f) => f.post_id?._id || f.post_id).filter(Boolean)
            );

            const normalized = postsData.map((p) => normalizePost(p, favoritePostIds));
            set({ posts: normalized, postsLoading: false });
        } catch (err) {
            set({
                postsError: err?.response?.data?.message || err?.message || "Không thể tải bài viết",
                postsLoading: false,
            });
        }
    },

    // ── Toggle Like (post feed) ─────────────────────────────────────────────────
    toggleLikePost: async (postId) => {
        const { posts } = get();
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const newLiked = !post.isLiked;

        // Optimistic update
        set({
            posts: posts.map((p) =>
                p.id === postId
                    ? { ...p, isLiked: newLiked, likes: newLiked ? p.likes + 1 : Math.max(0, p.likes - 1) }
                    : p
            ),
        });

        try {
            if (newLiked) {
                await apiClient.post("/favorite", { post_id: postId });
            } else {
                await apiClient.delete(`/favorite/${postId}`);
            }
        } catch (err) {
            // Rollback on error
            set({
                posts: get().posts.map((p) =>
                    p.id === postId
                        ? { ...p, isLiked: post.isLiked, likes: post.likes }
                        : p
                ),
            });
        }
    },

    // ── Fetch Favorites ─────────────────────────────────────────────────────────
    fetchFavorites: async () => {
        set({ favoritesLoading: true, favoritesError: null });
        try {
            const res = await apiClient.get("/favorite");
            const data = res?.data?.data || res?.data || [];
            const validFavs = data.filter((f) => f.post_id);
            const normalized = validFavs.map(normalizeFavorite);
            set({ favorites: normalized, favoritesLoading: false });
        } catch (err) {
            set({
                favoritesError: err?.response?.data?.message || err?.message || "Không thể tải danh sách yêu thích",
                favoritesLoading: false,
            });
        }
    },

    // ── Remove Favorite ─────────────────────────────────────────────────────────
    removeFavorite: async (postId) => {
        // Optimistic update
        set((state) => ({
            favorites: state.favorites.filter((f) => f.id !== postId),
        }));
        try {
            await apiClient.delete(`/favorite/${postId}`);
        } catch (err) {
            // Re-fetch on error to restore state
            get().fetchFavorites();
        }
    },
}));
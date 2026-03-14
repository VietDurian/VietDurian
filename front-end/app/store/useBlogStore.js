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
export const useBlogStore = create((set, get) => ({

    // ── State ──────────────────────────────────────────────────────────────────
    blogs: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    },
    blogsLoading: false,
    blogsError: null,

    blogDetail: null,
    blogDetailLoading: false,
    blogDetailError: null,

    // ── Actions: Blog List ─────────────────────────────────────────────────────

    /**
     * Fetch trang đầu (hoặc reset về page 1 khi đổi sort/search)
     * sort: "newest" | "oldest"
     */
    fetchBlogs: async ({ page = 1, limit = 10, sort = "newest" } = {}) => {
        set({ blogsLoading: true, blogsError: null });
        try {
            const res = await apiClient.get("/blog/knowledge", {
                params: { page, limit, sort },
            });

            const body = res.data;
            // API trả về { code, data: [...] } hoặc { data: [...], pagination: {} }
            const raw = body?.data ?? (Array.isArray(body) ? body : []);
            const pag = body?.pagination ?? {};

            const blogs = raw.map((blog) => ({
                ...blog,
                knowledgeBlocksCount: blog.knowledgeBlocks?.length ?? 0,
            }));

            set({
                blogs,
                pagination: {
                    currentPage: pag.currentPage ?? page,
                    totalPages: pag.totalPages ?? 1,
                    totalItems: pag.totalItems ?? blogs.length,
                    itemsPerPage: pag.itemsPerPage ?? limit,
                },
                blogsLoading: false,
            });
        } catch (err) {
            console.error("[useBlogStore] fetchBlogs:", err.message);
            set({
                blogsError: "Không thể tải danh sách bài viết. Vui lòng thử lại.",
                blogsLoading: false,
            });
        }
    },

    /**
     * Load thêm trang tiếp theo (infinite scroll)
     */
    appendBlogs: async ({ page, limit = 10, sort = "newest" } = {}) => {
        try {
            const res = await apiClient.get("/blog/knowledge", {
                params: { page, limit, sort },
            });

            const body = res.data;
            const raw = body?.data ?? (Array.isArray(body) ? body : []);
            const pag = body?.pagination ?? {};

            const newBlogs = raw.map((blog) => ({
                ...blog,
                knowledgeBlocksCount: blog.knowledgeBlocks?.length ?? 0,
            }));

            set((state) => ({
                blogs: [...state.blogs, ...newBlogs],
                pagination: {
                    currentPage: pag.currentPage ?? page,
                    totalPages: pag.totalPages ?? state.pagination.totalPages,
                    totalItems: pag.totalItems ?? state.pagination.totalItems,
                    itemsPerPage: pag.itemsPerPage ?? limit,
                },
            }));
        } catch (err) {
            console.error("[useBlogStore] appendBlogs:", err.message);
        }
    },

    // ── Actions: Blog Detail ───────────────────────────────────────────────────

    fetchBlogById: async (blogId) => {
        set({ blogDetailLoading: true, blogDetailError: null });
        try {
            const res = await apiClient.get(`/blog/knowledge/${blogId}`);
            const body = res.data;
            const blog = body?.data ?? body;

            set({
                blogDetail: blog,
                blogDetailLoading: false,
            });
        } catch (err) {
            console.error("[useBlogStore] fetchBlogById:", err.message);
            set({
                blogDetailError: "Không thể tải bài viết. Vui lòng thử lại.",
                blogDetailLoading: false,
            });
        }
    },

    clearBlogDetail: () =>
        set({ blogDetail: null, blogDetailError: null }),
}));
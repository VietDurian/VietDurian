import { create } from "zustand";
import axios from "axios";

// ── API client (dùng ENV) ─────────────────────────────────────────────────────
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

// ── Helper ────────────────────────────────────────────────────────────────────
export const parseDecimal = (val) => {
    if (val == null) return 0;
    if (typeof val === "object" && val.$numberDecimal)
        return parseFloat(val.$numberDecimal);
    return parseFloat(val) || 0;
};

const normalizeProduct = (p) => ({
    ...p,
    price: parseDecimal(p.price),
    rating: parseDecimal(p.rating),
});

// ── Store ─────────────────────────────────────────────────────────────────────
export const useProductStore = create((set, get) => ({

    // ════════════════════════════════════════
    // STATE
    // ════════════════════════════════════════

    products: [],
    productTypes: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 9,
    },
    productsLoading: false,
    typesLoading: false,
    productsError: null,

    productDetail: null,
    productDetailLoading: false,
    productDetailError: null,

    // ════════════════════════════════════════
    // ACTIONS: Product Types
    // ════════════════════════════════════════

    fetchProductTypes: async () => {
        set({ typesLoading: true });
        try {
            const res = await apiClient.get("/type-product", { params: { limit: 20 } });
            const data = res.data?.data ?? res.data ?? [];
            set({
                productTypes: Array.isArray(data) ? data : [],
                typesLoading: false,
            });
        } catch (err) {
            console.error("[useProductStore] fetchProductTypes:", err.message);
            set({ typesLoading: false });
        }
    },

    // ════════════════════════════════════════
    // ACTIONS: Products List
    // ════════════════════════════════════════

    fetchProducts: async ({
        page = 1,
        limit = 9,
        sortBy = "created_at",
        sortOrder = "desc",
        name = "",
        typeId = "",
    } = {}) => {
        set({ productsLoading: true, productsError: null });
        try {
            const params = { page, limit, sortBy, sortOrder };
            if (name) params.name = name;
            if (typeId) params.typeId = typeId;

            const res = await apiClient.get("/products", { params });
            const body = res.data;

            const raw =
                body?.data ??
                body?.products ??
                (Array.isArray(body) ? body : []);

            const products = raw.map(normalizeProduct);
            const pag = body?.pagination ?? {};

            set({
                products,
                pagination: {
                    currentPage: pag.currentPage ?? page,
                    totalPages: pag.totalPages ?? 1,
                    totalItems: pag.totalItems ?? products.length,
                    itemsPerPage: pag.itemsPerPage ?? limit,
                },
                productsLoading: false,
            });
        } catch (err) {
            console.error("[useProductStore] fetchProducts:", err.message);
            set({
                productsError: "Không thể tải sản phẩm. Vui lòng thử lại.",
                productsLoading: false,
            });
        }
    },

    // Infinite scroll
    appendProducts: async ({
        page = 2,
        limit = 9,
        sortBy = "created_at",
        sortOrder = "desc",
        name = "",
        typeId = "",
    } = {}) => {
        try {
            const params = { page, limit, sortBy, sortOrder };
            if (name) params.name = name;
            if (typeId) params.typeId = typeId;

            const res = await apiClient.get("/products", { params });
            const body = res.data;

            const raw =
                body?.data ??
                body?.products ??
                (Array.isArray(body) ? body : []);

            const newItems = raw.map(normalizeProduct);
            const pag = body?.pagination ?? {};

            set((state) => ({
                products: [...state.products, ...newItems],
                pagination: {
                    currentPage: pag.currentPage ?? page,
                    totalPages: pag.totalPages ?? state.pagination.totalPages,
                    totalItems: pag.totalItems ?? state.pagination.totalItems,
                    itemsPerPage: pag.itemsPerPage ?? limit,
                },
            }));
        } catch (err) {
            console.error("[useProductStore] appendProducts:", err.message);
        }
    },

    // ════════════════════════════════════════
    // ACTIONS: Product Detail
    // ════════════════════════════════════════

    fetchProductById: async (productId) => {
        set({ productDetailLoading: true, productDetailError: null });
        try {
            const res = await apiClient.get(`/products/${productId}`);
            const product = normalizeProduct(res.data?.data ?? res.data);

            set({
                productDetail: product,
                productDetailLoading: false,
            });
        } catch (err) {
            console.error("[useProductStore] fetchProductById:", err.message);
            set({
                productDetailError: "Không tìm thấy sản phẩm.",
                productDetailLoading: false,
            });
        }
    },

    clearProductDetail: () =>
        set({
            productDetail: null,
            productDetailError: null,
        }),
}));
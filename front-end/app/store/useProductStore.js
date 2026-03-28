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

// ── Product Store ─────────────────────────────────────────────────────────────
export const useProductStore = create((set, get) => ({

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
    liveDetailRating: null,

    // ── Product Types ─────────────────────────────────────────────────────────
    fetchProductTypes: async () => {
        set({ typesLoading: true });
        try {
            const res = await apiClient.get("/type-product", { params: { limit: 20 } });
            const data = res.data?.data ?? res.data ?? [];
            set({ productTypes: Array.isArray(data) ? data : [], typesLoading: false });
        } catch (err) {
            console.error("[useProductStore] fetchProductTypes:", err.message);
            set({ typesLoading: false });
        }
    },

    // ── Products List ─────────────────────────────────────────────────────────
    fetchProducts: async ({
        page = 1, limit = 9, sortBy = "created_at",
        sortOrder = "desc", name = "", typeId = "",
    } = {}) => {
        set({ productsLoading: true, productsError: null });
        try {
            const params = { page, limit, sortBy, sortOrder };
            if (name) params.name = name;
            if (typeId) params.typeId = typeId;

            const res = await apiClient.get("/products", { params });
            const body = res.data;
            const raw = body?.data ?? body?.products ?? (Array.isArray(body) ? body : []);
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
            set({ productsError: "Không thể tải sản phẩm. Vui lòng thử lại.", productsLoading: false });
        }
    },

    // Infinite scroll
    appendProducts: async ({
        page = 2, limit = 9, sortBy = "created_at",
        sortOrder = "desc", name = "", typeId = "",
    } = {}) => {
        try {
            const params = { page, limit, sortBy, sortOrder };
            if (name) params.name = name;
            if (typeId) params.typeId = typeId;

            const res = await apiClient.get("/products", { params });
            const body = res.data;
            const raw = body?.data ?? body?.products ?? (Array.isArray(body) ? body : []);
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

    // ── Product Detail ────────────────────────────────────────────────────────
    fetchProductById: async (productId) => {
        set({ productDetailLoading: true, productDetailError: null, liveDetailRating: null });
        try {
            const res = await apiClient.get(`/products/${productId}`);
            const product = normalizeProduct(res.data?.data ?? res.data);
            set({ productDetail: product, productDetailLoading: false });

            // Fetch live rating
            try {
                const ratingRes = await apiClient.get(`/ratings/product/${productId}`, { params: { limit: 1 } });
                const avg = ratingRes.data?.statistics?.averageRating;
                if (avg != null) set({ liveDetailRating: parseFloat(avg) });
            } catch (_) { /* rating is optional */ }

        } catch (err) {
            console.error("[useProductStore] fetchProductById:", err.message);
            set({ productDetailError: "Không tìm thấy sản phẩm.", productDetailLoading: false });
        }
    },

    clearProductDetail: () =>
        set({ productDetail: null, productDetailError: null, liveDetailRating: null }),
}));

// ── Diary Store ───────────────────────────────────────────────────────────────
const diaryFetch = async (url, seasonDiaryId) => {
    const res = await apiClient.get(url, {
        params: { season_diary_id: seasonDiaryId, limit: 500 },
    });
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
};

export const useDiaryStore = create((set) => ({

    // Seeds
    buyingSeeds: [], loadingSeeds: false, errorSeeds: null,
    fetchBuyingSeeds: async (id) => {
        set({ loadingSeeds: true, errorSeeds: null });
        try {
            const data = await diaryFetch("/buying-seed", id);
            set({ buyingSeeds: data, loadingSeeds: false });
        } catch {
            set({ errorSeeds: "Không thể tải dữ liệu mua giống", loadingSeeds: false });
        }
    },

    // Buying fertilizers
    buyingFertilizers: [], loadingFertilizers: false, errorFertilizers: null,
    fetchBuyingFertilizers: async (id) => {
        set({ loadingFertilizers: true, errorFertilizers: null });
        try {
            const data = await diaryFetch("/buying-fertilizers", id);
            set({ buyingFertilizers: data, loadingFertilizers: false });
        } catch {
            set({ errorFertilizers: "Không thể tải dữ liệu mua phân bón", loadingFertilizers: false });
        }
    },

    // Use fertilizers
    useFertilizers: [], loadingUseFertilizers: false, errorUseFertilizers: null,
    fetchUseFertilizers: async (id) => {
        set({ loadingUseFertilizers: true, errorUseFertilizers: null });
        try {
            const data = await diaryFetch("/use-fertilizers", id);
            set({ useFertilizers: data, loadingUseFertilizers: false });
        } catch {
            set({ errorUseFertilizers: "Không thể tải dữ liệu sử dụng phân bón", loadingUseFertilizers: false });
        }
    },

    // Packaging
    packaging: [], loadingPackaging: false, errorPackaging: null,
    fetchPackaging: async (id) => {
        set({ loadingPackaging: true, errorPackaging: null });
        try {
            const data = await diaryFetch("/packaging-handling", id);
            set({ packaging: data, loadingPackaging: false });
        } catch {
            set({ errorPackaging: "Không thể tải dữ liệu xử lý đóng gói", loadingPackaging: false });
        }
    },

    // Harvest
    harvest: [], loadingHarvest: false, errorHarvest: null,
    fetchHarvest: async (id) => {
        set({ loadingHarvest: true, errorHarvest: null });
        try {
            const data = await diaryFetch("/harvest-consumption", id);
            set({ harvest: data, loadingHarvest: false });
        } catch {
            set({ errorHarvest: "Không thể tải dữ liệu thu hoạch", loadingHarvest: false });
        }
    },

    // Irrigation
    irrigation: [], loadingIrrigation: false, errorIrrigation: null,
    fetchIrrigation: async (id) => {
        set({ loadingIrrigation: true, errorIrrigation: null });
        try {
            const data = await diaryFetch("/irrigation-costs", id);
            set({ irrigation: data, loadingIrrigation: false });
        } catch {
            set({ errorIrrigation: "Không thể tải dữ liệu tưới tiêu", loadingIrrigation: false });
        }
    },

    // Labor
    labor: [], loadingLabor: false, errorLabor: null,
    fetchLabor: async (id) => {
        set({ loadingLabor: true, errorLabor: null });
        try {
            const data = await diaryFetch("/labor-costs", id);
            set({ labor: data, loadingLabor: false });
        } catch {
            set({ errorLabor: "Không thể tải dữ liệu lao động", loadingLabor: false });
        }
    },

    // Reset all diary state (call when leaving product detail)
    clearDiary: () => set({
        buyingSeeds: [], loadingSeeds: false, errorSeeds: null,
        buyingFertilizers: [], loadingFertilizers: false, errorFertilizers: null,
        useFertilizers: [], loadingUseFertilizers: false, errorUseFertilizers: null,
        packaging: [], loadingPackaging: false, errorPackaging: null,
        harvest: [], loadingHarvest: false, errorHarvest: null,
        irrigation: [], loadingIrrigation: false, errorIrrigation: null,
        labor: [], loadingLabor: false, errorLabor: null,
    }),
}));
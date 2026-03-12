import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback || "Something went wrong";

export const useProductStore = create((set, get) => ({
  products: [],
  ownProducts: [],
  productDetail: null,
  pagination: null,
  isProductsLoading: false,
  isProductDetailsLoading: false,
  isProductCreating: false,
  isProductEditing: false,
  isProductDeleting: false,
  isOwnProductLoading: false,

  // GET /products
  fetchProducts: async (params = {}) => {
    set({ isProductsLoading: true });
    try {
      const res = await axiosInstance.get("/products", { params });
      const { data, pagination } = res.data;
      set({ products: data || [], pagination: pagination || null });
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load products"));
      throw error;
    } finally {
      set({ isProductsLoading: false });
    }
  },

  // GET /products/own
  getOwnProducts: async () => {
    set({ isOwnProductLoading: true });
    try {
      const res = await axiosInstance.get("/products/own");
      const data = res?.data?.data ?? res?.data;
      const pagination = res?.data?.pagination ?? null;
      set({
        ownProducts: Array.isArray(data) ? data : [],
        pagination,
      });
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load own products"));
      throw error;
    } finally {
      set({ isOwnProductLoading: false });
    }
  },

  // GET /products/{productId}
  fetchProductDetail: async (productId) => {
    set({ isProductDetailsLoading: true });
    try {
      const res = await axiosInstance.get(`/products/${productId}`);
      set({ productDetail: res.data.data || null });
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load product"));
      throw error;
    } finally {
      set({ isProductDetailsLoading: false });
    }
  },

  // GET /products/search
  searchProducts: async (params) => {
    set({ isProductsLoading: true });
    try {
      const res = await axiosInstance.get("/products/search", { params });
      const { data, pagination } = res.data;
      set({ products: data || [], pagination: pagination || null });
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to search products"));
      throw error;
    } finally {
      set({ isProductsLoading: false });
    }
  },

  // GET /products/filter
  filterProducts: async (params) => {
    set({ isProductsLoading: true });
    try {
      const res = await axiosInstance.get("/products/filter", { params });
      const { data, pagination } = res.data;
      set({ products: data || [], pagination: pagination || null });
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to filter products"));
      throw error;
    } finally {
      set({ isProductsLoading: false });
    }
  },

  // GET /products/sort
  sortProducts: async (params) => {
    set({ isProductsLoading: true });
    try {
      const res = await axiosInstance.get("/products/sort", { params });
      const { data, pagination } = res.data;
      set({ products: data || [], pagination: pagination || null });
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to sort products"));
      throw error;
    } finally {
      set({ isProductsLoading: false });
    }
  },

  // POST /products
  createProduct: async (data) => {
    set({ isProductCreating: true });
    try {
      const res = await axiosInstance.post("/products", data);
      set((state) => ({
        products: [res.data.data, ...state.products],
        ownProducts: [res.data.data, ...state.ownProducts],
      }));
      toast.success(res.data.message || "Product created successfully");
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create product"));
      throw error;
    } finally {
      set({ isProductCreating: false });
    }
  },

  // PUT /products/{productId}
  updateProduct: async (productId, data) => {
    set({ isProductEditing: true });
    try {
      const res = await axiosInstance.put(`/products/${productId}`, data);
      set((state) => ({
        products: state.products.map((p) =>
          p?._id === productId ? res.data.data : p,
        ),
        ownProducts: state.ownProducts.map((p) =>
          p?._id === productId ? res.data.data : p,
        ),
        productDetail:
          state.productDetail?._id === productId
            ? res.data.data
            : state.productDetail,
      }));
      toast.success(res.data.message || "Product updated successfully");
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update product"));
      throw error;
    } finally {
      set({ isProductEditing: false });
    }
  },

  // DELETE /products/{productId}
  deleteProduct: async (productId) => {
    set({ isProductDeleting: true });
    try {
      const res = await axiosInstance.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((p) => p?._id !== productId),
        ownProducts: state.ownProducts.filter((p) => p?._id !== productId),
        productDetail:
          state.productDetail?._id === productId ? null : state.productDetail,
      }));
      toast.success(res.data.message || "Product deleted successfully");
      return res.data;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete product"));
      throw error;
    } finally {
      set({ isProductDeleting: false });
    }
  },
}));

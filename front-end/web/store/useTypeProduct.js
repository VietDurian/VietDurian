import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

export const useProductStore = create((set, get) => ({
  types: [],
  isTypesLoading: false,

  // GET /type-product Get all type products
  fetchTypes: async () => {
    set({ isTypesLoading: true });
    try {
      const res = await axiosInstance.get(`/type-product`);
      set({ types: res.data.data });
    } catch (error) {
    } finally {
      set({ isTypesLoading: false });
    }
  },
}));

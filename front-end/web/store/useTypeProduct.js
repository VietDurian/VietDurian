import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

export const useTypeProductStore = create((set) => ({
  types: [],
  isTypesLoading: false,

  // GET /type-product Get all type products
  fetchTypes: async () => {
    set({ isTypesLoading: true });
    try {
      const res = await axiosInstance.get(`/type-product`);
      set({ types: res.data.data });
    } catch (error) {
      set({ types: [] });
    } finally {
      set({ isTypesLoading: false });
    }
  },
}));

export const useProductStore = useTypeProductStore;

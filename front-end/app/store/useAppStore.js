import { create } from "zustand";

export const useAppStore = create((set) => ({
  currentScreen: "login",
  activeTab: "home",
  selectedProduct: null,
  selectedBlog: null,

  navigate: (screen) => set({ currentScreen: screen }),
  setTab: (tab) => set({ activeTab: tab, currentScreen: tab }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedBlog: (blog) => set({ selectedBlog: blog }),
}));
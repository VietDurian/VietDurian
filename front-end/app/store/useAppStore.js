import { create } from "zustand";

export const useAppStore = create((set) => ({
  currentScreen: "login",
  activeTab: "home",
  selectedProduct: null,

  navigate: (screen) => set({ currentScreen: screen }),
  login: () => set({ currentScreen: "home" }),
  setTab: (tab) => set({ activeTab: tab, currentScreen: tab }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
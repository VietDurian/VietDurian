// store/useAppStore.js
import { create } from "zustand";

export const useAppStore = create((set) => ({
  currentScreen: "login",
  navigate: (screen) => set({ currentScreen: screen }),
}));

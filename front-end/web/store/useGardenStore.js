import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useGardenStore = create((set, get) => ({
  gardens: [],
  gardenDetail: {},
  isGardensLoading: false,
  isGardenDetailsLoading: false,
  isGardenCreating: false,
  isGardenEditing: false,
  isGardenDeleting: false,

  // Get all gardens from a user
  getUserGardens: async (userId) => {
    set({ isGardensLoading: true });
    try {
      const res = await axiosInstance.get(`/garden/user/${userId}`);
      set({ gardens: res.data.data });
    } catch (error) {
    } finally {
      set({ isGardensLoading: false });
    }
  },

  // Get garden details
  getGardenDetails: async (gardenId) => {
    set({ isGardenDetailsLoading: true });
    try {
      const res = await axiosInstance.get(`/garden/${gardenId}`);
      set({ gardenDetail: res.data.data });
    } catch (error) {
    } finally {
      set({ isGardenDetailsLoading: false });
    }
  },

  // Create garden
  createGarden: async (data) => {
    set({ isGardenCreating: true });
    try {
      const res = await axiosInstance.post(`/garden`, data);

      //  Add new garden into state
      set((state) => ({
        gardens: [res.data.data, ...state.gardens],
      }));

      toast.success(res.data.message);
    } finally {
      set({ isGardenCreating: false });
    }
  },

  // Edit garden
  editGarden: async (gardenId, data) => {
    set({ isGardenEditing: true });
    try {
      const res = await axiosInstance.patch(`/garden/${gardenId}`, data);

      //  Update the edited garden in state
      set((state) => ({
        gardens: state.gardens.map((g) =>
          g._id === gardenId ? res.data.data : g,
        ),
        gardenDetail: res.data.data,
      }));

      toast.success(res.data.message);
    } finally {
      set({ isGardenEditing: false });
    }
  },

  // Delete garden
  deleteGarden: async (gardenId) => {
    set({ isGardenDeleting: true });
    try {
      const res = await axiosInstance.delete(`/garden/${gardenId}`);

      //  Update the edited garden in state
      set((state) => ({
        gardens: state.gardens.map((g) =>
          g._id === gardenId ? res.data.data : g,
        ),
        gardenDetail: res.data.data,
      }));

      toast.success(res.data.message);
    } finally {
      set({ isGardenDeleting: false });
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useDiaryStore = create((set, get) => ({
  diaries: [],
  diaryDetail: {},

  isDiariesLoading: false,
  isDiaryCreating: false,
  isDiaryDetailsLoading: false,

  // Get all diaries by garden_id
  getAllDiariesByGardenId: async (garden_id, year) => {
    set({ isDiariesLoading: true });
    try {
      const res = await axiosInstance.get(`/diary`, {
        params: {
          garden_id: garden_id,
          year: year,
        },
      });
      console.log(res.data);
      set({ diaries: res.data.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load diaries");
    } finally {
      set({ isDiariesLoading: false });
    }
  },

  // Create new diary
  createDiary: async (data) => {
    set({ isDiaryCreating: true });
    try {
      const res = await axiosInstance.post(`/diary`, data);

      //  Add new garden into state
      set((state) => ({
        diaries: [res.data.data, ...state.diaries],
      }));

      toast.success(res.data.message);
    } finally {
      set({ isDiaryCreating: false });
    }
  },

  // Get diary detals
  getDiaryDetails: async (diaryId) => {
    set({ isDiaryDetailsLoading: true });
    try {
      const res = await axiosInstance.get(`/diary/${diaryId}`);
      console.log("DDDD", res);
      set({ diaryDetail: res.data.data });
    } catch (error) {
    } finally {
      set({ isDiaryDetailsLoading: false });
    }
  },
}));

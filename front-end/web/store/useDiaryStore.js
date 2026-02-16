import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useDiaryStore = create((set, get) => ({
  diaries: [],
  diaryDetail: {},

  isDiariesLoading: false,
  isDiaryCreating: false,
  isDiaryDetailsLoading: false,
  isDiaryEditing: false,
  isDiaryDeleting: false,
  isDiaryStepAdding: false,
  isDiaryCompleting: false,

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
      set({ diaryDetail: res.data.data });
    } catch (error) {
    } finally {
      set({ isDiaryDetailsLoading: false });
    }
  },

  // Edit diary
  editDiary: async (diaryId, data) => {
    set({ isDiaryEditing: true });
    try {
      const res = await axiosInstance.patch(`/diary/${diaryId}`, data);

      //  Update the edited garden in state
      set((state) => ({
        diaries: state.diaries.map((d) =>
          d._id === diaryId ? res.data.data : d,
        ),
        diaryDetail: res.data.data,
      }));

      // Refresh detail to ensure nested data (stages/steps) stays in sync
      await get().getDiaryDetails(diaryId);

      toast.success(res.data.message);
      return res?.data?.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật nhật ký",
      );
      throw error;
    } finally {
      set({ isDiaryEditing: false });
    }
  },

  // Delete diary
  deleteGarden: async (diaryId) => {
    set({ isDiaryDeleting: true });
    try {
      const res = await axiosInstance.delete(`/diary/${diaryId}`);

      //  Update the edited garden in state
      set((state) => ({
        diaries: state.diaries.map((d) =>
          d._id === diaryId ? res.data.data : d,
        ),
        diaryDetail: res.data.data,
      }));

      toast.success(res.data.message);
    } finally {
      set({ isDiaryDeleting: false });
    }
  },

  // Add a new step to a diary
  addDiaryStep: async (diaryId, payload) => {
    set({ isDiaryStepAdding: true });
    try {
      const res = await axiosInstance.post(`/diary/${diaryId}/step`, payload);

      // refresh detail so UI shows the newly added step
      await get().getDiaryDetails(diaryId);

      toast.success(res?.data?.message || "Thêm bước thành công");
      return res?.data?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể thêm bước");
      throw error;
    } finally {
      set({ isDiaryStepAdding: false });
    }
  },

  // Mark diary completed
  completeDiary: async (diaryId, payload) => {
    set({ isDiaryCompleting: true });
    try {
      const res = await axiosInstance.patch(
        `/diary/${diaryId}/finish`,
        payload,
      );

      // update list and detail with server response
      set((state) => ({
        diaries: state.diaries.map((d) =>
          d._id === diaryId ? res.data.data : d,
        ),
        diaryDetail: res.data.data,
      }));

      // refresh detail to keep nested stages/steps in sync
      await get().getDiaryDetails(diaryId);

      toast.success(res?.data?.message || "Đã đánh dấu hoàn thành");
      return res?.data?.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể hoàn thành nhật ký",
      );
      throw error;
    } finally {
      set({ isDiaryCompleting: false });
    }
  },
}));

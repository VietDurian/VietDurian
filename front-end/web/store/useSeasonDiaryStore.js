import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useSeasonDiaryStore = create((set, get) => ({
  seasonDiaries: [],
  seasonDiaryDetail: {},
  seasonDiaryStatistics: {},
  isSeasonDiariesLoading: false,
  isSeasonDiaryDetailLoading: false,
  isSeasonDiaryCreating: false,
  isSeasonDiaryUpdating: false,
  isPageUpdating: false,
  isPageDeleting: false,
  isStatisticsLoading: false,

  // 1. GET /season-diary
  getSeasonDiaries: async (userId, status) => {
    set({ isSeasonDiariesLoading: true });
    try {
      const res = await axiosInstance.get("/season-diary", {
        params: {
          userId,
          ...(status && { status }),
        },
      });
      set({ seasonDiaries: res.data.data });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tải danh sách nhật ký",
      );
    } finally {
      set({ isSeasonDiariesLoading: false });
    }
  },

  // 2. POST /season-diary
  createSeasonDiary: async (data) => {
    set({ isSeasonDiaryCreating: true });
    try {
      const res = await axiosInstance.post("/season-diary", data);
      set((state) => ({
        seasonDiaries: [res.data.data, ...state.seasonDiaries],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi tạo nhật ký");
      return null;
    } finally {
      set({ isSeasonDiaryCreating: false });
    }
  },

  // 3. GET /season-diary/{season_diary_id}
  getSeasonDiaryDetail: async (seasonDiaryId) => {
    set({ isSeasonDiaryDetailLoading: true });
    try {
      const res = await axiosInstance.get(`/season-diary/${seasonDiaryId}`);
      set({ seasonDiaryDetail: res.data.data });
      return res.data.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi tải chi tiết nhật ký");
      return null;
    } finally {
      set({ isSeasonDiaryDetailLoading: false });
    }
  },

  // 4. PUT /season-diary/{season_diary_id}
  updateSeasonDiary: async (seasonDiaryId, data) => {
    set({ isSeasonDiaryUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/season-diary/${seasonDiaryId}`,
        data,
      );
      set((state) => ({
        seasonDiaries: state.seasonDiaries.map((d) =>
          d._id === seasonDiaryId ? res.data.data : d,
        ),
        seasonDiaryDetail: res.data.data,
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi cập nhật nhật ký");
      return null;
    } finally {
      set({ isSeasonDiaryUpdating: false });
    }
  },

  // 5. PATCH /season-diary/{season_diary_id}/page
  updatePage: async (seasonDiaryId, data) => {
    set({ isPageUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/season-diary/${seasonDiaryId}/page`,
        data,
      );
      set({ seasonDiaryDetail: res.data.data });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi cập nhật trang nhật ký",
      );
    } finally {
      set({ isPageUpdating: false });
    }
  },

  // 6. DELETE /season-diary/{season_diary_id}/page
  deletePage: async (seasonDiaryId, data) => {
    set({ isPageDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/season-diary/${seasonDiaryId}/page`,
        { data },
      );
      set({ seasonDiaryDetail: res.data.data });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi xóa trang nhật ký");
    } finally {
      set({ isPageDeleting: false });
    }
  },

  // 7. GET /season-diary/{season_diary_id}/statistics
  getSeasonDiaryStatistics: async (seasonDiaryId) => {
    set({ isStatisticsLoading: true });
    try {
      const res = await axiosInstance.get(
        `/season-diary/${seasonDiaryId}/statistics`,
      );
      set({ seasonDiaryStatistics: res.data.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi tải thống kê nhật ký");
    } finally {
      set({ isStatisticsLoading: false });
    }
  },
}));

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
  isSeasonDiaryDeleting: false,
  isSeasonDiaryFinishing: false,
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

  // 5. DELETE /season-diary/{season_diary_id}
  deleteSeasonDiary: async (seasonDiaryId) => {
    set({ isSeasonDiaryDeleting: true });
    try {
      const res = await axiosInstance.delete(`/season-diary/${seasonDiaryId}`);
      set((state) => ({
        seasonDiaries: state.seasonDiaries.filter(
          (d) => d._id !== seasonDiaryId,
        ),
        seasonDiaryDetail:
          state.seasonDiaryDetail?._id === seasonDiaryId
            ? {}
            : state.seasonDiaryDetail,
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi xóa nhật ký");
      return false;
    } finally {
      set({ isSeasonDiaryDeleting: false });
    }
  },

  // 6. PATCH /season-diary/{season_diary_id}/finish
  finishSeasonDiary: async (seasonDiaryId) => {
    set({ isSeasonDiaryFinishing: true });
    try {
      const res = await axiosInstance.patch(
        `/season-diary/${seasonDiaryId}/finish`,
      );
      // Keep UI stable with current shape while waiting for refreshed detail.
      set((state) => ({
        seasonDiaries: state.seasonDiaries.map((d) =>
          d._id === seasonDiaryId
            ? {
                ...d,
                status: "Completed",
                end_date: res?.data?.data?.end_date || d.end_date,
              }
            : d,
        ),
        seasonDiaryDetail:
          state.seasonDiaryDetail?._id === seasonDiaryId
            ? {
                ...state.seasonDiaryDetail,
                status: "Completed",
                end_date:
                  res?.data?.data?.end_date || state.seasonDiaryDetail.end_date,
              }
            : state.seasonDiaryDetail,
      }));

      const refreshedDetail = await get().getSeasonDiaryDetail(seasonDiaryId);

      if (refreshedDetail?._id) {
        set((state) => ({
          seasonDiaries: state.seasonDiaries.map((d) =>
            d._id === seasonDiaryId ? { ...d, ...refreshedDetail } : d,
          ),
        }));
      }
      toast.success(res.data.message);
      return refreshedDetail || res.data.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi hoàn thành mùa vụ");
      return null;
    } finally {
      set({ isSeasonDiaryFinishing: false });
    }
  },

  // 8. GET /season-diary/{season_diary_id}/statistics
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

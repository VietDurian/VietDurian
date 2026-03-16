import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useUseFertilizerStore = create((set, get) => ({
  useFertilizers: [],
  useFertilizerPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isUseFertilizersLoading: false,
  isUseFertilizerCreating: false,
  isUseFertilizerUpdating: false,
  isUseFertilizerDeleting: false,

  // 1. GET /use-fertilizers
  getUseFertilizers: async ({ seasonDiaryId, page = 1, limit = 10 } = {}) => {
    set({ isUseFertilizersLoading: true });
    try {
      const res = await axiosInstance.get("/use-fertilizers", {
        params: {
          ...(seasonDiaryId && { season_diary_id: seasonDiaryId }),
          page,
          limit,
        },
      });

      const rawData = res?.data?.data;
      const items = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
          ? rawData.items
          : [];

      set({
        useFertilizers: items,
        useFertilizerPagination: res?.data?.pagination || {
          totalItems: items.length,
          totalPages: 1,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách sử dụng phân bón / thuốc BVTV",
      );
    } finally {
      set({ isUseFertilizersLoading: false });
    }
  },

  // 2. POST /use-fertilizers
  createUseFertilizer: async (data) => {
    set({ isUseFertilizerCreating: true });
    try {
      const res = await axiosInstance.post("/use-fertilizers", data);
      set((state) => ({
        useFertilizers: [res.data.data, ...state.useFertilizers],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tạo bản ghi sử dụng phân bón / thuốc BVTV",
      );
      return null;
    } finally {
      set({ isUseFertilizerCreating: false });
    }
  },

  // 3. PATCH /use-fertilizers/{use_fertilizers_id}
  updateUseFertilizer: async (useFertilizerId, data) => {
    set({ isUseFertilizerUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/use-fertilizers/${useFertilizerId}`,
        data,
      );
      set((state) => ({
        useFertilizers: state.useFertilizers.map((item) =>
          (item._id || item.id) === useFertilizerId ? res.data.data : item,
        ),
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi cập nhật bản ghi sử dụng phân bón / thuốc BVTV",
      );
      return null;
    } finally {
      set({ isUseFertilizerUpdating: false });
    }
  },

  // 4. DELETE /use-fertilizers/{use_fertilizers_id}
  deleteUseFertilizer: async (useFertilizerId) => {
    set({ isUseFertilizerDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/use-fertilizers/${useFertilizerId}`,
      );
      set((state) => ({
        useFertilizers: state.useFertilizers.filter(
          (item) => (item._id || item.id) !== useFertilizerId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi xóa bản ghi sử dụng phân bón / thuốc BVTV",
      );
      return false;
    } finally {
      set({ isUseFertilizerDeleting: false });
    }
  },
}));

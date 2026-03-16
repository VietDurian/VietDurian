import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useIrrigationCostStore = create((set, get) => ({
  irrigationCosts: [],
  irrigationCostPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isIrrigationCostsLoading: false,
  isIrrigationCostCreating: false,
  isIrrigationCostUpdating: false,
  isIrrigationCostDeleting: false,

  // 1. GET /irrigation-costs
  getIrrigationCosts: async ({ seasonDiaryId, page = 1, limit = 10 } = {}) => {
    set({ isIrrigationCostsLoading: true });
    try {
      const res = await axiosInstance.get("/irrigation-costs", {
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
        irrigationCosts: items,
        irrigationCostPagination: res?.data?.pagination || {
          totalItems: items.length,
          totalPages: 1,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tải danh sách chi phí tưới tiêu",
      );
    } finally {
      set({ isIrrigationCostsLoading: false });
    }
  },

  // 2. POST /irrigation-costs
  createIrrigationCost: async (data) => {
    set({ isIrrigationCostCreating: true });
    try {
      const res = await axiosInstance.post("/irrigation-costs", data);
      set((state) => ({
        irrigationCosts: [res.data.data, ...state.irrigationCosts],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tạo bản ghi chi phí tưới tiêu",
      );
      return null;
    } finally {
      set({ isIrrigationCostCreating: false });
    }
  },

  // 3. PATCH /irrigation-costs/{irrigation_cost_id}
  updateIrrigationCost: async (irrigationCostId, data) => {
    set({ isIrrigationCostUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/irrigation-costs/${irrigationCostId}`,
        data,
      );
      set((state) => ({
        irrigationCosts: state.irrigationCosts.map((item) =>
          (item._id || item.id) === irrigationCostId ? res.data.data : item,
        ),
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi cập nhật bản ghi chi phí tưới tiêu",
      );
      return null;
    } finally {
      set({ isIrrigationCostUpdating: false });
    }
  },

  // 4. DELETE /irrigation-costs/{irrigation_cost_id}
  deleteIrrigationCost: async (irrigationCostId) => {
    set({ isIrrigationCostDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/irrigation-costs/${irrigationCostId}`,
      );
      set((state) => ({
        irrigationCosts: state.irrigationCosts.filter(
          (item) => (item._id || item.id) !== irrigationCostId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi xóa bản ghi chi phí tưới tiêu",
      );
      return false;
    } finally {
      set({ isIrrigationCostDeleting: false });
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useLaborCostsStore = create((set, get) => ({
  laborCosts: [],
  laborCostPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isLaborCostsLoading: false,
  isLaborCostCreating: false,
  isLaborCostUpdating: false,
  isLaborCostDeleting: false,

  // 1. GET /labor-costs
  getLaborCosts: async ({ seasonDiaryId, page = 1, limit = 10 } = {}) => {
    set({ isLaborCostsLoading: true });
    try {
      const res = await axiosInstance.get("/labor-costs", {
        params: {
          ...(seasonDiaryId && { season_diary_id: seasonDiaryId }),
          page,
          limit,
        },
      });

      const payload = res?.data?.data;
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : [];

      const pagination = res?.data?.pagination || {
        totalItems: rows.length,
        totalPages: 1,
        currentPage: page,
        itemsPerPage: limit,
      };

      set({
        laborCosts: rows,
        laborCostPagination: pagination,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách chi phí thuê lao động",
      );
    } finally {
      set({ isLaborCostsLoading: false });
    }
  },

  // 2. POST /labor-costs
  createLaborCost: async (data) => {
    set({ isLaborCostCreating: true });
    try {
      const res = await axiosInstance.post("/labor-costs", data);
      set((state) => ({
        laborCosts: [res.data.data, ...state.laborCosts],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tạo bản ghi chi phí thuê lao động",
      );
      return null;
    } finally {
      set({ isLaborCostCreating: false });
    }
  },

  // 3. PATCH /labor-costs/{labor_cost_id}
  updateLaborCost: async (laborCostId, data) => {
    set({ isLaborCostUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/labor-costs/${laborCostId}`,
        data,
      );
      set((state) => ({
        laborCosts: state.laborCosts.map((item) =>
          (item?._id || item?.id) === laborCostId ? res.data.data : item,
        ),
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi cập nhật bản ghi chi phí thuê lao động",
      );
      return null;
    } finally {
      set({ isLaborCostUpdating: false });
    }
  },

  // 4. DELETE /labor-costs/{labor_cost_id}
  deleteLaborCost: async (laborCostId) => {
    set({ isLaborCostDeleting: true });
    try {
      const res = await axiosInstance.delete(`/labor-costs/${laborCostId}`);
      set((state) => ({
        laborCosts: state.laborCosts.filter(
          (item) => (item?._id || item?.id) !== laborCostId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi xóa bản ghi chi phí thuê lao động",
      );
      return false;
    } finally {
      set({ isLaborCostDeleting: false });
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useHarvestConsumptionStore = create((set, get) => ({
  harvestConsumptions: [],
  harvestConsumptionPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isHarvestConsumptionsLoading: false,
  isHarvestConsumptionCreating: false,
  isHarvestConsumptionUpdating: false,
  isHarvestConsumptionDeleting: false,

  // 1. GET /harvest-consumption
  getHarvestConsumptions: async ({
    seasonDiaryId,
    page = 1,
    limit = 10,
  } = {}) => {
    set({ isHarvestConsumptionsLoading: true });
    try {
      const res = await axiosInstance.get("/harvest-consumption", {
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
        harvestConsumptions: items,
        harvestConsumptionPagination: res?.data?.pagination || {
          totalItems: items.length,
          totalPages: 1,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách thu hoạch và tiêu thụ sản phẩm",
      );
    } finally {
      set({ isHarvestConsumptionsLoading: false });
    }
  },

  // 2. POST /harvest-consumption
  createHarvestConsumption: async (data) => {
    set({ isHarvestConsumptionCreating: true });
    try {
      const res = await axiosInstance.post("/harvest-consumption", data);
      set((state) => ({
        harvestConsumptions: [res.data.data, ...state.harvestConsumptions],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tạo bản ghi thu hoạch và tiêu thụ sản phẩm",
      );
      return null;
    } finally {
      set({ isHarvestConsumptionCreating: false });
    }
  },

  // 3. PATCH /harvest-consumption/{harvest_consumption_id}
  updateHarvestConsumption: async (harvestConsumptionId, data) => {
    set({ isHarvestConsumptionUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/harvest-consumption/${harvestConsumptionId}`,
        data,
      );
      set((state) => ({
        harvestConsumptions: state.harvestConsumptions.map((item) =>
          (item._id || item.id) === harvestConsumptionId ? res.data.data : item,
        ),
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi cập nhật bản ghi thu hoạch và tiêu thụ sản phẩm",
      );
      return null;
    } finally {
      set({ isHarvestConsumptionUpdating: false });
    }
  },

  // 4. DELETE /harvest-consumption/{harvest_consumption_id}
  deleteHarvestConsumption: async (harvestConsumptionId) => {
    set({ isHarvestConsumptionDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/harvest-consumption/${harvestConsumptionId}`,
      );
      set((state) => ({
        harvestConsumptions: state.harvestConsumptions.filter(
          (item) => (item._id || item.id) !== harvestConsumptionId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi xóa bản ghi thu hoạch và tiêu thụ sản phẩm",
      );
      return false;
    } finally {
      set({ isHarvestConsumptionDeleting: false });
    }
  },
}));

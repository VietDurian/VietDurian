import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useBuyingFertilizerStore = create((set, get) => ({
  buyingFertilizers: [],
  buyingFertilizerPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isBuyingFertilizersLoading: false,
  isBuyingFertilizerCreating: false,
  isBuyingFertilizerUpdating: false,
  isBuyingFertilizerDeleting: false,

  // 1. GET /buying-fertilizers
  getBuyingFertilizers: async ({
    seasonDiaryId,
    page = 1,
    limit = 10,
  } = {}) => {
    set({ isBuyingFertilizersLoading: true });
    try {
      const res = await axiosInstance.get("/buying-fertilizers", {
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
        buyingFertilizers: items,
        buyingFertilizerPagination: res?.data?.pagination || {
          totalItems: items.length,
          totalPages: 1,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tải danh sách mua phân bón",
      );
    } finally {
      set({ isBuyingFertilizersLoading: false });
    }
  },

  // 2. POST /buying-fertilizers
  createBuyingFertilizer: async (data) => {
    set({ isBuyingFertilizerCreating: true });
    try {
      const res = await axiosInstance.post("/buying-fertilizers", data);
      set((state) => ({
        buyingFertilizers: [res.data.data, ...state.buyingFertilizers],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tạo bản ghi mua phân bón",
      );
      return null;
    } finally {
      set({ isBuyingFertilizerCreating: false });
    }
  },

  // 3. PATCH /buying-fertilizers/{buying_fertilizers_id}
  updateBuyingFertilizer: async (buyingFertilizerId, data) => {
    set({ isBuyingFertilizerUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/buying-fertilizers/${buyingFertilizerId}`,
        data,
      );
      set((state) => ({
        buyingFertilizers: state.buyingFertilizers.map((item) =>
          (item._id || item.id) === buyingFertilizerId ? res.data.data : item,
        ),
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi cập nhật bản ghi mua phân bón",
      );
      return null;
    } finally {
      set({ isBuyingFertilizerUpdating: false });
    }
  },

  // 4. DELETE /buying-fertilizers/{buying_fertilizers_id}
  deleteBuyingFertilizer: async (buyingFertilizerId) => {
    set({ isBuyingFertilizerDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/buying-fertilizers/${buyingFertilizerId}`,
      );
      set((state) => ({
        buyingFertilizers: state.buyingFertilizers.filter(
          (item) => (item._id || item.id) !== buyingFertilizerId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi xóa bản ghi mua phân bón",
      );
      return false;
    } finally {
      set({ isBuyingFertilizerDeleting: false });
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const useBuyingSeedStore = create((set, get) => ({
  buyingSeeds: [],
  buyingSeedPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isBuyingSeedsLoading: false,
  isBuyingSeedCreating: false,
  isBuyingSeedUpdating: false,
  isBuyingSeedDeleting: false,

  // 1. GET /buying-seed
  getBuyingSeeds: async ({ seasonDiaryId, page = 1, limit = 10 } = {}) => {
    set({ isBuyingSeedsLoading: true });
    try {
      const res = await axiosInstance.get("/buying-seed", {
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
        buyingSeeds: items,
        buyingSeedPagination:
          res?.data?.pagination || {
            totalItems: items.length,
            totalPages: 1,
            currentPage: page,
            itemsPerPage: limit,
          },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tải danh sách mua giống",
      );
    } finally {
      set({ isBuyingSeedsLoading: false });
    }
  },

  // 2. POST /buying-seed
  createBuyingSeed: async (data) => {
    set({ isBuyingSeedCreating: true });
    try {
      const res = await axiosInstance.post("/buying-seed", data);
      set((state) => ({
        buyingSeeds: [res.data.data, ...state.buyingSeeds],
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi tạo bản ghi mua giống",
      );
      return null;
    } finally {
      set({ isBuyingSeedCreating: false });
    }
  },

  // 3. PATCH /buying-seed/{buying_seed_id}
  updateBuyingSeed: async (buyingSeedId, data) => {
    set({ isBuyingSeedUpdating: true });
    try {
      const res = await axiosInstance.patch(
        `/buying-seed/${buyingSeedId}`,
        data,
      );
      set((state) => ({
        buyingSeeds: state.buyingSeeds.map((item) =>
          (item._id || item.id) === buyingSeedId ? res.data.data : item,
        ),
      }));
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi cập nhật bản ghi mua giống",
      );
      return null;
    } finally {
      set({ isBuyingSeedUpdating: false });
    }
  },

  // 4. DELETE /buying-seed/{buying_seed_id}
  deleteBuyingSeed: async (buyingSeedId) => {
    set({ isBuyingSeedDeleting: true });
    try {
      const res = await axiosInstance.delete(`/buying-seed/${buyingSeedId}`);
      set((state) => ({
        buyingSeeds: state.buyingSeeds.filter(
          (item) => (item._id || item.id) !== buyingSeedId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Lỗi xóa bản ghi mua giống",
      );
      return false;
    } finally {
      set({ isBuyingSeedDeleting: false });
    }
  },
}));

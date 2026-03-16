import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const usePackagingHandlingStore = create((set, get) => ({
  packagingHandlings: [],
  packagingHandlingPagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  },
  isPackagingHandlingsLoading: false,
  isPackagingHandlingCreating: false,
  isPackagingHandlingUpdating: false,
  isPackagingHandlingDeleting: false,

  // 1. GET /packaging-handling
  getPackagingHandlings: async ({
    seasonDiaryId,
    page = 1,
    limit = 10,
  } = {}) => {
    set({ isPackagingHandlingsLoading: true });
    try {
      const res = await axiosInstance.get("/packaging-handling", {
        params: {
          ...(seasonDiaryId && { season_diary_id: seasonDiaryId }),
          limit,
          skip: (Math.max(Number(page) || 1, 1) - 1) * limit,
        },
      });

      const rawData = res?.data?.data ?? res?.data;
      const items = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
          ? rawData.items
          : [];

      set({
        packagingHandlings: items,
        packagingHandlingPagination: res?.data?.pagination || {
          totalItems: items.length,
          totalPages: 1,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách thu gom xử lý bao bì",
      );
    } finally {
      set({ isPackagingHandlingsLoading: false });
    }
  },

  // 2. POST /packaging-handling
  createPackagingHandling: async (data) => {
    set({ isPackagingHandlingCreating: true });
    try {
      const res = await axiosInstance.post("/packaging-handling", data);
      const created = res?.data?.data ?? res?.data;
      set((state) => ({
        packagingHandlings: created
          ? [created, ...state.packagingHandlings]
          : state.packagingHandlings,
      }));
      toast.success(res?.data?.message || "Tạo bản ghi thành công");
      return created || null;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tạo bản ghi thu gom xử lý bao bì",
      );
      return null;
    } finally {
      set({ isPackagingHandlingCreating: false });
    }
  },

  // 3. PATCH /packaging-handling/{id}
  updatePackagingHandling: async (packagingHandlingId, data) => {
    set({ isPackagingHandlingUpdating: true });
    try {
      const res = await axiosInstance.put(
        `/packaging-handling/${packagingHandlingId}`,
        data,
      );
      const updated = res?.data?.data ?? res?.data;
      set((state) => ({
        packagingHandlings: state.packagingHandlings.map((item) =>
          (item._id || item.id) === packagingHandlingId ? updated : item,
        ),
      }));
      toast.success(res?.data?.message || "Cập nhật bản ghi thành công");
      return updated || null;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi cập nhật bản ghi thu gom xử lý bao bì",
      );
      return null;
    } finally {
      set({ isPackagingHandlingUpdating: false });
    }
  },

  // 4. DELETE /packaging-handling/{id}
  deletePackagingHandling: async (packagingHandlingId) => {
    set({ isPackagingHandlingDeleting: true });
    try {
      const res = await axiosInstance.delete(
        `/packaging-handling/${packagingHandlingId}`,
      );
      set((state) => ({
        packagingHandlings: state.packagingHandlings.filter(
          (item) => (item._id || item.id) !== packagingHandlingId,
        ),
      }));
      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Lỗi xóa bản ghi thu gom xử lý bao bì",
      );
      return false;
    } finally {
      set({ isPackagingHandlingDeleting: false });
    }
  },
}));

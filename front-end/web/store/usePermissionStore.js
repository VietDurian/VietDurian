import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";

export const usePermissionStore = create((set, get) => ({
  isSubmittingProof: false,
  isApprovedAccount: false,
  verifyCCCDStatus: "",

  // POST: /permission/requests/proofs
  submitProof: async (data) => {
    set({ isSubmittingProof: true });
    try {
      const res = await axiosInstance.post("/permission/requests/proofs", data);
      toast.success(res?.data?.message);
      return res?.data;
    } catch (error) {
      toast.error(error?.response?.data?.message);
      return null;
    } finally {
      set({ isSubmittingProof: false });
    }
  },

  // GET: /permission/my-account/approved - Check current account approval status
  checkApprovedAccount: async () => {
    try {
      const res = await axiosInstance.get("/permission/my-account/approved");
      const isApproved = Boolean(res?.data?.data);
      set({ isApprovedAccount: isApproved });
      return isApproved;
    } catch (error) {
      set({ isApprovedAccount: false });
      return null;
    }
  },

  // GET: /permission/my-account/verify-cccd/status - Get CCCD status
  getVerifyCCCDStatus: async () => {
    try {
      const res = await axiosInstance.get(
        "/permission/my-account/verify-cccd/status",
      );
      const status = res?.data?.data || "none";
      set({ verifyCCCDStatus: status });
      return status;
    } catch (error) {
      set({ verifyCCCDStatus: "none" });
      return null;
    }
  },
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:8080";

export const usePermissionStore = create((set, get) => ({
  isSubmittingProof: false,
  isApprovedAccount: false,

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

  // GET: /permission/my-account/approve - Check current account approval status
  checkApprovedAccount: async () => {
    try {
      const res = await axiosInstance.get("/permission/my-account/approve");
      set({ isApprovedAccount: res?.data });
    } catch (error) {
      return null;
    }
  },
}));

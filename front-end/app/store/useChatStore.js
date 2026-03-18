import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import Toast from "react-native-toast-message";
import { useAuthStore } from "./useAuthStore";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || fallback;

const toArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  messageListener: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  loadContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      const fetched = toArrayPayload(res?.data);

      // If a user was selected (e.g. via "Liên Hệ") but has no conversation yet,
      // keep them at the top of the list so the chat window still works.
      const { selectedUser } = get();
      if (
        selectedUser?._id &&
        !fetched.some((u) => u?._id === selectedUser._id)
      ) {
        set({ users: [selectedUser, ...fetched] });
      } else {
        set({ users: fetched });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Failed to load contacts"),
      });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  addContact: (user) => {
    const current = get().users || [];
    const exists = current.some((u) => u._id === user._id);
    if (exists) return;
    set({ users: [...current, user] });
  },

  removeContact: (userId) => {
    const filtered = (get().users || []).filter((u) => u._id !== userId);
    const shouldClearSelected = get().selectedUser?._id === userId;
    set({
      users: filtered,
      selectedUser: shouldClearSelected ? null : get().selectedUser,
      messages: shouldClearSelected ? [] : get().messages,
    });
  },

  deleteConversation: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/conversation/${userId}`);
      get().removeContact(userId);
      Toast.show({ type: "success", text1: "Xóa cuộc trò chuyện thành công" });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Không thể xóa cuộc trò chuyện"),
      });
      throw error;
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: toArrayPayload(res?.data) });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Không thể tải tin nhắn"),
      });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: getErrorMessage(error, "Không thể gửi tin nhắn"),
      });
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // ✅ Nếu socket chưa ready, đợi nó connect rồi subscribe
    if (!socket) {
      const unsubscribeAuth = useAuthStore.subscribe((state) => {
        if (state.socket) {
          unsubscribeAuth(); // dừng watch
          get().subscribeToMessages(); // retry
        }
      });
      return;
    }

    // Cleanup listener cũ nếu có
    const { messageListener } = get();
    if (messageListener) {
      socket.off("newMessage", messageListener);
    }

    const handler = (newMessage) => {
      const isFromSelectedUser =
        String(newMessage?.senderId) === String(selectedUser._id);
      if (!isFromSelectedUser) return;
      set({ messages: [...get().messages, newMessage] });
    };

    socket.on("newMessage", handler);
    set({ messageListener: handler });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { messageListener } = get();
    if (messageListener) {
      socket.off("newMessage", messageListener);
      set({ messageListener: null });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] }),
}));

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
  _joinInterval: null,
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
      const newMsg = res?.data;
      set({ messages: [...messages, newMsg] });

      const { users } = get();
      const isExisting = users.some((u) => u._id === selectedUser._id);
      if (isExisting) {
        set({
          users: users.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  lastMessage: {
                    text: newMsg?.text,
                    createdAt: newMsg?.createdAt,
                  },
                }
              : u,
          ),
        });
      } else {
        await get().loadContacts();
      }

      const ws = useAuthStore.getState().ws;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "message",
            roomId: `user:${selectedUser._id}`,
            payload: newMsg,
          }),
        );
      }
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

    const authUser = useAuthStore.getState().authUser;
    if (!authUser?._id) return;

    const roomId = ["chat", authUser._id, selectedUser._id].sort().join(":");

    const tryJoin = () => {
      const ws = useAuthStore.getState().ws;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "join_room", roomId }));
        clearInterval(joinInterval);
        set({ _joinInterval: null });
      }
    };

    const joinInterval = setInterval(tryJoin, 500);
    set({ _joinInterval: joinInterval });
    tryJoin();
  },

  unsubscribeFromMessages: () => {
    const { _joinInterval } = get();
    if (_joinInterval) {
      clearInterval(_joinInterval);
      set({ _joinInterval: null });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, messages: [] }),
}));

import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";

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
      const fetched = res.data;

      // If a user was selected (e.g. via "Liên Hệ") but has no conversation yet,
      // keep them at the top of the list so the chat window still works.
      const { selectedUser } = get();
      if (selectedUser && !fetched.some((u) => u._id === selectedUser._id)) {
        fetched.unshift(selectedUser);
      }

      set({ users: fetched });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
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
      toast.success("Xóa cuộc trò chuyện thành công");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể xóa cuộc trò chuyện",
      );
      throw error;
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      const newMsg = res.data;
      set({ messages: [...messages, newMsg] });

      // Broadcast realtime cho người kia
      const ws = useAuthStore.getState().ws;
      const authUser = useAuthStore.getState().authUser;
      const roomId = ["chat", authUser._id, selectedUser._id].sort().join(":");

      ws?.send(
        JSON.stringify({
          type: "message",
          roomId,
          payload: newMsg,
        }),
      );
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const ws = useAuthStore.getState().ws;
    if (!ws) return;

    const authUser = useAuthStore.getState().authUser;
    const roomId = ["chat", authUser._id, selectedUser._id].sort().join(":");

    const doSubscribe = () => {
      ws.send(JSON.stringify({ type: "join_room", roomId }));

      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type !== "message") return;
        if (msg.roomId !== roomId) return;
        if (msg.senderId === authUser._id) return;
        set({ messages: [...get().messages, msg.payload] });
      };

      ws.addEventListener("message", handler);
      set({ messageListener: handler });
    };

    // ← Đây là fix: check readyState trước khi send
    if (ws.readyState === WebSocket.OPEN) {
      doSubscribe();
    } else {
      ws.addEventListener("open", doSubscribe, { once: true });
    }
  },

  unsubscribeFromMessages: () => {
    const ws = useAuthStore.getState().ws;
    const { messageListener } = get();
    if (ws && messageListener) {
      ws.removeEventListener("message", messageListener);
      set({ messageListener: null });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

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

      const { users } = get();
      const isExisting = users.some((u) => u._id === selectedUser._id);

      if (isExisting) {
        set({
          users: users.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  lastMessage: {
                    text: newMsg.text,
                    createdAt: newMsg.createdAt,
                  },
                }
              : u,
          ),
        });
      } else {
        await get().loadContacts();
      }

      const ws = useAuthStore.getState().ws;
      ws?.send(
        JSON.stringify({
          type: "message",
          roomId: `user:${selectedUser._id}`,
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

    const authUser = useAuthStore.getState().authUser;
    const roomId = ["chat", authUser._id, selectedUser._id].sort().join(":");

    const tryJoin = () => {
      const ws = useAuthStore.getState().ws;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "join_room", roomId }));
        clearInterval(joinInterval);
      }
    };

    const joinInterval = setInterval(tryJoin, 500);
    set({ _joinInterval: joinInterval });
    tryJoin();
  },

  unsubscribeFromMessages: () => {
    const { _joinInterval } = get();
    clearInterval(_joinInterval);
    set({ _joinInterval: null });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

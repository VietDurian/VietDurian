import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const CONTACTS_STORAGE_KEY = "chat_contacts";

const persistContacts = (contacts) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (error) {
    console.error("Failed to persist contacts", error);
  }
};

const loadContactsFromStorage = () => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CONTACTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load contacts", error);
    return [];
  }
};

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  loadContacts: () => {
    set({ users: loadContactsFromStorage() });
  },

  addContact: (user) => {
    const current = get().users || [];
    const exists = current.some((u) => u._id === user._id);
    if (exists) return;
    const updated = [...current, user];
    persistContacts(updated);
    set({ users: updated });
  },

  removeContact: (userId) => {
    const filtered = (get().users || []).filter((u) => u._id !== userId);
    const shouldClearSelected = get().selectedUser?._id === userId;
    persistContacts(filtered);
    set({
      users: filtered,
      selectedUser: shouldClearSelected ? null : get().selectedUser,
      messages: shouldClearSelected ? [] : get().messages,
    });
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
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

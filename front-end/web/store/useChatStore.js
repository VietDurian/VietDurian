import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";

const PRODUCT_CHAT_PREFIXES = {
  vi: "Ảnh Sản Phẩm",
  en: "Product Card",
};
const POST_CHAT_PREFIXES = {
  vi: "Ảnh Bài Viết",
  en: "Post Card",
};
const LEGACY_PRODUCT_CHAT_PREFIX = "__PRODUCT_CHAT_CARD__";
const LEGACY_POST_CHAT_PREFIX = "__POST_CHAT_CARD__";

const resolveLanguageCode = (language) => {
  if (typeof language !== "string" || !language.trim()) return "vi";
  const normalized = language.toLowerCase();
  if (normalized.startsWith("en")) return "en";
  return "vi";
};

const getProductPriceValue = (price) => {
  if (typeof price === "object" && price?.$numberDecimal)
    return parseFloat(price.$numberDecimal);
  const parsed = parseFloat(price);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createProductChatText = (product, language = "vi") => {
  const langCode = resolveLanguageCode(language);
  const prefix = PRODUCT_CHAT_PREFIXES[langCode] || PRODUCT_CHAT_PREFIXES.vi;
  const payload = {
    productId: product?._id,
    name: product?.name || "Sản phẩm",
    price: getProductPriceValue(product?.price),
    thumbnail: product?.images?.[0]?.url || "/images/Durian1.jpg",
  };

  return `${prefix}${JSON.stringify(payload)}`;
};

export const parseProductChatText = (text) => {
  if (typeof text !== "string") return null;

  const supportedPrefixes = [
    PRODUCT_CHAT_PREFIXES.vi,
    PRODUCT_CHAT_PREFIXES.en,
    LEGACY_PRODUCT_CHAT_PREFIX,
  ];

  const matchedPrefix = supportedPrefixes.find((prefix) =>
    text.startsWith(prefix),
  );
  if (!matchedPrefix) return null;

  try {
    const parsed = JSON.parse(text.slice(matchedPrefix.length));
    if (!parsed?.productId) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const createPostChatText = (post, language = "vi") => {
  const langCode = resolveLanguageCode(language);
  const prefix = POST_CHAT_PREFIXES[langCode] || POST_CHAT_PREFIXES.vi;
  const payload = {
    postId: post?.id || post?._id,
    title: post?.title || "Bài viết",
    content: post?.content || "",
    image: post?.image || "",
    category: post?.category || "",
  };

  return `${prefix}${JSON.stringify(payload)}`;
};

export const parsePostChatText = (text) => {
  if (typeof text !== "string") return null;

  const supportedPrefixes = [
    POST_CHAT_PREFIXES.vi,
    POST_CHAT_PREFIXES.en,
    LEGACY_POST_CHAT_PREFIX,
  ];

  const matchedPrefix = supportedPrefixes.find((prefix) =>
    text.startsWith(prefix),
  );
  if (!matchedPrefix) return null;

  try {
    const parsed = JSON.parse(text.slice(matchedPrefix.length));
    if (!parsed?.postId) return null;
    return parsed;
  } catch {
    return null;
  }
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
                    text: parseProductChatText(newMsg.text)
                      ? "Đã gửi một sản phẩm"
                      : parsePostChatText(newMsg.text)
                        ? "Đã gửi một bài viết"
                        : newMsg.text,
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
      const authUser = useAuthStore.getState().authUser;
      const roomId = ["chat", authUser?._id, selectedUser._id].sort().join(":");
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

  sendProductCardMessage: async (product, language = "vi") => {
    if (!product?._id) return;

    return get().sendMessage({
      text: createProductChatText(product, language),
    });
  },

  sendPostCardMessage: async (post, language = "vi") => {
    const postId = post?.id || post?._id;
    if (!postId) return;

    return get().sendMessage({
      text: createPostChatText(post, language),
    });
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

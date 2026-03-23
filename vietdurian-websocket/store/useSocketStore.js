// store/useSocketStore.js
// Thay thế hoàn toàn Socket.IO bằng native WebSocket
// Compatible với AWS API Gateway WebSocket API

import { create } from "zustand";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL; // wss://xxxx.execute-api.ap-southeast-1.amazonaws.com/dev

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  isConnected: false,

  connectSocket: (token) => {
    if (!token) return;
    if (get().socket?.readyState === WebSocket.OPEN) return;

    // Truyền token qua query string để Authorizer Lambda verify
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("[WS] Connected");
      set({ socket: ws, isConnected: true });

      // Lấy danh sách online users ngay khi connect
      get().send({ action: "getOnlineUsers" });
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        get().handleMessage(parsed);
      } catch (err) {
        console.error("[WS] Parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    ws.onclose = (event) => {
      console.log("[WS] Disconnected:", event.code, event.reason);
      set({ socket: null, isConnected: false });

      // Auto reconnect sau 3s nếu không phải close chủ động (code 1000)
      if (event.code !== 1000) {
        const { _reconnectToken } = get();
        if (_reconnectToken) {
          setTimeout(() => get().connectSocket(_reconnectToken), 3000);
        }
      }
    };

    set({ socket: ws, _reconnectToken: token });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close(1000, "User logout");
      set({
        socket: null,
        isConnected: false,
        onlineUsers: [],
        _reconnectToken: null,
      });
    }
  },

  // Gửi message qua WebSocket
  send: (payload) => {
    const { socket } = get();
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    } else {
      console.warn("[WS] Cannot send — not connected");
    }
  },

  // Gửi chat message tới user khác
  sendMessage: ({ targetUserId, message, conversationId }) => {
    get().send({
      action: "sendMessage",
      targetUserId,
      message,
      conversationId,
    });
  },

  // Handler nhận message từ server
  handleMessage: (parsed) => {
    const { event, data } = parsed;

    switch (event) {
      case "getOnlineUsers":
        set({ onlineUsers: data });
        break;

      case "newMessage":
        // Emit tới subscribers (dùng custom event để component lắng nghe)
        window.dispatchEvent(
          new CustomEvent("ws:newMessage", { detail: data }),
        );
        break;

      default:
        console.log("[WS] Unknown event:", event, data);
    }
  },

  // Subscribe nhận tin nhắn mới trong component
  // Usage: useEffect(() => useSocketStore.getState().onMessage((msg) => ...), [])
  onMessage: (callback) => {
    const handler = (e) => callback(e.detail);
    window.addEventListener("ws:newMessage", handler);
    return () => window.removeEventListener("ws:newMessage", handler);
  },
}));

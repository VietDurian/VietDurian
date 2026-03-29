// lib/websocket.js
let ws = null;
let reconnectAttempts = 0;
const MAX_ATTEMPTS = 10;

export function connectWebSocket(token, onMessage) {
  const url = `wss://vietdurian-websocket.onrender.com/ws?token=${token}`;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[WS] Connected");
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    onMessage(msg);
  };

  ws.onclose = () => {
    // Auto reconnect với exponential backoff
    if (reconnectAttempts < MAX_ATTEMPTS) {
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 60000);
      reconnectAttempts++;
      setTimeout(() => connectWebSocket(token, onMessage), delay);
    }
  };

  return ws;
}

export function joinRoom(roomId) {
  ws?.send(JSON.stringify({ type: "join_room", roomId }));
}

export function sendMessage(roomId, payload) {
  ws?.send(JSON.stringify({ type: "message", roomId, payload }));
}

export function notifyDiaryUpdated(roomId, payload) {
  ws?.send(JSON.stringify({ type: "diary_updated", roomId, payload }));
}

export function disconnectWebSocket() {
  ws?.close();
  ws = null;
}

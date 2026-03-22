import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://dev.d2k0kt672erqlu.amplifyapp.com",
    ],
    credentials: true,
  },
});

const apiV1Namespace = io.of("/api/v1");

// Get the receiver's socket id
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Used to store online users
const userSocketMap = {}; // {userId: socketId}

function broadcastOnlineUsers() {
  const onlineUsers = Object.keys(userSocketMap);
  io.emit("getOnlineUsers", onlineUsers);
  apiV1Namespace.emit("getOnlineUsers", onlineUsers);
}

function registerConnection(socket, namespaceLabel = "/") {
  console.log(`Socket connected (${namespaceLabel})`, socket.id);

  const rawUserId = socket.handshake?.query?.userId;
  const userId =
    typeof rawUserId === "string" ? rawUserId : String(rawUserId || "");

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  broadcastOnlineUsers();

  socket.on("disconnect", () => {
    console.log(`Socket disconnected (${namespaceLabel})`, socket.id);

    // Only clear mapping when the disconnecting socket owns the current mapping.
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
    }

    broadcastOnlineUsers();
  });
}

// When user connects
io.on("connection", (socket) => {
  registerConnection(socket, "/");
});

apiV1Namespace.on("connection", (socket) => {
  registerConnection(socket, "/api/v1");
});

export { io, app, server };

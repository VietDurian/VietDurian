// app/chat/page.js
"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ChatContainer from "@/components/ChatContainer";
import NoChatSelected from "@/components/NoChatSelected";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { users, setSelectedUser } = useChatStore();
  const { connectWS, disconnectWS } = useAuthStore();

  // ← Connect WS khi vào /chat, disconnect khi rời
  useEffect(() => {
    connectWS();
    return () => disconnectWS();
  }, [connectWS, disconnectWS]);

  useEffect(() => {
    if (!chatId) return;
    const user = users.find((u) => u._id === chatId);
    if (user) setSelectedUser(user);
  }, [chatId, users, setSelectedUser]);

  if (!chatId) {
    return <NoChatSelected />;
  }

  return <ChatContainer />;
}

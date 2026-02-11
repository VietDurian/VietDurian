"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import ChatContainer from "@/components/ChatContainer";
import { useChatStore } from "@/store/useChatStore";

export default function ChatByIdPage() {
  const { id } = useParams(); // ✅ correct in client components
  const { setSelectedUser, users } = useChatStore();

  useEffect(() => {
    const user = users.find((u) => u._id === id);
    if (user) setSelectedUser(user);
  }, [id, users, setSelectedUser]);

  return <ChatContainer />;
}

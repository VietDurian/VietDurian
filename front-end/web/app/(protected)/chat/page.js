"use client";
import ChatContainer from "@/components/ChatContainer";
import Navbar from "@/components/Navbar";
import NoChatSelected from "@/components/NoChatSelected";
import Sidebar from "@/components/Sidebar";
import { useChatStore } from "@/store/useChatStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <Navbar />
      <div className="flex items-center justify-center pt-16">
        <div className="bg-base-100 rounded-lg shadow-cl w-full h-[calc(100vh-4rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;

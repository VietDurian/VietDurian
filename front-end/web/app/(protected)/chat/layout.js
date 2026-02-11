// app/chat/layout.js
"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function ChatLayout({ children }) {
  return (
    <div className="h-screen bg-base-200">
      <Navbar />
      <div className="flex items-center justify-center pt-16">
        <div className="bg-base-100 rounded-lg shadow-cl w-full h-[calc(100vh-4rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

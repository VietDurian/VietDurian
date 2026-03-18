// app/chat/layout.js
"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (user) return;

    const loginUrl = pathname
      ? `/login?redirect=${encodeURIComponent(pathname)}`
      : "/login";

    router.replace(loginUrl);
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return null;
  }

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

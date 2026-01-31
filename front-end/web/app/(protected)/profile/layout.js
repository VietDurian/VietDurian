"use client";
import AsideBar from "@/components/AsideBar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function ProfileLayout({ children }) {
  const { user } = useAuth();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Navbar />
        <AsideBar role={user?.role} />
        <main className="mt-14 ml-64 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}

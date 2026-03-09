"use client";
import AsideBar from "@/components/AsideBar";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfileLayout({ children }) {
  const { authUser } = useAuthStore();

  return (
    <>
      <Navbar />
      <AsideBar role={authUser?.role} />
      <main className="mt-14 md:ml-64 overflow-y-auto bg-gray-100">
        {children}
      </main>
    </>
  );
}

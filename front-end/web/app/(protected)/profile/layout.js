"use client";
import AsideBar from "@/components/AsideBar";
import { useAuth } from "@/context/AuthContext";

export default function ProfileLayout({ children }) {
  const { user } = useAuth();

  return (
    <div>
      <AsideBar role={user?.role} />
      <main>{children}</main>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active
        ? "bg-emerald-50 text-emerald-800 font-bold"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    <Icon
      size={22}
      className={
        active ? "text-emerald-800" : "text-gray-400 group-hover:text-gray-900"
      }
    />
    <span className="text-sm tracking-wide">{label}</span>
  </Link>
);

export default function AsideBar({ role }) {
  console.log("ROLE", role);
  const pathname = usePathname();
  const getMenuItems = (role) => {
    switch (role) {
      case "trader":
        return [
          { icon: Home, label: "Details", href: "/profile/details" },
          { icon: Search, label: "Posts", href: "/profile/posts" },
        ];
      case "farmer":
        return [
          { icon: Home, label: "Details", href: "/profile/details" },
          { icon: Home, label: "Posts", href: "/profile/posts" },
          { icon: Home, label: "Gardens", href: "/profile/gardens" },
        ];
      case "contentExpert":
        return [
          { icon: Home, label: "Details", href: "/profile/details" },
          { icon: Home, label: "Posts", href: "/profile/posts" },
          { icon: Home, label: "Blogs", href: "/profile/blogs" },
        ];
      case "serviceProvider":
        return [
          { icon: Home, label: "Details", href: "/profile/details" },
          { icon: Home, label: "Posts", href: "/profile/posts" },
          { icon: Home, label: "Resume", href: "/profile/resume" },
          { icon: Home, label: "Services", href: "/profile/services" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(role);

  return (
    <aside className="w-64 h-[95vh] fixed top-10 border-r border-gray-100 bg-white flex flex-col p-5 pt-10">
      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href}
          />
        ))}
      </nav>
    </aside>
  );
}

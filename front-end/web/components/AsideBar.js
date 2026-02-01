"use client";
import React, { useState } from "react";
import { Home, FileText, User, Briefcase, FileEdit, Sprout, PenTool } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link
    href={href}
    className={`relative flex items-center gap-4 px-6 py-5 rounded-xl transition-all duration-300 group overflow-hidden ${active
      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
      }`}
  >
    <Icon
      size={24}
      className={`${active
        ? "text-white"
        : "text-gray-500 group-hover:text-emerald-600 group-hover:scale-110"
        } transition-all duration-300 flex-shrink-0`}
    />
    <span className={`text-lg font-medium ${active ? "text-white" : "group-hover:text-gray-900"} transition-colors duration-300`}>
      {label}
    </span>

    {/* Subtle hover border */}
    {!active && (
      <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/20 rounded-xl transition-all duration-300" />
    )}
  </Link>
);

export default function AsideBar({ role }) {
  console.log("ROLE", role);
  const pathname = usePathname();
  const getMenuItems = (role) => {
    switch (role) {
      case "trader":
        return [
          { icon: User, label: "Details", href: "/profile/details" },
          { icon: FileText, label: "Posts", href: "/profile/posts" },
        ];
      case "farmer":
        return [
          { icon: User, label: "Details", href: "/profile/details" },
          { icon: FileText, label: "Posts", href: "/profile/posts" },
          { icon: Sprout, label: "Gardens", href: "/profile/gardens" },
        ];
      case "contentExpert":
        return [
          { icon: User, label: "Details", href: "/profile/details" },
          { icon: FileText, label: "Posts", href: "/profile/posts" },
          { icon: PenTool, label: "Blogs", href: "/profile/blogs" },
        ];
      case "serviceProvider":
        return [
          { icon: User, label: "Details", href: "/profile/details" },
          { icon: FileText, label: "Posts", href: "/profile/posts" },
          { icon: FileEdit, label: "Resume", href: "/profile/resume" },
          { icon: Briefcase, label: "Services", href: "/profile/services" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(role);

  return (
    <aside className="w-64 h-[95vh] fixed top-10 border-r border-gray-200 bg-white flex flex-col px-4 py-6">
      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 space-y-3">
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
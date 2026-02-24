"use client";
import React, { useState } from "react";
import {
  Home,
  FileText,
  User,
  Briefcase,
  FileEdit,
  Sprout,
  PenTool,
  ChevronRight,
  Sparkles,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link
    href={href}
    className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group overflow-hidden ${
      active
        ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white scale-105"
        : "text-gray-600 hover:bg-white hover:shadow-lg hover:scale-[1.02]"
    }`}
  >
    {/* Animated background gradient */}
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse rounded-2xl" />
    )}

    {/* Icon container with animated background */}
    <div
      className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${
        active
          ? "bg-white/20 backdrop-blur-sm"
          : "bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-emerald-50 group-hover:to-teal-50"
      }`}
    >
      <Icon
        size={20}
        className={`${
          active
            ? "text-white"
            : "text-emerald-600 group-hover:text-emerald-700 group-hover:scale-110"
        } transition-all duration-300`}
        strokeWidth={2.5}
      />
    </div>

    {/* Label with better typography */}
    <span
      className={`relative z-10 text-[15px] font-semibold tracking-wide ${
        active ? "text-white" : "text-gray-700 group-hover:text-gray-900"
      } transition-colors duration-300`}
    >
      {label}
    </span>

    {/* Arrow indicator for active item */}
    {active && (
      <ChevronRight
        size={18}
        className="relative z-10 ml-auto text-white/80 animate-pulse"
        strokeWidth={3}
      />
    )}

    {/* Hover border effect */}
    {!active && (
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-200 rounded-2xl transition-all duration-300" />
    )}

    {/* Subtle shine effect on hover */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </Link>
);

export default function AsideBar({ role }) {
  console.log("ROLE", role);
  const pathname = usePathname();

  const getMenuItems = (role) => {
    switch (role) {
      case "trader":
        return [
          { icon: User, label: "Thông tin", href: "/profile/details" },
          { icon: FileText, label: "Bài viết", href: "/profile/posts" },
        ];
      case "farmer":
        return [
          { icon: User, label: "Thông tin", href: "/profile/details" },
          { icon: FileText, label: "Bài viết", href: "/profile/posts" },
          { icon: Sprout, label: "Vườn cây", href: "/profile/gardens" },
          { icon: Package, label: "Sản Phẩm", href: "/profile/products" },
        ];
      case "contentExpert":
        return [
          { icon: User, label: "Thông tin", href: "/profile/details" },
          { icon: FileText, label: "Bài viết", href: "/profile/posts" },
          { icon: PenTool, label: "Blog", href: "/profile/blogs" },
        ];
      case "serviceProvider":
        return [
          { icon: User, label: "Thông tin", href: "/profile/details" },
          { icon: FileText, label: "Bài viết", href: "/profile/posts" },
          { icon: FileEdit, label: "Hồ sơ", href: "/profile/resume" },
          { icon: Briefcase, label: "Dịch vụ", href: "/profile/services" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(role);

  return (
    <aside className="w-64 h-[95vh] fixed top-10 bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col px-4 py-8 border-r border-gray-200/60 backdrop-blur-xl">
      {/* Decorative top element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Navigation Links */}
      <nav className="relative z-10 flex flex-col flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <div
            key={item.label}
            style={{
              animation: `slideInLeft 0.4s ease-out ${index * 0.1}s both`,
            }}
          >
            <SidebarItem
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={pathname === item.href}
            />
          </div>
        ))}
      </nav>

      {/* VIP Bottom branding section */}
      <div className="relative z-10 mt-6">
        {/* Decorative divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-full">
              <Sparkles size={12} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Brand card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-4">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>

          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>

          {/* Content */}
          <div className="relative z-10 flex items-center gap-3">
            {/* Animated dot */}
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping"></div>
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide">
                VietDurian
              </span>
              <span className="text-white/80 text-xs font-medium">
                Trang Cá Nhân
              </span>
            </div>
          </div>

          {/* Decorative corner elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </aside>
  );
}

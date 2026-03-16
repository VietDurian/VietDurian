"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Menu,
  X,
  Bot,
  ChartColumnIncreasing,
  ChevronLeft,
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, href, active, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group overflow-hidden ${
      active
        ? "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white scale-105"
        : "text-gray-600 hover:bg-white hover:shadow-lg hover:scale-[1.02]"
    }`}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 animate-pulse rounded-2xl" />
    )}

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

    <span
      className={`relative z-10 text-[15px] font-semibold tracking-wide ${
        active ? "text-white" : "text-gray-700 group-hover:text-gray-900"
      } transition-colors duration-300`}
    >
      {label}
    </span>

    {active && (
      <ChevronRight
        size={18}
        className="relative z-10 ml-auto text-white/80 animate-pulse"
        strokeWidth={3}
      />
    )}

    {!active && (
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-200 rounded-2xl transition-all duration-300" />
    )}

    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </Link>
);

export default function AsideBar({ role }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const seasonDiaryRouteMatch = pathname?.match(
    /^\/profile\/season-diaries\/([^/]+)/,
  );
  const seasonDiaryId = seasonDiaryRouteMatch?.[1];
  const isFarmerSeasonDiarySubRoute = role === "farmer" && !!seasonDiaryId;

  const getMenuItems = (role) => {
    switch (role) {
      case "trader":
        return [
          { icon: User, label: "Thông tin", href: "/profile/details" },
          { icon: FileText, label: "Bài viết", href: "/profile/posts" },
        ];
      case "farmer":
        if (isFarmerSeasonDiarySubRoute) {
          return [
            {
              icon: Sprout,
              label: "Chi Tiết",
              href: `/profile/season-diaries/${seasonDiaryId}`,
            },
            {
              icon: FileText,
              label: "Nhật Ký",
              href: `/profile/season-diaries/${seasonDiaryId}/diaries`,
            },
            {
              icon: ChartColumnIncreasing,
              label: "Thống Kê",
              href: `/profile/season-diaries/${seasonDiaryId}/statistics`,
            },
          ];
        }

        return [
          { icon: User, label: "Thông tin", href: "/profile/details" },
          { icon: FileText, label: "Bài viết", href: "/profile/posts" },
          { icon: Sprout, label: "Vườn", href: "/profile/season-diaries" },
          { icon: Package, label: "Sản Phẩm", href: "/profile/products" },
          {
            icon: ChartColumnIncreasing,
            label: "Thống Kê",
            href: "/profile/statistics",
          },
          { icon: Bot, label: "AI", href: "/profile/ai" },
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
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(role);

  const SidebarContent = ({ onItemClick }) => (
    <>
      {/* Navigation Links */}
      <nav className="relative z-10 flex flex-col flex-1 space-y-2">
        {isFarmerSeasonDiarySubRoute && (
          <Link
            href="/profile/season-diaries"
            onClick={onItemClick}
            className="flex items-center gap-2 px-4 py-2.5 mb-1 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-300"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Trở lại vườn
          </Link>
        )}

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
              onClick={onItemClick}
            />
          </div>
        ))}
      </nav>

      {/* Bottom branding section */}
      <div className="relative z-10 mt-6">
        {/* Thicker divider, no icon */}
        <div className="mb-6">
          <div className="w-full h-[4px] rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </div>

        {/* Brand card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-4">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide">
                VietDurian
              </span>
              <span className="text-white/80 text-xs font-medium">
                Trang Cá Nhân
              </span>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full"></div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile Toggle Button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-20 left-4 z-[999] p-2 bg-white rounded-xl shadow-md border border-gray-200 text-emerald-600"
      >
        <Menu size={22} strokeWidth={2.5} />
      </button>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-[1001] h-full w-72 bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col px-4 py-8 border-r border-gray-200/60 backdrop-blur-xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mt-8 flex flex-col flex-1">
          <SidebarContent onItemClick={() => setMobileOpen(false)} />
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

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 h-[95vh] fixed top-10 bg-gradient-to-b from-gray-50 via-white to-gray-50 flex-col px-4 py-8 border-r border-gray-200/60 backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        <SidebarContent onItemClick={undefined} />

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
    </>
  );
}

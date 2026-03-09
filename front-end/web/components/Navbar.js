"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  MessageCircle,
  Bell,
  Trash2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import { notificationAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Trang Chủ", href: "/" },
  { label: "Hướng Dẫn", href: "/guide" },
  { label: "Sản Phẩm", href: "/products" },
  { label: "Blog", href: "/blogs" },
  { label: "Bài viết", href: "/posts" },
  { label: "Về Chúng Tôi", href: "/about-us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navRef = useRef(null);
  const router = useRouter();

  // Hàm tính thời gian tương đối
  const calculateRelativeTime = (createdAt) => {
    const now = new Date();
    const past = new Date(createdAt);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(createdAt).toLocaleDateString("vi-VN");
  };

  // Fetch notifications từ API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await notificationAPI.getNotifications();
        const data = response.data || [];

        // Map dữ liệu từ API
        const mappedNotifications = data.map((notif) => ({
          id: notif._id,
          postId: notif.post_id?._id,
          message: notif.message,
          time: calculateRelativeTime(notif.created_at),
          read: notif.is_read,
          sender: notif.sender_id,
          entityType: notif.entity_type,
          createdAt: notif.created_at,
        }));

        setNotifications(mappedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh notifications mỗi 30 giây
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  // Close profile when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout("/login");
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-1001 bg-white backdrop-blur-md border-b border-gray-200">
      <div className=" mx-auto px-5">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/VietDurian-logo.png"
              alt="Logo"
              width={100}
              height={40}
              className="object-contain"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-emerald-700"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-4" ref={navRef}>
            {user && (
              <div className="flex items-center gap-5">
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen((p) => !p)}
                    className="relative flex items-center justify-center hover:text-emerald-600 transition"
                  >
                    <Bell className="w-5 h-5 text-gray-600 hover:text-emerald-600" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full w-5 h-5">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </button>

                  {notificationOpen && (
                    // ✅ FIX: Bỏ overflow-y-auto và max-h ra khỏi container ngoài
                    <div className="absolute right-0 mt-5 w-80 rounded-xl bg-white shadow-lg border border-gray-300">
                      {/* ✅ Header cố định, không bị scroll */}
                      <div className="bg-white border-b border-gray-200 p-3 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">
                          Thông báo
                        </h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {notifications.filter((n) => !n.read).length}
                        </span>
                      </div>

                      {/* ✅ Chỉ phần list mới scroll */}
                      <div className="max-h-80 overflow-y-auto rounded-b-xl">
                        {loading ? (
                          <div className="p-8 text-center text-gray-500">
                            <p>Đang tải...</p>
                          </div>
                        ) : notifications.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={async () => {
                                  // Mark as read
                                  if (!notif.read) {
                                    try {
                                      await notificationAPI.markAsRead(
                                        notif.id,
                                      );
                                      setNotifications((prev) =>
                                        prev.map((n) =>
                                          n.id === notif.id
                                            ? { ...n, read: true }
                                            : n,
                                        ),
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error marking notification as read:",
                                        error,
                                      );
                                    }
                                  }

                                  // Navigate based on entity type
                                  if (
                                    notif.entityType === "comment" ||
                                    notif.entityType === "reply"
                                  ) {
                                    if (notif.postId) {
                                      router.push(
                                        `/posts?postId=${notif.postId}`,
                                      );
                                    } else {
                                      router.push("/posts");
                                    }
                                  } else if (
                                    notif.entityType === "Accepted Post" ||
                                    notif.entityType === "Rejected Post"
                                  ) {
                                    router.push("/profile/posts");
                                  }

                                  setNotificationOpen(false);
                                }}
                                className={`p-4 hover:bg-gray-50 transition group flex items-start gap-3 cursor-pointer ${
                                  !notif.read ? "bg-emerald-50" : ""
                                }`}
                              >
                                {/* ✅ Avatar luôn có placeholder giữ layout */}
                                {notif.sender?.avatar ? (
                                  <div className="relative h-8 w-8 overflow-hidden rounded-full flex-shrink-0">
                                    <Image
                                      src={notif.sender.avatar}
                                      alt="Avatar"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-8 w-8 flex-shrink-0" />
                                )}

                                <div className="flex-1 min-w-0">
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <p
                                        className={`text-sm ${!notif.read ? "font-semibold text-gray-800" : "text-gray-700"}`}
                                      >
                                        {notif.message}
                                      </p>
                                      {!notif.read && (
                                        <div className="w-2 h-2 bg-emerald-600 rounded-full mt-1 flex-shrink-0"></div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {notif.time}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await notificationAPI.deleteNotification(
                                        notif.id,
                                      );
                                      setNotifications((prev) =>
                                        prev.filter((n) => n.id !== notif.id),
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error deleting notification:",
                                        error,
                                      );
                                    }
                                  }}
                                  className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <p>Không có thông báo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => router.push("/chat")}
                  className="relative flex items-center justify-center hover:text-emerald-600 transition"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600 hover:text-emerald-600" />
                </button>
              </div>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-gray-300 transition cursor-pointer"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={user.avatar}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 transition ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-5 w-64 rounded-xl bg-white shadow-lg border border-gray-300 p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={user.avatar}
                          alt="Avatar"
                          fill
                          className=" "
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="my-3 border-t border-gray-200" />

                    <Link
                      href="/profile/details"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" /> Trang cá nhân
                    </Link>

                    <div className="my-2 border-t border-gray-200" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-full hover:bg-emerald-800"
                >
                  Đăng Ký
                </Link>
              </div>
            )}

            {/* Mobile Button */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-gray-700 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

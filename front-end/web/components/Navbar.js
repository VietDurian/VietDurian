"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  MessageCircle,
  Info,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import NotificationPost from "@/components/NotificationPost";
import { axiosInstance } from "@/lib/axios";
import { useChatStore } from "@/store/useChatStore";
import { useLanguage } from "@/context/LanguageContext";

const NAV_LINKS = [
  { labelKey: "nav_home", href: "/" },
  { labelKey: "nav_guide", href: "/guide" },
  { labelKey: "nav_products", href: "/products" },
  { labelKey: "nav_blog", href: "/blogs" },
  { labelKey: "nav_posts", href: "/posts" },
  { labelKey: "nav_about", href: "/about-us" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { setSelectedUser, addContact } = useChatStore();
  const { t, language, setLanguage } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout("/login");
  };

  const handleSupportClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const res = await axiosInstance.get("/messages/users");
      const users = Array.isArray(res?.data) ? res.data : [];
      const adminUser = users.find((u) => u.role === "admin");

      if (!adminUser?._id) {
        router.push("/chat");
        return;
      }

      const chatAdmin = {
        _id: adminUser._id,
        full_name: adminUser.full_name || "Admin hỗ trợ",
        email: adminUser.email || "",
        avatar: adminUser.avatar || "/images/avatar.jpg",
      };

      addContact(chatAdmin);
      setSelectedUser(chatAdmin);
      setProfileOpen(false);
      router.push(`/chat?chatId=${adminUser._id}`);
    } catch (error) {
      router.push("/chat");
    }
  };

  // Nút chuyển ngôn ngữ
  const LangToggle = () => (
    <button
      onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-600 text-sm font-semibold transition"
    >
      {language === "vi" ? "EN" : "VI"}
    </button>
  );

  return (
    <nav className="fixed top-0 inset-x-0 z-1001 bg-white backdrop-blur-md border-b border-gray-200">
      <div className="mx-auto px-5">
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
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-4" ref={navRef}>
            {user ? (
              // ĐÃ ĐĂNG NHẬP: LangToggle trước chuông
              <div className="flex items-center gap-5">
                <LangToggle />
                <NotificationPost user={user} />
                <button
                  onClick={() => router.push("/chat")}
                  className="relative flex items-center justify-center hover:text-emerald-600 transition"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600 hover:text-emerald-600" />
                </button>
              </div>
            ) : (
              // CHƯA ĐĂNG NHẬP: LangToggle trước nút đăng nhập
              <div className="hidden md:flex items-center gap-3">
                <LangToggle />
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-full hover:bg-emerald-800"
                >
                  {t("nav_register")}
                </Link>
              </div>
            )}

            {/* Avatar + dropdown - chỉ hiện khi đã đăng nhập */}
            {user && (
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
                    className={`w-4 h-4 text-black transition ${
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
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-black">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="my-3 border-t border-gray-200" />

                    <Link
                      href="/profile/details"
                      className="text-black flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" /> {t("nav_profile")}
                    </Link>
                    <button
                      onClick={handleSupportClick}
                      className="text-black flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <Info className="w-4 h-4" /> {t("nav_support")}
                    </button>

                    <div className="my-2 border-t border-gray-200" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> {t("nav_logout")}
                    </button>
                  </div>
                )}
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
              {t(link.labelKey)}
            </Link>
          ))}

          {/* Thêm phần này */}
          {!user && (
            <>
              <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                <LangToggle />
                <Link
                  href="/login"
                  className="block text-center px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-700 rounded-full hover:bg-emerald-50"
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/register"
                  className="block text-center px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-full hover:bg-emerald-800"
                >
                  {t("nav_register")}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

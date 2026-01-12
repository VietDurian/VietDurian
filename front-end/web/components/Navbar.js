"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  User,
  Settings,
  LogOutIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const NAV_LINKS = [
    { label: "Trang Chủ", href: "/" },
    { label: "Hướng Dẫn", href: "/guide" },
    { label: "Sản Phẩm", href: "/products" },
    { label: "Blog", href: "/blogs" },
    { label: "Về Chúng Tôi", href: "/about-us" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Fetch local storage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      if (storedToken) setAuthToken(storedToken);
      if (storedUser) setAuthUser(JSON.parse(storedUser));
    } catch (error) {}
  }, []);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Open menu when on mobile
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when on mobile
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Open profile dropdown
  const toggleOpenProfile = () => {
    setOpenProfile(!openProfile);
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setAuthUser(null);
    setAuthToken(null);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-1"
          : "bg-white/80 backdrop-blur-md shadow-sm py-1"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-5">
        <div className="flex items-center h-full justify-between">
          {/* Logo Section */}
          <Link href={"/"}>
            <Image
              src={"/images/VietDurian-logo.png"}
              width={100}
              height={100}
              alt="logo"
              className="object-contain"
            />
          </Link>
          {/* Desktop Navigation Links & Search */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <div className="flex items-baseline space-x-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-emerald-700 font-bold"
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          {/* Right Side */}
          <div className="relative hidden md:flex items-center gap-5">
            <ShoppingBag className="hover:text-emerald-600" />
            {authToken ? (
              <>
                <button
                  onClick={toggleOpenProfile}
                  className="flex items-center gap-1 bg-white/5 hover:bg-gray-200 transition px-1 py-1 rounded-full cursor-pointer"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src="/images/avatar.jpg"
                      alt="Profile"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {openProfile ? (
                    <ChevronUp className="w-5 h-5 text-gray-700" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-700" />
                  )}
                </button>
                {/* Open Profile */}
                {openProfile && (
                  <div
                    className={`absolute right-0  w-auto bg-white rounded-2xl border-2 border-gray-200 shadow-xs p-2
                      ${
                        isScrolled
                          ? "top-15 transition-all duration-300"
                          : "top-15 transition-all duration-300"
                      }
                      `}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src="/images/avatar.jpg"
                          alt="Profile"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div>
                        <p className="font-bold text-nowrap">
                          {authUser.full_name}
                        </p>
                        <p className="text-sm text-nowrap">{authUser.email}</p>
                      </div>
                      <div className="ml-10 bg-emerald-700 px-2 py-1 rounded-full ">
                        <p className="text-sm text-white">{authUser.role}</p>
                      </div>
                    </div>
                    <div className="my-3 border border-gray-200" />
                    <div className="space-y-1">
                      <Link
                        href={"/profile"}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-900 cursor-pointer"
                      >
                        <User className="w-5 h-5" />
                        Trang cá nhân
                      </Link>

                      <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 cursor-pointer">
                        <Settings className="w-5 h-5" />
                        Settings
                      </button>
                    </div>
                    <div className="my-3 border border-gray-200" />
                    <div className="space-y-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                      >
                        <LogOutIcon className="w-5 h-5" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full border border-emerald-700 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
                >
                  Đăng Ký
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
                >
                  Đăng Nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-800 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden bg-white/10 ${
          isOpen ? " opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 p-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className={` hover:bg-gray-50 block px-3 py-2.5 rounded-md text-base  transition-all ${
                pathname === link.href
                  ? "text-emerald-700 font-bold"
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {authToken ? (
            <div className=" rounded-xl bg-white/50 border border-gray-200 p-3 overflow-auto">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <Image
                    src="/images/avatar.jpg"
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {authUser.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{authUser.email}</p>
                </div>

                <span className="bg-emerald-700 text-white text-xs px-2 py-1 rounded-full">
                  {authUser.role}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <Link
                  href={"/profile"}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800"
                >
                  <User className="w-5 h-5" />
                  Trang cá nhân
                </Link>

                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-800">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>

                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-50 text-red-500">
                  <LogOutIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex gap-3">
              <Link
                href="/register"
                onClick={closeMenu}
                className="flex-1 text-center rounded-full border border-emerald-700 text-emerald-700 font-semibold hover:bg-emerald-50 transition"
              >
                Đăng Ký
              </Link>
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex-1 text-center px-4 py-2 rounded-full bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
              >
                Đăng Nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

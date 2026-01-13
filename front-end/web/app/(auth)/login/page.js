"use client";
import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const data = res.data;

      // Validate response
      if (!data?.data?.user || !data?.data?.token) {
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      const user = data.data.user;
      const token = data.data.token;

      login(user, token);

      router.push("/");
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-white p-5 pt-15 lg:pt-0">
      {/* Logo */}
      <Link
        href={"/"}
        className="absolute top-5 left-5 items-center gap-2 mb-16"
      >
        <Image
          src={"/images/VietDurian-logo.png"}
          width={100}
          height={50}
          alt="logo"
        />
      </Link>
      {/* LEFT SECTION: Login Form */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Đăng Nhập
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Hệ thống sầu riêng uy tín, chất lượng Việt Nam
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                  }
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={"/forgot-password"}
                className="text-xs font-medium text-teal-800 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {error && (
              <Notification
                type="error"
                title="Đăng nhập thất bại"
                message={error}
                onClose={() => setError("")}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#04543D] text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">
                Hoặc
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <button className="w-full border border-gray-200 flex items-center justify-center py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <img
                src="/images/google.png"
                alt="Google"
                width={50}
                height={50}
              />{" "}
              Tiếp tục với Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href={"/register"}
              className="text-teal-800 font-bold hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: Branding & Testimonial */}
      {/* <div className="z-1 hidden m-5 rounded-2xl lg:flex w-[55%] bg-[#04543D] relative overflow-hidden flex-col justify-center px-16 xl:px-24">
        <Image
          src={"/images/1767343747.png"}
          fill
          alt="Login page image"
          className="object-cover z-0"
        />
      </div> */}
    </div>
  );
}

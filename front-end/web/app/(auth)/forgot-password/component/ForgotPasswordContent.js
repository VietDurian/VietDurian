// Nguyễn Trọng Quý - CE180596
"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function ForogtPasswordContent() {
  const router = useRouter();
  const { forgotPassword, isRequestingResetOtp } = useAuthStore();
  const [email, setEmail] = useState("");

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRequestingResetOtp) return;

    const normalizedEmail = email.trim().toLowerCase();
    const result = await forgotPassword(normalizedEmail);

    if (result) {
      setTimeout(() => {
        router.push(
          `/verify-reset-otp?email=${encodeURIComponent(normalizedEmail)}`,
        );
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-white">
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
      {/* Verify Form */}
      <div className="w-full px-5 flex flex-col items-center justify-center">
        <div className="max-w-xs w-full mx-auto">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Quên mật khẩu
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Nhập Email mà bạn đã quên mật khẩu, chúng tôi sẽ gửi mã OTP để đổi
            mật khẩu mới
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
                  placeholder="Nhập Email"
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRequestingResetOtp}
              className="w-full bg-[#04543D] text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRequestingResetOtp ? (
                <>
                  <span className="inline-block h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                "Lấy mã OTP"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Nguyễn Trọng Quý - CE180596
"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function VerifyResetOTPContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  const { verifyResetOtp, isVerifyingResetOtp } = useAuthStore();
  const [otp, setOtp] = useState("");

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isVerifyingResetOtp || !email) return;

    const result = await verifyResetOtp({ email, otp });
    const token = result?.resetToken;

    if (token) {
      setTimeout(() => {
        router.push(`/reset-password/${token}`);
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
            Password Reset OTP
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Kiểm tra Email cho mã Password Reset OTP
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password Reset OTP
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                  size={18}
                />
                <input
                  placeholder="vd: 0123456"
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingResetOtp}
              className="w-full bg-[#04543D] text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifyingResetOtp ? (
                <>
                  <span className="inline-block h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  <span>Đang xác nhận...</span>
                </>
              ) : (
                "Xác nhận"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

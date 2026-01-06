// Nguyễn Trọng Quý - CE180596
"use client";
import Notification from "@/components/Notification";
import axios from "axios";
import { Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function VerifyEmailPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [notificationSuccessMessage, setNotificationSuccessMessage] =
    useState("");
  const [notificationErrorMessage, setNotificationErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/auth/verify-email`, {
        email,
        otp,
      });
      // Notify user that they have successfully verified their email
      setNotificationSuccessMessage("Đang chuyển hướng đến trang đăng nhập...");
      // 2 second wait before redirecting user to the Login Page
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setNotificationErrorMessage(err);
    } finally {
      setLoading(false);
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
            Xác nhận Email
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Vào Email mà bạn đã đăng ký và điền mã OTP vào đây
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                OTP
              </label>
              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                  size={18}
                />
                <input
                  placeholder="Nhập OTP"
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={"/forgot-password"}
                className="text-xs font-medium text-teal-800 hover:underline"
              >
                Gửi lại mã OTP
              </Link>
            </div>

            {notificationSuccessMessage && (
              <Notification
                type="success"
                title="Xác nhận thành công!"
                message={notificationSuccessMessage}
                onClose={() => setNotificationSuccessMessage("")}
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

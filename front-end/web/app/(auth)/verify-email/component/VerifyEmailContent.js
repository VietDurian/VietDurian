// Nguyễn Trọng Quý - CE180596
"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const OTP_RESEND_DELAY_MS = 10 * 60 * 1000;

function formatRemainingTime(seconds) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainSeconds}`;
}

export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const {
    verifyEmail,
    isVerifyingEmail,
    resendVerificationOtp,
    isResendingOtp,
  } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const resendCooldownKey = useMemo(() => {
    if (!email) return null;
    return `verify_otp_resend_available_at_${email.toLowerCase()}`;
  }, [email]);

  useEffect(() => {
    if (!resendCooldownKey) return;

    const updateCooldown = () => {
      const availableAt = Number(localStorage.getItem(resendCooldownKey) || 0);
      const diffMs = availableAt - Date.now();

      if (diffMs > 0) {
        setRemainingSeconds(Math.ceil(diffMs / 1000));
      } else {
        setRemainingSeconds(0);
        if (availableAt) {
          localStorage.removeItem(resendCooldownKey);
        }
      }
    };

    updateCooldown();
    const intervalId = setInterval(updateCooldown, 1000);

    return () => clearInterval(intervalId);
  }, [resendCooldownKey]);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isVerifyingEmail || !email) return;

    const result = await verifyEmail({ email, otp });
    if (result) {
      router.push("/login");
    }
  };

  const handleResendOtp = async () => {
    if (isResendingOtp) return;
    if (!email) {
      toast.error("Thiếu email để gửi lại OTP");
      return;
    }

    if (remainingSeconds > 0) {
      toast.error(
        `Bạn có thể gửi lại OTP sau ${formatRemainingTime(remainingSeconds)}`,
      );
      return;
    }

    const result = await resendVerificationOtp(email);
    if (result && resendCooldownKey) {
      const nextAvailableAt = Date.now() + OTP_RESEND_DELAY_MS;
      localStorage.setItem(resendCooldownKey, String(nextAvailableAt));
      setRemainingSeconds(Math.ceil(OTP_RESEND_DELAY_MS / 1000));
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
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp || remainingSeconds > 0}
                className="text-xs font-medium text-teal-800 hover:underline disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isResendingOtp
                  ? "Đang gửi lại..."
                  : remainingSeconds > 0
                    ? `Gửi lại sau ${formatRemainingTime(remainingSeconds)}`
                    : "Gửi lại mã OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isVerifyingEmail}
              className="w-full bg-[#04543D] text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifyingEmail ? (
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

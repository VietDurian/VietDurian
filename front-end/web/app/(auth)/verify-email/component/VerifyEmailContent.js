// Nguyễn Trọng Quý - CE180596
"use client";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ChevronDown,
  Shield,
  Briefcase,
  Leaf,
  Mail,
  PenSquare,
  Wrench,
} from "lucide-react";
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
  const [activeRole, setActiveRole] = useState(0);

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-screen font-sans bg-white">
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
      {/* Left Side */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-semibold text-emerald-500 mb-3 text-center text-shadow-md text-shadow-emerald-100">
            Xác nhận Email
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed text-center text-shadow-md text-shadow-gray-200">
            Vào Email mà bạn đã đăng ký và điền mã OTP vào đây
          </p>

          <form
            className="space-y-5 bg-white shadow-xl border border-gray-200 rounded-3xl p-7 w-full max-w-md"
            onSubmit={handleSubmit}
          >
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
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* RIGHT SECTION */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-screen">
        <p className="text-3xl font-bold text-center text-emerald-500 text-shadow-md text-shadow-emerald-100">
          Hoàn thiện đăng ký tài khoản!
        </p>
        <p className="text-1xl text-center text-gray-500 text-shadow-md text-shadow-gray-200">
          Để cần hoàn thiện việc đăng ký tài khoản, bạn phải vào email và nhập
          mã OTP
        </p>

        <div className="grid grid-cols-1 w-full max-w-xl gap-4 mt-6">
          {[
            {
              title: "Xác nhận mail",
              desc: "Vào Email mà bạn đã đăng ký",
              icon: Mail,
              detail:
                "Để hoàn tất việc đăng ký tài khoản, bạn cần phải vào email đã đăng ký, lấy mã OTP và nhập vào để xác nhận.",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            const isOpen = activeRole === index;

            return (
              <div
                key={index}
                onClick={() => setActiveRole(isOpen ? null : index)}
                className={`
          group
          rounded-2xl
          border
          bg-white/60 backdrop-blur-lg
          px-6 py-5
          transition-all duration-300
          cursor-pointer
          hover:shadow-lg hover:-translate-y-0.5
          ${isOpen ? "border-emerald-500 shadow-md" : "border-gray-200"}
        `}
              >
                {/* HEADER */}
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`
              h-12 w-12 flex items-center justify-center
              rounded-xl transition-all
              ${
                isOpen
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200"
              }
            `}
                  >
                    <Icon size={22} />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    <ChevronDown />
                  </div>
                </div>

                {/* EXPAND */}
                <div
                  className={`
            grid transition-all duration-300
            ${
              isOpen
                ? "grid-rows-[1fr] opacity-100 mt-4"
                : "grid-rows-[0fr] opacity-0"
            }
          `}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-gray-200 pt-4 text-sm text-gray-600 leading-relaxed">
                      {item.detail}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

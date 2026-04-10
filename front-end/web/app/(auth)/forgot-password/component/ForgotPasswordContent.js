"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ChevronDown, Lock, Mail, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import FloatingLangToggle from "@/components/FloatingLangToggle";
import { useLanguage } from "@/context/LanguageContext";

export default function ForgotPasswordContent() {
  const router = useRouter();
  const { language } = useLanguage();
  const isVi = language === "vi";
  const { forgotPassword, isRequestingResetOtp } = useAuthStore();
  const [email, setEmail] = useState("");
  const [activeRole, setActiveRole] = useState(0);

  const steps = isVi
    ? [
        {
          title: "Bước 1",
          desc: "Nhập Email",
          icon: Mail,
          detail:
            "Nhập Email mà bạn đã quên mật khẩu, chúng tôi sẽ gửi mã OTP vào email bạn.",
        },
        {
          title: "Bước 2",
          desc: "Nhập mã OTP",
          icon: Shield,
          detail:
            "Kiểm tra mail cho mã OTP và nhập vào khung để tiến hành bước thay đổi mật khẩu",
        },
        {
          title: "Bước 3",
          desc: "Đổi mật khẩu mới",
          icon: Lock,
          detail:
            "Nhập mật khẩu mới và xác nhận mật khẩu mới, cần phải tuân theo luật mật khẩu!",
        },
      ]
    : [
        {
          title: "Step 1",
          desc: "Enter your email",
          icon: Mail,
          detail:
            "Enter the email linked to your account and we will send an OTP to that address.",
        },
        {
          title: "Step 2",
          desc: "Enter OTP code",
          icon: Shield,
          detail:
            "Check your inbox for the OTP and enter it to continue resetting your password.",
        },
        {
          title: "Step 3",
          desc: "Set a new password",
          icon: Lock,
          detail:
            "Enter and confirm your new password, and make sure it follows the password policy.",
        },
      ];

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
      }, 1500);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-screen bg-gray-50 font-sans p-5 pt-15 lg:pt-0 w-full overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
      <FloatingLangToggle />
      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6">
        <Image
          src="/images/VietDurian-logo.png"
          width={110}
          height={50}
          alt="logo"
        />
      </Link>

      {/* Left Section */}
      <div className="w-full flex flex-col items-center justify-center">
        <h1 className="text-3xl font-semibold text-emerald-500 mb-3 text-center text-shadow-md text-shadow-emerald-100">
          {isVi ? "Quên mật khẩu" : "Forgot password"}
        </h1>

        <p className="text-gray-500 text-sm mb-10 leading-relaxed text-center text-shadow-md text-shadow-gray-200">
          {isVi
            ? "Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu"
            : "Enter your registered email to receive an OTP for password reset"}
        </p>

        <form
          className="space-y-5 bg-white shadow-xl border border-gray-200 rounded-3xl p-7 w-full max-w-md"
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>

            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700"
                size={18}
              />

              <input
                type="email"
                placeholder="example@email.com"
                className="
                  w-full border border-emerald-200
                  rounded-lg pl-10 pr-4 py-3 text-sm
                  focus:ring-2 focus:ring-emerald-500
                  outline-none transition-all placeholder:text-gray-400 text-black
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isRequestingResetOtp}
            className="
              w-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer
              text-white py-3.5 rounded-lg
              transition-all
              shadow-md
              disabled:opacity-70
              flex items-center justify-center gap-2
            "
          >
            {isRequestingResetOtp ? (
              <>
                <span className="h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                {isVi ? "Đang gửi OTP..." : "Sending OTP..."}
              </>
            ) : isVi ? (
              "Nhận mã OTP"
            ) : (
              "Get OTP code"
            )}
          </button>
        </form>

        {/* Back login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {isVi ? "Nhớ mật khẩu?" : "Remember your password?"}{" "}
          <Link
            href="/login"
            className="text-emerald-600 font-semibold hover:underline"
          >
            {isVi ? "Đăng nhập" : "Sign in"}
          </Link>
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-col items-center justify-center w-full lg:max-w-2xl">
        <p className="text-3xl font-bold text-center text-emerald-500 text-shadow-md text-shadow-emerald-100">
          {isVi ? "Đừng lo lắng!" : "Don't worry!"}
        </p>
        <p className="text-1xl text-center text-gray-500 text-shadow-md text-shadow-gray-200">
          {isVi
            ? "Chỉ cần làm theo các bước sau đây bạn sẽ có thể đổi mật khẩu của mình"
            : "Just follow these steps and you will be able to reset your password"}
        </p>

        <div className="grid grid-cols-1 w-full max-w-xl gap-4 mt-6">
          {steps.map((item, index) => {
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

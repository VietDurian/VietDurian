// Nguyễn Trọng Quý - CE180596
"use client";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PenSquare,
  Shield,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

function isValidPassword(pwd) {
  const minLength = pwd.length >= 12;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/.test(pwd);

  return (
    minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  );
}

const passwordRules = [
  { id: "length", test: (pwd) => pwd.length >= 12, label: "Ít nhất 12 ký tự" },
  {
    id: "uppercase",
    test: (pwd) => /[A-Z]/.test(pwd),
    label: "Có chữ in hoa",
  },
  {
    id: "lowercase",
    test: (pwd) => /[a-z]/.test(pwd),
    label: "Có chữ thường",
  },
  {
    id: "number",
    test: (pwd) => /\d/.test(pwd),
    label: "Có ít nhất một số",
  },
  {
    id: "special",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/.test(pwd),
    label: "Có ký tự đặc biệt (ví dụ: @, #, $)",
  },
];

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token;
  const router = useRouter();
  const { resetPassword, isResettingPassword } = useAuthStore();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeRole, setActiveRole] = useState(2);

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isResettingPassword) return;
    if (!isValidPassword(newPassword)) {
      toast.error("Mật khẩu mới chưa đúng định dạng");
      return;
    }

    if (!token) {
      toast.error("Token đổi mật khẩu không hợp lệ");
      return;
    }

    const result = await resetPassword({
      token,
      newPassword,
      confirmPassword,
    });

    if (result) {
      setTimeout(() => {
        router.push(`/login`);
      }, 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-screen bg-gray-50 font-sans p-5 pt-15 lg:pt-0 absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
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
      {/* LEFT SECTION: Register Form */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-semibold text-emerald-500 mb-3 text-center text-shadow-md text-shadow-emerald-100">
            Đổi mật khẩu
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed text-center text-shadow-md text-shadow-gray-200">
            Nhập mật khẩu mới và xác nhận mật khẩu mới
          </p>

          <form
            className="space-y-5 bg-white shadow-xl border border-gray-200 rounded-3xl p-7 w-full max-w-md"
            onSubmit={handleSubmit}
          >
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                  size={18}
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                  }
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {/* Password rules checklist */}
                {newPassword && !isValidPassword(newPassword) && (
                  <div className="absolute bg-white mt-3 space-y-1 text-sm z-100 w-full p-5 border-2 border-gray-200 rounded-xl">
                    {passwordRules.map((rule) => {
                      const isValid = rule.test(newPassword);
                      let displayLabel = rule.label;

                      // Speical handling for length rule
                      if (rule.id === "length") {
                        displayLabel = `Ít nhất 12 ký tự (hiện tại: ${newPassword.length})`;
                      }
                      return (
                        <div key={rule.id} className="flex items-center gap-2">
                          {isValid ? (
                            <span className="text-green-600">
                              <Check />
                            </span>
                          ) : (
                            <span className="text-red-500">
                              <X />
                            </span>
                          )}
                          <span
                            className={
                              isValid ? "text-green-600" : "text-red-500"
                            }
                          >
                            {displayLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Confirm New Password */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                  size={18}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                  }
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isResettingPassword}
                className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isResettingPassword ? (
                  <>
                    <span className="inline-block h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    <span>Đang đổi mật khẩu...</span>
                  </>
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-screen">
        <p className="text-3xl font-bold text-center text-emerald-500 text-shadow-md text-shadow-emerald-100">
          Đừng lo lắng!
        </p>
        <p className="text-1xl text-center text-gray-500 text-shadow-md text-shadow-gray-200">
          Chỉ cần làm theo các bước sao đây bạn sẽ có thể đổi mật khẩu của mình
        </p>

        <div className="grid grid-cols-1 w-full max-w-xl gap-4 mt-6">
          {[
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
          hover:shadow-lg hover:-translate-y-[2px]
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

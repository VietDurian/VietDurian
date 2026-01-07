// Nguyễn Trọng Quý - CE180596
"use client";
import Notification from "@/components/Notification";
import axios from "axios";
import { Check, Eye, EyeOff, Lock, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";

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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!isValidPassword(newPassword)) {
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE}/auth/reset-password/${token}`,
        {
          newPassword,
          confirmPassword,
        }
      );
      // Notify user that they have successfully verified their email
      setNotificationSuccessMessage("Đang chuyển hướng đến trang đăng nhập...");
      // 2 second wait before redirecting user to the Login Page
      setTimeout(() => {
        router.push(`/login`);
      }, 2000);
    } catch (err) {
      setNotificationErrorMessage(err.message);
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
      {/* LEFT SECTION: Register Form */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Đổi mật khẩu
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Nhập mật khẩu mới và xác nhận mật khẩu mới
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
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

            {/* Notification */}

            {notificationSuccessMessage && (
              <Notification
                type="success"
                title="Đổi mật khẩu thành công"
                message={notificationSuccessMessage}
                onClose={() => setNotificationSuccessMessage("")}
              />
            )}

            {notificationErrorMessage && (
              <Notification
                type="error"
                title={"Đổi mật khẩu thất bại"}
                message={notificationErrorMessage}
                onClose={() => setNotificationErrorMessage("")}
              />
            )}

            {/* Submit Button */}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-[#04543D] text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading ? (
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

      {/* RIGHT SECTION: Branding & Testimonial */}
      {/* <div className="hidden m-5 rounded-2xl lg:flex w-[55%] bg-[#04543D] relative overflow-hidden flex-col justify-center px-16 xl:px-24">
        <Image
          src={"/images/Durian-login.jpg"}
          fill
          alt="Login page image"
          className="object-cover"
        />
      </div> */}
    </div>
  );
}

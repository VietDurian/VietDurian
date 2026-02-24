// Nguyễn Trọng Quý - CE180596
"use client";
import React, { useState } from "react";
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  User,
  Phone,
  Briefcase,
  Leaf,
  Wrench,
  PenSquare,
  ChevronLeft,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

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

const OTP_RESEND_DELAY_MS = 10 * 60 * 1000;

export default function RegisterPage() {
  const { signup, isSigningUp } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [step, setStep] = useState(1); // 1: info entry, 2: role selection
  const router = useRouter();

  const ROLES = [
    { key: "trader", label: "Trader", icon: Briefcase },
    { key: "farmer", label: "Farmer", icon: Leaf },
    { key: "serviceProvider", label: "Service Provider", icon: Wrench },
    { key: "contentExpert", label: "Content Expert", icon: PenSquare },
  ];

  // Handle Submit Register Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSigningUp) return;
    if (!isValidPassword(password)) {
      setPasswordError("Vui lòng nhập mật khẩu hợp lệ");
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }

    if (!selectedRole) {
      toast.error("Vui lòng chọn vai trò");
      return;
    }

    const result = await signup({
      full_name: fullName,
      email,
      password,
      phone,
      role: selectedRole,
    });

    if (result) {
      const resendCooldownKey = `verify_otp_resend_available_at_${email.toLowerCase()}`;
      localStorage.setItem(
        resendCooldownKey,
        String(Date.now() + OTP_RESEND_DELAY_MS),
      );

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 1500);
    }
  };

  // Password real-time validation
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
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
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Đăng Ký</h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed">
            Hệ thống sầu riêng uy tín, chất lượng Việt Nam
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                {/* Fullname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ Tên
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Nhập họ và tên"
                      className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {/* Email */}
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
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật Khẩu
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                      value={password}
                      onChange={handlePasswordChange}
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
                    {/* Password rules checklist */}
                    {password && !isValidPassword(password) && (
                      <div className="absolute bg-white mt-3 space-y-1 text-sm z-100 w-full p-5 border-2 border-gray-200 rounded-xl">
                        {passwordRules.map((rule) => {
                          const isValid = rule.test(password);
                          let displayLabel = rule.label;

                          // Speical handling for length rule
                          if (rule.id === "length") {
                            displayLabel = `Ít nhất 12 ký tự (hiện tại: ${password.length})`;
                          }
                          return (
                            <div
                              key={rule.id}
                              className="flex items-center gap-2"
                            >
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
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Chọn vai trò
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center text-sm text-teal-800 font-medium hover:underline cursor-pointer"
                  >
                    <ChevronLeft size={24} />
                    Trở lại
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => {
                    const Icon = role.icon;
                    const active = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setSelectedRole(role.key)}
                        className={`flex flex-col items-center gap-2 border rounded-xl p-4 text-sm font-semibold transition-all shadow-sm hover:-translate-y-[2px] cursor-pointer ${
                          active
                            ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                            : "border-gray-200 bg-white text-gray-800"
                        }`}
                      >
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            active ? "bg-emerald-100" : "bg-gray-100"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSigningUp || (step === 2 && !selectedRole)}
                className={`flex-1 bg-[#04543D] text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isSigningUp ? (
                  <>
                    <span className="inline-block h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng ký...</span>
                  </>
                ) : step === 1 ? (
                  "Tiếp tục"
                ) : (
                  "Đăng Ký"
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href={"/login"}
              className="text-teal-800 font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
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

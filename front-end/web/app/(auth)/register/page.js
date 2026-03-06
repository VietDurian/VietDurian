// Nguyễn Trọng Quý - CE180596
"use client";
import React, { useEffect, useRef, useState } from "react";
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
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useValidatorStore } from "@/store/useValidatorStore";

const OTP_RESEND_DELAY_MS = 10 * 60 * 1000;

export default function RegisterPage() {
  const { signup, isSigningUp, checkEmailExists, isCheckingEmail } =
    useAuthStore();
  const { validateField, passwordRules, isValidPassword } = useValidatorStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [step, setStep] = useState(1); // 1: info entry, 2: role selection
  const router = useRouter();
  const [activeRole, setActiveRole] = useState(null);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    role: false,
  });
  const [emailExistsError, setEmailExistsError] = useState("");
  const emailCheckRequestIdRef = useRef(0);

  const ROLES = [
    { key: "trader", label: "Trader", icon: Briefcase },
    { key: "farmer", label: "Farmer", icon: Leaf },
    { key: "serviceProvider", label: "Service Provider", icon: Wrench },
    { key: "contentExpert", label: "Content Expert", icon: PenSquare },
  ];

  const fullNameError = validateField("fullName", fullName);
  const emailError = validateField("email", email);
  const combinedEmailError = emailError || emailExistsError;
  const passwordError = validateField("password", password);
  const confirmPasswordError = !confirmPassword.trim()
    ? "Vui lòng xác nhận mật khẩu"
    : confirmPassword !== password
      ? "Mật khẩu xác nhận không khớp"
      : "";
  const phoneError = validateField("phone", phone);
  const roleError = !selectedRole ? "Vui lòng chọn vai trò" : "";

  const stepOneValid =
    !fullNameError &&
    !combinedEmailError &&
    !passwordError &&
    !confirmPasswordError &&
    !phoneError &&
    !isCheckingEmail;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || emailError) {
      setEmailExistsError("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      const requestId = emailCheckRequestIdRef.current + 1;
      emailCheckRequestIdRef.current = requestId;

      const exists = await checkEmailExists(normalizedEmail);

      if (requestId !== emailCheckRequestIdRef.current) {
        return;
      }

      if (exists === true) {
        setEmailExistsError("Email đã tồn tại");
      } else {
        setEmailExistsError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email, emailError, checkEmailExists]);

  // Handle Submit Register Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSigningUp) return;

    if (step === 1) {
      setTouched((prev) => ({
        ...prev,
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        phone: true,
      }));

      if (!stepOneValid) return;

      setStep(2);
      return;
    }

    if (!selectedRole) {
      setTouched((prev) => ({ ...prev, role: true }));
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

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  const handlePhoneKeyDown = (e) => {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];

    if (
      allowedControlKeys.includes(e.key) ||
      (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) ||
      (e.metaKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
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
        <div className="max-w-xl w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-semibold text-emerald-500 mb-3 text-center text-shadow-md text-shadow-emerald-100">
            Đăng Ký tài khoản
          </h1>

          <form
            className="space-y-3 bg-white shadow-xl border border-gray-200 rounded-3xl p-7"
            onSubmit={handleSubmit}
          >
            {step === 1 && (
              <>
                {/* Fullname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Họ Tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Nhập họ và tên"
                      className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 outline-none transition-all placeholder:text-gray-400 text-black ${
                        touched.fullName && fullNameError
                          ? "border-red-400 focus:ring-red-300"
                          : "border-teal-800/30 focus:ring-teal-800"
                      }`}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      aria-invalid={Boolean(touched.fullName && fullNameError)}
                      required
                    />
                  </div>
                  {touched.fullName && fullNameError && (
                    <p className="mt-1 text-xs text-red-600">{fullNameError}</p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="email"
                      placeholder="Nhập email"
                      className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 outline-none transition-all placeholder:text-gray-400 text-black ${
                        touched.email && combinedEmailError
                          ? "border-red-400 focus:ring-red-300"
                          : "border-teal-800/30 focus:ring-teal-800"
                      }`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleBlur("email")}
                      aria-invalid={Boolean(
                        touched.email && combinedEmailError,
                      )}
                      required
                    />
                  </div>
                  {touched.email && combinedEmailError && (
                    <p className="mt-1 text-xs text-red-600">
                      {combinedEmailError}
                    </p>
                  )}
                  {touched.email && !combinedEmailError && isCheckingEmail && (
                    <p className="mt-1 text-xs text-gray-500">
                      Đang kiểm tra email...
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mật Khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 outline-none transition-all placeholder:text-gray-400 text-black ${
                        touched.password && passwordError
                          ? "border-red-400 focus:ring-red-300"
                          : "border-teal-800/30 focus:ring-teal-800"
                      }`}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => handleBlur("password")}
                      aria-invalid={Boolean(touched.password && passwordError)}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
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
                      <div className="absolute bg-white mt-3 space-y-1 text-sm z-100 w-full p-5 border border-gray-200 rounded-xl">
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

                  {touched.password && passwordError && (
                    <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 outline-none transition-all placeholder:text-gray-400 text-black ${
                        touched.confirmPassword && confirmPasswordError
                          ? "border-red-400 focus:ring-red-300"
                          : "border-teal-800/30 focus:ring-teal-800"
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur("confirmPassword")}
                      aria-invalid={Boolean(
                        touched.confirmPassword && confirmPasswordError,
                      )}
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword
                          ? "Ẩn mật khẩu"
                          : "Hiển thị mật khẩu"
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
                  {touched.confirmPassword && confirmPasswordError && (
                    <p className="mt-1 text-xs text-red-600">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Nhập số điện thoại"
                      className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 outline-none transition-all placeholder:text-gray-400 text-black ${
                        touched.phone && phoneError
                          ? "border-red-400 focus:ring-red-300"
                          : "border-teal-800/30 focus:ring-teal-800"
                      }`}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      onBlur={() => handleBlur("phone")}
                      aria-invalid={Boolean(touched.phone && phoneError)}
                      required
                    />
                  </div>
                  {touched.phone && phoneError && (
                    <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                  )}
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
                        onClick={() => {
                          setSelectedRole(role.key);
                          setTouched((prev) => ({ ...prev, role: true }));
                        }}
                        className={`
                          flex flex-col items-center gap-2
                          rounded-xl p-4 text-sm font-semibold
                          transition-all duration-200
                          shadow-sm cursor-pointer
                          hover:-translate-y-0.5
                          border
                          ${
                            active
                              ? "border-emerald-600 bg-emerald-100 text-emerald-900 shadow-md"
                              : "border-gray-200 bg-white text-emerald-700"
                          }
                            `}
                      >
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                            active ? "bg-emerald-500" : "bg-emerald-100"
                          }`}
                        >
                          <Icon
                            className={`
     flex items-center justify-center
      transition-all
      ${active ? " text-white" : " text-emerald-800"}
    `}
                          />
                        </div>
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
                {touched.role && roleError && (
                  <p className="text-xs text-red-600">{roleError}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              {/* Submit button */}
              <button
                type="submit"
                disabled={
                  isSigningUp ||
                  (step === 1 && !stepOneValid) ||
                  (step === 2 && !selectedRole)
                }
                className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
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

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">
                  Hoặc
                </span>
              </div>
            </div>

            {/* Google Button */}
            <div className="space-y-3">
              <button className="cursor-pointer w-full border border-gray-200 flex items-center justify-center py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                <img
                  src="/images/google.png"
                  alt="Google"
                  width={50}
                  height={50}
                />{" "}
                Tiếp tục với Google
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href={"/login"}
              className="text-emerald-600 font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: Branding & Testimonial */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl min-h-screen">
        <p className="text-3xl font-bold text-center text-emerald-500 text-shadow-md text-shadow-emerald-100">
          Vai trò của chúng tôi
        </p>
        <p className="text-1xl text-center text-gray-500 text-shadow-md text-shadow-gray-200">
          Kết nối người trồng, thương lái và chuyên gia sầu riêng trên một nền
          tảng
        </p>

        <div className="grid grid-cols-1 w-full max-w-xl gap-4 mt-6">
          {[
            {
              title: "Trader",
              desc: "Người thương lái",
              icon: Briefcase,
              detail:
                "Tìm kiếm vườn sầu riêng, kết nối trực tiếp với nông dân và quản lý nguồn hàng hiệu quả.",
            },
            {
              title: "Farmer",
              desc: "Tạo vườn & sản phẩm",
              icon: Leaf,
              detail:
                "Quản lý thông tin vườn, đăng bán sầu riêng và theo dõi quy trình canh tác VietGAP.",
            },
            {
              title: "Service Provider",
              desc: "Dịch vụ nông nghiệp",
              icon: Wrench,
              detail:
                "Cung cấp phân bón, kỹ thuật, vận chuyển và các dịch vụ hỗ trợ sản xuất.",
            },
            {
              title: "Content Expert",
              desc: "Chuyên gia nội dung",
              icon: PenSquare,
              detail:
                "Chia sẻ kiến thức, hướng dẫn kỹ thuật và phát triển cộng đồng sầu riêng.",
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

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
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import FloatingLangToggle from "@/components/FloatingLangToggle";
import { useLanguage } from "@/context/LanguageContext";

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
  const googleButtonContainerRef = useRef(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(0);
  const { loginWithGoogle } = useAuth();
  const { language } = useLanguage();
  const isVi = language === "vi";

  const ROLES = [
    { key: "trader", label: isVi ? "Thương lái" : "Trader", icon: Briefcase },
    { key: "farmer", label: isVi ? "Nông dân" : "Farmer", icon: Leaf },
    {
      key: "serviceProvider",
      label: isVi ? "Nhà cung cấp dịch vụ" : "Service Provider",
      icon: Wrench,
    },
    {
      key: "contentExpert",
      label: isVi ? "Chuyên gia nội dung" : "Content Expert",
      icon: PenSquare,
    },
  ];

  const fullNameError = validateField("fullName", fullName);
  const emailError = validateField("email", email);
  const combinedEmailError = emailError || emailExistsError;
  const passwordError = validateField("password", password);
  const confirmPasswordError = !confirmPassword.trim()
    ? isVi
      ? "Vui lòng xác nhận mật khẩu"
      : "Please confirm your password"
    : confirmPassword !== password
      ? isVi
        ? "Mật khẩu xác nhận không khớp"
        : "Password confirmation does not match"
      : "";
  const phoneError =
    phone.length > 0 && !phone.startsWith("0")
      ? isVi
        ? "Số điện thoại phải bắt đầu bằng 0"
        : "Phone number must start with 0"
      : phone.length > 0 && phone.length < 10
        ? isVi
          ? "Số điện thoại phải có 10 chữ số"
          : "Phone number must have 10 digits"
        : "";
  const roleError = !selectedRole
    ? isVi
      ? "Vui lòng chọn vai trò"
      : "Please select a role"
    : "";

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

    const timeoutId = setTimeout(async () => {
      // Giờ setEmailExistsError nằm trong callback → không còn synchronous nữa
      if (!normalizedEmail || emailError) {
        setEmailExistsError("");
        return;
      }
      const requestId = emailCheckRequestIdRef.current + 1;
      emailCheckRequestIdRef.current = requestId;

      const exists = await checkEmailExists(normalizedEmail);

      if (requestId !== emailCheckRequestIdRef.current) {
        return;
      }

      if (exists === true) {
        setEmailExistsError(isVi ? "Email đã tồn tại" : "Email already exists");
      } else {
        setEmailExistsError("");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email, emailError, checkEmailExists]);

  useEffect(() => {
    if (!googleButtonContainerRef.current) return;

    const updateWidth = () => {
      const containerWidth = googleButtonContainerRef.current?.offsetWidth ?? 0;
      setGoogleButtonWidth(
        Math.min(400, Math.max(200, Math.floor(containerWidth))),
      );
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(googleButtonContainerRef.current);

    return () => observer.disconnect();
  }, []);

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
      toast.error(isVi ? "Vui lòng chọn vai trò" : "Please select a role");
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
    const value = e.target.value;

    // Chỉ cho phép số
    if (!/^\d*$/.test(value)) return;

    // Ký tự đầu bắt buộc là 0
    if (value.length === 1 && value !== "0") return;

    setPhone(value);
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

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-screen bg-gray-50 font-sans p-5 pt-15 lg:pt-0 w-full overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
      <FloatingLangToggle />
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
            {isVi ? "Đăng ký tài khoản" : "Create account"}
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
                    {isVi ? "Họ tên" : "Full name"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={isVi ? "Nhập họ và tên" : "Enter full name"}
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
                      placeholder={isVi ? "Nhập email" : "Enter email"}
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
                      {isVi ? "Đang kiểm tra email..." : "Checking email..."}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isVi ? "Mật khẩu" : "Password"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isVi ? "Nhập mật khẩu" : "Enter password"}
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
                        showPassword
                          ? isVi
                            ? "Ẩn mật khẩu"
                            : "Hide password"
                          : isVi
                            ? "Hiển thị mật khẩu"
                            : "Show password"
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
                    {isVi ? "Xác nhận mật khẩu" : "Confirm password"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={
                        isVi ? "Nhập lại mật khẩu" : "Re-enter password"
                      }
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
                          ? isVi
                            ? "Ẩn mật khẩu"
                            : "Hide password"
                          : isVi
                            ? "Hiển thị mật khẩu"
                            : "Show password"
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
                    {isVi ? "Số điện thoại" : "Phone number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-700"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder={
                        isVi ? "Nhập số điện thoại" : "Enter phone number"
                      }
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
                    {isVi ? "Chọn vai trò" : "Choose a role"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center text-sm text-teal-800 font-medium hover:underline cursor-pointer"
                  >
                    <ChevronLeft size={24} />
                    {isVi ? "Trở lại" : "Back"}
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
                    <span>{isVi ? "Đang đăng ký..." : "Registering..."}</span>
                  </>
                ) : step === 1 ? (
                  isVi ? (
                    "Tiếp tục"
                  ) : (
                    "Continue"
                  )
                ) : isVi ? (
                  "Đăng ký"
                ) : (
                  "Register"
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
                  {isVi ? "Hoặc" : "Or"}
                </span>
              </div>
            </div>

            {/* Google Button */}
            <div
              ref={googleButtonContainerRef}
              className="space-y-3 flex w-full flex-col items-center justify-center"
            >
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log("Login Failed")}
                width={
                  googleButtonWidth ? String(googleButtonWidth) : undefined
                }
              />
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            {isVi ? "Đã có tài khoản?" : "Already have an account?"}{" "}
            <Link
              href={"/login"}
              className="text-emerald-600 font-bold hover:underline"
            >
              {isVi ? "Đăng nhập" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: Branding & Testimonial */}
      <div className="flex flex-col items-center justify-center w-full lg:max-w-2xl">
        <p className="text-3xl font-bold text-center text-emerald-500 text-shadow-md text-shadow-emerald-100">
          {isVi ? "Vai trò của chúng tôi" : "Our roles"}
        </p>
        <p className="text-1xl text-center text-gray-500 text-shadow-md text-shadow-gray-200">
          {isVi
            ? "Kết nối người trồng, thương lái và chuyên gia sầu riêng trên một nền tảng"
            : "Connecting farmers, traders, and durian experts on one platform"}
        </p>

        <div className="grid grid-cols-1 w-full max-w-xl gap-4 mt-6">
          {[
            {
              title: "Trader",
              desc: isVi ? "Người thương lái" : "Buyer and trader",
              icon: Briefcase,
              detail: isVi
                ? "Tìm kiếm vườn sầu riêng, kết nối trực tiếp với nông dân và quản lý nguồn hàng hiệu quả."
                : "Find durian farms, connect directly with farmers, and manage supply effectively.",
            },
            {
              title: "Farmer",
              desc: isVi ? "Tạo vườn & sản phẩm" : "Create farms & products",
              icon: Leaf,
              detail: isVi
                ? "Quản lý thông tin vườn, đăng bán sầu riêng và theo dõi quy trình canh tác VietGAP."
                : "Manage farm information, list durian products, and track VietGAP cultivation processes.",
            },
            {
              title: "Service Provider",
              desc: isVi ? "Dịch vụ nông nghiệp" : "Agriculture services",
              icon: Wrench,
              detail: isVi
                ? "Cung cấp phân bón, kỹ thuật, vận chuyển và các dịch vụ hỗ trợ sản xuất."
                : "Provide fertilizers, techniques, transportation, and other production support services.",
            },
            {
              title: "Content Expert",
              desc: isVi ? "Chuyên gia nội dung" : "Content specialist",
              icon: PenSquare,
              detail: isVi
                ? "Chia sẻ kiến thức, hướng dẫn kỹ thuật và phát triển cộng đồng sầu riêng."
                : "Share knowledge, technical guidance, and help grow the durian community.",
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

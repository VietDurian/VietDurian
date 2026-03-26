"use client";
import React, { useEffect, useState } from "react";
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  ChevronDown,
  Briefcase,
  Leaf,
  Wrench,
  PenSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn, resendVerificationOtp } = useAuthStore();
  const { login: loginContext, user, loading, loginWithGoogle } = useAuth();
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (user.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }, [loading, router, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);

    if (result?.requiresEmailVerification) {
      const normalizedEmail = formData.email?.trim().toLowerCase();

      if (!normalizedEmail) {
        toast.error("Không tìm thấy email để gửi OTP xác minh");
        return;
      }

      await resendVerificationOtp(normalizedEmail);
      router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
      return;
    }

    if (result?.user && result?.token) {
      loginContext(result.user, result.token);
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
      {/* Logo */}
      <Link
        href={"/"}
        className="absolute top-5 left-5 z-50 flex items-center gap-2 mb-16 cursor-pointer"
      >
        <Image
          src={"/images/VietDurian-logo.png"}
          width={100}
          height={50}
          alt="logo"
        />
      </Link>
      {/* LEFT SECTION: Login Form */}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-3xl font-semibold text-emerald-500 mb-3 text-center text-shadow-md text-shadow-emerald-100">
            Chào mừng quay trở lại
          </h1>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed text-center text-shadow-md text-shadow-gray-200">
            Đăng nhập để tiếp tục hành trình của bạn cùng chúng tôi
          </p>

          <form
            className="space-y-5 bg-white shadow-xl border border-gray-200 rounded-3xl p-7"
            onSubmit={handleSubmit}
          >
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
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

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
                  className="w-full border border-teal-800/30 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-teal-800 outline-none transition-all placeholder:text-gray-400 text-black"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href={"/forgot-password"}
                className="text-xs font-medium text-teal-800 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="inline-block h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
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
            <div className="space-y-3 flex flex-col items-center justify-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log("Login Failed")}
                width="390"
              />
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href={"/register"}
              className="text-emerald-600 font-bold hover:underline"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SECTION: Branding & Testimonial */}
      <div className="flex flex-col items-center justify-center w-full lg:max-w-2xl">
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

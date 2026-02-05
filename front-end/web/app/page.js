"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import {
  BookOpen,
  CheckCircle,
  Zap,
  Globe,
  ShoppingCart,
  User,
  Briefcase,
  Package,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const products = [
    {
      id: 1,
      name: "Phân Bón Hữu Cơ Premium",
      description:
        "Phân bón hữu cơ chất lượng cao, giúp cây sầu riêng phát triển khỏe mạnh và cho năng suất cao",
      price: "450.000đ",
      oldPrice: "550.000đ",
      sold: 234,
      likes: "1.2k",
      progress: 70,
      image: "/images/Durian3.jpg",
    },
    {
      id: 2,
      name: "Thuốc Trừ Sâu Sinh Học",
      description:
        "Thuốc trừ sâu sinh học an toàn, thân thiện với môi trường, bảo vệ cây trồng hiệu quả",
      price: "280.000đ",
      oldPrice: "350.000đ",
      sold: 456,
      likes: "890",
      progress: 85,
      image: "/images/Durian4.jpg",
    },
    {
      id: 3,
      name: "Giống Sầu Riêng Monthong",
      description:
        "Giống sầu riêng Monthong chất lượng cao, năng suất ổn định, thích hợp khí hậu Việt Nam",
      price: "1.200.000đ",
      oldPrice: "1.500.000đ",
      sold: 123,
      likes: "2.1k",
      progress: 60,
      image: "/images/Durian5.jpg",
    },
    {
      id: 4,
      name: "Hệ Thống Tưới Nhỏ Giọt",
      description:
        "Hệ thống tưới tự động tiết kiệm nước, tối ưu hiệu quả tưới cho vườn sầu riêng",
      price: "3.500.000đ",
      oldPrice: "4.200.000đ",
      sold: 89,
      likes: "1.5k",
      progress: 55,
      image: "/images/Durian1.jpg",
    },
    {
      id: 5,
      name: "Máy Phun Thuốc Chuyên Dụng",
      description:
        "Máy phun thuốc công suất cao, phun đều, tiết kiệm thời gian và công sức",
      price: "2.800.000đ",
      oldPrice: "3.500.000đ",
      sold: 167,
      likes: "780",
      progress: 75,
      image: "/images/Durian2.jpg",
    },
    {
      id: 6,
      name: "Bộ Test Đất Chuyên Nghiệp",
      description:
        "Bộ dụng cụ test đất giúp kiểm tra độ pH, dinh dưỡng đất chính xác",
      price: "650.000đ",
      oldPrice: "800.000đ",
      sold: 312,
      likes: "1.1k",
      progress: 80,
      image: "/images/Durian6.jpg",
    },
  ];

  const blogs = [
    {
      id: 1,
      title: "Kỹ Thuật Trồng Sầu Riêng Cho Năng Suất Cao",
      date: "31/05/2023",
      image: "/images/Durian1.jpg",
      featured: true,
    },
    {
      id: 2,
      title: "Cách Phòng Trừ Sâu Bệnh Hiệu Quả Cho Sầu Riêng",
      date: "26/05/2023",
      image: "/images/Durian2.jpg",
      featured: false,
    },
    {
      id: 3,
      title: "Bí Quyết Chăm Sóc Sầu Riêng Cho Trái To Đều",
      date: "24/05/2023",
      image: "/images/Durian3.jpg",
      featured: false,
    },
    {
      id: 4,
      title: "Xu Hướng Thị Trường Sầu Riêng Việt Nam",
      date: "18/05/2023",
      image: "/images/Durian4.jpg",
      featured: false,
    },
  ];

  const featuredBlog = blogs.find((blog) => blog.featured);
  const otherBlogs = blogs.filter((blog) => !blog.featured);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (products.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + (products.length - 2)) % (products.length - 2),
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Title - Simple and Professional */}
      <div className="text-center pt-28 pb-4 px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Kết Nối Nông Dân - Dịch Vụ - Thị Trường
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Nền tảng số hóa chuỗi giá trị sầu riêng Việt Nam
        </p>
      </div>

      {/* Image Grid Section with Enhanced Slogan and Buttons */}
      <section className="px-4 lg:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_2fr_0.8fr] gap-6">
          {/* ===== CỘT 1: DÀI TRÊN – NGẮN DƯỚI ===== */}
          <div className="flex flex-col gap-6">
            <div className="relative h-[380px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian1.jpg"
                alt="Trồng sầu riêng"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-[220px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian2.jpg"
                alt="Chăm sóc sầu riêng"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* ===== CỘT 2: SLOGAN + BUTTONS + IMAGES ===== */}
          <div className="flex flex-col">
            {/* Slogan & Buttons */}
            <div className="text-center py-4 mb-6">
              <p className="text-gray-600 text-base max-w-2xl mx-auto mb-8">
                Từ kiến thức kỹ thuật đến sản phẩm chất lượng, cùng kết nối và
                phát triển bền vững
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/san-pham"
                  className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors min-w-[160px] text-center"
                >
                  Sản Phẩm
                </Link>
                <Link
                  href="/huong-dan"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors min-w-[160px] text-center"
                >
                  Hướng Dẫn
                </Link>
              </div>
            </div>

            {/* Images Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end mt-auto">
              <div className="relative h-[320px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <Image
                  src="/images/Durian3.jpg"
                  alt="Lá sầu riêng"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-[220px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <Image
                  src="/images/Durian4.jpg"
                  alt="Cánh đồng"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative h-[320px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                <Image
                  src="/images/Durian5.jpg"
                  alt="Rừng cây"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* ===== CỘT 3: NGẮN TRÊN – DÀI DƯỚI ===== */}
          <div className="flex flex-col gap-6">
            <div className="relative h-[220px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian6.jpg"
                alt="Người trong rừng"
                fill
                className="object-cover"
              />
            </div>

            <div className="relative h-[380px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
              <Image
                src="/images/Durian7.jpg"
                alt="Nấm rừng"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION: HÀNH TRÌNH PHÁT TRIỂN SẦU RIÊNG ===== */}
      <section className="py-20 px-4 lg:px-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hành Trình Từ Vườn Đến Thị Trường
            </h2>
            <p className="text-emerald-100 text-lg max-w-3xl mx-auto">
              Kết nối liền mạch mọi khâu trong chuỗi giá trị sầu riêng Việt Nam
            </p>
          </div>

          {/* Journey Flow */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-[90px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-lime-400 via-yellow-400 to-orange-400"></div>

            {/* Journey Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-lime-400 min-h-[280px] flex flex-col">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Học Hỏi & Nghiên Cứu
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Tiếp cận kiến thức canh tác, kỹ thuật VietGAP, và chia
                        sẻ kinh nghiệm từ cộng đồng nông dân
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-emerald-400 min-h-[280px] flex flex-col">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Trồng Trọt & Chăm Sóc
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Áp dụng AI phát hiện sâu bệnh, quản lý nhật ký canh tác
                        và mua sắm vật tư chất lượng
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-yellow-400 min-h-[280px] flex flex-col">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Kết Nối Thương Mại
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Gặp gỡ nhà phân phối, doanh nghiệp thu mua và tìm kiếm
                        cơ hội xuất khẩu
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-orange-400 min-h-[280px] flex flex-col">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <Globe className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        Phát Triển Bền Vững
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Xây dựng thương hiệu, đảm bảo truy xuất nguồn gốc và
                        nâng cao giá trị sản phẩm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION MỚI: HỆ SINH THÁI KẾT NỐI - ĐÃ ĐƯỢC THIẾT KẾ LẠI ===== */}
      <section className="py-20 px-4 lg:px-6 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-lime-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-emerald-100 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hệ Sinh Thái Kết Nối
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              VietDurian tạo ra những kết nối thực tế giữa Nông Dân, Nhà Cung
              Cấp Dịch Vụ, Thương Nhân và Chuyên Gia trong chuỗi giá trị sầu
              riêng
            </p>
          </div>

          {/* Connection Scenarios */}
          <div className="space-y-12">
            {/* Scenario 1: Farmer ↔ AI (Giải quyết sâu bệnh) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Left: Farmer */}
              <div className="group relative bg-gradient-to-br from-lime-50 to-lime-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Nông Dân
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        Hỏi
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Anh Minh - Tiền Giang
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">
                        Cây tôi bị vàng lá, không biết bệnh gì...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Connection Icon */}
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-14 h-14 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  AI Scan & Tư Vấn
                </div>
              </div>

              {/* Right: AI */}
              <div className="group relative bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-cyan-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <Lightbulb
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        AI Scan
                      </h3>
                      <div className="px-3 py-1 bg-cyan-200 text-cyan-800 text-xs font-semibold rounded-full">
                        Trả lời
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Trí tuệ nhân tạo
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-cyan-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-cyan-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">
                        Đây là bệnh khảm lá. Dùng phương pháp này...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 2: Farmer ↔ Service Provider (Thuê dịch vụ) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Left: Farmer */}
              <div className="group relative bg-gradient-to-br from-lime-50 to-lime-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Nông Dân
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        Cần thuê
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Chị Lan - Đồng Nai
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">
                        Cần thuê đội phun thuốc chuyên nghiệp...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Connection Icon */}
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-14 h-14 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  Thuê Dịch Vụ
                </div>
              </div>

              {/* Right: Service Provider */}
              <div className="group relative bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-indigo-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <Briefcase
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Nhà Cung Cấp Dịch Vụ
                      </h3>
                      <div className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-semibold rounded-full">
                        Sẵn sàng
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Đội Phun Thuốc Xanh
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-indigo-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-indigo-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">
                        Nhận phun thuốc 5ha, thiết bị chuyên nghiệp...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 3: Farmer ↔ Service Provider (Mua vật tư) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Left: Farmer */}
              <div className="group relative bg-gradient-to-br from-lime-50 to-lime-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Nông Dân
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        Cần mua
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Anh Sơn - Bến Tre
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">
                        Cần mua phân bón hữu cơ chứng nhận...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Connection Icon */}
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-14 h-14 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  Mua Vật Tư
                </div>
              </div>

              {/* Right: Service Provider (Supplier) */}
              <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-orange-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <Package
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Nhà Cung Cấp Vật Tư
                      </h3>
                      <div className="px-3 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                        Có hàng
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Công Ty Phân Bón Xanh
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-orange-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-orange-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">
                        Có phân hữu cơ VietGAP, giao tận vườn...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 4: Farmer ↔ Trader (Bán sản phẩm) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Left: Farmer */}
              <div className="group relative bg-gradient-to-br from-lime-50 to-lime-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Nông Dân
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        Cần bán
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Anh Tuấn - Cần Thơ
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">
                        5 tấn sầu riêng Ri6 chuẩn VietGAP cần bán...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Connection Icon */}
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-14 h-14 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  Giao Dịch Minh Bạch
                </div>
              </div>

              {/* Right: Trader */}
              <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-purple-500">
                <div className="relative flex items-start gap-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <ShoppingCart
                      className="w-10 h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Thương Nhân Thu Mua
                      </h3>
                      <div className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                        Mua ngay
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Xuất Khẩu Trái Cây Việt
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-purple-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-purple-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">
                        Nhận mua toàn bộ, giá tốt, thanh toán ngay...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="relative py-16 px-4 lg:px-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 overflow-hidden">
        {/* Background Pattern - giống Hành Trình */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Sản Phẩm Nổi Bật
          </h2>

          {/* Products Carousel Container */}
          <div className="relative px-12">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
            >
              <ChevronLeft
                className="w-6 h-6 text-emerald-900"
                strokeWidth={2.5}
              />
            </button>

            {/* Products Grid */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
              >
                {products.map((product) => (
                  <div key={product.id} className="w-1/3 flex-shrink-0 px-3">
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                      <div className="p-4">
                        <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold text-emerald-600">
                            {product.price}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {product.oldPrice}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Đã bán: {product.sold} sản phẩm</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-lime-400 h-1.5 rounded-full"
                              style={{ width: `${product.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{product.likes} Đánh giá</span>
                          </div>
                          <button className="px-5 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">
                            Mua Ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
            >
              <ChevronRight
                className="w-6 h-6 text-emerald-900"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Blog Mới
          </h2>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Blog - Left Side */}
            {featuredBlog && (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="relative h-[400px]">
                  <Image
                    src={featuredBlog.image}
                    alt={featuredBlog.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredBlog.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {featuredBlog.date}
                    </span>
                    <button className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                      Đọc thêm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Blogs - Right Side */}
            <div className="flex flex-col gap-6">
              {otherBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors flex"
                >
                  <div className="relative w-50 h-40 flex-shrink-0">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {blog.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{blog.date}</span>
                      <button className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors text-sm">
                        Đọc thêm
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

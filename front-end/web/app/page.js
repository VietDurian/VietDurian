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
  HeartHandshake,
  Eye,
  MapPin,
  Weight,
  Sprout,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import AiFloatingButton from "@/components/AiFloatingButton";
import { productAPI, blogAPI } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { authUser, isCheckingAuth } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  useEffect(() => {
    if (isCheckingAuth) return;
    if (!authUser) return;

    const roleRoutes = {
      farmer: "/profile/details",
      trader: "/home/trader",
      serviceProvider: "/profile/details",
      contentExpert: "/profile/details",
    };
    if (roleRoutes[authUser.role]) {
      router.replace(roleRoutes[authUser.role]);
    }
  }, [authUser, isCheckingAuth]);

  // Fetch top 6 sản phẩm theo rating cao nhất
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await productAPI.getAllProducts({
          sortBy: "rating",
          sortOrder: "desc",
          limit: 6,
          page: 1,
        });
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (err) {
        console.error("Error fetching top products:", err);
      }
    };
    fetchTopProducts();
  }, []);

  // Fetch 4 blog mới nhất
  // useEffect(() => {
  //   const fetchLatestBlogs = async () => {
  //     try {
  //       const result = await blogAPI.getAllBlogs({ sort: "newest" });
  //       if (result.code === 200 && result.data) {
  //         setBlogs(result.data.slice(0, 4));
  //       }
  //     } catch (err) {
  //       console.error("Error fetching blogs:", err);
  //     }
  //   };
  //   fetchLatestBlogs();
  // }, []);

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const formatPrice = (price) => {
    const numericPrice =
      typeof price === "object" && price.$numberDecimal
        ? parseFloat(price.$numberDecimal)
        : parseFloat(price);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericPrice);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const maxSlide = Math.max(products.length - 3, 0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (maxSlide + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (maxSlide + 1)) % (maxSlide + 1));
  };

  if (isCheckingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (
    isCheckingAuth ||
    (authUser?.role &&
      ["farmer", "trader", "serviceProvider", "contentExpert"].includes(
        authUser.role,
      ))
  ) {
    return <div className="min-h-screen bg-white"></div>;
  }
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] bg-white/10 rounded-3xl rotate-12"></div>
          <div className="absolute top-16 -right-6 w-56 h-56 bg-white/5 rounded-2xl rotate-6"></div>
          <div className="absolute -bottom-28 -left-20 w-96 h-96 bg-white/10 rounded-3xl -rotate-12"></div>
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-white/5 rounded-xl rotate-45"></div>
          <div className="absolute top-1/3 left-1/6 w-20 h-20 border-2 border-white/20 rounded-xl -rotate-6"></div>
          <div className="absolute top-1/2 right-1/4 w-14 h-14 border-2 border-white/15 rounded-lg rotate-12"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-lg text-white/90 text-sm mb-6 border border-white/20">
            <Sprout className="w-4 h-4" />
            <span>Nền tảng Quản lý Vườn Sầu Riêng #1 Việt Nam</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-sm">
            Nền tảng Sầu Riêng
            <br />
            <span className="text-yellow-300">Minh bạch & Kết nối</span>
          </h1>
          <p className="text-emerald-100 text-xl max-w-2xl mx-auto mb-8">
            Kết nối Nông dân · Thương lái · Dịch vụ · Chuyên gia trong một hệ
            sinh thái sầu riêng thống nhất
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {[
              " Minh bạch quy trình",
              "Kết nối trực tiếp",
              "Xây dựng niềm tin",
            ].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-2 rounded-lg border border-white/20"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Header Title */}
      <div className="text-center pt-28 pb-16 px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Kết Nối Nông Dân - Dịch Vụ - Thị Trường
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Nền tảng số hóa chuỗi giá trị sầu riêng Việt Nam
        </p>
      </div>

      {/* Hero Connection Section */}
      <section className="px-4 lg:px-6 pb-24 flex justify-center items-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "920px", height: "920px" }}
        >
          <div
            className="absolute rounded-full border-4 border-dashed border-emerald-400 animate-spin"
            style={{
              width: "900px",
              height: "900px",
              animationDuration: "40s",
            }}
          ></div>
          <div
            className="absolute rounded-full border-4 border-dashed border-emerald-400 animate-spin"
            style={{
              width: "660px",
              height: "660px",
              animationDuration: "28s",
              animationDirection: "reverse",
            }}
          ></div>
          <div
            className="absolute rounded-full border border-emerald-200"
            style={{
              width: "360px",
              height: "360px",
              background:
                "radial-gradient(circle, #ecfdf5 0%, #d1fae5 60%, #a7f3d0 100%)",
              boxShadow: "0 0 80px 30px rgba(110,231,183,0.25)",
            }}
          ></div>

          <div className="relative z-20 flex flex-col items-center justify-center">
            <div className="w-40 h-40 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl">
              <HeartHandshake
                className="w-24 h-24 text-white"
                strokeWidth={1.5}
              />
            </div>
            <div className="mt-3 px-5 py-1.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
              Kết Nối
            </div>
          </div>

          <div
            className="absolute flex flex-col items-center z-10"
            style={{ top: "66px", left: "396px" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-lime-400 shadow-2xl">
              <img
                src="/images/Durian1.jpg"
                alt="Nông Dân"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 px-3 py-1 bg-lime-400 text-emerald-900 text-xs font-bold rounded-full shadow">
              Nông Dân
            </span>
          </div>

          <div
            className="absolute flex flex-col items-center z-10"
            style={{ top: "231px", left: "682px" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-400 shadow-2xl">
              <img
                src="/images/Durian2.jpg"
                alt="Thị Trường"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 px-3 py-1 bg-orange-400 text-white text-xs font-bold rounded-full shadow">
              Thị Trường
            </span>
          </div>

          <div
            className="absolute flex flex-col items-center z-10"
            style={{ top: "561px", left: "682px" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400 shadow-2xl">
              <img
                src="/images/Durian3.jpg"
                alt="Dịch Vụ"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 px-3 py-1 bg-cyan-400 text-white text-xs font-bold rounded-full shadow">
              Dịch Vụ
            </span>
          </div>

          <div
            className="absolute flex flex-col items-center z-10"
            style={{ top: "716px", left: "396px" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-400 shadow-2xl">
              <img
                src="/images/Durian4.jpg"
                alt="Công Nghệ AI"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 px-3 py-1 bg-purple-400 text-white text-xs font-bold rounded-full shadow">
              Công Nghệ AI
            </span>
          </div>

          <div
            className="absolute flex flex-col items-center z-10"
            style={{ top: "561px", left: "111px" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
              <img
                src="/images/Durian5.jpg"
                alt="sản phẩm"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 px-3 py-1 bg-yellow-400 text-emerald-900 text-xs font-bold rounded-full shadow">
              Sản phẩm
            </span>
          </div>

          <div
            className="absolute flex flex-col items-center z-10"
            style={{ top: "231px", left: "111px" }}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-400 shadow-2xl">
              <img
                src="/images/Durian6.jpg"
                alt="Chuyên Gia"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="mt-2 px-3 py-1 bg-emerald-400 text-white text-xs font-bold rounded-full shadow">
              Chuyên Gia
            </span>
          </div>
        </div>
      </section>

      {/* SECTION: HÀNH TRÌNH PHÁT TRIỂN SẦU RIÊNG */}
      <section className="py-20 px-4 lg:px-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 relative overflow-hidden">
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

          <div className="relative">
            <div className="hidden lg:block absolute top-[90px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-lime-400 via-yellow-400 to-orange-400"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* SECTION: HỆ SINH THÁI KẾT NỐI */}
      <section className="py-20 px-4 lg:px-6 bg-white relative overflow-hidden">
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

          <div className="space-y-12">
            {/* Scenario 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
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

              <div className="hidden lg:flex flex-col items-center justify-center">
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
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  AI Scan & Tư Vấn
                </div>
              </div>

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

            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
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

              <div className="hidden lg:flex flex-col items-center justify-center">
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
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  Thuê Dịch Vụ
                </div>
              </div>

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

            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
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

              <div className="hidden lg:flex flex-col items-center justify-center">
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
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  Mua Vật Tư
                </div>
              </div>

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

            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
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

              <div className="hidden lg:flex flex-col items-center justify-center">
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
                <div className="mt-4 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  Giao Dịch Minh Bạch
                </div>
              </div>

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
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Sản Phẩm Nổi Bật
          </h2>

          {products.length === 0 ? (
            <div className="text-center text-emerald-200 py-10">
              Đang tải sản phẩm...
            </div>
          ) : (
            <div className="relative px-12">
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              >
                <ChevronLeft
                  className="w-6 h-6 text-emerald-900"
                  strokeWidth={2.5}
                />
              </button>

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * 33.333}%)`,
                  }}
                >
                  {products.map((product) => {
                    const rating =
                      typeof product.rating === "object" &&
                      product.rating.$numberDecimal
                        ? parseFloat(product.rating.$numberDecimal)
                        : parseFloat(product.rating || 0);

                    return (
                      <div
                        key={product._id}
                        className="w-1/3 flex-shrink-0 px-3"
                      >
                        <div className="relative group/card cursor-not-allowed">
                          {/* Overlay lock khi hover */}
                          <div className="absolute inset-0 z-10 rounded-lg bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 pointer-events-none">
                            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
                              <svg
                                className="w-7 h-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            <span className="text-white text-sm font-semibold bg-black/30 px-4 py-1.5 rounded-full">
                              Đăng nhập để xem
                            </span>
                          </div>

                          <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
                            <div className="p-5">
                              <div
                                className="relative rounded-xl overflow-hidden bg-gray-100 mb-3"
                                style={{ aspectRatio: "16/9" }}
                              >
                                {product.images && product.images.length > 0 ? (
                                  <Image
                                    src={
                                      imageErrors[product._id]
                                        ? "/images/Durian1.jpg"
                                        : product.images[0].url
                                    }
                                    alt={product.name}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                    onError={() =>
                                      handleImageError(product._id)
                                    }
                                  />
                                ) : (
                                  <Image
                                    src="/images/Durian1.jpg"
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-base text-gray-600 mb-4 line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Eye className="w-4 h-4 text-emerald-600" />
                                  <span>{product.view_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-emerald-600" />
                                  <span>{product.origin}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Weight className="w-4 h-4 text-emerald-600" />
                                  <span>{product.weight}kg</span>
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm text-gray-500">
                                    Giá tham khảo
                                  </p>
                                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                    1 sản phẩm
                                  </span>
                                </div>
                                <span className="text-2xl font-bold text-emerald-600">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">
                                    {rating.toFixed(1)}
                                  </span>
                                </div>
                                <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">
                                  Liên hệ
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Blog Mới
          </h2>
          <p className="text-center text-gray-500 mb-12">
            Kiến thức canh tác sầu riêng từ các chuyên gia hàng đầu
          </p>

          {/* Blogs bị khóa - hiện mock data mờ + overlay */}
          <div className="relative">
            {/* Mock blogs - blur để tạo hiệu ứng preview */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch select-none pointer-events-none"
              style={{ filter: "blur(3px)", opacity: 0.6 }}
            >
              {/* Featured mock blog */}
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">
                <div
                  className="relative w-full bg-gradient-to-br from-emerald-100 to-emerald-200"
                  style={{ aspectRatio: "16/9" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-emerald-400" />
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded mb-2 w-full"></div>
                  <div className="h-4 bg-gray-100 rounded mb-4 w-2/3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-4 bg-emerald-100 rounded w-20"></div>
                  </div>
                </div>
              </div>

              {/* Other mock blogs */}
              <div className="flex flex-col gap-4 h-full">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-1"
                  >
                    <div className="w-32 flex-shrink-0 bg-gradient-to-br from-lime-100 to-emerald-100 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-emerald-300" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded w-20 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlay đăng nhập */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Đăng nhập để đọc Blog
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Truy cập hàng trăm bài viết chuyên sâu về kỹ thuật canh tác,
                  thị trường sầu riêng từ các chuyên gia.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm"
                  >
                    Đăng nhập ngay
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 border border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors text-sm"
                  >
                    Tạo tài khoản
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {<AiFloatingButton />}
      <Footer />
    </div>
  );
}

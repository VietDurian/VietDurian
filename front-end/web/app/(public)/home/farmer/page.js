"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FileText,
  ArrowRight,
  Search,
  Eye,
  PhoneCall,
  TrendingDown,
  ShoppingBag,
  MapPin,
  Truck,
  MessageCircle,
  ClipboardList,
  CheckCircle2,
  Handshake,
  BookOpen,
  ClipboardCheck,
  Star,
  Weight,
  ChevronLeft,
  ChevronRight,
  Gift,
  Sprout,
  Leaf,
  Package,
} from "lucide-react";
import { productAPI, blogAPI } from "@/lib/api";

export default function TraderHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

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

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const result = await blogAPI.getAllBlogs({ sort: "newest" });
        if (result.code === 200 && result.data) {
          setBlogs(result.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchLatestBlogs();
  }, []);

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
  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % (maxSlide + 1));
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + (maxSlide + 1)) % (maxSlide + 1));

  const featuredBlog = blogs[0] || null;
  const otherBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────── */}
      <div className="pt-20 pb-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
              <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
              <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
              <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
            </div>

            <div className="relative z-10 px-8 md:px-16 pt-12 pb-10">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2.5 bg-white/25 backdrop-blur-sm px-5 py-2 rounded-xl text-white text-base font-medium border border-white/30 shadow-lg">
                  <Leaf className="w-5 h-5" />
                  <span>Dành cho Nông dân trồng sầu riêng</span>
                </div>
              </div>

              <div className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow leading-tight">
                  Quản lý Vườn{" "}
                  <span className="text-yellow-300">Sầu Riêng</span>
                  <br />
                </h1>
                <p className="text-emerald-50 text-md max-w-3xl mx-auto">
                  Tạo vườn · Viết nhật ký · Đăng sản phẩm
                </p>
              </div>

              {/* Action cards */}
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Card 1 */}
                <Link
                  href="/profile/gardens/create"
                  className="bg-white rounded-2xl shadow-2xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="bg-linear-to-br from-emerald-500 to-emerald-700 p-5 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-xl rotate-12"></div>
                    <div className="relative flex items-start gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Sprout className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-md font-bold mb-1">
                          Bước 1
                        </div>
                        <h3 className="text-white font-bold text-xl leading-tight">
                          Tạo vườn
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-500 text-sm mb-4">
                      Đăng ký thông tin vườn sầu riêng: vị trí GPS, diện tích,
                      loại giống
                    </p>
                    <ul className="space-y-2 mb-5">
                      {[
                        "Thông tin vị trí GPS",
                        "Diện tích và giống cây",
                        "Mô tả vùng đất",
                      ].map((t) => (
                        <li
                          key={t}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm shadow-md shadow-emerald-500/30">
                      Tạo vườn ngay <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                {/* Card 2 */}
                <Link
                  href="/profile/gardens?diaryGuide=1"
                  className="bg-white rounded-2xl shadow-2xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-xl rotate-12"></div>
                    <div className="relative flex items-start gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-md font-bold mb-1">
                          Bước 2
                        </div>
                        <h3 className="text-white font-bold text-xl leading-tight">
                          Viết nhật ký
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-500 text-sm mb-4">
                      Ghi chép chi tiết từng giai đoạn chăm sóc, phân bón, thuốc
                      BVTV
                    </p>
                    <ul className="space-y-2 mb-5">
                      {[
                        "8 giai đoạn canh tác",
                        "Ghi chi phí thực tế",
                        "Đính kèm hình ảnh",
                      ].map((t) => (
                        <li
                          key={t}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm shadow-md shadow-emerald-500/30">
                      Viết nhật ký <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                {/* Card 3 */}
                <Link
                  href="/profile/products/create"
                  className="bg-white rounded-2xl shadow-2xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-xl rotate-12"></div>
                    <div className="relative flex items-start gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-md font-bold mb-1">
                          Bước 3
                        </div>
                        <h3 className="text-white font-bold text-xl leading-tight">
                          Đăng sản phẩm
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-500 text-sm mb-4">
                      Đăng lô sầu riêng sắp thu hoạch để thương lái liên hệ mua
                    </p>
                    <ul className="space-y-2 mb-5">
                      {[
                        "Thời gian thu hoạch",
                        "Sản lượng ước tính",
                        "Giá bán mong muốn",
                      ].map((t) => (
                        <li
                          key={t}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div
                      href="/profile/products"
                      className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm shadow-md shadow-emerald-500/30"
                    >
                      Tạo sản phẩm <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

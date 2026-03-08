"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AiFloatingButton from "@/components/AiFloatingButton";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sprout,
  Leaf,
  Package,
  Lock,
  FileText,
  Eye,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Truck,
  Handshake,
  ClipboardList,
  Gift,
  Users,
  ShieldCheck,
  BarChart3,
  BadgeCheck,
  PhoneCall,
  TrendingUp,
  Camera,
  NotebookPen,
  Megaphone,
  Weight,
} from "lucide-react";
import { usePermissionStore } from "@/store/usePermissionStore";
import { productAPI, blogAPI } from "@/lib/api";

/* ─── Loại bài viết cho Farmer ─────────────────────────────── */
const FARMER_POST_TYPES = [
  {
    icon: <Package className="w-5 h-5 text-emerald-700" />,
    bg: "bg-emerald-50 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100",
    label: "Sản phẩm",
    desc: "Rao bán lô sầu riêng sắp thu hoạch: giống, sản lượng, giá mong muốn",
    tag: "Phổ biến",
    tagColor: "bg-emerald-500 text-white",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-teal-700" />,
    bg: "bg-teal-50 border-teal-300 hover:border-teal-500 hover:bg-teal-100",
    label: "Kinh nghiệm",
    desc: "Chia sẻ bí quyết, kỹ thuật canh tác sầu riêng từ thực tế vườn nhà",
    tag: "Cộng đồng",
    tagColor: "bg-teal-500 text-white",
  },
  {
    icon: <Truck className="w-5 h-5 text-emerald-800" />,
    bg: "bg-emerald-50 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-100",
    label: "Thuê dịch vụ",
    desc: "Tìm người phun thuốc, bón phân, thu hoạch, vận chuyển cho vườn",
    tag: "Hữu ích",
    tagColor: "bg-emerald-700 text-white",
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-teal-800" />,
    bg: "bg-teal-50 border-teal-300 hover:border-teal-500 hover:bg-teal-100",
    label: "Khác",
    desc: "Hỏi đáp kỹ thuật, thông báo mùa vụ, trao đổi giá cả thị trường",
    tag: "Tự do",
    tagColor: "bg-teal-600 text-white",
  },
];

/* ─── Accordion actions ─────────────────────────────────────── */
const FARMER_ACTIONS = [
  {
    icon: <Sprout className="w-5 h-5 text-white" />,
    title: "Tạo vườn & ghi nhật ký canh tác minh bạch",
    desc: "Đăng ký vườn sầu riêng với vị trí GPS, diện tích, giống cây. Ghi chép đầy đủ 8 giai đoạn canh tác: phân bón, thuốc BVTV, hình ảnh thực tế. Nhật ký minh bạch giúp thương lái tin tưởng, chủ động liên hệ mua.",
    tags: ["Vị trí GPS", "Nhật ký canh tác", "Minh bạch quy trình"],
  },
  {
    icon: <Megaphone className="w-5 h-5 text-white" />,
    title: "Đăng sản phẩm & rao bán lô thu hoạch",
    desc: "Công bố lô sầu riêng sắp thu hoạch với thông tin chi tiết: giống, sản lượng ước tính, thời gian, giá kỳ vọng. Thương lái trong khu vực sẽ chủ động liên hệ — không cần qua môi giới, không mất phí hoa hồng.",
    tags: ["Đăng lô sản phẩm", "Không hoa hồng", "Kết nối thương lái"],
  },
  {
    icon: <FileText className="w-5 h-5 text-white" />,
    title: "Chia sẻ kinh nghiệm & kết nối cộng đồng",
    desc: "Viết bài chia sẻ kỹ thuật canh tác, kinh nghiệm xử lý sâu bệnh, bí quyết tăng năng suất. Đăng bài thuê dịch vụ phun thuốc, bón phân, thu hoạch. Xây dựng uy tín trong cộng đồng nông dân sầu riêng.",
    tags: ["Chia sẻ kinh nghiệm", "Thuê dịch vụ", "Xây dựng uy tín"],
  },
];

/* ─── 3-step process ─────────────────────────────────────────── */
const FARMER_STEPS = [
  {
    step: "01",
    icon: <Sprout className="w-8 h-8" />,
    title: "Tạo vườn & nhật ký",
    color: "from-emerald-400 to-emerald-600",
    glow: "shadow-emerald-500/40",
    desc: "Đăng ký vườn với GPS, diện tích. Ghi nhật ký canh tác từng giai đoạn — phân bón, thuốc, hình ảnh thực tế.",
    highlight: "Minh bạch 100%",
    highlightIcon: <ClipboardList className="w-4 h-4" />,
  },
  {
    step: "02",
    icon: <Package className="w-8 h-8" />,
    title: "Đăng sản phẩm",
    color: "from-yellow-400 to-yellow-500",
    glow: "shadow-yellow-500/40",
    desc: "Công bố lô sầu riêng: giống cây, sản lượng dự kiến, thời gian thu hoạch và giá mong muốn.",
    highlight: "Miễn phí đăng bài",
    highlightIcon: <Gift className="w-4 h-4" />,
  },
  {
    step: "03",
    icon: <Handshake className="w-8 h-8" />,
    title: "Nhận liên hệ & chốt giá",
    color: "from-teal-400 to-emerald-500",
    glow: "shadow-teal-500/40",
    desc: "Thương lái chủ động liên hệ qua chat. Thương lượng giá, đặt lịch thăm vườn, chốt hợp đồng.",
    highlight: "Không qua trung gian",
    highlightIcon: <Handshake className="w-4 h-4" />,
  },
];

/* ─── Accordion ─────────────────────────────────────────────── */
function FarmerAccordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="bg-white py-20 px-4 border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">
            Vai trò của bạn
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Nông dân có thể làm gì?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Nền tảng giúp bạn minh bạch quy trình canh tác, kết nối thương lái và phát triển vườn bền vững
          </p>
        </div>
        <div className="max-w-4xl mx-auto space-y-3">
          {FARMER_ACTIONS.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isOpen ? "border-emerald-300 shadow-lg" : "border-gray-100 shadow-sm"
                  }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : idx)}
                  className={`w-full flex items-center gap-5 px-7 py-6 text-left transition-all duration-300 ${isOpen ? "bg-emerald-500" : "bg-white hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black transition-all duration-300 ${isOpen ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700"
                      }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-white/20" : "bg-emerald-500"
                      }`}
                  >
                    <div className="scale-125">{item.icon}</div>
                  </div>
                  <span
                    className={`font-bold text-lg flex-1 transition-colors duration-300 ${isOpen ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {item.title}
                  </span>
                  <svg
                    className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "text-gray-400"
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60" : "max-h-0"
                    }`}
                >
                  <div className="px-7 py-6 bg-emerald-50 border-t border-emerald-100">
                    <p className="text-gray-600 text-base leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
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

/* ─── Main component ─────────────────────────────────────────── */
export default function FarmerHome() {
  const { isApprovedAccount, checkApprovedAccount } = usePermissionStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    checkApprovedAccount();
  }, [checkApprovedAccount]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await productAPI.getAllProducts({
          sortBy: "rating",
          sortOrder: "desc",
          limit: 6,
          page: 1,
        });
        if (response.success) setProducts(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopProducts();
  }, []);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const result = await blogAPI.getAllBlogs({ sort: "newest" });
        if (result.code === 200 && result.data) setBlogs(result.data.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };
    fetchLatestBlogs();
  }, []);

  const handleImageError = (id) => setImageErrors((prev) => ({ ...prev, [id]: true }));

  const formatPrice = (price) => {
    const n =
      typeof price === "object" && price.$numberDecimal
        ? parseFloat(price.$numberDecimal)
        : parseFloat(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const maxSlide = Math.max(products.length - 3, 0);
  const nextSlide = () => setCurrentSlide((p) => (p + 1) % (maxSlide + 1));
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + (maxSlide + 1)) % (maxSlide + 1));

  const featuredBlog = blogs[0] || null;
  const otherBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="pt-20 pb-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
            {/* Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
              <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
              <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
              <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
              <div className="absolute top-1/3 left-10 w-16 h-16 border-2 border-white/20 rounded-xl -rotate-6"></div>
              <div className="absolute top-2/3 right-24 w-12 h-12 border-2 border-white/15 rounded-lg rotate-12"></div>
            </div>

            <div className="relative z-10 px-8 md:px-16 pt-12 pb-14">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2.5 bg-white/25 backdrop-blur-sm px-5 py-2 rounded-xl text-white text-base font-medium border border-white/30 shadow-lg">
                  <Leaf className="w-5 h-5" />
                  <span>Dành cho Nông dân trồng sầu riêng</span>
                </div>
              </div>

              {/* Headline */}
              <div className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow leading-tight">
                  Quản lý Vườn{" "}
                  <span className="text-yellow-300">Sầu Riêng</span>
                </h1>
                <p className="text-emerald-50 text-lg max-w-2xl mx-auto leading-relaxed">
                  Tạo vườn · Viết nhật ký · Đăng sản phẩm · Chia sẻ kinh nghiệm
                </p>
              </div>

              {/* ── Action area ── */}
              <div className="relative">
                {/* Top row: 3 cards — ServiceProvider green style */}
                <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-5">

                  {/* Card 1 — Tạo vườn */}
                  <Link
                    href="/profile/gardens/create"
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-5 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                      <div className="relative z-10 flex items-start gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
                          <Sprout className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/30 mb-1 uppercase tracking-wide">
                            Bước 1
                          </div>
                          <h3 className="text-white font-bold text-lg leading-tight">Tạo vườn</h3>
                          <p className="text-emerald-50 text-[13px] mt-0.5">Đăng ký vườn sầu riêng của bạn</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white flex flex-col flex-1">
                      <p className="text-gray-500 text-sm mb-4">
                        Đăng ký thông tin vườn sầu riêng: vị trí GPS, diện tích, loại giống
                      </p>
                      <ul className="space-y-2.5 flex-1">
                        {["Thông tin vị trí GPS", "Diện tích và giống cây", "Mô tả vùng đất"].map((t) => (
                          <li key={t} className="group/list flex items-center gap-3 text-[13px] font-medium text-gray-700">
                            <span className="w-7 h-7 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover/list:bg-emerald-500 group-hover/list:text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                            <span className="group-hover/list:text-emerald-700 transition-colors">{t}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-md mt-6">
                        <Sprout className="w-5 h-5 transition-transform group-hover/btn:rotate-12" />
                        Tạo vườn ngay
                      </div>
                    </div>
                  </Link>

                  {/* Card 2 — Viết nhật ký */}
                  <Link
                    href="/profile/gardens?diaryGuide=1"
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-5 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                      <div className="relative z-10 flex items-start gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
                          <BookOpen className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/30 mb-1 uppercase tracking-wide">
                            Bước 2
                          </div>
                          <h3 className="text-white font-bold text-lg leading-tight">Viết nhật ký</h3>
                          <p className="text-emerald-50 text-[13px] mt-0.5">Ghi chép từng giai đoạn canh tác</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white flex flex-col flex-1">
                      <p className="text-gray-500 text-sm mb-4">
                        Ghi chép chi tiết từng giai đoạn chăm sóc, phân bón, thuốc BVTV
                      </p>
                      <ul className="space-y-2.5 flex-1">
                        {["8 giai đoạn canh tác", "Ghi chi phí thực tế", "Đính kèm hình ảnh"].map((t) => (
                          <li key={t} className="group/list flex items-center gap-3 text-[13px] font-medium text-gray-700">
                            <span className="w-7 h-7 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover/list:bg-emerald-500 group-hover/list:text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                            <span className="group-hover/list:text-emerald-700 transition-colors">{t}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-md mt-6">
                        <BookOpen className="w-5 h-5" />
                        Viết nhật ký
                      </div>
                    </div>
                  </Link>

                  {/* Card 3 — Đăng sản phẩm */}
                  <Link
                    href="/profile/products/create"
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10"
                  >
                    <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-5 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                      <div className="relative z-10 flex items-start gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
                          <Package className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/30 mb-1 uppercase tracking-wide">
                            Bước 3
                          </div>
                          <h3 className="text-white font-bold text-lg leading-tight">Đăng sản phẩm</h3>
                          <p className="text-emerald-50 text-[13px] mt-0.5">Rao bán lô thu hoạch cho thương lái</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white flex flex-col flex-1">
                      <p className="text-gray-500 text-sm mb-4">
                        Đăng lô sầu riêng sắp thu hoạch để thương lái liên hệ mua
                      </p>
                      <ul className="space-y-2.5 flex-1">
                        {["Thời gian thu hoạch", "Sản lượng ước tính", "Giá bán mong muốn"].map((t) => (
                          <li key={t} className="group/list flex items-center gap-3 text-[13px] font-medium text-gray-700">
                            <span className="w-7 h-7 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover/list:bg-emerald-500 group-hover/list:text-white">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                            <span className="group-hover/list:text-emerald-700 transition-colors">{t}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-md mt-6">
                        <Package className="w-5 h-5 transition-transform group-hover/btn:-rotate-6" />
                        Tạo sản phẩm
                      </div>
                    </div>
                  </Link>

                </div>

                {/* Bottom row: full-width post card (style = trader) */}
                <div className="max-w-5xl mx-auto">
                  <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-yellow-500/10">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 p-6 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-amber-600/20 rounded-full blur-xl -mb-10 pointer-events-none"></div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/30">
                          <FileText className="w-7 h-7 text-white drop-shadow-md" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-white leading-tight">
                              Tạo bài viết cộng đồng
                            </h2>
                          </div>
                          <p className="text-yellow-50 text-sm">
                            Chia sẻ kinh nghiệm, rao sản phẩm, tìm dịch vụ và kết nối với cộng đồng nông dân
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 bg-white">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center mb-5">
                        Bạn có thể đăng loại bài nào?
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                        {FARMER_POST_TYPES.map((f) => (
                          <div
                            key={f.label}
                            className={`group/item relative ${f.bg} border rounded-2xl p-4 cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center`}
                          >
                            <span
                              className={`absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${f.tagColor}`}
                            >
                              {f.tag}
                            </span>
                            <div className="mb-2 mt-1 transition-transform transform group-hover/item:scale-110 duration-300">
                              {f.icon}
                            </div>
                            <div className="font-bold text-gray-800 text-sm mb-1.5">{f.label}</div>
                            <div className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">
                              {f.desc}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Link
                        href="/profile/posts/create"
                        className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-lg shadow-yellow-500/25"
                      >
                        <FileText className="w-5 h-5 transition-transform group-hover/btn:-rotate-6" />
                        Tạo bài viết ngay
                        <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Overlay khi chưa approved */}
                {!isApprovedAccount && (
                  <div className="absolute border border-white/50 inset-0 backdrop-blur-md bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 z-20">
                    <div className="p-5 bg-white rounded-xl shadow">
                      <Lock />
                    </div>
                    <p className="font-bold text-center text-white">Cần xác thực CCCD</p>
                    <p className="text-md text-white/80 text-center">
                      Xác thực căn cước công dân để mở khóa tính năng này
                    </p>
                    <Link
                      href="/submit-proof"
                      className="flex items-center gap-2 bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                      Xác thực ngay <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nông dân có thể làm gì? — ACCORDION ── */}
      <FarmerAccordion />

      {/* ── Quy trình bán hàng ── */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-yellow-400/30 uppercase tracking-widest">
              3 bước đơn giản
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Quy trình bán sầu riêng
            </h2>
            <p className="text-emerald-300 max-w-xl mx-auto">
              Tạo vườn · Đăng sản phẩm · Nhận liên hệ từ thương lái
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-yellow-400 via-emerald-400 to-yellow-400 z-0"></div>
            {FARMER_STEPS.map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center px-6 relative z-10">
                <div
                  className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-2xl ${s.glow} mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 group`}
                >
                  <div className="-rotate-3 group-hover:rotate-0 transition-transform duration-300 flex flex-col items-center gap-1">
                    <span className="text-white/70 text-xs font-black tracking-widest">{s.step}</span>
                    <div className="text-white">{s.icon}</div>
                  </div>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-emerald-300 text-sm leading-relaxed mb-5">{s.desc}</p>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full">
                  {s.highlightIcon}
                  {s.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Giống sầu riêng phổ biến ── */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">
              Thị trường
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Giống sầu riêng thương lái đang tìm mua
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Đăng vườn của bạn và để thương lái chủ động liên hệ — không cần chờ đến mùa vụ mới tìm đầu ra
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <Leaf className="w-6 h-6 text-emerald-600" />,
                name: "Musang King (Mao Shan Wang)",
                demand: "Giá cao nhất thị trường",
                desc: "Giống cao cấp, thịt vàng đậm, hương thơm đặc trưng — thương lái xuất khẩu luôn thu mua ưu tiên.",
              },
              {
                icon: <Leaf className="w-6 h-6 text-emerald-600" />,
                name: "Ri6 (Sáu Ri)",
                demand: "Sản lượng lớn nhất",
                desc: "Giống phổ biến nhất Việt Nam, thu hoạch nhiều vụ/năm, thị trường nội địa và xuất khẩu đều tiêu thụ mạnh.",
              },
              {
                icon: <Leaf className="w-6 h-6 text-emerald-600" />,
                name: "Monthong (Thái)",
                demand: "Xuất khẩu tốt",
                desc: "Cơm dày, vị ngọt nhẹ, ít mùi — được ưa chuộng tại thị trường Trung Quốc, Nhật Bản.",
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                name: "Sầu riêng hữu cơ / VietGAP",
                demand: "Giá premium +20–30%",
                desc: "Vườn đạt chứng nhận an toàn thực phẩm được thu mua với giá cao hơn, ưu tiên xuất khẩu chính ngạch.",
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
                name: "Lô sản lượng lớn (>10 tấn)",
                demand: "Ký hợp đồng trước vụ",
                desc: "Thương lái và doanh nghiệp xuất khẩu tìm vườn liên kết, đặt cọc và ký hợp đồng trước mùa thu hoạch.",
              },
              {
                icon: <PhoneCall className="w-6 h-6 text-emerald-600" />,
                name: "Thu hoạch gấp / linh hoạt",
                demand: "Chốt nhanh trong ngày",
                desc: "Vườn cần bán nhanh trước thu hoạch — thương lái sẵn sàng thương lượng giá tốt, thanh toán ngay.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{t.name}</h3>
                    <span className="text-emerald-600 text-xs font-semibold">{t.demand}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lợi ích nền tảng ── */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">
              Tại sao chọn chúng tôi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Lợi ích khi tham gia nền tảng
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Tại sao nông dân chọn DurianFarm để quản lý vườn và bán hàng?
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-emerald-900" />,
                num: "01",
                title: "Minh bạch tạo niềm tin",
                desc: "Nhật ký canh tác công khai giúp thương lái tin tưởng chất lượng vườn trước khi đến thực địa. Vườn có nhật ký đầy đủ được thu mua với giá tốt hơn và ít bị ép giá.",
                tags: ["Nhật ký minh bạch", "Giá tốt hơn"],
              },
              {
                icon: <Users className="w-8 h-8 text-emerald-900" />,
                num: "02",
                title: "Kết nối trực tiếp thương lái",
                desc: "Không cần qua môi giới, thương lái liên hệ trực tiếp qua chat. Mở rộng đầu ra, không còn phụ thuộc vào một mối thu mua duy nhất, tăng lợi nhuận đáng kể.",
                tags: ["Không môi giới", "Nhiều đầu ra"],
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-emerald-900" />,
                num: "03",
                title: "Quản lý vườn khoa học",
                desc: "Theo dõi tiến trình canh tác, chi phí thực tế, sản lượng dự kiến theo từng mùa vụ. Dữ liệu giúp lập kế hoạch sản xuất và tối ưu chi phí đầu vào.",
                tags: ["Theo dõi chi phí", "Kế hoạch mùa vụ"],
              },
            ].map((a) => (
              <div
                key={a.title}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="h-1.5 bg-emerald-500"></div>
                <div className="p-7">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {a.icon}
                    </div>
                    <span className="text-6xl font-black text-emerald-200 leading-none">{a.num}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-emerald-700 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{a.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {a.tags.map((t) => (
                      <span
                        key={t}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sản phẩm nổi bật ── */}
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
            <div className="text-center text-emerald-200 py-10">Đang tải sản phẩm...</div>
          ) : (
            <div className="relative px-12">
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              >
                <ChevronLeft className="w-6 h-6 text-emerald-900" strokeWidth={2.5} />
              </button>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
                >
                  {products.map((product) => {
                    const rating =
                      typeof product.rating === "object" && product.rating.$numberDecimal
                        ? parseFloat(product.rating.$numberDecimal)
                        : parseFloat(product.rating || 0);
                    return (
                      <div key={product._id} className="w-1/3 flex-shrink-0 px-3">
                        <Link href={`/products/${product._id}`}>
                          <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 cursor-pointer group">
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
                                    onError={() => handleImageError(product._id)}
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
                                  <p className="text-sm text-gray-500">Giá tham khảo</p>
                                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">1 sản phẩm</span>
                                </div>
                                <span className="text-2xl font-bold text-emerald-600">
                                  {formatPrice(product.price)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{rating.toFixed(1)}</span>
                                </div>
                                <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">
                                  Liên hệ
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              >
                <ChevronRight className="w-6 h-6 text-emerald-900" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Blog Kiến Thức ── */}
      <section className="py-16 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Blog Kiến Thức Mới Nhất
          </h2>
          {blogs.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Đang tải bài viết...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {featuredBlog && (
                <Link href={`/blogs/${featuredBlog._id}`} className="block h-full">
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                    <div
                      className="relative w-full overflow-hidden bg-gray-100"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <Image
                        src={featuredBlog.image || "/images/Durian1.jpg"}
                        alt={featuredBlog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 flex-shrink-0">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                        {featuredBlog.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatDate(featuredBlog.created_at)}
                        </span>
                        <span className="text-emerald-600 font-medium">Đọc thêm</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              <div className="flex flex-col h-full">
                {otherBlogs.map((blog, idx) => (
                  <Link
                    href={`/blogs/${blog._id}`}
                    key={blog._id}
                    className={`block flex-1 ${idx < otherBlogs.length - 1 ? "mb-4" : ""}`}
                  >
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex cursor-pointer h-full">
                      <div className="relative w-40 flex-shrink-0 overflow-hidden bg-gray-100">
                        <Image
                          src={blog.image || "/images/Durian2.jpg"}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                          {blog.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">{formatDate(blog.created_at)}</span>
                          <span className="text-emerald-600 font-medium text-sm flex-shrink-0 ml-2">
                            Đọc thêm
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-emerald-500 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Bắt đầu quản lý vườn ngay hôm nay
          </h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Tạo vườn, viết nhật ký canh tác và để thương lái chủ động tìm đến bạn
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/profile/gardens/create"
              className="inline-flex items-center gap-3 bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold transition-colors shadow-xl"
            >
              <Sprout className="w-5 h-5" />
              Tạo vườn ngay
            </Link>
            <Link
              href="/profile/posts/create"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl"
            >
              <FileText className="w-5 h-5" />
              Tạo bài viết cộng đồng
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      <AiFloatingButton />
    </div>
  );
}
"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { productAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    checkAuth();
    console.log("AUTH CHECKED");
  }, [checkAuth]);

  useEffect(() => {
    if (isCheckingAuth) return;
    if (!authUser) return;
    if (pathname !== "/") return;
    const roleRoutes = {
      admin: "/dashboard",
      farmer: "/profile/details",
      trader: "/profile/details",
      serviceProvider: "/profile/details",
      contentExpert: "/profile/details",
    };
    if (roleRoutes[authUser.role]) {
      router.replace(roleRoutes[authUser.role]);
    }
  }, [authUser, isCheckingAuth, pathname, router]);

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

  // Responsive slides per view
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };
    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
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

  const maxSlide = Math.max(products.length - slidesPerView, 0);
  const nextSlide = () =>
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  if (isCheckingAuth)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (
    isCheckingAuth ||
    (authUser?.role &&
      [
        "admin",
        "farmer",
        "trader",
        "serviceProvider",
        "contentExpert",
      ].includes(authUser.role))
  ) {
    return <div className="min-h-screen bg-white"></div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-md h-112 bg-white/10 rounded-3xl rotate-12"></div>
          <div className="absolute top-16 -right-6 w-56 h-56 bg-white/5 rounded-2xl rotate-6"></div>
          <div className="absolute -bottom-28 -left-20 w-96 h-96 bg-white/10 rounded-3xl -rotate-12"></div>
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-white/5 rounded-xl rotate-45"></div>
          <div className="absolute top-1/3 left-1/6 w-20 h-20 border-2 border-white/20 rounded-xl -rotate-6"></div>
          <div className="absolute top-1/2 right-1/4 w-14 h-14 border-2 border-white/15 rounded-lg rotate-12"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 sm:pt-28 pb-14 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-lg text-white/90 text-sm mb-6 border border-white/20">
            <Sprout className="w-4 h-4" />
            <span>{t("hero_badge")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-sm">
            {t("hero_title")}
            <br />
            <span className="text-yellow-300">{t("hero_title_highlight")}</span>
          </h1>
          <p className="text-emerald-100 text-base sm:text-xl max-w-2xl mx-auto mb-8">
            {t("hero_description")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm">
            {["hero_tag_transparent", "hero_tag_direct", "hero_tag_trust"].map(
              (key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 bg-white/15 text-white px-3 sm:px-4 py-2 rounded-lg border border-white/20 text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  {t(key)}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Header Title */}
      <div className="text-center pt-16 sm:pt-28 pb-10 sm:pb-16 px-6 sm:px-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {t("header_title")}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          {t("header_subtitle")}
        </p>
      </div>

      {/* Hero Connection Section */}
      <section className="px-4 lg:px-6 pb-16 sm:pb-24 flex justify-center items-center overflow-hidden">
        {/* Desktop: full circle layout */}
        <div
          className="hidden lg:flex relative items-center justify-center"
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
            <div className="w-40 h-40 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl">
              <HeartHandshake
                className="w-24 h-24 text-white"
                strokeWidth={1.5}
              />
            </div>
            <div className="mt-3 px-5 py-1.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
              {t("ecosystem_center")}
            </div>
          </div>

          {[
            {
              top: "66px",
              left: "396px",
              img: "/images/Durian1.jpg",
              key: "node_farmer",
              border: "border-lime-400",
              bg: "bg-lime-400",
              text: "text-emerald-900",
            },
            {
              top: "231px",
              left: "682px",
              img: "/images/Durian2.jpg",
              key: "node_market",
              border: "border-orange-400",
              bg: "bg-orange-400",
              text: "text-white",
            },
            {
              top: "561px",
              left: "682px",
              img: "/images/Durian3.jpg",
              key: "node_service",
              border: "border-cyan-400",
              bg: "bg-cyan-400",
              text: "text-white",
            },
            {
              top: "716px",
              left: "396px",
              img: "/images/Durian4.jpg",
              key: "node_ai",
              border: "border-purple-400",
              bg: "bg-purple-400",
              text: "text-white",
            },
            {
              top: "561px",
              left: "111px",
              img: "/images/Durian5.jpg",
              key: "node_product",
              border: "border-yellow-400",
              bg: "bg-yellow-400",
              text: "text-emerald-900",
            },
            {
              top: "231px",
              left: "111px",
              img: "/images/Durian6.jpg",
              key: "node_expert",
              border: "border-emerald-400",
              bg: "bg-emerald-400",
              text: "text-white",
            },
          ].map((node) => (
            <div
              key={node.key}
              className="absolute flex flex-col items-center z-10"
              style={{ top: node.top, left: node.left }}
            >
              <div
                className={`w-32 h-32 rounded-full overflow-hidden border-4 ${node.border} shadow-2xl`}
              >
                <Image
                  src={node.img}
                  alt={t(node.key)}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`mt-2 px-3 py-1 ${node.bg} ${node.text} text-xs font-bold rounded-full shadow`}
              >
                {t(node.key)}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile/Tablet: grid layout thay thế vòng tròn */}
        <div className="lg:hidden w-full max-w-lg mx-auto">
          {/* Center icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-2xl">
              <HeartHandshake
                className="w-14 h-14 text-white"
                strokeWidth={1.5}
              />
            </div>
            <div className="mt-3 px-5 py-1.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
              {t("ecosystem_center")}
            </div>
          </div>
          {/* Nodes grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                img: "/images/Durian1.jpg",
                key: "node_farmer",
                border: "border-lime-400",
                bg: "bg-lime-400",
                text: "text-emerald-900",
              },
              {
                img: "/images/Durian2.jpg",
                key: "node_market",
                border: "border-orange-400",
                bg: "bg-orange-400",
                text: "text-white",
              },
              {
                img: "/images/Durian3.jpg",
                key: "node_service",
                border: "border-cyan-400",
                bg: "bg-cyan-400",
                text: "text-white",
              },
              {
                img: "/images/Durian4.jpg",
                key: "node_ai",
                border: "border-purple-400",
                bg: "bg-purple-400",
                text: "text-white",
              },
              {
                img: "/images/Durian5.jpg",
                key: "node_product",
                border: "border-yellow-400",
                bg: "bg-yellow-400",
                text: "text-emerald-900",
              },
              {
                img: "/images/Durian6.jpg",
                key: "node_expert",
                border: "border-emerald-400",
                bg: "bg-emerald-400",
                text: "text-white",
              },
            ].map((node) => (
              <div key={node.key} className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 ${node.border} shadow-xl`}
                >
                  <Image
                    src={node.img}
                    alt={t(node.key)}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`mt-2 px-3 py-1 ${node.bg} ${node.text} text-xs font-bold rounded-full shadow text-center`}
                >
                  {t(node.key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: HÀNH TRÌNH */}
      <section className="py-16 sm:py-20 px-4 lg:px-6 bg-emerald-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="max-w-350 mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {t("journey_title")}
            </h2>
            <p className="text-emerald-100 text-base sm:text-lg max-w-3xl mx-auto">
              {t("journey_subtitle")}
            </p>
          </div>
          <div className="relative">
            {/* Timeline line chỉ hiện ở lg trở lên */}
            <div className="hidden lg:block absolute top-22.5 left-[10%] right-[10%] h-1 bg-linear-to-r from-lime-400 via-yellow-400 to-orange-400"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <BookOpen className="w-10 h-10 text-white" />,
                  border: "border-lime-400",
                  grad: "from-lime-400 to-lime-500",
                  titleKey: "journey_learn_title",
                  descKey: "journey_learn_desc",
                },
                {
                  icon: <CheckCircle className="w-10 h-10 text-white" />,
                  border: "border-emerald-400",
                  grad: "from-emerald-400 to-emerald-500",
                  titleKey: "journey_grow_title",
                  descKey: "journey_grow_desc",
                },
                {
                  icon: <Zap className="w-10 h-10 text-white" />,
                  border: "border-yellow-400",
                  grad: "from-yellow-400 to-yellow-500",
                  titleKey: "journey_trade_title",
                  descKey: "journey_trade_desc",
                },
                {
                  icon: <Globe className="w-10 h-10 text-white" />,
                  border: "border-orange-400",
                  grad: "from-orange-400 to-orange-500",
                  titleKey: "journey_sustain_title",
                  descKey: "journey_sustain_desc",
                },
              ].map((step) => (
                <div key={step.titleKey} className="relative">
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border-t-4 ${step.border} min-h-60 sm:min-h-70 flex flex-col`}
                  >
                    <div className="flex justify-center mb-4">
                      <div
                        className={`w-20 h-20 bg-linear-to-br ${step.grad} rounded-full flex items-center justify-center shadow-lg relative z-10`}
                      >
                        {step.icon}
                      </div>
                    </div>
                    <div className="text-center flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {t(step.titleKey)}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {t(step.descKey)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: HỆ SINH THÁI KẾT NỐI */}
      <section className="py-16 sm:py-20 px-4 lg:px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-lime-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-emerald-100 rounded-full opacity-20 blur-3xl"></div>
        </div>
        <div className="max-w-350 mx-auto relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("connection_title")}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
              {t("connection_subtitle")}
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {/* Scenario 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center">
              <div className="group relative bg-linear-to-br from-lime-50 to-lime-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("scenario_farmer")}
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        {t("scenario_ask")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s1_farmer_name")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">{t("s1_farmer_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Mobile connector arrow */}
              <div className="flex lg:hidden items-center justify-center py-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  <div className="px-4 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-xs shadow-md">
                    {t("s1_connector")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
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
                <div className="mt-4 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  {t("s1_connector")}
                </div>
              </div>
              <div className="group relative bg-linear-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-cyan-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <Lightbulb
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("s1_responder_title")}
                      </h3>
                      <div className="px-3 py-1 bg-cyan-200 text-cyan-800 text-xs font-semibold rounded-full">
                        {t("scenario_reply")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s1_responder_subtitle")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-cyan-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-cyan-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">{t("s1_responder_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-linear-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-linear-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center">
              <div className="group relative bg-linear-to-br from-lime-50 to-lime-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("scenario_farmer")}
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        {t("scenario_need_hire")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s2_farmer_name")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">{t("s2_farmer_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex lg:hidden items-center justify-center py-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  <div className="px-4 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-xs shadow-md">
                    {t("s2_connector")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
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
                <div className="mt-4 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  {t("s2_connector")}
                </div>
              </div>
              <div className="group relative bg-linear-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-indigo-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <Briefcase
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("s2_responder_title")}
                      </h3>
                      <div className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-semibold rounded-full">
                        {t("scenario_ready")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s2_responder_subtitle")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-indigo-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-indigo-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">{t("s2_responder_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-linear-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-linear-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center">
              <div className="group relative bg-linear-to-br from-lime-50 to-lime-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("scenario_farmer")}
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        {t("scenario_need_buy")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s3_farmer_name")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">{t("s3_farmer_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex lg:hidden items-center justify-center py-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  <div className="px-4 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-xs shadow-md">
                    {t("s3_connector")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
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
                <div className="mt-4 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  {t("s3_connector")}
                </div>
              </div>
              <div className="group relative bg-linear-to-br from-orange-50 to-orange-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-orange-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <Package
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("s3_responder_title")}
                      </h3>
                      <div className="px-3 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                        {t("scenario_in_stock")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s3_responder_subtitle")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-orange-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-orange-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">{t("s3_responder_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-16 bg-linear-to-r from-transparent via-emerald-300 to-emerald-400 rounded"></div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <div className="h-1 w-16 bg-linear-to-r from-emerald-400 via-emerald-300 to-transparent rounded"></div>
              </div>
            </div>

            {/* Scenario 4 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-center">
              <div className="group relative bg-linear-to-br from-lime-50 to-lime-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-lime-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <User
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("scenario_farmer")}
                      </h3>
                      <div className="px-3 py-1 bg-lime-200 text-lime-800 text-xs font-semibold rounded-full">
                        {t("scenario_need_sell")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s4_farmer_name")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-l-3 border-lime-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 left-3 w-5 h-5 text-lime-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="italic pl-6">{t("s4_farmer_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex lg:hidden items-center justify-center py-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  <div className="px-4 py-1.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-xs shadow-md">
                    {t("s4_connector")}
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
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
                <div className="mt-4 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold text-sm shadow-md">
                  {t("s4_connector")}
                </div>
              </div>
              <div className="group relative bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-r-4 border-purple-500">
                <div className="relative flex items-start gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform group-hover:scale-105 transition-transform">
                    <ShoppingCart
                      className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {t("s4_responder_title")}
                      </h3>
                      <div className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                        {t("scenario_buy_now")}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      {t("s4_responder_subtitle")}
                    </p>
                    <div className="bg-white rounded-xl p-4 text-sm text-gray-700 border-r-3 border-purple-500 relative shadow-sm">
                      <svg
                        className="absolute top-3 right-3 w-5 h-5 text-purple-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.57-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
                      </svg>
                      <p className="italic pr-6">{t("s4_responder_msg")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="relative py-12 sm:py-16 px-4 lg:px-6 bg-emerald-500 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="max-w-350 mx-auto relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12">
            {t("products_title")}
          </h2>
          {products.length === 0 ? (
            <div className="text-center text-emerald-200 py-10">
              {t("products_loading")}
            </div>
          ) : (
            <div className="relative px-10 sm:px-12">
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              >
                <ChevronLeft
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-900"
                  strokeWidth={2.5}
                />
              </button>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)`,
                  }}
                >
                  {products.map((product) => {
                    const rating =
                      typeof product.rating === "object" &&
                      product.rating.$numberDecimal
                        ? parseFloat(product.rating.$numberDecimal)
                        : parseFloat(product.rating || 0);
                    const widthClass =
                      slidesPerView === 1
                        ? "w-full"
                        : slidesPerView === 2
                          ? "w-1/2"
                          : "w-1/3";
                    return (
                      <div
                        key={product._id}
                        className={`${widthClass} shrink-0 px-2 sm:px-3`}
                      >
                        <div className="relative group/card cursor-not-allowed">
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
                              {t("products_login_to_view")}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
                            <div className="p-4 sm:p-5">
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
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                {product.name}
                              </h3>
                              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Eye className="w-4 h-4 text-emerald-600" />
                                  <span>{product.view_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-emerald-600" />
                                  <span className="truncate max-w-20">
                                    {product.origin}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Weight className="w-4 h-4 text-emerald-600" />
                                  <span>{product.weight}kg</span>
                                </div>
                              </div>
                              <div className="mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {t("products_ref_price")}
                                  </p>
                                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                    {t("products_per_unit")}
                                  </span>
                                </div>
                                <span className="text-xl sm:text-2xl font-bold text-emerald-600">
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
                                <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-xs sm:text-sm">
                                  {t("products_contact")}
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
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105"
              >
                <ChevronRight
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-900"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-12 sm:py-16 px-4 lg:px-6 bg-gray-50">
        <div className="max-w-350 mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            {t("blog_title")}
          </h2>
          <p className="text-center text-gray-500 mb-8 sm:mb-12">
            {t("blog_subtitle")}
          </p>
          <div className="relative">
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch select-none pointer-events-none"
              style={{ filter: "blur(3px)", opacity: 0.6 }}
            >
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">
                <div
                  className="relative w-full bg-linear-to-br from-emerald-100 to-emerald-200"
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
              <div className="flex flex-col gap-4 h-full">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-1"
                  >
                    <div className="w-24 sm:w-32 shrink-0 bg-linear-to-br from-lime-100 to-emerald-100 flex items-center justify-center">
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
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mx-4 max-w-md w-full text-center border border-emerald-100">
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
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {t("blog_login_title")}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {t("blog_login_desc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm"
                  >
                    {t("blog_login_btn")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 border border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors text-sm"
                  >
                    {t("blog_register_btn")}
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

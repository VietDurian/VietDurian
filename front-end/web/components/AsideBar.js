"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  User,
  Briefcase,
  FileEdit,
  Sprout,
  PenTool,
  ChevronRight,
  Sparkles,
  Package,
  Menu,
  X,
  Bot,
  ChartColumnIncreasing,
  ChevronLeft,
  Edit,
  Shield,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePermissionStore } from "@/store/usePermissionStore";

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  active,
  onClick,
  disabled,
}) => {
  const itemClass = `relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group overflow-hidden ${disabled
    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
    : active
      ? "bg-emerald-500 text-white scale-105"
      : "text-gray-600 hover:bg-white hover:shadow-lg hover:scale-[1.02]"
    }`;

  const content = (
    <>
      {active && <div className="absolute inset-0 bg-white/10 rounded-2xl" />}
      <div
        className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${disabled
          ? "bg-gray-200"
          : active
            ? "bg-white/20 backdrop-blur-sm"
            : "bg-gradient-to-br from-gray-100 to-gray-50 group-hover:from-emerald-50 group-hover:to-teal-50"
          }`}
      >
        <Icon
          size={20}
          className={`${disabled
            ? "text-gray-400"
            : active
              ? "text-white"
              : "text-emerald-500 group-hover:text-emerald-600 group-hover:scale-110"
            } transition-all duration-300`}
          strokeWidth={2.5}
        />
      </div>
      <span
        className={`relative z-10 text-[15px] font-semibold tracking-wide ${active ? "text-white" : "text-gray-700 group-hover:text-gray-900"} transition-colors duration-300`}
      >
        {label}
      </span>
      {active && (
        <ChevronRight
          size={18}
          className="relative z-10 ml-auto text-white/80"
          strokeWidth={3}
        />
      )}
      {!active && !disabled && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-200 rounded-2xl transition-all duration-300" />
      )}
      {!disabled && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </>
  );

  if (disabled) {
    return (
      <div className={itemClass} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={itemClass}>
      {content}
    </Link>
  );
};

export default function AsideBar({ role }) {
  const { verifyCCCDStatus, getVerifyCCCDStatus } = usePermissionStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (["farmer", "contentExpert", "serviceProvider"].includes(role)) {
      getVerifyCCCDStatus();
    }
  }, [role, getVerifyCCCDStatus]);

  const seasonDiaryRouteMatch = pathname?.match(
    /^\/profile\/season-diaries\/([^/]+)/,
  );
  const productRouteMatch = pathname?.match(/^\/profile\/products\/([^/]+)/);
  const seasonDiaryId = seasonDiaryRouteMatch?.[1];
  const productId = productRouteMatch?.[1];

  const isSeasonDiaryCreate = pathname === "/profile/season-diaries/create";
  const isProductCreate = pathname === "/profile/products/create";
  const isCreateRoute = isSeasonDiaryCreate || isProductCreate;

  const isFarmerSeasonDiarySubRoute =
    role === "farmer" && !!seasonDiaryId && seasonDiaryId !== "create";
  const isFarmerProductsSubRoute =
    role === "farmer" && !!productId && productId !== "create";
  const shouldShowVerification =
    ["farmer", "contentExpert", "serviceProvider"].includes(role) &&
    verifyCCCDStatus !== "approved";
  const isVerificationPending = verifyCCCDStatus === "pending";
  const verificationMenuItem = {
    icon: Shield,
    label: isVerificationPending ? "Đã gửi xác thực" : "Xác Thực Thông Tin",
    href: "/profile/submit-proof",
    disabled: isVerificationPending,
  };

  const getMenuItems = (role) => {
    switch (role) {
      case "trader":
        return [
          { icon: User, label: t("aside_info"), href: "/profile/details" },
          { icon: Bot, label: t("aside_ai"), href: "/profile/ai" },
          { icon: FileText, label: t("aside_posts_trader"), href: "/profile/posts" },
        ];
      case "farmer":
        if (isFarmerSeasonDiarySubRoute) {
          return [
            {
              icon: Sprout,
              label: t("aside_detail"),
              href: `/profile/season-diaries/${seasonDiaryId}`,
            },
            {
              icon: FileText,
              label: t("aside_diary"),
              href: `/profile/season-diaries/${seasonDiaryId}/diaries`,
            },
            {
              icon: ChartColumnIncreasing,
              label: t("aside_statistics"),
              href: `/profile/season-diaries/${seasonDiaryId}/statistics`,
            },
            {
              icon: Edit,
              label: t("aside_edit"),
              href: `/profile/season-diaries/${seasonDiaryId}/edit`,
            },
          ];
        } else if (isFarmerProductsSubRoute) {
          return [
            {
              icon: Sprout,
              label: t("aside_detail"),
              href: `/profile/products/${productId}`,
            },
            {
              icon: Edit,
              label: t("aside_edit"),
              href: `/profile/products/${productId}/edit`,
            },
          ];
        }
        if (shouldShowVerification) {
          return [
            { icon: User, label: t("aside_info"), href: "/profile/details" },
            verificationMenuItem,
          ];
        }
        return [
          { icon: User, label: t("aside_info"), href: "/profile/details" },

          {
            icon: Sprout,
            label: t("aside_garden"),
            href: "/profile/season-diaries",
          },
          {
            icon: Layers,
            label: t("aside_diaries"),
            href: "/profile/diaries",
          },
          {
            icon: Package,
            label: t("aside_products"),
            href: "/profile/products",
          },
          {
            icon: ChartColumnIncreasing,
            label: t("aside_statistics"),
            href: "/profile/statistics",
          },
          { icon: Bot, label: t("aside_ai"), href: "/profile/ai" },
          { icon: FileText, label: t("aside_posts_farmer"), href: "/profile/posts" },
        ];
      case "contentExpert":
        if (shouldShowVerification) {
          return [verificationMenuItem];
        }
        return [
          { icon: User, label: t("aside_info"), href: "/profile/details" },
          { icon: PenTool, label: t("aside_blog"), href: "/profile/blogs" },
          { icon: Bot, label: t("aside_ai"), href: "/profile/ai" },
          { icon: FileText, label: t("aside_posts_content"), href: "/profile/posts" },
        ];
      case "serviceProvider":
        if (shouldShowVerification) {
          return [verificationMenuItem];
        }
        return [
          { icon: User, label: t("aside_info"), href: "/profile/details" },
          { icon: FileEdit, label: t("aside_resume"), href: "/profile/resume" },
          { icon: Bot, label: t("aside_ai"), href: "/profile/ai" },
          { icon: FileText, label: t("aside_posts_service"), href: "/profile/posts" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(role);

  const renderSidebarContent = (onItemClick) => (
    <>
      <nav className="relative z-10 flex flex-col flex-1 space-y-2 overflow-y-auto overflow-x-hidden w-full px-2 py-1 scrollbar-custom">
        {isCreateRoute ? (
          <Link
            href={
              isProductCreate ? "/profile/products" : "/profile/season-diaries"
            }
            onClick={onItemClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-300"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            {isProductCreate ? t("aside_back_products") : t("aside_back_diary")}
          </Link>
        ) : (
          <>
            {(isFarmerSeasonDiarySubRoute || isFarmerProductsSubRoute) && (
              <Link
                href={
                  isFarmerProductsSubRoute
                    ? "/profile/products"
                    : "/profile/season-diaries"
                }
                onClick={onItemClick}
                className="flex items-center gap-2 px-4 py-2.5 mb-1 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-300"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
                {isFarmerProductsSubRoute
                  ? t("aside_back_products")
                  : t("aside_back_garden")}
              </Link>
            )}
            {menuItems.map((item, index) => (
              <div
                key={item.href}
                style={{
                  animation: `slideInLeft 0.4s ease-out ${index * 0.1}s both`,
                }}
              >
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={pathname === item.href}
                  disabled={item.disabled}
                  onClick={onItemClick}
                />
              </div>
            ))}
          </>
        )}
      </nav>

      <div className="relative z-10 mt-6">
        <div className="mb-6">
          <div className="w-full h-[4px] rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-emerald-500 p-4">
          <div className="absolute inset-0 bg-white/5 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide">
                VietDurian v.1.0.6
              </span>
              <span className="text-white/80 text-xs font-medium">
                {t("aside_brand_sub")}
              </span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-tr-full" />
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-20 left-4 z-[999] p-2 bg-white rounded-xl shadow-md border border-gray-200 text-emerald-500"
      >
        <Menu size={22} strokeWidth={2.5} />
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`md:hidden fixed top-0 left-0 z-[1001] h-full w-72 bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col px-4 py-8 border-r border-gray-200/60 backdrop-blur-xl transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
        <div className="mt-8 flex flex-col flex-1">
          {renderSidebarContent(() => setMobileOpen(false))}
        </div>
        <style jsx>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes shine {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shine {
            animation: shine 3s ease-in-out infinite;
          }
        `}</style>
      </aside>

      <aside className="hidden md:flex w-64 h-[95vh] fixed top-10 bg-gradient-to-b from-gray-50 via-white to-gray-50 flex-col px-4 py-8 border-r border-gray-200/60 backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {renderSidebarContent(undefined)}
        <style jsx>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes shine {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shine {
            animation: shine 3s ease-in-out infinite;
          }
        `}</style>
      </aside>
    </>
  );
}

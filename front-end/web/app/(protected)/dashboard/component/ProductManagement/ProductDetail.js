"use client";

import { useEffect, useMemo } from "react";
import {
  X,
  Star,
  StarHalf,
  Eye,
  CalendarDays,
  Package,
  MapPin,
  BadgeInfo,
  User2,
  Tag,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

export function ProductDetail({ product, onClose }) {
  const { language } = useLanguage?.() || { language: "vi" };
  const locale = language === "en" ? "en-US" : "vi-VN";

  useEffect(() => {
    if (!product) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, product]);

  const decimalToNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "object" && value?.$numberDecimal) {
      return Number(value.$numberDecimal);
    }
    return Number(value || 0);
  };

  const formatVND = (value) => {
    const n =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isNaN(n)) return "0 VND";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "--"
      : new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
  };

  const rating = useMemo(
    () => Math.max(0, Math.min(5, Number(product?.rating) || 0)),
    [product?.rating],
  );

  if (!product) return null;

  const getTypeBadgeClass = (type) => {
    switch ((type || "").toLowerCase()) {
      case "fruit":
        return "bg-emerald-100 text-emerald-800 ring-emerald-200";
      case "fertilizer":
        return "bg-amber-100 text-amber-800 ring-amber-200";
      case "service":
        return "bg-sky-100 text-sky-800 ring-sky-200";
      case "equipment":
        return "bg-violet-100 text-violet-800 ring-violet-200";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-700 ring-emerald-200";
      case "inactive":
        return "bg-rose-100 text-rose-700 ring-rose-200";
      case "pending":
        return "bg-amber-100 text-amber-700 ring-amber-200";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200";
    }
  };

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5 && fullStars < 5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const ratingValue = rating.toFixed(1);

  const hasImage = Boolean(product?.imageUrl);

  const stats = [
    {
      key: "rating",
      label: language === "en" ? "Rating" : "Đánh giá",
      value: ratingValue,
      icon: Star,
      extra: (
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star
              key={`full-${i}`}
              className="h-4 w-4 text-amber-500"
              fill="currentColor"
              stroke="none"
            />
          ))}
          {hasHalf && <StarHalf className="h-4 w-4 text-amber-500" />}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star key={`empty-${i}`} className="h-4 w-4 text-slate-300" />
          ))}
        </div>
      ),
    },
    {
      key: "views",
      label: language === "en" ? "Views" : "Lượt xem",
      value: Number(product?.viewCount ?? 0).toLocaleString(locale),
      icon: Eye,
    },
    {
      key: "created",
      label: language === "en" ? "Created" : "Ngày tạo",
      value: formatDate(product?.createdAt),
      icon: CalendarDays,
    },
    {
      key: "updated",
      label: language === "en" ? "Updated" : "Cập nhật",
      value: formatDate(product?.updatedAt),
      icon: CalendarDays,
    },
  ];

  const detailItems = [
    {
      key: "origin",
      label: language === "en" ? "Origin" : "Nguồn gốc",
      value: product?.origin || "--",
      icon: MapPin,
    },
    {
      key: "weight",
      label: language === "en" ? "Weight" : "Khối lượng",
      value: product?.weight ? Number(product.weight).toLocaleString(locale) : "--",
      icon: Package,
    },
    {
      key: "type",
      label: language === "en" ? "Product Type" : "Loại sản phẩm",
      value: product?.typeName || "--",
      icon: Tag,
    },
    {
      key: "createdBy",
      label: language === "en" ? "Created By" : "Người tạo",
      value: product?.user_name || product?.userId || "--",
      icon: User2,
      wrap: true,
    },
    {
      key: "productId",
      label: language === "en" ? "Product ID" : "Mã sản phẩm",
      value: product?.id || "--",
      icon: BadgeInfo,
      wrap: true,
    },
    {
      key: "status",
      label: language === "en" ? "Status" : "Trạng thái",
      value: product?.status || "--",
      icon: BadgeInfo,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.08),transparent_24%)]" />

        <button
          type="button"
          onClick={onClose}
          aria-label={language === "en" ? "Close" : "Đóng"}
          className="absolute right-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/90 text-slate-600 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 overflow-y-auto">
          <div className="grid min-h-full grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
            <aside className="relative overflow-hidden border-b border-slate-200 bg-slate-950 xl:border-b-0 xl:border-r">
              {hasImage ? (
                <Image
                  src={product.imageUrl}
                  alt={product?.name || "product"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#163d2b] via-[#1a4d2e] to-[#2d7a4f]" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                  {language === "en" ? "Product Detail" : "Chi tiết sản phẩm"}
                </div>

                <h2
                  id="product-detail-title"
                  className="mt-4 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl"
                >
                  {product?.name || "--"}
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                  {product?.description ||
                    (language === "en"
                      ? "No description available for this product yet."
                      : "Chưa có mô tả cho sản phẩm này.")}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getTypeBadgeClass(
                      product?.typeName,
                    )}`}
                  >
                    {product?.typeName || "--"}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusBadgeClass(
                      product?.status,
                    )}`}
                  >
                    {product?.status || "--"}
                  </span>
                </div>

                <div className="mt-8 rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                    {language === "en" ? "Price" : "Giá"}
                  </p>
                  <div className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                    {formatVND(decimalToNumber(product?.price))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <Star
                        key={`sidebar-full-${i}`}
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                        stroke="none"
                      />
                    ))}
                    {hasHalf && <StarHalf className="h-4 w-4 text-amber-400" />}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                      <Star
                        key={`sidebar-empty-${i}`}
                        className="h-4 w-4 text-white/25"
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-white/85">
                      {ratingValue}/5
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            <main className="bg-slate-50">
              <div className="space-y-6 p-5 sm:p-6 lg:p-8">
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {language === "en" ? "Overview" : "Tổng quan"}
                      </p>
                      <h3 className="mt-2 break-words text-2xl font-bold text-slate-900">
                        {product?.name || "--"}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        {product?.description ||
                          (language === "en"
                            ? "No description available for this product yet."
                            : "Chưa có mô tả cho sản phẩm này.")}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-3xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-left lg:min-w-[220px] lg:text-right">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                        {language === "en" ? "Current Price" : "Giá hiện tại"}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-[#1a4d2e]">
                        {formatVND(decimalToNumber(product?.price))}
                      </div>
                      <div className="mt-1 text-sm text-emerald-700/80">
                        {language === "en" ? "Weight" : "Khối lượng"}: {" "}
                        {product?.weight
                          ? Number(product.weight).toLocaleString(locale)
                          : "--"}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {item.label}
                          </p>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="mt-4 text-2xl font-bold text-slate-900">
                          {item.value}
                        </p>
                        {item.extra}
                      </div>
                    );
                  })}
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {language === "en" ? "Harvest Timeline" : "Lịch thu hoạch"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {language === "en"
                            ? "Harvest and seasonal schedule"
                            : "Kế hoạch thu hoạch theo mùa vụ"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {language === "en" ? "Harvest Start" : "Bắt đầu thu hoạch"}
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatDate(product?.harvestStartDate)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50 to-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {language === "en" ? "Harvest End" : "Kết thúc thu hoạch"}
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                          {formatDate(product?.harvestEndDate)}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <BadgeInfo className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {language === "en" ? "Highlights" : "Điểm nổi bật"}
                        </h4>
                        <p className="text-sm text-slate-500">
                          {language === "en"
                            ? "Quick summary of this product"
                            : "Tóm tắt nhanh về sản phẩm"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                      <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {language === "en" ? "Origin" : "Nguồn gốc"}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {product?.origin || "--"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {language === "en" ? "Product Type" : "Loại sản phẩm"}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {product?.typeName || "--"}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {language === "en" ? "Status" : "Trạng thái"}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {product?.status || "--"}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {language === "en" ? "Key Details" : "Chi tiết chính"}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {language === "en"
                          ? "Detailed metadata and identifiers"
                          : "Thông tin chi tiết và định danh sản phẩm"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {detailItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.key}
                          className="rounded-[22px] border border-slate-100 bg-slate-50/80 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-600 ring-1 ring-slate-200">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {item.label}
                              </p>
                              <p
                                className={`mt-1 text-sm font-semibold text-slate-900 ${item.wrap ? "break-all" : "break-words"}`}
                              >
                                {item.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

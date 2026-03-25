"use client";
import { useEffect, useMemo } from "react";
import { X, Star, StarHalf } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

export function ProductDetail({ product, onClose }) {
  const { t } = useLanguage?.() || { t: (s) => s };

  // Lock body scroll while modal is open and add ESC key to close
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

  const rating = useMemo(
    () => Math.max(0, Math.min(5, Number(product.rating) || 0)),
    [product.rating],
  );

  if (!product) return null;

  const decimalToNumber = (value) => {
    if (typeof value === "number") return value;
    if (typeof value === "object" && value?.$numberDecimal)
      return Number(value.$numberDecimal);
    return Number(value || 0);
  };

  const formatVND = (value) => {
    const n =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[^\d.-]/g, ""));
    if (Number.isNaN(n)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
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
      : new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(date);
  };

  const getTypeBadgeColor = (type) => {
    switch ((type || "").toLowerCase()) {
      case "fruit":
        return "bg-[#1a4d2e] text-white";
      case "fertilizer":
        return "bg-yellow-600 text-white";
      case "service":
        return "bg-blue-600 text-white";
      case "equipment":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5 && full < 5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const ratingValue = rating.toFixed(1);
  const ratingIcons = (
    <>
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-amber-500"
          fill="currentColor"
          stroke="none"
        />
      ))}
      {hasHalf && <StarHalf key="half" className="w-4 h-4 text-amber-500" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </>
  );
  const quickStats = [
    {
      key: "rating",
      label: t("Rating"),
      value: ratingValue,
      detail: t("Average score"),
      render: (
        <div className="mt-2 flex items-center gap-1 text-amber-500">
          {ratingIcons}
          <span className="text-xs font-semibold text-amber-700">
            {ratingValue}
          </span>
        </div>
      ),
    },
    {
      key: "views",
      label: t("Views"),
      value: Number(product.viewCount ?? 0).toLocaleString("vi-VN"),
      detail: t("Total impressions"),
    },
    {
      key: "created",
      label: t("Created At"),
      value: formatDate(product.createdAt),
      detail: t("Record created"),
    },
    {
      key: "updated",
      label: t("Updated At"),
      value: formatDate(product.updatedAt),
      detail: t("Last update"),
    },
  ];
  const harvestMilestones = [
    {
      key: "harvest-start",
      label: t("Harvest Start"),
      value: formatDate(product.harvestStartDate),
      accent: "from-emerald-50 to-white",
    },
    {
      key: "harvest-end",
      label: t("Harvest End"),
      value: formatDate(product.harvestEndDate),
      accent: "from-amber-50 to-white",
    },
  ];
  const detailFacts = [
    { key: "origin", label: t("Origin"), value: product.origin || "--" },
    {
      key: "weight",
      label: t("Weight"),
      value: Number(product.weight ?? 0).toLocaleString("vi-VN"),
    },
    {
      key: "created-by",
      label: t("Created By"),
      value: product?.user_name || product?.userId || "--",
    },
    {
      key: "product-id",
      label: t("Product ID"),
      value: product.id || "--",
      wrap: true,
    },
  ];
  const hasImage = Boolean(product.imageUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-2xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#1a4d2e]/10 via-white to-white" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#1a4d2e]/10 blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/40 bg-linear-to-r from-[#1a4d2e] to-[#2d7a4f] px-6 py-5 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                {t("Product Detail")}
              </p>
              <h2 id="product-detail-title" className="text-xl font-semibold">
                {product.name || t("Product Detail")}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("Close")}
              className="inline-flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            <div className="px-6 py-8 space-y-8">
              {/* Overview */}
              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/60">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {t("Overview")}
                    </p>
                    <h3 className="text-2xl font-semibold text-slate-900">
                      {product.name || "--"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${getTypeBadgeColor(product.typeName)}`}
                      >
                        {product.typeName || "--"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${getStatusBadgeColor(product.status)}`}
                      >
                        {product.status || "--"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {t("Price")}
                    </p>
                    <p className="text-3xl font-semibold text-[#1a4d2e]">
                      {formatVND(decimalToNumber(product.price))}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t("Weight")}:{" "}
                      {Number(product.weight ?? 0).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {product.description ||
                    t("No description available for this product yet.")}
                </p>
              </section>

              <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
                {/* Visual + stats */}
                <aside className="space-y-5">
                  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-[#1a4d2e] text-white shadow-xl">
                    {hasImage ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name || "product"}
                        width={96}
                        height={96}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-[#1a4d2e]/90 to-[#2d7a4f]/80" />
                    )}
                    {!hasImage && (
                      <span className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white/10">
                        {(product.name || "--")?.charAt(0)}
                      </span>
                    )}
                    <div className="relative z-10 flex min-h-80 flex-col justify-end gap-2 p-6">
                      <div
                        className={`max-w-sm rounded-2xl px-4 py-3 ${hasImage ? "bg-black/50 text-white backdrop-blur-sm" : "text-white/90"}`}
                      >
                        <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                          {t("Product Preview")}
                        </p>
                        <p className="text-2xl font-semibold">
                          {product.name || "--"}
                        </p>
                        <p className="text-sm text-white/80">
                          {product.origin || t("Origin unknown")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quickStats.map((item) => (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {item.value}
                        </p>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                        {item.render}
                      </div>
                    ))}
                  </div>
                </aside>

                {/* Details */}
                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Star className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {t("Harvest Timeline")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t("Plan your logistics with confidence")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {harvestMilestones.map((milestone) => (
                        <div
                          key={milestone.key}
                          className={`rounded-2xl border border-slate-100 bg-linear-to-br ${milestone.accent} p-4 shadow-inner`}
                        >
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            {milestone.label}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">
                            {milestone.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      {t("Key Details")}
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {detailFacts.map((fact) => (
                        <div
                          key={fact.key}
                          className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
                        >
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            {fact.label}
                          </p>
                          <p
                            className={`mt-2 text-sm font-medium text-slate-900 ${fact.wrap ? "break-all" : ""}`}
                          >
                            {fact.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white px-6 py-4 text-right">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  SquarePen,
  Trash2,
  Leaf,
  Star,
  Eye,
  MapPin,
  Weight,
  Tag,
  Calendar,
  User,
} from "lucide-react";
import { useProductStore } from "../../../../../store/useProductStore";
import { useLanguage } from "@/context/LanguageContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toNumber(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "object" && value.$numberDecimal) {
    const parsed = Number(value.$numberDecimal);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatPrice(amount) {
  const numeric = toNumber(amount);
  if (numeric === null) return "-";
  return numeric.toLocaleString("vi-VN") + "đ";
}

function formatWeight(weight) {
  const numeric = toNumber(weight);
  if (numeric === null) return "-";
  return `${numeric} kg`;
}

function formatDate(date) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatMini({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col gap-1 flex-1">
      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${iconColor}`}
      >
        <Icon size={13} />
        {label}
      </div>
      <p className="text-xl font-extrabold text-gray-800">{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, valueClass = "text-gray-700" }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon size={14} className="text-gray-400" />
        {label}
      </div>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();

  const productId = useMemo(() => {
    const id = params?.productId;
    return Array.isArray(id) ? id[0] : id;
  }, [params]);

  const {
    productDetail,
    isProductDetailsLoading,
    fetchProductDetail,
    deleteProduct,
    isProductDeleting,
  } = useProductStore();

  useEffect(() => {
    if (!productId) return;
    fetchProductDetail(productId).catch(() => {});
  }, [productId, fetchProductDetail]);

  const primaryImage = useMemo(() => {
    if (!productDetail) return "/images/product-placeholder.jpg";
    return (
      productDetail.images?.[0]?.url ||
      productDetail.image ||
      "/images/product-placeholder.jpg"
    );
  }, [productDetail]);

  const ratingValue = useMemo(() => {
    const numeric = toNumber(productDetail?.rating);
    if (numeric === null) return "0.0";
    return numeric.toFixed(1);
  }, [productDetail]);

  const stats = useMemo(
    () => [
      {
        icon: Star,
        iconColor: "text-yellow-500",
        label: t("product_detail_stat_rating"),
        value: ratingValue,
        sub: t("product_detail_stat_rating_sub"),
      },
      {
        icon: Eye,
        iconColor: "text-blue-500",
        label: t("product_detail_stat_views"),
        value: productDetail?.view_count ?? 0,
        sub: t("product_detail_stat_views_sub"),
      },
    ],
    [productDetail, ratingValue, t],
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const handleBack = () => {
    router.push("/profile/products");
  };

  const handleDelete = async () => {
    if (!productId) return;
    await deleteProduct(productId);
    router.push("/profile/products");
  };

  if (isProductDetailsLoading && !productDetail) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-sm text-gray-500">
        {t("product_detail_loading")}
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-sm text-gray-500">
        {t("product_detail_not_found")}
      </div>
    );
  }

  const p = productDetail;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("product_detail_delete_title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("product_detail_delete_desc")} <b>{productDetail?.name}</b>{" "}
              {t("product_detail_delete_desc2")}
            </p>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={t("product_detail_delete_placeholder")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmName("");
                }}
                className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                {t("product_detail_delete_cancel")}
              </button>
              <button
                disabled={
                  confirmName !== productDetail?.name || isProductDeleting
                }
                onClick={handleDelete}
                className={`cursor-pointer px-4 py-2 rounded-lg text-white ${
                  confirmName === productDetail?.name
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                {isProductDeleting
                  ? t("product_detail_deleting")
                  : t("product_detail_delete_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className=" mx-auto space-y-6">
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isProductDeleting}
          className="absolute right-10 top-25 flex items-center gap-1.5 border border-red-200 bg-white text-sm font-medium text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Trash2 size={13} />
          {isProductDeleting
            ? t("product_detail_deleting")
            : t("product_detail_delete_btn")}
        </button>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {/* Product Image */}
            <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] w-full">
              <img
                src={primaryImage}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/product-placeholder.jpg";
                }}
              />
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              {stats.map((stat) => (
                <StatMini key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Product info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              {/* Category badge */}
              <div className="flex items-center gap-1.5">
                <Leaf size={13} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  {p.type_id?.name || "Uncategorized"}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {p.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-green-500">
                  {formatPrice(p.price)}
                </span>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t("product_detail_desc_label")}
                </p>
                <p className="text-sm text-gray-600">{p.description}</p>
              </div>

              {/* Product Details */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t("product_detail_info_label")}
                </p>
                <div className="divide-y divide-gray-100">
                  <DetailRow
                    icon={Tag}
                    label={t("product_detail_category")}
                    value={p.type_id?.name || "N/A"}
                  />
                  <DetailRow
                    icon={MapPin}
                    label={t("product_detail_origin")}
                    value={p.origin || "-"}
                  />
                  <DetailRow
                    icon={Weight}
                    label={t("product_detail_weight")}
                    value={formatWeight(p.weight)}
                  />
                  <DetailRow
                    icon={Calendar}
                    label={t("product_detail_start_date")}
                    value={formatDate(p.harvest_start_date)}
                  />
                  <DetailRow
                    icon={Calendar}
                    label={t("product_detail_end_date")}
                    value={formatDate(p.harvest_end_date)}
                  />
                  <DetailRow
                    icon={Tag}
                    label={t("product_detail_status")}
                    value={p.status || "-"}
                    valueClass={
                      p.status === "active" ? "text-green-600" : "text-gray-500"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t("product_detail_seller_label")}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src={p.user_id?.avatar}
                    alt={p.user_id?.full_name || "Seller"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center bg-gray-200">
                    <User size={18} className="text-gray-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {p.user_id?.full_name || "Unknown seller"}
                  </p>
                  <p className="text-xs text-gray-400">{p.user_id?.email}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {t("product_detail_timeline_label")}
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Calendar size={13} className="text-gray-400" />
                    {t("product_detail_created_at")}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {formatDate(p.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Calendar size={13} className="text-gray-400" />
                    {t("product_detail_updated_at")}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {formatDate(p.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

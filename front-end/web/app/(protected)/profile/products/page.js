"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Eye,
  Star,
  Plus,
  Search,
  Filter,
  MapPin,
  Weight,
  SquarePen,
  Calendar,
} from "lucide-react";
import { useProductStore } from "../../../../store/useProductStore";
import { useProductStore as useTypeProductStore } from "@/store/useTypeProduct";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function formatRating(value) {
  const numeric = toNumber(value);
  if (numeric === null) return "-";
  return numeric.toFixed(1);
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  bg,
  iconBg,
  iconColor,
  border,
  valueColor,
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl p-4 ${bg} ${border} flex-1 min-w-0`}
    >
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className={`${valueColor} text-2xl font-bold text-gray-800`}>
          {value}
        </p>
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
      >
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
      <Star size={13} className="text-yellow-400 fill-yellow-400" />
      {formatRating(rating)}
    </span>
  );
}

function ProductCard({ product, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Link
      href={`/profile/products/${product._id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative">
        {product.discount && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
            {product.discount}%
          </span>
        )}

        {/* Placeholder image — replace src with real product.image */}
        <div className="w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={
              product.images?.[0]?.url ||
              product.images?.[0] ||
              "/images/product-placeholder.jpg"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
          {/* Fallback */}
          <div className="w-full h-full hidden items-center justify-center bg-gray-100">
            <Package size={48} className="text-gray-300" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-3 h-3 rounded-full inline-block ${
              product.status === "active" ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span
            className={`text-xs font-medium ${
              product.status === "active" ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.status || "Unknown"}
          </span>
        </div>

        {/* Name + Description */}
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating + Views */}
        <div className="flex items-center gap-3">
          <StarRating rating={product.rating} />
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye size={12} />
            {product.view_count || 0}
          </span>
        </div>

        {/* Origin + Weight */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-gray-400" />
            {product.origin || "-"}
          </span>
          <span className="flex items-center gap-1">
            <Weight size={11} className="text-gray-400" />
            {toNumber(product.weight) ? `${toNumber(product.weight)} kg` : "-"}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-green-600 font-extrabold text-base">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-xs">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Status */}
        <p className="text-xs text-gray-500">
          Status:{" "}
          <span className="font-semibold text-gray-700">
            {product.status || "N/A"}
          </span>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <SquarePen size={13} />
            Xem chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MyProductsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const {
    products,
    isProductsLoading,
    fetchProducts,
    deleteProduct,
    isProductCreating,
  } = useProductStore();
  const { types, fetchTypes } = useTypeProductStore();

  useEffect(() => {
    fetchTypes().catch(() => {});
  }, [fetchTypes]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = {};

      if (search.trim()) {
        params.name = search.trim();
      }

      if (typeFilter) {
        params.typeId = typeFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      fetchProducts(params).catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter, fetchProducts]);

  const stats = useMemo(() => {
    const total = products.length;
    const views = products.reduce(
      (sum, p) => sum + (toNumber(p.view_count) || 0),
      0,
    );
    const ratingAvg =
      products.length === 0
        ? "0.0"
        : (
            products.reduce((sum, p) => sum + (toNumber(p.rating) || 0), 0) /
            products.length
          ).toFixed(1);
    const totalStock = products.reduce(
      (sum, p) => sum + (toNumber(p.stock) || 0),
      0,
    );

    return [
      {
        label: "Tổng sản phẩm",
        value: total.toString(),
        icon: Package,
        bg: "bg-emerald-50",
        border: "border border-emerald-300",
        iconBg: "bg-green-200",
        iconColor: "text-green-600",
        valueColor: "text-green-700",
      },
      {
        label: "Tổng lượt xem",
        value: views.toString(),
        icon: Eye,
        bg: "bg-sky-50",
        border: "border border-sky-300",
        iconBg: "bg-sky-200",
        iconColor: "text-sky-600",
        valueColor: "text-sky-700",
      },
      {
        label: "Điểm đánh giá trung bình",
        value: ratingAvg,
        icon: Star,
        bg: "bg-yellow-50",
        border: "border border-yellow-300",
        iconBg: "bg-yellow-200",
        iconColor: "text-yellow-600",
        valueColor: "text-yellow-700",
      },
      {
        label: "Trong mùa",
        value: totalStock,
        icon: Calendar,
        bg: "bg-purple-50",
        border: "border border-purple-300",
        iconBg: "bg-purple-200",
        iconColor: "text-purple-600",
        valueColor: "text-purple-700",
      },
    ];
  }, [products]);

  const handleDelete = async (productId) => {
    if (!productId) return;
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    await deleteProduct(productId);
  };

  return (
    <>
      {isProductsLoading ||
        (isProductCreating && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
              <span className="text-gray-700 font-medium">
                Đang cập nhật sản phẩm...
              </span>
            </div>
          </div>
        ))}
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sản phẩm của tôi
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Quản lý sản phẩm và coi thông số
              </p>
            </div>
            <button
              onClick={() => {
                router.push("/profile/products/create");
              }}
              className="cursor-pointer flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Plus size={16} />
              Thêm sản phẩm
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600">
              <Filter size={14} className="text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700"
              >
                <option value="">All Categories</option>
                {types?.map((type) => (
                  <option key={type?._id} value={type?._id}>
                    {type?.name}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
            {isProductsLoading && (
              <div className="col-span-4 text-center py-16 text-gray-400 text-sm">
                Loading products...
              </div>
            )}
            {!isProductsLoading && products.length === 0 && (
              <div className="col-span-4 text-center py-16 text-gray-400 text-sm">
                No products found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

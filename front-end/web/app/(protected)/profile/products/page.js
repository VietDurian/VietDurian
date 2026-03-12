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
      className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative">
        {product.discount && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
            {product.discount}%
          </span>
        )}

        <div className="w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={
              product.images?.[0]?.url ||
              product.images?.[0] ||
              "/images/product-placeholder.jpg"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold leading-tight drop-shadow-lg line-clamp-2 text-sm">
            {product.name}
          </h3>
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

        <p className="text-xs text-gray-500 line-clamp-2 mb-1 leading-relaxed">
          {product.description}
        </p>

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
          <span className="text-emerald-600 font-extrabold text-base">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-xs">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Status */}
        <p className="text-xs text-gray-500 mb-1">
          Status:{" "}
          <span className="font-semibold text-gray-700">
            {product.status || "N/A"}
          </span>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-xs">
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
    ownProducts,
    isOwnProductLoading,
    getOwnProducts,
    deleteProduct,
    isProductCreating,
  } = useProductStore();
  const { types, fetchTypes } = useTypeProductStore();

  useEffect(() => {
    fetchTypes().catch(() => {});
  }, [fetchTypes]);

  useEffect(() => {
    getOwnProducts().catch(() => {});
  }, [getOwnProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedStatus = statusFilter.trim().toLowerCase();

    return ownProducts.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        (product?.name || "").toLowerCase().includes(normalizedSearch);

      const productTypeId =
        product?.typeId || product?.type_product_id || product?.type?._id || "";
      const matchesType = !typeFilter || productTypeId === typeFilter;

      const productStatus = (product?.status || "").toLowerCase();
      const matchesStatus =
        !normalizedStatus || productStatus === normalizedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [ownProducts, search, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredProducts.length;
    const views = filteredProducts.reduce(
      (sum, p) => sum + (toNumber(p.view_count) || 0),
      0,
    );
    const ratingAvg =
      filteredProducts.length === 0
        ? "0.0"
        : (
            filteredProducts.reduce(
              (sum, p) => sum + (toNumber(p.rating) || 0),
              0,
            ) / filteredProducts.length
          ).toFixed(1);
    const totalStock = filteredProducts.reduce(
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
  }, [filteredProducts]);

  const handleDelete = async (productId) => {
    if (!productId) return;
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    await deleteProduct(productId);
  };

  return (
    <>
      {isOwnProductLoading ||
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
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="mx-auto px-6 py-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sản phẩm của tôi
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Quản lý và theo dõi tất cả sản phẩm của bạn
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                />
              </div>

              <div className="md:col-span-3 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-600">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 w-full"
                >
                  <option value="">Tất cả loại</option>
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
                className="md:col-span-3 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onDelete={handleDelete}
              />
            ))}
            {isOwnProductLoading && (
              <div className="col-span-4 text-center py-16 text-gray-400 text-sm">
                Loading products...
              </div>
            )}
            {!isOwnProductLoading && filteredProducts.length === 0 && (
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

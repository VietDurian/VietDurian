"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Star,
  StarHalf,
  Trash2,
  Eye,
  EyeClosed,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { productsAdminAPI } from "@/lib/api";
import { productTypesAPI } from "@/lib/api";
import { ProductDetail } from "./ProductDetail";
import Image from "next/image";

export function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingSort, setRatingSort] = useState("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const LIMIT = 10;
  const API_FETCH_LIMIT = 100;
  const MAX_FETCH_PAGES = 50;
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const renderRatingStars = (rating) => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(r);
    const hasHalf = r - full >= 0.5 && full < 5;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-500"
          fill="currentColor"
          stroke="none"
        />,
      );
    }
    if (hasHalf) {
      stars.push(<StarHalf key={`half`} className="w-4 h-4 text-yellow-500" />);
    }
    for (let i = 0; i < empty; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-1 text-xs text-gray-500">{r.toFixed(1)}</span>
      </div>
    );
  };

  const mapProduct = (p) => ({
    id: p._id,
    name: p.name,
    userId: p.user_id?._id || p.user_id || "",
    user_name: p.user_id?.full_name || p.userName || "undefined",
    typeId: p.type_id?._id || p.typeId || "",
    typeName: p.type_id?.name || p.typeName || "undefined",
    description: p.description || "",
    price: decimalToNumber(p.price),
    origin: p.origin || "",
    weight: Number(p.weight ?? 0),
    viewCount: Number(p.view_count ?? 0),
    rating: decimalToNumber(p.rating),
    harvestStartDate: p.harvest_start_date || null,
    harvestEndDate: p.harvest_end_date || null,
    status: p.status || "",
    createdAt: p.created_at || null,
    updatedAt: p.updated_at || null,
    imageUrl: (() => {
      const images = p.images ?? p.image ?? p.thumbnail ?? p.cover;
      if (Array.isArray(images)) {
        const first = images[0];
        if (!first) return "";
        if (typeof first === "string") return first;
        return first.url || first.secure_url || first.path || "";
      }
      if (typeof images === "string") return images;
      if (images && typeof images === "object")
        return images.url || images.secure_url || images.path || "";
      return p.image_url || p.thumbnail_url || "";
    })(),
  });

  const fetchProductTypes = async () => {
    try {
      const res = await productTypesAPI.getAllProductTypes({
        page: 1,
        limit: 10,
      });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setProductTypes(list);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  // Close type dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(e.target)
      ) {
        setIsTypeOpen(false);
      }
    };
    if (isTypeOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isTypeOpen]);

  const getTypeLabel = (id) => {
    if (id === "all") return t("all_types");
    const found = (Array.isArray(productTypes) ? productTypes : []).find(
      (x) => x._id === id,
    );
    return found ? t(found.name) : t("all_types");
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const term = searchTerm.trim();
    let isCancelled = false;

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const aggregated = [];
        let currentPage = 1;
        let keepFetching = true;

        while (keepFetching && currentPage <= MAX_FETCH_PAGES && !isCancelled) {
          const params = {
            page: currentPage,
            limit: API_FETCH_LIMIT,
            ...(typeFilter !== "all" ? { typeId: typeFilter } : {}),
          };

          const res = term
            ? await productsAdminAPI.searchProducts(term, params)
            : await productsAdminAPI.getAllProducts(params);

          const listRaw = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];

          aggregated.push(...listRaw.map(mapProduct));

          const paginationInfo = res?.data?.pagination || res?.pagination;
          const totalPages = Number(paginationInfo?.totalPages ?? 0);
          const expectedLimit = Number(params.limit ?? API_FETCH_LIMIT);
          const hasPagination = totalPages > 0;
          const hasMoreFromPagination =
            hasPagination && currentPage < totalPages;
          const hasMoreFromLength =
            !hasPagination &&
            listRaw.length === expectedLimit &&
            listRaw.length > 0;

          if (hasMoreFromPagination || hasMoreFromLength) {
            currentPage += 1;
          } else {
            keepFetching = false;
          }
        }

        if (!isCancelled) {
          setProducts(aggregated);
        }
      } catch (e) {
        if (!isCancelled) {
          console.error("Error:", e);
          setProducts([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(handler);
    };
  }, [searchTerm, typeFilter]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, statusFilter, ratingSort]);

  const goToPage = (newPage) => {
    const tp = Number(pagination.totalPages ?? 0);
    if (newPage >= 1 && (tp === 0 || newPage <= tp)) {
      setPage(newPage);
    }
  };
  const deleteProduct = async (id) => {
    try {
      await productsAdminAPI.deleteProduct(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "inactive" } : p)),
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };
  const filteredProducts = useMemo(() => {
    const data = Array.isArray(products) ? products : [];
    const term = searchTerm.trim().toLowerCase();
    const filtered = data.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const origin = (p.origin || "").toLowerCase();
      const matchesSearch =
        !term ||
        name.includes(term) ||
        desc.includes(term) ||
        origin.includes(term);
      const matchesType = typeFilter === "all" || p.typeId === typeFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });

    if (ratingSort === "asc") {
      return filtered.sort(
        (a, b) => Number(a.rating ?? 0) - Number(b.rating ?? 0),
      );
    }
    if (ratingSort === "desc") {
      return filtered.sort(
        (a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0),
      );
    }
    return filtered;
  }, [products, searchTerm, typeFilter, statusFilter, ratingSort]);

  const totalFiltered = filteredProducts.length;

  useEffect(() => {
    const computedTotalPages =
      totalFiltered === 0 ? 1 : Math.ceil(totalFiltered / LIMIT);
    if (page > computedTotalPages) {
      setPage(computedTotalPages);
      return;
    }
    setPagination((prev) => ({
      ...prev,
      totalItems: totalFiltered,
      totalPages: computedTotalPages,
      currentPage: page,
      itemsPerPage: LIMIT,
    }));
  }, [totalFiltered, page]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * LIMIT;
    return filteredProducts.slice(startIndex, startIndex + LIMIT);
  }, [filteredProducts, page]);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
          {t("products")}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {t("manage_products")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_product")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
            />
          </div>
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
            w-full md:w-48 pl-10 pr-4 py-2.5
            border border-gray-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]
            appearance-none bg-white
        "
            >
              <option value="all">{t("all_status")}</option>
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>

          {/* Rating Sort */}
          <div className="relative">
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500 pointer-events-none" />
            <select
              value={ratingSort}
              onChange={(e) => setRatingSort(e.target.value)}
              className="
            w-full md:w-56 pl-10 pr-4 py-2.5
            border border-gray-200 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]
            appearance-none bg-white
        "
            >
              <option value="desc">{t("rating_high_to_low")}</option>
              <option value="asc">{t("rating_low_to_high")}</option>
            </select>
          </div>

          {/* Type Filter (custom dropdown with scrollbar) */}
          <div className="relative" ref={typeDropdownRef}>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <button
              type="button"
              onClick={() => setIsTypeOpen((o) => !o)}
              className="w-full md:w-48 pl-10 pr-8 py-2.5 text-left border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
              aria-haspopup="listbox"
              aria-expanded={isTypeOpen}
            >
              <span className="block truncate">{getTypeLabel(typeFilter)}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${isTypeOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>

            {isTypeOpen && (
              <div className="absolute z-20 mt-1 w-full md:w-48 rounded-lg bg-white border border-gray-200 shadow-lg">
                <div className="max-h-60 overflow-y-auto">
                  <ul role="listbox" className="py-1 text-sm text-gray-700">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setTypeFilter("all");
                          setIsTypeOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${typeFilter === "all" ? "bg-gray-100 text-[#1a4d2e] font-medium" : ""}`}
                        role="option"
                        aria-selected={typeFilter === "all"}
                      >
                        {t("all_types")}
                      </button>
                    </li>
                    {(Array.isArray(productTypes) ? productTypes : []).map(
                      (type) => (
                        <li key={type._id}>
                          <button
                            type="button"
                            onClick={() => {
                              setTypeFilter(type._id);
                              setIsTypeOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${typeFilter === type._id ? "bg-gray-100 text-[#1a4d2e] font-medium" : ""}`}
                            role="option"
                            aria-selected={typeFilter === type._id}
                          >
                            {t(type.name)}
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("name")}
                </th>
                <th className="px-6 pr-10 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("types")}
                </th>
                <th className="pl-8 px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("price")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("status")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("rating")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap max-w-55">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-[#1a4d2e] to-[#2d7a4f] flex items-center justify-center text-white font-bold ring-1 ring-gray-200">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt={p.name || "product"}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          p.name?.charAt(0)
                        )}
                      </div>
                      <div className="ml-3 min-w-0">
                        <p
                          className="font-medium text-gray-900 truncate"
                          title={p.name}
                        >
                          {p.name}
                        </p>
                        <p
                          className="text-xs text-gray-500 truncate"
                          title={p.description}
                        >
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 pr-8 py-4 whitespace-nowrap max-w-30">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(p.typeName)} truncate`}
                      title={p.typeName}
                    >
                      {t(p.typeName) || p.typeName}
                    </span>
                  </td>
                  <td
                    className="pl-8 px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-25 truncate"
                    title={formatVND(p.price)}
                  >
                    {formatVND(p.price)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap max-w-25">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(p.status)} truncate`}
                      title={p.status}
                    >
                      {t(p.status) || p.status || "--"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap max-w-20">
                    {renderRatingStars(p.rating)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(p)}
                      className="mr-2 inline-flex items-center justify-center px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDelete({ id: p.id, name: p.name })
                      }
                      className="inline-flex items-center justify-center p-2 rounded-md border border-red-200 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={t("Delete")}
                      title={t("Delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {paginatedProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white font-bold shrink-0 bg-linear-to-br from-[#1a4d2e] to-[#2d7a4f] ring-1 ring-gray-200">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name || "product"}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  p.name?.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate text-gray-900">{p.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {p.description}
                </p>
                <p
                  className="text-xs text-gray-500 wrap-break-word line-clamp-2 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ maxWidth: "200px" }}
                  title={p.description}
                >
                  {p.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span>
                    {t("types")}:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(p.typeName)}`}
                    >
                      {t(p.typeName) || p.typeName}
                    </span>
                  </span>
                  <span>
                    {t("price")}: {formatVND(p.price)}
                  </span>
                  <span>
                    {t("origin") || "Origin"}: {p.origin}
                  </span>
                  <span>
                    {t("weight") || "Weight"}: {p.weight}
                  </span>
                  <span>
                    {t("Harvest Start")}: {formatDate(p.harvestStartDate)}
                  </span>
                  <span>
                    {t("Harvest End")}: {formatDate(p.harvestEndDate)}
                  </span>
                  <span>
                    {t("status")}:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(p.status)}`}
                    >
                      {t(p.status) || p.status || "--"}
                    </span>
                  </span>
                  <span>
                    {t("views") || "Views"}: {p.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    {t("rating")}: {renderRatingStars(p.rating)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Info */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-gray-600 text-center md:text-left">
          {(() => {
            const total = Number(pagination.totalItems ?? 0);
            const perPage = Number(pagination.itemsPerPage ?? LIMIT);
            const cur = Number(page ?? 1);
            const start = total === 0 ? 0 : (cur - 1) * perPage + 1;
            const end = Math.min(cur * perPage, total);
            return `${t("Showing") || "Showing"} ${start}–${end} ${t("of") || "of"} ${total} ${(t("products") || "products").toLowerCase()}`;
          })()}
        </div>

        <div className="flex items-center justify-center md:justify-end gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className={`px-3 py-1.5 text-sm rounded-md border ${page <= 1 ? "text-gray-400 border-gray-200 bg-white cursor-not-allowed" : "text-[#1a4d2e] border-gray-300 hover:bg-gray-50"}`}
          >
            {t("Previous") || "Previous"}
          </button>

          {Array.from(
            {
              length:
                Number(pagination.totalPages ?? 0) ||
                Math.max(
                  1,
                  Math.ceil(
                    (pagination.totalItems || 0) /
                      (pagination.itemsPerPage || LIMIT),
                  ),
                ),
            },
            (_, i) => i + 1,
          ).map((n) => (
            <button
              key={n}
              onClick={() => goToPage(n)}
              className={`px-3 py-1.5 text-sm rounded-md border ${n === page ? "bg-[#1a4d2e] text-white border-[#1a4d2e]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={
              page >=
              (pagination.totalPages ||
                Math.max(
                  1,
                  Math.ceil(
                    (pagination.totalItems || 0) /
                      (pagination.itemsPerPage || LIMIT),
                  ),
                ))
            }
            className={`px-3 py-1.5 text-sm rounded-md border ${page >= (pagination.totalPages || Math.max(1, Math.ceil((pagination.totalItems || 0) / (pagination.itemsPerPage || LIMIT)))) ? "text-gray-400 border-gray-200 bg-white cursor-not-allowed" : "text-[#1a4d2e] border-gray-300 hover:bg-gray-50"}`}
          >
            {t("Next") || "Next"}
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm">
            <div className="p-4 ">
              <h2
                id="confirm-delete-title"
                className="text-lg font-semibold text-gray-900"
              >
                {t("Confirm Delete")}
              </h2>
            </div>
            <div className="p-4 text-sm text-gray-600">
              {t("Are you sure you want to delete")}{" "}
              {confirmDelete?.name || t("this product")}?
            </div>
            <div className="p-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-3 py-1.5 text-sm rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteProduct(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="px-3 py-1.5 text-sm rounded-md border bg-red-600 text-white border-red-600 hover:bg-red-700"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { productAPI, productTypeAPI, ratingAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useDiaryStore } from "@/store/useDiaryStore";
import { useProductStore } from "@/store/useProductStore";
import { useLanguage } from "@/context/LanguageContext";
import {
  Search,
  X,
  Tag,
  List,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  AlertCircle,
  Package,
  Eye,
  MapPin,
  Weight,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductsPage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedType, setSelectedType] = useState("");
  const [imageErrors, setImageErrors] = useState({});
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [liveRatings, setLiveRatings] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 9,
  });
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { setSelectedUser, addContact } = useChatStore();

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  const handleContact = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    if (!authUser) {
      router.push("/login");
      return;
    }
    const owner = product.user_id || product.user || {};
    const receiverId = typeof owner === "object" ? owner._id : owner;
    if (!receiverId) return;
    const chatUser = {
      _id: receiverId,
      full_name: owner.full_name || "Người bán",
      avatar: owner.avatar || "images/avatar.jpg",
    };
    addContact(chatUser);
    setSelectedUser(chatUser);
    router.push(`/chat?chatId=${receiverId}`);
  };

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await productTypeAPI.getAllProductTypes({ limit: 20 });
        if (response.code === 200 && response.data)
          setProductTypes(response.data);
      } catch (err) {
        console.error("Error fetching product types:", err);
      }
    };
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          sortBy,
          sortOrder,
        };
        if (searchTerm) params.name = searchTerm;
        if (selectedType) params.typeId = selectedType;
        const response = await productAPI.getAllProducts(params);
        if (response.success) {
          const productsData = response.data || [];
          setProducts(productsData);
          if (response.pagination) {
            setPagination({
              currentPage: response.pagination.currentPage,
              totalPages: response.pagination.totalPages,
              totalItems: response.pagination.totalItems,
              itemsPerPage: response.pagination.itemsPerPage,
            });
          }
          if (productsData.length > 0) {
            const ratingResults = await Promise.all(
              productsData.map((p) =>
                ratingAPI
                  .getRatingsByProductId(p._id, { limit: 1 })
                  .catch(() => null),
              ),
            );
            const ratingsMap = {};
            productsData.forEach((p, i) => {
              const res = ratingResults[i];
              if (res?.success && res?.statistics)
                ratingsMap[p._id] = parseFloat(
                  res.statistics.averageRating || 0,
                );
            });
            setLiveRatings(ratingsMap);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(t("products_error"));
        setLoading(false);
      }
    };
    fetchProducts();
  }, [
    searchTerm,
    sortBy,
    sortOrder,
    selectedType,
    pagination.currentPage,
    pagination.itemsPerPage,
    t,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSortDropdownOpen &&
        !event.target.closest(".sort-dropdown-container")
      )
        setIsSortDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortDropdownOpen]);

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const sortOptions = [
    { value: "created_at", label: t("products_sort_newest") },
    { value: "price", label: t("products_sort_price") },
    { value: "name", label: t("products_sort_name") },
    { value: "rating", label: t("products_sort_rating") },
    { value: "view_count", label: t("products_sort_views") },
  ];

  const getCurrentSortLabel = () =>
    sortOptions.find((opt) => opt.value === sortBy)?.label ||
    t("products_sort_label");
  const handleSortChange = (value) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="bg-emerald-500 pt-32 pb-16 px-4">
        <div className="max-w-350 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("products_page_title")}
          </h1>
          <p className="text-emerald-50 text-lg max-w-2xl mx-auto mb-8">
            {t("products_page_subtitle")}
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder={t("products_search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-white/30 focus:border-white focus:outline-none text-gray-900 placeholder-gray-500 bg-white transition-all duration-300"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 shadow-sm">
        <div className="max-w-350 mx-auto">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              {t("products_filter_type")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType("")}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                  selectedType === ""
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  {t("products_filter_all")}
                </span>
              </button>
              {productTypes.map((type) => (
                <button
                  key={type._id}
                  onClick={() => setSelectedType(type._id)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    selectedType === type._id
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products List */}
      <section className="py-16 px-4">
        <div className="max-w-350 mx-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-gray-600">{t("products_loading")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">Lỗi</h3>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t("products_retry")}
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t("products_not_found")}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  {t("products_found")}{" "}
                  <span className="font-semibold text-emerald-500">
                    {pagination.totalItems}
                  </span>{" "}
                  {t("products_items")}
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    {t("products_sort_label")}
                  </span>
                  <div className="flex items-center gap-3 sort-dropdown-container">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setIsSortDropdownOpen(!isSortDropdownOpen)
                        }
                        className="min-w-40 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
                      >
                        <span>{getCurrentSortLabel()}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isSortDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                          {sortOptions.map((option, index) => (
                            <button
                              key={option.value}
                              onClick={() => handleSortChange(option.value)}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                                sortBy === option.value
                                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                                  : "text-gray-700 hover:bg-gray-50"
                              } ${index !== sortOptions.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortOrder("asc")}
                        className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${
                          sortOrder === "asc"
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        title={t("products_sort_asc")}
                      >
                        <ChevronUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSortOrder("desc")}
                        className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${
                          sortOrder === "desc"
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        title={t("products_sort_desc")}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const rating =
                    liveRatings[product._id] !== undefined
                      ? liveRatings[product._id]
                      : typeof product.rating === "object" &&
                          product.rating.$numberDecimal
                        ? parseFloat(product.rating.$numberDecimal)
                        : parseFloat(product.rating || 0);

                  return (
                    <div
                      key={product._id}
                      className={`relative group/card ${!authUser ? "cursor-not-allowed" : ""}`}
                    >
                      {!authUser && (
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
                            {t("products_login_overlay")}
                          </span>
                        </div>
                      )}
                      <Link
                        href={authUser ? `/products/${product._id}` : "#"}
                        onClick={(e) => {
                          if (!authUser) e.preventDefault();
                        }}
                        className={!authUser ? "pointer-events-none" : ""}
                      >
                        <div
                          className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 group ${!authUser ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-500 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-base text-gray-600 mb-4 line-clamp-1">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4 text-emerald-500" />
                                <span>{product.view_count}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>{product.origin}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Weight className="w-4 h-4 text-emerald-500" />
                                <span>{product.weight}kg</span>
                              </div>
                            </div>
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-gray-500">
                                  {t("products_ref_price")}
                                </p>
                                <span className="text-xs bg-emerald-50 text-emerald-500 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                  {t("products_per_unit")}
                                </span>
                              </div>
                              <span className="text-2xl font-bold text-emerald-500">
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
                              <button
                                onClick={(e) => handleContact(e, product)}
                                className="px-6 py-2.5 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors"
                              >
                                {t("products_contact")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.currentPage - 1 &&
                        pageNum <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${pagination.currentPage === pageNum ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.currentPage - 2 ||
                      pageNum === pagination.currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

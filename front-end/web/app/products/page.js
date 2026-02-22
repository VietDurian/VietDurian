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
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
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

    router.push("/chat");
  };

  // Fetch product types
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await productTypeAPI.getAllProductTypes({
          limit: 20,
        });
        if (response.code === 200 && response.data) {
          setProductTypes(response.data);
        }
      } catch (err) {
        console.error("Error fetching product types:", err);
      }
    };

    fetchProductTypes();
  }, []);

  // Fetch products
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

          // Fetch live ratings song song
          if (productsData.length > 0) {
            const ratingResults = await Promise.all(
              productsData.map(p =>
                ratingAPI.getRatingsByProductId(p._id, { limit: 1 })
                  .catch(() => null)
              )
            );
            const ratingsMap = {};
            productsData.forEach((p, i) => {
              const res = ratingResults[i];
              if (res?.success && res?.statistics) {
                ratingsMap[p._id] = parseFloat(res.statistics.averageRating || 0);
              }
            });
            setLiveRatings(ratingsMap);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, sortBy, sortOrder, selectedType, pagination.currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSortDropdownOpen &&
        !event.target.closest(".sort-dropdown-container")
      ) {
        setIsSortDropdownOpen(false);
      }
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
    { value: "created_at", label: "Mới nhất" },
    { value: "price", label: "Giá" },
    { value: "name", label: "Tên A-Z" },
    { value: "rating", label: "Đánh giá" },
    { value: "view_count", label: "Lượt xem" },
  ];

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    return option ? option.label : "Sắp xếp";
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 pt-32 pb-16 px-4">
        <div className="max-w-[1400px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sản Phẩm Sầu Riêng
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
            Khám phá bộ sưu tập sầu riêng chất lượng cao từ các vùng trồng nổi
            tiếng
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-white/30 focus:border-white focus:outline-none text-gray-900 placeholder-gray-500 bg-white transition-all duration-300"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors" />
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

      {/* Filter & Sort Section */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-6">
            {/* Product Type Filter */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                Loại sản phẩm
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType("")}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${selectedType === ""
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Tất cả
                  </span>
                </button>
                {productTypes.map((type) => (
                  <button
                    key={type._id}
                    onClick={() => setSelectedType(type._id)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${selectedType === type._id
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  Sắp xếp:
                </span>
                <div className="flex items-center gap-3 sort-dropdown-container">
                  {/* Custom Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                      className="min-w-[160px] px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
                    >
                      <span>{getCurrentSortLabel()}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isSortDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isSortDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                        {sortOptions.map((option, index) => (
                          <button
                            key={option.value}
                            onClick={() => handleSortChange(option.value)}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${sortBy === option.value
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

                  {/* Sort Order Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortOrder("asc")}
                      className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${sortOrder === "asc"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      title="Tăng dần"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSortOrder("desc")}
                      className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${sortOrder === "desc"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      title="Giảm dần"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products List Section */}
      <section className="py-16 px-4">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600">Đang tải sản phẩm...</p>
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
                  Thử lại
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Không tìm thấy sản phẩm nào
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                Tìm thấy{" "}
                <span className="font-semibold text-emerald-600">
                  {pagination.totalItems}
                </span>{" "}
                sản phẩm
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const rating = liveRatings[product._id] !== undefined
                    ? liveRatings[product._id]
                    : (typeof product.rating === "object" && product.rating.$numberDecimal
                      ? parseFloat(product.rating.$numberDecimal)
                      : parseFloat(product.rating || 0));

                  return (
                    <Link href={`/products/${product._id}`} key={product._id}>
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer group">
                        <div className="p-5">
                          {/* Hình ảnh không scale khi hover */}
                          <div className="relative rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
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

                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
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
                              <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                1 sản phẩm
                              </span>
                            </div>
                            <span className="text-2xl font-bold text-emerald-600">
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
                              className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors"
                            >
                              Liên Hệ
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
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
                          className={`px-4 py-2 rounded-lg border-2 transition-colors ${pagination.currentPage === pageNum
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
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

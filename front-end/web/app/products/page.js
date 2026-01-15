"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { productAPI, productTypeAPI } from "@/lib/api";

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
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 9
    });

    const handleImageError = (productId) => {
        setImageErrors(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    // Fetch product types
    useEffect(() => {
        const fetchProductTypes = async () => {
            try {
                const response = await productTypeAPI.getAllProductTypes({
                    limit: 20
                });
                if (response.code === 200 && response.data) {
                    setProductTypes(response.data);
                }
            } catch (err) {
                console.error('Error fetching product types:', err);
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
                    sortOrder
                };

                if (searchTerm) {
                    params.name = searchTerm;
                }

                if (selectedType) {
                    params.typeId = selectedType;
                }

                const response = await productAPI.getAllProducts(params);

                if (response.success) {
                    setProducts(response.data || []);
                    if (response.pagination) {
                        setPagination({
                            currentPage: response.pagination.currentPage,
                            totalPages: response.pagination.totalPages,
                            totalItems: response.pagination.totalItems,
                            itemsPerPage: response.pagination.itemsPerPage
                        });
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchTerm, sortBy, sortOrder, selectedType, pagination.currentPage]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSortDropdownOpen && !event.target.closest('.sort-dropdown-container')) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSortDropdownOpen]);

    const formatPrice = (price) => {
        const numericPrice = typeof price === 'object' && price.$numberDecimal
            ? parseFloat(price.$numberDecimal)
            : parseFloat(price);

        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(numericPrice);
    };

    const calculateDiscountedPrice = (price, discount) => {
        const numericPrice = typeof price === 'object' && price.$numberDecimal
            ? parseFloat(price.$numberDecimal)
            : parseFloat(price);
        const numericDiscount = typeof discount === 'object' && discount.$numberDecimal
            ? parseFloat(discount.$numberDecimal)
            : parseFloat(discount);

        return numericPrice - numericDiscount;
    };

    const calculateDiscountPercent = (price, discount) => {
        const numericPrice = typeof price === 'object' && price.$numberDecimal
            ? parseFloat(price.$numberDecimal)
            : parseFloat(price);
        const numericDiscount = typeof discount === 'object' && discount.$numberDecimal
            ? parseFloat(discount.$numberDecimal)
            : parseFloat(discount);

        if (numericDiscount === 0) return 0;
        return Math.round((numericDiscount / numericPrice) * 100);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const sortOptions = [
        { value: "created_at", label: "Mới nhất" },
        { value: "price", label: "Giá" },
        { value: "name", label: "Tên A-Z" },
        { value: "rating", label: "Đánh giá" },
        { value: "view_count", label: "Lượt xem" }
    ];

    const getCurrentSortLabel = () => {
        const option = sortOptions.find(opt => opt.value === sortBy);
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
                        Khám phá bộ sưu tập sầu riêng chất lượng cao từ các vùng trồng nổi tiếng
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
                            <svg
                                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
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
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
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
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
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
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Sắp xếp:</span>
                                <div className="flex items-center gap-3 sort-dropdown-container">
                                    {/* Custom Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                            className="min-w-[160px] px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
                                        >
                                            <span>{getCurrentSortLabel()}</span>
                                            <svg
                                                className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isSortDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                                {sortOptions.map((option, index) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleSortChange(option.value)}
                                                        className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${sortBy === option.value
                                                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            } ${index !== sortOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
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
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setSortOrder("desc")}
                                            className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${sortOrder === "desc"
                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            title="Giảm dần"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
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
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
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
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-gray-600">
                                Tìm thấy <span className="font-semibold text-emerald-600">{pagination.totalItems}</span> sản phẩm
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => {
                                    const price = typeof product.price === 'object' && product.price.$numberDecimal
                                        ? parseFloat(product.price.$numberDecimal)
                                        : parseFloat(product.price);
                                    const discount = typeof product.discount === 'object' && product.discount.$numberDecimal
                                        ? parseFloat(product.discount.$numberDecimal)
                                        : parseFloat(product.discount || 0);
                                    const rating = typeof product.rating === 'object' && product.rating.$numberDecimal
                                        ? parseFloat(product.rating.$numberDecimal)
                                        : parseFloat(product.rating || 0);

                                    return (
                                        <Link href={`/products/${product._id}`} key={product._id}>
                                            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group">
                                                <div className="p-4">
                                                    {/* Tăng chiều cao của hình từ h-48 lên h-64 */}
                                                    <div className="relative h-64 rounded-xl overflow-hidden mb-4">
                                                        {product.images && product.images.length > 0 ? (
                                                            <>
                                                                <Image
                                                                    src={imageErrors[product._id] ? "/images/Durian1.jpg" : product.images[0].url}
                                                                    alt={product.name}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                                    onError={() => handleImageError(product._id)}
                                                                />
                                                                {discount > 0 && (
                                                                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                                        -{calculateDiscountPercent(product.price, product.discount)}%
                                                                    </div>
                                                                )}
                                                                {product.stock <= 20 && (
                                                                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                                        Sắp hết
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Image
                                                                    src="/images/Durian1.jpg"
                                                                    alt={product.name}
                                                                    fill
                                                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                                />
                                                                {discount > 0 && (
                                                                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                                        -{calculateDiscountPercent(product.price, product.discount)}%
                                                                    </div>
                                                                )}
                                                                {product.stock <= 20 && (
                                                                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                                        Sắp hết
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                                        {product.name}
                                                    </h3>

                                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                                        {product.description}
                                                    </p>

                                                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>{product.view_count}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>{product.origin}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                                            </svg>
                                                            <span>{product.weight}kg</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-baseline gap-2 mb-3">
                                                        {discount > 0 ? (
                                                            <>
                                                                <span className="text-xl font-bold text-emerald-600">
                                                                    {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                                                                </span>
                                                                <span className="text-xs text-gray-400 line-through">
                                                                    {formatPrice(product.price)}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xl font-bold text-emerald-600">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span>{rating.toFixed(1)}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => e.preventDefault()}
                                                            className="px-5 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm"
                                                        >
                                                            Mua Ngay
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
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        const pageNum = index + 1;
                                        if (
                                            pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
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
                                            return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
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
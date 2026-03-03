"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    FileText,
    ArrowRight,
    Search,
    Eye,
    PhoneCall,
    TrendingDown,
    ShoppingBag,
    MapPin,
    Truck,
    MessageCircle,
    ClipboardList,
    CheckCircle2,
    Handshake,
    BookOpen,
    ClipboardCheck,
    Star,
    Weight,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { productAPI, blogAPI } from "@/lib/api";

export default function TraderHome() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [products, setProducts] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [imageErrors, setImageErrors] = useState({});

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await productAPI.getAllProducts({
                    sortBy: "rating",
                    sortOrder: "desc",
                    limit: 6,
                    page: 1,
                });
                if (response.success) {
                    setProducts(response.data || []);
                }
            } catch (err) {
                console.error("Error fetching top products:", err);
            }
        };
        fetchTopProducts();
    }, []);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                const result = await blogAPI.getAllBlogs({ sort: "newest" });
                if (result.code === 200 && result.data) {
                    setBlogs(result.data.slice(0, 4));
                }
            } catch (err) {
                console.error("Error fetching blogs:", err);
            }
        };
        fetchLatestBlogs();
    }, []);

    const handleImageError = (productId) => {
        setImageErrors((prev) => ({ ...prev, [productId]: true }));
    };

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const maxSlide = Math.max(products.length - 3, 0);
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % (maxSlide + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + (maxSlide + 1)) % (maxSlide + 1));

    const featuredBlog = blogs[0] || null;
    const otherBlogs = blogs.slice(1);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Hero ────────────────────────────────────────── */}
            <div className="pt-20 pb-12 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
                            <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
                            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
                            <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
                        </div>

                        <div className="relative z-10 px-8 md:px-16 pt-12 pb-14">
                            {/* Badge */}
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex items-center gap-2.5 bg-white/25 backdrop-blur-sm px-5 py-2 rounded-xl text-white text-base font-medium border border-white/30 shadow-lg">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span>Dành cho Thương lái thu mua sầu riêng</span>
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow leading-tight">
                                    Tìm nguồn hàng<br />Sầu Riêng chất lượng
                                </h1>
                                <p className="text-emerald-50 text-lg max-w-2xl mx-auto leading-relaxed">
                                    Kết nối trực tiếp với nông dân · Xem nhật ký canh tác minh bạch · Đảm bảo chất lượng từ vườn
                                </p>
                            </div>

                            {/* Action card */}
                            <div className="max-w-3xl mx-auto">
                                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                    {/* ── Card header: đổi sang amber/vàng cam để nổi bật ── */}
                                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-7">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                                <FileText className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-1">Tạo bài viết nhu cầu</h2>
                                                <p className="text-amber-100 text-sm">
                                                    Đăng yêu cầu thu mua để nông dân chủ động liên hệ với bạn
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-7">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Bạn có thể đăng loại bài nào?</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                                            {[
                                                { icon: <Search className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100", label: "Tìm nguồn hàng", desc: "Đặt mua lô sầu riêng theo giống, khu vực, sản lượng", tag: "Phổ biến", tagColor: "bg-emerald-500 text-white" },
                                                { icon: <BookOpen className="w-6 h-6 text-teal-600" />, bg: "bg-teal-50 border-teal-200 hover:bg-teal-100", label: "Kinh nghiệm", desc: "Chia sẻ bí quyết thu mua, kiểm tra chất lượng sầu riêng", tag: "Cộng đồng", tagColor: "bg-teal-500 text-white" },
                                                { icon: <Truck className="w-6 h-6 text-emerald-700" />, bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100", label: "Thuê dịch vụ", desc: "Tìm xe tải vận chuyển, đội bốc xếp sầu riêng", tag: "Hữu ích", tagColor: "bg-emerald-600 text-white" },
                                                { icon: <MessageCircle className="w-6 h-6 text-teal-700" />, bg: "bg-teal-50 border-teal-200 hover:bg-teal-100", label: "Khác", desc: "Thông báo giá thị trường, hỏi đáp, tìm đối tác", tag: "Tự do", tagColor: "bg-teal-600 text-white" },
                                            ].map((f) => (
                                                <div key={f.label} className={`relative ${f.bg} border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md`}>
                                                    <span className={`absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
                                                    <div className="flex justify-center mb-2 mt-1">{f.icon}</div>
                                                    <div className="font-bold text-gray-900 text-sm text-center mb-1">{f.label}</div>
                                                    <div className="text-gray-400 text-xs text-center leading-tight">{f.desc}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <Link
                                            href="/profile/posts/create"
                                            className="flex items-center justify-center gap-3 w-full bg-amber-400 hover:bg-amber-500 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-xl shadow-amber-400/30"
                                        >
                                            <FileText className="w-5 h-5" />
                                            Tạo bài viết nhu cầu ngay
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── How it works ────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 pt-14 pb-14">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quy trình tìm hàng</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">3 bước đơn giản để có nguồn sầu riêng chất lượng, không qua trung gian</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { step: "01", icon: <ClipboardList className="w-7 h-7 text-white" />, iconBg: "bg-emerald-500", topBar: "bg-emerald-500", stepColor: "text-emerald-500", title: "Đăng bài nhu cầu", desc: "Mô tả giống sầu riêng, số lượng tấn, khu vực thu mua và mức giá mong muốn. Nông dân trong khu vực sẽ chủ động liên hệ với bạn.", highlight: "Miễn phí đăng bài" },
                        { step: "02", icon: <Eye className="w-7 h-7 text-white" />, iconBg: "bg-teal-500", topBar: "bg-teal-500", stepColor: "text-teal-500", title: "Xem nhật ký vườn", desc: "Tra cứu toàn bộ lịch sử canh tác — phân bón, thuốc BVTV, ngày bón, sản lượng dự kiến — để đánh giá chất lượng trước khi quyết định.", highlight: "Minh bạch 100%" },
                        { step: "03", icon: <Handshake className="w-7 h-7 text-white" />, iconBg: "bg-emerald-600", topBar: "bg-emerald-600", stepColor: "text-emerald-600", title: "Liên hệ & chốt mua", desc: "Chat trực tiếp với nông dân, đặt lịch thăm vườn thực tế, thống nhất giá và chốt hợp đồng thu mua ngay tại vườn — không qua môi giới.", highlight: "Không qua trung gian" },
                    ].map((s, i) => (
                        <div key={s.step} className="relative group">
                            {i < 2 && (
                                <div className="hidden md:flex absolute -right-3 top-14 z-10 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 items-center justify-center">
                                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                            )}
                            <div className={`h-1.5 ${s.topBar} rounded-t-2xl`}></div>
                            <div className="bg-white rounded-b-2xl p-7 shadow-md group-hover:shadow-xl transition-shadow border border-gray-100 border-t-0">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center p-3 shadow-md`}>{s.icon}</div>
                                    <span className={`text-5xl font-black ${s.stepColor} opacity-20 leading-none`}>{s.step}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 text-xl mb-3">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span className="text-emerald-700 text-xs font-semibold">{s.highlight}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Platform advantages — redesigned: light bg, no dark green ── */}
            <div className="bg-white py-16 px-4 border-y border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-3 border border-emerald-200 uppercase tracking-widest">Tại sao chọn chúng tôi</span>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lợi thế của nền tảng</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Tại sao thương lái chọn DurianFarm để tìm nguồn hàng?</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Search className="w-7 h-7 text-white" />,
                                iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
                                border: "border-emerald-200",
                                accent: "bg-emerald-50",
                                num: "01",
                                numColor: "text-emerald-100",
                                title: "Tìm kiếm thông minh",
                                titleColor: "text-gray-900",
                                desc: "Lọc chính xác theo khu vực, giống cây (Ri6, Musang King...), thời gian thu hoạch và sản lượng ước tính. Xem vị trí vườn trên bản đồ trực tiếp.",
                                descColor: "text-gray-500",
                                tags: ["Lọc đa tiêu chí", "Bản đồ vườn"],
                                tagBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
                                checkColor: "text-emerald-500",
                            },
                            {
                                // Đổi icon: dùng ClipboardCheck thay cho Eye
                                icon: <ClipboardCheck className="w-7 h-7 text-white" />,
                                iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
                                border: "border-amber-200",
                                accent: "bg-amber-50",
                                num: "02",
                                numColor: "text-amber-100",
                                title: "Nhật ký canh tác minh bạch",
                                titleColor: "text-gray-900",
                                desc: "Xem đầy đủ lịch sử phân bón, thuốc BVTV, ngày chăm sóc và sản lượng dự kiến — trước khi quyết định thu mua, không cần đến tận nơi.",
                                descColor: "text-gray-500",
                                tags: ["Lịch sử canh tác", "Sản lượng ước tính"],
                                tagBg: "bg-amber-100 text-amber-700 border-amber-200",
                                checkColor: "text-amber-500",
                            },
                            {
                                icon: <TrendingDown className="w-7 h-7 text-white" />,
                                iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
                                border: "border-teal-200",
                                accent: "bg-teal-50",
                                num: "03",
                                numColor: "text-teal-100",
                                title: "Giảm chi phí trung gian",
                                titleColor: "text-gray-900",
                                desc: "Chat và thương lượng giá trực tiếp với nông dân. Không qua môi giới, không mất phí hoa hồng — lợi nhuận thu mua tối ưu hơn.",
                                descColor: "text-gray-500",
                                tags: ["Chat trực tiếp", "Không hoa hồng"],
                                tagBg: "bg-teal-100 text-teal-700 border-teal-200",
                                checkColor: "text-teal-500",
                            },
                        ].map((a) => (
                            <div key={a.title} className={`bg-white border ${a.border} rounded-2xl p-7 hover:shadow-xl transition-all group relative overflow-hidden`}>
                                {/* subtle accent bg corner */}
                                <div className={`absolute -top-8 -right-8 w-32 h-32 ${a.accent} rounded-full opacity-60`}></div>
                                <div className="relative flex items-start gap-4 mb-5">
                                    <div className={`w-14 h-14 ${a.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>{a.icon}</div>
                                    <span className={`text-5xl font-black ${a.numColor} leading-none mt-1`}>{a.num}</span>
                                </div>
                                <h3 className={`relative font-bold ${a.titleColor} text-lg mb-3`}>{a.title}</h3>
                                <p className={`relative ${a.descColor} text-sm leading-relaxed mb-4`}>{a.desc}</p>
                                <div className="relative flex flex-wrap gap-2">
                                    {a.tags.map((t) => (
                                        <span key={t} className={`${a.tagBg} text-xs font-medium px-3 py-1 rounded-full border`}>✓ {t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Featured Products (từ guest) ─────────────────── */}
            <section className="relative py-16 px-4 lg:px-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Sản Phẩm Nổi Bật</h2>
                    {products.length === 0 ? (
                        <div className="text-center text-emerald-200 py-10">Đang tải sản phẩm...</div>
                    ) : (
                        <div className="relative px-12">
                            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-500 transition-all flex items-center justify-center shadow-lg hover:scale-105">
                                <ChevronLeft className="w-6 h-6 text-emerald-900" strokeWidth={2.5} />
                            </button>
                            <div className="overflow-hidden">
                                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}>
                                    {products.map((product) => {
                                        const rating = typeof product.rating === "object" && product.rating.$numberDecimal
                                            ? parseFloat(product.rating.$numberDecimal)
                                            : parseFloat(product.rating || 0);
                                        return (
                                            <div key={product._id} className="w-1/3 flex-shrink-0 px-3">
                                                <Link href={`/products/${product._id}`}>
                                                    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 cursor-pointer group">
                                                        <div className="p-5">
                                                            <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ aspectRatio: '16/9' }}>
                                                                {product.images && product.images.length > 0 ? (
                                                                    <Image src={imageErrors[product._id] ? "/images/Durian1.jpg" : product.images[0].url} alt={product.name} fill unoptimized className="object-cover" onError={() => handleImageError(product._id)} />
                                                                ) : (
                                                                    <Image src="/images/Durian1.jpg" alt={product.name} fill className="object-cover" />
                                                                )}
                                                            </div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                                                            <p className="text-base text-gray-600 mb-4 line-clamp-1">{product.description}</p>
                                                            <div className="flex items-center gap-5 mb-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-emerald-600" /><span>{product.view_count}</span></div>
                                                                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-600" /><span>{product.origin}</span></div>
                                                                <div className="flex items-center gap-1.5"><Weight className="w-4 h-4 text-emerald-600" /><span>{product.weight}kg</span></div>
                                                            </div>
                                                            <div className="mb-4">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="text-sm text-gray-500">Giá tham khảo</p>
                                                                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">1 sản phẩm</span>
                                                                </div>
                                                                <span className="text-2xl font-bold text-emerald-600">{formatPrice(product.price)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                                    <span className="font-medium">{rating.toFixed(1)}</span>
                                                                </div>
                                                                <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">Liên hệ</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-500 transition-all flex items-center justify-center shadow-lg hover:scale-105">
                                <ChevronRight className="w-6 h-6 text-emerald-900" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Blog Mới (từ guest) ──────────────────────────── */}
            <section className="py-16 px-4 lg:px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Blog Mới</h2>
                    {blogs.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">Đang tải bài viết...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {featuredBlog && (
                                <Link href={`/blogs/${featuredBlog._id}`} className="block h-full">
                                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                                        <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
                                            <Image src={featuredBlog.image || "/images/Durian1.jpg"} alt={featuredBlog.title} fill className="object-cover" />
                                        </div>
                                        <div className="p-6 flex-shrink-0">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">{featuredBlog.title}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">{formatDate(featuredBlog.created_at)}</span>
                                                <span className="text-emerald-600 font-medium">Đọc thêm</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )}
                            <div className="flex flex-col gap-0 h-full">
                                {otherBlogs.map((blog, idx) => (
                                    <Link href={`/blogs/${blog._id}`} key={blog._id} className={`block flex-1 ${idx < otherBlogs.length - 1 ? "mb-4" : ""}`}>
                                        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 flex cursor-pointer h-full">
                                            <div className="relative w-70 flex-shrink-0 overflow-hidden bg-gray-100">
                                                <Image src={blog.image || "/images/Durian2.jpg"} alt={blog.title} fill className="object-cover" />
                                            </div>
                                            <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                                                <h3 className="text-base font-bold text-gray-900 line-clamp-2">{blog.title}</h3>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm text-gray-500">{formatDate(blog.created_at)}</span>
                                                    <span className="text-emerald-600 font-medium text-sm flex-shrink-0 ml-2">Đọc thêm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA — xuống cuối, sau blog ──────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-12 text-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-3">Bắt đầu tìm nguồn hàng ngay hôm nay</h2>
                        <p className="text-amber-100 mb-8 max-w-xl mx-auto">
                            Đăng bài viết nhu cầu và để nông dân chủ động liên hệ với bạn
                        </p>
                        <Link
                            href="/profile/posts/create"
                            className="inline-flex items-center gap-3 bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-xl font-bold transition-colors shadow-xl"
                        >
                            <FileText className="w-5 h-5" />
                            Tạo bài viết nhu cầu
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
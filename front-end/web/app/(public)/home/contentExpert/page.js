"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    BookOpen, ArrowRight, CheckCircle2, Lightbulb, GraduationCap,
    Pen, Globe, Heart, Award, Users, Sprout, Droplets, Scissors,
    MessageCircle, Truck, ClipboardList, FlaskConical, Bug, Leaf,
    SunMedium, BookMarked, PenLine, Layers, Zap, Eye, ThumbsUp,
    BadgeCheck, Star, MapPin, Weight, ChevronLeft, ChevronRight,
} from "lucide-react";
import { productAPI, blogAPI } from "@/lib/api";

const POST_TYPES = [
    { icon: <ClipboardList className="w-5 h-5 text-amber-700" />, bg: "bg-amber-50 border-amber-300 hover:border-amber-500 hover:bg-amber-100", label: "Quy trình chuẩn", desc: "Chia sẻ quy trình canh tác, chăm sóc sầu riêng từng giai đoạn", tag: "Phổ biến", tagColor: "bg-amber-500 text-white" },
    { icon: <BookOpen className="w-5 h-5 text-yellow-700" />, bg: "bg-yellow-50 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-100", label: "Kinh nghiệm", desc: "Bí quyết thực tế, bài học từ nhiều năm trồng và chăm sóc sầu riêng", tag: "Cộng đồng", tagColor: "bg-yellow-600 text-white" },
    { icon: <Truck className="w-5 h-5 text-amber-800" />, bg: "bg-amber-50 border-amber-300 hover:border-amber-500 hover:bg-amber-100", label: "Thuê dịch vụ", desc: "Tìm xe vận chuyển, đội thu hoạch, phun thuốc, bón phân thuê", tag: "Hữu ích", tagColor: "bg-amber-700 text-white" },
    { icon: <MessageCircle className="w-5 h-5 text-yellow-800" />, bg: "bg-yellow-50 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-100", label: "Khác", desc: "Hỏi đáp, thông báo, chia sẻ thông tin hữu ích về ngành sầu riêng", tag: "Tự do", tagColor: "bg-yellow-700 text-white" },
];

const BLOG_FEATURES = [
    { icon: <Layers className="w-5 h-5 text-emerald-600" />, label: "Cấu trúc rõ ràng theo từng phần" },
    { icon: <Zap className="w-5 h-5 text-emerald-600" />, label: "Thêm hình ảnh, video minh họa" },
    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, label: "Tài liệu tham khảo khoa học" },
    { icon: <BookMarked className="w-5 h-5 text-emerald-600" />, label: "Cập nhật theo mùa vụ thực tế" },
    { icon: <Users className="w-5 h-5 text-emerald-600" />, label: "Nông dân có thể hỏi & đánh giá" },
];

const TOPICS = [
    { icon: <Sprout className="w-5 h-5 text-emerald-600" />, name: "Chọn giống", desc: "Hướng dẫn chọn giống Ri6, Musang King, Monthong phù hợp vùng đất" },
    { icon: <Droplets className="w-5 h-5 text-emerald-600" />, name: "Kỹ thuật tưới", desc: "Tưới nhỏ giọt, tưới phun — tiết kiệm nước, đúng giai đoạn sinh trưởng" },
    { icon: <Lightbulb className="w-5 h-5 text-emerald-600" />, name: "Bón phân", desc: "Lịch bón theo từng giai đoạn: ra lá, ra hoa, nuôi trái, sau thu hoạch" },
    { icon: <Scissors className="w-5 h-5 text-emerald-600" />, name: "Cắt tỉa", desc: "Tỉa cành tạo tán thông thoáng, kích thích ra hoa đồng loạt đúng mùa" },
    { icon: <Bug className="w-5 h-5 text-emerald-600" />, name: "Phòng & trị bệnh", desc: "Nhận biết sớm thối rễ, xì mủ, rầy, nhện đỏ và cách xử lý hiệu quả" },
    { icon: <SunMedium className="w-5 h-5 text-emerald-600" />, name: "Thu hoạch", desc: "Nhận biết sầu riêng chín, thời điểm hái và bảo quản sau thu hoạch" },
    { icon: <FlaskConical className="w-5 h-5 text-emerald-600" />, name: "Thuốc BVTV", desc: "Dùng đúng loại, đúng liều — an toàn cho người, đạt chuẩn xuất khẩu" },
    { icon: <Leaf className="w-5 h-5 text-emerald-600" />, name: "Canh tác hữu cơ", desc: "Hướng đến VietGAP, GlobalGAP — nâng giá trị và mở rộng thị trường" },
    { icon: <BookMarked className="w-5 h-5 text-emerald-600" />, name: "Nhật ký vườn", desc: "Cách ghi chép nhật ký canh tác minh bạch để nông dân dễ theo dõi và truy xuất" },
];

const BLOG_STEPS = [
    { step: "01", icon: <PenLine className="w-8 h-8" />, title: "Chọn chủ đề & soạn nội dung", desc: "Chọn chủ đề canh tác bạn am hiểu, viết bài có cấu trúc rõ ràng với hình ảnh và tài liệu tham khảo.", color: "from-emerald-400 to-emerald-600", glow: "shadow-emerald-500/40" },
    { step: "02", icon: <Layers className="w-8 h-8" />, title: "Tổ chức theo từng block", desc: "Nội dung được chia thành các phần — giới thiệu, các bước thực hiện, lưu ý — dễ đọc và dễ áp dụng tại vườn.", color: "from-yellow-400 to-yellow-500", glow: "shadow-yellow-500/40" },
    { step: "03", icon: <BadgeCheck className="w-8 h-8" />, title: "Đăng & lan tỏa", desc: "Bài viết hiển thị cho toàn bộ nông dân trên nền tảng. Nông dân có thể lưu và đặt câu hỏi trực tiếp với bạn.", color: "from-teal-400 to-emerald-500", glow: "shadow-teal-500/40" },
];

const EXPERT_ACTIONS = [
    {
        icon: <BookOpen className="w-5 h-5 text-white" />,
        title: "Viết Blog & chuẩn hóa quy trình canh tác",
        desc: "Soạn bài blog kỹ thuật đầy đủ từ chọn giống, bón phân, tưới nước đến thu hoạch. Nội dung có căn cứ khoa học, cấu trúc theo từng mục rõ ràng — giúp nông dân làm đúng ngay từ đầu mà không cần kinh nghiệm nhiều năm.",
        tags: ["Blog kiến thức", "Quy trình chuẩn"],
    },
    {
        icon: <Zap className="w-5 h-5 text-white" />,
        title: "Đăng bài chia sẻ kinh nghiệm & mẹo thực tế",
        desc: "Viết bài ngắn chia sẻ bí quyết canh tác, cảnh báo dịch bệnh theo mùa, mẹo tưới tiết kiệm nước — súc tích, dễ đọc, dễ áp dụng ngay tại vườn mà không cần kiến thức chuyên sâu.",
        tags: ["Kinh nghiệm thực tế", "Mẹo canh tác"],
    },
    {
        icon: <Users className="w-5 h-5 text-white" />,
        title: "Kết nối cộng đồng & hỗ trợ dịch vụ",
        desc: "Hỏi đáp, tư vấn thuê dịch vụ vận chuyển, thu hoạch, phun thuốc — thảo luận và giải đáp thắc mắc trực tiếp với hàng nghìn nông dân trên nền tảng. Xây dựng uy tín chuyên gia qua tương tác cộng đồng.",
        tags: ["Hỏi & đáp", "Thuê dịch vụ"],
    },
];

function ExpertAccordion() {
    const [open, setOpen] = useState(0);
    return (
        <div className="bg-white py-20 px-4 border-y border-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-14">
                    <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">Vai trò của bạn</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Chuyên gia nội dung có thể làm gì?</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Bạn là người cung cấp tri thức — cầu nối giữa kiến thức khoa học và thực tiễn canh tác của nông dân</p>
                </div>
                <div className="max-w-4xl mx-auto space-y-3">
                    {EXPERT_ACTIONS.map((item, idx) => {
                        const isOpen = open === idx;
                        return (
                            <div key={idx} className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isOpen ? "border-emerald-300 shadow-lg" : "border-gray-100 shadow-sm"}`}>
                                <button
                                    onClick={() => setOpen(isOpen ? -1 : idx)}
                                    className={`w-full flex items-center gap-5 px-7 py-6 text-left transition-all duration-300 ${isOpen ? "bg-emerald-500" : "bg-white hover:bg-gray-50"}`}
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black transition-all duration-300 ${isOpen ? "bg-white/25 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                                        {String(idx + 1).padStart(2, "0")}
                                    </div>
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-white/20" : "bg-emerald-500"}`}>
                                        <div className="scale-125">{item.icon}</div>
                                    </div>
                                    <span className={`font-bold text-lg flex-1 transition-colors duration-300 ${isOpen ? "text-white" : "text-gray-900"}`}>{item.title}</span>
                                    <svg className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60" : "max-h-0"}`}>
                                    <div className="px-7 py-6 bg-emerald-50 border-t border-emerald-100">
                                        <p className="text-gray-600 text-base leading-relaxed mb-4">{item.desc}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.tags.map((t) => (
                                                <span key={t} className="bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function ContentExpertHome() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [products, setProducts] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [imageErrors, setImageErrors] = useState({});

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await productAPI.getAllProducts({ sortBy: "rating", sortOrder: "desc", limit: 6, page: 1 });
                if (response.success) setProducts(response.data || []);
            } catch (err) { console.error(err); }
        };
        fetchTopProducts();
    }, []);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                const result = await blogAPI.getAllBlogs({ sort: "newest" });
                if (result.code === 200 && result.data) setBlogs(result.data.slice(0, 4));
            } catch (err) { console.error(err); }
        };
        fetchLatestBlogs();
    }, []);

    const handleImageError = (id) => setImageErrors((prev) => ({ ...prev, [id]: true }));

    const formatPrice = (price) => {
        const n = typeof price === "object" && price.$numberDecimal ? parseFloat(price.$numberDecimal) : parseFloat(price);
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

    const maxSlide = Math.max(products.length - 3, 0);
    const nextSlide = () => setCurrentSlide((p) => (p + 1) % (maxSlide + 1));
    const prevSlide = () => setCurrentSlide((p) => (p - 1 + (maxSlide + 1)) % (maxSlide + 1));

    const featuredBlog = blogs[0] || null;
    const otherBlogs = blogs.slice(1);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Hero ─────────────────────────────────────────── */}
            <div className="pt-20 pb-12 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
                            <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
                            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
                            <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
                            <div className="absolute top-1/3 left-10 w-16 h-16 border-2 border-white/20 rounded-xl -rotate-6"></div>
                            <div className="absolute top-2/3 right-24 w-12 h-12 border-2 border-white/15 rounded-lg rotate-12"></div>
                        </div>
                        <div className="relative z-10 px-8 md:px-16 pt-12 pb-14">
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex items-center gap-2.5 bg-white/25 backdrop-blur-sm px-5 py-2 rounded-xl text-white text-base font-medium border border-white/30 shadow-lg">
                                    <GraduationCap className="w-5 h-5" />
                                    <span>Dành cho Chuyên gia nội dung nông nghiệp</span>
                                </div>
                            </div>
                            <div className="text-center mb-10">
                                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow leading-tight">
                                    Chia sẻ Kiến thức<br />
                                    <span className="text-yellow-300">Canh tác Sầu Riêng</span>
                                </h1>
                                <p className="text-emerald-50 text-lg max-w-2xl mx-auto leading-relaxed">
                                    Chuẩn hóa quy trình · Lan tỏa kiến thức · Hỗ trợ nông dân làm đúng kỹ thuật
                                </p>
                            </div>

                            {/* ── 2 Action cards — SQUARE ── */}
                            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">

                                {/* Card 1 — Tạo bài viết (VÀNG) */}
                                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden shadow-black/20 flex flex-col" style={{ minHeight: "520px" }}>
                                    <div className="bg-gradient-to-r from-yellow-400 to-amber-400 p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ring-white/20">
                                                <Pen className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-1 bg-white/25 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/40 mb-1">ĐĂNG BÀI</div>
                                                <h3 className="text-white font-bold text-xl">Tạo bài viết</h3>
                                                <p className="text-yellow-100 text-sm mt-1">Đăng bài để chia sẻ với cộng đồng nông dân</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white flex flex-col flex-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Bạn có thể đăng loại bài nào?</p>
                                        <div className="grid grid-cols-2 gap-2.5 flex-1">
                                            {POST_TYPES.map((f) => (
                                                <div key={f.label} className={`relative ${f.bg} border-2 rounded-xl p-3.5 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center`}>
                                                    <span className={`absolute -top-2 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
                                                    <div className="mb-2 mt-1">{f.icon}</div>
                                                    <div className="font-bold text-gray-800 text-xs text-center mb-1">{f.label}</div>
                                                    <div className="text-gray-500 text-[11px] text-center leading-tight">{f.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <Link href="/profile/posts/create" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-md mt-6">
                                            <Pen className="w-5 h-5" />Tạo bài viết ngay<ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Card 2 — Viết Blog (XANH SOLID) */}
                                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden shadow-black/20 flex flex-col" style={{ minHeight: "520px" }}>
                                    <div className="bg-emerald-500 p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ring-white/10">
                                                <Globe className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/40 mb-1">BLOG CHUYÊN SÂU</div>
                                                <h3 className="text-white font-bold text-xl">Viết Blog kiến thức</h3>
                                                <p className="text-emerald-100 text-sm mt-1">Chuẩn hóa kiến thức canh tác cho nông dân</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white flex flex-col flex-1">
                                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                                            Soạn bài blog chuyên sâu về kỹ thuật canh tác — nội dung được tổ chức thành các mục rõ ràng, dễ đọc và dễ áp dụng cho nông dân.
                                        </p>
                                        <ul className="space-y-2.5 flex-1">
                                            {BLOG_FEATURES.map((f) => (
                                                <li key={f.label} className="flex items-center gap-3 text-sm text-gray-700">
                                                    <span className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {f.icon}
                                                    </span>
                                                    {f.label}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href="/profile/blogs/create" className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-md mt-6">
                                            <Globe className="w-5 h-5" />Viết Blog kiến thức<ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Chuyên gia có thể làm gì? — ACCORDION ── */}
            <ExpertAccordion />

            {/* ── Quy trình viết Blog ──────────────────────────── */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-yellow-400/30 uppercase tracking-widest">3 bước đơn giản</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Quy trình viết Blog kiến thức</h2>
                        <p className="text-emerald-300 max-w-xl mx-auto">Từ ý tưởng đến bài viết chất lượng — lan tỏa đến hàng nghìn nông dân</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-0 relative">
                        <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-yellow-400 via-emerald-400 to-yellow-400 z-0"></div>
                        {BLOG_STEPS.map((s) => (
                            <div key={s.step} className="flex flex-col items-center text-center px-6 relative z-10">
                                <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-2xl ${s.glow} mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 group`}>
                                    <div className="-rotate-3 group-hover:rotate-0 transition-transform duration-300 flex flex-col items-center gap-1">
                                        <span className="text-white/70 text-xs font-black tracking-widest">{s.step}</span>
                                        <div className="text-white">{s.icon}</div>
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-xl mb-3">{s.title}</h3>
                                <p className="text-emerald-300 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Chủ đề nông dân quan tâm ────────────────────── */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">Gợi ý nội dung</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Chủ đề nông dân quan tâm nhất</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Chọn một chủ đề và bắt đầu đóng góp kiến thức của bạn</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {TOPICS.map((t) => (
                            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group cursor-pointer">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">{t.icon}</div>
                                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Lợi ích chia sẻ kiến thức — light bg like Trader ── */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">Tại sao đóng góp</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Lợi ích khi chia sẻ kiến thức</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Kiến thức của bạn có thể thay đổi cách hàng nghìn nông dân canh tác</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Award className="w-8 h-8 text-emerald-900" />, num: "01", title: "Xây dựng uy tín chuyên gia", desc: "Bài viết chất lượng giúp bạn được cộng đồng nông dân và thương lái nhận diện là chuyên gia uy tín trong ngành.", tags: ["Huy hiệu Chuyên gia", "Được cộng đồng tin tưởng"] },
                            { icon: <Eye className="w-8 h-8 text-emerald-900" />, num: "02", title: "Tiếp cận cộng đồng rộng", desc: "Blog và bài viết của bạn hiển thị cho toàn bộ nông dân, thương lái trên nền tảng — không giới hạn phạm vi địa lý.", tags: ["Hiển thị toàn quốc", "Không giới hạn"] },
                            { icon: <Heart className="w-8 h-8 text-emerald-900" />, num: "03", title: "Góp phần phát triển ngành", desc: "Chuẩn hóa quy trình canh tác, nâng cao chất lượng sầu riêng Việt Nam — hướng tới tiêu chuẩn xuất khẩu quốc tế.", tags: ["Đóng góp cộng đồng", "Nâng chuẩn ngành"] },
                        ].map((b) => (
                            <div key={b.title} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="h-1.5 bg-emerald-500"></div>
                                <div className="p-7">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{b.icon}</div>
                                        <span className="text-6xl font-black text-emerald-200 leading-none">{b.num}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-emerald-700 transition-colors">{b.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{b.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {b.tags.map((t) => (
                                            <span key={t} className="bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full">
                                                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Sản Phẩm Nổi Bật ────────────────────────────── */}
            <section className="relative py-16 px-4 lg:px-6 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
                </div>
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Sản Phẩm Nổi Bật</h2>
                    {products.length === 0 ? (
                        <div className="text-center text-emerald-200 py-10">Đang tải sản phẩm...</div>
                    ) : (
                        <div className="relative px-12">
                            <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105">
                                <ChevronLeft className="w-6 h-6 text-emerald-900" strokeWidth={2.5} />
                            </button>
                            <div className="overflow-hidden">
                                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}>
                                    {products.map((product) => {
                                        const rating = typeof product.rating === "object" && product.rating.$numberDecimal ? parseFloat(product.rating.$numberDecimal) : parseFloat(product.rating || 0);
                                        return (
                                            <div key={product._id} className="w-1/3 flex-shrink-0 px-3">
                                                <Link href={`/products/${product._id}`}>
                                                    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 cursor-pointer group">
                                                        <div className="p-5">
                                                            <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-3" style={{ aspectRatio: "16/9" }}>
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
                            <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-lime-400 hover:bg-lime-500 transition-all flex items-center justify-center shadow-lg hover:scale-105">
                                <ChevronRight className="w-6 h-6 text-emerald-900" strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Blog Mới Nhất ────────────────────────────────── */}
            <section className="py-16 px-4 lg:px-6 bg-gray-50">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Blog Kiến Thức Mới Nhất</h2>
                    {blogs.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">Đang tải bài viết...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {featuredBlog && (
                                <Link href={`/blogs/${featuredBlog._id}`} className="block h-full">
                                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col">
                                        <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
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
                                            <div className="relative w-40 flex-shrink-0 overflow-hidden bg-gray-100">
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

            {/* ── CTA ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="bg-emerald-500 rounded-3xl p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">Bắt đầu chia sẻ kiến thức ngay hôm nay</h2>
                    <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                        Hàng nghìn nông dân đang chờ đọc kiến thức và kinh nghiệm của bạn
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/profile/posts/create" className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl">
                            <Pen className="w-5 h-5" />
                            Tạo bài viết
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/profile/blogs/create" className="inline-flex items-center gap-3 bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold transition-colors shadow-xl">
                            <Globe className="w-5 h-5" />
                            Viết Blog kiến thức
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
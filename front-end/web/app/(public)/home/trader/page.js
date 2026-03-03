"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
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
    Users,
} from "lucide-react";

export default function TraderHome() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Hero ────────────────────────────────────────── */}
            <div className="pt-20 pb-12 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Decorations */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
                            <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
                            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
                            <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
                        </div>

                        <div className="relative z-10 px-8 md:px-16 pt-12 pb-14">
                            {/* Badge — bigger */}
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
                                    {/* Card header */}
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-7 relative overflow-hidden">
                                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-2xl rotate-12"></div>
                                        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-xl -rotate-6"></div>
                                        <div className="relative flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-8 h-8 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-1">Tạo bài viết nhu cầu</h2>
                                                <p className="text-emerald-100 text-sm">
                                                    Đăng yêu cầu thu mua để nông dân chủ động liên hệ với bạn
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card body — post types only, prominent */}
                                    <div className="p-7">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Bạn có thể đăng loại bài nào?</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                                            {[
                                                {
                                                    icon: <Search className="w-6 h-6 text-emerald-600" />,
                                                    bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
                                                    label: "Tìm nguồn hàng",
                                                    desc: "Đặt mua lô sầu riêng theo giống, khu vực, sản lượng",
                                                    tag: "Phổ biến",
                                                    tagColor: "bg-emerald-500 text-white",
                                                },
                                                {
                                                    icon: <BookOpen className="w-6 h-6 text-teal-600" />,
                                                    bg: "bg-teal-50 border-teal-200 hover:bg-teal-100",
                                                    label: "Kinh nghiệm",
                                                    desc: "Chia sẻ bí quyết thu mua, kiểm tra chất lượng sầu riêng",
                                                    tag: "Cộng đồng",
                                                    tagColor: "bg-teal-500 text-white",
                                                },
                                                {
                                                    icon: <Truck className="w-6 h-6 text-emerald-700" />,
                                                    bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
                                                    label: "Thuê dịch vụ",
                                                    desc: "Tìm xe tải vận chuyển, đội bốc xếp sầu riêng",
                                                    tag: "Hữu ích",
                                                    tagColor: "bg-emerald-600 text-white",
                                                },
                                                {
                                                    icon: <MessageCircle className="w-6 h-6 text-teal-700" />,
                                                    bg: "bg-teal-50 border-teal-200 hover:bg-teal-100",
                                                    label: "Khác",
                                                    desc: "Thông báo giá thị trường, hỏi đáp, tìm đối tác",
                                                    tag: "Tự do",
                                                    tagColor: "bg-teal-600 text-white",
                                                },
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
                                            href="#"
                                            className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-xl shadow-emerald-500/30"
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

            {/* ── How it works — bold numbered timeline ───────── */}
            <div className="max-w-7xl mx-auto px-4 pt-14 pb-14">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quy trình tìm hàng</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">3 bước đơn giản để có nguồn sầu riêng chất lượng, không qua trung gian</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        {
                            step: "01",
                            icon: <ClipboardList className="w-7 h-7 text-white" />,
                            iconBg: "bg-emerald-500",
                            cardBg: "bg-white",
                            topBar: "bg-emerald-500",
                            stepColor: "text-emerald-500",
                            title: "Đăng bài nhu cầu",
                            desc: "Mô tả giống sầu riêng, số lượng tấn, khu vực thu mua và mức giá mong muốn. Nông dân trong khu vực sẽ chủ động liên hệ với bạn.",
                            highlight: "Miễn phí đăng bài",
                        },
                        {
                            step: "02",
                            icon: <Eye className="w-7 h-7 text-white" />,
                            iconBg: "bg-teal-500",
                            cardBg: "bg-white",
                            topBar: "bg-teal-500",
                            stepColor: "text-teal-500",
                            title: "Xem nhật ký vườn",
                            desc: "Tra cứu toàn bộ lịch sử canh tác — phân bón, thuốc BVTV, ngày bón, sản lượng dự kiến — để đánh giá chất lượng trước khi quyết định.",
                            highlight: "Minh bạch 100%",
                        },
                        {
                            step: "03",
                            icon: <Handshake className="w-7 h-7 text-white" />,
                            iconBg: "bg-emerald-600",
                            cardBg: "bg-white",
                            topBar: "bg-emerald-600",
                            stepColor: "text-emerald-600",
                            title: "Liên hệ & chốt mua",
                            desc: "Chat trực tiếp với nông dân, đặt lịch thăm vườn thực tế, thống nhất giá và chốt hợp đồng thu mua ngay tại vườn — không qua môi giới.",
                            highlight: "Không qua trung gian",
                        },
                    ].map((s, i) => (
                        <div key={s.step} className="relative group">
                            {i < 2 && (
                                <div className="hidden md:flex absolute -right-3 top-14 z-10 w-7 h-7 bg-white rounded-full shadow-md border border-gray-100 items-center justify-center">
                                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                            )}
                            {/* top color bar */}
                            <div className={`h-1.5 ${s.topBar} rounded-t-2xl`}></div>
                            <div className={`${s.cardBg} rounded-b-2xl p-7 shadow-md group-hover:shadow-xl transition-shadow border border-gray-100 border-t-0`}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-13 h-13 ${s.iconBg} rounded-xl flex items-center justify-center p-3 shadow-md`}>
                                        {s.icon}
                                    </div>
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

            {/* ── Platform advantages — bold icon cards ───────── */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-2">Lợi thế của nền tảng</h2>
                        <p className="text-emerald-300 max-w-xl mx-auto">Tại sao thương lái chọn DurianFarm để tìm nguồn hàng?</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Search className="w-8 h-8 text-emerald-900" />,
                                iconBg: "bg-emerald-300",
                                num: "01",
                                title: "Tìm kiếm thông minh",
                                desc: "Lọc chính xác theo khu vực, giống cây (Ri6, Musang King...), thời gian thu hoạch và sản lượng ước tính. Xem vị trí vườn trên bản đồ trực tiếp.",
                                tags: ["Lọc đa tiêu chí", "Bản đồ vườn"],
                            },
                            {
                                icon: <Eye className="w-8 h-8 text-teal-900" />,
                                iconBg: "bg-teal-300",
                                num: "02",
                                title: "Nhật ký canh tác minh bạch",
                                desc: "Xem đầy đủ lịch sử phân bón, thuốc BVTV, ngày chăm sóc và sản lượng dự kiến — trước khi quyết định thu mua, không cần đến tận nơi.",
                                tags: ["Lịch sử canh tác", "Sản lượng ước tính"],
                            },
                            {
                                icon: <TrendingDown className="w-8 h-8 text-emerald-900" />,
                                iconBg: "bg-emerald-300",
                                num: "03",
                                title: "Giảm chi phí trung gian",
                                desc: "Chat và thương lượng giá trực tiếp với nông dân. Không qua môi giới, không mất phí hoa hồng — lợi nhuận thu mua tối ưu hơn.",
                                tags: ["Chat trực tiếp", "Không hoa hồng"],
                            },
                        ].map((a) => (
                            <div key={a.title} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-7 hover:bg-white/15 transition-all group">
                                <div className="flex items-start gap-4 mb-5">
                                    <div className={`w-14 h-14 ${a.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                                        {a.icon}
                                    </div>
                                    <span className="text-5xl font-black text-white/10 leading-none mt-1">{a.num}</span>
                                </div>
                                <h3 className="font-bold text-white text-lg mb-3">{a.title}</h3>
                                <p className="text-emerald-300 text-sm leading-relaxed mb-4">{a.desc}</p>
                                <div className="flex flex-wrap gap-2">
                                    {a.tags.map((t) => (
                                        <span key={t} className="bg-white/10 text-emerald-200 text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                                            ✓ {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CTA ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-12 text-center overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-2xl rotate-12"></div>
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-2xl -rotate-6"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-3">
                            Bắt đầu tìm nguồn hàng ngay hôm nay
                        </h2>
                        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                            Đăng bài viết nhu cầu và để nông dân chủ động liên hệ với bạn
                        </p>
                        <Link
                            href="#"
                            className="inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold transition-colors shadow-xl"
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
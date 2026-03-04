"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    BookOpen,
    FileText,
    ArrowRight,
    CheckCircle2,
    Lightbulb,
    GraduationCap,
    Pen,
    Globe,
    Heart,
    Award,
    Users,
    Sprout,
    Droplets,
    Scissors,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    Eye,
    MapPin,
    Weight,
    Star,
} from "lucide-react";
import { blogAPI } from "@/lib/api";

const TOPICS = [
    { icon: <Sprout className="w-5 h-5 text-emerald-600" />, name: "Chọn giống", desc: "Hướng dẫn chọn giống sầu riêng phù hợp với từng vùng đất" },
    { icon: <Droplets className="w-5 h-5 text-emerald-600" />, name: "Kỹ thuật tưới", desc: "Tưới tiết kiệm nước và hiệu quả cho vườn sầu riêng" },
    { icon: <Lightbulb className="w-5 h-5 text-emerald-600" />, name: "Bón phân", desc: "Lịch bón phân theo từng giai đoạn phát triển của cây" },
    { icon: <Scissors className="w-5 h-5 text-emerald-600" />, name: "Cắt tỉa", desc: "Kỹ thuật cắt tỉa tạo tán và kích thích ra hoa đúng mùa" },
    { icon: <Award className="w-5 h-5 text-emerald-600" />, name: "Phòng bệnh", desc: "Nhận biết sớm và xử lý các bệnh thường gặp trên sầu riêng" },
    { icon: <GraduationCap className="w-5 h-5 text-emerald-600" />, name: "Thu hoạch", desc: "Thời điểm và cách thu hoạch đạt chất lượng tốt nhất" },
];

export default function ContentExpertHome() {
    const [blogs, setBlogs] = useState([]);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const featuredBlog = blogs[0] || null;
    const otherBlogs = blogs.slice(1);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Hero ────────────────────────────────────────── */}
            <div className="pt-20 pb-12 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Geometric decorations */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
                            <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
                            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
                            <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
                            <div className="absolute top-1/3 left-1/5 w-16 h-16 border-2 border-white/20 rounded-xl -rotate-6"></div>
                            <div className="absolute top-2/3 right-1/5 w-12 h-12 border-2 border-white/15 rounded-lg rotate-12"></div>
                        </div>

                        <div className="relative z-10 px-8 md:px-16 pt-12 pb-14">
                            {/* Badge */}
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
                                    Chuẩn hóa quy trình · Lan tỏa kiến thức · Hỗ trợ nông dân
                                </p>
                            </div>

                            {/* Two action cards */}
                            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                {/* Card 1: Tạo bài viết */}
                                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 relative overflow-hidden">
                                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-xl rotate-12"></div>
                                        <div className="relative flex items-start gap-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ring-white/10">
                                                <Pen className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-md font-medium mb-1 border border-white/30">
                                                    Hành động 1
                                                </div>
                                                <h3 className="text-white font-bold text-xl">Tạo bài viết</h3>
                                                <p className="text-emerald-100 text-sm mt-1">Chia sẻ kinh nghiệm và kiến thức thực tế</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-500 text-sm mb-4">
                                            Viết bài chia sẻ kỹ thuật canh tác, kinh nghiệm thực tế và giải pháp xử lý vấn đề
                                        </p>
                                        <ul className="space-y-2 mb-6">
                                            {[
                                                "Hướng dẫn kỹ thuật canh tác",
                                                "Giải pháp phòng trừ sâu bệnh",
                                                "Mẹo chăm sóc hiệu quả",
                                                "Chia sẻ kinh nghiệm thực tế",
                                            ].map((t) => (
                                                <li key={t} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    {t}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href="/profile/posts/create"
                                            className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold shadow-md shadow-emerald-500/30"
                                        >
                                            Tạo bài viết <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Card 2: Tạo Blog */}
                                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 relative overflow-hidden">
                                        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-xl rotate-12"></div>
                                        <div className="relative flex items-start gap-4">
                                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ring-white/10">
                                                <Globe className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-0.5 rounded-md font-medium mb-1 border border-white/30">
                                                    Hành động 2
                                                </div>
                                                <h3 className="text-white font-bold text-xl">Tạo Blog</h3>
                                                <p className="text-emerald-100 text-sm mt-1">Chuẩn hóa kiến thức canh tác chuyên sâu</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-500 text-sm mb-4">
                                            Tạo blog chuyên sâu với nội dung đầy đủ, có tài liệu tham khảo và hình ảnh minh họa
                                        </p>
                                        <ul className="space-y-2 mb-6">
                                            {[
                                                "Quy trình canh tác chuẩn",
                                                "Tài liệu tham khảo khoa học",
                                                "Video hướng dẫn chi tiết",
                                                "Cập nhật thường xuyên",
                                            ].map((t) => (
                                                <li key={t} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    {t}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href="/profile/blogs/create"
                                            className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold shadow-md shadow-emerald-500/30"
                                        >
                                            Tạo Blog <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Topics grid ─────────────────────────────────── */}
            <div className="bg-gray-50 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-emerald-200 uppercase tracking-widest">Kiến thức nổi bật</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Chủ đề kiến thức phổ biến</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Chia sẻ kiến thức về những chủ đề nông dân đang quan tâm nhiều nhất
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {TOPICS.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 group cursor-pointer"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        {t.icon}
                                    </div>
                                    <h3 className="font-bold text-gray-900">{t.name}</h3>
                                </div>
                                <p className="text-gray-500 text-sm mb-3">{t.desc}</p>
                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                    <span>Viết bài về chủ đề này</span>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Impact section ──────────────────────────────── */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 border border-yellow-400/30 uppercase tracking-widest">Tác động tích cực</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Tạo tác động tích cực</h2>
                        <p className="text-emerald-300 max-w-xl mx-auto">Kiến thức của bạn có thể thay đổi cách hàng nghìn nông dân canh tác</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Award className="w-7 h-7 text-emerald-900" />,
                                iconBg: "bg-yellow-400",
                                num: "01",
                                title: "Xây dựng uy tín chuyên gia",
                                desc: "Chia sẻ kiến thức giúp bạn trở thành chuyên gia được cộng đồng nông dân tin tưởng.",
                            },
                            {
                                icon: <Users className="w-7 h-7 text-emerald-900" />,
                                iconBg: "bg-yellow-400",
                                num: "02",
                                title: "Tiếp cận cộng đồng rộng",
                                desc: "Bài viết của bạn đến được với hàng nghìn nông dân đang tìm kiếm kiến thức canh tác.",
                            },
                            {
                                icon: <Heart className="w-7 h-7 text-emerald-900" />,
                                iconBg: "bg-yellow-400",
                                num: "03",
                                title: "Góp phần phát triển ngành",
                                desc: "Chuẩn hóa quy trình canh tác và nâng cao chất lượng sầu riêng Việt Nam.",
                            },
                        ].map((a) => (
                            <div key={a.title} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                                <div className="h-1.5 bg-emerald-500"></div>
                                <div className="p-7">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`w-14 h-14 ${a.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                                            {a.icon}
                                        </div>
                                        <span className="text-6xl font-black text-emerald-200 leading-none">{a.num}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-emerald-700 transition-colors">{a.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{a.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Blog Mới ────────────────────────────────────── */}
            <section className="py-16 px-4 lg:px-6 bg-gray-50">
                <div className="max-w-[1400px] mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Blog Mới Nhất</h2>
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

            {/* ── CTA ─────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl p-12 text-center overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-2xl rotate-12"></div>
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-2xl -rotate-6"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-3">Bắt đầu chia sẻ kiến thức ngay hôm nay</h2>
                        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                            Hàng nghìn nông dân đang chờ đọc kiến thức và kinh nghiệm của bạn
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/profile/posts/create"
                                className="inline-flex items-center gap-3 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 rounded-xl font-bold transition-colors shadow-xl"
                            >
                                <FileText className="w-5 h-5" />
                                Tạo bài viết
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/profile/blogs/create"
                                className="inline-flex items-center gap-3 bg-emerald-700/50 hover:bg-emerald-700/70 text-white border border-white/30 px-8 py-4 rounded-xl font-bold transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                Tạo Blog
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
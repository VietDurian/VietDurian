"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { blogAPI } from "@/lib/api";
import { BookOpen, Calendar, Book } from "lucide-react";

export default function BlogDetailPage() {
    const params = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeBlock, setActiveBlock] = useState(0);

    // Fetch blog detail từ API
    useEffect(() => {
        const fetchBlogDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await blogAPI.getBlogById(params.id);

                if (result.code === 200 && result.data) {
                    setBlog(result.data);
                } else {
                    setError('Không thể tải bài viết');
                }
            } catch (err) {
                console.error('Error fetching blog detail:', err);
                setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchBlogDetail();
        }
    }, [params.id]);

    // Scroll spy effect - tự động highlight section khi scroll
    useEffect(() => {
        const handleScroll = () => {
            if (!blog?.knowledgeBlocks) return;

            const scrollPosition = window.scrollY + 200;

            for (let index = 0; index < blog.knowledgeBlocks.length; index++) {
                const element = document.getElementById(`block-${index}`);
                if (element) {
                    const elementTop = element.offsetTop;
                    const elementBottom = elementTop + element.offsetHeight;

                    if (elementTop <= scrollPosition && elementBottom > scrollPosition) {
                        setActiveBlock(index);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [blog]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col justify-center items-center h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md text-center">
                        <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-red-900 mb-2">Lỗi</h3>
                        <p className="text-red-700 mb-4">{error || 'Không tìm thấy bài viết'}</p>
                        <Link
                            href="/blogs"
                            className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            ← Quay lại danh sách
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Hero Section with Back Button and Title */}
            <section className="bg-gradient-to-r from-emerald-700 to-emerald-900 pt-20 pb-12">
                <div className="max-w-[1400px] mx-auto">
                    {/* Back Button - Far Left */}
                    <div className="px-4">
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group mb-8 -ml-4"
                        >
                            <svg
                                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="font-medium">Quay lại</span>
                        </Link>
                    </div>

                    {/* Title - Centered */}
                    <div className="max-w-[1000px] mx-auto text-center px-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {blog.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-emerald-100 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{formatDate(blog.created_at)}</span>
                            </div>
                            {blog.knowledgeBlocks && blog.knowledgeBlocks.length > 0 && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-2">
                                        <Book className="w-5 h-5" />
                                        <span>{blog.knowledgeBlocks.length} chương</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* Content Section */}
            <section className="py-12 px-4">
                <div className="max-w-[1500px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">

                        {/* Sidebar - Table of Contents - UPDATED STYLE */}
                        {blog.knowledgeBlocks && blog.knowledgeBlocks.length > 0 && (
                            <div className="lg:sticky lg:top-24 h-fit">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-wide">
                                        <BookOpen className="w-4 h-4 text-emerald-600" />
                                        Mục lục
                                    </h3>
                                    <nav className="space-y-1">
                                        {blog.knowledgeBlocks.map((block, index) => (
                                            <button
                                                key={block._id}
                                                onClick={() => {
                                                    setActiveBlock(index);
                                                    document.getElementById(`block-${index}`)?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'start'
                                                    });
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-5 text-sm font-medium rounded-lg transition-all duration-200 text-left border-l-4 ${activeBlock === index
                                                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                                                        : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                    }`}
                                            >
                                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeBlock === index
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                                <span className="truncate">{block.title}</span>
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="space-y-8">
                            {/* Introduction */}
                            <div className="bg-white rounded-xl shadow-md p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Giới thiệu</h2>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {blog.content}
                                </p>
                            </div>

                            {/* Knowledge Blocks */}
                            {blog.knowledgeBlocks && blog.knowledgeBlocks.map((block, index) => (
                                <div
                                    key={block._id}
                                    id={`block-${index}`}
                                    className="bg-white rounded-xl shadow-md overflow-hidden scroll-mt-32"
                                >
                                    {/* Block Image */}
                                    {block.image && (
                                        <div className="relative h-80 w-full">
                                            <Image
                                                src={block.image}
                                                alt={block.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Block Content */}
                                    <div className="p-8">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 flex-1">
                                                {block.title}
                                            </h2>
                                        </div>
                                        <div className="text-gray-700 leading-relaxed text-lg ml-14 whitespace-pre-line">
                                            {block.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center pt-8">
                                <Link
                                    href="/blogs"
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Quay lại danh sách
                                </Link>

                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors"
                                >
                                    Lên đầu trang
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
    ImageIcon, X, AlertCircle, ArrowLeft, FileText,
} from "lucide-react";

const getCategoriesByRole = (role) => {
    switch (role) {
        case "trader": return ["Sản phẩm", "Kinh nghiệm", "Thuê dịch vụ", "Khác"];
        case "farmer": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
        case "serviceProvider": return ["Dịch vụ", "Sản phẩm", "Kinh nghiệm", "Khác"];
        case "contentExpert": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
        default: return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    }
};

export default function CreatePostPage() {
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const categories = getCategoriesByRole(user?.role);
    const [category, setCategory] = useState(categories[0]);
    const [content, setContent] = useState("");
    const [contact, setContact] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [imageData, setImageData] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = Boolean(category) && Boolean(content.trim()) && Boolean(imageData) && Boolean(contact.trim());

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError("Ảnh quá lớn. Tối đa 5MB"); return; }
        const reader = new FileReader();
        reader.onload = () => { const r = reader.result?.toString() || ""; setImageData(r); setImagePreview(r); setError(""); };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!canSubmit) { setError("Vui lòng điền đủ danh mục, nội dung, ảnh và thông tin liên hệ."); return; }
        setIsSubmitting(true);
        try {
            await createPost({ category, content: content.trim(), image: imageData, contact: contact.trim() });
            router.push("/profile/posts");
        } catch (err) {
            setError(err?.message || "Không thể tạo bài viết. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* ── Header giống blog ───────────────────────────── */}
            <section className="pt-10 pb-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl shadow-xl p-4 md:p-4">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 font-medium cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                            <span>Quay lại</span>
                        </button>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Tạo bài viết</h1>
                            <p className="text-emerald-50 text-lg">Chia sẻ nhu cầu, kinh nghiệm hoặc tìm dịch vụ</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Form ───────────────────────────────────────── */}
            <section className="pb-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* User info */}
                        <div className="flex items-center gap-3 pt-2">
                            <img src={user?.avatar || "/images/avatar.jpg"} className="w-16 h-16 rounded-full border border-gray-200 object-cover" alt="Avatar" />
                            <div>
                                <p className="font-semibold text-gray-800">{user?.full_name || user?.name || user?.username || "Bạn"}</p>
                                <div className="text-xs text-gray-500">Công khai</div>
                            </div>
                        </div>

                        {/* Category — custom dropdown giống code gốc */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Danh mục
                            </label>
                            <div className="relative">
                                {/* Toggle button */}
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white transition-all cursor-pointer text-left flex justify-between items-center"
                                >
                                    <span>{category}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown list */}
                                {dropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                        {categories.map((item) => (
                                            <div
                                                key={item}
                                                onClick={() => { setCategory(item); setDropdownOpen(false); }}
                                                className={`px-3 py-2 cursor-pointer transition-colors text-sm ${category === item
                                                    ? "bg-emerald-600 text-white font-medium"
                                                    : "text-gray-900 hover:bg-emerald-500 hover:text-white"
                                                    }`}
                                            >
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Nội dung
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                autoFocus
                                placeholder="Bạn đang nghĩ gì?"
                                className="w-full bg-white text-gray-900 text-base resize-none outline-none min-h-[140px] placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                                maxLength={1000}
                            />
                            <div className="text-xs text-gray-500 text-right">{content.length}/1000</div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Thông tin liên hệ
                            </label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                placeholder="Số điện thoại hoặc email"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                            />
                        </div>

                        {/* Image */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Ảnh</label>
                            {!imagePreview ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                                >
                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-sm font-medium text-gray-600">Nhấp để chọn ảnh</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</p>
                                </div>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img src={imagePreview} alt="Preview" className="w-full h-auto object-contain bg-gray-50 max-h-80" />
                                    <button
                                        type="button"
                                        onClick={() => { setImagePreview(""); setImageData(""); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <AlertCircle size={18} /><span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!canSubmit || isSubmitting}
                            className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang đăng...
                                </span>
                            ) : "Đăng bài viết"}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
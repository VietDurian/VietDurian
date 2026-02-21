"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Heart,
    MessageCircle,
    Share2,
    Tag,
    Phone,
    Mail,
    ImageIcon,
    AlertCircle,
    Loader2,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    X,
    Wrench,
    BookOpen,
    Leaf,
    HandCoins,
    Grid
} from "lucide-react";
import { favoriteAPI, deletePost, updatePost, commentAPI } from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import { useAuth } from "@/context/AuthContext";

const POST_CATEGORIES = [
    "Dịch vụ",
    "Kinh nghiệm",
    "Sản phẩm",
    "Thuê dịch vụ",
    "Khác",
];

const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: {
            icon: Clock,
            text: "Đang chờ duyệt",
            bgColor: "bg-amber-50",
            textColor: "text-amber-700",
            iconColor: "text-amber-500",
            borderColor: "border-amber-200",
        },
        active: {
            icon: CheckCircle,
            text: "Đã duyệt",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-700",
            iconColor: "text-emerald-500",
            borderColor: "border-emerald-200",
        },
        rejected: {
            icon: XCircle,
            text: "Bị từ chối",
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            iconColor: "text-red-500",
            borderColor: "border-red-200",
        },
        inactive: {
            icon: AlertCircle,
            text: "Ngưng hoạt động",
            bgColor: "bg-gray-50",
            textColor: "text-red-700",
            iconColor: "text-red-500",
            borderColor: "border-red-200",
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-medium`}
        >
            <Icon size={14} className={config.iconColor} />
            <span>{config.text}</span>
        </div>
    );
};

const EditPostModal = ({ isOpen, onClose, post, user, onPostUpdated }) => {
    const fileInputRef = useRef(null);
    const [category, setCategory] = useState(post?.category || POST_CATEGORIES[0]);
    const [content, setContent] = useState(post?.content || "");
    const [contact, setContact] = useState(post?.contact || "");
    const [imagePreview, setImagePreview] = useState(post?.image || "");
    const [imageData, setImageData] = useState(post?.image || "");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit =
        Boolean(category) &&
        Boolean(content.trim()) &&
        Boolean(imageData) &&
        Boolean(contact.trim());

    useEffect(() => {
        if (post) {
            setCategory(post.category || POST_CATEGORIES[0]);
            setContent(post.content || "");
            setContact(post.contact || "");
            setImagePreview(post.image || "");
            setImageData(post.image || "");
            setError("");
        }
    }, [post]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("Ảnh quá lớn. Tối đa 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result?.toString() || "";
            setImageData(result);
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!category || !content.trim() || !imageData || !contact.trim()) {
            setError("Vui lòng điền đủ danh mục, nội dung, ảnh và thông tin liên hệ.");
            return;
        }

        setIsSubmitting(true);

        try {
            const updated = await updatePost(post._id, {
                category,
                content: content.trim(),
                image: imageData,
                contact: contact.trim(),
            });

            const normalizedPost = {
                ...post,
                category: updated?.category || category,
                content: updated?.content || content.trim(),
                contact: updated?.contact || contact.trim(),
                image: updated?.image || imagePreview,
                updated_at: updated?.updated_at || new Date().toISOString(),
            };

            onPostUpdated?.(normalizedPost);
            onClose();
        } catch (submitError) {
            const message = submitError?.message || "Không thể cập nhật bài viết";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
                <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">Chỉnh sửa bài viết</h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition"
                        aria-label="Đóng"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 p-4 max-h-[calc(100vh-200px)] overflow-y-auto"
                >
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.avatar || "/images/avatar.jpg"}
                            className="w-11 h-11 rounded-full border border-gray-200"
                            alt="Avatar"
                        />
                        <div>
                            <p className="font-semibold text-gray-800">
                                {user?.full_name || user?.name || user?.username || "Bạn"}
                            </p>
                            <div className="text-xs text-gray-500">Công khai</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Danh mục
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    const dropdown = document.getElementById('edit-category-dropdown');
                                    dropdown.classList.toggle('hidden');
                                }}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white transition-all cursor-pointer text-left flex justify-between items-center"
                            >
                                <span>{category}</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div
                                id="edit-category-dropdown"
                                className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                            >
                                {POST_CATEGORIES.map((item) => (
                                    <div
                                        key={item}
                                        onClick={() => {
                                            setCategory(item);
                                            document.getElementById('edit-category-dropdown').classList.add('hidden');
                                        }}
                                        className={`px-3 py-2 cursor-pointer transition-colors text-sm ${category === item
                                            ? 'bg-emerald-600 text-white font-medium'
                                            : 'text-gray-900 hover:bg-emerald-500 hover:text-white'
                                            }`}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Nội dung
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Bạn đang nghĩ gì?"
                            className="w-full bg-white text-gray-900 text-base resize-none outline-none min-h-[140px] placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
                            maxLength={1000}
                        />
                        <div className="text-xs text-gray-500 text-right">
                            {content.length}/1000
                        </div>
                    </div>

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

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Ảnh</label>

                        {!imagePreview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                            >
                                <ImageIcon
                                    className="mx-auto text-gray-400 mb-2"
                                    size={32}
                                />
                                <p className="text-sm font-medium text-gray-600">
                                    Nhấp để chọn ảnh
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG, GIF tối đa 5MB
                                </p>
                            </div>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-auto object-contain bg-gray-50 max-h-80"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview("");
                                        setImageData("");
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang cập nhật...
                            </span>
                        ) : (
                            "Cập nhật bài viết"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const FavoritePostCard = ({ post, onToggleFavorite, onEdit, onDelete }) => {
    const [isLiked, setIsLiked] = useState(true);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(post.post_id?.comments_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setCommentCount(post.post_id?.comments_count || 0);
    }, [post.post_id?.comments_count]);

    const handleToggleFavorite = async () => {
        if (isTogglingFavorite) return;

        setIsTogglingFavorite(true);
        try {
            await onToggleFavorite(post.post_id?._id || post.post_id);
            setIsLiked(false);
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMenu]);

    const formatTimestamp = (dateString) => {
        if (!dateString) return "Không rõ";
        try {
            return new Date(dateString).toLocaleString("vi-VN");
        } catch {
            return "Không rõ";
        }
    };

    const getAuthorInfo = () => {
        const postData = post.post_id;
        if (!postData) {
            return {
                name: "Người dùng",
                avatar: "/images/avatar.jpg",
                email: "",
                handle: ""
            };
        }

        if (postData.author_id && typeof postData.author_id === 'object') {
            const email = postData.author_id.email || "";
            return {
                name: postData.author_id.full_name || postData.author_id.name || "Người dùng",
                avatar: postData.author_id.avatar || "/images/avatar.jpg",
                email: email,
                handle: email || postData.author_id.username || ""
            };
        }

        const authorId = typeof postData.author_id === 'string' ? postData.author_id : postData.author_id?._id;
        const userId = typeof post.user_id === 'object' ? post.user_id._id : post.user_id;

        if (authorId === userId && typeof post.user_id === 'object') {
            const email = post.user_id.email || "";
            return {
                name: post.user_id.full_name || post.user_id.name || "Người dùng",
                avatar: post.user_id.avatar || "/images/avatar.jpg",
                email: email,
                handle: email || post.user_id.username || ""
            };
        }

        if (authorId === user?._id || authorId === user?.id) {
            const email = user.email || "";
            return {
                name: user.full_name || user.name || "Bạn",
                avatar: user.avatar || "/images/avatar.jpg",
                email: email,
                handle: email || user.username || ""
            };
        }

        return {
            name: "Người dùng",
            avatar: "/images/avatar.jpg",
            email: "",
            handle: ""
        };
    };

    const authorInfo = getAuthorInfo();

    // Check if current user owns this post
    const isOwnPost = () => {
        const postAuthorId = post.post_id?.author_id?._id || post.post_id?.author_id;
        const currentUserId = user?._id || user?.id;
        return postAuthorId === currentUserId;
    };

    const canEditDelete = isOwnPost();

    return (
        <>
            <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow w-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
                            <img
                                src={authorInfo.avatar}
                                alt={authorInfo.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-bold text-gray-900 text-base">
                                    {authorInfo.name}
                                </h4>
                                <StatusBadge status={post.post_id?.status} />
                            </div>
                            <p className="text-gray-500 text-sm">
                                {authorInfo.handle && authorInfo.handle}
                                {authorInfo.handle && post.post_id?.created_at && " • "}
                                {post.post_id?.created_at && formatTimestamp(post.post_id.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* CHỈ HIỂN THỊ MENU NẾU LÀ BÀI CỦA MÌNH */}
                    {canEditDelete && (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            onEdit?.(post.post_id);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                                                onDelete?.(post.post_id?._id);
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {post.post_id?.category && (() => {
                    const categoryConfig = {
                        "Dịch vụ": { icon: Wrench, bg: "from-blue-500 to-cyan-500" },
                        "Kinh nghiệm": { icon: BookOpen, bg: "from-amber-500 to-orange-500" },
                        "Sản phẩm": { icon: Leaf, bg: "from-emerald-500 to-teal-500" },
                        "Thuê dịch vụ": { icon: HandCoins, bg: "from-purple-500 to-violet-500" },
                        "Khác": { icon: Grid, bg: "from-gray-500 to-slate-500" },
                    };
                    const config = categoryConfig[post.post_id.category] || { icon: Grid, bg: "from-emerald-500 to-teal-500" };
                    const Icon = config.icon;
                    return (
                        <div className="mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${config.bg} text-white shadow-sm`}>
                                <Icon size={14} />
                                {post.post_id.category}
                            </span>
                        </div>
                    );
                })()}

                <div className="text-base text-gray-800 leading-relaxed mb-4">
                    <p className="whitespace-pre-wrap">{post.post_id?.content}</p>
                </div>

                {post.post_id?.contact && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-500">Liên hệ:</span>
                            <span className="text-sm font-semibold text-emerald-700">{post.post_id.contact}</span>
                        </div>
                    </div>
                )}

                {post.post_id?.image && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                        <img
                            src={post.post_id.image}
                            alt="Post content"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between px-1">
                    <button
                        onClick={handleToggleFavorite}
                        disabled={isTogglingFavorite}
                        className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                            } ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isTogglingFavorite ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Heart
                                size={20}
                                className={`${isLiked ? "fill-current" : ""}`}
                            />
                        )}
                        {post.post_id?.likes_count > 0 && (
                            <span className="text-sm font-medium">{post.post_id.likes_count}</span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsCommentModalOpen(true)}
                        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition px-3 py-1.5 rounded-lg"
                    >
                        <MessageCircle size={20} />
                        {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
                    </button>

                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition px-3 py-1.5 rounded-lg">
                        <Share2 size={20} />
                        {post.post_id?.shares_count > 0 && (
                            <span className="text-sm font-medium">{post.post_id.shares_count}</span>
                        )}
                    </button>
                </div>
            </article>

            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                postId={post.post_id?._id}
                onCommentCountChange={setCommentCount}
            />
        </>
    );
};

export default function FavoritePostsModal() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await favoriteAPI.getFavorites();
            const validFavorites = (response.data || []).filter(fav => fav.post_id);
            setFavorites(validFavorites);
            const favWithComments = await Promise.all(
                validFavorites.map(async (fav) => {
                    try {
                        const res = await commentAPI.getCommentsByPost(fav.post_id?._id, "all");
                        const countComments = (list) => {
                            let count = list.length;
                            list.forEach(c => { if (c.children?.length) count += countComments(c.children); });
                            return count;
                        };
                        return {
                            ...fav,
                            post_id: { ...fav.post_id, comments_count: countComments(res.data || []) }
                        };
                    } catch {
                        return fav;
                    }
                })
            );
            setFavorites(favWithComments);
        } catch (err) {
            console.error("Error loading favorites:", err);
            setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách yêu thích");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFavorite = async (postId) => {
        try {
            await favoriteAPI.removeFavorite(postId);
            setFavorites((prev) => prev.filter((fav) => fav.post_id?._id !== postId));
        } catch (err) {
            console.error("Error removing favorite:", err);
            const errorMessage = err?.response?.data?.message || err?.message || "Không thể xóa bài viết khỏi yêu thích";
            alert(errorMessage);
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setIsEditModalOpen(true);
    };

    const handlePostUpdated = (updatedPost) => {
        setFavorites((prev) =>
            prev.map((fav) =>
                fav.post_id._id === updatedPost._id
                    ? {
                        ...fav,
                        post_id: {
                            ...fav.post_id,
                            ...updatedPost,
                        },
                    }
                    : fav
            )
        );
    };

    const handleDelete = async (postId) => {
        try {
            try {
                await favoriteAPI.removeFavorite(postId);
            } catch (favError) {
                // Ignore if not in favorites
            }

            await deletePost(postId);

            setFavorites((prev) => prev.filter((fav) => {
                const favPostId = fav.post_id?._id || fav.post_id;
                return favPostId !== postId;
            }));

        } catch (error) {
            console.error("Error deleting post:", error);
            alert(error?.message || "Không thể xóa bài viết");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
                <p className="text-gray-500 font-medium">Đang tải bài viết yêu thích...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                <p className="text-red-600 font-medium">{error}</p>
                <button
                    onClick={loadFavorites}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
                <div className="max-w-md mx-auto">
                    <div className="inline-flex p-6 rounded-full bg-pink-50 mb-6">
                        <Heart className="text-pink-500" size={48} strokeWidth={2} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Chưa có bài viết yêu thích
                    </h3>
                    <p className="text-gray-600">
                        Các bài viết bạn yêu thích sẽ xuất hiện ở đây. Hãy bắt đầu khám phá và
                        lưu lại những nội dung bạn yêu thích!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="text-pink-500 fill-current" size={24} />
                    Bài viết yêu thích ({favorites.length})
                </h3>
            </div>

            <div className="w-full max-w-4xl mx-auto">
                {favorites.map((favorite) => (
                    <FavoritePostCard
                        key={favorite._id}
                        post={favorite}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            <EditPostModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingPost(null);
                }}
                post={editingPost}
                user={user || {}}
                onPostUpdated={handlePostUpdated}
            />
        </div>
    );
}
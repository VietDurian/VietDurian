"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { favoriteAPI } from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import { useAuth } from "@/context/AuthContext";

// Status Badge Component
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
            textColor: "text-gray-700",
            iconColor: "text-gray-500",
            borderColor: "border-gray-200",
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

// Favorite Post Card Component
const FavoritePostCard = ({ post, onToggleFavorite, onEdit, onDelete }) => {
    const [isLiked, setIsLiked] = useState(true);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(post.post_id?.comments_count || 0);
    const [showMenu, setShowMenu] = useState(false);
    const { user } = useAuth();

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

    // Determine contact icon
    const isEmail = post.post_id?.contact?.includes("@");
    const ContactIcon = isEmail ? Mail : Phone;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMenu]);

    // Format timestamp - ĐỒNG BỘ VỚI POST
    const formatTimestamp = (dateString) => {
        if (!dateString) return "Không rõ";
        try {
            return new Date(dateString).toLocaleString("vi-VN");
        } catch {
            return "Không rõ";
        }
    };

    // Get author info - XỬ LÝ CẢ 2 TRƯỜNG HỢP
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

        // CASE 1: Backend đã populate author_id (author_id là object)
        if (postData.author_id && typeof postData.author_id === 'object') {
            const email = postData.author_id.email || "";
            return {
                name: postData.author_id.full_name || postData.author_id.name || "Người dùng",
                avatar: postData.author_id.avatar || "/images/avatar.jpg",
                email: email,
                // GIỐNG POST: hiển thị full email, KHÔNG chỉ lấy phần trước @
                handle: email || postData.author_id.username || ""
            };
        }

        // CASE 2: Backend chưa populate author_id (author_id là string ID)
        // → Check xem author_id có = user_id không
        const authorId = typeof postData.author_id === 'string' ? postData.author_id : postData.author_id?._id;
        const userId = typeof post.user_id === 'object' ? post.user_id._id : post.user_id;

        // Nếu author = user (người favorite là tác giả) → dùng thông tin user_id
        if (authorId === userId && typeof post.user_id === 'object') {
            const email = post.user_id.email || "";
            return {
                name: post.user_id.full_name || post.user_id.name || "Người dùng",
                avatar: post.user_id.avatar || "/images/avatar.jpg",
                email: email,
                // GIỐNG POST: full email
                handle: email || post.user_id.username || ""
            };
        }

        // Nếu author = current logged in user
        if (authorId === user?._id || authorId === user?.id) {
            const email = user.email || "";
            return {
                name: user.full_name || user.name || "Bạn",
                avatar: user.avatar || "/images/avatar.jpg",
                email: email,
                // GIỐNG POST: full email
                handle: email || user.username || ""
            };
        }

        // Fallback
        return {
            name: "Người dùng",
            avatar: "/images/avatar.jpg",
            email: "",
            handle: ""
        };
    };

    const authorInfo = getAuthorInfo();

    return (
        <>
            <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow w-full">
                {/* Post Header - ĐỒNG BỘ VỚI POST */}
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
                                {/* STATUS BADGE - ĐỒNG BỘ VỚI POST */}
                                <StatusBadge status={post.post_id?.status} />
                            </div>
                            {/* EMAIL HANDLE - ĐỒNG BỘ VỚI POST: hiển thị @email đầy đủ */}
                            <p className="text-gray-500 text-sm">
                                {authorInfo.handle && `@${authorInfo.handle}`}
                                {authorInfo.handle && post.post_id?.created_at && " • "}
                                {post.post_id?.created_at && formatTimestamp(post.post_id.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Three Dots Menu */}
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

                        {/* Dropdown Menu */}
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
                </div>

                {/* Category Badge - ĐỒNG BỘ VỚI POST */}
                {post.post_id?.category && (
                    <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200">
                            <Tag size={16} className="text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">
                                {post.post_id.category}
                            </span>
                        </div>
                    </div>
                )}

                {/* Post Content - ĐỒNG BỘ VỚI POST */}
                <div className="text-base text-gray-800 leading-relaxed mb-4">
                    <p className="whitespace-pre-wrap">{post.post_id?.content}</p>
                </div>

                {/* Contact Info - ĐỒNG BỘ VỚI POST */}
                {post.post_id?.contact && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <ContactIcon size={18} className="text-emerald-600" />
                            <span className="text-sm font-semibold">{post.post_id.contact}</span>
                        </div>
                    </div>
                )}

                {/* Post Image - ĐỒNG BỘ VỚI POST */}
                {post.post_id?.image && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                        <img
                            src={post.post_id.image}
                            alt="Post content"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {/* Post Actions - ĐỒNG BỘ VỚI POST */}
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

// Main Favorite Posts Component
export default function FavoritePostsModal() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const { user } = useAuth();

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await favoriteAPI.getFavorites();

            console.log('=== FAVORITES DEBUG ===');
            console.log('Sample favorite:', response.data?.[0]);
            console.log('author_id type:', typeof response.data?.[0]?.post_id?.author_id);
            console.log('Is author_id populated?',
                typeof response.data?.[0]?.post_id?.author_id === 'object'
            );

            setFavorites(response.data || []);
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
        const normalizedPost = {
            id: post._id,
            category: post.category,
            content: post.content,
            link: post.contact,
            image: post.image,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            status: post.status,
            isLiked: true,
        };
        setEditingPost(normalizedPost);
        setIsEditModalOpen(true);
    };

    const handlePostUpdated = (updatedPost) => {
        setFavorites((prev) =>
            prev.map((fav) =>
                fav.post_id._id === updatedPost.id
                    ? {
                        ...fav,
                        post_id: {
                            ...fav.post_id,
                            category: updatedPost.category,
                            content: updatedPost.content,
                            contact: updatedPost.link,
                            image: updatedPost.image,
                        },
                    }
                    : fav
            )
        );
    };

    const handleDelete = async (postId) => {
        try {
            const { deletePost } = await import("@/lib/api");
            await deletePost(postId);
            setFavorites((prev) => prev.filter((fav) => fav.post_id._id !== postId));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert(error?.message || "Không thể xóa bài viết");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
                <p className="text-gray-500 font-medium">Đang tải bài viết yêu thích...</p>
            </div>
        );
    }

    // Error state
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

    // Empty state
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

    // List of favorites
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="text-pink-500 fill-current" size={24} />
                    Bài viết yêu thích ({favorites.length})
                </h3>
            </div>

            {/* Single column layout like Post feed */}
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
        </div>
    );
}
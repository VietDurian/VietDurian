"use client";
import React, { useState, useEffect } from "react";
import {
    Heart,
    MessageCircle,
    Share2,
    Trash2,
    Tag,
    Phone,
    Mail,
    ImageIcon,
    AlertCircle,
    Loader2,
} from "lucide-react";

// Favorite Post Card Component
const FavoritePostCard = ({ post, onRemove }) => {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa bài viết này khỏi danh sách yêu thích?")) {
            return;
        }

        setIsRemoving(true);
        try {
            await onRemove(post._id);
        } catch (error) {
            console.error("Error removing favorite:", error);
        } finally {
            setIsRemoving(false);
        }
    };

    // Determine contact icon
    const isEmail = post.post_id?.contact?.includes("@");
    const ContactIcon = isEmail ? Mail : Phone;

    return (
        <article className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-100">
                        <img
                            src={post.post_id?.author_id?.avatar || "/images/avatar.jpg"}
                            alt="Author"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-base">
                            {post.post_id?.author_id?.full_name || "Người dùng"}
                        </h4>
                        <p className="text-gray-500 text-sm">
                            {new Date(post.created_at).toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                </div>

                {/* Remove Button */}
                <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition disabled:opacity-50"
                    title="Xóa khỏi yêu thích"
                >
                    {isRemoving ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Trash2 size={20} />
                    )}
                </button>
            </div>

            {/* Category Badge */}
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

            {/* Post Content */}
            <div className="text-base text-gray-800 leading-relaxed mb-4">
                <p className="line-clamp-3">{post.post_id?.content}</p>
            </div>

            {/* Contact Info */}
            {post.post_id?.contact && (
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <ContactIcon size={18} className="text-emerald-600" />
                        <span className="text-sm font-semibold">{post.post_id.contact}</span>
                    </div>
                </div>
            )}

            {/* Post Image */}
            {post.post_id?.image && (
                <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                    <img
                        src={post.post_id.image}
                        alt="Post"
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}

            {/* Post Actions */}
            <div className="pt-3 border-t border-gray-200 flex items-center gap-4">
                <div className="flex items-center gap-2 text-red-500">
                    <Heart size={20} className="fill-current" />
                    <span className="text-sm font-medium">Đã thích</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <MessageCircle size={20} />
                    <span className="text-sm">{post.post_id?.comments_count || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <Share2 size={20} />
                    <span className="text-sm">{post.post_id?.shares_count || 0}</span>
                </div>
            </div>
        </article>
    );
};

// Main Favorite Posts Component
export default function FavoritePosts() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load favorites on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Call API to get favorites
            // const response = await favoriteAPI.getFavorites();
            // setFavorites(response.data);

            // Mock data for UI testing
            setFavorites([]);
        } catch (err) {
            console.error("Error loading favorites:", err);
            setError(err?.message || "Không thể tải danh sách yêu thích");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (postId) => {
        try {
            // TODO: Call API to remove favorite
            // await favoriteAPI.removeFavorite(postId);

            // Remove from state
            setFavorites((prev) => prev.filter((fav) => fav._id !== postId));
        } catch (err) {
            console.error("Error removing favorite:", err);
            alert(err?.message || "Không thể xóa bài viết khỏi yêu thích");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((favorite) => (
                    <FavoritePostCard
                        key={favorite._id}
                        post={favorite}
                        onRemove={handleRemoveFavorite}
                    />
                ))}
            </div>
        </div>
    );
}
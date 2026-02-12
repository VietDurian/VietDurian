"use client";
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
    CheckCircle,
    Clock,
    XCircle,
    Search,
    Filter,
    X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { favoriteAPI } from "@/lib/api";
import CommentModal from "@/components/CommentModal";

const POST_CATEGORIES = [
    "Tất cả",
    "Dịch vụ",
    "Kinh nghiệm",
    "Sản phẩm",
    "Thuê dịch vụ",
    "Khác",
];

const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đã duyệt" },
    { value: "pending", label: "Đang chờ duyệt" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
];

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

// Filter Bar Component
const FilterBar = ({
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    onStatusChange,
    selectedSort,
    onSortChange,
    searchQuery,
    onSearchChange,
    onClearFilters,
}) => {
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters =
        selectedCategory !== "Tất cả" ||
        selectedStatus !== "all" ||
        selectedSort !== "newest" ||
        searchQuery.trim() !== "";

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 mb-6">
            {/* Search Bar */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${showFilters
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    <Filter size={20} />
                    Lọc
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Danh mục
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {POST_CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => onCategoryChange(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === category
                                            ? "bg-emerald-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status & Sort Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => onStatusChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sắp xếp
                            </label>
                            <select
                                value={selectedSort}
                                onChange={(e) => onSortChange(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <X size={16} />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Post Component
const Post = ({ post, onLikeUpdate }) => {
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(post.comments || 0);
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    useEffect(() => {
        setIsLiked(post.isLiked || false);
    }, [post.isLiked]);

    const handleLike = async () => {
        if (isTogglingFavorite) return;

        const newLikedState = !isLiked;
        const previousLikedState = isLiked;

        setIsLiked(newLikedState);
        setIsTogglingFavorite(true);

        try {
            if (newLikedState) {
                await favoriteAPI.addFavorite(post.id);
            } else {
                await favoriteAPI.removeFavorite(post.id);
            }

            onLikeUpdate?.(post.id, newLikedState);
        } catch (error) {
            console.error("Error updating favorite:", error);
            setIsLiked(previousLikedState);

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể cập nhật yêu thích";
            alert(errorMessage);
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    const isEmail = post.contact?.includes("@");
    const ContactIcon = isEmail ? Mail : Phone;

    return (
        <>
            <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow w-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100">
                            <img
                                src={post.userAvatar || "/images/avatar.jpg"}
                                alt={post.userName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-bold text-gray-900 text-base">
                                    {post.userName}
                                </h4>
                                <StatusBadge status={post.status} />
                            </div>
                            <p className="text-gray-500 text-sm">
                                @{post.userHandle} • {post.timestamp}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Category Badge */}
                {post.category && (
                    <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200">
                            <Tag size={16} className="text-teal-600" />
                            <span className="text-sm font-semibold text-teal-700">
                                {post.category}
                            </span>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="text-base text-gray-800 leading-relaxed mb-4">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Contact Info */}
                {post.contact && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <ContactIcon size={18} className="text-emerald-600" />
                            <span className="text-sm font-semibold">{post.contact}</span>
                        </div>
                    </div>
                )}

                {/* Image */}
                {post.image && (
                    <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
                        <img
                            src={post.image}
                            alt="Post content"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-gray-200 flex items-center justify-between px-1">
                    <button
                        onClick={handleLike}
                        disabled={isTogglingFavorite}
                        className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked
                                ? "text-red-500"
                                : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                            } ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isTogglingFavorite ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Heart size={20} className={`${isLiked ? "fill-current" : ""}`} />
                        )}
                        {likeCount > 0 && (
                            <span className="text-sm font-medium">{likeCount}</span>
                        )}
                    </button>

                    <button
                        onClick={() => setIsCommentModalOpen(true)}
                        className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition px-3 py-1.5 rounded-lg"
                    >
                        <MessageCircle size={20} />
                        {commentCount > 0 && (
                            <span className="text-sm font-medium">{commentCount}</span>
                        )}
                    </button>

                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition px-3 py-1.5 rounded-lg">
                        <Share2 size={20} />
                        {post.shares > 0 && (
                            <span className="text-sm font-medium">{post.shares}</span>
                        )}
                    </button>
                </div>
            </article>

            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setIsCommentModalOpen(false)}
                postId={post.id}
                onCommentCountChange={setCommentCount}
            />
        </>
    );
};

// Main Component
export default function PostsContent() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [postsError, setPostsError] = useState(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedSort, setSelectedSort] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");

    // ===== MOCK DATA FOR UI TESTING =====
    useEffect(() => {
        // TODO: Replace with actual API call
        // const loadPosts = async () => {
        //   setLoadingPosts(true);
        //   try {
        //     const response = await fetch('/api/post/general?...');
        //     const data = await response.json();
        //     setPosts(normalizedPosts);
        //   } catch (error) {
        //     setPostsError(error.message);
        //   } finally {
        //     setLoadingPosts(false);
        //   }
        // };

        // Mock data for UI testing
        const mockPosts = [
            {
                id: "1",
                userName: "Nguyễn Văn A",
                userHandle: "nguyenvana",
                userAvatar: "/images/avatar.jpg",
                timestamp: "2 giờ trước",
                content:
                    "Trang trại sầu riêng của tôi đang thu hoạch mùa vụ mới! Sầu riêng Ri6 chất lượng cao, giá cả hợp lý. Liên hệ để đặt hàng nhé!",
                contact: "0123456789",
                image:
                    "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg",
                category: "Sản phẩm",
                likes: 24,
                comments: 8,
                shares: 3,
                status: "active",
                isLiked: false,
            },
            {
                id: "2",
                userName: "Trần Thị B",
                userHandle: "tranthib",
                userAvatar: "/images/avatar.jpg",
                timestamp: "5 giờ trước",
                content:
                    "Chia sẻ kinh nghiệm trồng sầu riêng hiệu quả: Cần chú ý đến độ pH của đất, tưới nước đều đặn và bón phân đúng cách. Ai cần tư vấn cứ inbox nhé!",
                contact: "consultb@example.com",
                image:
                    "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg",
                category: "Kinh nghiệm",
                likes: 45,
                comments: 12,
                shares: 7,
                status: "active",
                isLiked: true,
            },
            {
                id: "3",
                userName: "Lê Văn C",
                userHandle: "levanc",
                userAvatar: "/images/avatar.jpg",
                timestamp: "1 ngày trước",
                content:
                    "Cần thuê máy cày ruộng trong 3 ngày. Ai có dịch vụ cho thuê máy móc nông nghiệp liên hệ với tôi.",
                contact: "0987654321",
                image: null,
                category: "Thuê dịch vụ",
                likes: 12,
                comments: 5,
                shares: 1,
                status: "active",
                isLiked: false,
            },
            {
                id: "4",
                userName: "Phạm Thị D",
                userHandle: "phamthid",
                userAvatar: "/images/avatar.jpg",
                timestamp: "2 ngày trước",
                content:
                    "Dịch vụ tư vấn kỹ thuật trồng sầu riêng chuyên nghiệp. Đội ngũ chuyên gia 10 năm kinh nghiệm. Báo giá miễn phí!",
                contact: "tuvan@example.com",
                image:
                    "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg",
                category: "Dịch vụ",
                likes: 67,
                comments: 23,
                shares: 15,
                status: "active",
                isLiked: false,
            },
            {
                id: "5",
                userName: "Hoàng Văn E",
                userHandle: "hoangvane",
                userAvatar: "/images/avatar.jpg",
                timestamp: "3 ngày trước",
                content:
                    "Thông báo: Hội thảo về kỹ thuật trồng và chăm sóc sầu riêng sẽ diễn ra vào tuần sau. Mọi người quan tâm đăng ký sớm nhé!",
                contact: "hoithaoe@example.com",
                image: null,
                category: "Khác",
                likes: 89,
                comments: 34,
                shares: 28,
                status: "pending",
                isLiked: false,
            },
        ];

        setPosts(mockPosts);
    }, []);

    const handleLikeUpdate = (postId, isLiked) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        isLiked,
                        likes: isLiked ? post.likes + 1 : post.likes - 1,
                    }
                    : post
            )
        );
    };

    const handleClearFilters = () => {
        setSelectedCategory("Tất cả");
        setSelectedStatus("all");
        setSelectedSort("newest");
        setSearchQuery("");
    };

    // Filter and sort posts
    const filteredPosts = posts.filter((post) => {
        // Category filter
        if (selectedCategory !== "Tất cả" && post.category !== selectedCategory) {
            return false;
        }

        // Status filter
        if (selectedStatus !== "all" && post.status !== selectedStatus) {
            return false;
        }

        // Search filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            return (
                post.content.toLowerCase().includes(query) ||
                post.userName.toLowerCase().includes(query) ||
                post.category.toLowerCase().includes(query)
            );
        }

        return true;
    });

    // Sort posts
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (selectedSort === "newest") {
            return new Date(b.timestamp) - new Date(a.timestamp);
        } else {
            return new Date(a.timestamp) - new Date(b.timestamp);
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="pt-20 p-5 lg:pt-24 flex flex-col justify-center items-center">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Bài viết cộng đồng
                        </h1>
                        <p className="text-gray-600">
                            Khám phá và chia sẻ kiến thức về nông nghiệp
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <FilterBar
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        selectedSort={selectedSort}
                        onSortChange={setSelectedSort}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onClearFilters={handleClearFilters}
                    />

                    {/* Posts List */}
                    {loadingPosts && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                            <p className="text-gray-500 font-medium">Đang tải bài viết...</p>
                        </div>
                    )}

                    {postsError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
                            <p className="text-red-600 font-medium">{postsError}</p>
                        </div>
                    )}

                    {!loadingPosts && !postsError && sortedPosts.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ImageIcon className="text-gray-400" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                Không tìm thấy bài viết
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    {sortedPosts.map((post) => (
                        <Post
                            key={post.id}
                            post={post}
                            onLikeUpdate={handleLikeUpdate}
                        />
                    ))}

                    {/* Results Count */}
                    {sortedPosts.length > 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            Hiển thị {sortedPosts.length} bài viết
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
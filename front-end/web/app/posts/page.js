"use client";
import {
  Heart,
  MessageCircle,
  Tag,
  Phone,
  Mail,
  ImageIcon,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  Briefcase,
  Users,
  Wrench,
  BookOpen,
  Leaf,
  HandCoins,
  Grid,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { favoriteAPI, getOwnPosts, commentAPI } from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

const POST_CATEGORIES = [
  "Tất cả",
  "Dịch vụ",
  "Kinh nghiệm",
  "Sản phẩm",
  "Thuê dịch vụ",
  "Khác",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
];

const FilterBar = ({
  selectedCategory,
  onCategoryChange,
  selectedSort,
  onSortChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const hasActiveFilters =
    selectedCategory !== "Tất cả" ||
    selectedSort !== "newest" ||
    searchQuery.trim() !== "";

  const selectedSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label || "Mới nhất";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
      <div className="flex gap-3 mb-0">
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white transition-all cursor-pointer text-left flex justify-between items-center min-w-[140px]"
          >
            <span>{selectedSortLabel}</span>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showSortDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {SORT_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`px-3 py-2 cursor-pointer transition-colors text-sm ${selectedSort === option.value
                    ? "bg-emerald-600 text-white font-medium"
                    : "text-gray-900 hover:bg-emerald-500 hover:text-white"
                    }`}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${showFilters
            ? "bg-emerald-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <Filter size={20} />
          <span className="hidden sm:inline">Lọc</span>
        </button>
      </div>

      {showFilters && (
        <div className="pt-4 mt-4 border-t border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Danh mục
            </label>
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

const ServiceBanner = ({ onServiceFilter, isServiceFiltered }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-full p-3">
            <Briefcase className="text-white" size={32} />
          </div>
          <div className="text-white">
            <h3 className="text-xl font-bold mb-1">Cần thuê nhân công?</h3>
            <p className="text-emerald-50 text-sm">
              Xem các dịch vụ phun thuốc, diệt sâu, thu hoạch từ nhân công
              chuyên nghiệp
            </p>
          </div>
        </div>
        <button
          onClick={onServiceFilter}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md whitespace-nowrap ${isServiceFiltered
            ? "bg-white text-emerald-700 hover:bg-emerald-50"
            : "bg-emerald-700 text-white hover:bg-emerald-800"
            }`}
        >
          <Users size={20} />
          {isServiceFiltered ? "Xem tất cả" : "Xem dịch vụ"}
        </button>
      </div>
    </div>
  );
};

const Post = ({ post, onLikeUpdate, onContact }) => {
  const router = useRouter();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    setIsLiked(post.isLiked || false);
  }, [post.isLiked]);

  useEffect(() => {
    setCommentCount(post.comments || 0);
  }, [post.comments]);

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

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-all w-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div
              className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100 cursor-pointer"
              onClick={() => router.push(`/profile/${post.authorId}`)}
            >
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
              </div>
              <p className="text-gray-500 text-sm">
                {post.userHandle && post.userHandle}
                {post.userHandle && post.timestamp && " • "}
                {post.timestamp}
              </p>
            </div>
          </div>
        </div>

        {post.category &&
          (() => {
            const categoryConfig = {
              "Dịch vụ": { icon: Wrench, bg: "from-blue-500 to-cyan-500" },
              "Kinh nghiệm": {
                icon: BookOpen,
                bg: "from-amber-500 to-orange-500",
              },
              "Sản phẩm": { icon: Leaf, bg: "from-emerald-500 to-teal-500" },
              "Thuê dịch vụ": {
                icon: HandCoins,
                bg: "from-purple-500 to-violet-500",
              },
              Khác: { icon: Grid, bg: "from-gray-500 to-slate-500" },
            };
            const config = categoryConfig[post.category] || {
              icon: Grid,
              bg: "from-emerald-500 to-teal-500",
            };
            const Icon = config.icon;
            return (
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${config.bg} text-white shadow-sm`}
                >
                  <Icon size={14} />
                  {post.category}
                </span>
              </div>
            );
          })()}

        <div className="text-base text-gray-800 leading-relaxed mb-4">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.contact && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">
                Liên hệ:
              </span>
              <span className="text-sm font-semibold text-emerald-700">
                {post.contact}
              </span>
            </div>
          </div>
        )}

        {post.image && (
          <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

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

          <button
            onClick={() => onContact?.(post)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm"
          >
            Liên Hệ
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

export default function PostsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { setSelectedUser, addContact } = useChatStore();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadPostsWithFavorites = async () => {
      setLoadingPosts(true);
      setPostsError(null);

      try {
        const filters = {
          status: "active",
          sort: selectedSort,
        };

        if (selectedCategory !== "Tất cả") {
          filters.category = selectedCategory;
        }

        if (searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }

        const [postsData, favoritesResponse] = await Promise.all([
          getOwnPosts(filters),
          favoriteAPI.getFavorites().catch((err) => {
            console.error("Error loading favorites:", err);
            return { data: [] };
          }),
        ]);

        if (isCancelled) return;

        const favoritePostIds = new Set(
          (favoritesResponse.data || [])
            .map((fav) => fav.post_id?._id || fav.post_id)
            .filter(Boolean),
        );

        const normalizedPosts = (postsData || []).map((post) => {
          const postId = post._id;
          const isLiked = favoritePostIds.has(postId);

          const author = post.author || {};
          const authorName =
            author.full_name || author.name || author.username || "Người dùng";
          const authorAvatar = author.avatar || "/images/avatar.jpg";
          const authorEmail = author.email || "";

          return {
            id: postId,
            authorId: author._id || author.id,
            userName: authorName,
            userHandle: authorEmail,
            userAvatar: authorAvatar,
            timestamp: post.created_at
              ? new Date(post.created_at).toLocaleString("vi-VN")
              : "Vừa xong",
            content: post.content,
            contact: post.contact,
            image: post.image,
            category: post.category,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            status: post.status || "active",
            isLiked: isLiked,
          };
        });

        setPosts(normalizedPosts);
        const postsWithComments = await Promise.all(
          normalizedPosts.map(async (post) => {
            try {
              const res = await commentAPI.getCommentsByPost(post.id, "all");
              const countComments = (list) => {
                let count = list.length;
                list.forEach((c) => {
                  if (c.children?.length) count += countComments(c.children);
                });
                return count;
              };
              return { ...post, comments: countComments(res.data || []) };
            } catch {
              return post;
            }
          }),
        );
        setPosts(postsWithComments);
      } catch (error) {
        if (isCancelled) return;
        console.error("Error loading posts:", error);
        setPostsError(error?.message || "Không thể tải bài viết");
      } finally {
        if (isCancelled) return;
        setLoadingPosts(false);
      }
    };

    loadPostsWithFavorites();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, selectedSort, searchQuery]);

  const handleLikeUpdate = (postId, isLiked) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          }
          : post,
      ),
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory("Tất cả");
    setSelectedSort("newest");
    setSearchQuery("");
  };

  const handleServiceFilter = () => {
    if (selectedCategory === "Dịch vụ") {
      setSelectedCategory("Tất cả");
    } else {
      setSelectedCategory("Dịch vụ");
    }
  };

  const handleContact = (post) => {
    if (!authUser) {
      router.push("/login");
      return;
    }

    const receiverId = post.authorId;
    if (!receiverId) return;

    const chatUser = {
      _id: receiverId,
      full_name: post.userName || "Người bán",
      avatar: post.userAvatar || "images/avatar.jpg",
    };

    addContact(chatUser);
    setSelectedUser(chatUser);
    router.push(`/chat/${receiverId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-20 p-5 lg:pt-24 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bài viết cộng đồng
              </h1>
              <p className="text-gray-600">
                Khám phá và chia sẻ kiến thức về nông nghiệp
              </p>
            </div>
            {posts.length > 0 && (
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                <span className="text-2xl font-bold">{posts.length}</span>
                <span className="text-sm ml-2">bài viết</span>
              </div>
            )}
          </div>

          <ServiceBanner
            onServiceFilter={handleServiceFilter}
            isServiceFiltered={selectedCategory === "Dịch vụ"}
          />

          <FilterBar
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
          />

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

          {!loadingPosts && !postsError && posts.length === 0 && (
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

          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLikeUpdate={handleLikeUpdate}
              onContact={handleContact}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

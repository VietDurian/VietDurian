"use client";
import {
  Heart,
  MessageCircle,
  ImageIcon,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  Wrench,
  BookOpen,
  Package,
  HandCoins,
  LayoutGrid,
  ChevronDown,
  Info,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { favoriteAPI, getOwnPosts, commentAPI } from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import Link from "next/link";

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

const CATEGORY_GUIDE = [
  {
    key: "Dịch vụ",
    Icon: Wrench,
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    ringColor: "ring-blue-500",
    textColor: "text-blue-700",
    tagBg: "bg-blue-100 text-blue-700",
    who: "Dành cho: Nhân công",
    tagLine: "Tôi cung cấp dịch vụ",
    desc: "Nhân công đăng bài chào dịch vụ của mình: phun thuốc, diệt sâu, thu hoạch, chăm sóc vườn... Ai cần thuê thì liên hệ!",
  },
  {
    key: "Kinh nghiệm",
    Icon: BookOpen,
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200",
    ringColor: "ring-amber-500",
    textColor: "text-amber-700",
    tagBg: "bg-amber-100 text-amber-700",
    who: "Dành cho: Tất cả mọi người",
    tagLine: "Chia sẻ kiến thức",
    desc: "Chia sẻ mẹo trồng trọt, cách xử lý sâu bệnh, kinh nghiệm canh tác thực tế. Học hỏi từ cộng đồng nông dân!",
  },
  {
    key: "Sản phẩm",
    Icon: Package,
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
    ringColor: "ring-emerald-500",
    textColor: "text-emerald-700",
    tagBg: "bg-emerald-100 text-emerald-700",
    who: "Dành cho: Người bán",
    tagLine: "Mua bán nông sản",
    desc: "Rao bán sầu riêng, phân bón, thuốc trừ sâu, cây giống và các nông sản khác. Kết nối người mua – người bán!",
  },
  {
    key: "Thuê dịch vụ",
    Icon: HandCoins,
    gradient: "from-purple-500 to-violet-500",
    bgLight: "bg-purple-50",
    borderColor: "border-purple-200",
    ringColor: "ring-purple-500",
    textColor: "text-purple-700",
    tagBg: "bg-purple-100 text-purple-700",
    who: "Dành cho: Chủ vườn / Nông dân",
    tagLine: "Tôi cần thuê người",
    desc: "Chủ vườn đăng tin tìm nhân công: cần người phun thuốc, hái quả, chăm sóc vườn. Ai nhận việc thì liên hệ!",
  },
  {
    key: "Khác",
    Icon: LayoutGrid,
    gradient: "from-gray-500 to-slate-500",
    bgLight: "bg-gray-50",
    borderColor: "border-gray-200",
    ringColor: "ring-gray-400",
    textColor: "text-gray-600",
    tagBg: "bg-gray-100 text-gray-600",
    who: "Dành cho: Tất cả",
    tagLine: "Nội dung khác",
    desc: "Hỏi đáp, thông báo, tin tức nông nghiệp và các chủ đề chưa phân loại vào mục trên.",
  },
];

// ─── Category Guide Section ───────────────────────────────────────────────────
const CategoryGuideSection = ({ selectedCategory, onCategoryChange }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
            <Info size={18} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-base">
              Hướng dẫn danh mục bài viết
            </p>
            <p className="text-gray-500 text-sm">
              Bấm để xem từng danh mục dùng để làm gì
            </p>
          </div>
        </div>
        <div className={`text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
          <ChevronDown size={22} />
        </div>
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORY_GUIDE.map((cat) => {
            const { Icon } = cat;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(isActive ? "Tất cả" : cat.key)}
                className={`group relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all text-left shadow-sm hover:shadow-md ${isActive
                  ? `${cat.bgLight} ${cat.borderColor} ring-2 ${cat.ringColor}`
                  : `bg-white border-gray-200`
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-md`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cat.tagBg}`}>
                    {cat.tagLine}
                  </span>
                </div>
                <div>
                  <h4 className={`font-bold text-base ${cat.textColor} mb-0.5`}>{cat.key}</h4>
                  <p className="text-xs font-medium text-gray-400">{cat.who}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{cat.desc}</p>
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${cat.textColor} mt-auto`}>
                  <Filter size={13} />
                  {isActive ? "Đang lọc danh mục này" : "Bấm để lọc danh mục"}
                </div>
                {isActive && (
                  <div className={`absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br ${cat.gradient} opacity-5`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Filter Bar ───────────────────────────────────────────────────────────────
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

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
      <div className="flex gap-3 mb-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          />
        </div>

        {/* Sort dropdown - blog style */}
        <div className="relative sort-dropdown">
          <button
            type="button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="min-w-[140px] px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
          >
            <span>{selectedSortLabel}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-200 ${showSortDropdown ? "rotate-180" : ""}`} />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
              {SORT_OPTIONS.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => { onSortChange(option.value); setShowSortDropdown(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${selectedSort === option.value
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                    } ${index !== SORT_OPTIONS.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  {option.label}
                </button>
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">Danh mục</label>
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

// ─── Post Card ────────────────────────────────────────────────────────────────
const Post = ({ post, onLikeUpdate, onContact }) => {
  const router = useRouter();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => { setIsLiked(post.isLiked || false); }, [post.isLiked]);
  useEffect(() => { setCommentCount(post.comments || 0); }, [post.comments]);

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
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể cập nhật yêu thích";
      alert(errorMessage);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const categoryConfig = {
    "Dịch vụ": { icon: Wrench, bg: "from-blue-500 to-cyan-500" },
    "Kinh nghiệm": { icon: BookOpen, bg: "from-amber-500 to-orange-500" },
    "Sản phẩm": { icon: Package, bg: "from-emerald-500 to-teal-500" },
    "Thuê dịch vụ": { icon: HandCoins, bg: "from-purple-500 to-violet-500" },
    "Khác": { icon: LayoutGrid, bg: "from-gray-500 to-slate-500" },
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
              <img src={post.userAvatar || "/images/avatar.jpg"} alt={post.userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-bold text-gray-900 text-base">{post.userName}</h4>
              </div>
              <p className="text-gray-500 text-sm">
                {post.userHandle && post.userHandle}
                {post.userHandle && post.timestamp && " • "}
                {post.timestamp}
              </p>
            </div>
          </div>
        </div>

        {post.category && (() => {
          const config = categoryConfig[post.category] || { icon: LayoutGrid, bg: "from-gray-500 to-slate-500" };
          const Icon = config.icon;
          return (
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${config.bg} text-white shadow-sm`}>
                <Icon size={14} />{post.category}
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
              <span className="text-sm font-semibold text-gray-500">Liên hệ:</span>
              <span className="text-sm font-semibold text-emerald-700">{post.contact}</span>
            </div>
          </div>
        )}

        {post.image && (
          <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
            <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between px-1">
          <button
            onClick={handleLike}
            disabled={isTogglingFavorite}
            className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500 hover:bg-red-50"} ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isTogglingFavorite ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} className={`${isLiked ? "fill-current" : ""}`} />}
            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
          </button>

          <button
            onClick={() => setIsCommentModalOpen(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition px-3 py-1.5 rounded-lg"
          >
            <MessageCircle size={20} />
            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
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
          (favoritesResponse.data || []).map((fav) => fav.post_id?._id || fav.post_id).filter(Boolean),
        );

        const normalizedPosts = (postsData || []).map((post) => {
          const postId = post._id;
          const isLiked = favoritePostIds.has(postId);
          const author = post.author || {};
          const authorName = author.full_name || author.name || author.username || "Người dùng";
          const authorAvatar = author.avatar || "/images/avatar.jpg";
          const authorEmail = author.email || "";

          return {
            id: postId,
            authorId: author._id || author.id,
            userName: authorName,
            userHandle: authorEmail,
            userAvatar: authorAvatar,
            timestamp: post.created_at ? new Date(post.created_at).toLocaleString("vi-VN") : "Vừa xong",
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
                list.forEach((c) => { if (c.children?.length) count += countComments(c.children); });
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

    return () => { isCancelled = true; };
  }, [selectedCategory, selectedSort, searchQuery]);

  const handleLikeUpdate = (postId, isLiked) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked, likes: isLiked ? post.likes + 1 : post.likes - 1 }
          : post,
      ),
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory("Tất cả");
    setSelectedSort("newest");
    setSearchQuery("");
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
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài viết cộng đồng</h1>
              <p className="text-gray-600">Khám phá và chia sẻ kiến thức về nông nghiệp</p>
            </div>
            {posts.length > 0 && (
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                <span className="text-2xl font-bold">{posts.length}</span>
                <span className="text-sm ml-2">bài viết</span>
              </div>
            )}
          </div>

          <CategoryGuideSection selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

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
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng nhập để xem bài viết</h3>
              <p className="text-gray-500 text-sm mb-6">Bạn cần đăng nhập để truy cập nội dung này.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login" className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">
                  Đăng nhập ngay
                </Link>
                <Link href="/register" className="px-6 py-2.5 border border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors text-sm">
                  Tạo tài khoản
                </Link>
              </div>
            </div>
          )}
          {!loadingPosts && !postsError && posts.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy bài viết</h3>
              <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
              <button
                onClick={handleClearFilters}
                className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {posts.map((post) => (
            <Post key={post.id} post={post} onLikeUpdate={handleLikeUpdate} onContact={handleContact} />
          ))}
        </div>
      </main>
    </div>
  );
}
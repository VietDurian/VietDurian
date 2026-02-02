"use client";
import {
  Camera,
  Heart,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Tag,
  Phone,
  Mail,
  Share2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import CommentModal from "@/components/CommentModal";

const POST_CATEGORIES = [
  "Dịch vụ",
  "Kinh nghiệm",
  "Sản phẩm",
  "Thuê dịch vụ",
  "Khác",
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

// Post Composer Component - PROMINENT INPUT STYLE
const PostComposer = ({ onOpenModal, user }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-emerald-100 shadow-sm">
          <img
            src={user?.avatar || "/images/avatar.jpg"}
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div
          onClick={onOpenModal}
          className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-teal-50 border-2 border-gray-300 hover:border-emerald-400 rounded-full px-5 py-3.5 text-gray-600 cursor-pointer transition-all shadow-sm hover:shadow-md"
        >
          <span className="text-sm font-medium">Bạn đang nghĩ gì?</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onOpenModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
        >
          Đăng bài
        </button>
      </div>
    </div>
  );
};

// Post Modal Component
const PostModal = ({ isOpen, onClose, user, onPostCreated }) => {
  const fileInputRef = useRef(null);
  const [category, setCategory] = useState(POST_CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageData, setImageData] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit =
    Boolean(category) &&
    Boolean(content.trim()) &&
    Boolean(imageData) &&
    Boolean(contact.trim());

  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setContact("");
      setImagePreview("");
      setImageData("");
      setError("");
      setCategory(POST_CATEGORIES[0]);
    }
  }, [isOpen]);

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

    // UI-ONLY: Tạo mock post để hiển thị ngay
    try {
      const mockPost = {
        id: `mock_${Date.now()}`,
        userName:
          user?.full_name ||
          user?.name ||
          user?.username ||
          user?.email ||
          "Bạn",
        userHandle: user?.username || user?.email || "",
        userAvatar: user?.avatar || "/images/avatar.jpg",
        timestamp: "Vừa xong",
        content: content.trim(),
        link: contact.trim(),
        image: imagePreview,
        category: category,
        likes: 0,
        comments: 0,
        shares: 0,
        status: "pending",
        isLiked: false,
      };

      onPostCreated?.(mockPost);
      onClose();
    } catch (submitError) {
      setError("Không thể tạo bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Tạo Bài Viết</h2>
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
                  const dropdown = document.getElementById('category-dropdown');
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
                id="category-dropdown"
                className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              >
                {POST_CATEGORIES.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      setCategory(item);
                      document.getElementById('category-dropdown').classList.add('hidden');
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
              autoFocus
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
                Đang đăng...
              </span>
            ) : (
              "Đăng bài viết"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Post Component - FIXED LIKE & SIMPLIFIED CONTACT
const Post = ({ post, onLikeUpdate }) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    // Không cộng/trừ nữa, giữ nguyên số like
    onLikeUpdate?.(post.id, newLikedState);
  };

  // Xác định icon cho contact
  const isEmail = post.link?.includes("@");
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
                <h4 className="font-bold text-gray-900 text-base">{post.userName}</h4>
                <StatusBadge status={post.status} />
              </div>
              <p className="text-gray-500 text-sm">
                @{post.userHandle} • {post.timestamp}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* SIMPLE CATEGORY BADGE */}
        {post.category && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200">
              <Tag size={16} className="text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">{post.category}</span>
            </div>
          </div>
        )}

        <div className="text-base text-gray-800 leading-relaxed mb-4">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* SIMPLE CONTACT INFO - ICON + TEXT INLINE */}
        {post.link && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <ContactIcon size={18} className="text-emerald-600" />
              <span className="text-sm font-semibold">{post.link}</span>
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
            className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              }`}
          >
            <Heart
              size={20}
              className={`${isLiked ? "fill-current" : ""}`}
            />
            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
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
            {post.shares > 0 && <span className="text-sm font-medium">{post.shares}</span>}
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
export default function ContentExpertProfileContent() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);

  // UI-ONLY: Load mock data instead of API
  useEffect(() => {
    // Mock empty state for now
    setLoadingPosts(false);
    setPosts([]);
  }, [user]);


  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

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

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-18 p-5 lg:pt-20 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl mt-5">
          <PostComposer
            onOpenModal={() => setIsPostModalOpen(true)}
            user={user}
          />
        </div>

        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          user={user || {}}
          onPostCreated={handlePostCreated}
        />

        <div className="w-full max-w-4xl mt-8">
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
                Chưa có bài viết
              </h3>
              <p className="text-gray-500 mb-4">
                Hãy chia sẻ khoảnh khắc đầu tiên của bạn!
              </p>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition"
              >
                Tạo bài viết
              </button>
            </div>
          )}

          {posts.map((post) => (
            <Post
              key={post.id || post._id}
              post={post}
              onLikeUpdate={handleLikeUpdate}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
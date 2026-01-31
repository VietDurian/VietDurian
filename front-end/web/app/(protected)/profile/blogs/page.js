"use client";
import AsideBar from "@/components/AsideBar";
import Navbar from "@/components/Navbar";
import {
  Camera,
  Gift,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Smile,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { createPost, getOwnPosts } from "@/lib/api";

const POST_CATEGORIES = [
  "Dịch vụ",
  "Kinh nghiệm",
  "Sản phẩm",
  "Thuê dịch vụ",
  "Khác",
];

const PostComposer = ({ onOpenModal }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 w-full max-w-4xl">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src="/images/avatar.jpg"
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Clicking this area opens the Post modal */}
        <div
          onClick={onOpenModal}
          className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-5 py-2.5 text-gray-500 cursor-pointer transition"
        >
          What&apos;s on your mind?
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-5 mt-4 px-2">
        <button className="text-slate-500 hover:text-emerald-700 transition">
          <Camera size={24} />
        </button>
        <button className="text-slate-500 hover:text-emerald-700 transition">
          <ImageIcon size={24} />
        </button>
        <button
          onClick={onOpenModal}
          className="bg-[#064e3b] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#053f30] transition shadow-sm"
        >
          Post
        </button>
      </div>
    </div>
  );
};

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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      setError(
        "Vui lòng điền đủ danh mục, nội dung, ảnh và thông tin liên hệ.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createPost({
        category,
        content: content.trim(),
        image: imageData,
        contact: contact.trim(),
      });

      const normalizedPost = {
        id: created?._id || `${Date.now()}`,
        userName:
          user?.full_name ||
          user?.name ||
          user?.username ||
          user?.email ||
          "Bạn",
        userHandle: user?.username || user?.email || "",
        userAvatar: user?.avatar || "/images/avatar.jpg",
        timestamp: created?.created_at
          ? new Date(created.created_at).toLocaleString()
          : "Vừa xong",
        content: created?.content || content.trim(),
        link: created?.contact || contact.trim(),
        image: created?.image || imagePreview,
        category: created?.category || category,
        likes: created?.likes_count || 0,
        comments: created?.comments_count || 0,
        shares: created?.shares_count || 0,
      };

      onPostCreated?.(normalizedPost);
      onClose();
    } catch (submitError) {
      const message = submitError?.message || "Không thể tạo bài viết";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Tạo Post</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition cursor-pointer"
            aria-label="Đóng"
          >
            <X size={20} color="gray" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "/images/avatar.jpg"}
              className="w-11 h-11 rounded-full border border-gray-200"
              alt="Ảnh đại diện"
            />
            <div>
              <p className="font-semibold">
                {user?.full_name || user?.name || user?.username || "Bạn"}
              </p>
              <div className="text-xs text-gray-500">Công khai</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Danh mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {POST_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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
              className="w-full bg-transparent text-base resize-none outline-none min-h-[120px] placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Liên hệ
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Số điện thoại hoặc email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ảnh</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <ImageIcon className="text-green-600" size={18} />
                Chọn ảnh
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <span className="text-xs text-gray-500">Chỉ chọn 1 ảnh</span>
            </div>
            {imagePreview && (
              <div className="rounded-lg overflow-hidden border border-gray-200 max-h-80">
                <img
                  src={imagePreview}
                  alt="Ảnh đã chọn"
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-emerald-700 text-white font-bold py-2 rounded-lg mt-1 hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang đăng..." : "Đăng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Post = ({ post }) => {
  return (
    <article className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm w-full">
      {/* Header: Avatar, Name, and Menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={post.userAvatar || "/images/avatar.jpg"}
              alt={post.userName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">
              {post.userName}
            </h4>
            <p className="text-gray-400 text-xs mt-0.5">
              @{post.userHandle} • {post.timestamp}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-50 p-1 rounded-full transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="text-sm text-gray-700 leading-relaxed mb-4">
        <p>{post.content}</p>
        {post.link && (
          <a
            href={post.link}
            className="text-blue-500 hover:underline block mt-2"
          >
            {post.link}
          </a>
        )}
      </div>

      {/* Post Image (Optional) */}
      {post.image && (
        <div className="rounded-xl overflow-hidden mb-4 border border-gray-100">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Footer: Interaction Buttons */}
      <div className="pt-3 border-t border-gray-50 flex items-center justify-between px-2 text-gray-400">
        <button className="flex items-center gap-2 hover:text-red-500 transition group">
          <Heart size={18} className="group-hover:fill-current" />
          <span className="text-xs font-medium">{post.likes} Thích</span>
        </button>

        <button className="flex items-center gap-2 hover:text-emerald-700 transition group">
          <MessageCircle size={18} />
          <span className="text-xs font-medium">{post.comments}</span>
        </button>

        <button className="flex items-center gap-2 hover:text-blue-600 transition group">
          <Share2 size={18} />
          <span className="text-xs font-medium">{post.shares}</span>
        </button>
      </div>
    </article>
  );
};

export default function ContentExpertProfileContent() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);

  // Get User's posts

  useEffect(() => {
    let isCancelled = false;

    const loadPosts = async () => {
      if (!user?._id && !user?.id) return;

      setLoadingPosts(true);
      setPostsError(null);

      try {
        const data = await getOwnPosts({ author_id: user._id || user.id });

        if (isCancelled) return;

        const normalizedPosts = (data || []).map((post) => ({
          id: post._id,
          userName: user?.full_name || user?.name || user?.username || "Bạn",
          userHandle: user?.username || user?.email || "",
          userAvatar: user?.avatar || "/images/avatar.jpg",
          timestamp: post.created_at
            ? new Date(post.created_at).toLocaleString()
            : "Vừa xong",
          content: post.content,
          link: post.contact,
          image: post.image,
          category: post.category,
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
        }));

        setPosts(normalizedPosts);
      } catch (error) {
        if (isCancelled) return;
        setPostsError(error?.message || "Không thể tải bài viết");
      } finally {
        if (isCancelled) return;
        setLoadingPosts(false);
      }
    };

    loadPosts();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <Navbar />
      <main className="text-center mt-50">Details</main>
    </div>
  );
}

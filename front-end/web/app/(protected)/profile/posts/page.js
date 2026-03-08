"use client";

import {
  Heart, ImageIcon, MessageCircle, MoreHorizontal, X,
  CheckCircle, Clock, XCircle, AlertCircle, Share2, Loader2,
  Wrench, BookOpen, Leaf, HandCoins, Grid, Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOwnPosts, updatePost, deletePost, favoriteAPI, commentAPI } from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const getCategoriesByRole = (role) => {
  switch (role) {
    case "trader": return ["Sản phẩm", "Kinh nghiệm", "Thuê dịch vụ", "Khác"];
    case "farmer": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    case "serviceProvider": return ["Dịch vụ", "Sản phẩm", "Kinh nghiệm", "Khác"];
    case "contentExpert": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    default: return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
  }
};

// ── Confirm Modal ─────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-gray-800 text-sm mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Hủy</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm">Xóa</button>
        </div>
      </div>
    </div>
  );
};

// ── Status Badge ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending: { icon: Clock, text: "Đang chờ duyệt", bg: "bg-amber-50", text_c: "text-amber-700", icon_c: "text-amber-500", border: "border-amber-200" },
    active: { icon: CheckCircle, text: "Đã duyệt", bg: "bg-emerald-50", text_c: "text-emerald-700", icon_c: "text-emerald-500", border: "border-emerald-200" },
    rejected: { icon: XCircle, text: "Bị từ chối", bg: "bg-red-50", text_c: "text-red-700", icon_c: "text-red-500", border: "border-red-200" },
    inactive: { icon: AlertCircle, text: "Ngưng hoạt động", bg: "bg-gray-50", text_c: "text-red-700", icon_c: "text-red-500", border: "border-red-200" },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text_c} text-xs font-medium`}>
      <Icon size={14} className={cfg.icon_c} /><span>{cfg.text}</span>
    </div>
  );
};

// ── Edit Post Modal ───────────────────────────────────────
const EditPostModal = ({ isOpen, onClose, post, user, onPostUpdated }) => {
  const fileInputRef = useRef(null);
  const categories = getCategoriesByRole(user?.role);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [category, setCategory] = useState(post?.category || categories[0]);
  const [content, setContent] = useState(post?.content || "");
  const [contact, setContact] = useState(post?.link || "");
  const [imagePreview, setImagePreview] = useState(post?.image || "");
  const [imageData, setImageData] = useState(post?.image || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = Boolean(category) && Boolean(content.trim()) && Boolean(imageData) && Boolean(contact.trim());

  useEffect(() => {
    if (post) {
      setCategory(post.category || categories[0]);
      setContent(post.content || "");
      setContact(post.link || "");
      setImagePreview(post.image || "");
      setImageData(post.image || "");
      setError("");
      setDropdownOpen(false);
    }
  }, [post]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Ảnh quá lớn. Tối đa 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { const r = reader.result?.toString() || ""; setImageData(r); setImagePreview(r); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) { setError("Vui lòng điền đủ thông tin."); return; }
    setIsSubmitting(true);
    try {
      const updated = await updatePost(post.id, { category, content: content.trim(), image: imageData, contact: contact.trim() });
      onPostUpdated?.({ ...post, content: updated?.content || content.trim(), link: updated?.contact || contact.trim(), image: updated?.image || imagePreview, category: updated?.category || category, status: updated?.status || post.status });
      onClose();
    } catch (err) {
      setError(err?.message || "Không thể cập nhật bài viết");
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
          <button onClick={onClose} className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-center gap-3">
            <img src={user?.avatar || "/images/avatar.jpg"} className="w-11 h-11 rounded-full border border-gray-200" alt="Avatar" />
            <div>
              <p className="font-semibold text-gray-800">{user?.full_name || user?.name || user?.username || "Bạn"}</p>
              <div className="text-xs text-gray-500">Công khai</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Danh mục</label>
            <div className="relative">
              <button type="button" onClick={() => setDropdownOpen((o) => !o)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white transition-all cursor-pointer text-left flex justify-between items-center">
                <span>{category}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {categories.map((item) => (
                    <div key={item} onClick={() => { setCategory(item); setDropdownOpen(false); }} className={`px-3 py-2 cursor-pointer transition-colors text-sm ${category === item ? "bg-emerald-600 text-white font-medium" : "text-gray-900 hover:bg-emerald-500 hover:text-white"}`}>{item}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Nội dung</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Bạn đang nghĩ gì?" className="w-full bg-white text-gray-900 text-base resize-none outline-none min-h-[140px] placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600" maxLength={1000} />
            <div className="text-xs text-gray-500 text-right">{content.length}/1000</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Thông tin liên hệ</label>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Số điện thoại hoặc email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ảnh</label>
            {!imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600">Nhấp để chọn ảnh</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full h-auto object-contain bg-gray-50 max-h-80" />
                <button type="button" onClick={() => { setImagePreview(""); setImageData(""); }} className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"><X size={16} /></button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={18} /><span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={!canSubmit || isSubmitting} className="w-full bg-emerald-700 text-white font-bold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Đang cập nhật...
              </span>
            ) : "Cập nhật bài viết"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Post Card ─────────────────────────────────────────────
const Post = ({ post, onLikeUpdate, onDelete, onEdit, onDeleteConfirm }) => {
  const router = useRouter();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => { setIsLiked(post.isLiked || false); }, [post.isLiked]);
  useEffect(() => { setCommentCount(post.comments || 0); }, [post.comments]);

  const handleLike = async () => {
    if (isTogglingFavorite) return;
    const newState = !isLiked;
    setIsLiked(newState);
    setIsTogglingFavorite(true);
    try {
      if (newState) await favoriteAPI.addFavorite(post.id);
      else await favoriteAPI.removeFavorite(post.id);
      onLikeUpdate?.(post.id, newState);
    } catch (err) {
      setIsLiked(!newState);
      toast.error(err?.response?.data?.message || err?.message || "Không thể cập nhật yêu thích");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  useEffect(() => {
    const close = () => setShowMenu(false);
    if (showMenu) { document.addEventListener("click", close); return () => document.removeEventListener("click", close); }
  }, [showMenu]);

  const categoryConfig = {
    "Dịch vụ": { icon: Wrench, bg: "from-blue-500 to-cyan-500" },
    "Kinh nghiệm": { icon: BookOpen, bg: "from-amber-500 to-orange-500" },
    "Sản phẩm": { icon: Leaf, bg: "from-emerald-500 to-teal-500" },
    "Thuê dịch vụ": { icon: HandCoins, bg: "from-purple-500 to-violet-500" },
    "Khác": { icon: Grid, bg: "from-gray-500 to-slate-500" },
  };

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow w-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100 cursor-pointer" onClick={() => router.push(`/profile/${post.authorId}`)}>
              <img src={post.userAvatar || "/images/avatar.jpg"} alt={post.userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-bold text-gray-900 text-base">{post.userName}</h4>
                <StatusBadge status={post.status} />
              </div>
              <p className="text-gray-500 text-sm">@{post.userHandle} • {post.timestamp}</p>
            </div>
          </div>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition">
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(post); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Chỉnh sửa
                </button>
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDeleteConfirm?.(post.id); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Xóa
                </button>
              </div>
            )}
          </div>
        </div>

        {post.category && (() => {
          const cfg = categoryConfig[post.category] || { icon: Grid, bg: "from-gray-500 to-slate-500" };
          const Icon = cfg.icon;
          return (
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${cfg.bg} text-white shadow-sm`}>
                <Icon size={14} />{post.category}
              </span>
            </div>
          );
        })()}

        <p className="text-base text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.link && (
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-500">Liên hệ: </span>
            <span className="text-sm font-semibold text-emerald-700">{post.link}</span>
          </div>
        )}

        {post.image && (
          <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
            <img src={post.image} alt="Post content" className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between px-1">
          <button onClick={handleLike} disabled={isTogglingFavorite} className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500 hover:bg-red-50"} ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isTogglingFavorite ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} className={isLiked ? "fill-current" : ""} />}
            {likeCount > 0 && <span className="text-sm font-medium">{likeCount}</span>}
          </button>
          <button onClick={() => setIsCommentModalOpen(true)} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition px-3 py-1.5 rounded-lg">
            <MessageCircle size={20} />
            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
          </button>
          <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition px-3 py-1.5 rounded-lg">
            <Share2 size={20} />
            {post.shares > 0 && <span className="text-sm font-medium">{post.shares}</span>}
          </button>
        </div>
      </article>
      <CommentModal isOpen={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)} postId={post.id} onCommentCountChange={setCommentCount} />
    </>
  );
};

// ── Main ──────────────────────────────────────────────────
export default function PostsPage() {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?._id && !user?.id) return;
      setLoadingPosts(true);
      setPostsError(null);
      try {
        const [postsData, favoritesResponse] = await Promise.all([
          getOwnPosts({ author_id: user._id || user.id }),
          favoriteAPI.getFavorites().catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        const favoritePostIds = new Set((favoritesResponse.data || []).map((f) => f.post_id?._id || f.post_id).filter(Boolean));
        const normalized = (postsData || []).map((post) => ({
          id: post._id, authorId: user._id || user.id,
          userName: user?.full_name || user?.name || user?.username || "Bạn",
          userHandle: user?.username || user?.email || "",
          userAvatar: user?.avatar || "/images/avatar.jpg",
          timestamp: post.created_at ? new Date(post.created_at).toLocaleString("vi-VN") : "Vừa xong",
          content: post.content, link: post.contact, image: post.image, category: post.category,
          likes: post.likes_count || 0, comments: post.comments_count || 0, shares: post.shares_count || 0,
          status: post.status || "pending", isLiked: favoritePostIds.has(post._id),
        }));
        setPosts(normalized);
        const withComments = await Promise.all(normalized.map(async (post) => {
          try {
            const res = await commentAPI.getCommentsByPost(post.id, "all");
            const count = (list) => { let n = list.length; list.forEach((c) => { if (c.children?.length) n += count(c.children); }); return n; };
            return { ...post, comments: count(res.data || []) };
          } catch { return post; }
        }));
        if (!cancelled) setPosts(withComments);
      } catch (err) {
        if (!cancelled) setPostsError(err?.message || "Không thể tải bài viết");
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const handleLikeUpdate = (postId, isLiked) => { setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 } : p)); };
  const handleEdit = (post) => { setEditingPost(post); setIsEditModalOpen(true); };
  const handlePostUpdated = (updated) => { setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p)); };

  const handleDeleteConfirm = (postId) => {
    setDeletingPostId(postId);
    setConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deletePost(deletingPostId);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      setConfirmModalOpen(false);
      setDeletingPostId(null);
    } catch (err) {
      toast.error(err?.message || "Không thể xóa bài viết");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-7 px-4 flex flex-col justify-center items-center">
        <div className="w-full mt-5">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl shadow-xl p-8 md:p-12 w-full">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Bài viết của tôi</h1>
                <p className="text-emerald-50 text-lg">Chia sẻ kinh nghiệm, đăng dịch vụ cho thuê, tìm người thuê và rao bán sản phẩm nông nghiệp</p>
              </div>
              <Link href="/profile/posts/create" className="bg-white hover:bg-emerald-50 text-emerald-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg">
                <Plus size={20} />Đăng bài
              </Link>
            </div>
          </div>
        </div>

        <EditPostModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPost(null); }} post={editingPost} user={user || {}} onPostUpdated={handlePostUpdated} />

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
              <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-500 mb-4">Hãy chia sẻ khoảnh khắc đầu tiên của bạn!</p>
              <Link href="/profile/posts/create" className="inline-block bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition">
                Tạo bài viết
              </Link>
            </div>
          )}
          {posts.map((post) => (
            <Post key={post.id || post._id} post={post} onLikeUpdate={handleLikeUpdate} onEdit={handleEdit} onDelete={handleDelete} onDeleteConfirm={handleDeleteConfirm} />
          ))}
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setDeletingPostId(null); }}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa bài viết này?"
      />
    </div>
  );
}
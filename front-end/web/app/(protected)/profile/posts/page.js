"use client";

import {
  Heart,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Wrench,
  BookOpen,
  Package,
  HandCoins,
  LayoutGrid,
  Plus,
  ChevronDown,
  Phone,
  Mail,
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getOwnPosts,
  updatePost,
  deletePost,
  favoriteAPI,
  commentAPI,
} from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import Link from "next/link";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

const getCategoriesByRole = (role) => {
  switch (role) {
    case "trader":
      return ["Sản phẩm", "Kinh nghiệm", "Thuê dịch vụ", "Khác"];
    case "farmer":
      return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    case "serviceProvider":
      return ["Dịch vụ", "Sản phẩm", "Kinh nghiệm", "Khác"];
    case "contentExpert":
      return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    default:
      return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
  }
};

const TITLE_PLACEHOLDERS = {
  "Dịch vụ": "VD: Dọn cỏ, làm vườn, phun thuốc, cắt tỉa cành...",
  "Sản phẩm": "VD: Bán sầu riêng Ri6, phân bón hữu cơ, cây giống...",
  "Kinh nghiệm": "VD: Kỹ thuật bón phân, cách xử lý sâu bệnh...",
  "Thuê dịch vụ": "VD: Cần thuê người phun thuốc, hái quả, chăm vườn...",
  Khác: "VD: Thông báo, hỏi đáp, tin tức nông nghiệp...",
};

const categoryConfig = {
  "Dịch vụ": { icon: Wrench, bg: "from-blue-500 to-cyan-500" },
  "Kinh nghiệm": { icon: BookOpen, bg: "from-amber-500 to-orange-500" },
  "Sản phẩm": { icon: Package, bg: "from-emerald-500 to-teal-500" },
  "Thuê dịch vụ": { icon: HandCoins, bg: "from-purple-500 to-violet-500" },
  Khác: { icon: LayoutGrid, bg: "from-gray-500 to-slate-500" },
};

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const detectContactType = (val) => {
  if (!val) return "phone";
  return EMAIL_REGEX.test(val) ? "email" : "phone";
};

// ── Confirm Modal ─────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-gray-800 text-sm mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
          >
            {t("profile_posts_delete_cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm"
          >
            {t("profile_posts_delete_btn")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Status Badge ─────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const map = {
    progressing: {
      icon: Clock,
      text: t("status_progressing"),
      bg: "bg-amber-50",
      text_c: "text-amber-700",
      icon_c: "text-amber-500",
      border: "border-amber-200",
    },
    active: {
      icon: CheckCircle,
      text: t("status_active"),
      bg: "bg-emerald-50",
      text_c: "text-emerald-700",
      icon_c: "text-emerald-500",
      border: "border-emerald-200",
    },
    rejected: {
      icon: XCircle,
      text: t("status_rejected"),
      bg: "bg-red-50",
      text_c: "text-red-700",
      icon_c: "text-red-500",
      border: "border-red-200",
    },
    inactive: {
      icon: AlertCircle,
      text: t("status_inactive"),
      bg: "bg-gray-50",
      text_c: "text-red-700",
      icon_c: "text-red-500",
      border: "border-red-200",
    },
  };
  const cfg = map[status] || map.progressing;
  const Icon = cfg.icon;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text_c} text-xs font-medium`}
    >
      <Icon size={14} className={cfg.icon_c} />
      <span>{cfg.text}</span>
    </div>
  );
};

// ── Edit Post Modal ───────────────────────────────────────
const EditPostModal = ({ isOpen, onClose, post, user, onPostUpdated }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const categories = useMemo(
    () => getCategoriesByRole(user?.role),
    [user?.role],
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [category, setCategory] = useState(post?.category || categories[0]);
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [contactType, setContactType] = useState(detectContactType(post?.link));
  const [contact, setContact] = useState(post?.link || "");
  const [contactError, setContactError] = useState("");
  const [imagePreview, setImagePreview] = useState(post?.image || "");
  const [imageData, setImageData] = useState(post?.image || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);



  const validateContact = (type, value) => {
    if (!value.trim()) return t("edit_post_contact_required");
    if (type === "phone") {
      if (!PHONE_REGEX.test(value)) return t("edit_post_phone_invalid");
    } else {
      if (!EMAIL_REGEX.test(value)) return t("edit_post_email_invalid");
    }
    return "";
  };

  const canSubmit =
    Boolean(category) &&
    Boolean(title.trim()) &&
    Boolean(content.trim()) &&
    Boolean(imageData) &&
    Boolean(contact.trim()) &&
    !contactError;

  useEffect(() => {
    if (post) {
      setCategory(post.category || categories[0]);
      setTitle(post.title || "");
      setContent(post.content || "");
      const ct = detectContactType(post.link);
      setContactType(ct);
      setContact(post.link || "");
      setContactError("");
      setImagePreview(post.image || "");
      setImageData(post.image || "");
      setError("");
      setDropdownOpen(false);
    }
  }, [post, categories]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleContactChange = (e) => {
    const val = e.target.value;
    setContact(val);
    if (val.trim()) setContactError(validateContact(contactType, val));
    else setContactError("");
  };

  const handleContactTypeChange = (type) => {
    setContactType(type);
    setContact("");
    setContactError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("edit_post_image_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result?.toString() || "";
      setImageData(r);
      setImagePreview(r);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cErr = validateContact(contactType, contact);
    if (cErr) {
      setContactError(cErr);
      return;
    }
    if (!canSubmit) {
      setError(t("edit_post_required"));
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await updatePost(post.id, {
        category,
        title: title.trim(),
        content: content.trim(),
        image: imageData,
        contact: contact.trim(),
      });
      onPostUpdated?.({
        ...post,
        title: updated?.title || title.trim(),
        content: updated?.content || content.trim(),
        link: updated?.contact || contact.trim(),
        image: updated?.image || imagePreview,
        category: updated?.category || category,
        status: updated?.status || post.status,
      });
      onClose();
    } catch (err) {
      setError(err?.message || t("edit_post_fail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !post) return null;



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{t("edit_post_title")}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          <div className="flex items-center gap-3">
            <Image
              src={user?.avatar || "/images/avatar.jpg"}
              width={96}
              height={96}
              className="w-11 h-11 rounded-full border border-gray-200"
              alt="Avatar"
            />
            <div>
              <p className="font-semibold text-gray-800">
                {user?.full_name || user?.name || user?.username || "Bạn"}
              </p>
              <div className="text-xs text-gray-500">
                {t("edit_post_public")}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("edit_post_category_label")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all cursor-pointer text-left flex justify-between items-center"
              >
                <span>{category}</span>
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
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {categories.map((item) => (
                    <div
                      key={item}
                      onClick={() => {
                        setCategory(item);
                        setDropdownOpen(false);
                      }}
                      className={`px-3 py-2 cursor-pointer transition-colors text-sm ${category === item ? "bg-emerald-500 text-white font-medium" : "text-gray-900 hover:bg-emerald-500 hover:text-white"}`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("edit_post_content_label")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                TITLE_PLACEHOLDERS[category] || TITLE_PLACEHOLDERS["Khác"]
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
              maxLength={100}
            />
            <div className="text-xs text-gray-500 text-right">
              {title.length}/100
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("edit_post_desc_label")}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("edit_post_desc_placeholder")}
              className="w-full bg-white text-gray-900 text-base resize-none outline-none min-h-35 placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 text-right">
              {content.length}/1000
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("edit_post_contact_label")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleContactTypeChange("phone")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${contactType === "phone" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <Phone size={15} />
                {t("edit_post_contact_phone")}
              </button>
              <button
                type="button"
                onClick={() => handleContactTypeChange("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${contactType === "email" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
              >
                <Mail size={15} />
                {t("edit_post_contact_email")}
              </button>
            </div>
            <input
              type={contactType === "phone" ? "tel" : "email"}
              value={contact}
              onChange={handleContactChange}
              placeholder={
                contactType === "phone"
                  ? t("edit_post_contact_phone_placeholder")
                  : t("edit_post_contact_email_placeholder")
              }
              className={`w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${contactError ? "border-red-400" : "border-gray-200"}`}
            />
            {contactError && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <XCircle size={14} strokeWidth={2.5} />
                {contactError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("edit_post_image_label")}
            </label>
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600">
                  {t("edit_post_image_click")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("edit_post_image_hint")}
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={96}
                  height={96}
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
            className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("edit_post_submitting")}
              </span>
            ) : (
              t("edit_post_submit")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Post Card ─────────────────────────────────────────────
const Post = ({
  post,
  onLikeUpdate,
  onContact,
  onDelete,
  onEdit,
  onDeleteConfirm,
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const TypeServiceChips = ({ typeService }) => {
    if (!typeService || typeService.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {typeService.map((name) => (
          <span
            key={name}
            className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"
          >
            {name}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    setIsLiked(post.isLiked || false);
  }, [post.isLiked]);
  useEffect(() => {
    setCommentCount(post.comments || 0);
  }, [post.comments]);

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
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        t("profile_posts_like_fail"),
      );
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  useEffect(() => {
    const close = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [showMenu]);

  const cfg = post.category
    ? categoryConfig[post.category] || {
      icon: LayoutGrid,
      bg: "from-gray-500 to-slate-500",
    }
    : null;

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow w-full">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3 flex-1 min-w-0">
            <div
              className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100 cursor-pointer"
              onClick={() => router.push(`/profile/${post.authorId}`)}
            >
              <Image
                src={post.userAvatar || "/images/avatar.jpg"}
                alt={post.userName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-bold text-gray-900 text-base">
                  {post.userName}
                </h4>
                {cfg &&
                  (() => {
                    const Icon = cfg.icon;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-linear-to-r ${cfg.bg} text-white shadow-sm shrink-0`}
                      >
                        <Icon size={11} />
                        {post.category}
                      </span>
                    );
                  })()}
                <StatusBadge status={post.status} />
              </div>
              <p className="text-gray-500 text-sm">
                @{post.userHandle} • {post.timestamp}
              </p>
            </div>
          </div>
          <div className="relative shrink-0">
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
                    onEdit?.(post);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  {t("edit_post_menu_edit")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDeleteConfirm?.(post.id);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {t("edit_post_menu_delete")}
                </button>
              </div>
            )}
          </div>
        </div>

        {post.title && (
          <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
            {post.title}
          </h3>
        )}


        <p className="text-base text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content}
        </p>

        <TypeServiceChips typeService={post.type_service} />

        {post.link && (
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-500">
              {t("profile_posts_contact_label")}
            </span>
            <span className="text-sm font-semibold text-emerald-700">
              {post.link}
            </span>
          </div>
        )}

        {post.image && (
          <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
            <Image
              src={post.image}
              alt="Post content"
              width={96}
              height={96}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between px-1">
          <button
            onClick={handleLike}
            disabled={isTogglingFavorite}
            className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500 hover:bg-red-50"} ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isTogglingFavorite ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Heart size={20} className={isLiked ? "fill-current" : ""} />
            )}
            {likeCount > 0 && (
              <span className="text-sm font-medium">{likeCount}</span>
            )}
          </button>
          <button
            onClick={() => setIsCommentModalOpen(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 transition px-3 py-1.5 rounded-lg"
          >
            <MessageCircle size={20} />
            {commentCount > 0 && (
              <span className="text-sm font-medium">{commentCount}</span>
            )}
          </button>
          <button
            onClick={() => onContact?.(post)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors text-sm"
          >
            {t("profile_posts_contact_btn")}
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

// ── Main ──────────────────────────────────────────────────
export default function PostsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { setSelectedUser, addContact } = useChatStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const STATUS_OPTIONS = [
    { value: "all", label: t("profile_posts_status_all") },
    { value: "active", label: t("profile_posts_status_active") },
    { value: "progressing", label: t("profile_posts_status_progressing") },
    { value: "inactive", label: t("profile_posts_status_inactive") },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isStatusDropdownOpen && !e.target.closest(".status-dropdown"))
        setIsStatusDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusDropdownOpen]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?._id && !user?.id) return;
      setLoadingPosts(true);
      setPostsError(null);
      try {
        const [postsData, favoritesResponse] = await Promise.all([
          getOwnPosts({
            author_id: user._id || user.id,
            status: statusFilter === "all" ? undefined : statusFilter,
          }),
          favoriteAPI.getFavorites().catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        const favoritePostIds = new Set(
          (favoritesResponse.data || [])
            .map((f) => f.post_id?._id || f.post_id)
            .filter(Boolean),
        );
        const normalized = (postsData || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((post) => ({
            id: post._id,
            authorId: user._id || user.id,
            userName: user?.full_name || user?.name || user?.username || "Bạn",
            userHandle: user?.username || user?.email || "",
            userAvatar: user?.avatar || "/images/avatar.jpg",
            timestamp: post.created_at
              ? new Date(post.created_at).toLocaleString("vi-VN")
              : "Vừa xong",
            title: post.title || "",
            content: post.content,
            link: post.contact,
            image: post.image,
            category: post.category,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            status: post.status || "progressing",
            isLiked: favoritePostIds.has(post._id),
            type_service: post.type_service || [],
          }));
        setPosts(normalized);
        const withComments = await Promise.all(
          normalized.map(async (post) => {
            try {
              const res = await commentAPI.getCommentsByPost(post.id, "all");
              const count = (list) => {
                let n = list.length;
                list.forEach((c) => {
                  if (c.children?.length) n += count(c.children);
                });
                return n;
              };
              return { ...post, comments: count(res.data || []) };
            } catch {
              return post;
            }
          }),
        );
        if (!cancelled) setPosts(withComments);
      } catch (err) {
        if (!cancelled)
          setPostsError(err?.message || t("profile_posts_delete_fail"));
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, statusFilter, t]);

  const handleLikeUpdate = (postId, isLiked) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 }
          : p,
      ),
    );
  };
  const handleEdit = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };
  const handlePostUpdated = (updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };
  const handleDeleteConfirm = (postId) => {
    setDeletingPostId(postId);
    setConfirmModalOpen(true);
  };
  const handleContact = (post) => {
    const receiverId = post.authorId;
    if (!receiverId) return;
    const chatUser = {
      _id: receiverId,
      full_name: post.userName || "Người bán",
      avatar: post.userAvatar || "/images/avatar.jpg",
    };
    addContact(chatUser);
    setSelectedUser(chatUser);
    router.push(`/chat?chatId=${receiverId}`);
  };
  const handleDelete = async () => {
    try {
      await deletePost(deletingPostId);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPostId));
      setConfirmModalOpen(false);
      setDeletingPostId(null);
    } catch (err) {
      toast.error(err?.message || t("profile_posts_delete_fail"));
    }
  };

  const currentStatusLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ||
    t("profile_posts_status_all");

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-7 px-4 flex flex-col justify-center items-center">
        <div className="w-full mt-5">
          <div className="bg-emerald-500 rounded-3xl shadow-xl p-8 md:p-12 w-full">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {t("profile_posts_title")}
                </h1>
                <p className="text-emerald-50 text-lg">
                  {t("profile_posts_subtitle")}
                </p>
              </div>
              <Link
                href="/profile/posts/create"
                className="bg-white hover:bg-emerald-50 text-emerald-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                {t("profile_posts_create_btn")}
              </Link>
            </div>
          </div>
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

        <div className="w-full max-w-4xl mt-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {t("profile_posts_found")}{" "}
              <span className="font-semibold text-emerald-500">
                {posts.length}
              </span>{" "}
              {t("profile_posts_found_label")}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {t("profile_posts_status_label")}
              </span>
              <div className="relative status-dropdown">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="min-w-42.5 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
                >
                  <span>{currentStatusLabel}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-all duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    {STATUS_OPTIONS.map((opt, index) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${statusFilter === opt.value ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-50"} ${index !== STATUS_OPTIONS.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loadingPosts && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 font-medium">
                {t("profile_posts_loading")}
              </p>
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
                {t("profile_posts_empty_title")}
              </h3>
              <p className="text-gray-500 mb-4">
                {t("profile_posts_empty_desc")}
              </p>
              <Link
                href="/profile/posts/create"
                className="inline-block bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition"
              >
                {t("profile_posts_empty_btn")}
              </Link>
            </div>
          )}
          {posts.map((post) => (
            <Post
              key={post.id || post._id}
              post={post}
              onLikeUpdate={handleLikeUpdate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteConfirm={handleDeleteConfirm}
              onContact={handleContact}
            />
          ))}
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setDeletingPostId(null);
        }}
        onConfirm={handleDelete}
        message={t("profile_posts_delete_confirm")}
      />
    </div>
  );
}

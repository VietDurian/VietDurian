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
  Flag,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { favoriteAPI, getOwnPosts, commentAPI, createReport } from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

const categoryConfig = {
  "Dịch vụ": { icon: Wrench, bg: "from-blue-500 to-cyan-500" },
  "Kinh nghiệm": { icon: BookOpen, bg: "from-amber-500 to-orange-500" },
  "Sản phẩm": { icon: Package, bg: "from-emerald-500 to-teal-500" },
  "Thuê dịch vụ": { icon: HandCoins, bg: "from-purple-500 to-violet-500" },
  Khác: { icon: LayoutGrid, bg: "from-gray-500 to-slate-500" },
};

// ─── Report Post Modal ────────────────────────────────────────────────────────
const ReportPostModal = ({ isOpen, onClose, postId, postTitle }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageData, setImageData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const REPORT_REASONS = [
    t("report_reason_spam"),
    t("report_reason_misinformation"),
    t("report_reason_inappropriate"),
    t("report_reason_other"),
  ];

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setCustomReason("");
      setImagePreview("");
      setImageData("");
      setError("");
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("report_image_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      setImageData(result);
      setImagePreview(result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const getFinalReason = () => {
    if (selectedReason === t("report_reason_other")) return customReason.trim();
    return selectedReason;
  };

  const handleSubmit = async () => {
    const reason = getFinalReason();
    if (!reason) {
      setError(t("report_error_no_reason"));
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const payload = { post_id: postId, reason };
      if (imageData) payload.image = imageData;
      await createReport(payload);
      setSubmitted(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          t("report_error_submit_fail"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[calc(100vh-80px)] mt-16">
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-full">
              <Flag size={16} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              {t("report_modal_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t("report_success_title")}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {t("report_success_desc")}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition text-sm"
            >
              {t("report_success_close")}
            </button>
          </div>
        ) : (
          /* Form state — scrollable */
          <div className="overflow-y-auto flex-1">
            <div className="p-5 space-y-4">
              {postTitle && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 line-clamp-2">
                  {postTitle}
                </p>
              )}

              {/* Reason buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t("report_reason_label")}
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setSelectedReason(reason);
                        setError("");
                        if (reason !== t("report_reason_other"))
                          setCustomReason("");
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedReason === reason
                          ? "border-orange-400 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom reason textarea — only when "Khác/Other" selected */}
              {selectedReason === t("report_reason_other") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("report_custom_reason_label")}
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setError("");
                    }}
                    placeholder={t("report_custom_reason_placeholder")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none min-h-20"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-400 text-right mt-1">
                    {customReason.length}/500
                  </div>
                </div>
              )}

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("report_image_label")}{" "}
                  <span className="text-gray-400 font-normal">
                    ({t("report_image_optional")})
                  </span>
                </label>
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <ImageIcon
                      className="mx-auto text-gray-400 mb-2"
                      size={26}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      {t("report_image_click")}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t("report_image_hint")}
                    </p>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={200}
                      className="w-full h-auto object-contain bg-gray-50 max-h-48"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageData("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X size={14} />
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
                  <AlertCircle size={16} />
                  <span>{t("error_reason_min_length")}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-1 pb-1">
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !selectedReason ||
                    (selectedReason === t("report_reason_other") &&
                      !customReason.trim())
                  }
                  className="w-full px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("report_submitting")}
                    </>
                  ) : (
                    <>
                      <Flag size={16} />
                      {t("report_submit_btn")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Category Guide Section ───────────────────────────────────────────────────
const CategoryGuideSection = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

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
      who: t("posts_cat_service_who"),
      tagLine: t("posts_cat_service_tagline"),
      desc: t("posts_cat_service_desc"),
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
      who: t("posts_cat_experience_who"),
      tagLine: t("posts_cat_experience_tagline"),
      desc: t("posts_cat_experience_desc"),
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
      who: t("posts_cat_product_who"),
      tagLine: t("posts_cat_product_tagline"),
      desc: t("posts_cat_product_desc"),
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
      who: t("posts_cat_hire_who"),
      tagLine: t("posts_cat_hire_tagline"),
      desc: t("posts_cat_hire_desc"),
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
      who: t("posts_cat_other_who"),
      tagLine: t("posts_cat_other_tagline"),
      desc: t("posts_cat_other_desc"),
    },
  ];

  return (
    <div className="mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
            <Info size={18} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 text-base">
              {t("posts_category_guide_title")}
            </p>
            <p className="text-gray-500 text-sm">
              {t("posts_category_guide_subtitle")}
            </p>
          </div>
        </div>
        <div
          className={`text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        >
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
                className={`group relative flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all text-left shadow-sm hover:shadow-md ${isActive ? `${cat.bgLight} ${cat.borderColor} ring-2 ${cat.ringColor}` : "bg-white border-gray-200"}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl bg-linear-to-br ${cat.gradient} flex items-center justify-center shadow-md`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${cat.tagBg}`}
                  >
                    {cat.tagLine}
                  </span>
                </div>
                <div>
                  <h4 className={`font-bold text-base ${cat.textColor} mb-0.5`}>
                    {cat.key}
                  </h4>
                  <p className="text-xs font-medium text-gray-400">{cat.who}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {cat.desc}
                </p>
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold ${cat.textColor} mt-auto`}
                >
                  <Filter size={13} />
                  {isActive
                    ? t("posts_filter_active")
                    : t("posts_filter_click")}
                </div>
                {isActive && (
                  <div
                    className={`absolute inset-0 rounded-2xl pointer-events-none bg-linear-to-br ${cat.gradient} opacity-5`}
                  />
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
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const POST_CATEGORIES_MAP = [
    { label: t("posts_cat_all"), value: "Tất cả" },
    { label: t("posts_cat_service"), value: "Dịch vụ" },
    { label: t("posts_cat_experience"), value: "Kinh nghiệm" },
    { label: t("posts_cat_product"), value: "Sản phẩm" },
    { label: t("posts_cat_hire"), value: "Thuê dịch vụ" },
    { label: t("posts_cat_other"), value: "Khác" },
  ];
  const SORT_OPTIONS = [
    { value: "newest", label: t("posts_sort_newest") },
    { value: "oldest", label: t("posts_sort_oldest") },
  ];

  const hasActiveFilters =
    selectedCategory !== "Tất cả" ||
    selectedSort !== "newest" ||
    searchQuery.trim() !== "";
  const selectedSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === selectedSort)?.label ||
    t("posts_sort_newest");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSortDropdown && !e.target.closest(".sort-dropdown"))
        setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortDropdown]);

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
            placeholder={t("posts_search_placeholder")}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          />
        </div>
        <div className="relative sort-dropdown">
          <button
            type="button"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="min-w-35 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 font-medium hover:border-emerald-500 transition-all duration-200 flex items-center justify-between gap-2 text-sm"
          >
            <span>{selectedSortLabel}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-all duration-200 ${showSortDropdown ? "rotate-180" : ""}`}
            />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
              {SORT_OPTIONS.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${selectedSort === option.value ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-50"} ${index !== SORT_OPTIONS.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${showFilters ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          <Filter size={20} />
          <span className="hidden sm:inline">{t("posts_filter_btn")}</span>
        </button>
      </div>
      {showFilters && (
        <div className="pt-4 mt-4 border-t border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t("posts_filter_category_label")}
            </label>
            <div className="flex flex-wrap gap-2">
              {POST_CATEGORIES_MAP.map((category) => (
                <button
                  key={category.value}
                  onClick={() => onCategoryChange(category.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category.value ? "bg-emerald-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent"}`}
                >
                  {category.label}
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
              {t("posts_filter_clear")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────
const Post = ({ post, onLikeUpdate, onContact, currentUserId }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const isOwnPost = currentUserId && post.authorId === currentUserId;

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
      if (newLikedState) await favoriteAPI.addFavorite(post.id);
      else await favoriteAPI.removeFavorite(post.id);
      onLikeUpdate?.(post.id, newLikedState);
    } catch (error) {
      setIsLiked(previousLikedState);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật yêu thích",
      );
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const cfg = post.category
    ? categoryConfig[post.category] || {
        icon: LayoutGrid,
        bg: "from-gray-500 to-slate-500",
      }
    : null;

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-all w-full">
        <div className="flex justify-between items-start mb-4">
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
              </div>
              <p className="text-gray-500 text-sm truncate">
                {post.userHandle && post.userHandle}
                {post.userHandle && post.timestamp && " • "}
                {post.timestamp}
              </p>
            </div>
          </div>

          {/* Report button — chỉ hiện với post của người khác */}
          {!isOwnPost && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="shrink-0 p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all ml-2"
              title={t("report_btn_tooltip")}
            >
              <Flag size={18} />
            </button>
          )}
        </div>

        {post.title && (
          <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
            {post.title}
          </h3>
        )}

        <div className="text-base text-gray-600 leading-relaxed mb-4">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.contact && (
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-500">
              {t("posts_contact_label")}
            </span>
            <span className="text-sm font-semibold text-emerald-700">
              {post.contact}
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
            {t("posts_contact_btn")}
          </button>
        </div>
      </article>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={post.id}
        onCommentCountChange={setCommentCount}
      />

      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={post.id}
        postTitle={post.title || post.content?.slice(0, 80)}
      />
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PostsContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { setSelectedUser, addContact, sendPostCardMessage } = useChatStore();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    let isCancelled = false;
    const loadPostsWithFavorites = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      try {
        const filters = { status: "active", sort: selectedSort };
        if (selectedCategory !== "Tất cả") filters.category = selectedCategory;
        if (searchQuery.trim()) filters.search = searchQuery.trim();

        const [postsData, favoritesResponse] = await Promise.all([
          getOwnPosts(filters),
          favoriteAPI.getFavorites().catch(() => ({ data: [] })),
        ]);
        if (isCancelled) return;

        const favoritePostIds = new Set(
          (favoritesResponse.data || [])
            .map((fav) => fav.post_id?._id || fav.post_id)
            .filter(Boolean),
        );
        const normalizedPosts = (postsData || []).map((post) => {
          const author = post.author || {};
          return {
            id: post._id,
            authorId: author._id || author.id,
            userName:
              author.full_name ||
              author.name ||
              author.username ||
              "Người dùng",
            userHandle: author.email || "",
            userAvatar: author.avatar || "/images/avatar.jpg",
            timestamp: post.created_at
              ? new Date(post.created_at).toLocaleString("vi-VN")
              : "Vừa xong",
            title: post.title || "",
            content: post.content,
            contact: post.contact,
            image: post.image,
            category: post.category,
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            status: post.status || "active",
            isLiked: favoritePostIds.has(post._id),
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
        if (!isCancelled) setPosts(postsWithComments);
      } catch (error) {
        if (!isCancelled)
          setPostsError(error?.message || "Không thể tải bài viết");
      } finally {
        if (!isCancelled) setLoadingPosts(false);
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

  const handleContact = async (post) => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    const receiverId = post.authorId;
    if (!receiverId) return;
    const chatUser = {
      _id: receiverId,
      full_name: post.userName || "Người bán",
      avatar: post.userAvatar || "/images/avatar.jpg",
    };
    addContact(chatUser);
    setSelectedUser(chatUser);
    await sendPostCardMessage(post, language);
    router.push(`/chat?chatId=${receiverId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 p-5 lg:pt-24 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("posts_page_title")}
              </h1>
              <p className="text-gray-600">{t("posts_page_subtitle")}</p>
            </div>
            {posts.length > 0 && (
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                <span className="text-2xl font-bold">{posts.length}</span>
                <span className="text-sm ml-2">{t("posts_count_label")}</span>
              </div>
            )}
          </div>

          <CategoryGuideSection
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
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
              <p className="text-gray-500 font-medium">{t("posts_loading")}</p>
            </div>
          )}
          {postsError && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("posts_login_required_title")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t("posts_login_required_desc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm"
                >
                  {t("posts_login_btn")}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 border border-emerald-600 text-emerald-600 rounded-full font-medium hover:bg-emerald-50 transition-colors text-sm"
                >
                  {t("posts_register_btn")}
                </Link>
              </div>
            </div>
          )}
          {!loadingPosts && !postsError && posts.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {t("posts_not_found_title")}
              </h3>
              <p className="text-gray-500 mb-4">{t("posts_not_found_desc")}</p>
              <button
                onClick={handleClearFilters}
                className="bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition"
              >
                {t("posts_not_found_clear")}
              </button>
            </div>
          )}
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLikeUpdate={handleLikeUpdate}
              onContact={handleContact}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

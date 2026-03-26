"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  ImageIcon,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Wrench,
  BookOpen,
  Package,
  LayoutGrid,
  HandCoins,
  Phone,
  Mail,
  Flag,
} from "lucide-react";
import {
  favoriteAPI,
  deletePost,
  updatePost,
  commentAPI,
  createReport,
} from "@/lib/api";
import CommentModal from "@/components/CommentModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

const POST_CATEGORIES = ["Dịch vụ", "Kinh nghiệm", "Sản phẩm", "Thuê dịch vụ", "Khác"];

const getCategoriesByRole = (role) => {
  switch (role) {
    case "trader": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    case "farmer": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    case "serviceProvider": return ["Dịch vụ", "Sản phẩm", "Kinh nghiệm", "Khác"];
    case "contentExpert": return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
    default: return POST_CATEGORIES;
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

// ── Report Post Modal ─────────────────────────────────────
const ReportPostModal = ({ isOpen, onClose, postId, postTitle }) => {
  const fileInputRef = useRef(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageData, setImageData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const REPORT_REASONS = [
    "Spam hoặc quảng cáo",
    "Thông tin sai lệch",
    "Nội dung không phù hợp",
    "Khác",
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
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh không được vượt quá 5MB");
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
    if (selectedReason === "Khác") return customReason.trim();
    return selectedReason;
  };

  const handleSubmit = async () => {
    const reason = getFinalReason();
    if (!reason) {
      setError("Vui lòng chọn hoặc nhập lý do báo cáo");
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
        "Không thể gửi báo cáo, vui lòng thử lại"
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
            <h2 className="text-lg font-bold text-gray-900">Báo cáo bài viết</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Đã gửi báo cáo</h3>
            <p className="text-gray-500 text-sm mb-6">
              Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý sớm nhất.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition text-sm"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* Scrollable form */
          <div className="overflow-y-auto flex-1">
            <div className="p-5 space-y-4">
              {postTitle && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 line-clamp-2">
                  {postTitle}
                </p>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Lý do báo cáo
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setSelectedReason(reason);
                        setError("");
                        if (reason !== "Khác") setCustomReason("");
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${selectedReason === reason
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReason === "Khác" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => { setCustomReason(e.target.value); setError(""); }}
                    placeholder="Nhập lý do cụ thể..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none min-h-20"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-400 text-right mt-1">{customReason.length}/500</div>
                </div>
              )}

              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ảnh minh chứng{" "}
                  <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </label>
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={26} />
                    <p className="text-sm font-medium text-gray-600">Nhấn để tải ảnh lên</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG tối đa 5MB</p>
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
                        if (fileInputRef.current) fileInputRef.current.value = "";
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
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-1 pb-1">
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !selectedReason ||
                    (selectedReason === "Khác" && !customReason.trim())
                  }
                  className="w-full px-4 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Flag size={16} />
                      Gửi báo cáo
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

// ── Confirm Modal ─────────────────────────────────────────
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-gray-800 text-sm mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">
            {t("fav_posts_delete_cancel")}
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm">
            {t("fav_posts_delete_btn")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const statusConfig = {
    pending: { icon: Clock, text: t("fav_posts_status_pending"), bgColor: "bg-amber-50", textColor: "text-amber-700", iconColor: "text-amber-500", borderColor: "border-amber-200" },
    active: { icon: CheckCircle, text: t("fav_posts_status_active"), bgColor: "bg-emerald-50", textColor: "text-emerald-700", iconColor: "text-emerald-500", borderColor: "border-emerald-200" },
    rejected: { icon: XCircle, text: t("fav_posts_status_rejected"), bgColor: "bg-red-50", textColor: "text-red-700", iconColor: "text-red-500", borderColor: "border-red-200" },
    inactive: { icon: AlertCircle, text: t("fav_posts_status_inactive"), bgColor: "bg-gray-50", textColor: "text-red-700", iconColor: "text-red-500", borderColor: "border-red-200" },
  };
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor} text-xs font-medium`}>
      <Icon size={14} className={config.iconColor} />
      <span>{config.text}</span>
    </div>
  );
};

// ── Edit Post Modal ───────────────────────────────────────
const EditPostModal = ({ isOpen, onClose, post, user, onPostUpdated }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const categories = getCategoriesByRole(user?.role);
  const [category, setCategory] = useState(post?.category || categories[0]);
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [contactType, setContactType] = useState(detectContactType(post?.contact));
  const [contact, setContact] = useState(post?.contact || "");
  const [contactError, setContactError] = useState("");
  const [imagePreview, setImagePreview] = useState(post?.image || "");
  const [imageData, setImageData] = useState(post?.image || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const validateContact = (type, value) => {
    if (!value.trim()) return t("fav_posts_contact_required");
    if (type === "phone") { if (!PHONE_REGEX.test(value)) return t("fav_posts_phone_invalid"); }
    else { if (!EMAIL_REGEX.test(value)) return t("fav_posts_email_invalid"); }
    return "";
  };

  const canSubmit = Boolean(category) && Boolean(title.trim()) && Boolean(content.trim()) && Boolean(imageData) && Boolean(contact.trim()) && !contactError;

  useEffect(() => {
    if (post) {
      setCategory(post.category || categories[0]);
      setTitle(post.title || "");
      setContent(post.content || "");
      const ct = detectContactType(post.contact);
      setContactType(ct);
      setContact(post.contact || "");
      setContactError("");
      setImagePreview(post.image || "");
      setImageData(post.image || "");
      setError("");
      setDropdownOpen(false);
    }
  }, [post, categories]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError(t("fav_posts_edit_image_too_large")); return; }
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
    const cErr = validateContact(contactType, contact);
    if (cErr) { setContactError(cErr); return; }
    if (!canSubmit) { setError(t("fav_posts_edit_required")); return; }
    setIsSubmitting(true);
    try {
      const updated = await updatePost(post._id, { category, title: title.trim(), content: content.trim(), image: imageData, contact: contact.trim() });
      onPostUpdated?.({ ...post, category: updated?.category || category, title: updated?.title || title.trim(), content: updated?.content || content.trim(), contact: updated?.contact || contact.trim(), image: updated?.image || imagePreview, updated_at: updated?.updated_at || new Date().toISOString() });
      onClose();
    } catch (submitError) {
      setError(submitError?.message || t("fav_posts_edit_fail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white text-black w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="relative flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">{t("fav_posts_edit_title")}</h2>
          <button onClick={onClose} className="absolute right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition" aria-label="Đóng">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="flex items-center gap-3">
            <Image src={user?.avatar || "/images/avatar.jpg"} width={96} height={96} className="w-11 h-11 rounded-full border border-gray-200" alt="Avatar" />
            <div>
              <p className="font-semibold text-gray-800">{user?.full_name || user?.name || user?.username || "Bạn"}</p>
              <div className="text-xs text-gray-500">{t("fav_posts_edit_public")}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t("fav_posts_edit_category")}</label>
            <div className="relative">
              <button type="button" onClick={() => setDropdownOpen((o) => !o)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white transition-all cursor-pointer text-left flex justify-between items-center">
                <span>{category}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {categories.map((item) => (
                    <div key={item} onClick={() => { setCategory(item); setDropdownOpen(false); }} className={`px-3 py-2 cursor-pointer transition-colors text-sm ${category === item ? "bg-emerald-600 text-white font-medium" : "text-gray-900 hover:bg-emerald-500 hover:text-white"}`}>
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t("fav_posts_edit_content")}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={TITLE_PLACEHOLDERS[category] || TITLE_PLACEHOLDERS["Khác"]} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-medium" maxLength={100} />
            <div className="text-xs text-gray-500 text-right">{title.length}/100</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t("fav_posts_edit_desc")}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t("fav_posts_edit_desc_placeholder")} className="w-full bg-white text-gray-900 text-base resize-none outline-none min-h-35 placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-600" maxLength={1000} />
            <div className="text-xs text-gray-500 text-right">{content.length}/1000</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t("fav_posts_edit_contact")}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleContactTypeChange("phone")} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${contactType === "phone" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                <Phone size={15} />{t("fav_posts_edit_phone")}
              </button>
              <button type="button" onClick={() => handleContactTypeChange("email")} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${contactType === "email" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                <Mail size={15} />{t("fav_posts_edit_email")}
              </button>
            </div>
            <input type={contactType === "phone" ? "tel" : "email"} value={contact} onChange={handleContactChange} placeholder={contactType === "phone" ? t("fav_posts_edit_phone_placeholder") : t("fav_posts_edit_email_placeholder")} className={`w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white ${contactError ? "border-red-400" : "border-gray-200"}`} />
            {contactError && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <XCircle size={14} strokeWidth={2.5} />{contactError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t("fav_posts_edit_image")}</label>
            {!imagePreview ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600">{t("fav_posts_edit_image_click")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("fav_posts_edit_image_hint")}</p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <Image src={imagePreview} alt="Preview" width={96} height={96} className="w-full h-auto object-contain bg-gray-50 max-h-80" />
                <button type="button" onClick={() => { setImagePreview(""); setImageData(""); }} className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full">
                  <X size={16} />
                </button>
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("fav_posts_edit_submitting")}
              </span>
            ) : t("fav_posts_edit_submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Favorite Post Card ────────────────────────────────────
const FavoritePostCard = ({ post, onToggleFavorite, onEdit, onDeleteConfirm, onContact }) => {
  const { t } = useLanguage();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(true);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.post_id?.comments_count || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => { setCommentCount(post.post_id?.comments_count || 0); }, [post.post_id?.comments_count]);

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

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return t("fav_posts_unknown_time");
    try { return new Date(dateString).toLocaleString("vi-VN"); }
    catch { return t("fav_posts_unknown_time"); }
  };

  const getAuthorInfo = () => {
    const postData = post.post_id;
    if (!postData) return { name: "Người dùng", avatar: "/images/avatar.jpg", handle: "" };
    if (postData.author_id && typeof postData.author_id === "object") {
      return { name: postData.author_id.full_name || postData.author_id.name || "Người dùng", avatar: postData.author_id.avatar || "/images/avatar.jpg", handle: postData.author_id.email || postData.author_id.username || "" };
    }
    const authorId = typeof postData.author_id === "string" ? postData.author_id : postData.author_id?._id;
    if (authorId === user?._id || authorId === user?.id) {
      return { name: user.full_name || user.name || "Bạn", avatar: user.avatar || "/images/avatar.jpg", handle: user.email || user.username || "" };
    }
    return { name: "Người dùng", avatar: "/images/avatar.jpg", handle: "" };
  };

  const authorInfo = getAuthorInfo();
  const isOwnPost = () => {
    const postAuthorId = post.post_id?.author_id?._id || post.post_id?.author_id;
    const currentUserId = user?._id || user?.id;
    return postAuthorId === currentUserId;
  };
  const canEditDelete = isOwnPost();
  const cfg = post.post_id?.category ? categoryConfig[post.post_id.category] || { icon: LayoutGrid, bg: "from-gray-500 to-slate-500" } : null;

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm hover:shadow-md transition-shadow w-full">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3 flex-1 min-w-0">
            <div
              className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100 cursor-pointer"
              onClick={() => { const authorId = post.post_id?.author_id?._id || post.post_id?.author_id; if (authorId) router.push(`/profile/${authorId}`); }}
            >
              <Image src={authorInfo.avatar} alt={authorInfo.name} width={96} height={96} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="font-bold text-gray-900 text-base">{authorInfo.name}</h4>
                {cfg && (() => { const Icon = cfg.icon; return (<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-linear-to-r ${cfg.bg} text-white shadow-sm shrink-0`}><Icon size={11} />{post.post_id.category}</span>); })()}
                <StatusBadge status={post.post_id?.status} />
              </div>
              <p className="text-gray-500 text-sm truncate">
                {authorInfo.handle && authorInfo.handle}
                {authorInfo.handle && post.post_id?.created_at && " • "}
                {post.post_id?.created_at && formatTimestamp(post.post_id.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Report — chỉ hiện với post của người khác */}
            {!canEditDelete && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all"
                title="Báo cáo bài viết"
              >
                <Flag size={18} />
              </button>
            )}

            {/* Edit/Delete — chỉ hiện với post của mình */}
            {canEditDelete && (
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition">
                  <MoreHorizontal size={20} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit?.(post.post_id); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      {t("fav_posts_menu_edit")}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDeleteConfirm?.(post.post_id?._id); }} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      {t("fav_posts_menu_delete")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {post.post_id?.title && <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">{post.post_id.title}</h3>}
        <div className="text-base text-gray-600 leading-relaxed mb-4"><p className="whitespace-pre-wrap">{post.post_id?.content}</p></div>

        {post.post_id?.contact && (
          <div className="mb-4">
            <span className="text-sm font-semibold text-gray-500">{t("fav_posts_contact_label")}</span>
            <span className="text-sm font-semibold text-emerald-700">{post.post_id.contact}</span>
          </div>
        )}

        {post.post_id?.image && (
          <div className="rounded-xl overflow-hidden mb-4 border border-gray-200">
            <Image src={post.post_id.image} alt="Post content" width={96} height={96} className="w-full h-auto object-cover" />
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex items-center justify-between px-1">
          <button onClick={handleToggleFavorite} disabled={isTogglingFavorite} className={`flex items-center gap-2 transition px-3 py-1.5 rounded-lg ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500 hover:bg-red-50"} ${isTogglingFavorite ? "opacity-50 cursor-not-allowed" : ""}`}>
            {isTogglingFavorite ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} className={isLiked ? "fill-current" : ""} />}
            {post.post_id?.likes_count > 0 && <span className="text-sm font-medium">{post.post_id.likes_count}</span>}
          </button>
          <button onClick={() => setIsCommentModalOpen(true)} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition px-3 py-1.5 rounded-lg">
            <MessageCircle size={20} />
            {commentCount > 0 && <span className="text-sm font-medium">{commentCount}</span>}
          </button>
          <button onClick={() => onContact?.(post)} className="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-700 transition-colors text-sm">
            {t("fav_posts_contact_btn")}
          </button>
        </div>
      </article>

      <CommentModal isOpen={isCommentModalOpen} onClose={() => setIsCommentModalOpen(false)} postId={post.post_id?._id} onCommentCountChange={setCommentCount} />

      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        postId={post.post_id?._id}
        postTitle={post.post_id?.title || post.post_id?.content?.slice(0, 80)}
      />
    </>
  );
};

// ── Main ──────────────────────────────────────────────────
export default function FavoritePostsModal() {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const { setSelectedUser, addContact } = useChatStore();

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoriteAPI.getFavorites();
      const validFavorites = (response.data || []).filter((fav) => fav.post_id);
      setFavorites(validFavorites);
      const favWithComments = await Promise.all(
        validFavorites.map(async (fav) => {
          try {
            const res = await commentAPI.getCommentsByPost(fav.post_id?._id, "all");
            const countComments = (list) => { let count = list.length; list.forEach((c) => { if (c.children?.length) count += countComments(c.children); }); return count; };
            return { ...fav, post_id: { ...fav.post_id, comments_count: countComments(res.data || []) } };
          } catch { return fav; }
        })
      );
      setFavorites(favWithComments);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t("fav_posts_load_fail"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const handleToggleFavorite = async (postId) => {
    try {
      await favoriteAPI.removeFavorite(postId);
      setFavorites((prev) => prev.filter((fav) => fav.post_id?._id !== postId));
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || t("fav_posts_fav_fail"));
    }
  };

  const handleEdit = (post) => { setEditingPost(post); setIsEditModalOpen(true); };
  const handlePostUpdated = (updatedPost) => {
    setFavorites((prev) => prev.map((fav) => fav.post_id._id === updatedPost._id ? { ...fav, post_id: { ...fav.post_id, ...updatedPost } } : fav));
  };
  const handleDeleteConfirm = (postId) => { setDeletingPostId(postId); setConfirmModalOpen(true); };
  const handleDelete = async () => {
    try {
      try { await favoriteAPI.removeFavorite(deletingPostId); } catch { }
      await deletePost(deletingPostId);
      setFavorites((prev) => prev.filter((fav) => { const favPostId = fav.post_id?._id || fav.post_id; return favPostId !== deletingPostId; }));
      setConfirmModalOpen(false);
      setDeletingPostId(null);
    } catch (err) {
      toast.error(err?.message || t("fav_posts_delete_fail"));
    }
  };
  const handleContact = (post) => {
    const authorId = post.post_id?.author_id?._id || post.post_id?.author_id;
    if (!authorId) return;
    const chatUser = { _id: authorId, full_name: post.post_id?.author_id?.full_name || "Người bán", avatar: post.post_id?.author_id?.avatar || "/images/avatar.jpg" };
    addContact(chatUser);
    setSelectedUser(chatUser);
    router.push(`/chat?chatId=${authorId}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
      <p className="text-gray-500 font-medium">{t("fav_posts_loading")}</p>
    </div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
      <p className="text-red-600 font-medium">{error}</p>
      <button onClick={loadFavorites} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">{t("fav_posts_retry")}</button>
    </div>
  );
  if (favorites.length === 0) return (
    <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex p-6 rounded-full bg-pink-50 mb-6"><Heart className="text-pink-500" size={48} strokeWidth={2} /></div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("fav_posts_empty_title")}</h3>
        <p className="text-gray-600">{t("fav_posts_empty_desc")}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="text-pink-500 fill-current" size={24} />
          {t("fav_posts_title")} ({favorites.length})
        </h3>
      </div>
      <div className="w-full max-w-4xl mx-auto">
        {favorites.map((favorite) => (
          <FavoritePostCard key={favorite._id} post={favorite} onToggleFavorite={handleToggleFavorite} onEdit={handleEdit} onDeleteConfirm={handleDeleteConfirm} onContact={handleContact} />
        ))}
      </div>
      <EditPostModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPost(null); }} post={editingPost} user={user || {}} onPostUpdated={handlePostUpdated} />
      <ConfirmModal isOpen={confirmModalOpen} onClose={() => { setConfirmModalOpen(false); setDeletingPostId(null); }} onConfirm={handleDelete} message={t("fav_posts_delete_confirm")} />
    </div>
  );
}
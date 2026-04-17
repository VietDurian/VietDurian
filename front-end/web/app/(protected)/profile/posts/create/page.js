"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/api";
import { capabilityProfileAPI } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  ImageIcon, X, AlertCircle, ArrowLeft, FileText,
  Phone, Mail, XCircle, CheckCircle, Wrench,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

// Thay getCategoriesByRole
const getCategoriesByRole = (role) => {
  switch (role) {
    case "trader": return ["Sản phẩm"];
    case "farmer": return ["Thuê dịch vụ", "Sản phẩm"];
    case "serviceProvider": return ["Dịch vụ"];
    case "contentExpert": return ["Kinh nghiệm"];
    default: return ["Sản phẩm", "Kinh nghiệm", "Khác", "Thuê dịch vụ"];
  }
};
const TITLE_PLACEHOLDERS = {
  "Dịch vụ": "VD: Dọn cỏ, làm vườn, phun thuốc, cắt tỉa cành...",
  "Sản phẩm": "VD: Bán sầu riêng Ri6, phân bón hữu cơ, cây giống...",
  "Kinh nghiệm": "VD: Kỹ thuật bón phân, cách xử lý sâu bệnh...",
  "Thuê dịch vụ": "VD: Cần thuê người phun thuốc, hái quả, chăm vườn...",
  "Khác": "VD: Thông báo, hỏi đáp, tin tức nông nghiệp...",
};

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Service Selector (chỉ hiện services từ profile) ─────────────────────────
const ProfileServiceSelector = ({ availableServices, selectedServices, onChange }) => {
  const toggleService = (svc) => {
    const exists = selectedServices.some((s) => s.name === svc.name);
    if (exists) onChange(selectedServices.filter((s) => s.name !== svc.name));
    else onChange([...selectedServices, svc]);
  };

  if (!availableServices || availableServices.length === 0) return (
    <p className="text-sm text-gray-500 italic">
      Bạn chưa đăng ký dịch vụ nào trong hồ sơ. Hãy cập nhật hồ sơ trước.
    </p>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {availableServices.map((svc) => {
        const selected = selectedServices.some((s) => s.name === svc.name);
        return (
          <button
            key={svc.name}
            type="button"
            onClick={() => toggleService(svc)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-200 focus:outline-none
              ${selected
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200 shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
          >
            {selected && <CheckCircle size={14} strokeWidth={2.5} className="text-emerald-500" />}
            {svc.name}
          </button>
        );
      })}
    </div>
  );
};

export default function CreatePostPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = getCategoriesByRole(user?.role);
  const [category, setCategory] = useState(categories[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contactType, setContactType] = useState("phone");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageData, setImageData] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Service Provider extras ───────────────────────────
  const isServiceProvider = user?.role === "serviceProvider";
  const [profileServices, setProfileServices] = useState([]); // từ resume
  const [selectedTypeServices, setSelectedTypeServices] = useState([]);

  useEffect(() => {
    if (!isServiceProvider) return;
    capabilityProfileAPI.get()
      .then((res) => {
        if (res.code === 200 && res.data?.services) {
          setProfileServices(res.data.services); // [{name, image}]
        }
      })
      .catch(() => { }); // silent — không block form
  }, [isServiceProvider]);

  const validateContact = (type, value) => {
    if (!value.trim()) return t("create_post_contact_required");
    if (type === "phone") {
      if (!PHONE_REGEX.test(value)) return t("create_post_phone_invalid");
    } else {
      if (!EMAIL_REGEX.test(value)) return t("create_post_email_invalid");
    }
    return "";
  };

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

  // Reset selected services khi đổi category
  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setDropdownOpen(false);
    if (cat !== "Dịch vụ") setSelectedTypeServices([]);
  };

  const showServiceSelector = isServiceProvider && category === "Dịch vụ";

  const canSubmit =
    Boolean(category) &&
    Boolean(title.trim()) &&
    Boolean(content.trim()) &&
    Boolean(imageData) &&
    Boolean(contact.trim()) &&
    !contactError;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("create_post_image_too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result?.toString() || "";
      setImageData(r);
      setImagePreview(r);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cErr = validateContact(contactType, contact);
    if (cErr) { setContactError(cErr); return; }
    if (!canSubmit) { setError(t("create_post_required")); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        category,
        title: title.trim(),
        content: content.trim(),
        image: imageData,
        contact: contact.trim(),
      };
      // Chỉ gửi type_service nếu là serviceProvider + category Dịch vụ + có chọn
      if (showServiceSelector && selectedTypeServices.length > 0) {
        payload.type_service = selectedTypeServices.map((s) => s.name);
      }
      await createPost(payload);
      router.push("/profile/posts");
    } catch (err) {
      setError(err?.message || t("create_post_fail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="pt-10 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-emerald-500 rounded-3xl shadow-xl p-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8 font-medium cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>{t("create_post_back")}</span>
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t("create_post_title")}
              </h1>
              <p className="text-emerald-50 text-lg">{t("create_post_subtitle")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 pt-2">
              <Image
                src={user?.avatar || "/images/avatar.jpg"}
                width={96} height={96}
                className="w-16 h-16 rounded-full border border-gray-200 object-cover"
                alt="Avatar"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {user?.full_name || user?.name || user?.username || "Bạn"}
                </p>
                <div className="text-xs text-gray-500">{t("create_post_public")}</div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("create_post_category_label")}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all cursor-pointer text-left flex justify-between items-center"
                >
                  <span>{category}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {categories.map((item) => (
                      <div
                        key={item}
                        onClick={() => handleCategoryChange(item)}
                        className={`px-3 py-2 cursor-pointer transition-colors text-sm ${category === item ? "bg-emerald-500 text-white font-medium" : "text-gray-900 hover:bg-emerald-500 hover:text-white"}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Dịch vụ cung cấp (chỉ serviceProvider + category Dịch vụ) ── */}
            {showServiceSelector && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wrench size={15} className="text-emerald-600" />
                  Dịch vụ cung cấp
                </label>
                <p className="text-xs text-gray-500">
                  Chọn dịch vụ bạn muốn giới thiệu trong bài đăng này
                </p>
                <ProfileServiceSelector
                  availableServices={profileServices}
                  selectedServices={selectedTypeServices}
                  onChange={setSelectedTypeServices}
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("create_post_content_label")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={TITLE_PLACEHOLDERS[category] || TITLE_PLACEHOLDERS["Khác"]}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">{title.length}/100</div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("create_post_desc_label")}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("create_post_desc_placeholder")}
                className="w-full bg-white text-gray-900 text-base resize-none outline-none min-h-35 placeholder:text-gray-500 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">{content.length}/1000</div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("create_post_contact_label")}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleContactTypeChange("phone")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${contactType === "phone" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <Phone size={15} />
                  {t("create_post_contact_phone")}
                </button>
                <button
                  type="button"
                  onClick={() => handleContactTypeChange("email")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${contactType === "email" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <Mail size={15} />
                  {t("create_post_contact_email")}
                </button>
              </div>
              <input
                type={contactType === "phone" ? "tel" : "email"}
                value={contact}
                onChange={handleContactChange}
                placeholder={contactType === "phone" ? t("create_post_contact_phone_placeholder") : t("create_post_contact_email_placeholder")}
                className={`w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${contactError ? "border-red-400" : "border-gray-200"}`}
              />
              {contactError && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <XCircle size={14} strokeWidth={2.5} />{contactError}
                </p>
              )}
            </div>

            {/* Image */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                {t("create_post_image_label")}
              </label>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                >
                  <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm font-medium text-gray-600">{t("create_post_image_click")}</p>
                  <p className="text-xs text-gray-400 mt-1">{t("create_post_image_hint")}</p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <Image src={imagePreview} alt="Preview" width={96} height={96} className="w-full h-auto object-contain bg-gray-50 max-h-80" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(""); setImageData(""); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                  >
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

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("create_post_submitting")}
                </span>
              ) : t("create_post_submit")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
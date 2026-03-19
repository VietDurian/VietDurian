"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  User, Mail, Phone, Shield, Heart, FileText, Edit2, Calendar,
  CheckCircle, XCircle, Crown, Sparkles, X, Loader2, Eye, EyeOff, Lightbulb, Camera,
} from "lucide-react";
import { profileAPI, authAPI } from "@/lib/api";
import FavoritePostsModal from "@/components/FavoritePostsModal";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${active ? "bg-emerald-500 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
    <Icon size={20} className={`${active ? "text-white" : "text-emerald-600"}`} strokeWidth={2.5} />
    <span className="font-semibold tracking-wide">{label}</span>
  </button>
);

const InfoField = ({ icon: Icon, label, value, verified }) => (
  <div className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-emerald-500 transition-all duration-300">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-emerald-50">
        <Icon size={22} className="text-emerald-600" strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-gray-900">{value}</p>
          {verified && <CheckCircle size={16} className="text-emerald-500" strokeWidth={2.5} />}
        </div>
      </div>
    </div>
  </div>
);

const RoleBadge = ({ role, t }) => {
  const roleConfig = {
    trader: { label: t('role_trader'), color: "from-blue-500 to-indigo-500" },
    farmer: { label: t('role_farmer'), color: "from-green-500 to-emerald-500" },
    contentExpert: { label: t('role_contentExpert'), color: "from-purple-500 to-pink-500" },
    serviceProvider: { label: t('role_serviceProvider'), color: "from-orange-500 to-red-500" },
  };
  const config = roleConfig[role] || { label: role, color: "from-gray-500 to-gray-600" };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.color} text-white shadow-lg`}>
      <Crown size={16} strokeWidth={2.5} />
      <span className="text-sm font-bold tracking-wide">{config.label}</span>
    </div>
  );
};

const PasswordRule = ({ rule, password }) => {
  const isValid = rule.test(password);
  return (
    <div className="flex items-center gap-2">
      {isValid ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} /> : <XCircle size={16} className="text-gray-300 flex-shrink-0" strokeWidth={2.5} />}
      <span className={`text-sm ${isValid ? "text-emerald-600" : "text-gray-500"}`}>{rule.label}</span>
    </div>
  );
};

export default function ProfileDetails() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", avatar: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const avatarInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordRules = [
    { id: "length", test: (pwd) => pwd.length >= 12, label: t('profile_pw_rule1') },
    { id: "uppercase", test: (pwd) => /[A-Z]/.test(pwd), label: t('profile_pw_rule2') },
    { id: "lowercase", test: (pwd) => /[a-z]/.test(pwd), label: t('profile_pw_rule3') },
    { id: "number", test: (pwd) => /\d/.test(pwd), label: t('profile_pw_rule4') },
    { id: "special", test: (pwd) => /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/.test(pwd), label: t('profile_pw_rule5') },
  ];

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh quá lớn. Tối đa 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setEditForm((prev) => ({ ...prev, avatar: reader.result?.toString() || "" }));
    reader.readAsDataURL(file);
  };

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getMe();
      if (response.success) {
        setProfileData(response.data);
        setEditForm({ full_name: response.data.full_name, phone: response.data.phone, avatar: response.data.avatar });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditForm({ full_name: profileData.full_name, phone: profileData.phone, avatar: profileData.avatar });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!value.trim()) setPhoneError(t('phone_error_required'));
      else if (!phoneRegex.test(value)) setPhoneError(t('phone_error_invalid'));
      else setPhoneError("");
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await profileAPI.update(editForm);
      if (response.success) {
        await fetchProfile();
        setIsEditModalOpen(false);
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (field, value) => setPasswordForm((prev) => ({ ...prev, [field]: value }));
  const togglePasswordVisibility = (field) => setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const allRulesPassed = passwordRules.every((rule) => rule.test(passwordForm.newPassword));
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword !== "";
  const canChangePassword = allRulesPassed && passwordsMatch && passwordForm.currentPassword !== "";

  const handleChangePassword = async () => {
    if (!canChangePassword) return;
    try {
      setIsChangingPassword(true);
      const response = await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      if (response.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi đổi mật khẩu!";
      if (error?.response) {
        const { status, data } = error.response;
        if (status === 401) errorMessage = "Mật khẩu hiện tại không đúng!";
        else if (status === 400) errorMessage = data?.message || "Mật khẩu mới không hợp lệ!";
        else if (status === 500) errorMessage = "Lỗi server! Vui lòng thử lại sau.";
        else errorMessage = data?.message || errorMessage;
      }
      alert(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-600 font-medium">{t('profile_loading')}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">{t('profile_load_error')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="relative mb-8 bg-emerald-500 rounded-3xl overflow-hidden">
          <div className="relative z-10 p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img src={profileData.avatar} alt={profileData.full_name} className="relative w-28 h-28 rounded-full border-4 border-white object-cover" />
                  <div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full">
                    {profileData.is_verified
                      ? <CheckCircle size={20} className="text-emerald-600" strokeWidth={2.5} />
                      : <XCircle size={20} className="text-gray-400" strokeWidth={2.5} />}
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2 tracking-wide">{profileData.full_name}</h1>
                  <p className="text-emerald-100 text-sm mb-3">{profileData.email}</p>
                  <RoleBadge role={profileData.role} t={t} />
                </div>
              </div>
              <button onClick={handleEditClick} className="group relative px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Edit2 size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>{t('profile_edit_btn')}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 bg-white rounded-2xl p-2 border border-gray-200">
          <div className="flex gap-2">
            <TabButton icon={User} label={t('profile_tab_profile')} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
            <TabButton icon={Heart} label={t('profile_tab_favorites')} active={activeTab === "favorites"} onClick={() => setActiveTab("favorites")} />
            <TabButton icon={Shield} label={t('profile_tab_security')} active={activeTab === "security"} onClick={() => setActiveTab("security")} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField icon={User} label={t('profile_full_name')} value={profileData.full_name} />
                <InfoField icon={Mail} label={t('profile_email')} value={profileData.email} verified={profileData.is_verified} />
                <InfoField icon={Phone} label={t('profile_phone')} value={profileData.phone} />
                <InfoField icon={Calendar} label={t('profile_joined')} value={formatDate(profileData.created_at)} />
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="text-emerald-600" size={22} strokeWidth={2.5} />
                  {t('profile_account_status')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                    <CheckCircle className="text-emerald-600" size={24} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm text-gray-600">{t('profile_status')}</p>
                      <p className="font-semibold text-gray-900">{profileData.is_banned ? t('profile_banned') : t('profile_active')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                    <Mail className="text-emerald-600" size={24} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm text-gray-600">{t('profile_email_verify')}</p>
                      <p className="font-semibold text-gray-900">{profileData.is_verified ? t('profile_verified') : t('profile_unverified')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                    <Calendar className="text-emerald-600" size={24} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm text-gray-600">{t('profile_last_update')}</p>
                      <p className="font-semibold text-gray-900">{formatDate(profileData.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "favorites" && <FavoritePostsModal />}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="text-emerald-600" size={22} strokeWidth={2.5} />
                  {t('profile_change_pw')}
                </h3>
                <div className="space-y-4 max-w-2xl">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile_current_pw')}</label>
                    <div className="relative">
                      <input type={showPasswords.current ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                        placeholder={t('profile_pw_placeholder_current')} />
                      <button type="button" onClick={() => togglePasswordVisibility("current")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPasswords.current ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                      </button>
                    </div>
                  </div>
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile_new_pw')}</label>
                    <div className="relative">
                      <input type={showPasswords.new ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                        placeholder={t('profile_pw_placeholder_new')} />
                      <button type="button" onClick={() => togglePasswordVisibility("new")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPasswords.new ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile_confirm_pw')}</label>
                    <div className="relative">
                      <input type={showPasswords.confirm ? "text" : "password"} value={passwordForm.confirmPassword} onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                        placeholder={t('profile_pw_placeholder_confirm')} />
                      <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPasswords.confirm ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        {passwordsMatch
                          ? <><CheckCircle size={16} className="text-emerald-500" strokeWidth={2.5} /><span className="text-sm text-emerald-600">{t('profile_pw_match')}</span></>
                          : <><XCircle size={16} className="text-red-500" strokeWidth={2.5} /><span className="text-sm text-red-600">{t('profile_pw_not_match')}</span></>}
                      </div>
                    )}
                  </div>
                  <button onClick={handleChangePassword} disabled={!canChangePassword || isChangingPassword}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${canChangePassword && !isChangingPassword ? "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                    {isChangingPassword ? <><Loader2 size={20} className="animate-spin" />{t('profile_processing')}</> : t('profile_update_pw_btn')}
                  </button>
                  {passwordForm.newPassword && (
                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">{t('profile_pw_rules_title')}</p>
                      {passwordRules.map((rule) => <PasswordRule key={rule.id} rule={rule} password={passwordForm.newPassword} />)}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="text-amber-600" size={20} strokeWidth={2.5} />
                  {t('profile_security_tips')}
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {['profile_tip1', 'profile_tip2', 'profile_tip3', 'profile_tip4'].map((key) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="bg-emerald-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Edit2 size={24} strokeWidth={2.5} />
                <h2 className="text-2xl font-bold">{t('profile_edit_title')}</h2>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img src={editForm.avatar || profileData.avatar} alt="Avatar preview" className="w-32 h-32 rounded-full border-4 border-emerald-500 object-cover" />
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-colors">
                    <Camera size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <p className="text-sm text-gray-500">{t('profile_avatar_hint')}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile_full_name')} <span className="text-red-500">*</span></label>
                  <input type="text" name="full_name" value={editForm.full_name} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder={t('profile_full_name')} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile_phone')} <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={editForm.phone} onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder={t('profile_phone')} />
                  {phoneError && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><XCircle size={14} strokeWidth={2.5} />{phoneError}</p>}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 flex justify-center rounded-b-2xl border-t border-gray-200">
              <button onClick={handleSaveProfile}
                disabled={isSaving || phoneError || (editForm.full_name === profileData.full_name && editForm.phone === profileData.phone && editForm.avatar === profileData.avatar) || !editForm.full_name.trim() || !editForm.phone.trim()}
                className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {isSaving ? <><Loader2 size={20} className="animate-spin" />{t('profile_saving')}</> : <><CheckCircle size={20} />{t('profile_save_btn')}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
} 
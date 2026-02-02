"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Heart,
  FileText,
  Edit2,
  Calendar,
  CheckCircle,
  XCircle,
  Crown,
  Sparkles,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { profileAPI } from "@/lib/api";

const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 ${active
      ? "bg-emerald-500 text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
  >
    <Icon
      size={20}
      className={`${active ? "text-white" : "text-emerald-600"}`}
      strokeWidth={2.5}
    />
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
          {verified && (
            <CheckCircle size={16} className="text-emerald-500" strokeWidth={2.5} />
          )}
        </div>
      </div>
    </div>
  </div>
);

const RoleBadge = ({ role }) => {
  const roleConfig = {
    trader: { label: "Thương nhân", color: "from-blue-500 to-indigo-500" },
    farmer: { label: "Nông dân", color: "from-green-500 to-emerald-500" },
    contentExpert: { label: "Chuyên gia", color: "from-purple-500 to-pink-500" },
    serviceProvider: { label: "Nhà cung cấp", color: "from-orange-500 to-red-500" },
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
      {isValid ? (
        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
      ) : (
        <XCircle size={16} className="text-gray-300 flex-shrink-0" strokeWidth={2.5} />
      )}
      <span className={`text-sm ${isValid ? "text-emerald-600" : "text-gray-500"}`}>
        {rule.label}
      </span>
    </div>
  );
};

export default function ProfileDetails() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    avatar: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const passwordRules = [
    { id: "length", test: (pwd) => pwd.length >= 12, label: "Ít nhất 12 ký tự" },
    {
      id: "uppercase",
      test: (pwd) => /[A-Z]/.test(pwd),
      label: "Có chữ in hoa",
    },
    {
      id: "lowercase",
      test: (pwd) => /[a-z]/.test(pwd),
      label: "Có chữ thường",
    },
    {
      id: "number",
      test: (pwd) => /\d/.test(pwd),
      label: "Có ít nhất một số",
    },
    {
      id: "special",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>[\]\\';`~+=\-_/]/.test(pwd),
      label: "Có ký tự đặc biệt (ví dụ: @, #, $)",
    },
  ];

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getMe();
      if (response.success) {
        setProfileData(response.data);
        setEditForm({
          full_name: response.data.full_name,
          phone: response.data.phone,
          avatar: response.data.avatar,
        });
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
    // Reset form to current profile data
    setEditForm({
      full_name: profileData.full_name,
      phone: profileData.phone,
      avatar: profileData.avatar,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await profileAPI.update(editForm);
      if (response.success) {
        // Refresh profile data
        await fetchProfile();
        setIsEditModalOpen(false);
        alert("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const allRulesPassed = passwordRules.every((rule) => rule.test(passwordForm.newPassword));
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.confirmPassword !== "";
  const canChangePassword = allRulesPassed && passwordsMatch && passwordForm.currentPassword !== "";

  const handleChangePassword = async () => {
    if (!canChangePassword) return;

    // Add your password change API call here
    console.log("Changing password...");
    alert("Đổi mật khẩu thành công!");

    // Reset form
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Không thể tải thông tin người dùng</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-8 bg-emerald-500 rounded-3xl overflow-hidden">
          <div className="relative z-10 p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <img
                    src={profileData.avatar}
                    alt={profileData.full_name}
                    className="relative w-28 h-28 rounded-full border-4 border-white object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 p-2 bg-white rounded-full">
                    {profileData.is_verified ? (
                      <CheckCircle size={20} className="text-emerald-600" strokeWidth={2.5} />
                    ) : (
                      <XCircle size={20} className="text-gray-400" strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2 tracking-wide">
                    {profileData.full_name}
                  </h1>
                  <p className="text-emerald-100 text-sm mb-3">{profileData.email}</p>
                  <RoleBadge role={profileData.role} />
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={handleEditClick}
                className="group relative px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <Edit2 size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Chỉnh sửa</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 bg-white rounded-2xl p-2 border border-gray-200">
          <div className="flex gap-2">
            <TabButton
              icon={User}
              label="Hồ sơ cá nhân"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />
            <TabButton
              icon={Heart}
              label="Bài viết yêu thích"
              active={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
            />
            <TabButton
              icon={Shield}
              label="Bảo mật"
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Personal Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  icon={User}
                  label="Họ và tên"
                  value={profileData.full_name}
                />
                <InfoField
                  icon={Mail}
                  label="Email"
                  value={profileData.email}
                  verified={profileData.is_verified}
                />
                <InfoField
                  icon={Phone}
                  label="Số điện thoại"
                  value={profileData.phone}
                />
                <InfoField
                  icon={Calendar}
                  label="Ngày tham gia"
                  value={formatDate(profileData.created_at)}
                />
              </div>

              {/* Account Status */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="text-emerald-600" size={22} strokeWidth={2.5} />
                  Trạng thái tài khoản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                    <CheckCircle className="text-emerald-600" size={24} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm text-gray-600">Trạng thái</p>
                      <p className="font-semibold text-gray-900">
                        {profileData.is_banned ? "Bị khóa" : "Hoạt động"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                    <Mail className="text-emerald-600" size={24} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm text-gray-600">Xác thực email</p>
                      <p className="font-semibold text-gray-900">
                        {profileData.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50">
                    <Calendar className="text-emerald-600" size={24} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(profileData.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-6 rounded-full bg-pink-50 mb-6">
                  <Heart className="text-pink-500" size={48} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Bài viết yêu thích
                </h3>
                <p className="text-gray-600">
                  Các bài viết bạn yêu thích sẽ xuất hiện ở đây. Hãy bắt đầu khám phá và lưu lại những nội dung bạn yêu thích!
                </p>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="text-emerald-600" size={22} strokeWidth={2.5} />
                  Đổi mật khẩu
                </h3>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPasswords.current ? (
                          <EyeOff size={20} strokeWidth={2} />
                        ) : (
                          <Eye size={20} strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPasswords.new ? (
                          <EyeOff size={20} strokeWidth={2} />
                        ) : (
                          <Eye size={20} strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={20} strokeWidth={2} />
                        ) : (
                          <Eye size={20} strokeWidth={2} />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {passwordForm.confirmPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        {passwordsMatch ? (
                          <>
                            <CheckCircle size={16} className="text-emerald-500" strokeWidth={2.5} />
                            <span className="text-sm text-emerald-600">Mật khẩu khớp</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-red-500" strokeWidth={2.5} />
                            <span className="text-sm text-red-600">Mật khẩu không khớp</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={!canChangePassword}
                    className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${canChangePassword
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Cập nhật mật khẩu
                  </button>

                  {/* Password Rules - Moved below button */}
                  {passwordForm.newPassword && (
                    <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Yêu cầu mật khẩu:</p>
                      {passwordRules.map((rule) => (
                        <PasswordRule key={rule.id} rule={rule} password={passwordForm.newPassword} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="text-amber-600" size={20} strokeWidth={2.5} />
                  Mẹo bảo mật
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Sử dụng mật khẩu mạnh với ít nhất 12 ký tự</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Không sử dụng thông tin cá nhân dễ đoán</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-emerald-500 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Edit2 size={24} strokeWidth={2.5} />
                <h2 className="text-2xl font-bold">Chỉnh sửa thông tin</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={editForm.avatar || profileData.avatar}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full border-4 border-emerald-500 object-cover"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Avatar
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={editForm.avatar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-6 flex justify-center rounded-b-2xl border-t border-gray-200">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
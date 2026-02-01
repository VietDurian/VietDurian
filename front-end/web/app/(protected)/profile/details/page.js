"use client";
import React, { useState } from "react";
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
} from "lucide-react";

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

export default function ProfileDetails() {
  const [activeTab, setActiveTab] = useState("profile");

  // Dummy data for UI preview
  const profileData = {
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0901234567",
    avatar: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1754207039/lang-nghe-banh-trang-9-1789_hupbtt.jpg",
    role: "farmer",
    is_verified: true,
    is_banned: false,
    created_at: "2025-01-15T10:30:00.000Z",
    updated_at: "2026-02-01T08:20:00.000Z",
  };

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
              <button className="group relative px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300">
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
        </div>
      </div>

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
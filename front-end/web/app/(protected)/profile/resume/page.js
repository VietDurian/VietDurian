"use client";
import React, { useState } from "react";
import {
  Briefcase,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Edit2,
  CheckCircle,
  XCircle,
  Award,
  Building2,
  Wrench,
  Loader2,
  Plus,
  Lock,
} from "lucide-react";

const ServiceProviderResume = () => {
  // Sample data to display after creation
  const sampleProfile = {
    business_name: "Number One",
    services: "Phun thuốc, diệt côn trùng, thu hoạch sầu riêng",
    service_areas: "TP. Hồ Chí Minh, TP. Cần Thơ",
    experience_year: 5,
    contact_phone: "0909123456",
    description: "Chuyên cung cấp dịch vụ nông nghiệp uy tín hàng đầu",
    created_at: new Date().toISOString(),
  };

  // Set to true to show sample data, false to show create form first
  const [hasProfile, setHasProfile] = useState(true); // Changed to true to show sample
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    services: "",
    service_areas: "",
    experience_year: "",
    contact_phone: "",
    description: "",
  });

  const [profileData, setProfileData] = useState(sampleProfile); // Set sample data by default

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    // Simulate API call
    setTimeout(() => {
      setProfileData({
        ...formData,
        experience_year: parseInt(formData.experience_year),
        created_at: new Date().toISOString(),
      });
      setHasProfile(true);
      setShowForm(false);
      setIsCreating(false);
    }, 1500);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // If no profile exists and not showing form
  if (!hasProfile && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 mb-6">
              <Briefcase className="w-12 h-12 text-emerald-600" strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tạo Hồ Sơ Năng Lực
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Hồ sơ năng lực giúp khách hàng hiểu rõ hơn về dịch vụ của bạn.
              Hãy tạo hồ sơ để tăng uy tín và thu hút thêm nhiều khách hàng!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} strokeWidth={2.5} />
              Tạo Hồ Sơ Ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show form
  if (showForm && !hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-200">
            {/* Form Header */}
            <div className="bg-emerald-500 text-white p-8">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase size={32} strokeWidth={2.5} />
                <h2 className="text-3xl font-bold">Tạo Hồ Sơ Năng Lực</h2>
              </div>
              <p className="text-emerald-100">
                Điền thông tin dịch vụ của bạn để khách hàng dễ dàng tìm thấy
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Doanh Nghiệp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder="Ví dụ: Dịch Vụ Nông Nghiệp Xanh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dịch Vụ Cung Cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wrench
                    className="absolute left-4 top-4 text-gray-400"
                    size={20}
                  />
                  <textarea
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900 resize-none"
                    placeholder="Ví dụ: Phun thuốc, diệt côn trùng, thu hoạch sầu riêng"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Liệt kê các dịch vụ, phân cách bằng dấu phẩy
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khu Vực Hoạt Động <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    name="service_areas"
                    value={formData.service_areas}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                    placeholder="Ví dụ: TP. Hồ Chí Minh, TP. Cần Thơ"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Các tỉnh/thành phố bạn cung cấp dịch vụ
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số Năm Kinh Nghiệm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="number"
                      name="experience_year"
                      value={formData.experience_year}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số Điện Thoại Liên Hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900"
                      placeholder="0909123456"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô Tả Chi Tiết <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-4 top-4 text-gray-400"
                    size={20}
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900 resize-none"
                    placeholder="Giới thiệu về dịch vụ của bạn, điểm mạnh, cam kết chất lượng..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Đang Tạo...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Tạo Hồ Sơ
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Display profile
  const displayData = profileData || sampleProfile;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with lock indicator */}
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Briefcase size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Hồ Sơ Năng Lực</h1>
                  <p className="text-emerald-100">
                    Thông tin dịch vụ của bạn
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Lock size={18} strokeWidth={2.5} />
                <span className="text-sm font-semibold">Đã Tạo</span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 space-y-6">
            {/* Business Name */}
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border-2 border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Building2 size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Tên Doanh Nghiệp
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {displayData.business_name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Wrench size={22} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    Dịch Vụ Cung Cấp
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displayData.services.split(",").map((service, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200"
                      >
                        {service.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Areas */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <MapPin size={22} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Khu Vực Hoạt Động
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {displayData.service_areas}
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Award size={22} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Kinh Nghiệm
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {displayData.experience_year} năm
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Phone */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Phone size={22} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Số Điện Thoại
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {displayData.contact_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Calendar size={22} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Ngày Tạo
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(displayData.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <FileText size={22} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-3">
                    Mô Tả Chi Tiết
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    {displayData.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <Lock className="text-amber-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">
                Hồ Sơ Đã Được Tạo
              </h4>
              <p className="text-sm text-gray-700">
                Mỗi tài khoản chỉ có thể tạo một hồ sơ năng lực duy nhất.
                Nếu bạn muốn cập nhật thông tin, vui lòng liên hệ bộ phận hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderResume;
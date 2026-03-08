"use client";
import React, { useState, useEffect } from "react";
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
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { capabilityProfileAPI } from "@/lib/api";
import { toast } from "sonner"

const ServiceProviderResume = () => {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    business_name: "",
    services: "",
    service_areas: "",
    experience_year: "",
    contact_phone: "",
    description: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await capabilityProfileAPI.get();

      if (response.code === 200 && response.data) {
        setProfileData(response.data);
        setHasProfile(true);
        setFormData({
          business_name: response.data.business_name,
          services: response.data.services,
          service_areas: response.data.service_areas,
          experience_year: response.data.experience_year.toString(),
          contact_phone: response.data.contact_phone,
          description: response.data.description,
        });
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        setHasProfile(false);
        setError(null);
      } else {
        console.error("Error fetching profile:", error);
        setError("Không thể tải thông tin hồ sơ");
        setHasProfile(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'experience_year') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const payload = {
        business_name: formData.business_name,
        services: formData.services,
        service_areas: formData.service_areas,
        experience_year: parseInt(formData.experience_year),
        contact_phone: formData.contact_phone,
        description: formData.description,
      };

      // Only edit mode here (create is on separate page)
      const response = await capabilityProfileAPI.update(payload);
      if (response.code === 200) {
        await fetchProfile();
        setShowForm(false);
        setIsEditMode(false);
        toast.success("Cập nhật hồ sơ thành công!");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      let errorMessage = "Có lỗi xảy ra!";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setShowForm(false);
    setIsEditMode(false);
    if (profileData) {
      setFormData({
        business_name: profileData.business_name,
        services: profileData.services,
        service_areas: profileData.service_areas,
        experience_year: profileData.experience_year.toString(),
        contact_phone: profileData.contact_phone,
        description: profileData.description,
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no profile exists — chỉ đổi onClick thành router.push
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
              onClick={() => router.push("/profile/resume/create")}
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

  // Show form (edit only — giữ nguyên 100% UI gốc)
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden border border-gray-200">
            {/* Form Header */}
            <div className="bg-emerald-500 text-white p-8">
              <div className="flex items-center gap-3 mb-2">
                <Edit2 size={32} strokeWidth={2.5} />
                <h2 className="text-3xl font-bold">Chỉnh Sửa Hồ Sơ Năng Lực</h2>
              </div>
              <p className="text-emerald-100">Cập nhật thông tin dịch vụ của bạn</p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Doanh Nghiệp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" name="business_name" value={formData.business_name} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder="Ví dụ: Dịch Vụ Nông Nghiệp Xanh" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dịch Vụ Cung Cấp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wrench className="absolute left-4 top-4 text-gray-400" size={20} />
                  <textarea name="services" value={formData.services} onChange={handleInputChange} required rows={3} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900 resize-none" placeholder="Ví dụ: Phun thuốc, diệt côn trùng, thu hoạch sầu riêng" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Liệt kê các dịch vụ, phân cách bằng dấu phẩy</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khu Vực Hoạt Động <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" name="service_areas" value={formData.service_areas} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder="Ví dụ: TP. Hồ Chí Minh, TP. Cần Thơ" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Các tỉnh/thành phố bạn cung cấp dịch vụ</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số Năm Kinh Nghiệm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                    <input type="text" name="experience_year" value={formData.experience_year} onChange={handleInputChange} required inputMode="numeric" pattern="[0-9]*" className="w-full pl-12 pr-20 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder="5" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                      <button type="button" onClick={() => { const newValue = parseInt(formData.experience_year || 0) + 1; setFormData(prev => ({ ...prev, experience_year: newValue.toString() })); }} className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                      </button>
                      <button type="button" onClick={() => { const newValue = Math.max(0, parseInt(formData.experience_year || 0) - 1); setFormData(prev => ({ ...prev, experience_year: newValue.toString() })); }} className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số Điện Thoại Liên Hệ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder="0909123456" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô Tả Chi Tiết <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
                  <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900 resize-none" placeholder="Giới thiệu về dịch vụ của bạn, điểm mạnh, cam kết chất lượng..." />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCancelEdit} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">Hủy</button>
                <button type="submit" disabled={isCreating} className="flex-1 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isCreating ? (<><Loader2 size={20} className="animate-spin" />Đang Cập Nhật...</>) : (<><CheckCircle size={20} />Cập Nhật Hồ Sơ</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Display profile (giữ nguyên 100% UI gốc)
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Briefcase size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Hồ Sơ Năng Lực</h1>
                  <p className="text-emerald-100">Thông tin dịch vụ của bạn</p>
                </div>
              </div>
              <button onClick={handleEdit} className="group flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-300">
                <Edit2 size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform duration-300" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border-2 border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <Building2 size={24} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">Tên Doanh Nghiệp</p>
                  <h2 className="text-2xl font-bold text-gray-900">{profileData.business_name}</h2>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Wrench size={22} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-2">Dịch Vụ Cung Cấp</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.services.split(",").map((service, index) => (
                      <span key={index} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">{service.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl"><MapPin size={22} className="text-emerald-600" strokeWidth={2.5} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Khu Vực Hoạt Động</p>
                    <p className="text-base font-semibold text-gray-900">{profileData.service_areas}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl"><Award size={22} className="text-emerald-600" strokeWidth={2.5} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Kinh Nghiệm</p>
                    <p className="text-base font-semibold text-gray-900">{profileData.experience_year} năm</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl"><Phone size={22} className="text-emerald-600" strokeWidth={2.5} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Số Điện Thoại</p>
                    <p className="text-base font-semibold text-gray-900">{profileData.contact_phone}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl"><Calendar size={22} className="text-emerald-600" strokeWidth={2.5} /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Ngày Tạo</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(profileData.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl"><FileText size={22} className="text-emerald-600" strokeWidth={2.5} /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-500 mb-3">Mô Tả Chi Tiết</p>
                  <p className="text-gray-700 leading-relaxed">{profileData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} strokeWidth={2.5} />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Hồ Sơ Năng Lực</h4>
              <p className="text-sm text-gray-700">Bạn có thể chỉnh sửa thông tin hồ sơ bất cứ lúc nào bằng cách nhấn nút "Chỉnh sửa" ở trên.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderResume;
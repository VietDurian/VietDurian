"use client";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import {
    Briefcase,
    MapPin,
    Phone,
    FileText,
    CheckCircle,
    Award,
    Building2,
    Wrench,
    Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { capabilityProfileAPI } from "@/lib/api";

export default function CreateResumePage() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        business_name: "",
        services: "",
        service_areas: "",
        experience_year: "",
        contact_phone: "",
        description: "",
    });

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

            const response = await capabilityProfileAPI.create(payload);
            if (response.code === 201) {
                alert("Tạo hồ sơ thành công!");
                router.push("/profile/resume");
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            let errorMessage = "Có lỗi xảy ra!";
            if (error?.response?.status === 409) {
                errorMessage = "Hồ sơ đã tồn tại! Mỗi tài khoản chỉ tạo được 1 lần.";
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-3xl overflow-hidden border border-gray-200">
                        {/* Form Header — y chang goc */}
                        <div className="bg-emerald-500 text-white p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Briefcase size={32} strokeWidth={2.5} />
                                <h2 className="text-3xl font-bold">Tạo Hồ Sơ Năng Lực</h2>
                            </div>
                            <p className="text-emerald-100">
                                Điền thông tin dịch vụ của bạn để khách hàng dễ dàng tìm thấy
                            </p>
                        </div>

                        {/* Form Body — y chang goc */}
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
                                <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">Hủy</button>
                                <button type="submit" disabled={isCreating} className="flex-1 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isCreating ? (<><Loader2 size={20} className="animate-spin" />Đang Tạo...</>) : (<><CheckCircle size={20} />Tạo Hồ Sơ</>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
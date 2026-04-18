"use client";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import {
    Briefcase, MapPin, Phone, FileText, CheckCircle,
    Award, Building2, Wrench, Loader2, XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { capabilityProfileAPI } from "@/lib/api";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

// ─── Danh sách 10 loại dịch vụ cố định ───────────────────────────────────────
const SERVICE_OPTIONS = [
    { name: "Chuẩn bị đất & cây giống", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344984/1_q5ex4r.jpg" },
    { name: "Tưới nước", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344983/2_b2vbpy.jpg" },
    { name: "Bón phân", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344983/3_cf0zcj.jpg" },
    { name: "Phun thuốc", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344983/4_noshkk.jpg" },
    { name: "Tỉa cành, tạo tán", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344984/5_lkgztf.jpg" },
    { name: "Làm cỏ", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344984/6_cnbn3r.jpg" },
    { name: "Xử lý ra hoa", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344984/7_q3beeu.jpg" },
    { name: "Thụ phấn bổ sung", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344983/8_kmkqs3.jpg" },
    { name: "Tỉa trái", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344984/9_k3pvls.jpg" },
    { name: "Thu hoạch", image: "https://res.cloudinary.com/di6lwnmsm/image/upload/v1776344984/10_b9jovt.jpg" },
];

// ─── Component chọn dịch vụ (text chips only) ────────────────────────────────
const ServiceSelector = ({ selectedServices, onChange }) => {
    const toggleService = (svc) => {
        const exists = selectedServices.some((s) => s.name === svc.name);
        if (exists) {
            onChange(selectedServices.filter((s) => s.name !== svc.name));
        } else {
            onChange([...selectedServices, svc]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((svc) => {
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateResumePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const [phoneError, setPhoneError] = useState("");

    const [formData, setFormData] = useState({
        business_name: "",
        services: [],          // ← array [{name, image}]
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

        if (name === 'contact_phone') {
            const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
            if (!value.trim()) {
                setPhoneError(t('resume_phone_required'));
            } else if (!phoneRegex.test(value)) {
                setPhoneError(t('resume_phone_invalid'));
            } else {
                setPhoneError("");
            }
        }
    };

    const handleServicesChange = (newServices) => {
        setFormData((prev) => ({ ...prev, services: newServices }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        setError(null);

        try {
            const payload = {
                business_name: formData.business_name,
                services: formData.services,          // ← array [{name, image}]
                service_areas: formData.service_areas,
                experience_year: parseInt(formData.experience_year),
                contact_phone: formData.contact_phone,
                description: formData.description,
            };

            const response = await capabilityProfileAPI.create(payload);
            if (response.code === 201) {
                toast.success(t('create_resume_success'));
                router.push("/profile/resume");
            }
        } catch (error) {
            console.error("Error submitting profile:", error);
            let errorMessage = t('create_resume_fail');
            if (error?.response?.status === 409) {
                errorMessage = t('create_resume_duplicate');
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            setError(errorMessage);
            toast.error(errorMessage);
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
                        <div className="bg-emerald-500 text-white p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <Briefcase size={32} strokeWidth={2.5} />
                                <h2 className="text-3xl font-bold">{t('create_resume_header_title')}</h2>
                            </div>
                            <p className="text-emerald-100">{t('create_resume_header_subtitle')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Business Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('resume_business_name_label')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="text" name="business_name" value={formData.business_name} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder={t('resume_business_name_placeholder')} />
                                </div>
                            </div>

                            {/* Services – checkbox grid */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    {t('resume_services_label')} <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                   {t("resume_service_hint")}
                                </p>
                                <ServiceSelector
                                    selectedServices={formData.services}
                                    onChange={handleServicesChange}
                                />
                                {formData.services.length === 0 && (
                                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <XCircle size={13} strokeWidth={2.5} />
                                       {t("resume_service_required")}
                                    </p>
                                )}
                            </div>

                            {/* Service Areas */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('resume_areas_label')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="text" name="service_areas" value={formData.service_areas} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder={t('resume_areas_placeholder')} />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('resume_areas_hint')}</p>
                            </div>

                            {/* Experience + Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('resume_exp_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                                        <input type="text" name="experience_year" value={formData.experience_year} onChange={handleInputChange} required inputMode="numeric" pattern="[0-9]*" className="w-full pl-12 pr-20 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder="5" />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                            <button type="button" onClick={() => { const v = parseInt(formData.experience_year || 0) + 1; setFormData(p => ({ ...p, experience_year: v.toString() })); }} className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </button>
                                            <button type="button" onClick={() => { const v = Math.max(0, parseInt(formData.experience_year || 0) - 1); setFormData(p => ({ ...p, experience_year: v.toString() })); }} className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('resume_phone_label')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input type="tel" name="contact_phone" value={formData.contact_phone} onChange={handleInputChange} required className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900" placeholder={t('resume_phone_placeholder')} />
                                    </div>
                                    {phoneError && (
                                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                                            <XCircle size={14} strokeWidth={2.5} />{phoneError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {t('resume_desc_label')} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 text-gray-400" size={20} />
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={4} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-gray-900 resize-none" placeholder={t('resume_desc_placeholder')} />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">{t('create_resume_cancel_btn')}</button>
                                <button
                                    type="submit"
                                    disabled={
                                        isCreating ||
                                        !!phoneError ||
                                        !formData.business_name.trim() ||
                                        formData.services.length === 0 ||
                                        !formData.service_areas.trim() ||
                                        !formData.experience_year ||
                                        !formData.contact_phone.trim() ||
                                        !formData.description.trim()
                                    }
                                    className="flex-1 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (<><Loader2 size={20} className="animate-spin" />{t('create_resume_creating')}</>) : (<><CheckCircle size={20} />{t('create_resume_submit_btn')}</>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
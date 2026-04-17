"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { profileAPI, capabilityProfileAPI } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Crown,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Star,
  MessageCircle,
  ShieldCheck,
  Clock,
  Briefcase,
  Building2,
  Wrench,
  Award,
  FileText,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

const RoleBadge = ({ role }) => {
  const { t } = useLanguage();
  const roleConfig = {
    trader: {
      label: t("public_profile_role_badge_trader"),
      color: "from-blue-500 to-indigo-500",
    },
    farmer: {
      label: t("public_profile_role_badge_farmer"),
      color: "from-green-500 to-emerald-500",
    },
    contentExpert: {
      label: t("public_profile_role_badge_expert"),
      color: "from-purple-500 to-pink-500",
    },
    serviceProvider: {
      label: t("public_profile_role_badge_provider"),
      color: "from-orange-500 to-red-500",
    },
  };
  const config = roleConfig[role] || {
    label: role,
    color: "from-gray-500 to-gray-600",
  };
  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r ${config.color} text-white shadow-lg`}
    >
      <Crown size={14} strokeWidth={2.5} />
      <span className="text-sm font-bold tracking-wide">{config.label}</span>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, accent = false }) => (
  <div
    className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${accent ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 hover:border-emerald-300"}`}
  >
    <div className="flex items-start gap-4">
      <div
        className={`p-3 rounded-xl ${accent ? "bg-emerald-100" : "bg-emerald-50"}`}
      >
        <Icon size={20} className="text-emerald-600" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-base font-bold text-gray-900 truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  </div>
);

const StatCard = ({ value, label, icon: Icon }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
    <Icon size={20} className="text-white/80 mx-auto mb-2" strokeWidth={2} />
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-emerald-100 mt-0.5">{label}</p>
  </div>
);

export default function PublicProfilePage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getPublicProfile(userId);
        if (response.success) {
          setProfileData(response.data);
          if (response.data.role === "serviceProvider") {
            try {
              const resumeRes = await capabilityProfileAPI.get(userId);
              if (resumeRes.code === 200 && resumeRes.data) {
                setResumeData(resumeRes.data);
              }
            } catch {
              // Không có resume thì bỏ qua
            }
          }
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchPublicProfile();
  }, [userId]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getDaysSinceJoined = (dateString) => {
    const joined = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - joined) / (1000 * 60 * 60 * 24));
    if (diff < 30) return `${diff} ${t("public_profile_days")}`;
    if (diff < 365)
      return `${Math.floor(diff / 30)} ${t("public_profile_months")}`;
    return `${Math.floor(diff / 365)} ${t("public_profile_years")}`;
  };

  const getRoleLabel = (role) => {
    const map = {
      farmer: t("public_profile_role_farmer"),
      trader: t("public_profile_role_trader"),
      contentExpert: t("public_profile_role_expert"),
      serviceProvider: t("public_profile_role_provider"),
    };
    return map[role] || t("public_profile_role_member");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-600 font-medium">
            {t("public_profile_loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {t("public_profile_not_found")}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold"
          >
            {t("public_profile_back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group z-10"
      >
        <ArrowLeft
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span className="text-sm font-medium">{t("public_profile_back")}</span>
      </button>

      <div className="px-8 pt-8 pb-12 space-y-6">
        <div className="h-8" />

        {/* Hero Header */}
        <div className="relative bg-emerald-500 rounded-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <Image
                  src={profileData.avatar || "/images/default-avatar.png"}
                  alt={profileData.full_name}
                  width={96}
                  height={96}
                  className="relative w-35 h-35 rounded-full border-4 border-white object-cover"
                  onError={(e) => {
                    e.target.src = "/images/default-avatar.png";
                  }}
                />
                <div className="absolute -bottom-0.5 -right-0.5 p-2 bg-white rounded-full">
                  <CheckCircle
                    size={20}
                    className="text-emerald-600"
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <div className="text-white flex-1">
                <h1 className="text-3xl font-bold mb-1 tracking-tight">
                  {profileData.full_name}
                </h1>
                <p className="text-emerald-100 text-sm mb-3 flex items-center gap-1.5">
                  <Mail size={14} />
                  {profileData.email}
                </p>
                <RoleBadge role={profileData.role} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={Clock}
                value={getDaysSinceJoined(profileData.created_at)}
                label={t("public_profile_member")}
              />
              <StatCard
                icon={ShieldCheck}
                value={t("public_profile_email_verified")}
                label={t("public_profile_email_label")}
              />
              <StatCard
                icon={Star}
                value={getRoleLabel(profileData.role)}
                label={t("public_profile_role_label")}
              />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-emerald-600" strokeWidth={2.5} />
            {t("public_profile_info_title")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              icon={User}
              label={t("public_profile_full_name")}
              value={profileData.full_name}
            />
            <InfoCard
              icon={Mail}
              label={t("public_profile_email")}
              value={profileData.email}
              accent
            />
            <InfoCard
              icon={Phone}
              label={t("public_profile_phone")}
              value={profileData.phone}
            />
            <InfoCard
              icon={Calendar}
              label={t("public_profile_joined")}
              value={formatDate(profileData.created_at)}
            />
          </div>
        </div>

        {/* Resume Section */}
        {resumeData && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase
                size={20}
                className="text-emerald-600"
                strokeWidth={2.5}
              />
              {t("public_profile_resume_title")}
            </h2>

            <div className="space-y-4">
              {/* Row 1: Tên doanh nghiệp + Khu vực ngang nhau */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-linear-to-br from-emerald-50 to-white rounded-2xl p-6 border-2 border-emerald-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500 rounded-xl">
                      <Building2 size={22} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {t("public_profile_business_name")}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900">
                        {resumeData.business_name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <MapPin size={20} className="text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {t("public_profile_areas")}
                      </p>
                      <p className="font-semibold text-gray-900">{resumeData.service_areas}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Dịch vụ full width */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl shrink-0">
                    <Wrench size={20} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {t("public_profile_services")}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      {Array.isArray(resumeData.services)
                        ? resumeData.services.map((svc, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 shadow-sm"
                          >
                            <img
                              src={svc.image}
                              alt={svc.name}
                              className="w-16 h-16 rounded-lg object-cover border border-emerald-200 shrink-0"
                            />
                            <span className="text-base font-semibold text-emerald-700">{svc.name}</span>
                          </div>
                        ))
                        : resumeData.services.split(",").map((s, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200"
                          >
                            {s.trim()}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Kinh nghiệm + Liên hệ (giữ nguyên) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <Award size={20} className="text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {t("public_profile_experience")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {resumeData.experience_year} {t("public_profile_experience_unit")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <Phone size={20} className="text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        {t("public_profile_contact")}
                      </p>
                      <p className="font-semibold text-gray-900">{resumeData.contact_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Mô tả (giữ nguyên) */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <FileText size={20} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {t("public_profile_description")}
                    </p>
                    <p className="text-gray-700 leading-relaxed">{resumeData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

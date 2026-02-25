"use client";
import {
    User, Mail, Phone, Calendar,
    Crown, CheckCircle, XCircle, Loader2,
    ArrowLeft, Star, MessageCircle,
    ShieldCheck, Clock
} from "lucide-react";

const RoleBadge = ({ role }) => {
    const roleConfig = {
        trader: { label: "Thương nhân", color: "from-blue-500 to-indigo-500" },
        farmer: { label: "Nông dân", color: "from-green-500 to-emerald-500" },
        contentExpert: { label: "Chuyên gia nội dung", color: "from-purple-500 to-pink-500" },
        serviceProvider: { label: "Nhà cung cấp dịch vụ", color: "from-orange-500 to-red-500" },
    };
    const config = roleConfig[role] || { label: role, color: "from-gray-500 to-gray-600" };
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${config.color} text-white shadow-lg`}>
            <Crown size={14} strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-wide">{config.label}</span>
        </div>
    );
};

const InfoCard = ({ icon: Icon, label, value, accent = false }) => (
    <div className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${accent ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200 hover:border-emerald-300"}`}>
        <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${accent ? "bg-emerald-100" : "bg-emerald-50"}`}>
                <Icon size={20} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-base font-bold text-gray-900 truncate">{value || "—"}</p>
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

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric", month: "long", day: "numeric",
    });

const getDaysSinceJoined = (dateString) => {
    const joined = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - joined) / (1000 * 60 * 60 * 24));
    if (diff < 30) return `${diff} ngày`;
    if (diff < 365) return `${Math.floor(diff / 30)} tháng`;
    return `${Math.floor(diff / 365)} năm`;
};

const getRoleLabel = (role) => {
    const map = {
        farmer: "Nông dân",
        trader: "Thương nhân",
        contentExpert: "Chuyên gia",
        serviceProvider: "Nhà cung cấp",
    };
    return map[role] || "Thành viên";
};

export default function PublicProfileUI({ profileData, loading, onBack, onChat }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                    <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Không tìm thấy người dùng</p>
                    <button onClick={onBack} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">

            <button
                onClick={onBack}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group z-10"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Quay lại</span>
            </button>

            <div className="px-8 pt-8 pb-12 space-y-6">
                <div className="h-8" />

                <div className="relative bg-emerald-500 rounded-3xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={profileData.avatar || "/images/default-avatar.png"}
                                    alt={profileData.full_name}
                                    className="w-28 h-28 rounded-2xl border-4 border-white/30 object-cover shadow-xl"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
                                    <CheckCircle size={18} className="text-emerald-500" strokeWidth={2.5} />
                                </div>
                            </div>

                            <div className="text-white flex-1">
                                <h1 className="text-3xl font-bold mb-1 tracking-tight">{profileData.full_name}</h1>
                                <p className="text-emerald-100 text-sm mb-3 flex items-center gap-1.5">
                                    <Mail size={14} />
                                    {profileData.email}
                                </p>
                                <RoleBadge role={profileData.role} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <StatCard icon={Clock} value={getDaysSinceJoined(profileData.created_at)} label="Thành viên" />
                            <StatCard icon={ShieldCheck} value="Đã xác thực" label="Email" />
                            <StatCard icon={Star} value={getRoleLabel(profileData.role)} label="Vai trò" />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-emerald-600" strokeWidth={2.5} />
                        Thông tin cá nhân
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={User} label="Họ và tên" value={profileData.full_name} />
                        <InfoCard icon={Mail} label="Email" value={profileData.email} accent />
                        <InfoCard icon={Phone} label="Số điện thoại" value={profileData.phone} />
                        <InfoCard icon={Calendar} label="Ngày tham gia" value={formatDate(profileData.created_at)} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Muốn liên hệ với {profileData.full_name}?</h3>
                        <p className="text-sm text-gray-500">Gửi tin nhắn trực tiếp để trao đổi thêm</p>
                    </div>
                    <button
                        onClick={onChat}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-200 flex-shrink-0"
                    >
                        <MessageCircle size={18} strokeWidth={2.5} />
                        Nhắn tin
                    </button>
                </div>

            </div>
        </div>
    );
}
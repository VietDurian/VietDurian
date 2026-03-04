"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Ruler,
  Sprout,
  BookOpen,
  Plus,
  Hash,
  Tag,
  Navigation,
  CalendarDays,
  Clock,
  Copy,
  ExternalLink,
  TreePine,
} from "lucide-react";
import { useGardenStore } from "@/store/useGardenStore";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDatetime(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

export default function GardenDetails() {
  const params = useParams();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(null);

  const {
    gardenDetail,
    getGardenDetails,
    deleteGarden,
    isGardenDetailsLoading,
    isGardenDeleting,
  } = useGardenStore();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (!id) return;
    getGardenDetails(id);
  }, [id, getGardenDetails]);

  const garden = useMemo(() => {
    if (!gardenDetail?._id) return null;
    if (id && gardenDetail._id !== id) return null;
    return gardenDetail;
  }, [gardenDetail, id]);

  const cropTypes = useMemo(() => {
    if (!garden?.crop_type) return [];
    return Array.isArray(garden.crop_type)
      ? garden.crop_type
      : [garden.crop_type].filter(Boolean);
  }, [garden]);

  const lat = toNumber(garden?.latitude);
  const lng = toNumber(garden?.longitude);
  const area = toNumber(garden?.area);
  const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  const handleDelete = async () => {
    if (!garden?._id) return;
    await deleteGarden(garden._id);
    setShowDeleteModal(false);
    router.push("/profile/gardens");
  };

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  if (isGardenDetailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
          <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
          <span className="text-gray-700 font-medium">
            Đang tải chi tiết khu vườn...
          </span>
        </div>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy vườn
          </h2>
          <p className="text-gray-500 mb-5">
            Vườn này không tồn tại hoặc đã bị xóa.
          </p>
          <button
            onClick={() => router.push("/profile/gardens")}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Quay lại danh sách vườn
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isGardenDeleting && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
            <span className="text-gray-700 font-medium">
              Đang xóa khu vườn...
            </span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="relative h-72 md:h-96 bg-gray-800 overflow-hidden">
          <Image
            src={garden.image || "/images/Durian1.jpg"}
            alt={garden.name || "Garden image"}
            fill
            sizes="100vw"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/10" />

          <button
            onClick={() => router.push("/profile/gardens")}
            className="cursor-pointer absolute top-5 left-5 inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          <div className="absolute top-5 right-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-mono border border-white/10">
              <Hash className="w-3.5 h-3.5" />
              {garden.unit_code || "N/A"}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-3">
              {cropTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md font-semibold"
                >
                  <Tag className="w-3 h-3" />
                  {type}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              {garden.name}
            </h1>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{garden.location || "-"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Hash className="w-4 h-4 text-emerald-500" />
              <span className="font-mono text-gray-700">
                {garden.unit_code || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/profile/gardens/${id}/diaries`)}
                className="cursor-pointer inline-flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Nhật ký vườn
              </button>
              <button
                onClick={() =>
                  router.push(`/profile/gardens/${id}/diaries/create`)
                }
                className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Viết nhật ký
              </button>
              <button
                onClick={() => router.push(`/profile/gardens/${id}/edit`)}
                className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="cursor-pointer inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Diện tích
                </span>
                <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Ruler className="w-4 h-4 text-teal-600" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">
                {area.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">mét vuông (m²)</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Giống cây
                </span>
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <TreePine className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cropTypes.map((type) => (
                  <span
                    key={type}
                    className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-md font-semibold"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {cropTypes.length} giống
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Ngày tạo
                </span>
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(garden.created_at)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Đã đăng ký</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Cập nhật lần cuối
                </span>
                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(garden.updated_at)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Sửa đổi gần nhất</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  Mô tả vườn
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {garden.description || "Chưa có mô tả cho khu vườn này."}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-emerald-600" />
                    Bản đồ vị trí
                  </h2>
                </div>

                <div className="relative h-64 bg-linear-to-br from-emerald-50/80 to-teal-50/80">
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <defs>
                      <pattern
                        id="mapgrid"
                        width="32"
                        height="32"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 32 0 L 0 0 0 32"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mapgrid)" />
                  </svg>

                  <div className="absolute inset-0 flex flex-col justify-around opacity-10">
                    {[...Array(5)].map((_, index) => (
                      <div
                        key={index}
                        className="border-t border-emerald-400 w-full"
                      />
                    ))}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 mb-2 mx-auto">
                          <MapPin className="w-7 h-7 text-white" />
                        </div>
                        <div className="w-4 h-4 bg-emerald-600/30 rounded-full mx-auto -mt-1 blur-sm"></div>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white mt-3 inline-block">
                        <p className="font-semibold text-gray-900 text-sm">
                          {garden.name}
                        </p>
                        <p className="text-emerald-600 text-xs font-medium">
                          {garden.location || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  Tọa độ GPS
                </h2>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 font-medium">
                        Vĩ độ (Latitude)
                      </span>
                      <button
                        onClick={() => handleCopy(String(lat), "lat")}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Sao chép"
                      >
                        {copied === "lat" ? (
                          <span className="text-xs text-emerald-600 font-medium">
                            Đã chép!
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="font-mono font-bold text-gray-900 text-lg">
                      {lat.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 font-medium">
                        Kinh độ (Longitude)
                      </span>
                      <button
                        onClick={() => handleCopy(String(lng), "lng")}
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Sao chép"
                      >
                        {copied === "lng" ? (
                          <span className="text-xs text-emerald-600 font-medium">
                            Đã chép!
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="font-mono font-bold text-gray-900 text-lg">
                      {lng.toFixed(6)}
                    </p>
                  </div>
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Xem trên Google Maps
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-4">
                  Thông tin hệ thống
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Mã vườn</span>
                    <span className="font-mono text-gray-900 font-medium text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {garden.unit_code || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Ngày tạo</span>
                    <span className="text-gray-700 text-xs text-right">
                      {formatDatetime(garden.created_at)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 shrink-0">Cập nhật</span>
                    <span className="text-gray-700 text-xs text-right">
                      {formatDatetime(garden.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-gray-500 shrink-0">ID</span>
                    <span
                      className="font-mono text-gray-400 text-xs truncate max-w-30"
                      title={garden._id}
                    >
                      {garden._id ? `${garden._id.slice(-12)}...` : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Xóa vườn</h3>
                  <p className="text-sm text-gray-500">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 bg-gray-50 rounded-xl p-4 text-sm leading-relaxed">
                Bạn có chắc chắn muốn xóa vườn{" "}
                <strong className="text-gray-900">
                  &quot;{garden.name}&quot;
                </strong>
                ? Tất cả nhật ký canh tác liên quan cũng sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  Xóa vườn
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

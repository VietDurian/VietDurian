"use client";
import { useEffect, useState } from "react";

import {
  MapPin,
  Ruler,
  Sprout,
  ChevronLeft,
  Notebook,
  Pen,
  Trash,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useGardenStore } from "@/store/useGardenStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, useRouter } from "next/navigation";

export default function ProfileGardenDetail() {
  const { id } = useParams();
  const {
    getGardenDetails,
    gardenDetail,
    isGardenDetailsLoading,
    deleteGarden,
    isGardenDeleting,
  } = useGardenStore();
  const { authUser } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (authUser?._id) {
      getGardenDetails(id);
    }
  }, [authUser, getGardenDetails, id]);

  if (isGardenDetailsLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/40 mt-7 px-4 py-10">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Đang tải thông tin khu vườn...
        </div>
      </div>
    );
  }

  if (!gardenDetail) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/40 mt-7 px-4 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-gray-800 text-lg font-semibold mb-2">
            Không tìm thấy khu vườn
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Khu vườn có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <Link
            href="/profile/gardens"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 md:p-7 w-full max-w-md shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              Xác nhận xóa khu vườn
            </h2>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Nhập tên khu vườn <b>{gardenDetail?.name}</b> để xác nhận xóa.
            </p>

            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Nhập tên khu vườn..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mb-5 focus:ring-2 focus:ring-red-500 outline-none"
            />

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmName("");
                }}
                className="cursor-pointer px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>

              <button
                disabled={
                  confirmName !== gardenDetail?.name || isGardenDeleting
                }
                onClick={async () => {
                  await deleteGarden(id);
                  router.push("/profile/gardens");
                }}
                className={`cursor-pointer px-4 py-2.5 rounded-xl text-white font-medium transition-colors ${
                  confirmName === gardenDetail?.name
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                {isGardenDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30 mt-7 px-4 pb-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl shadow-xl px-6 md:px-8 py-7 md:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3 md:gap-4">
                <Link
                  href="/profile/gardens"
                  className="mt-0.5 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>

                <div>
                  <p className="text-emerald-100 text-sm mb-1">
                    Khu vườn của bạn
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight break-words">
                    {gardenDetail?.name}
                  </h1>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-emerald-50 text-sm">
                    <Sprout className="w-4 h-4" />
                    {gardenDetail?.crop_type || "Chưa cập nhật loại cây"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={`/profile/gardens/${id}/diaries`}
                  className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  <Notebook className="w-4 h-4" />
                  Nhật ký
                </Link>

                <Link
                  href={`/profile/gardens/${id}/edit`}
                  className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  <Pen className="w-4 h-4" />
                  Chỉnh sửa
                </Link>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="cursor-pointer inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                  <Trash className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-emerald-100 text-xs mb-1">Diện tích</p>
                <p className="text-white text-lg font-semibold">
                  {gardenDetail?.area || "-"} m²
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-emerald-100 text-xs mb-1">Vị trí</p>
                <p className="text-white text-sm font-medium line-clamp-2 min-h-[40px]">
                  {gardenDetail?.location || "Chưa cập nhật"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3">
                <p className="text-emerald-100 text-xs mb-1">Tọa độ</p>
                <p className="text-white text-sm font-medium">
                  {gardenDetail?.latitude || "-"},{" "}
                  {gardenDetail?.longitude || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-lg font-semibold text-gray-900">
                  Ảnh khu vườn
                </p>
              </div>

              {gardenDetail?.image ? (
                <img
                  src={gardenDetail.image}
                  alt={gardenDetail?.name || "Garden"}
                  className="w-full h-[340px] md:h-[420px] object-cover"
                />
              ) : (
                <div className="h-[340px] md:h-[420px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  Chưa có ảnh khu vườn
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Thông tin nhanh
              </h2>

              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-1">
                    <Sprout className="w-3.5 h-3.5" />
                    Loại cây
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {gardenDetail?.crop_type || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-700 mb-1">
                    <Ruler className="w-3.5 h-3.5" />
                    Diện tích
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {gardenDetail?.area || "-"} m²
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-purple-700 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Vị trí
                  </div>
                  <p className="text-gray-900 font-semibold text-sm leading-relaxed">
                    {gardenDetail?.location || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Thông tin mô tả
              </p>
              <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                {gardenDetail?.description || "Chưa có mô tả cho khu vườn này."}
              </p>
            </div>

            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-lg font-semibold text-gray-900 mb-4">Tọa độ</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Vĩ độ
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {gardenDetail?.latitude || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Kinh độ
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {gardenDetail?.longitude || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

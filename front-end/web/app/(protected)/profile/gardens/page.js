"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  MapPin,
  Ruler,
  Sprout,
  Search,
  ArrowRight,
  BookOpen,
  Tag,
  Hash,
  TreePine,
  X,
} from "lucide-react";
import { useGardenStore } from "@/store/useGardenStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function GardenDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authUser } = useAuthStore();
  const {
    gardens,
    getUserGardens,
    isGardensLoading,
    isGardenEditing,
    isGardenCreating,
  } = useGardenStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDiaryGuideOpen, setIsDiaryGuideOpen] = useState(false);

  useEffect(() => {
    if (authUser?._id) {
      getUserGardens(authUser._id);
    }
  }, [authUser, getUserGardens]);

  useEffect(() => {
    const shouldShowGuide = searchParams.get("diaryGuide") === "1";
    setIsDiaryGuideOpen(shouldShowGuide);
  }, [searchParams]);

  const myGardens = useMemo(() => gardens || [], [gardens]);

  const filteredGardens = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return myGardens;

    return myGardens.filter((garden) => {
      const cropTypes = Array.isArray(garden.crop_type)
        ? garden.crop_type
        : [garden.crop_type].filter(Boolean);
      const location = garden.location || "";
      const unitCode = garden.unit_code || "";

      return (
        (garden.name || "").toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        cropTypes.some((crop) => (crop || "").toLowerCase().includes(q)) ||
        unitCode.toLowerCase().includes(q)
      );
    });
  }, [myGardens, searchQuery]);

  const totalArea = useMemo(
    () =>
      myGardens.reduce((sum, garden) => sum + (Number(garden.area) || 0), 0),
    [myGardens],
  );

  const allVarieties = useMemo(() => {
    const types = myGardens.flatMap((garden) =>
      Array.isArray(garden.crop_type)
        ? garden.crop_type
        : [garden.crop_type].filter(Boolean),
    );
    return [...new Set(types)];
  }, [myGardens]);

  if (isGardensLoading) {
    return <div className="p-6">Loading gardens...</div>;
  }

  return (
    <>
      {(isGardenEditing || isGardenCreating) && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
            <span className="text-gray-700 font-medium">
              Đang cập nhật khu vườn...
            </span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
        {/* ── Sticky Header ───────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="mx-auto px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Vườn của tôi
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  Quản lý và theo dõi tất cả vườn sầu riêng của bạn
                </p>
              </div>
              <Link
                href="/profile/gardens/create"
                className="cursor-pointer flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Tạo vườn mới
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-linear-to-br from-emerald-50 to-emerald-100/60 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">
                      Tổng vườn
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 mt-0.5">
                      {myGardens.length}
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-emerald-200 rounded-xl flex items-center justify-center">
                    <TreePine className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>
              </div>
              <div className="bg-linear-to-br from-teal-50 to-teal-100/60 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-teal-700 font-medium">
                      Tổng diện tích
                    </p>
                    <p className="text-2xl font-bold text-teal-900 mt-0.5">
                      {totalArea.toLocaleString("vi-VN")} m²
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-teal-200 rounded-xl flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-teal-700" />
                  </div>
                </div>
              </div>
              <div className="bg-linear-to-br from-lime-50 to-lime-100/60 rounded-xl p-4 border border-lime-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-lime-700 font-medium">
                      Giống đang trồng
                    </p>
                    <p className="text-2xl font-bold text-lime-900 mt-0.5">
                      {allVarieties.length}
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-lime-200 rounded-xl flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-lime-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên vườn, vị trí, giống cây, mã vườn..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {filteredGardens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-28 h-28 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Sprout className="w-14 h-14 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery ? "Không tìm thấy vườn" : "Chưa có vườn nào"}
              </h2>
              <p className="text-gray-500 text-center max-w-md mb-8">
                {searchQuery
                  ? "Thử thay đổi từ khóa tìm kiếm của bạn"
                  : "Tạo vườn đầu tiên để bắt đầu ghi nhật ký canh tác minh bạch"}
              </p>
              {!searchQuery && (
                <Link
                  href="/profile/gardens/create"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Tạo vườn đầu tiên
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-5">
                Hiển thị{" "}
                <span className="font-semibold text-gray-700">
                  {filteredGardens.length}
                </span>{" "}
                vườn
                {searchQuery && ` cho "${searchQuery}"`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGardens.map((garden, index) => (
                  <div key={garden._id} className="relative">
                    <GardenCard garden={garden} />

                    {isDiaryGuideOpen && index === 0 && (
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 w-72 bg-white border border-emerald-200 rounded-xl shadow-xl p-3">
                        <button
                          type="button"
                          onClick={() => setIsDiaryGuideOpen(false)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Đóng hướng dẫn"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-sm text-gray-700 pr-5">
                          Để tạo nhật ký, hãy chọn một trong những khu vườn đã
                          tạo để bắt đầu.
                        </p>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r border-b border-emerald-200 rotate-45"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function GardenCard({ garden }) {
  const router = useRouter();
  const cropTypes = Array.isArray(garden.crop_type)
    ? garden.crop_type
    : [garden.crop_type].filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div
        className="relative h-44 overflow-hidden bg-gray-100 cursor-pointer shrink-0"
        onClick={() => router.push(`/profile/gardens/${garden._id}`)}
      >
        <img
          src={garden.image || "/images/Durian1.jpg"}
          alt={garden.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Unit code badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-mono">
            <Hash className="w-3 h-3" />
            {garden.unit_code || "N/A"}
          </span>
        </div>

        {/* Area badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md font-semibold">
            {(Number(garden.area) || 0).toLocaleString("vi-VN")} m²
          </span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold leading-tight drop-shadow-lg line-clamp-2">
            {garden.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Crop type badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cropTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100"
            >
              <Tag className="w-3 h-3" />
              {type}
            </span>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-3">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-xs line-clamp-1">{garden.location}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {garden.description || "Chưa có mô tả cho khu vườn này."}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => router.push(`/profile/gardens/${garden._id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-xs"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Chi tiết
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/gardens/${garden._id}/diaries`);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Nhật ký
          </button>
        </div>
      </div>
    </div>
  );
}

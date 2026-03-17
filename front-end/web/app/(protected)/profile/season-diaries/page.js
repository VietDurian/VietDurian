"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MapPin,
  Ruler,
  Sprout,
  Search,
  ArrowRight,
  BookOpen,
  Hash,
  Clock,
  CheckCircle2,
  Users,
  Layers,
  BarChart2,
  Trash2,
} from "lucide-react";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useAuthStore } from "@/store/useAuthStore";

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "In progressing": {
    label: "Đang canh tác",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: Clock,
  },
  Completed: {
    label: "Đã hoàn thành",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: CheckCircle2,
  },
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SeasonDiariesPage() {
  const router = useRouter();
  const { authUser } = useAuthStore();
  // TODO: thay bằng Zustand
  const { seasonDiaries, getSeasonDiaries, isSeasonDiariesLoading } =
    useSeasonDiaryStore();
  useEffect(() => {
    getSeasonDiaries(authUser?._id);
  }, [getSeasonDiaries]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const totalArea = useMemo(
    () => seasonDiaries.reduce((sum, d) => sum + (Number(d.area) || 0), 0),
    [seasonDiaries],
  );

  const inProgressCount = useMemo(
    () => seasonDiaries.filter((d) => d.status === "In progressing").length,
    [seasonDiaries],
  );

  const allVarieties = useMemo(() => {
    const varieties = seasonDiaries.flatMap((d) =>
      Array.isArray(d.crop_variety) ? d.crop_variety : [],
    );
    return [...new Set(varieties)];
  }, [seasonDiaries]);

  const filteredDiaries = useMemo(() => {
    let list = seasonDiaries;

    if (activeFilter === "in_progress")
      list = list.filter((d) => d.status === "In progressing");
    else if (activeFilter === "completed")
      list = list.filter((d) => d.status === "Completed");

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter((d) => {
      const varieties = Array.isArray(d.crop_variety) ? d.crop_variety : [];
      return (
        (d.garden_name || "").toLowerCase().includes(q) ||
        (d.location || "").toLowerCase().includes(q) ||
        (d.farmer_code || "").toLowerCase().includes(q) ||
        (d.planting_area_code || "").toLowerCase().includes(q) ||
        varieties.some((v) => v.toLowerCase().includes(q))
      );
    });
  }, [seasonDiaries, searchQuery, activeFilter]);

  const FILTER_TABS = [
    { key: "all", label: `Tất cả (${seasonDiaries.length})` },
    { key: "in_progress", label: `Đang canh tác (${inProgressCount})` },
    {
      key: "completed",
      label: `Đã hoàn thành (${seasonDiaries.length - inProgressCount})`,
    },
  ];

  if (isSeasonDiariesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
          Đang tải nhật ký...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* ── Sticky Header ─────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto px-6 py-5">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nhật ký mùa vụ
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Theo dõi toàn bộ nhật ký canh tác sầu riêng của bạn
              </p>
            </div>
            <button
              onClick={() => router.push("/profile/season-diaries/create")}
              className="cursor-pointer flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Tạo mùa vụ mới
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-700 font-medium">
                    Tổng nhật ký
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 mt-0.5">
                    {seasonDiaries.length}
                  </p>
                </div>
                <div className="w-11 h-11 bg-emerald-200 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100/60 rounded-xl p-4 border border-teal-200">
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

            <div className="bg-gradient-to-br from-lime-50 to-lime-100/60 rounded-xl p-4 border border-lime-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-lime-700 font-medium">
                    Đang canh tác
                  </p>
                  <p className="text-2xl font-bold text-lime-900 mt-0.5">
                    {inProgressCount}
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
              placeholder="Tìm theo tên vườn, địa điểm, giống cây, mã nhật ký..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeFilter === tab.key
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredDiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-28 h-28 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-14 h-14 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? "Không tìm thấy nhật ký" : "Chưa có nhật ký nào"}
            </h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              {searchQuery
                ? "Thử thay đổi từ khóa tìm kiếm của bạn"
                : "Tạo nhật ký đầu tiên để bắt đầu ghi lại hành trình canh tác"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push("/profile/season-diaries/create")}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Tạo nhật ký đầu tiên
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Hiển thị{" "}
              <span className="font-semibold text-gray-700">
                {filteredDiaries.length}
              </span>{" "}
              nhật ký
              {searchQuery && ` cho "${searchQuery}"`}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDiaries.map((diary) => (
                <SeasonDiaryCard key={diary._id} diary={diary} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Card component ────────────────────────────────────────────────────────────
function SeasonDiaryCard({ diary }) {
  const router = useRouter();
  const varieties = Array.isArray(diary.crop_variety) ? diary.crop_variety : [];

  const status = STATUS_CONFIG[diary.status] || STATUS_CONFIG["In progressing"];
  const StatusIcon = status.icon;

  const memberList = diary.members
    ? diary.members.split(",").map((m) => m.trim())
    : [];

  const handleDetail = () =>
    router.push(`/profile/season-diaries/${diary._id}`);

  const handlePages = (e) => {
    e.stopPropagation();
    router.push(`/profile/season-diaries/${diary._id}/diaries`);
  };

  const handleStats = (e) => {
    e.stopPropagation();
    router.push(`/profile/season-diaries/${diary._id}/statistics`);
  };

  // TODO: wire up delete store action
  const handleDelete = (e) => {
    e.stopPropagation();
    console.log("delete", diary._id);
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group flex flex-col">
      {/* Card header – colored band */}
      <div
        className="relative p-4 bg-gradient-to-br from-emerald-600 to-teal-700 cursor-pointer shrink-0"
        onClick={handleDetail}
      >
        {/* Planting area code */}
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-mono">
            <Hash className="w-3 h-3" />
            {diary.planting_area_code || "N/A"}
          </span>
          <span
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        {/* Garden name */}
        <h3 className="text-white font-bold text-base leading-tight line-clamp-2 drop-shadow mb-1">
          {diary.garden_name}
        </h3>

        {/* Farmer code */}
        <p className="text-emerald-200 text-xs font-mono">
          {diary.farmer_code}
        </p>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Crop varieties */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {varieties.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100"
            >
              <Sprout className="w-3 h-3" />
              {v}
            </span>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-xs line-clamp-1">{diary.location}</span>
        </div>

        {/* Farmer */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-2">
          <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-xs line-clamp-1">
            {diary.farmer_name}
            {memberList.length > 1 && (
              <span className="text-gray-400 ml-1">
                +{memberList.length - 1} thành viên
              </span>
            )}
          </span>
        </div>

        {/* Land use history */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {diary.land_use_history || "Chưa có thông tin lịch sử đất."}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100 mb-3">
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Diện tích</p>
            <p className="text-sm font-semibold text-gray-700">
              {(Number(diary.area) || 0).toLocaleString("vi-VN")} m²
            </p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Hàng luống</p>
            <p className="text-sm font-semibold text-gray-700">
              {diary.row_bed_count ?? "–"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDetail}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-xs"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            Chi tiết
          </button>
          <button
            onClick={handlePages}
            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-teal-600 text-teal-700 hover:bg-teal-600 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors text-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            Nhật ký
          </button>
          <button
            onClick={handleStats}
            className="inline-flex items-center justify-center border border-blue-400 text-blue-500 hover:bg-blue-500 hover:text-white w-8 h-8 rounded-lg transition-colors"
            title="Thống kê"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

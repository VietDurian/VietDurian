"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Plus,
  Sprout,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BadgeCheck,
  CircleDot,
  Ban,
  Weight,
  DollarSign,
} from "lucide-react";
import { useGardenStore } from "@/store/useGardenStore";
import { useDiaryStore } from "@/store/useDiaryStore";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getRelativeTime(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Hôm nay";
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
  return `${Math.floor(diffInDays / 365)} năm trước`;
}

const statusConfig = {
  "In progressing": {
    label: "Đang tiến hành",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    icon: CircleDot,
    dot: "bg-yellow-500",
  },
  Completed: {
    label: "Hoàn thành",
    className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    icon: BadgeCheck,
    dot: "bg-emerald-500",
  },
  Cancelled: {
    label: "Đã hủy",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: Ban,
    dot: "bg-gray-400",
  },
};

function getGardenIdFromDiary(diary) {
  if (!diary?.garden_id) return null;
  return typeof diary.garden_id === "object"
    ? diary.garden_id._id
    : diary.garden_id;
}

export default function GardenDiaries() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { gardenDetail, getGardenDetails, isGardenDetailsLoading } =
    useGardenStore();
  const { diaries, isDiariesLoading, getAllDiariesByGardenId } =
    useDiaryStore();

  useEffect(() => {
    if (!id) return;
    getGardenDetails(id);
    getAllDiariesByGardenId(id);
  }, [id, getGardenDetails, getAllDiariesByGardenId]);

  const garden = useMemo(() => {
    if (!gardenDetail?._id) return null;
    if (id && gardenDetail._id !== id) return null;
    return gardenDetail;
  }, [gardenDetail, id]);

  const gardenDiaries = useMemo(() => {
    if (!Array.isArray(diaries)) return [];

    return diaries
      .filter((diary) => getGardenIdFromDiary(diary) === id)
      .sort(
        (a, b) =>
          new Date(b.created_at || b.updated_at || 0).getTime() -
          new Date(a.created_at || a.updated_at || 0).getTime(),
      );
  }, [diaries, id]);

  if (isGardenDetailsLoading || isDiariesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
          <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
          <span className="text-gray-700 font-medium">Đang tải nhật ký...</span>
        </div>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy vườn
          </h2>
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

  const inProgress = gardenDiaries.filter(
    (d) => d.status === "In progressing",
  ).length;
  const completed = gardenDiaries.filter(
    (d) => d.status === "Completed",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ───────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push(`/profile/gardens/${id}`)}
            className="cursor-pointer inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại chi tiết vườn
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                {inProgress > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {inProgress}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Nhật ký canh tác
                </h1>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-emerald-700">
                    {garden.name}
                  </span>
                  {" · "}
                  <span>{gardenDiaries.length} nhật ký</span>
                </p>
              </div>
            </div>
            <Link
              href={`/profile/gardens/${id}/diaries/create`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo nhật ký
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {gardenDiaries.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="w-24 h-24 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 border-2 border-dashed border-emerald-200">
              <BookOpen className="w-12 h-12 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có nhật ký nào
            </h2>
            <p className="text-gray-500 text-center max-w-sm mb-8 text-sm leading-relaxed">
              Bắt đầu ghi chép vụ canh tác đầu tiên! Theo dõi từng giai đoạn,
              chi phí và sản lượng để minh bạch hoá quy trình.
            </p>
            <Link
              href={`/profile/gardens/${id}/diaries/create`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Tạo nhật ký đầu tiên
            </Link>
          </div>
        ) : (
          <>
            {/* Status overview */}
            {gardenDiaries.length > 0 && (
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-sm text-gray-500">
                  Tổng cộng{" "}
                  <span className="font-semibold text-gray-800">
                    {gardenDiaries.length}
                  </span>{" "}
                  nhật ký
                </span>
                {inProgress > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs px-2.5 py-1 rounded-full font-medium border border-yellow-200">
                    <CircleDot className="w-3 h-3" />
                    {inProgress} đang tiến hành
                  </span>
                )}
                {completed > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                    <BadgeCheck className="w-3 h-3" />
                    {completed} hoàn thành
                  </span>
                )}
              </div>
            )}

            {/* Diary list */}
            <div className="space-y-4">
              {gardenDiaries.map((diary) => (
                <DiaryCard key={diary._id} diary={diary} gardenId={id} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DiaryCard({ diary, gardenId }) {
  const router = useRouter();
  const status = statusConfig[diary.status] || statusConfig["In progressing"];
  const StatusIcon = status.icon;

  const totalCost = Number(diary.total_cost || 0);
  const totalRevenue = Number(diary.total_revenue || 0);
  const profit = Number(diary.profit || 0);
  const weightDurian = Number(diary.weight_durian || 0);
  const price = Number(diary.price || 0);

  const profitPositive = profit > 0;
  const profitNegative = profit < 0;

  return (
    <div
      onClick={() =>
        router.push(`/profile/gardens/${gardenId}/diaries/${diary._id}`)
      }
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer group overflow-hidden"
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${status.dot}`} />

      <div className="p-6 pb-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                {diary.title}
              </h3>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${status.className}`}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {diary.description}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        {/* Dates row */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Bắt đầu:{" "}
              <span className="text-gray-600">
                {formatDate(diary.start_date)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Kết thúc:{" "}
              <span className="text-gray-600">
                {formatDate(diary.end_date)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{getRelativeTime(diary.created_at)}</span>
          </div>
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          {/* Chi phí */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-red-400" />
              <p className="text-xs text-gray-400">Chi phí</p>
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {totalCost > 0 ? `${totalCost.toLocaleString("vi-VN")} ₫` : "—"}
            </p>
          </div>

          {/* Doanh thu */}
          <div className="text-center border-x border-gray-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <p className="text-xs text-gray-400">Doanh thu</p>
            </div>
            <p className="font-bold text-teal-700 text-sm">
              {totalRevenue > 0
                ? `${totalRevenue.toLocaleString("vi-VN")} ₫`
                : "—"}
            </p>
          </div>

          {/* Lợi nhuận */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {profitNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              ) : profitPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-gray-400" />
              )}
              <p className="text-xs text-gray-400">Lợi nhuận</p>
            </div>
            <p
              className={`font-bold text-sm ${
                profitPositive
                  ? "text-emerald-700"
                  : profitNegative
                    ? "text-red-600"
                    : "text-gray-400"
              }`}
            >
              {profit !== 0
                ? `${profit > 0 ? "+" : ""}${profit.toLocaleString("vi-VN")} ₫`
                : "—"}
            </p>
          </div>
        </div>

        {/* Weight row — only if has data */}
        {weightDurian > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <Weight className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-gray-500">
              Sản lượng:{" "}
              <span className="font-semibold text-gray-800">
                {weightDurian.toLocaleString("vi-VN")} kg
              </span>
            </span>
            {price > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">
                  Giá:{" "}
                  <span className="font-semibold text-gray-800">
                    {price.toLocaleString("vi-VN")} ₫/kg
                  </span>
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

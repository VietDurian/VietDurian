"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useLanguage } from "@/context/LanguageContext";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

function InfoCard({ title, iconPath, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3.5 h-3.5 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={iconPath}
            />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, fullWidth, children }) {
  return (
    <div className={`${fullWidth ? "col-span-2" : ""} flex flex-col gap-0.5`}>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      {children ? (
        <div>{children}</div>
      ) : (
        <p className="text-sm text-gray-800 font-medium leading-snug break-all">
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}

export default function SeasonDiaryDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { seasonDiaryId } = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinishSeasonDiary, setShowFinishSeasonDiary] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const seasonDiaryDetail = useSeasonDiaryStore((s) => s.seasonDiaryDetail);
  const isSeasonDiaryDetailLoading = useSeasonDiaryStore(
    (s) => s.isSeasonDiaryDetailLoading,
  );
  const isSeasonDiaryDeleting = useSeasonDiaryStore(
    (s) => s.isSeasonDiaryDeleting,
  );
  const isSeasonDiaryFinishing = useSeasonDiaryStore(
    (s) => s.isSeasonDiaryFinishing,
  );
  const getSeasonDiaryDetail = useSeasonDiaryStore(
    (s) => s.getSeasonDiaryDetail,
  );
  const deleteSeasonDiary = useSeasonDiaryStore((s) => s.deleteSeasonDiary);
  const finishSeasonDiary = useSeasonDiaryStore((s) => s.finishSeasonDiary);

  useEffect(() => {
    if (seasonDiaryId) getSeasonDiaryDetail(seasonDiaryId);
  }, [seasonDiaryId, getSeasonDiaryDetail]);

  const data = seasonDiaryDetail || {};
  const owner = data.user_id || {};
  const cropVariety = Array.isArray(data.crop_variety) ? data.crop_variety : [];
  const diaryName = (data.garden_name || "").trim();

  const STATUS = {
    "In progressing": {
      label: t("season_detail_status_in_progress"),
      dot: "bg-emerald-400",
      badge: "bg-emerald-100 text-emerald-700",
    },
    Completed: {
      label: t("season_detail_status_completed"),
      dot: "bg-gray-400",
      badge: "bg-gray-100 text-gray-500",
    },
  };

  const handleDelete = async () => {
    if (!seasonDiaryId) return;
    const deleted = await deleteSeasonDiary(seasonDiaryId);
    if (deleted) router.push("/profile/season-diaries");
  };

  const handleFinish = async () => {
    if (!seasonDiaryId) return;
    const finished = await finishSeasonDiary(seasonDiaryId);
    if (!finished) return;
    setShowFinishSeasonDiary(false);
  };

  if (isSeasonDiaryDetailLoading && !data._id) {
    return (
      <div className="p-5">
        <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!isSeasonDiaryDetailLoading && !data._id) {
    return (
      <div className="p-5 text-sm text-gray-500">
        {t("season_detail_not_found")}
      </div>
    );
  }

  const statusMeta = STATUS[data.status] ?? STATUS["Completed"];
  const isCompleted = data.status === "Completed";

  return (
    <div className="space-y-5 p-5">
      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="h-screen fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("season_detail_delete_modal_title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("season_detail_delete_modal_desc_prefix")}{" "}
              <b>{diaryName || t("season_detail_delete_modal_no_name")}</b>{" "}
              {t("season_detail_delete_modal_desc_suffix")}
            </p>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={t("season_detail_delete_modal_placeholder")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmName("");
                }}
                className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                {t("season_detail_delete_cancel")}
              </button>
              <button
                disabled={
                  confirmName.trim() !== diaryName || isSeasonDiaryDeleting
                }
                onClick={handleDelete}
                className={`cursor-pointer px-4 py-2 rounded-lg text-white ${confirmName.trim() === diaryName ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}
              >
                {isSeasonDiaryDeleting
                  ? t("season_detail_deleting")
                  : t("season_detail_delete_confirm_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Finish Modal ── */}
      {showFinishSeasonDiary && !isCompleted && (
        <div className="h-screen fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {t("season_detail_finish_modal_title")}
            </h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFinishSeasonDiary(false)}
                className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                {t("season_detail_finish_cancel")}
              </button>
              <button
                disabled={isSeasonDiaryFinishing}
                onClick={handleFinish}
                className="cursor-pointer px-4 py-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
              >
                {isSeasonDiaryFinishing
                  ? t("season_detail_finishing")
                  : t("season_detail_finish_confirm_btn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="bg-linear-to-r from-emerald-700 to-emerald-500 rounded-2xl px-6 py-5">
        <div className="flex items-start gap-4 flex-wrap">
          <img
            src={owner.avatar}
            alt={owner.full_name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 flex-shrink-0 bg-emerald-600"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                />
                {statusMeta.label}
              </span>
              <span className="bg-white/10 text-emerald-100 text-xs font-mono px-2.5 py-0.5 rounded-full">
                {data.farmer_code || "—"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">
              {data.garden_name}
            </h1>
            <p className="text-emerald-100 text-sm mt-0.5">{data.location}</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {!isCompleted && (
              <button
                onClick={() => setShowFinishSeasonDiary(true)}
                disabled={isSeasonDiaryDeleting || isSeasonDiaryFinishing}
                className="cursor-pointer flex items-center gap-1.5 border border-emerald-200 bg-white text-sm font-medium text-emerald-500 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check size={13} />
                {isSeasonDiaryFinishing
                  ? t("season_detail_marking")
                  : t("season_detail_mark_done_btn")}
              </button>
            )}
            {[
              {
                label: t("season_detail_area_label"),
                value: `${fmt(data.area)} ${t("season_detail_area_unit")}`,
              },
              {
                label: t("season_detail_row_label"),
                value: `${fmt(data.row_bed_count)} ${t("season_detail_row_unit")}`,
              },
            ].map((c) => (
              <div
                key={c.label}
                className="bg-white/15 rounded-xl px-4 py-3 text-center min-w-27.5"
              >
                <p className="text-emerald-100 text-xs">{c.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{c.value}</p>
              </div>
            ))}
            {!isCompleted && (
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isSeasonDiaryDeleting || isSeasonDiaryFinishing}
                className="cursor-pointer flex items-center gap-1.5 border border-red-200 bg-white text-sm font-medium text-red-500 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                {isSeasonDiaryDeleting
                  ? t("season_detail_deleting")
                  : t("season_detail_delete_btn")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1 — Chủ vườn & thành viên */}
        <InfoCard
          title={t("season_detail_card_owner_title")}
          iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
            <img
              src={owner.avatar}
              alt={owner.full_name}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-gray-100"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {owner.full_name || "—"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {owner.email || "—"}
              </p>
              <p className="text-xs text-gray-300 font-mono mt-0.5 truncate">
                {owner._id || "—"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow
              label={t("season_detail_farmer_name")}
              value={data.farmer_name}
            />
            <InfoRow
              label={t("season_detail_farmer_code")}
              value={data.farmer_code}
            />
            <InfoRow
              label={t("season_detail_members")}
              value={data.members}
              fullWidth
            />
          </div>
        </InfoCard>

        {/* Card 2 — Thông tin vườn */}
        <InfoCard
          title={t("season_detail_card_garden_title")}
          iconPath="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow
              label={t("season_detail_garden_name")}
              value={data.garden_name}
              fullWidth
            />
            <InfoRow
              label={t("season_detail_area")}
              value={`${fmt(data.area)} ${t("season_detail_area_unit")}`}
            />
            <InfoRow
              label={t("season_detail_rows")}
              value={`${fmt(data.row_bed_count)} ${t("season_detail_row_unit")}`}
            />
            <InfoRow
              label={t("season_detail_planting_code")}
              value={data.planting_area_code}
            />
            <InfoRow label={t("season_detail_status")}>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${statusMeta.badge}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                />
                {statusMeta.label}
              </span>
            </InfoRow>
            <InfoRow label={t("season_detail_variety")} fullWidth>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {cropVariety.map((v) => (
                  <span
                    key={v}
                    className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-lg"
                  >
                    {v}
                  </span>
                ))}
                {cropVariety.length === 0 && (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </div>
            </InfoRow>
          </div>
        </InfoCard>

        {/* Card 3 — Vị trí địa lý */}
        <InfoCard
          title={t("season_detail_card_location_title")}
          iconPath="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
            <InfoRow
              label={t("season_detail_address")}
              value={data.location}
              fullWidth
            />
            <InfoRow
              label={t("season_detail_longitude")}
              value={data.longitude}
            />
            <InfoRow
              label={t("season_detail_latitude")}
              value={data.latitude}
            />
          </div>
          <div className="bg-emerald-50 rounded-xl h-28 flex flex-col items-center justify-center gap-1.5 border border-emerald-100">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-xs text-emerald-500 font-medium font-mono">
              {data.latitude}, {data.longitude}
            </p>
            <p className="text-xs text-emerald-400">
              {t("season_detail_map_placeholder")}
            </p>
          </div>
        </InfoCard>

        {/* Card 4 — Lịch sử đất & timestamps */}
        <InfoCard
          title={t("season_detail_card_history_title")}
          iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        >
          <p className="text-sm text-gray-700 leading-relaxed mb-5">
            {data.land_use_history}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-gray-50">
            <InfoRow
              label={t("season_detail_created_at")}
              value={fmtDate(data.created_at)}
            />
            <InfoRow
              label={t("season_detail_updated_at")}
              value={fmtDate(data.updated_at)}
            />
            <InfoRow
              label={t("season_detail_diary_id")}
              value={data._id}
              fullWidth
            />
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Pause, Play, Trash2, X } from "lucide-react";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";
const parseCoordinate = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

function InfoCard({ title, iconPath, children, className }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
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
  const [showImageDetail, setShowImageDetail] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [failedSeasonImageUrl, setFailedSeasonImageUrl] = useState("");

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
  const isSeasonDiaryUpdating = useSeasonDiaryStore(
    (s) => s.isSeasonDiaryUpdating,
  );
  const getSeasonDiaryDetail = useSeasonDiaryStore(
    (s) => s.getSeasonDiaryDetail,
  );
  const deleteSeasonDiary = useSeasonDiaryStore((s) => s.deleteSeasonDiary);
  const finishSeasonDiary = useSeasonDiaryStore((s) => s.finishSeasonDiary);
  const updateSeasonDiary = useSeasonDiaryStore((s) => s.updateSeasonDiary);

  useEffect(() => {
    if (seasonDiaryId) getSeasonDiaryDetail(seasonDiaryId);
  }, [seasonDiaryId, getSeasonDiaryDetail]);

  useEffect(() => {
    if (!showImageDetail) return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") setShowImageDetail(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showImageDetail]);

  const data = seasonDiaryDetail || {};
  const owner = data.user_id || {};
  const cropVariety = Array.isArray(data.crop_variety) ? data.crop_variety : [];
  const seasonImageUrl =
    typeof data.image === "string" ? data.image.trim() : "";
  const hasSeasonImage =
    Boolean(seasonImageUrl) && failedSeasonImageUrl !== seasonImageUrl;
  const diaryName = (data.garden_name || "").trim();
  const latitude = parseCoordinate(data.latitude);
  const longitude = parseCoordinate(data.longitude);
  const hasCoordinates = latitude !== null && longitude !== null;
  const mapQuery = hasCoordinates
    ? `${latitude},${longitude}`
    : String(data.location || "").trim();
  const mapEmbedUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=18&t=k&hl=vi&output=embed`
    : "";
  const mapOpenUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : "";

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
    Stopped: {
      label: t("season_detail_status_stopped"),
      dot: "bg-amber-400",
      badge: "bg-amber-100 text-amber-700",
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

  const handleToggleStatus = async () => {
    if (!seasonDiaryId || isCompleted) return;

    const nextStatus = isStopped ? "In progressing" : "Stopped";
    await updateSeasonDiary(seasonDiaryId, { status: nextStatus });
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
  const isStopped = data.status === "Stopped";
  const isFinalStatus = isCompleted;
  const toggleStatusLabel = isStopped
    ? t("season_detail_toggle_to_in_progress")
    : t("season_detail_toggle_to_stopped");
  const toggleStatusLoadingLabel = isStopped
    ? t("season_detail_toggling_to_in_progress")
    : t("season_detail_toggling_to_stopped");

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
      {showFinishSeasonDiary && !isFinalStatus && (
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

      {/* ── Image Detail Modal ── */}
      {showImageDetail && hasSeasonImage && (
        <div
          className="fixed inset-0 z-1002 bg-black/80 backdrop-blur-xs p-4 md:p-8 h-full"
          onClick={() => setShowImageDetail(false)}
        >
          <div
            className="relative mx-auto h-full max-w-6xl bg-black/40 rounded-2xl border border-white/15 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setShowImageDetail(false)}
              className="cursor-pointer absolute right-3 top-3 z-10 rounded-lg bg-black/65 text-white text-xs px-3 py-1.5 hover:bg-black/80"
            >
              <X />
            </button>
            <div className="h-full w-full flex items-center justify-center p-3 md:p-5">
              <Image
                src={seasonImageUrl}
                alt={data.garden_name || "Season diary image"}
                width={1600}
                height={1200}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="bg-linear-to-r from-emerald-700 to-emerald-500 rounded-2xl px-6 py-5">
        <div className="flex items-start gap-4 flex-wrap">
          {/* Hero Banner avatar */}
          {owner?.avatar ? (
            <Image
              src={owner.avatar}
              alt={owner?.full_name || ""}
              width={96}
              height={96}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 shrink-0 bg-emerald-600"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-nowrap">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}
                />
                {statusMeta.label}
              </span>
              <span className="bg-white/10 text-emerald-100 text-xs font-mono px-2.5 py-0.5 rounded-full text-nowrap">
                {data.farmer_code || "—"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug text-nowrap">
              {data.garden_name}
            </h1>
            <p className="text-emerald-100 text-sm mt-0.5 text-nowrap">
              {data.location}
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-90 space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                  className="bg-white/15 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center"
                >
                  <p className="text-emerald-100 text-xs truncate">{c.label}</p>
                  <p className="text-white font-bold text-sm mt-0.5 truncate">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            {!isFinalStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={handleToggleStatus}
                  disabled={
                    isSeasonDiaryDeleting ||
                    isSeasonDiaryFinishing ||
                    isSeasonDiaryUpdating
                  }
                  className="cursor-pointer inline-flex w-full items-center justify-center gap-2 border border-amber-200 bg-white text-sm font-semibold text-amber-700 px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isStopped ? <Play size={14} /> : <Pause size={14} />}
                  {isSeasonDiaryUpdating
                    ? toggleStatusLoadingLabel
                    : toggleStatusLabel}
                </button>

                <button
                  onClick={() => setShowFinishSeasonDiary(true)}
                  disabled={
                    isSeasonDiaryDeleting ||
                    isSeasonDiaryFinishing ||
                    isSeasonDiaryUpdating ||
                    isStopped
                  }
                  className="cursor-pointer inline-flex w-full items-center justify-center gap-2 border border-emerald-200 bg-white text-sm font-semibold text-emerald-600 px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Check size={14} />
                  {isSeasonDiaryFinishing
                    ? t("season_detail_marking")
                    : t("season_detail_mark_done_btn")}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={
                    isSeasonDiaryDeleting ||
                    isSeasonDiaryFinishing ||
                    isSeasonDiaryUpdating ||
                    isStopped
                  }
                  className="cursor-pointer inline-flex w-full items-center justify-center gap-2 border border-red-200 bg-white text-sm font-semibold text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  {isSeasonDiaryDeleting
                    ? t("season_detail_deleting")
                    : t("season_detail_delete_btn")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 3 — Vị trí địa lý */}
        <InfoCard
          className={"col-span-4 row-end-1"}
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
          {mapEmbedUrl ? (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50">
                <iframe
                  title={`Google Maps - ${data.garden_name || "season-diary"}`}
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-56"
                />
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-emerald-600 font-medium font-mono">
                  {hasCoordinates
                    ? `${latitude}, ${longitude}`
                    : data.location || "—"}
                </p>
                <a
                  href={mapOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 underline underline-offset-2"
                >
                  Mo Google Maps
                </a>
              </div>
            </div>
          ) : (
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
          )}
        </InfoCard>
        {/* Card 1 — Chủ vườn & thành viên */}
        <InfoCard
          className={"col-span-2 row-end-3"}
          title={t("season_detail_card_owner_title")}
          iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
            {/* Card 1 owner avatar */}
            {owner?.avatar ? (
              <Image
                src={owner.avatar}
                alt={owner?.full_name || ""}
                width={96}
                height={96}
                className="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {owner?.full_name || "—"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {owner?.email || "—"}
              </p>
              <p className="text-xs text-gray-300 font-mono mt-0.5 truncate">
                {owner?._id || "—"}
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
          className={"col-span-4 row-end-2"}
          title={t("season_detail_card_garden_title")}
          iconPath="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        >
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="lg:w-64 lg:shrink-0">
              <div className="rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50 h-44 lg:h-full lg:min-h-64">
                {hasSeasonImage ? (
                  <button
                    type="button"
                    onClick={() => setShowImageDetail(true)}
                    className="group cursor-zoom-in relative h-full w-full"
                  >
                    <Image
                      src={seasonImageUrl}
                      alt={data.garden_name || "Season diary image"}
                      width={400}
                      height={320}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      onError={() => setFailedSeasonImageUrl(seasonImageUrl)}
                    />
                  </button>
                ) : (
                  <div className="h-full flex items-center justify-center bg-linear-to-br from-emerald-50 to-teal-50">
                    <svg
                      className="w-8 h-8 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.7}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
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
          </div>
        </InfoCard>

        {/* Card 4 — Lịch sử đất & timestamps */}
        <InfoCard
          className={"col-span-2 row-end-3"}
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

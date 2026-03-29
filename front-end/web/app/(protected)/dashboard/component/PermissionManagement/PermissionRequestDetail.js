"use client";

import React, { useEffect, useMemo, useState } from "react";
import { permissionAPI } from "@/lib/api";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";

const formatDate = (value, locale = "vi-VN") => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
};

const formatStatus = (value, isVi) => {
  const status = (value || "none").toLowerCase();
  const statusMap = {
    none: isVi ? "Chưa gửi" : "Not submitted",
    pending: isVi ? "Đang chờ duyệt" : "Pending",
    approved: isVi ? "Đã duyệt" : "Approved",
    rejected: isVi ? "Đã từ chối" : "Rejected",
  };

  return statusMap[status] || (isVi ? "Chưa gửi" : "Not submitted");
};

const getProofLabel = (proofType, index, isVi) => {
  const labels = {
    cccd_front: isVi ? "CCCD mặt trước" : "ID front side",
    cccd_back: isVi ? "CCCD mặt sau" : "ID back side",
    certificate: isVi ? "Chứng chỉ" : "Certificate",
    degree: isVi ? "Bằng cấp" : "Degree",
    other: isVi ? "Tài liệu khác" : "Other document",
  };

  return labels[proofType] || `${isVi ? "Tài liệu" : "Document"} ${index + 1}`;
};

const getProofBadgeClass = (proofType) => {
  const badgeMap = {
    cccd_front: "bg-blue-50 text-blue-700 ring-blue-200",
    cccd_back: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    certificate: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    degree: "bg-violet-50 text-violet-700 ring-violet-200",
    other: "bg-slate-50 text-slate-700 ring-slate-200",
  };

  return badgeMap[proofType] || "bg-slate-50 text-slate-700 ring-slate-200";
};

const isLikelyImage = (url = "") => {
  return (
    !/\.(pdf|doc|docx|xls|xlsx|txt|zip|rar)$/i.test(url) &&
    (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
      url.includes("cloudinary") ||
      url.includes("picsum") ||
      url.includes("imgur") ||
      url.includes("unsplash") ||
      url.includes("pexels") ||
      url.includes("res.cloudinary.com"))
  );
};

export default function PermissionRequestDetail({
  request,
  onClose,
  onUpdated,
  isLoading,
}) {
  const { language } = useLanguage();
  const isVi = language !== "en";
  const locale = isVi ? "vi-VN" : "en-US";

  const requestId =
    request?._id ||
    request?.id ||
    request?.data?._id ||
    request?.data?.id ||
    "";

  const normalizedStatus =
    request?.verify_cccd ||
    request?.status ||
    request?.data?.verify_cccd ||
    "none";

  const documentsToDisplay =
    request?.proofs ||
    request?.document ||
    request?.data?.proofs ||
    request?.data?.document ||
    [];

  const [submitting, setSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(normalizedStatus);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    setCurrentStatus(normalizedStatus);
    setShowRejectReason(false);
    setRejectReason("");
  }, [requestId, normalizedStatus]);

  const timeline = useMemo(
    () => [
      {
        label: isVi ? "Thời gian gửi yêu cầu" : "Request submitted",
        value: formatDate(request?.created_at, locale),
        accent: "bg-[#1a4d2e]",
      },
      {
        label:
          currentStatus === "none"
            ? isVi
              ? "Trạng thái hồ sơ"
              : "Profile status"
            :
          currentStatus === "pending"
            ? isVi
              ? "Trạng thái xử lý"
              : "Processing status"
            : isVi
              ? "Cập nhật lần cuối"
              : "Last updated",
        value:
          currentStatus === "none"
            ? isVi
              ? "Chưa gửi yêu cầu"
              : "Not submitted"
            :
          currentStatus === "pending"
            ? isVi
              ? "Đang chờ duyệt"
              : "Pending approval"
            : formatDate(request?.updated_at, locale),
        accent:
          currentStatus === "approved"
            ? "bg-emerald-500"
            : currentStatus === "rejected"
              ? "bg-rose-500"
              : currentStatus === "none"
                ? "bg-slate-400"
              : "bg-amber-500",
      },
    ],
    [request?.created_at, request?.updated_at, currentStatus, isVi, locale],
  );

  const statusTheme = {
    none: {
      card: "bg-gradient-to-br from-slate-100 via-white to-slate-200/70 border-slate-300/80",
      overlay: "from-slate-700/10 via-slate-500/5",
      badge: "bg-slate-200 text-slate-800 ring-slate-300/80",
      dot: "bg-slate-500",
      action:
        "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700",
    },
    pending: {
      card: "bg-gradient-to-br from-amber-50 via-white to-amber-100/70 border-amber-200/70",
      overlay: "from-amber-700/10 via-amber-500/5",
      badge: "bg-amber-100 text-amber-900 ring-amber-200/70",
      dot: "bg-amber-500",
      action:
        "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
    },
    approved: {
      card: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 border-emerald-200/70",
      overlay: "from-emerald-800/10 via-emerald-500/5",
      badge: "bg-emerald-100 text-emerald-900 ring-emerald-200/70",
      dot: "bg-emerald-500",
      action:
        "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
    },
    rejected: {
      card: "bg-gradient-to-br from-rose-50 via-white to-rose-100/70 border-rose-200/70",
      overlay: "from-rose-800/10 via-rose-500/5",
      badge: "bg-rose-100 text-rose-900 ring-rose-200/70",
      dot: "bg-rose-500",
      action:
        "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800",
    },
  };

  const theme = statusTheme[currentStatus] || statusTheme.none;

  const renderDocuments = (doc) => {
    if (!doc || (Array.isArray(doc) && doc.length === 0)) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <svg
              className="h-6 w-6 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500">
            {isVi ? "Chưa có tài liệu nào được tải lên" : "No documents uploaded yet"}
          </p>
        </div>
      );
    }

    const files = Array.isArray(doc) ? doc : [doc];

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {files.map((file, idx) => {
          const fileUrl = typeof file === "string" ? file : file?.url;
          const proofType = typeof file === "object" ? file?.type : null;
          const uploadedAt = typeof file === "object" ? file?.uploadedAt : null;

          if (!fileUrl) return null;

          const label = getProofLabel(proofType, idx, isVi);
          const isImage = isLikelyImage(fileUrl);
          const imageFailed = failedImages.has(fileUrl);

          return (
            <div
              key={`${fileUrl}-${idx}`}
              className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,23,42,0.10)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getProofBadgeClass(
                    proofType,
                  )}`}
                >
                  {label}
                </span>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100"
                >
                  {isVi ? "Mở" : "Open"}
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17 17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </a>
              </div>

              <div className="relative">
                {isImage && !imageFailed ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden bg-slate-100"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={fileUrl}
                        alt={label}
                        width={800}
                        height={600}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        unoptimized
                        onError={() => {
                          setFailedImages((prev) => new Set([...prev, fileUrl]));
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </a>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-center"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                        <svg
                          className="h-7 w-7 text-slate-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        {label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {isVi ? "Nhấn để xem tài liệu" : "Click to view document"}
                      </p>
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2 px-4 py-4">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {label}
                </p>
                <p className="text-xs text-slate-500">
                  {uploadedAt
                    ? `${isVi ? "Tải lên" : "Uploaded"}: ${formatDate(uploadedAt, locale)}`
                    : isVi
                      ? "Tài liệu xác minh"
                      : "Verification document"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center py-16">
        <span className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-600" />
        <span className="text-lg font-semibold text-emerald-700">
          {isVi ? "Đang tải chi tiết..." : "Loading details..."}
        </span>
      </div>
    );
  }

  if (!request) return null;

  const {
    user_name,
    email,
    phone,
    avatar,
    role,
    description,
    rejection_reason,
    reason,
    created_at,
    updated_at,
  } = request;

  const displayedReason = rejection_reason || reason || "";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div
        className={`relative overflow-hidden rounded-[32px] border shadow-[0_20px_70px_rgba(15,23,42,0.08)] ${theme.card}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.overlay} to-transparent opacity-90`}
        />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/90 text-slate-600 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
          aria-label={isVi ? "Đóng" : "Close"}
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto shrink-0 sm:mx-0">
                  <div className="h-24 w-24 rounded-[28px] border border-white/70 bg-white/90 p-1.5 shadow-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                    <Image
                      src={avatar || "/avatar-placeholder.png"}
                      alt={isVi ? "Ảnh đại diện" : "Avatar"}
                      width={128}
                      height={128}
                      className="h-full w-full rounded-[22px] object-cover"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {user_name || (isVi ? "Người dùng" : "User")}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                        {isVi
                          ? "Hồ sơ xác minh CCCD và tài liệu liên quan"
                          : "ID verification profile and related documents"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${theme.badge}`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                        {formatStatus(currentStatus, isVi)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                    <div className="min-w-0 rounded-2xl bg-white/85 px-4 py-4 shadow-sm ring-1 ring-white/70 backdrop-blur">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Email
                      </div>
                      <div className="mt-1 break-all text-sm font-semibold leading-6 text-slate-900">
                        {email || "—"}
                      </div>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-white/85 px-4 py-4 shadow-sm ring-1 ring-white/70 backdrop-blur">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {isVi ? "Số điện thoại" : "Phone"}
                      </div>
                      <div className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
                        {phone || (isVi ? "Chưa có số điện thoại" : "No phone number")}
                      </div>
                    </div>

                    <div className="min-w-0 rounded-2xl bg-white/85 px-4 py-4 shadow-sm ring-1 ring-white/70 backdrop-blur md:col-span-2 2xl:col-span-1">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {isVi ? "Vai trò" : "Role"}
                      </div>
                      <div className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
                        {role || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {currentStatus === "pending" && (
              <div className="flex h-fit flex-col justify-between gap-4 rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur xl:min-h-[220px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {isVi ? "Hành động xử lý" : "Review actions"}
                  </p>
                  <h3 className="mt-2 text-base font-bold text-slate-900">
                    {isVi ? "Duyệt hoặc từ chối hồ sơ" : "Approve or reject this request"}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {isVi
                      ? "Kiểm tra thông tin và đưa ra quyết định xử lý hồ sơ."
                      : "Review the provided information and take action on the request."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    disabled={submitting}
                    onClick={async () => {
                      try {
                        setSubmitting(true);
                        const res =
                          await permissionAPI.approvePermissionRequest(requestId);
                        setCurrentStatus("approved");
                        onUpdated?.({
                          id: requestId,
                          verify_cccd: "approved",
                          raw: res?.data,
                        });
                      } catch (e) {
                        console.error("Approve failed:", e?.response?.data || e);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${theme.action}`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {isVi ? "Duyệt hồ sơ" : "Approve request"}
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => setShowRejectReason((v) => !v)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3.5 text-sm font-bold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {isVi ? "Từ chối" : "Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectReason && currentStatus === "pending" && (
        <div className="rounded-[28px] border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-rose-900">
                {isVi ? "Lý do từ chối hồ sơ" : "Reason for rejection"}
              </h3>
              <p className="mt-1 text-sm text-rose-700">
                {isVi
                  ? "Hãy cung cấp lý do rõ ràng để người dùng có thể chỉnh sửa và gửi lại."
                  : "Please provide a clear reason so the user can revise and resubmit."}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-100">
              {isVi ? "Khuyến nghị nên nhập" : "Recommended to fill"}
            </span>
          </div>

          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-4 w-full rounded-3xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
            placeholder={
              isVi
                ? "Ví dụ: Ảnh CCCD bị mờ, thiếu mặt sau, chứng chỉ chưa hợp lệ..."
                : "Example: ID image is blurry, missing back side, invalid certificate..."
            }
          />

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button
              disabled={submitting}
              onClick={() => setShowRejectReason(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isVi ? "Hủy" : "Cancel"}
            </button>

            <button
              disabled={submitting}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  const res = await permissionAPI.rejectPermissionRequest(
                    requestId,
                    rejectReason,
                  );
                  setCurrentStatus("rejected");
                  onUpdated?.({
                    id: requestId,
                    verify_cccd: "rejected",
                    raw: res?.data,
                  });
                  setShowRejectReason(false);
                } catch (e) {
                  console.error("Reject failed:", e?.response?.data || e);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50"
            >
              {isVi ? "Xác nhận từ chối" : "Confirm rejection"}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              {isVi ? "Thông tin mô tả" : "Description"}
            </h3>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              {isVi ? "Tóm tắt" : "Summary"}
            </span>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50/80 px-4 py-4 ring-1 ring-slate-100">
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
              {description || (isVi ? "Không có mô tả được cung cấp." : "No description provided.")}
            </p>
          </div>

          {(currentStatus === "rejected" || displayedReason) && (
            <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4">
              <div className="text-sm font-bold text-rose-900">{isVi ? "Lý do" : "Reason"}</div>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-rose-700">
                {displayedReason || (isVi ? "Hồ sơ đã bị từ chối." : "The request has been rejected.")}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{isVi ? "Mốc thời gian" : "Timeline"}</h3>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              {isVi ? "Dòng thời gian" : "Timeline"}
            </span>
          </div>

          <ul className="mt-5 space-y-5">
            {timeline.map((event, index) => (
              <li key={event.label} className="flex items-start gap-4">
                <div className="relative flex flex-col items-center">
                  <span className={`mt-1 h-3 w-3 rounded-full ${event.accent}`} />
                  {index !== timeline.length - 1 && (
                    <span className="mt-1 h-12 w-px bg-slate-200" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {event.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {event.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {isVi ? "Ngày tạo" : "Created"}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(created_at, locale)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {isVi ? "Cập nhật" : "Updated"}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(updated_at, locale)}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isVi ? "Tài liệu xác minh CCCD" : "ID Verification Documents"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isVi
                ? "Hiển thị từng loại tài liệu rõ ràng, có thể bấm để xem kích thước lớn."
                : "Each document type is displayed clearly and can be opened in larger view."}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {isVi ? "Bảo mật" : "Confidential"}
          </span>
        </div>

        <div className="mt-5">{renderDocuments(documentsToDisplay)}</div>
      </section>
    </div>
  );
}

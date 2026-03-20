"use client";

import React, { useEffect, useMemo, useState } from "react";
import { permissionAPI } from "@/lib/api";

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "—";
    }
};

const formatStatus = (value) => {
    if (!value) return "Pending";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const getProofLabel = (proofType, index) => {
    const labels = {
        cccd_front: "CCCD mặt trước",
        cccd_back: "CCCD mặt sau",
        certificate: "Chứng chỉ",
        degree: "Bằng cấp",
        other: "Tài liệu khác",
    };

    return labels[proofType] || `Tài liệu ${index + 1}`;
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
    const requestId = request?._id || request?.id || request?.data?._id || request?.data?.id || "";
    console.log("Rendering PermissionRequestDetail with requestId:", requestId);
    const normalizedStatus =
        request?.verify_cccd || request?.status || request?.data?.verify_cccd || "pending";
    const documentsToDisplay =
        request?.proofs || request?.document || request?.data?.proofs || request?.data?.document || [];

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
                label: "Thời gian gửi yêu cầu",
                value: formatDate(request?.created_at),
                accent: "bg-[#1a4d2e]",
            },
            {
                label: currentStatus === "pending" ? "Trạng thái xử lý" : "Cập nhật lần cuối",
                value:
                    currentStatus === "pending"
                        ? "Đang chờ duyệt"
                        : formatDate(request?.updated_at),
                accent:
                    currentStatus === "approved"
                        ? "bg-emerald-500"
                        : currentStatus === "rejected"
                            ? "bg-rose-500"
                            : "bg-amber-500",
            },
        ],
        [request?.created_at, request?.updated_at, currentStatus]
    );

    const statusTheme = {
        pending: {
            card: "bg-gradient-to-br from-amber-50 via-white to-amber-100/70 border-amber-200/70",
            overlay: "from-amber-700/15 via-amber-500/5",
            badge: "bg-amber-100 text-amber-900 ring-amber-200/70",
            dot: "bg-amber-500",
            action:
                "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
        },
        approved: {
            card: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 border-emerald-200/70",
            overlay: "from-emerald-800/15 via-emerald-500/5",
            badge: "bg-emerald-100 text-emerald-900 ring-emerald-200/70",
            dot: "bg-emerald-500",
            action:
                "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
        },
        rejected: {
            card: "bg-gradient-to-br from-rose-50 via-white to-rose-100/70 border-rose-200/70",
            overlay: "from-rose-800/15 via-rose-500/5",
            badge: "bg-rose-100 text-rose-900 ring-rose-200/70",
            dot: "bg-rose-500",
            action:
                "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800",
        },
    };

    const theme = statusTheme[currentStatus] || statusTheme.pending;

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
                        Chưa có tài liệu nào được tải lên
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

                    const label = getProofLabel(proofType, idx);
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
                                        proofType
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
                                    Mở
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
                                            <img
                                                src={fileUrl}
                                                alt={label}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                                crossOrigin="anonymous"
                                                onError={(e) => {
                                                    if (!e.target.src.includes("cors-anywhere")) {
                                                        e.target.src = `https://cors-anywhere.herokuapp.com/${fileUrl}`;
                                                        return;
                                                    }
                                                    if (!e.target.src.includes("api.allorigins")) {
                                                        e.target.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(
                                                            fileUrl
                                                        )}`;
                                                        return;
                                                    }
                                                    setFailedImages((prev) => new Set([...prev, fileUrl]));
                                                    e.target.style.display = "none";
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
                                            <p className="mt-3 text-sm font-semibold text-slate-700">{label}</p>
                                            <p className="mt-1 text-xs text-slate-500">Nhấn để xem tài liệu</p>
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 px-4 py-4">
                                <p className="line-clamp-1 text-sm font-semibold text-slate-900">{label}</p>
                                <p className="text-xs text-slate-500">
                                    {uploadedAt ? `Tải lên: ${formatDate(uploadedAt)}` : "Tài liệu xác minh"}
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
                <span className="inline-block h-10 w-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-600 animate-spin mb-4" />
                <span className="text-emerald-700 font-semibold text-lg">Đang tải chi tiết...</span>
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
        requestRole,
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
                className={`relative overflow-hidden rounded-[32px] border p-0 shadow-[0_20px_70px_rgba(15,23,42,0.08)] ${theme.card}`}
            >
                <div
                    className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${theme.overlay} to-transparent opacity-80`}
                />

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-600 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                    aria-label="Close"
                >
                    <span className="text-xl leading-none">×</span>
                </button>

                <div className="relative z-10 p-5 sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="shrink-0">
                                <div className="h-28 w-28 rounded-[28px] border border-white/70 bg-white/80 p-1.5 shadow-lg sm:h-32 sm:w-32">
                                    <img
                                        src={avatar || "/avatar-placeholder.png"}
                                        alt="avatar"
                                        className="h-full w-full rounded-[22px] object-cover"
                                    />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1 space-y-4">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
                                    <div className="min-w-0">
                                        <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                            {user_name || "Người dùng"}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Hồ sơ xác minh CCCD và tài liệu liên quan
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${theme.badge}`}
                                        >
                                            <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                                            {formatStatus(currentStatus)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl bg-white/75 px-4 py-3 shadow-sm ring-1 ring-white/70 backdrop-blur">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                            Email
                                        </div>
                                        <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                                            {email || "—"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/75 px-4 py-3 shadow-sm ring-1 ring-white/70 backdrop-blur">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                            Phone
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            {phone || "No phone number"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/75 px-4 py-3 shadow-sm ring-1 ring-white/70 backdrop-blur">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                            Vai trò
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-slate-900">
                                            {role || "—"}
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>

                        {currentStatus === "pending" && (
                            <div className="flex shrink-0 flex-col gap-3 lg:w-[220px]">
                                <button
                                    disabled={submitting}
                                    onClick={async () => {
                                        try {
                                            setSubmitting(true);
                                            const res = await permissionAPI.approvePermissionRequest(requestId);
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
                                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${theme.action}`}
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
                                    Duyệt hồ sơ
                                </button>

                                <button
                                    disabled={submitting}
                                    onClick={() => setShowRejectReason((v) => !v)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    Từ chối
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showRejectReason && currentStatus === "pending" && (
                <div className="rounded-[28px] border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-base font-bold text-rose-900">Lý do từ chối hồ sơ</h3>
                            <p className="mt-1 text-sm text-rose-700">
                                Hãy cung cấp lý do rõ ràng để người dùng có thể chỉnh sửa và gửi lại.
                            </p>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-100">
                            Khuyến nghị nên nhập
                        </span>
                    </div>

                    <textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="mt-4 w-full rounded-3xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                        placeholder="Ví dụ: Ảnh CCCD bị mờ, thiếu mặt sau, chứng chỉ chưa hợp lệ..."
                    />

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                        <button
                            disabled={submitting}
                            onClick={() => setShowRejectReason(false)}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>

                        <button
                            disabled={submitting}
                            onClick={async () => {
                                try {
                                    setSubmitting(true);
                                    const res = await permissionAPI.rejectPermissionRequest(
                                        requestId,
                                        rejectReason
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
                            Xác nhận từ chối
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Thông tin mô tả</h3>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                            Summary
                        </span>
                    </div>

                    <div className="mt-4 rounded-3xl bg-slate-50/80 px-4 py-4 ring-1 ring-slate-100">
                        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                            {description || "Không có mô tả được cung cấp."}
                        </p>
                    </div>

                    {(currentStatus === "rejected" || displayedReason) && (
                        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4">
                            <div className="text-sm font-bold text-rose-900">Lý do</div>
                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-rose-700">
                                {displayedReason || "Hồ sơ đã bị từ chối."}
                            </p>
                        </div>
                    )}
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Mốc thời gian</h3>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                            Timeline
                        </span>
                    </div>

                    <ul className="mt-5 space-y-5">
                        {timeline.map((event) => (
                            <li key={event.label} className="flex items-start gap-4">
                                <div className="relative flex flex-col items-center">
                                    <span className={`mt-1 h-3 w-3 rounded-full ${event.accent}`} />
                                    <span className="mt-1 h-12 w-px bg-slate-200 last:hidden" />
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
                                Created
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                                {formatDate(created_at)}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                Updated
                            </div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">
                                {formatDate(updated_at)}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Tài liệu xác minh CCCD</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Hiển thị từng loại tài liệu rõ ràng, có thể bấm để xem kích thước lớn.
                        </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                        Confidential
                    </span>
                </div>

                <div className="mt-5">{renderDocuments(documentsToDisplay)}</div>
            </section>
        </div>
    );
}
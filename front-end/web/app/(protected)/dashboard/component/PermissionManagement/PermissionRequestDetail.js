"use client"

import React, { useMemo, useState } from 'react'
import { permissionAPI } from '@/lib/api'

const formatDate = (value) => {
    if (!value) return '—'
    try {
        return new Date(value).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    } catch (error) {
        return '—'
    }
}

const formatStatus = (value) => {
    if (!value) return 'Pending'
    return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function PermissionRequestDetail({ request, onClose, onUpdated }) {
    if (!request) return null

    const {
        id,
        user_name,
        email,
        phone,
        avatar,
        role,
        requestRole,
        description,
        document,
        proofs,
        status,
        created_at,
        updated_at
    } = request

    // Use proofs if available (new format), otherwise fall back to document (old format)
    const documentsToDisplay = proofs || document

    const [submitting, setSubmitting] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)
    const [showRejectReason, setShowRejectReason] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [failedImages, setFailedImages] = useState(new Set())

    const timeline = useMemo(() => ([
        {
            label: 'Request submitted',
            value: formatDate(created_at),
            accent: 'bg-[#1a4d2e]'
        },
        {
            label: currentStatus === 'pending' ? 'Awaiting action' : 'Last updated',
            value: currentStatus === 'pending' ? 'In progress' : formatDate(updated_at),
            accent: 'bg-gray-400'
        }
    ]), [created_at, currentStatus, updated_at])

    const renderDocuments = (doc) => {
        if (!doc || (Array.isArray(doc) && doc.length === 0)) {
            return <span className="text-gray-400">No document provided</span>
        }

        const files = Array.isArray(doc) ? doc : [doc]

        // Debug: log files to see what we're receiving
        console.log('Files received:', files)

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-3 gap-3">
                {files.map((file, idx) => {
                    // Handle both old string format and new proof object format
                    const fileUrl = typeof file === 'string' ? file : file?.url
                    const proofType = typeof file === 'object' ? file?.type : null
                    const uploadedAt = typeof file === 'object' ? file?.uploadedAt : null

                    if (!fileUrl) return null

                    const isImage = !/\.(pdf|doc|docx|xls|xlsx|txt|zip|rar)$/i.test(fileUrl) &&
                        (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUrl) ||
                            fileUrl.includes('cloudinary') ||
                            fileUrl.includes('picsum') ||
                            fileUrl.includes('imgur') ||
                            fileUrl.includes('unsplash') ||
                            fileUrl.includes('pexels') ||
                            fileUrl.includes('res.cloudinary.com'))
                    const proofLabel = proofType ? {
                        'cccd_front': 'CCCD Front',
                        'cccd_back': 'CCCD Back',
                        'certificate': 'Certificate',
                        'degree': 'Degree',
                        'other': 'Other Document'
                    }[proofType] : `Document ${idx + 1}`

                    return (
                        <div
                            key={`${fileUrl}-${idx}`}
                            className="group relative rounded-2xl border border-gray-100 overflow-hidden shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg aspect-square"
                        >
                            {/* Image - Display directly and prominently */}
                            {isImage ? (
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="relative block w-full h-full bg-gray-100 overflow-hidden"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={fileUrl}
                                        alt={proofLabel}
                                        className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                            console.error('Image failed to load:', fileUrl)
                                            // Try first CORS proxy
                                            if (!e.target.src.includes('cors-anywhere')) {
                                                const corsUrl = `https://cors-anywhere.herokuapp.com/${fileUrl}`
                                                e.target.src = corsUrl
                                                return
                                            }
                                            // Try second CORS proxy
                                            if (!e.target.src.includes('api.allorigins')) {
                                                const corsUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(fileUrl)}`
                                                e.target.src = corsUrl2
                                                return
                                            }
                                            // If all fail, hide image
                                            setFailedImages(prev => new Set([...prev, fileUrl]))
                                            e.target.style.display = 'none'
                                        }}
                                    />
                                    {/* Label overlay on image */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-4 py-3">
                                        <div className="text-sm font-semibold text-white">{proofLabel}</div>
                                    </div>
                                </a>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-center hover:opacity-75 transition"
                                    >
                                        <div className="text-xs font-semibold text-gray-900">{proofLabel}</div>
                                        <div className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
                                            View
                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }
    const statusTheme = {
        pending: {
            card: "bg-amber-50 border-amber-200/60",
            overlay: "from-amber-900/30 via-amber-700/10",
            badge: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/60",
        },
        approved: {
            card: "bg-emerald-50 border-emerald-200/60",
            overlay: "from-emerald-900/30 via-emerald-700/10",
            badge: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/60",
        },
        rejected: {
            card: "bg-rose-50 border-rose-200/60",
            overlay: "from-rose-900/30 via-rose-700/10",
            badge: "bg-rose-100 text-rose-900 ring-1 ring-rose-200/60",
        },
    };

    const theme = statusTheme[currentStatus] || statusTheme.pending;

    return (
        <div className="w-full max-w-4xl space-y-6">
            <div className={`relative overflow-hidden rounded-3xl border shadow-xl ${theme.card}`}>
                {/* overlay đừng bắt click */}
                <div
                    className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${theme.overlay} to-transparent opacity-25`}
                />

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-gray-600 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                    aria-label="Close"
                >
                    <span className="text-xl leading-none">×</span>
                </button>

                {/* HEADER ngang */}
                <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:gap-6">
                    {/* Avatar */}
                    <div className="shrink-0">
                        <div className="h-28 w-28 md:h-32 md:w-32 rounded-full border border-white/40 bg-white/70 p-1 shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={avatar || "/avatar-placeholder.png"}
                                alt="avatar"
                                className="h-full w-full rounded-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="truncate text-2xl md:text-3xl font-semibold text-gray-900">
                                {user_name}
                            </h2>

                            <span className="inline-flex items-center rounded-full bg-gray-900/5 px-3 py-1 text-sm font-semibold text-gray-700">
                                Status: <span className="ml-1 text-gray-900">{formatStatus(currentStatus)}</span>
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm ring-1 ring-white/50">
                                {/* mail icon */}
                                <svg className="h-4 w-4 text-[#1a4d2e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 6 12 13 2 6" />
                                    <line x1="2" y1="19" x2="22" y2="19" />
                                    <line x1="12" y1="13" x2="12" y2="19" />
                                </svg>
                                {email}
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 shadow-sm ring-1 ring-white/50">
                                {/* phone icon */}
                                <svg className="h-4 w-4 text-[#1a4d2e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2c-3.13-.35-6-1.86-8.22-4.08a19.79 19.79 0 0 1-4.08-8.22A2 2 0 0 1 9.46 7h3" />
                                </svg>
                                {phone || "No phone number"}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <span className="inline-flex items-center gap-1 rounded-2xl bg-gray-900/5 px-4 py-1 text-sm font-medium text-gray-700">
                                Current role: <strong className="font-semibold text-gray-900">{role}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-2xl bg-[#1a4d2e]/10 px-4 py-1 text-sm font-medium text-[#1a4d2e]">
                                Requested role: <strong className="font-semibold text-[#1a4d2e]">{requestRole}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 md:self-end md:mt-auto">

                        {currentStatus === "pending" && (
                            <div className="flex w-40 flex-col gap-3 ">
                                <button
                                    disabled={submitting}
                                    onClick={async () => {
                                        try {
                                            setSubmitting(true)
                                            const res = await permissionAPI.approvePermissionRequest(id)
                                            setCurrentStatus("approved")
                                            if (onUpdated) onUpdated({ id, status: "approved", raw: res?.data })
                                        } catch (e) {
                                            console.error("Approve failed:", e)
                                        } finally {
                                            setSubmitting(false)
                                        }
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#195437] to-[#0d2b18] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0f3b25]/40 transition hover:-translate-y-0.5 hover:from-[#1f6843] hover:to-[#114028] disabled:opacity-50"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Approve
                                </button>

                                <button
                                    disabled={submitting}
                                    onClick={() => setShowRejectReason((v) => !v)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 disabled:opacity-50"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showRejectReason && currentStatus === 'pending' && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-rose-900">Provide context before rejecting</p>
                            <p className="text-sm text-rose-700">Your note helps the requester understand the next steps.</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-500 ring-1 ring-rose-100">Optional</span>
                    </div>
                    <textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="mt-4 w-full rounded-2xl border border-rose-200 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        placeholder="Detail why the request cannot be approved..."
                    />
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                        <button
                            disabled={submitting}
                            onClick={() => setShowRejectReason(false)}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            Cancel
                        </button>
                        <button
                            disabled={submitting}
                            onClick={async () => {
                                try {
                                    setSubmitting(true)
                                    const res = await permissionAPI.rejectPermissionRequest(id, rejectReason)
                                    setCurrentStatus('rejected')
                                    if (onUpdated) onUpdated({ id, status: 'rejected', raw: res?.data })
                                    setShowRejectReason(false)
                                } catch (e) {
                                    console.error('Reject failed:', e)
                                } finally {
                                    setSubmitting(false)
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-400/50 transition hover:-translate-y-0.5 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /></svg>
                            Confirm reject
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Executive Summary</h3>
                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Details</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-700 whitespace-pre-line">
                        {description || <span className="text-gray-400">No description provided</span>}
                    </p>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
                    <ul className="mt-4 space-y-4">
                        {timeline.map((event) => (
                            <li key={event.label} className="flex items-start gap-3">
                                <span className={`mt-1 h-2 w-2 rounded-full ${event.accent}`} />
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-500">{event.label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{event.value}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Supporting Documents</h3>
                    <span className="text-xs font-medium text-gray-500">Confidential</span>
                </div>
                <div className="mt-4">
                    {renderDocuments(documentsToDisplay)}
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-gray-500">Created</div>
                    <div className="mt-2 text-lg font-semibold text-gray-900">{formatDate(created_at)}</div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-widest text-gray-500">Last Updated</div>
                    <div className="mt-2 text-lg font-semibold text-gray-900">{formatDate(updated_at)}</div>
                </div>
            </section>
        </div>
    )
}


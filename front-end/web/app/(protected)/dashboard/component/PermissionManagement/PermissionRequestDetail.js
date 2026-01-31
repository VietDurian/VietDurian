"use client"

import React from 'react'

export default function PermissionRequestDetail({ request, onClose }) {
    if (!request) return null

    const {
        user_name,
        email,
        phone,
        avatar,
        role,
        requestRole,
        description,
        document,
        status,
        created_at,
        updated_at
    } = request

    const renderDocuments = (doc) => {
        if (!doc) return <span className="text-gray-400">No document</span>
        if (Array.isArray(doc)) {
            if (doc.length === 0) return <span className="text-gray-400">No document</span>
            return (
                <div className="flex flex-wrap gap-2">
                    {doc.map((d, idx) => (
                        <a
                            key={idx}
                            href={d}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a4d2e]/10 text-[#1a4d2e] hover:bg-[#1a4d2e]/15 transition-colors"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1a4d2e]" />
                            Document {idx + 1}
                        </a>
                    ))}
                </div>
            )
        }
        return (
            <a
                href={doc}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a4d2e]/10 text-[#1a4d2e] hover:bg-[#1a4d2e]/15 transition-colors"
            >
                <span className="h-1.5 w-1.5 rounded-full bg-[#1a4d2e]" />
                View
            </a>
        )
    }

    return (
        <div className="w-full max-w-3xl">
            <div className="relative mb-6 rounded-xl border border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a4d2e]/10 via-[#1a4d2e]/5 to-transparent" />
                <div className="relative p-6 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white ring-2 ring-white shadow overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatar || '/avatar-placeholder.png'} alt="avatar" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-lg font-semibold text-gray-900 truncate">{user_name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /><path d="M4 4h16v16H4z" opacity="0" /></svg>
                                {email}
                            </span>
                            <span className="mx-1 text-gray-300">•</span>
                            <span className="inline-flex items-center gap-1">
                                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2c-3.13-.35-6-1.86-8.22-4.08a19.79 19.79 0 0 1-4.08-8.22A2 2 0 0 1 9.46 7h3" /></svg>
                                {phone || 'No phone'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-auto inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        aria-label="Close"
                    >
                        <span className="text-lg">×</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Current Role</div>
                    <div className="mt-1.5 font-medium text-gray-900">{role}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Requested Role</div>
                    <div className="mt-1.5 font-medium text-gray-900">{requestRole}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
                    <div className="mt-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : status === 'rejected'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}
                        >
                            {status || 'pending'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900">Description</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700 whitespace-pre-line">
                        {description || <span className="text-gray-400">No description</span>}
                    </p>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
                    <div className="mt-3">
                        {renderDocuments(document)}
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-600">Created</div>
                        <div className="mt-1 font-medium text-gray-900">
                            {created_at ? new Date(created_at).toLocaleString() : '—'}
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="text-sm text-gray-600">Updated</div>
                        <div className="mt-1 font-medium text-gray-900">
                            {updated_at ? new Date(updated_at).toLocaleString() : '—'}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}


'use client'

import { permissionAPI } from '@/lib/api'
import React, { useEffect, useMemo, useState } from 'react'

// This page now renders real permission requests fetched from the API.

export default function PermissionPage() {
    const [query, setQuery] = useState('')
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [permission, setPermission] = useState([])



    const fetchPermissions = async () => {
        try {
            const res = await permissionAPI.getAllPermissions()
            setPermission(res.data || [])
            console.log('Fetched permissions:', res.data)
        } catch (error) {
            console.error('Error fetching permissions:', error)
        }
    }

    useEffect(() => {
        fetchPermissions()
    }, [])

    const mappedPermissions = useMemo(() => {
        if (!Array.isArray(permission)) return []
        return permission.map((item) => ({
            id: item._id,
            user_id: item.user_id?._id,
            requestRole: item.requested_role,
            description: item.description,
            document: item.document,
            status: item.status,
            user_name: item.user?.full_name || 'Unknown User',
            email: item.user?.email || 'No Email',
            phone: item.user?.phone || 'No Phone',
            avatar: item.user?.avatar || '',
            role: item.user?.role || 'Unknown Role',
            created_at: item.created_at,
            updated_at: item.updated_at,
        }))
    }, [permission])

    const resetChanges = () => {
        setQuery('')
    }

    const saveMock = async () => {
        setSaving(true)
        // Fake async delay
        await new Promise((r) => setTimeout(r, 800))
        setSaving(false)
        setLastSaved(new Date())
    }

    const filteredRequests = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return mappedPermissions
        return mappedPermissions.filter((p) => {
            return (
                (p.user_name && p.user_name.toLowerCase().includes(q)) ||
                (p.email && p.email.toLowerCase().includes(q)) ||
                (p.phone && p.phone.toLowerCase().includes(q)) ||
                (p.role && p.role.toLowerCase().includes(q)) ||
                (p.requestRole && p.requestRole.toLowerCase().includes(q)) ||
                (p.status && String(p.status).toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q))
            )
        })
    }, [query, mappedPermissions])

    const renderDocuments = (doc) => {
        if (!doc) return <span className="text-gray-400">No document</span>
        if (Array.isArray(doc)) {
            if (doc.length === 0) return <span className="text-gray-400">No document</span>
            return (
                <div className="flex flex-wrap gap-2">
                    {doc.map((d, idx) => (
                        <a key={idx} href={d} target="_blank" rel="noreferrer" className="text-[#1a4d2e] underline">
                            Doc {idx + 1}
                        </a>
                    ))}
                </div>
            )
        }
        return (
            <a href={doc} target="_blank" rel="noreferrer" className="text-[#1a4d2e] underline">
                View
            </a>
        )
    }

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">Permission Requests</h1>
                    <p className="text-sm md:text-base text-gray-600">Manage and review user role upgrade requests</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetChanges}
                        className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                        Reset
                    </button>
                    <button
                        onClick={saveMock}
                        disabled={saving}
                        className="px-3 py-2 rounded-lg bg-[#1a4d2e] text-white disabled:opacity-50 hover:opacity-90"
                    >
                        {saving ? 'Saving…' : 'Save (Mock)'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search permissions</label>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by user, email, phone, role, status…"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Permissions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Current Role</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Requested Role</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Document</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-6 text-center text-gray-500" colSpan={8}>
                                        No permission requests match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.user_name}</div>
                                            <div className="text-xs text-gray-500">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{req.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{req.role}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{req.requestRole}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={req.description}>{req.description || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{renderDocuments(req.document)}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${req.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : req.status === 'rejected'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {req.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {req.created_at ? new Date(req.created_at).toLocaleString() : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results Info */}
            <div className="mt-4 text-sm text-gray-500 text-center md:text-left">
                {lastSaved ? (
                    <span>Last saved: {lastSaved.toLocaleString()}</span>
                ) : (
                    <span>Data fetched from server. Save button is mock.</span>
                )}
            </div>
        </div>
    )
}


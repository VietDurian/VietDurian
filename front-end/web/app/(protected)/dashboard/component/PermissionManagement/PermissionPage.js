'use client'

import { permissionAPI } from '@/lib/api'
import React, { useEffect, useMemo, useState } from 'react'
import { Search, Filter, Star, StarHalf, Trash2, Eye, EyeClosed } from 'lucide-react';
import PermissionRequestDetail from './PermissionRequestDetail'

// This page now renders real permission requests fetched from the API.

export default function PermissionPage() {
    const [query, setQuery] = useState('')
    const [lastSaved, setLastSaved] = useState(null)
    const [permission, setPermission] = useState([])
    const [status, setStatus] = useState('all');
    const [showDetail, setShowDetail] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [page, setPage] = useState(1)
    const LIMIT = 10
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: LIMIT })


    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const params = {
                    page,
                    limit: LIMIT,
                    ...(status !== 'all' ? { status } : {}),
                }

                if (!query.trim()) {
                    const res = await permissionAPI.getAllPermissions(params)
                    const listRaw = Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res?.data?.data)
                            ? res.data.data
                            : []
                    setPermission(listRaw)

                    const pgn = res?.data?.pagination || res?.pagination || null
                    setPagination(pgn ? {
                        totalItems: Number(pgn.totalItems ?? 0),
                        totalPages: Number(pgn.totalPages ?? 0),
                        currentPage: Number(pgn.currentPage ?? page),
                        itemsPerPage: Number(pgn.itemsPerPage ?? LIMIT),
                    } : {
                        totalItems: Number(res?.data?.totalItems ?? listRaw.length ?? 0),
                        totalPages: Math.max(1, Number(res?.data?.totalPages ?? Math.ceil(listRaw.length / LIMIT))),
                        currentPage: page,
                        itemsPerPage: LIMIT,
                    })
                    return
                }

                const res = await permissionAPI.searchPermissions(query.trim(), params)
                const listRaw = Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : []
                setPermission(listRaw)

                const pgn = res?.data?.pagination || res?.pagination || null
                setPagination(pgn ? {
                    totalItems: Number(pgn.totalItems ?? 0),
                    totalPages: Number(pgn.totalPages ?? 0),
                    currentPage: Number(pgn.currentPage ?? page),
                    itemsPerPage: Number(pgn.itemsPerPage ?? LIMIT),
                } : {
                    totalItems: Number(res?.data?.totalItems ?? listRaw.length ?? 0),
                    totalPages: Math.max(1, Number(res?.data?.totalPages ?? Math.ceil(listRaw.length / LIMIT))),
                    currentPage: page,
                    itemsPerPage: LIMIT,
                })
            } catch (error) {
                console.error('Error searching permissions:', error)
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, status, page]);

    // Reset to first page when filters/search change
    useEffect(() => {
        setPage(1)
    }, [query, status])


    const mappedPermissions = useMemo(() => {
        if (!Array.isArray(permission)) return []
        return permission.map((item) => ({
            id: item._id,
            user_id: item.user_id?._id,
            requestRole: item.requested_role,
            description: item.description,
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

    const filteredPermissions = useMemo(() => {
        const data = Array.isArray(mappedPermissions) ? mappedPermissions : []
        if (status === 'all') return data
        return data.filter((req) => String(req.status || '').toLowerCase() === String(status).toLowerCase())
    }, [mappedPermissions, status])

    const effectiveTotalPages = useMemo(() => {
        const totalItems = Number(pagination.totalItems || filteredPermissions.length || 0)
        const perPage = Number(pagination.itemsPerPage || LIMIT)
        return Math.max(1, Math.ceil(totalItems / perPage))
    }, [pagination, filteredPermissions])

    const goToPage = (newPage) => {
        const tp = Number(pagination.totalPages ?? 0) || effectiveTotalPages
        if (newPage >= 1 && (tp === 0 || newPage <= tp)) {
            setPage(newPage)
        }
    }

    const renderDocuments = (doc) => {
        if (!doc) return <span className="text-gray-400">No document</span>
        if (Array.isArray(doc)) {
            if (doc.length === 0) return <span className="text-gray-400">No document</span>
            return (
                <div className="flex flex-wrap gap-2">
                    {doc.map((d, idx) => {
                        // Handle both string and object formats
                        const url = typeof d === 'string' ? d : d?.url
                        const type = typeof d === 'object' ? d?.type : null
                        const label = type ? {
                            'cccd_front': 'CCCD-F',
                            'cccd_back': 'CCCD-B',
                            'certificate': 'Cert',
                            'degree': 'Deg',
                            'other': 'Other'
                        }[type] || `Doc ${idx + 1}` : `Doc ${idx + 1}`

                        return (
                            <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#1a4d2e] underline text-xs md:text-sm"
                                title={type || 'Document'}
                            >
                                {label}
                            </a>
                        )
                    })}
                </div>
            )
        }
        const url = typeof doc === 'string' ? doc : doc?.url
        return (
            <a href={url} target="_blank" rel="noreferrer" className="text-[#1a4d2e] underline">
                View
            </a>
        )
    }

    const handleRequestUpdated = ({ id, status }) => {
        setPermission((prev) => Array.isArray(prev) ? prev.map((item) => item?._id === id ? { ...item, status } : item) : prev)
        setSelectedRequest((prev) => prev ? { ...prev, status } : prev)
    }

    const handleViewDetail = async (req) => {
        setIsLoadingDetail(true);
        setShowDetail(true);
        try {
            // Call API để lấy chi tiết đầy đủ bao gồm proofs
            const res = await permissionAPI.getPermissionById(req.id)
            const detailData = res?.data?.data || res?.data

            // Map lại dữ liệu để phù hợp với request object
            const fullRequest = {
                id: detailData._id,
                user_name: detailData.user_id?.full_name || req.user_name,
                email: detailData.user_id?.email || req.email,
                phone: detailData.user_id?.phone || req.phone,
                avatar: detailData.user_id?.avatar || req.avatar,
                role: detailData.user_id?.role || req.role,
                requestRole: detailData.requested_role,          // ← sửa
                description: detailData.description,              // ← thêm
                document: detailData.document,
                proofs: detailData.proofs,
                status: detailData.status,
                created_at: detailData.user_id?.created_at,              // ← từ permission, không phải user
                updated_at: detailData.user_id?.updated_at,              // ← từ permission, không phải user
            }

            setSelectedRequest(fullRequest)
        } catch (error) {
            console.error('Error fetching permission detail:', error)
        } finally {
            setIsLoadingDetail(false);
        }
    }

    return (
        <>
            <div className="p-4 md:p-8">
                {/* Header */}
                <div className="mb-6 md:mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">Permission Requests</h1>
                        <p className="text-sm md:text-base text-gray-600">Manage and review user role upgrade requests</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <button
                        onClick={resetChanges}
                        className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                        Reset
                    </button> */}

                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search permissions</label>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by user, email"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                            />
                        </div>
                        {/* Filter by status */}
                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 bg-white
      focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                    </div>

                </div>


                {/* Permissions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div>
                        <table className="w-full min-w-0">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Current Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Requested Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPermissions.length === 0 ? (
                                    <tr>
                                        <td className="px-6 py-6 text-center text-gray-500" colSpan={9}>
                                            No permission requests match your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermissions.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{req.user_name}</div>
                                                <div className="text-xs text-gray-500">{req.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{req.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{req.role}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{req.requestRole}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={req.description}>{req.description || '—'}</td>
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
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <Eye className='w-4 h-4 cursor-pointer hover:text-[#1a4d2e] transition'
                                                    onClick={() => handleViewDetail(req)}
                                                >

                                                </Eye>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Info & Pagination Controls (aligned with ProductPage) */}
                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-sm text-gray-600 text-center md:text-left">
                        {(() => {
                            const total = Number(pagination.totalItems ?? filteredPermissions.length ?? 0)
                            const perPage = Number(pagination.itemsPerPage ?? LIMIT)
                            const cur = Number(page ?? 1)
                            const start = total === 0 ? 0 : (cur - 1) * perPage + 1
                            const end = Math.min(cur * perPage, total)
                            return `Showing ${start}–${end} of ${total} requests`
                        })()}
                    </div>

                    <div className="flex items-center justify-center md:justify-end gap-2">
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            className={`px-3 py-1.5 text-sm rounded-md border ${page <= 1 ? 'text-gray-400 border-gray-200 bg-white cursor-not-allowed' : 'text-[#1a4d2e] border-gray-300 hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>

                        {Array.from({ length: Number(pagination.totalPages ?? 0) || effectiveTotalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                onClick={() => goToPage(n)}
                                className={`px-3 py-1.5 text-sm rounded-md border ${n === page ? 'bg-[#1a4d2e] text-white border-[#1a4d2e]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                {n}
                            </button>
                        ))}

                        <button
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= (Number(pagination.totalPages ?? 0) || effectiveTotalPages)}
                            className={`px-3 py-1.5 text-sm rounded-md border ${page >= (Number(pagination.totalPages ?? 0) || effectiveTotalPages) ? 'text-gray-400 border-gray-200 bg-white cursor-not-allowed' : 'text-[#1a4d2e] border-gray-300 hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            {showDetail && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={() => setShowDetail(false)} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="relative z-10 bg-white rounded-xl shadow-2xl border border-gray-100 p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
                            <PermissionRequestDetail
                                request={selectedRequest}
                                onClose={() => setShowDetail(false)}
                                onUpdated={handleRequestUpdated}
                                isLoading={isLoadingDetail}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}


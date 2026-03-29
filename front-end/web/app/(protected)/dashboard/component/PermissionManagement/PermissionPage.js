'use client'

import { permissionAPI } from '@/lib/api'
import React, { useEffect, useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import PermissionRequestDetail from './PermissionRequestDetail'
import { useLanguage } from '../../context/LanguageContext'

const getStatusLabel = (value, t, isVi) => {
    const status = String(value || 'none').toLowerCase()
    const map = {
        none: isVi ? 'Chưa gửi' : (t('none') || (t('not_submitted') || 'None')),
        pending: isVi ? 'Đang chờ duyệt' : (t('pending') || 'Pending'),
        approved: isVi ? 'Đã duyệt' : (t('approved') || 'Approved'),
        reject: isVi ? 'Từ chối' : (t('reject') || (t('rejected') || 'Reject')),
        rejected: isVi ? 'Từ chối' : (t('rejected') || 'Rejected'),
    }
    return map[status] || (isVi ? 'Chưa gửi' : (t('none') || 'None'))
}

const getStatusBadgeClass = (value) => {
    const status = String(value || 'none').toLowerCase()
    if (status === 'approved') return 'bg-green-100 text-green-700 ring-1 ring-green-200'
    if (status === 'rejected' || status === 'reject') return 'bg-red-100 text-red-700 ring-1 ring-red-200'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200'
    if (status === 'none') return 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
    return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
}

export default function PermissionPage() {
    const { t, language } = useLanguage()
    const isVi = language !== 'en'
    const locale = language === 'en' ? 'en-US' : 'vi-VN'
    const [query, setQuery] = useState('')
    const [permission, setPermission] = useState([])
    const [status, setStatus] = useState('all')
    const [showDetail, setShowDetail] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [page, setPage] = useState(1)
    const LIMIT = 10
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: LIMIT })
    const normalizedStatus = status === 'reject' ? 'rejected' : status

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const params = {
                    page,
                    limit: LIMIT,
                    ...(normalizedStatus !== 'all' ? { status: normalizedStatus } : {}),
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
                console.error('Lỗi khi tìm kiếm yêu cầu quyền:', error)
            }
        }, 400)

        return () => clearTimeout(timer)
    }, [query, normalizedStatus, page])

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
            status: item?.verify_cccd || 'none',
            verify_cccd: item?.verify_cccd || 'none',
            user_name: item.user?.full_name || (isVi ? 'Người dùng chưa xác định' : 'Unknown user'),
            email: item.user?.email || (isVi ? 'Chưa có email' : 'No email'),
            phone: item.user?.phone || (isVi ? 'Chưa có số điện thoại' : 'No phone number'),
            avatar: item.user?.avatar || '',
            role: item.user?.role || (isVi ? 'Chưa xác định vai trò' : 'Unknown role'),
            created_at: item.created_at,
            updated_at: item.updated_at,
        }))
    }, [permission, isVi])

    const filteredPermissions = useMemo(() => {
        const data = Array.isArray(mappedPermissions) ? mappedPermissions : []
        if (normalizedStatus === 'all') return data
        return data.filter((req) => {
            const currentStatus = String(req.status || 'none').toLowerCase()
            return currentStatus === String(normalizedStatus).toLowerCase()
        })
    }, [mappedPermissions, normalizedStatus])

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

    const handleRequestUpdated = async () => {
        setShowDetail(false)
        try {
            const params = {
                page,
                limit: LIMIT,
                ...(normalizedStatus !== 'all' ? { status: normalizedStatus } : {}),
            }

            const res = !query.trim()
                ? await permissionAPI.getAllPermissions(params)
                : await permissionAPI.searchPermissions(query.trim(), params)

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
            console.error('Lỗi khi làm mới danh sách yêu cầu quyền:', error)
        }
    }

    const handleViewDetail = async (req) => {
        setIsLoadingDetail(true)
        setShowDetail(true)
        try {
            const res = await permissionAPI.getPermissionById(req.id)
            const detailData = res?.data?.data || res?.data

            const fullRequest = {
                id: detailData.id,
                email: detailData.user_id?.email || req.email,
                phone: detailData.user_id?.phone || req.phone,
                avatar: detailData.user_id?.avatar || req.avatar,
                role: detailData.user_id?.role || req.role,
                requestRole: detailData.requested_role,
                description: detailData.description,
                document: detailData.document,
                proofs: detailData.proofs,
                status: detailData.verify_cccd || detailData.status || req.status || 'none',
                verify_cccd: detailData.verify_cccd || detailData.status || req.status || 'none',
                created_at: detailData.user_id?.created_at || detailData.created_at,
                updated_at: detailData.user_id?.updated_at || detailData.updated_at,
            }
            setSelectedRequest(fullRequest)
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết yêu cầu quyền:', error)
        } finally {
            setIsLoadingDetail(false)
        }
    }

    return (
        <>
            <div className="p-4 md:p-8">
                <div className="mb-6 md:mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">{isVi ? 'Yêu cầu quyền hạn' : 'Permission Requests'}</h1>
                        <p className="text-sm md:text-base text-gray-600">{isVi ? 'Quản lý và duyệt yêu cầu nâng quyền của người dùng' : 'Manage and review user role upgrade requests'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{isVi ? 'Tìm kiếm yêu cầu quyền' : 'Search permission requests'}</label>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={isVi ? 'Tìm theo người dùng, email' : 'Search by user, email'}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                            />
                        </div>
                        <div className="sm:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('status') || 'Status'}</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                            >
                                <option value="all">{isVi ? 'Tất cả' : (t('all') || 'All')}</option>
                                <option value="none">{isVi ? 'Chưa gửi' : (t('none') || (t('not_submitted') || 'None'))}</option>
                                <option value="pending">{isVi ? 'Đang chờ duyệt' : (t('pending') || 'Pending')}</option>
                                <option value="reject">{isVi ? 'Từ chối' : (t('reject') || (t('rejected') || 'Reject'))}</option>
                                <option value="approved">{isVi ? 'Đã duyệt' : (t('approved') || 'Approved')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <div className="min-w-[700px] md:min-w-0">
                        <table className="w-full min-w-[700px] md:min-w-0 text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('user') || 'User'}</th>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('phone') || 'Phone'}</th>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('role') || 'Role'}</th>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('description') || 'Description'}</th>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('status') || 'Status'}</th>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('created_at') || 'Created'}</th>
                                    <th className="px-3 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">{t('actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPermissions.length === 0 ? (
                                    <tr>
                                        <td className="px-3 py-6 md:px-6 text-center text-gray-500" colSpan={9}>
                                            {isVi ? 'Không có yêu cầu quyền nào phù hợp bộ lọc.' : 'No permission requests match your filters.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPermissions.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-3 md:px-6 md:py-4">
                                                <div className="font-medium text-gray-900">{req.user_name}</div>
                                                <div className="text-xs text-gray-500 break-all">{req.email}</div>
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-700 break-all">{req.phone}</td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-700 break-all">{req.role}</td>
                                            <td
                                                className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-700 max-w-xs overflow-hidden whitespace-nowrap text-ellipsis"
                                                title={req.description}
                                            >
                                                {req.description || '—'}
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-sm">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}
                                                >
                                                    {getStatusLabel(req.status, t, isVi)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-700">
                                                {req.created_at ? new Date(req.created_at).toLocaleString(locale) : '—'}
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-700">
                                                <Eye
                                                    className='w-4 h-4 cursor-pointer hover:text-[#1a4d2e] transition'
                                                    onClick={() => handleViewDetail(req)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-sm text-gray-600 text-center md:text-left">
                        {(() => {
                            const total = Number(pagination.totalItems ?? filteredPermissions.length ?? 0)
                            const perPage = Number(pagination.itemsPerPage ?? LIMIT)
                            const cur = Number(page ?? 1)
                            const start = total === 0 ? 0 : (cur - 1) * perPage + 1
                            const end = Math.min(cur * perPage, total)
                            return `${t('showing_range') || 'Showing'} ${start}-${end} ${t('of') || 'of'} ${total} ${isVi ? 'yêu cầu' : 'requests'}`
                        })()}
                    </div>

                    <div className="flex items-center justify-center md:justify-end gap-2">
                        <button
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1}
                            className={`px-3 py-1.5 text-sm rounded-md border ${page <= 1 ? 'text-gray-400 border-gray-200 bg-white cursor-not-allowed' : 'text-[#1a4d2e] border-gray-300 hover:bg-gray-50'}`}
                        >
                            {t('previous') || 'Previous'}
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
                            {t('next') || 'Next'}
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

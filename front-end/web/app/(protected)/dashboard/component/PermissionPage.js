'use client'

import React, { useMemo, useState } from 'react'

// Mock data for roles and permissions
const roles = [
    { id: 'admin', name: 'Admin' },
    { id: 'moderator', name: 'Moderator' },
    { id: 'user', name: 'User' },
]

const permissions = [
    { id: 'view_users', label: 'View Users', category: 'Users' },
    { id: 'edit_users', label: 'Edit Users', category: 'Users' },
    { id: 'delete_users', label: 'Delete Users', category: 'Users' },
    { id: 'manage_products', label: 'Manage Products', category: 'Products' },
    { id: 'view_reports', label: 'View Reports', category: 'Reports' },
    { id: 'manage_comments', label: 'Manage Comments', category: 'Content' },
    { id: 'manage_types', label: 'Manage Types', category: 'Catalog' },
    { id: 'manage_steps', label: 'Manage Steps', category: 'Workflow' },
]

const initialRolePermissions = {
    admin: new Set(permissions.map((p) => p.id)),
    moderator: new Set(['view_users', 'manage_products', 'manage_comments', 'view_reports']),
    user: new Set(['view_reports']),
}

export default function PermissionPage() {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('all')
    const [rolePerms, setRolePerms] = useState(initialRolePermissions)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)

    const categories = useMemo(() => {
        const set = new Set(permissions.map((p) => p.category))
        return ['all', ...Array.from(set)]
    }, [])

    const filteredPermissions = useMemo(() => {
        const q = query.trim().toLowerCase()
        return permissions.filter((p) => {
            const matchText = !q || p.label.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
            const matchCat = category === 'all' || p.category === category
            return matchText && matchCat
        })
    }, [query, category])

    const togglePermission = (roleId, permId) => {
        setRolePerms((prev) => {
            const next = { ...prev }
            const set = new Set(next[roleId])
            if (set.has(permId)) set.delete(permId)
            else set.add(permId)
            next[roleId] = set
            return next
        })
    }

    const toggleAllForRole = (roleId) => {
        const allOn = filteredPermissions.every((p) => rolePerms[roleId].has(p.id))
        setRolePerms((prev) => {
            const next = { ...prev }
            const set = new Set(next[roleId])
            if (allOn) {
                // Turn off all visible permissions
                filteredPermissions.forEach((p) => set.delete(p.id))
            } else {
                // Turn on all visible permissions
                filteredPermissions.forEach((p) => set.add(p.id))
            }
            next[roleId] = set
            return next
        })
    }

    const resetChanges = () => {
        setRolePerms({
            admin: new Set(initialRolePermissions.admin),
            moderator: new Set(initialRolePermissions.moderator),
            user: new Set(initialRolePermissions.user),
        })
        setQuery('')
        setCategory('all')
    }

    const saveMock = async () => {
        setSaving(true)
        // Fake async delay
        await new Promise((r) => setTimeout(r, 800))
        setSaving(false)
        setLastSaved(new Date())
    }

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">Permissions</h1>
                    <p className="text-sm md:text-base text-gray-600">Mock permissions management for roles</p>
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
                            placeholder="Search by name or key…"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c}>
                                    {c === 'all' ? 'All Categories' : c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Permissions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Permission
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                {roles.map((role) => (
                                    <th
                                        key={role.id}
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{role.name}</span>
                                            <button
                                                onClick={() => toggleAllForRole(role.id)}
                                                className="text-[#1a4d2e] hover:underline"
                                            >
                                                Toggle All
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPermissions.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-6 text-center text-gray-500" colSpan={2 + roles.length}>
                                        No permissions match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredPermissions.map((perm) => (
                                    <tr key={perm.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{perm.label}</div>
                                            <div className="text-xs text-gray-500">{perm.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{perm.category}</td>
                                        {roles.map((role) => (
                                            <td key={role.id} className="px-6 py-4">
                                                <label className="inline-flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4"
                                                        checked={rolePerms[role.id]?.has(perm.id) || false}
                                                        onChange={() => togglePermission(role.id, perm.id)}
                                                    />
                                                    <span className="text-sm text-gray-700">Allow</span>
                                                </label>
                                            </td>
                                        ))}
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
                    <span>Changes are local (mock) until you save.</span>
                )}
            </div>
        </div>
    )
}


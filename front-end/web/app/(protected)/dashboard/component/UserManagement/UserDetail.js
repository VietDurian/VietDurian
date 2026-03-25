import { useEffect, useMemo, useState } from 'react';
import { usersAPI } from '../../../../../lib/api';
import { useLanguage } from '../../context/LanguageContext';

export function UserDetail({ userId, isOpen, onClose }) {
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId || !isOpen) return;

        setLoading(true);
        setError(null);
        setUser(null);

        usersAPI
            .getUserById(userId)
            .then((data) => {
                const detail = data?.data || data;
                setUser(detail);
            })
            .catch((err) => {
                console.error('Error fetching user detail:', err);
                setError(t('error_fetching_user_detail') || 'Error fetching user detail');
            })
            .finally(() => setLoading(false));
    }, [userId, isOpen, t]);

    const fullName = user?.full_name || user?.name || 'No Name';
    const role = user?.role ? t(user.role) || user.role : '';
    const email = user?.email || '';
    const phone = user?.phone || '';
    const location = user?.location || user?.address || '';
    const avatar = user?.avatar || '';
    const createdDate =
        user?.created_at || user?.createdAt
            ? new Date(user.created_at || user.createdAt).toLocaleDateString('vi-VN')
            : '';

    const statusText = user?.is_banned
        ? t('blocked') || 'Blocked'
        : t('active') || 'Active';

    const statusClass = user?.is_banned
        ? 'bg-red-100 text-red-700 border border-red-200'
        : 'bg-emerald-100 text-emerald-700 border border-emerald-200';

    const profileFields = useMemo(() => {
        if (!user) return [];

        const items = [
            {
                key: 'email',
                label: t('email') || 'Email',
                value: email,
            },
            {
                key: 'phone',
                label: t('phone') || 'Phone',
                value: phone,
            },
            {
                key: 'role',
                label: t('role') || 'Role',
                value: role,
            },
            {
                key: 'status',
                label: t('status') || 'Status',
                value: statusText,
                badge: true,
                badgeClass: statusClass,
            },
            {
                key: 'location',
                label: t('location') || 'Location',
                value: location,
            },
            {
                key: 'joinDate',
                label: t('join_date') || 'Join Date',
                value: createdDate,
            },
        ];

        return items.filter((item) => {
            if (item.key === 'status') return true;
            return item.value && String(item.value).trim() !== '';
        });
    }, [user, t, email, phone, role, statusText, statusClass, location, createdDate]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4 py-6">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.14)] border border-gray-100">
                <button
                    className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur hover:bg-white"
                    onClick={onClose}
                >
                    <span className="text-xl leading-none">&times;</span>
                </button>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] min-h-[560px]">
                        <div className="bg-gradient-to-br from-[#eef9f1] via-[#f7fcf8] to-[#eaf6ee] p-6 lg:p-8">
                            <div className="flex flex-col items-center lg:items-start">
                                <div className="h-28 w-28 rounded-full bg-white animate-pulse border border-gray-200" />
                                <div className="mt-5 h-7 w-40 rounded bg-gray-200 animate-pulse" />
                                <div className="mt-3 h-5 w-28 rounded bg-gray-100 animate-pulse" />
                                <div className="mt-5 h-8 w-24 rounded-full bg-gray-200 animate-pulse" />
                            </div>
                        </div>

                        <div className="p-6 lg:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                                <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-6">
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center text-red-600">
                            {error}
                        </div>
                    </div>
                ) : user ? (
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] min-h-[560px]">
                        {/* Left panel */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#eef9f1] via-[#f8fdf9] to-[#edf7f0] px-6 py-8 text-gray-800 lg:px-8 border-r border-[#e6f0e8]">
                            <div className="absolute inset-0 opacity-70">
                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#dff1e5]" />
                                <div className="absolute bottom-8 -left-8 h-28 w-28 rounded-full bg-[#e9f7ed]" />
                            </div>

                            <div className="relative flex h-full flex-col items-center text-center lg:items-start lg:text-left">
                                <div className="rounded-full border-4 border-white bg-white shadow-md">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={fullName}
                                            className="h-28 w-28 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#7bbf8e] to-[#4f9b68] text-4xl font-bold text-white">
                                            {fullName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>

                                <h2 className="mt-5 text-2xl font-bold leading-tight break-words text-[#183a24]">
                                    {fullName}
                                </h2>

                                {role ? (
                                    <p className="mt-2 text-sm font-medium text-[#4f7d5f] break-words">
                                        {role}
                                    </p>
                                ) : null}

                                <div className="mt-5">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${statusClass}`}
                                    >
                                        {statusText}
                                    </span>
                                </div>

                                <div className="mt-8 w-full space-y-4">
                                    <div className="rounded-2xl border border-[#dcebdd] bg-white/80 p-4 shadow-sm">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6a8d75]">
                                            Account Overview
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            This panel provides a quick overview of the selected user's account,
                                            including profile status and essential information.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-[#dcebdd] bg-white/80 p-4 shadow-sm">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6a8d75]">
                                                Member Since
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-gray-800 break-words">
                                                {createdDate || 'Updating...'}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-[#dcebdd] bg-white/80 p-4 shadow-sm">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6a8d75]">
                                                Contact
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-gray-800 break-words">
                                                {phone || email || 'No data'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right panel */}
                        <div className="bg-[#fcfcfd] px-6 py-8 lg:px-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {t('Personal Information') || 'Personal Information'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {t('Review detailed account information of the selected user.') ||
                                        'Review detailed account information of the selected user.'}
                                </p>
                            </div>

                            {profileFields.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profileFields.map((item) => (
                                        <div
                                            key={item.key}
                                            className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                {item.label}
                                            </div>

                                            <div className="mt-2 min-h-[28px]">
                                                {item.badge ? (
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${item.badgeClass}`}
                                                    >
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <div className="text-[15px] font-medium text-gray-800 break-words">
                                                        {item.value}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                                    {t('No user data.') || 'No user data.'}
                                </div>
                            )}


                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-gray-500">
                            {t('No user data.') || 'No user data.'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
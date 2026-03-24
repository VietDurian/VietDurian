import { useEffect, useState } from 'react';
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
                <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h2 className="text-xl font-bold mb-4 text-[#1a4d2e]">
                    {t('user_detail') || 'User Detail'}
                </h2>

                {loading ? (
                    <div className="text-center text-gray-500">
                        {t('loading') || 'Loading...'}
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : user ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.full_name || 'User'}
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] flex items-center justify-center text-white text-2xl font-bold">
                                    {user.full_name?.charAt(0) || '?'}
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-lg">
                                    {user.full_name || 'No Name'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {user.role ? t(user.role) || user.role : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="font-medium">{t('email') || 'Email'}: </span>
                            <span>{user.email || 'N/A'}</span>
                        </div>

                        <div>
                            <span className="font-medium">{t('phone') || 'Phone'}: </span>
                            <span>{user.phone || 'N/A'}</span>
                        </div>

                        <div>
                            <span className="font-medium">{t('status') || 'Status'}: </span>
                            <span>{user.is_banned ? t('blocked') || 'Blocked' : t('active') || 'Active'}</span>
                        </div>

                        <div>
                            <span className="font-medium">{t('location') || 'Location'}: </span>
                            <span>{user.location || 'Unknown'}</span>
                        </div>

                        <div>
                            <span className="font-medium">{t('join_date') || 'Join Date'}: </span>
                            <span>
                                {user.created_at || user.createdAt
                                    ? new Date(user.created_at || user.createdAt).toLocaleDateString('vi-VN')
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        {t('no_user_data') || 'No user data.'}
                    </div>
                )}
            </div>
        </div>
    );
}
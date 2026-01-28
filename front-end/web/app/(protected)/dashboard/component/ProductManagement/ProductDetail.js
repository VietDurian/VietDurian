'use client';
import { useEffect, useMemo } from 'react';
import { X, Star, StarHalf } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function ProductDetail({ product, onClose }) {
    if (!product) return null;
    const { t } = useLanguage?.() || { t: (s) => s };

    // Lock body scroll while modal is open and add ESC key to close
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = original;
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose]);
    const decimalToNumber = (value) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'object' && value?.$numberDecimal) return Number(value.$numberDecimal);
        return Number(value || 0);
    };

    const formatVND = (value) => {
        const n = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
        if (Number.isNaN(n)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(n);
    };

    const formatDate = (value) => {
        if (!value) return '--';
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? '--'
            : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    const getTypeBadgeColor = (type) => {
        switch ((type || '').toLowerCase()) {
            case 'fruit':
                return 'bg-[#1a4d2e] text-white';
            case 'fertilizer':
                return 'bg-yellow-600 text-white';
            case 'service':
                return 'bg-blue-600 text-white';
            case 'equipment':
                return 'bg-purple-600 text-white';
            default:
                return 'bg-gray-600 text-white';
        }
    };

    const getStatusBadgeColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700';
            case 'inactive':
                return 'bg-red-100 text-red-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-200 text-gray-700';
        }
    };

    const rating = useMemo(() => Math.max(0, Math.min(5, Number(product.rating) || 0)), [product.rating]);
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5 && full < 5;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                {/* Header */}
                <div className="relative flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1a4d2e] to-[#2d7a4f]">
                    <h2 id="product-detail-title" className="text-lg font-semibold text-white">
                        {product.name || t('Product Detail')}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('Close')}
                        className="inline-flex items-center justify-center p-2 rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (scrollable) */}
                <div className="overflow-y-auto p-5">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full md:w-56 flex-shrink-0">
                            <div className="aspect-square w-56 mx-auto md:mx-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] flex items-center justify-center text-white font-bold ring-1 ring-gray-200">
                                {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.imageUrl} alt={product.name || 'product'} className="w-full h-full object-cover" />
                                ) : (
                                    (product.name || '--')?.charAt(0)
                                )}
                            </div>
                        </div>

                        {/* Main info */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-gray-500">{t('Description')}</p>
                                <p className="text-gray-900 leading-relaxed">
                                    {product.description || '--'}
                                </p>
                            </div>

                            {/* Quick badges */}
                            <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(product.typeName)}`}>
                                    {product.typeName || '--'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(product.status)}`}>
                                    {product.status || '--'}
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    {t('Rating')}: {rating.toFixed(1)}
                                </span>
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                                    {t('Views')}: {Number(product.viewCount ?? 0)}
                                </span>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Price')}</p>
                                    <p className="text-gray-900">{formatVND(decimalToNumber(product.price))}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Origin')}</p>
                                    <p className="text-gray-900">{product.origin || '--'}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Weight')}</p>
                                    <p className="text-gray-900">{Number(product.weight ?? 0)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Harvest Start')}</p>
                                    <p className="text-gray-900">{formatDate(product.harvestStartDate)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Harvest End')}</p>
                                    <p className="text-gray-900">{formatDate(product.harvestEndDate)}</p>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t('Rating')}</p>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: full }).map((_, i) => (
                                        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500" fill="currentColor" stroke="none" />
                                    ))}
                                    {hasHalf && <StarHalf className="w-4 h-4 text-yellow-500" />}
                                    {Array.from({ length: empty }).map((_, i) => (
                                        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                                    ))}
                                    <span className="ml-2 text-xs text-gray-500">{rating.toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg border border-gray-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Created At')}</p>
                                    <p className="text-gray-900">{formatDate(product.createdAt)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Updated At')}</p>
                                    <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Product ID')}</p>
                                    <p className="text-gray-900 break-all">{product.id || '--'}</p>
                                </div>
                                <div className="rounded-lg border border-gray-100 p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('Created By')}</p>
                                    <p className="text-gray-900 break-all">{product?.user_name || product?.userId || '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm rounded-md border bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                        {t('Close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;

'use client';
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { productAPI } from '@/lib/api';
import { productTypesAPI } from "@/lib/api";

export function ProductsPage() {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const mapProduct = (p) => ({
        id: p._id,
        name: p.name,
        typeId: p.type_id?._id || p.typeId || '',
        typeName: p.type_id?.name || p.typeName || '',
        description: p.description || '',
        price:
            typeof p.price === "object" && p.price?.$numberDecimal
                ? Number(p.price.$numberDecimal)
                : typeof p.price === "number"
                    ? p.price
                    : Number(p.price || 0),
        stock: p.stock ?? 0,
        origin: p.origin || '',
        viewCount: p.view_count ?? 0,
        rating: typeof p.rating === 'object' && p.rating?.$numberDecimal
            ? Number(p.rating.$numberDecimal)
            : (typeof p.rating === 'number' ? p.rating : Number(p.rating || 0)),
    });
    const fetchProductTypes = async () => {
        try {
            const res = await productTypesAPI.getAllProductTypes({ page: 1, limit: 10 });
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
            setProductTypes(list);
            console.log('Fetched product types:', list);
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };
    useEffect(() => {
        fetchProductTypes();
    }, []);
    useEffect(() => {
        const term = searchTerm.trim();

        const handler = setTimeout(async () => {
            setLoading(true);
            try {
                if (term) {
                    const res = await productAPI.searchProducts(term, { page: 1, limit: 10 });

                    let list = Array.isArray(res?.data) ? res.data : [];

                    list = list.map(mapProduct);

                    if (typeFilter !== "all") {
                        list = list.filter(p => p.typeId === typeFilter);
                    }

                    setProducts(list);
                } else {
                    const res = await productAPI.getAllProducts({ page: 1, limit: 10 });
                    const list = Array.isArray(res?.data) ? res.data : [];
                    setProducts(list.map(mapProduct));
                }
            } catch (e) {
                console.error("Error:", e);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(handler);
    }, [searchTerm, typeFilter]);






    const getTypeBadgeColor = (type) => {
        switch (type) {
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

    const filteredProducts = useMemo(() => {
        const data = Array.isArray(products) ? products : [];
        const term = searchTerm.trim().toLowerCase();
        return data.filter((p) => {
            const name = (p.name || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const origin = (p.origin || '').toLowerCase();
            const matchesSearch = !term || name.includes(term) || desc.includes(term) || origin.includes(term);
            const matchesType = typeFilter === 'all' || p.typeName === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [products, searchTerm, typeFilter]);


    const formatVND = (value) => {
        const n = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
        if (Number.isNaN(n)) return "0 ₫";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(n);
    };


    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
                    {t('Product Management')}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    {t('Manage products')}
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('Search products')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full md:w-48 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent appearance-none bg-white"
                        >
                            <option key="all" value="all">
                                {t('All Types')}
                            </option>

                            {(Array.isArray(productTypes) ? productTypes : []).map((type) => (
                                <option key={type._id} value={type.name}>
                                    {t(type.name)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Removed status filter */}
                </div>
            </div>

            {/* Products Table - Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('type') || 'Type'}</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('price') || 'Price'}</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('stock') || 'Stock'}</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('origin') || 'Origin'}</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('views') || 'Views'}</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{t('rating') || 'Rating'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]`}>
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="ml-3">
                                                <p className="font-medium text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(p.typeName)}`}>{t(p.typeName)}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatVND(p.price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.origin}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.viewCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.rating}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Products Cards - Mobile */}
            <div className="md:hidden space-y-4">
                {filteredProducts.map((p) => (
                    <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]">
                                {p.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate text-gray-900">{p.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                    <span>{t('type') || 'Type'}: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(p.type)}`}>{t(p.type) || p.type}</span></span>
                                    <span>{t('price') || 'Price'}: {formatVND(p.price)}</span>
                                    <span>{t('stock') || 'Stock'}: {p.stock}</span>
                                    <span>{t('origin') || 'Origin'}: {p.origin}</span>
                                    <span>{t('views') || 'Views'}: {p.viewCount}</span>
                                    <span>{t('rating') || 'Rating'}: {p.rating}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Results Info */}
            <div className="mt-4 text-sm text-gray-500 text-center md:text-left">
                {t('total')}: {filteredProducts.length} {(t('products') || 'products').toLowerCase()}
            </div>
        </div>
    );
}


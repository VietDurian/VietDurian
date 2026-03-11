"use client";
import { useState, useEffect, useMemo } from 'react';
import {
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

import { useLanguage } from '../context/LanguageContext';
import { usersAPI } from '../../../../lib/api';

export function UserChart() {
	const { t } = useLanguage();
	const [chartData, setChartData] = useState([]);
	const [fetchedCount, setFetchedCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const ROLE_COLORS = useMemo(
		() => ({
			farmer: '#F59E0B',
			trader: '#3B82F6',
			serviceProvider: '#22C55E',
			contentExpert: '#A855F7',
			unknown: '#9CA3AF',
		}),
		[]
	);

	const legendRoles = useMemo(
		() => (Array.isArray(chartData) ? chartData.map((d) => d.role) : []),
		[chartData]
	);

		const processUsersData = (users) => {
		if (!Array.isArray(users) || users.length === 0) {
			return [];
		}

		const roleCounts = new Map();
		for (const user of users) {
			const role = user?.role || 'unknown';
				if (role === 'admin') continue;
			roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
		}

			const preferredOrder = ['farmer', 'trader', 'serviceProvider', 'contentExpert', 'unknown'];
		const orderIndex = (role) => {
			const idx = preferredOrder.indexOf(role);
			return idx === -1 ? preferredOrder.length + 1 : idx;
		};

		return Array.from(roleCounts.entries())
				.map(([role, count]) => ({ role, count }))
			.sort((a, b) => {
				const ai = orderIndex(a.role);
				const bi = orderIndex(b.role);
				if (ai !== bi) return ai - bi;
				return String(a.role).localeCompare(String(b.role));
			});
	};

	// Fetch and process data
	useEffect(() => {
		const fetchChartData = async () => {
			try {
				setLoading(true);

				const limit = 1000;
				const firstRes = await usersAPI.filterUsers({ page: 1, limit });
				const firstList = Array.isArray(firstRes?.data)
					? firstRes.data
					: Array.isArray(firstRes?.data?.data)
						? firstRes.data.data
						: [];
				const totalPages = Number(firstRes?.pagination?.totalPages ?? 1);

				let users = [...firstList];
				if (totalPages > 1) {
					const pageRequests = [];
					for (let page = 2; page <= totalPages; page++) {
						pageRequests.push(usersAPI.filterUsers({ page, limit }));
					}
					const rest = await Promise.all(pageRequests);
					for (const res of rest) {
						const list = Array.isArray(res?.data)
							? res.data
							: Array.isArray(res?.data?.data)
								? res.data.data
								: [];
						users.push(...list);
					}
				}

				const usersWithoutAdmin = users.filter((u) => (u?.role || 'unknown') !== 'admin');
				setFetchedCount(usersWithoutAdmin.length);
				setChartData(processUsersData(usersWithoutAdmin));
				setError(null);
			} catch (err) {
				setError(err?.message || String(err));
				setChartData([]);
				setFetchedCount(0);
			} finally {
				setLoading(false);
			}
		};

		fetchChartData();
	}, []);

	// Loading state
	if (loading) {
		return (
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="mb-4 md:mb-6">
					<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
						{t('role_distribution_title')}
					</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('role_distribution_subtitle')}</p>
				</div>
				<div className="h-75 flex items-center justify-center">
					<div className="text-gray-500">Đang tải dữ liệu...</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error && chartData.length === 0) {
		return (
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="mb-4 md:mb-6">
					<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
						{t('role_distribution_title')}
					</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('role_distribution_subtitle')}</p>
				</div>
				<div className="h-75 flex items-center justify-center">
					<div className="text-red-500">Lỗi tải dữ liệu: {error}</div>
				</div>
			</div>
		);
	}

	// No data state
	if (!chartData || chartData.length === 0) {
		return (
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="mb-4 md:mb-6">
					<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
						{t('role_distribution_title')}
					</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('role_distribution_subtitle')}</p>
				</div>
				<div className="h-75 flex items-center justify-center">
					<div className="text-gray-500 text-center">
						<p className="mb-2">📊 Chưa có dữ liệu người dùng</p>
						<p className="text-sm">Không có dữ liệu để thống kê vai trò</p>
						<p className="text-xs text-gray-400 mt-2">Đã tải: {fetchedCount} người dùng</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
			<div className="mb-4 md:mb-6">
				<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
					{t('role_distribution_title')}
				</h2>
				<p className="text-xs text-gray-500">{t('role_distribution_subtitle')}</p>
			</div>
			<ResponsiveContainer width="100%" height={320}>
				<BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 10 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis
						dataKey="role"
						tick={false}
						axisLine={false}
						tickLine={false}
						height={10}
					/>
					<YAxis
						stroke="#1a4d2e"
						style={{ fontSize: '12px' }}
						allowDecimals={false}
						tickMargin={8}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: 'white',
							border: '1px solid #e5e7eb',
							borderRadius: '8px',
							fontSize: '12px',
						}}
						formatter={(value) => [`${Number(value).toLocaleString('vi-VN')}`, t('count_users')]}
						labelFormatter={(_label, payload) => {
							const roleValue = payload?.[0]?.payload?.role;
							const roleName = roleValue ? (t(roleValue) || roleValue) : null;
							return roleName ? `${t('role')}: ${roleName}` : t('role');
						}}
						labelStyle={{ fontWeight: 'bold', color: '#1a4d2e' }}
					/>
					<Bar dataKey="count" name={t('count_users')} radius={[6, 6, 0, 0]}>
						{chartData.map((entry, idx) => (
							<Cell key={`cell-${idx}`} fill={ROLE_COLORS[entry.role] || '#1a4d2e'} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>

			{/* Custom legend (like GardenHeatmap) */}
			<div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
				{legendRoles.map((role) => (
					<div key={role} className="flex items-center gap-2">
						<span
							className="w-3 h-3 rounded-sm"
							style={{ backgroundColor: ROLE_COLORS[role] || '#1a4d2e' }}
						/>
						<p className="text-xs text-gray-700">{t(role) || role}</p>
					</div>
				))}
			</div>
		</div>
	);
}

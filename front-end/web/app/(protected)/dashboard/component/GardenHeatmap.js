import React, { useMemo, useState } from 'react';
import { StatsCard } from './StatsCard';
import { Package, Crown, Layers } from 'lucide-react';

// ===== Mock data cứng theo tháng =====
const MARKET_BY_MONTH = {
	'T1/2026': {
		label: 'Tháng 1',
		totalText: '1,456 kg',
		totalSub: 'Tổng sản lượng',
		changePct: 25,
		changeText: 'so với tháng trước',
		segments: [
			{ name: 'Ri6', value: 65, color: '#F59E0B' },
			{ name: 'Monthong', value: 20, color: '#3B82F6' },
			{ name: 'Chuồng bò', value: 10, color: '#22C55E' },
			{ name: 'Khác', value: 5, color: '#EF4444' },
		],
	},
	'T12/2025': {
		label: 'Tháng 12',
		totalText: '1,280 kg',
		totalSub: 'Tổng sản lượng',
		changePct: -8,
		changeText: 'so với tháng trước',
		segments: [
			{ name: 'Ri6', value: 58, color: '#F59E0B' },
			{ name: 'Monthong', value: 25, color: '#3B82F6' },
			{ name: 'Chuồng bò', value: 12, color: '#22C55E' },
			{ name: 'Khác', value: 5, color: '#EF4444' },
		],
	},
	'T11/2025': {
		label: 'Tháng 11',
		totalText: '1,390 kg',
		totalSub: 'Tổng sản lượng',
		changePct: 6,
		changeText: 'so với tháng trước',
		segments: [
			{ name: 'Ri6', value: 62, color: '#F59E0B' },
			{ name: 'Monthong', value: 22, color: '#3B82F6' },
			{ name: 'Chuồng bò', value: 11, color: '#22C55E' },
			{ name: 'Khác', value: 5, color: '#EF4444' },
		],
	},
};

function buildConicGradient(segments) {
	let start = 0;
	const parts = segments.map((s) => {
		const end = start + s.value;
		const part = `${s.color} ${start}% ${end}%`;
		start = end;
		return part;
	});
	return `conic-gradient(${parts.join(', ')})`;
}

// ✅ Component chính
export function GardenHeatmap() {
	const monthKeys = Object.keys(MARKET_BY_MONTH);
	const [month, setMonth] = useState(monthKeys[0]);

	const data = useMemo(() => MARKET_BY_MONTH[month], [month]);
	const donutBg = useMemo(() => buildConicGradient(data.segments), [data.segments]);

	const isUp = data.changePct >= 0;
	const topSegment = useMemo(() => {
		const segments = data?.segments || [];
		return [...segments].sort((a, b) => b.value - a.value)[0];
	}, [data]);

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 h-full flex flex-col">
			{/* Header giữ nguyên */}
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-base font-bold text-gray-900">Tổng sản lượng thu hoạch</h2>
					<p className="text-xs text-gray-500">Phân bổ theo giống (dữ liệu demo)</p>
				</div>

				<select
					value={month}
					onChange={(e) => setMonth(e.target.value)}
					className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#1a4d2e]/20"
				>
					{monthKeys.map((k) => (
						<option key={k} value={k}>
							{MARKET_BY_MONTH[k].label}
						</option>
					))}
				</select>
			</div>

			{/* Nội dung trên giữ nguyên */}
			<div className="flex-1 flex flex-col">
				<div className="flex flex-col md:flex-row items-center md:items-start gap-5">
				{/* Donut */}
				<div className="relative w-44 h-44 md:w-48 md:h-48 shrink-0">
					<div className="w-full h-full rounded-full" style={{ background: donutBg }} />

					<div className="absolute inset-0 m-auto w-24 h-24 md:w-28 md:h-28 rounded-full bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center">
						<p className="text-xl font-extrabold text-gray-900">{data.totalText}</p>
						<p className="text-xs text-gray-500">{data.totalSub}</p>
					</div>

					{/* ❌ bỏ pill kiểu absolute dưới donut */}
				</div>

				{/* Legend */}
				<div className="flex-1 w-full">
					<div className="space-y-3 mt-2 md:mt-1">
						{data.segments.map((s) => (
							<div key={s.name} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
									<p className="text-sm text-gray-700">{s.name}</p>
								</div>

								<div className="flex items-center gap-3">
									<p className="text-sm font-semibold text-gray-900">{s.value}%</p>
									<div className="w-28 h-2 rounded-full bg-gray-100 overflow-hidden">
										<div
											className="h-full rounded-full"
											style={{ width: `${s.value}%`, backgroundColor: s.color }}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
				</div>

				{/* Fill the remaining space with StatsCards (to avoid empty bottom area) */}
				<div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
					<StatsCard
						size="sm"
						title="Tổng sản lượng"
						value={data.totalText}
						change=""
						changeType="neutral"
						icon={Package}
						showVsText={false}
						className="bg-gray-50"
					/>
					<StatsCard
						size="sm"
						title="Giống phổ biến"
						value={topSegment ? `${topSegment.name} (${topSegment.value}%)` : '—'}
						change=""
						changeType="neutral"
						icon={Crown}
						showVsText={false}
						className="bg-gray-50"
					/>
					<StatsCard
						size="sm"
						title="Số giống"
						value={String(data.segments.length)}
						change=""
						changeType="neutral"
						icon={Layers}
						showVsText={false}
						className="bg-gray-50"
					/>
				</div>
			</div>
		</div>
	);
}

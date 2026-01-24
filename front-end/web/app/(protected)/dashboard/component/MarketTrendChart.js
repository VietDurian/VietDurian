import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from 'recharts';

import { useLanguage } from '../context/LanguageContext';

const mockData = [
	{ month: 'T1', price: 85000, volume: 120 },
	{ month: 'T2', price: 92000, volume: 145 },
	{ month: 'T3', price: 88000, volume: 135 },
	{ month: 'T4', price: 95000, volume: 160 },
	{ month: 'T5', price: 105000, volume: 180 },
	{ month: 'T6', price: 110000, volume: 195 },
	{ month: 'T7', price: 98000, volume: 170 },
	{ month: 'T8', price: 102000, volume: 185 },
];

export function MarketTrendChart() {
	const { t } = useLanguage();

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
			<div className="mb-4 md:mb-6">
				<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
					{t('market_trend')}
				</h2>
				<p className="text-xs md:text-sm text-gray-500">{t('price_volume')}</p>
			</div>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={mockData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
					<XAxis
						dataKey="month"
						stroke="#6b7280"
						style={{ fontSize: '12px' }}
					/>
					<YAxis
						yAxisId="left"
						stroke="#1a4d2e"
						style={{ fontSize: '12px' }}
						label={{
							value: 'Giá (VNĐ/kg)',
							angle: -90,
							position: 'insideLeft',
							style: { fill: '#1a4d2e' },
						}}
					/>
					<YAxis
						yAxisId="right"
						orientation="right"
						stroke="#ffd93d"
						style={{ fontSize: '12px' }}
						label={{
							value: 'Khối lượng (tấn)',
							angle: 90,
							position: 'insideRight',
							style: { fill: '#f59e0b' },
						}}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: 'white',
							border: '1px solid #e5e7eb',
							borderRadius: '8px',
							fontSize: '12px',
						}}
					/>
					<Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
					<Line
						yAxisId="left"
						type="monotone"
						dataKey="price"
						stroke="#1a4d2e"
						strokeWidth={3}
						dot={{ fill: '#1a4d2e', r: 4 }}
						activeDot={{ r: 6 }}
						name={t('avg_price')}
					/>
					<Line
						yAxisId="right"
						type="monotone"
						dataKey="volume"
						stroke="#f59e0b"
						strokeWidth={3}
						dot={{ fill: '#ffd93d', r: 4 }}
						activeDot={{ r: 6 }}
						name={t('volume')}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

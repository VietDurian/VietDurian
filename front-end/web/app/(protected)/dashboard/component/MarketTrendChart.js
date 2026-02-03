import { useState, useEffect } from 'react';
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
import { productAPI } from '../../../../lib/api';

export function MarketTrendChart() {
	const { t } = useLanguage();
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Hàm tính toán dữ liệu chart từ products (chỉ dữ liệu thật)
	const processProductData = (products) => {
		console.log('Processing products:', products?.length || 0);
		
		if (!products || products.length === 0) {
			console.log('No products found, returning empty array');
			return [];
		}

		console.log('Sample product structure:', products[0]);
		
		// Group products by month
		const monthlyData = {};

		products.forEach(product => {
			if (!product.created_at || !product.price || product.weight === undefined) {
				console.log('Skipping product due to missing data:', {
					name: product.name,
					has_created_at: !!product.created_at,
					has_price: !!product.price,
					has_weight: product.weight !== undefined
				});
				return;
			}
			
			const date = new Date(product.created_at);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			const monthLabel = `T${date.getMonth() + 1}/${date.getFullYear()}`;

			// Handle price - could be decimal object or string
			let price;
			if (typeof product.price === 'object' && product.price.$numberDecimal) {
				price = parseFloat(product.price.$numberDecimal);
			} else {
				price = parseFloat(product.price);
			}

			const weight = parseFloat(product.weight);

			console.log(`Processing ${product.name}: price=${price}, weight=${weight}g, monthKey=${monthKey}`);

			if (!isNaN(price) && !isNaN(weight)) {
				if (!monthlyData[monthKey]) {
					monthlyData[monthKey] = {
						month: monthLabel,
						prices: [],
						totalWeight: 0,
						count: 0
					};
				}

				monthlyData[monthKey].prices.push(price);
				monthlyData[monthKey].totalWeight += weight;
				monthlyData[monthKey].count += 1;
				
				console.log(`Added to ${monthKey}: total products=${monthlyData[monthKey].count}`);
			} else {
				console.log(`Invalid price or weight for ${product.name}: price=${price}, weight=${weight}`);
			}
		});

		// Convert to chart data (only months with real data)
		const chartData = Object.keys(monthlyData)
			.sort()  // Sort months chronologically
			.map(monthKey => {
				const data = monthlyData[monthKey];
				const avgPrice = Math.round(data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length);
				const totalVolumeInKg = Math.round((data.totalWeight / 1000) * 100) / 100;
				
				console.log(`Month ${monthKey}: ${data.count} products, avgPrice=${avgPrice}, volume=${totalVolumeInKg}kg`);
				
				return {
					month: data.month,
					price: avgPrice,
					volume: totalVolumeInKg,
					isRealData: true
				};
			});

		console.log('Final chart data (real data only):', chartData);
		return chartData;
	};

	// Fetch and process data
	useEffect(() => {
		const fetchChartData = async () => {
			try {
				setLoading(true);
				const response = await productAPI.getProductsForChart();
				console.log('API response:', response);
				
				const products = Array.isArray(response?.data) ? response.data : [];
				console.log('Products array:', products.length);
				
				const processedData = processProductData(products);
				console.log('Processed data for chart:', processedData);
				
				setChartData(processedData);
				setError(null);
			} catch (err) {
				console.error('Error fetching chart data:', err);
				setError(err.message);
				setChartData([]);
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
						{t('market_trend')}
					</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('price_volume')}</p>
				</div>
				<div className="h-[300px] flex items-center justify-center">
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
						{t('market_trend')}
					</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('price_volume')}</p>
				</div>
				<div className="h-[300px] flex items-center justify-center">
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
						{t('market_trend')}
					</h2>
					<p className="text-xs md:text-sm text-gray-500">{t('price_volume')}</p>
				</div>
				<div className="h-[300px] flex items-center justify-center">
					<div className="text-gray-500 text-center">
						<p className="mb-2">📊 Chưa có dữ liệu thị trường</p>
						<p className="text-sm">Vui lòng thêm sản phẩm để hiển thị xu hướng giá</p>
					</div>
				</div>
			</div>
		);
	}

	// Debug info - remove in production
	console.log('Rendering chart with data:', chartData);

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
			<div className="mb-4 md:mb-6">
				<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
					{t('market_trend')}
				</h2>
				<p className="text-xs md:text-sm text-gray-500">{t('price_volume')}</p>
			</div>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={chartData} margin={{ top: 20, right: 60, left: 60, bottom: 20 }}>
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
							value: 'Giá (VNĐ)',
							angle: -90,
							position: 'insideLeft',
							style: { fill: '#1a4d2e', fontSize: '14px', textAnchor: 'middle', fontWeight: 'bold' },
						}}
						tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
					/>
					<YAxis
						yAxisId="right"
						orientation="right"
						stroke="#ffd93d"
						style={{ fontSize: '12px' }}
						label={{
							value: 'Khối lượng (kg)',
							angle: 90,
							position: 'outside',
							textAnchor: 'middle',
							style: { fill: '#f59e0b', fontSize: '14px', fontWeight: 'bold' },
						}}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: 'white',
							border: '1px solid #e5e7eb',
							borderRadius: '8px',
							fontSize: '12px',
						}}
						formatter={(value, name) => [
							name === 'price' 
								? `${value.toLocaleString('vi-VN')} VNĐ/kg`
								: `${value} kg`,
							name === 'price' ? 'Giá trung bình' : 'Khối lượng'
						]}
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
						name="Giá trung bình"
					/>
					<Line
						yAxisId="right"
						type="monotone"
						dataKey="volume"
						stroke="#f59e0b"
						strokeWidth={3}
						dot={{ fill: '#ffd93d', r: 4 }}
						activeDot={{ r: 6 }}
						name="Khối lượng"
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

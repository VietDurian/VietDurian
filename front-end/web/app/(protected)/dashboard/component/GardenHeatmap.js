import { MapPin } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

// Mock data: Vườn sầu riêng với tọa độ latitude/longitude
const gardenLocations = [
	{
		id: 1,
		name: 'Vườn Đồng Tháp',
		lat: 10.493,
		lng: 105.688,
		area: 5.2,
		region: 'Đồng bằng sông Cửu Long',
	},
	{
		id: 2,
		name: 'Vườn Bến Tre',
		lat: 10.242,
		lng: 106.376,
		area: 3.8,
		region: 'Đồng bằng sông Cửu Long',
	},
	{
		id: 3,
		name: 'Vườn Tiền Giang',
		lat: 10.449,
		lng: 106.342,
		area: 4.5,
		region: 'Đồng bằng sông Cửu Long',
	},
	{
		id: 4,
		name: 'Vườn Đắk Lắk',
		lat: 12.667,
		lng: 108.038,
		area: 7.2,
		region: 'Tây Nguyên',
	},
	{
		id: 5,
		name: 'Vườn Lâm Đồng',
		lat: 11.941,
		lng: 108.441,
		area: 6.1,
		region: 'Tây Nguyên',
	},
	{
		id: 6,
		name: 'Vườn Đồng Nai',
		lat: 11.068,
		lng: 107.188,
		area: 4.9,
		region: 'Đông Nam Bộ',
	},
	{
		id: 7,
		name: 'Vườn Bình Phước',
		lat: 11.751,
		lng: 106.723,
		area: 5.8,
		region: 'Đông Nam Bộ',
	},
	{
		id: 8,
		name: 'Vườn Cần Thơ',
		lat: 10.034,
		lng: 105.723,
		area: 3.2,
		region: 'Đồng bằng sông Cửu Long',
	},
];

export function GardenHeatmap() {
	const { t } = useLanguage();

	// Tính toán phạm vi của bản đồ
	const latMin = Math.min(...gardenLocations.map((g) => g.lat));
	const latMax = Math.max(...gardenLocations.map((g) => g.lat));
	const lngMin = Math.min(...gardenLocations.map((g) => g.lng));
	const lngMax = Math.max(...gardenLocations.map((g) => g.lng));

	const getHeatColor = (area) => {
		if (area >= 7) return 'bg-[#1a4d2e]';
		if (area >= 5) return 'bg-[#2d7a4f]';
		if (area >= 3) return 'bg-[#4a9d6a]';
		return 'bg-[#7ac99c]';
	};

	const getPosition = (lat, lng) => {
		const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
		const y = ((latMax - lat) / (latMax - latMin)) * 100;
		return { x, y };
	};

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
			<div className="mb-4 md:mb-6">
				<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
					{t('garden_distribution')}
				</h2>
				<p className="text-xs md:text-sm text-gray-500">
					{t('track_coordinates')}
				</p>
			</div>

			{/* Heatmap Container */}
			<div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-[#f0f9f4] to-[#e8f5ec] rounded-lg border-2 border-[#1a4d2e]/10 overflow-hidden">
				{/* Grid Background */}
				<div className="absolute inset-0 opacity-10">
					<div
						className="w-full h-full"
						style={{
							backgroundImage:
								'linear-gradient(#1a4d2e 1px, transparent 1px), linear-gradient(90deg, #1a4d2e 1px, transparent 1px)',
							backgroundSize: '40px 40px',
						}}
					/>
				</div>

				{/* Garden Markers */}
				{gardenLocations.map((garden) => {
					const { x, y } = getPosition(garden.lat, garden.lng);
					return (
						<div
							key={garden.id}
							className="absolute group cursor-pointer"
							style={{
								left: `${x}%`,
								top: `${y}%`,
								transform: 'translate(-50%, -50%)',
							}}
						>
							{/* Heat Circle */}
							<div
								className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${getHeatColor(garden.area)} opacity-40 animate-pulse`}
							/>

							{/* Pin Icon */}
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
								<MapPin className="w-4 h-4 md:w-6 md:h-6 text-[#1a4d2e] fill-[#ffd93d]" />
							</div>

							{/* Tooltip */}
							<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
								<div className="bg-[#1a4d2e] text-white px-3 py-2 rounded-lg shadow-lg text-xs whitespace-nowrap">
									<p className="font-bold text-[#ffd93d]">{garden.name}</p>
									<p className="text-[#a8d5ba]">
										{t('area')}: {garden.area} ha
									</p>
									<p className="text-[#a8d5ba] text-[10px]">
										{garden.lat.toFixed(3)}°N, {garden.lng.toFixed(3)}°E
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Legend */}
			<div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
					<span className="text-gray-600">{t('area')}:</span>
					<div className="flex items-center gap-1">
						<div className="w-4 h-4 rounded-full bg-[#7ac99c]" />
						<span className="text-gray-500">{'< 3 ha'}</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-4 h-4 rounded-full bg-[#4a9d6a]" />
						<span className="text-gray-500">3-5 ha</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-4 h-4 rounded-full bg-[#2d7a4f]" />
						<span className="text-gray-500">5-7 ha</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-4 h-4 rounded-full bg-[#1a4d2e]" />
						<span className="text-gray-500">≥ 7 ha</span>
					</div>
				</div>
				<p className="text-xs text-gray-500">
					{t('total')}: {gardenLocations.length}
				</p>
			</div>
		</div>
	);
}

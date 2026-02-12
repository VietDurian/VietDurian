
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { gardenAPI } from '@/lib/api';

const getAreaBucket = (areaHa) => {
	const n = Number(areaHa);
	if (Number.isNaN(n)) return 'lt3';
	if (n < 3) return 'lt3';
	if (n < 5) return '3to5';
	if (n < 7) return '5to7';
	return 'gte7';
};

const BUCKETS = [
	{
		key: 'lt3',
		label: '< 3 ha',
		dotClass: 'bg-emerald-200 ring-2 ring-emerald-600/45 shadow-sm',
		haloClass: 'bg-emerald-400/35',
		haloInsetClass: '-inset-5',
	},
	{
		key: '3to5',
		label: '3-5 ha',
		dotClass: 'bg-emerald-400 ring-2 ring-emerald-800/40 shadow-sm',
		haloClass: 'bg-emerald-500/30',
		haloInsetClass: '-inset-6',
	},
	{
		key: '5to7',
		label: '5-7 ha',
		dotClass: 'bg-emerald-700 ring-2 ring-emerald-950/35 shadow-sm',
		haloClass: 'bg-emerald-600/28',
		haloInsetClass: '-inset-7',
	},
	{
		key: 'gte7',
		label: '≥ 7 ha',
		dotClass: 'bg-emerald-950 ring-2 ring-emerald-200/55 shadow-sm',
		haloClass: 'bg-emerald-900/22',
		haloInsetClass: '-inset-8',
	},
];

// Rough Vietnam bounding box to map lat/lng → x/y in the grid card
const VN_BOUNDS = {
	minLat: 8.0,
	maxLat: 23.5,
	minLng: 102.0,
	maxLng: 109.5,
};

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const normalizeText = (s) => {
	if (!s) return '';
	return String(s)
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/đ/gi, 'd')
		.toLowerCase()
		.trim();
};

const hashString = (s) => {
	const str = normalizeText(s);
	let h = 2166136261;
	for (let i = 0; i < str.length; i += 1) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0) / 4294967295;
};

const locationToXY = (location) => {
	// Deterministic placement inside Vietnam bounds based on the location string.
	const a = hashString(`${location}::a`);
	const b = hashString(`${location}::b`);
	// Keep markers away from edges a bit
	const x = 8 + a * 84;
	const y = 10 + b * 78;
	return { x, y };
};

const latLngToXY = (lat, lng) => {
	const latitude = Number(lat);
	const longitude = Number(lng);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

	const x01 = clamp01((longitude - VN_BOUNDS.minLng) / (VN_BOUNDS.maxLng - VN_BOUNDS.minLng));
	const y01 = clamp01((VN_BOUNDS.maxLat - latitude) / (VN_BOUNDS.maxLat - VN_BOUNDS.minLat));

	return {
		x: x01 * 100,
		y: y01 * 100,
	};
};

const fmtCoord = (value, pos, neg) => {
	const n = Number(value);
	if (!Number.isFinite(n)) return '';
	const dir = n >= 0 ? pos : neg;
	return `${Math.abs(n).toFixed(3)}°${dir}`;
};

export function GardenHeatmap({ points }) {
	const { t } = useLanguage();
	const [dbGardens, setDbGardens] = useState([]);

	useEffect(() => {
		let mounted = true;
		gardenAPI
			.getGardensForMap()
			.then((res) => {
				const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
				if (!mounted) return;
				setDbGardens(list);
			})
			.catch(() => {
				if (!mounted) return;
				setDbGardens([]);
			});
		return () => {
			mounted = false;
		};
	}, []);

	const data = useMemo(() => {
		if (Array.isArray(points) && points.length > 0) return points;
		if (Array.isArray(dbGardens) && dbGardens.length > 0) return dbGardens;
		return [];
	}, [points, dbGardens]);

	const normalized = useMemo(() => {
		return data
			.map((p, idx) => {
				const latitude = Number(p?.latitude ?? p?.lat);
				const longitude = Number(p?.longitude ?? p?.lng);
				const areaHa = Number(p?.areaHa ?? p?.area ?? p?.area_ha);
				const safeAreaHa = Number.isFinite(areaHa) ? areaHa : 0;
				const fromXY = {
					x: Number(p?.x),
					y: Number(p?.y),
				};
				const hasXY = Number.isFinite(fromXY.x) && Number.isFinite(fromXY.y);
				const projected =
					hasXY ? fromXY : latLngToXY(latitude, longitude) ?? locationToXY(p?.location ?? p?.name ?? String(idx));
				const x = Math.max(0, Math.min(100, Number(projected?.x ?? 0)));
				const y = Math.max(0, Math.min(100, Number(projected?.y ?? 0)));
				return {
					id: p?.id ?? p?._id ?? `p-${idx}`,
					x,
					y,
					areaHa: safeAreaHa,
					bucket: getAreaBucket(safeAreaHa),
					name: p?.name ?? 'Vườn',
					location: p?.location ?? '',
					latitude: Number.isFinite(latitude) ? latitude : Number(p?.latitude ?? 0),
					longitude: Number.isFinite(longitude) ? longitude : Number(p?.longitude ?? 0),
				};
			})
			.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
	}, [data]);

	const bucketByKey = useMemo(() => new Map(BUCKETS.map((b) => [b.key, b])), []);

	return (
		<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
			<div className="mb-4 md:mb-6">
				<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">{t('garden_distribution')}</h2>
				<p className="text-xs md:text-sm text-gray-500">{t('track_coordinates')}</p>
			</div>

			<div className="relative w-full h-65 md:h-75 rounded-xl border border-emerald-100 overflow-hidden bg-emerald-50/70">
				{/* Grid background */}
				<svg
					className="absolute inset-0 w-full h-full text-emerald-200/60"
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					preserveAspectRatio="none"
				>
					<defs>
						<pattern id="garden-grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#garden-grid)" />
				</svg>

				{/* Markers */}
				{normalized.map((p) => {
					const bucket = bucketByKey.get(p.bucket) || BUCKETS[0];
					const locationLine = p.location?.trim() ? p.location : `${fmtCoord(p.latitude, 'N', 'S')}, ${fmtCoord(p.longitude, 'E', 'W')}`;
					return (
						<div
							key={p.id}
							className="group absolute"
							style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -70%)' }}
							aria-label={`${p.name} - ${t('area')}: ${p.areaHa.toFixed(1)} ha`}
						>
							<div className={`absolute ${bucket.haloInsetClass} rounded-full ${bucket.haloClass}`} />
							<MapPin className="relative w-6 h-6" stroke="#1a4d2e" strokeWidth={2.2} fill="#ffd93d" />
							<span
								className={`absolute left-1/2 top-6 h-3.5 w-3.5 -translate-x-1/2 rounded-full ${bucket.dotClass}`}
								aria-hidden="true"
							/>

							{/* Hover tooltip */}
							<div
								className="pointer-events-none absolute left-1/2 top-0 z-20 hidden -translate-x-1/2 -translate-y-[120%] group-hover:block"
								role="tooltip"
							>
								<div className="min-w-50 max-w-65 rounded-xl bg-[#1a4d2e] px-4 py-3 shadow-lg">
									<p className="text-base md:text-lg font-bold text-[#ffd93d]">
										{p.name}
									</p>
									<p className="text-xs text-emerald-50/90 leading-snug">
										{t('area')}: {p.areaHa.toFixed(1)} ha
									</p>
									<p className="text-xs text-emerald-50/90 leading-snug whitespace-normal wrap-break-word">
										{locationLine}
									</p>
								</div>
								<div className="mx-auto h-0 w-0 border-x-10 border-x-transparent border-t-12 border-t-[#1a4d2e]" />
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-3 flex items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<p className="text-xs md:text-sm text-gray-700">{t('area')}: </p>
					{BUCKETS.map((b) => (
						<div key={b.key} className="flex items-center gap-2">
							<span className={`w-4 h-4 rounded-full ${b.dotClass}`} />
							<p className="text-xs md:text-sm text-gray-700">{b.label}</p>
						</div>
					))}
				</div>
				<p className="text-xs md:text-sm text-gray-700">
					{t('total')}: {normalized.length}
				</p>
			</div>
		</div>
	);
}


'use client';

import { useEffect, useState } from 'react';
import {
	Sprout,
	FlaskConical,
	Droplets,
	Package,
	Wheat,
	Waves,
	Users,
	ChevronDown,
	ChevronRight,
	Loader2,
	AlertCircle,
	Inbox,
	BookOpen,
} from 'lucide-react';
import { diaryPublicAPI } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (v) => {
	if (!v) return '—';
	const d = new Date(v);
	return isNaN(d.getTime())
		? '—'
		: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtNum = (v) =>
	v == null || v === '' ? '—' : new Intl.NumberFormat('vi-VN').format(Number(v));

const fmtCurrency = (v) =>
	v == null || v === ''
		? '—'
		: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v));

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, color = 'emerald', count, children }) {
	const [open, setOpen] = useState(true);

	const colorMap = {
		emerald: { header: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
		teal: { header: 'bg-teal-600', badge: 'bg-teal-100 text-teal-700', border: 'border-teal-200' },
		green: { header: 'bg-green-600', badge: 'bg-green-100 text-green-700', border: 'border-green-200' },
		cyan: { header: 'bg-cyan-600', badge: 'bg-cyan-100 text-cyan-700', border: 'border-cyan-200' },
		lime: { header: 'bg-lime-600', badge: 'bg-lime-100 text-lime-700', border: 'border-lime-200' },
		blue: { header: 'bg-blue-600', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
		indigo: { header: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
	};

	const c = colorMap[color] ?? colorMap.emerald;

	return (
		<div className={`rounded-2xl border ${c.border} overflow-hidden shadow-sm`}>
			<button
				onClick={() => setOpen((o) => !o)}
				className={`w-full flex items-center gap-3 px-5 py-3.5 ${c.header} text-white`}
			>
				<Icon className="w-5 h-5 flex-shrink-0" />
				<span className="font-semibold text-sm flex-1 text-left">{title}</span>
				{count != null && (
					<span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
						{count}
					</span>
				)}
				{open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
			</button>
			{open && <div className="bg-white">{children}</div>}
		</div>
	);
}

// ─── Data table ───────────────────────────────────────────────────────────────
function DataTable({ columns, rows, emptyMsg }) {
	if (!rows || rows.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 py-10 text-gray-400">
				<Inbox className="w-8 h-8" />
				<p className="text-sm">{emptyMsg}</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-xs border-collapse" style={{ minWidth: 'max-content' }}>
				<thead>
					<tr className="bg-gray-50 border-b border-gray-200">
						<th className="px-3 py-2.5 text-center font-semibold text-gray-500 border-r border-gray-100 w-10">
							STT
						</th>
						{columns.map((col) => (
							<th
								key={col.key}
								className="px-3 py-2.5 text-left font-semibold text-gray-600 border-r border-gray-100 whitespace-nowrap"
								style={{ minWidth: col.minWidth ?? 120 }}
							>
								{col.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr
							key={row._id ?? i}
							className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
						>
							<td className="px-3 py-2.5 text-center text-gray-400 font-medium border-r border-gray-100">
								{i + 1}
							</td>
							{columns.map((col) => (
								<td key={col.key} className="px-3 py-2.5 text-gray-700 border-r border-gray-100">
									{col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

// ─── Loading / Error ──────────────────────────────────────────────────────────
function LoadingState({ msg }) {
	return (
		<div className="flex items-center gap-2 px-5 py-4 text-gray-400 text-sm">
			<Loader2 className="w-4 h-4 animate-spin" />
			{msg}
		</div>
	);
}

function ErrorState({ msg }) {
	return (
		<div className="flex items-center gap-2 px-5 py-4 text-red-500 text-sm">
			<AlertCircle className="w-4 h-4" />
			{msg}
		</div>
	);
}

// ─── 1. Diary 1.4 ────────────────────────────────────────────────────────────
function BuyingSeedSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getBuyingSeeds(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_seed')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const cols = [
		{ key: 'purchase_date', label: t('diary_col_purchase_date'), minWidth: 100, render: fmtDate },
		{ key: 'seed_name', label: t('diary_col_seed_name'), minWidth: 160 },
		{ key: 'quantity', label: t('diary_col_quantity'), minWidth: 110, render: fmtNum },
		{ key: 'supplier_name', label: t('diary_col_supplier_name'), minWidth: 160 },
	];

	return (
		<Section icon={Sprout} title={t('diary_1_4_title')} color="emerald" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── 2. Diary 1.5 ────────────────────────────────────────────────────────────
function BuyingFertilizerSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getBuyingFertilizers(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_fertilizer_buy')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const cols = [
		{ key: 'purchase_date', label: t('diary_col_purchase_date'), minWidth: 100, render: fmtDate },
		{ key: 'material_name', label: t('diary_col_material_name'), minWidth: 190 },
		{ key: 'quantity', label: t('diary_col_quantity'), minWidth: 80, render: fmtNum },
		{ key: 'unit', label: t('diary_col_unit'), minWidth: 70 },
		{ key: 'supplier_name', label: t('diary_col_supplier_name'), minWidth: 160 },
	];

	return (
		<Section icon={FlaskConical} title={t('diary_1_5_title')} color="teal" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── 3. Diary 1.6 ────────────────────────────────────────────────────────────
function UseFertilizerSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getUseFertilizers(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_fertilizer_use')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const cols = [
		{ key: 'usage_date', label: t('diary_col_usage_date'), minWidth: 110, render: fmtDate },
		{ key: 'fertilizer_name', label: t('diary_col_fertilizer_name'), minWidth: 160 },
		{ key: 'fertilizer_amount', label: t('diary_col_fertilizer_amount'), minWidth: 120 },
		{ key: 'pesticide_name', label: t('diary_col_pesticide_name'), minWidth: 150 },
		{ key: 'pesticide_concentration_amount', label: t('diary_col_pesticide_concentration'), minWidth: 160 },
		{ key: 'preharvest_interval', label: t('diary_col_preharvest_interval'), minWidth: 130 },
	];

	return (
		<Section icon={Droplets} title={t('diary_1_6_title')} color="green" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── 4. Diary 1.7 ────────────────────────────────────────────────────────────
function PackagingHandlingSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getPackagingHandlings(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_packaging')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const cols = [
		{ key: 'handling_date', label: t('diary_col_handling_date'), minWidth: 100, render: fmtDate },
		{ key: 'packaging_type', label: t('diary_col_packaging_type'), minWidth: 160 },
		{ key: 'storage_location', label: t('diary_col_storage_location'), minWidth: 160 },
		{ key: 'treatment_method', label: t('diary_col_treatment_method'), minWidth: 180 },
	];

	return (
		<Section icon={Package} title={t('diary_1_7_title')} color="cyan" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── 5. Diary 1.8 ────────────────────────────────────────────────────────────
function HarvestConsumptionSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getHarvestConsumptions(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_harvest')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const cols = [
		{ key: 'harvest_date', label: t('diary_col_harvest_date'), minWidth: 120, render: fmtDate },
		{
			key: 'harvest_quantity_kg',
			label: t('diary_col_harvest_quantity'),
			minWidth: 120,
			render: (v) => (v != null && v !== '' ? `${fmtNum(v)} kg` : '—'),
		},
		{ key: 'sale_date', label: t('diary_col_sale_date'), minWidth: 100, render: fmtDate },
		{
			key: 'consumed_weight_kg',
			label: t('diary_col_consumed_weight'),
			minWidth: 130,
			render: (v) => (v != null && v !== '' ? `${fmtNum(v)} kg` : '—'),
		},
	];

	return (
		<Section icon={Wheat} title={t('diary_1_8_title')} color="lime" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── 6. Diary 1.9 ────────────────────────────────────────────────────────────
function IrrigationCostSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getIrrigationCosts(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_irrigation')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const IRRIGATION_METHOD_LABEL = {
		nho_giot: t('diary_irrigation_nho_giot'),
		phun_mua: t('diary_irrigation_phun_mua'),
		thu_cong: t('diary_irrigation_thu_cong'),
	};

	const cols = [
		{ key: 'execution_date', label: t('diary_col_execution_date'), minWidth: 120, render: fmtDate },
		{ key: 'irrigation_item', label: t('diary_col_irrigation_item'), minWidth: 160 },
		{
			key: 'irrigation_method',
			label: t('diary_col_irrigation_method'),
			minWidth: 120,
			render: (v) => IRRIGATION_METHOD_LABEL[v] ?? v ?? '—',
		},
		{
			key: 'irrigation_duration',
			label: t('diary_col_irrigation_duration'),
			minWidth: 130,
			render: (_v, row) => {
				const h = row?.irrigation_duration?.hours ?? '—';
				const m = row?.irrigation_duration?.minutes ?? '—';
				return `${h}h ${m}p`;
			},
		},
		{ key: 'irrigation_area', label: t('diary_col_irrigation_area'), minWidth: 100 },
		{ key: 'performed_by', label: t('diary_col_performed_by'), minWidth: 140 },
	];

	return (
		<Section icon={Waves} title={t('diary_1_9_title')} color="blue" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── 7. Diary 1.10 ───────────────────────────────────────────────────────────
function LaborCostSection({ diaryId }) {
	const { t } = useLanguage();
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!diaryId) return;
		diaryPublicAPI
			.getLaborCosts(diaryId)
			.then((res) => setRows(Array.isArray(res) ? res : (res?.data ?? [])))
			.catch(() => setError(t('diary_error_labor')))
			.finally(() => setLoading(false));
	}, [diaryId]);

	const cols = [
		{ key: 'labor_hire_date', label: t('diary_col_labor_hire_date'), minWidth: 100, render: fmtDate },
		{ key: 'work_description', label: t('diary_col_work_description'), minWidth: 200 },
		{ key: 'worker_quantity', label: t('diary_col_worker_quantity'), minWidth: 130, render: fmtNum },
		{
			key: 'working_time',
			label: t('diary_col_working_time'),
			minWidth: 150,
			render: (_v, row) => {
				const h = row?.working_time?.hours ?? '—';
				const m = row?.working_time?.minutes ?? '—';
				return `${h}h ${m}p`;
			},
		},
	];

	return (
		<Section icon={Users} title={t('diary_1_10_title')} color="indigo" count={rows.length}>
			{loading ? <LoadingState msg={t('diary_loading')} /> : error ? <ErrorState msg={error} /> : <DataTable columns={cols} rows={rows} emptyMsg={t('diary_empty')} />}
		</Section>
	);
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function DiaryPublicModel({ diaryId }) {
	const { t } = useLanguage();

	if (!diaryId) {
		return (
			<div className="flex items-center gap-2 text-gray-400 text-sm py-4">
				<AlertCircle className="w-4 h-4" />
				{t('diary_no_diary_linked')}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 mb-2">
				<BookOpen className="w-5 h-5 text-emerald-600" />
				<h3 className="font-bold text-gray-800 text-base">{t('diary_title')}</h3>
				<span className="text-xs text-gray-400 font-normal ml-1">
					{t('diary_subtitle')}
				</span>
			</div>

			<BuyingSeedSection diaryId={diaryId} />
			<BuyingFertilizerSection diaryId={diaryId} />
			<UseFertilizerSection diaryId={diaryId} />
			<PackagingHandlingSection diaryId={diaryId} />
			<HarvestConsumptionSection diaryId={diaryId} />
			<IrrigationCostSection diaryId={diaryId} />
			<LaborCostSection diaryId={diaryId} />
		</div>
	);
}
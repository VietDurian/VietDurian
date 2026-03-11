'use client';

"use client";
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
	Edit2,
	Loader2,
	Plus,
	Search,
	SortAsc,
	SortDesc,
	Trash2,
} from 'lucide-react';
import { stepAPI } from '../../../../lib/api';
import { useLanguage } from '../context/LanguageContext';

const formatDate = (value) => {
	if (!value) return 'N/A';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'N/A';
	return date.toLocaleString('vi-VN');
};

// Remove accents and lowercase for accent-insensitive search
const normalizeText = (value = '') =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();

const normalizeStage = (raw, fallbackId) => ({
	id: raw?._id || raw?.id || fallbackId || crypto.randomUUID(),
	title: raw?.title || 'Untitled',
	description: raw?.description || '',
	createdAt:
		raw?.created_at ||
		raw?.createdAt ||
		raw?.updatedAt ||
		raw?.updated_at ||
		null,
	updatedAt:
		raw?.updated_at ||
		raw?.updatedAt ||
		raw?.createdAt ||
		raw?.created_at ||
		null,
});

const unwrap = (res) => res?.data?.data ?? res?.data ?? res ?? [];

export function StagePage() {
	const { t } = useLanguage();
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc');
	const [form, setForm] = useState({ title: '', description: '' });
	const [editingId, setEditingId] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState(null);

	const loadStages = async () => {
		setLoading(true);
		try {
			const res = await stepAPI.getAllStage();
			console.log('Fetched stages:', res);
			const rawList = Array.isArray(unwrap(res)) ? unwrap(res) : [];
			setStages(
				rawList.map((item, idx) => normalizeStage(item, `stage-${idx}`)),
			);
		} catch (error) {
			console.error('Failed to fetch stages', error);
			toast.error(t('stage_fetch_fail'));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadStages();
	}, []);

	const filteredStages = useMemo(() => {
		const term = normalizeText(searchTerm.trim());
		let list = stages;

		if (term) {
			list = list.filter(
				(stage) =>
					normalizeText(stage.title).includes(term) ||
					normalizeText(stage.description).includes(term),
			);
		}

		const sorted = [...list].sort((a, b) => {
			const direction = sortOrder === 'desc' ? 1 : -1;
			const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
			const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
			return (timeA - timeB) * direction;
		});

		return sorted.map((stage, idx) => ({ ...stage, order: idx + 1 }));
	}, [stages, searchTerm, sortOrder]);

	const resetForm = () => {
		setForm({ title: '', description: '' });
		setEditingId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const title = form.title.trim();
		const description = form.description.trim();

		if (!title) {
			toast.error(t('stage_title_required'));
			return;
		}
		if (!description) {
			toast.error(t('stage_description_required'));
			return;
		}

		setSubmitting(true);
		try {
			if (editingId) {
				const res = await stepAPI.updateStage(editingId, title, description);
				const updated = normalizeStage(unwrap(res), editingId);
				setStages((prev) =>
					prev.map((s) => (s.id === editingId ? { ...s, ...updated } : s)),
				);
				toast.success(t('stage_update_success'));
			} else {
				const res = await stepAPI.createStage(title, description);
				const created = normalizeStage(unwrap(res), `stage-${Date.now()}`);
				setStages((prev) => [...prev, created]);
				toast.success(t('stage_create_success'));
			}
			resetForm();
			setIsModalOpen(false);
		} catch (error) {
			console.error('Failed to submit stage', error);
			toast.error(t('stage_action_fail'));
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (stage) => {
		setEditingId(stage.id);
		setForm({ title: stage.title, description: stage.description });
		setIsModalOpen(true);
	};

	const handleDeleteClick = (stage) => {
		setDeleteTarget(stage);
	};

	const handleConfirmDelete = async () => {
		if (!deleteTarget) return;
		setSubmitting(true);
		try {
			await stepAPI.deleteStage(deleteTarget.id);
			setStages((prev) => prev.filter((s) => s.id !== deleteTarget.id));
			toast.success(t('stage_delete_success'));
			if (editingId === deleteTarget.id) resetForm();
		} catch (error) {
			console.error('Failed to delete stage', error);
			toast.error(t('stage_delete_fail'));
		} finally {
			setSubmitting(false);
			setDeleteTarget(null);
		}
	};

	const closeDeleteModal = () => {
		setDeleteTarget(null);
	};

	const toggleSortOrder = () => {
		setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	const openCreateModal = () => {
		resetForm();
		setIsModalOpen(true);
	};

	const closeModal = () => {
		resetForm();
		setIsModalOpen(false);
	};

	return (
		<div className="p-4 md:p-8 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e]">
						{t('stage_management')}
					</h1>
					<p className="text-gray-600">{t('stage_subtitle')}</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={toggleSortOrder}
						className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#1a4d2e] shadow-sm"
					>
						{sortOrder === 'asc' ? (
							<SortAsc className="w-4 h-4" />
						) : (
							<SortDesc className="w-4 h-4" />
						)}
						<span>{t('stage_sort_time')}</span>
					</button>
					<button
						onClick={openCreateModal}
						className="inline-flex items-center gap-2 px-3 py-2 bg-[#1a4d2e] text-white rounded-lg shadow-sm hover:bg-[#153d24]"
					>
						<Plus className="w-4 h-4" />
						<span>{t('stage_add')}</span>
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
				<div className="flex flex-col md:flex-row md:items-center gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
						<input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder={t('stage_search_placeholder')}
							className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
					</div>
				</div>
			</div>

			<div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-100">
							<tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								<th className="px-4 py-3">{t('stage_order')}</th>
								<th className="px-4 py-3">{t('stage_title')}</th>
								<th className="px-4 py-3">{t('stage_description')}</th>
								<th className="px-4 py-3">{t('stage_time')}</th>
								<th className="px-4 py-3">{t('actions')}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{loading ? (
								<tr>
									<td colSpan={5} className="py-10 text-center text-gray-500">
										<div className="inline-flex items-center gap-2">
											<Loader2 className="w-5 h-5 animate-spin" />
											<span>{t('loading')}</span>
										</div>
									</td>
								</tr>
							) : filteredStages.length === 0 ? (
								<tr>
									<td colSpan={5} className="py-10 text-center text-gray-500">
										{t('no_data')}
									</td>
								</tr>
							) : (
								filteredStages.map((stage) => (
									<tr key={stage.id} className="hover:bg-gray-50">
										<td className="px-4 py-3 text-sm text-gray-700">
											{stage.order}
										</td>
										<td className="px-4 py-3 text-sm font-semibold text-gray-900">
											{stage.title}
										</td>
										<td
											className="px-4 py-3 text-sm text-gray-700 max-w-[320px] truncate"
											title={stage.description}
										>
											{stage.description || 'N/A'}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											{formatDate(stage.createdAt || stage.updatedAt)}
										</td>
										<td className="px-4 py-3 text-sm text-gray-700">
											<div className="flex items-center gap-2">
												<button
													onClick={() => handleEdit(stage)}
													className="p-2 rounded-lg border border-gray-200 hover:border-[#1a4d2e] hover:bg-gray-50"
													title={t('edit')}
												>
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDeleteClick(stage)}
													disabled={submitting}
													className="p-2 rounded-lg border border-gray-200 hover:border-red-600 hover:bg-red-50 text-red-600 disabled:opacity-60"
													title={t('delete')}
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
						<div className="flex items-start justify-between">
							<div>
								<h2 className="text-xl font-semibold text-[#1a4d2e]">
									{editingId ? t('stage_update') : t('stage_add')}
								</h2>
								<p className="text-sm text-gray-600">{t('stage_modal_hint')}</p>
							</div>
							<button
								onClick={closeModal}
								className="text-gray-500 hover:text-gray-700"
								aria-label="Close"
							>
								X
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									{t('stage_title')}
								</label>
								<input
									value={form.title}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder={t('stage_title_placeholder')}
									className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-700">
									{t('stage_description')}
								</label>
								<textarea
									value={form.description}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									rows={4}
									placeholder={t('stage_description_placeholder')}
									className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
								/>
							</div>

							<div className="flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={closeModal}
									className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#1a4d2e]"
								>
									{t('cancel')}
								</button>
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a4d2e] text-white rounded-lg shadow-sm hover:bg-[#153d24] disabled:opacity-70"
								>
									{submitting ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : editingId ? (
										<Edit2 className="w-4 h-4" />
									) : (
										<Plus className="w-4 h-4" />
									)}
									<span>{editingId ? t('stage_update') : t('stage_add')}</span>
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
						<div className="flex items-start justify-between">
							<div>
								<h2 className="text-xl font-semibold text-[#1a4d2e]">
									{t('delete')}
								</h2>
								<p className="text-sm text-gray-600">
									{t('stage_confirm_delete')}
								</p>
							</div>
							<button
								onClick={closeDeleteModal}
								className="text-gray-500 hover:text-gray-700"
								aria-label="Close"
							>
								X
							</button>
						</div>
						<div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
							<div className="font-semibold text-gray-900">
								{deleteTarget.title}
							</div>
							<div className="line-clamp-3 mt-1">
								{deleteTarget.description || t('no_data')}
							</div>
						</div>
						<div className="flex items-center justify-end gap-3">
							<button
								onClick={closeDeleteModal}
								className="px-4 py-2 border border-gray-200 rounded-lg hover:border-[#1a4d2e]"
								type="button"
							>
								{t('cancel')}
							</button>
							<button
								onClick={handleConfirmDelete}
								disabled={submitting}
								className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-70"
								type="button"
							>
								{submitting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Trash2 className="w-4 h-4" />
								)}
								<span>{t('delete')}</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

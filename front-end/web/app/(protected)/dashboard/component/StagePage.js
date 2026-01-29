'use client';

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

const formatDate = (value) => {
	if (!value) return 'N/A';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'N/A';
	return date.toLocaleString('vi-VN');
};

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
	const [stages, setStages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortField, setSortField] = useState('createdAt');
	const [sortOrder, setSortOrder] = useState('desc');
	const [form, setForm] = useState({ title: '', description: '' });
	const [editingId, setEditingId] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	const loadStages = async () => {
		setLoading(true);
		try {
			const res = await stepAPI.getAllStage();
			const rawList = Array.isArray(unwrap(res)) ? unwrap(res) : [];
			setStages(
				rawList.map((item, idx) => normalizeStage(item, `stage-${idx}`)),
			);
		} catch (error) {
			console.error('Failed to fetch stages', error);
			toast.error('Không thể tải danh sách stage');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadStages();
	}, []);

	const filteredStages = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		let list = stages;

		if (term) {
			list = list.filter(
				(stage) =>
					stage.title.toLowerCase().includes(term) ||
					stage.description.toLowerCase().includes(term),
			);
		}

		const sorted = [...list].sort((a, b) => {
			const direction = sortOrder === 'asc' ? 1 : -1;
			if (sortField === 'title') {
				return a.title.localeCompare(b.title) * direction;
			}
			const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
			const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
			return (timeA - timeB) * direction;
		});

		return sorted.map((stage, idx) => ({ ...stage, order: idx + 1 }));
	}, [stages, searchTerm, sortField, sortOrder]);

	const resetForm = () => {
		setForm({ title: '', description: '' });
		setEditingId(null);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const title = form.title.trim();
		const description = form.description.trim();

		if (!title) {
			toast.error('Vui lòng nhập tiêu đề');
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
				toast.success('Đã cập nhật stage');
			} else {
				const res = await stepAPI.createStage(title, description);
				const created = normalizeStage(unwrap(res), `stage-${Date.now()}`);
				setStages((prev) => [...prev, created]);
				toast.success('Đã tạo stage mới');
			}
			resetForm();
		} catch (error) {
			console.error('Failed to submit stage', error);
			toast.error('Thao tác không thành công');
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (stage) => {
		setEditingId(stage.id);
		setForm({ title: stage.title, description: stage.description });
	};

	const handleDelete = async (id) => {
		const confirmed = window.confirm('Bạn có chắc chắn muốn xóa stage này?');
		if (!confirmed) return;

		setSubmitting(true);
		try {
			await stepAPI.deleteStage(id);
			setStages((prev) => prev.filter((s) => s.id !== id));
			toast.success('Đã xóa stage');
			if (editingId === id) resetForm();
		} catch (error) {
			console.error('Failed to delete stage', error);
			toast.error('Không thể xóa stage');
		} finally {
			setSubmitting(false);
		}
	};

	const toggleSort = (field) => {
		if (sortField === field) {
			setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortOrder('asc');
		}
	};

	return (
		<div className="p-4 md:p-8 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e]">
						Quản lý Stage
					</h1>
					<p className="text-gray-600">
						Tạo, sửa, tìm kiếm và sắp xếp các stage.
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => toggleSort('createdAt')}
						className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#1a4d2e] shadow-sm"
					>
						{sortField === 'createdAt' && sortOrder === 'asc' ? (
							<SortAsc className="w-4 h-4" />
						) : (
							<SortDesc className="w-4 h-4" />
						)}
						<span>Sort theo thời gian</span>
					</button>
					<button
						onClick={() => toggleSort('title')}
						className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#1a4d2e] shadow-sm"
					>
						{sortField === 'title' && sortOrder === 'asc' ? (
							<SortAsc className="w-4 h-4" />
						) : (
							<SortDesc className="w-4 h-4" />
						)}
						<span>Sort theo tiêu đề</span>
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
							placeholder="Tìm kiếm theo tiêu đề hoặc mô tả"
							className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
					</div>
					<form
						onSubmit={handleSubmit}
						className="flex flex-col md:flex-row gap-3 md:w-auto w-full"
					>
						<input
							value={form.title}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, title: e.target.value }))
							}
							placeholder="Tiêu đề"
							className="flex-1 min-w-[180px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
						<input
							value={form.description}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, description: e.target.value }))
							}
							placeholder="Mô tả"
							className="flex-1 min-w-[180px] px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
						<button
							type="submit"
							disabled={submitting}
							className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a4d2e] text-white rounded-lg shadow-sm hover:bg-[#153d24] disabled:opacity-70"
						>
							{submitting ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : editingId ? (
								<Edit2 className="w-4 h-4" />
							) : (
								<Plus className="w-4 h-4" />
							)}
							<span>{editingId ? 'Cập nhật' : 'Thêm mới'}</span>
						</button>
						{editingId && (
							<button
								type="button"
								onClick={resetForm}
								className="px-3 py-2.5 border border-gray-200 rounded-lg hover:border-[#1a4d2e]"
							>
								Hủy chỉnh sửa
							</button>
						)}
					</form>
				</div>
			</div>

			<div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-100">
							<tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
								<th className="px-4 py-3">STT</th>
								<th className="px-4 py-3">Tiêu đề</th>
								<th className="px-4 py-3">Mô tả</th>
								<th className="px-4 py-3">Thời gian</th>
								<th className="px-4 py-3">Thao tác</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{loading ? (
								<tr>
									<td colSpan={5} className="py-10 text-center text-gray-500">
										<div className="inline-flex items-center gap-2">
											<Loader2 className="w-5 h-5 animate-spin" />
											<span>Đang tải...</span>
										</div>
									</td>
								</tr>
							) : filteredStages.length === 0 ? (
								<tr>
									<td colSpan={5} className="py-10 text-center text-gray-500">
										Không có dữ liệu
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
													title="Chỉnh sửa"
												>
													<Edit2 className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDelete(stage.id)}
													disabled={submitting}
													className="p-2 rounded-lg border border-gray-200 hover:border-red-600 hover:bg-red-50 text-red-600 disabled:opacity-60"
													title="Xóa"
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
		</div>
	);
}

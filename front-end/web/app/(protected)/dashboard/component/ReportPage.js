import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
	Search,
	CheckCircle,
	AlertTriangle,
	Clock,
	ArrowUpDown,
	Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { getAllReport, deleteReport } from '@/lib/api';

// Reports are loaded from API via `getAllReport`.

export function ReportPage() {
	const { t } = useLanguage();
	const [reports, setReports] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(null); // report id being acted on
	// Image modal state
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [modalImageSrc, setModalImageSrc] = useState(null);

	useEffect(() => {
		fetchReports();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const data = await getAllReport({ search: searchTerm });
			console.log('Fetched reports:', data);
			// Expect array of reports
			setReports(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error(error);
			toast.error(error.message || 'Lấy báo cáo thất bại');
		} finally {
			setLoading(false);
		}
	};

	// Filter by search, then sort by created_at or id
	const filteredReports = reports
		.filter((report) => {
			const q = searchTerm.trim().toLowerCase();
			if (!q) return true;
			return (
				(report.user_id?.full_name || report.reporter?.name || '')
					.toLowerCase()
					.includes(q) || (report.reason || '').toLowerCase().includes(q)
			);
		})
		.sort((a, b) => {
			const aTime = a.created_at ? new Date(a.created_at).getTime() : a.id || 0;
			const bTime = b.created_at ? new Date(b.created_at).getTime() : b.id || 0;
			if (sortOrder === 'asc') return aTime - bTime;
			return bTime - aTime;
		});

	const getStatusColor = (status) => {
		const s = (status || '').toString().toLowerCase();
		switch (s) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-700';
			case 'resolved':
				return 'bg-green-100 text-green-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	// Format timestamp as "DD/MM/YYYY HH:mm" in Vietnamese locale
	const formatDateTime = (value) => {
		if (!value) return '';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		});
	};

	// Image modal helpers
	const openImage = (src) => {
		if (!src) return;
		setModalImageSrc(src);
		setImageModalOpen(true);
	};
	const closeImage = () => {
		setModalImageSrc(null);
		setImageModalOpen(false);
	};

	// Close modal on ESC
	useEffect(() => {
		if (!imageModalOpen) return;
		const onKey = (e) => {
			if (e.key === 'Escape') closeImage();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [imageModalOpen]);

	// Mark as resolved locally (UI-only)
	const handleResolve = (reportId) => {
		setActionLoading(reportId);
		setReports((prev) =>
			prev.map((r) =>
				r._id === reportId || r.id === reportId
					? { ...r, status: 'resolved' }
					: r,
			),
		);
		toast.success(t('report_resolved'), {
			description: t('report_resolved_desc'),
		});
		setActionLoading(null);
	};

	const handleDelete = async (reportId) => {
		if (!window.confirm(t('confirm_delete_report') || 'Xóa báo cáo này?'))
			return;
		setActionLoading(reportId);
		try {
			await deleteReport(reportId);
			setReports((prev) =>
				prev.filter((r) => r._id !== reportId && r.id !== reportId),
			);
			toast.success(t('report_deleted') || 'Đã xóa báo cáo');
		} catch (error) {
			console.error(error);
			toast.error(error.message || 'Xóa báo cáo thất bại');
		} finally {
			setActionLoading(null);
		}
	};

	return (
		<div className="p-4 md:p-8">
			{/* Header */}
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
					{t('reports')}
				</h1>
				<p className="text-sm md:text-base text-gray-600">
					{t('manage_reports')}
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
							placeholder={t('search_reports')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
					</div>

					{/* Sort */}
					<button
						type="button"
						onClick={() =>
							setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
						}
						className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						title="Đổi thứ tự thời gian"
					>
						<ArrowUpDown
							className={`w-4 h-4 text-gray-600 ${
								sortOrder === 'desc' ? 'rotate-180' : ''
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Reports Table - Desktop */}
			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('reporter')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('reason')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('report_image')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('time')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('status')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('actions')}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredReports.map((report) => (
								<tr
									key={report._id || report._id || report.id}
									className={`hover:bg-gray-50 transition-colors ${report.status === 'resolved' ? 'bg-green-50/30' : ''}`}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
													report.status === 'resolved'
														? 'bg-gradient-to-br from-green-500 to-green-700'
														: 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]'
												}`}
											>
												{report.user_id?.avatar ? (
													<Image
														src={report.user_id.avatar}
														alt={report.user_id.full_name || 'Avatar'}
														width={40}
														height={40}
														className="w-full h-full rounded-full object-cover"
														unoptimized
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-sm font-semibold text-white">
														{(report.user_id?.full_name || report.reporter?.name || ' ')[0]}
													</div>
												)}
											</div>
											<div className="ml-3">
												<p className="font-medium text-gray-900">
													{report.user_id.full_name}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-start gap-2">
											<AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
											<p className="text-sm text-gray-900 line-clamp-2">
												{report.reason}
											</p>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{report.image ? (
											<Image
												src={report.image}
												alt="Report"
												width={64}
												height={64}
												className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-90 cursor-pointer"
												onClick={() => openImage(report.image)}
												role="button"
												aria-label={t('view_image') || 'Xem ảnh'}
												onKeyDown={(e) => {
													if (e.key === 'Enter') openImage(report.image);
												}}
												tabIndex={0}
												unoptimized
											/>
										) : (
											<div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
												{t('no_image') || 'Không có ảnh'}
											</div>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center gap-2 text-sm text-gray-500">
											<Clock className="w-4 h-4" />{' '}
											{formatDateTime(report.created_at)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
										>
											{t(report.status)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{report.status === 'Pending' ? (
											<div className="">
												<button
													onClick={() => handleResolve(report._id || report.id)}
													className="px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors text-sm font-medium"
												>
													{t('resolve')}
												</button>
												<button
													className="p-2 hover:bg-red-100 rounded-lg transition-colors"
													onClick={() => handleDelete(report._id || report.id)}
													title={t('delete_report') || t('delete_post')}
													disabled={actionLoading === (report._id || report.id)}
												>
													{actionLoading === (report._id || report.id) ? (
														<span className="text-sm text-red-600">
															{t('deleting') || 'Đang xóa...'}
														</span>
													) : (
														<Trash2 className="w-4 h-4 text-red-600" />
													)}
												</button>
											</div>
										) : (
											<div className="flex items-center gap-2 text-green-600">
												<CheckCircle className="w-5 h-5" />
												<span className="text-sm font-medium">
													{t('completed')}
												</span>
											</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Reports Cards - Mobile */}
			<div className="md:hidden space-y-4">
				{filteredReports.map((report) => (
					<div
						key={report._id || report.id}
						className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${
							report.status === 'resolved'
								? 'border-green-200 bg-green-50/30'
								: ''
						}`}
					>
						<div className="flex items-start gap-3 mb-3">
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
									report.status === 'resolved'
										? 'bg-gradient-to-br from-green-500 to-green-700'
										: 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]'
								}`}
							>
								{report.user_id?.avatar ? (
									<Image
										src={report.user_id.avatar}
										alt={report.user_id.full_name || 'Avatar'}
										width={48}
										height={48}
										className="w-full h-full rounded-full object-cover"
										unoptimized
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-sm font-semibold text-white">
										{
											(report.user_id?.full_name ||
												report.reporter?.name ||
												' ')[0]
										}
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-medium text-gray-900 mb-1">
									{report.user_id?.full_name ||
										report.reporter?.name ||
										t('unknown')}
								</h3>
								<div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
									<Clock className="w-3 h-3" />
									{formatDateTime(report.created_at)}
								</div>
								<span
									className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
								>
									{t((report.status || '').toLowerCase())}
								</span>
							</div>
						</div>

						<div className="mb-3">
							<div className="flex items-start gap-2 mb-3">
								<AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
								<p className="text-sm text-gray-700">{report.reason}</p>
							</div>
							{report.image ? (
								<Image
									src={report.image}
									alt="Report"
									width={800}
									height={320}
									className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer"
									onClick={() => openImage(report.image)}
									aria-label={t('view_image') || 'Xem ảnh'}
									onKeyDown={(e) => {
										if (e.key === 'Enter') openImage(report.image);
									}}
									tabIndex={0}
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
									unoptimized
								/>
							) : (
								<div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
									{t('no_image') || 'Không có ảnh'}
								</div>
							)}
						</div>

						<div className="flex justify-end gap-2">
							{(report.status || '').toLowerCase() === 'pending' ? (
								<button
									onClick={() => handleResolve(report._id || report.id)}
									className="px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors text-sm font-medium"
								>
									{t('resolve')}
								</button>
							) : (
								<div className="flex items-center gap-2 text-green-600">
									<CheckCircle className="w-5 h-5" />
									<span className="text-sm font-medium">{t('completed')}</span>
								</div>
							)}
							<button
								onClick={() => handleDelete(report._id || report.id)}
								disabled={actionLoading === (report._id || report.id)}
								className="px-3 py-2 text-sm rounded-md border border-red-100 text-red-600 hover:bg-red-50"
							>
								{actionLoading === (report._id || report.id)
									? t('deleting') || 'Đang xóa...'
									: t('delete') || 'Xóa'}
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Image Modal */}
			{imageModalOpen && modalImageSrc && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
					role="dialog"
					aria-modal="true"
					onClick={closeImage}
				>
					<div
						className="max-w-[90%] max-h-[90%] p-4"
						onClick={(e) => e.stopPropagation()}
					>
						<Image
							src={modalImageSrc}
							alt="Report Large"
							width={1200}
							height={900}
							className="max-w-full max-h-[80vh] rounded-lg shadow-lg"
							unoptimized
						/>
						<button
							type="button"
							onClick={closeImage}
							className="mt-3 w-full px-4 py-2 bg-white text-center rounded-lg"
						>
							{t('close') || 'Đóng'}
						</button>
					</div>
				</div>
			)}

			{/* Results Info */}
			<div className="mt-4 text-sm text-gray-500 text-center md:text-left">
				{t('total')}: {filteredReports.length} {t('reports').toLowerCase()}
			</div>
		</div>
	);
}

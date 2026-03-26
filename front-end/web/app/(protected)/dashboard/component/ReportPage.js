"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
	Search,
	CheckCircle,
	AlertTriangle,
	Clock,
	Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { getAllReport, deleteReport, updateReport } from '@/lib/api';

// Reports are loaded from API via `getAllReport`.

export function ReportPage() {
	const { t } = useLanguage();
	const [reports, setReports] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(null); // report id being acted on
	const [sortOrder, setSortOrder] = useState('desc');
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage] = useState(10);
	
	// Image modal state
	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [modalImageSrc, setModalImageSrc] = useState(null);
	// Delete modal state
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedReportId, setSelectedReportId] = useState(null);

	const openDeleteConfirm = (id) => {
  	setSelectedReportId(id);
  	setConfirmOpen(true);
	};

	const closeDeleteConfirm = () => {
  	setConfirmOpen(false);
  	setSelectedReportId(null);
	};

	useEffect(() => {
		fetchReports();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const response = await getAllReport({ 
				page: currentPage,
				limit: itemsPerPage
			});
			console.log('Fetched reports:', response);
			
			// Handle both direct array and paginated response
			if (Array.isArray(response)) {
				// Direct array response (no pagination from API)
				setReports(response);
				setTotalItems(response.length);
				setTotalPages(Math.ceil(response.length / itemsPerPage));
			} else if (response?.data) {
				// Paginated response
				setReports(Array.isArray(response.data) ? response.data : []);
				const pagination = response.pagination || {};
				setTotalPages(pagination.totalPages || 1);
				setTotalItems(pagination.totalItems || response.data.length);
			} else {
				setReports([]);
				setTotalItems(0);
				setTotalPages(1);
			}
		} catch (error) {
			console.error(error);
			toast.error(error.message || 'Lấy báo cáo thất bại');
		} finally {
			setLoading(false);
		}
	};

	const getPostTitle = (report) =>
		report?.post_id?.title || report?.post?.title || '';

	// Filter by post title, then sort by created_at
	const filteredReports = reports
		.filter((report) => {
			const q = searchTerm.trim().toLowerCase();
			const postTitle = getPostTitle(report).toLowerCase();
			if (!q) return true;
			return postTitle.includes(q);
		})
		.sort((a, b) => {
			const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
			const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
			return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
		});

	// Handle search
	const handleSearchChange = (value) => {
		setSearchTerm(value);
		// Keep current page for page-specific search
	};

	// Handle page change
	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

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
	const handleResolve = async (reportId) => {
  		setActionLoading(reportId);
  		try {
    		await updateReport(reportId);
    		toast.success('Đã xử lý báo cáo thành công');
    		// Refetch data to maintain pagination state
    		await fetchReports();
  		} catch (error) {
    		toast.error(error.message || 'Xử lý báo cáo thất bại');
  		} finally {
    		setActionLoading(null);
  		}
	};

	const handleDelete = async () => {
  if (!selectedReportId) return;

  setActionLoading(selectedReportId);
  try {
    await deleteReport(selectedReportId);
    toast.success(t('Xóa báo cáo thành công') || 'Delete report successful');
    closeDeleteConfirm();
    // Refetch data to maintain pagination state
    await fetchReports();
  } catch (error) {
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
							placeholder={t('search_reports') || 'Tìm theo tiêu đề bài viết...'}
							value={searchTerm}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-500 font-medium placeholder:text-gray-500 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
					</div>

					{/* Sort */}
					<div className="flex gap-3">
						<div className="relative">
							<select
								value={sortOrder}
								onChange={(e) => setSortOrder(e.target.value)}
								className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700
									focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
							>
								<option value="desc">{t('newest') || 'Mới nhất'}</option>
								<option value="asc">{t('oldest') || 'Cũ nhất'}</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Reports Table - Desktop */}
			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('title_report') || 'Tiêu đề'}
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
						{loading ? (
							<tr>
								<td colSpan="6" className="px-6 py-8 text-center">
									<div className="text-gray-500">{t('loading') || 'Đang tải...'}</div>
								</td>
							</tr>
						) : filteredReports.length === 0 ? (
							<tr>
								<td colSpan="6" className="px-6 py-8 text-center">
									<div className="text-gray-500">{t('no_reports_found') || 'Không tìm thấy báo cáo nào'}</div>
								</td>
							</tr>
						) : (
							filteredReports.map((report) => (
								<tr
									key={report._id || report._id || report.id}
									className={`hover:bg-gray-50 transition-colors ${report.status === 'resolved' ? 'bg-green-50/30' : ''}`}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<p className="font-medium text-gray-900 max-w-[320px] truncate" title={getPostTitle(report)}>
											{getPostTitle(report) || t('unknown') || 'Unknown'}
										</p>
									</td>
									<td className="px-6 py-4">
										<div className="flex items-start gap-2">
											<AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
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
													onClick={() => openDeleteConfirm(report._id || report.id)}
													title={t('Xóa report') || t('Delete report')}
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
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Reports Cards - Mobile */}
			<div className="md:hidden space-y-4">
				{loading ? (
					<div className="text-center py-8 text-gray-500">
						{t('loading') || 'Đang tải...'}
					</div>
				) : filteredReports.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						{t('no_reports_found') || 'Không tìm thấy báo cáo nào'}
					</div>
				) : (
					filteredReports.map((report) => (
						<div
							key={report._id || report.id}
							className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${
								report.status === 'resolved'
									? 'border-green-200 bg-green-50/30'
									: ''
							}`}
					>
						<div className="flex items-start gap-3 mb-3">
							<div className="flex-1 min-w-0">
								<h3 className="font-medium text-gray-900 mb-1">
													{getPostTitle(report) || t('unknown')}
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
								<AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
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
				)))}
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

			{/* Pagination */}
			<div className="mt-6 flex items-center justify-end gap-2">
				{/* Previous button */}
				<button
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
				>
					{t('previous') || 'Previous'}
				</button>

				{/* Page numbers */}
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
					<button
						key={num}
						onClick={() => handlePageChange(num)}
						className={`w-10 h-9 rounded-md border text-sm transition-colors ${
							num === currentPage
								? 'bg-[#1a4d2e] text-white border-[#1a4d2e]'
								: 'border-gray-200 text-gray-700 hover:bg-gray-50'
						}`}
					>
						{num}
					</button>
				))}

				{/* Next button */}
				<button
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
				>
					{t('next') || 'Next'}
				</button>
			</div>

			{/* Delete Modal */}
			{confirmOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    onClick={closeDeleteConfirm}
  >
    {/* overlay */}
    <div className="absolute inset-0 bg-black/50" />

    {/* modal */}
    <div
      className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-5 md:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('confirm_delete_title') || 'Xác nhận xóa'}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {t('confirm_delete_desc') ||
              'Bạn có chắc muốn xóa báo cáo này?'}
          </p>
        </div>

        <button
          type="button"
          onClick={closeDeleteConfirm}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={closeDeleteConfirm}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          disabled={actionLoading === selectedReportId}
        >
          {t('cancel') || 'Hủy'}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={actionLoading === selectedReportId}
        >
          {actionLoading === selectedReportId
            ? (t('deleting') || 'Đang xóa...')
            : (t('delete') || 'Xóa')}
        </button>
      </div>
    </div>
  </div>
)}
		</div>
	);
}

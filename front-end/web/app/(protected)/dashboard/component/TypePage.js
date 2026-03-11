"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Search,
	Plus,
	Edit3,
	Trash2,
	Calendar,
	Tag,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { productTypesAPI } from '@/lib/api';

export function TypePage() {
	const { t } = useLanguage();
	const descriptionTemplate = t('type_description_template');
	const lastTemplateRef = useRef(descriptionTemplate);
	const [productTypes, setProductTypes] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [actionLoading, setActionLoading] = useState(null);
	const [sortBy, setSortBy] = useState('date');
	const [sortOrder, setSortOrder] = useState('desc');
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage] = useState(10);
	
	// Modal states
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [selectedType, setSelectedType] = useState(null);
	
	// Form state
	const [formData, setFormData] = useState({
		name: '',
		description: '',
	});

	// Form validation state
	const [nameError, setNameError] = useState('');
	const [checkingName, setCheckingName] = useState(false);

	const fetchProductTypes = useCallback(async () => {
		setLoading(true);
		try {
			
			const response = await productTypesAPI.getAllProductTypes({ 
				page: currentPage,
				limit: itemsPerPage
				// Load all data - search will be done client-side
			});
			
			// API trả về object với structure: { code, message, data, pagination }
			const data = response?.data || [];
			const pagination = response?.pagination || {};
			setProductTypes(Array.isArray(data) ? data : []);
			
			// Update pagination state
			setTotalPages(pagination.totalPages || 1);
			setTotalItems(pagination.totalItems || data.length);
			
		} catch (error) {
			toast.error(error.message || t('fetch_type_failed') || 'Lấy danh sách loại sầu riêng thất bại');
		} finally {
			setLoading(false);
		}
	}, [currentPage, itemsPerPage]);

	useEffect(() => {
		fetchProductTypes();
	}, [fetchProductTypes]);

	// Filter and sort product types
	const filteredTypes = productTypes
		.filter((type) => {
			const q = searchTerm.trim().toLowerCase();
			if (!q) return true;
			return (
				(type.name || '').toLowerCase().includes(q) ||
				(type.description || '').toLowerCase().includes(q)
			);
		})
		.sort((a, b) => {
			if (sortBy === 'date') {
				const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
				const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
				return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
			}
			
			const aName = (a.name || '').toLowerCase().trim();
			const bName = (b.name || '').toLowerCase().trim();
			
			const cmp = aName.localeCompare(bName, 'vi', { sensitivity: 'base' });
			return sortOrder === 'asc' ? cmp : -cmp;
		});

	// Handle search
	const handleSearchChange = (value) => {
		setSearchTerm(value);
		// Don't reset page - search within current page only
	};

	// Handle page change
	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	// Format date only
	const formatDate = (value) => {
		if (!value) return t('unknown_date') || 'Chưa có thông tin';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return t('invalid_date') || 'Ngày không hợp lệ';
		return d.toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	// Handle form change
	const handleFormChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		
		// Clear error when user starts typing
		if (field === 'name' && nameError) {
			setNameError('');
		}
	};

	// Check duplicate name
	const checkDuplicateName = async (name, excludeId = null) => {
		if (!name.trim()) return false;
		
		const normalizedInput = name.replace(/\s+/g, '').toLowerCase();
		return productTypes.some(type => {
			const shouldExclude = excludeId && (type._id === excludeId || type.id === excludeId);
			if (shouldExclude) return false;
			
			const normalizedExisting = (type.name || '').replace(/\s+/g, '').toLowerCase();
			return normalizedExisting === normalizedInput;
		});
	};

	// Validate name on blur
	const handleNameBlur = async () => {
		if (!formData.name.trim()) {
			setNameError(t('type_name_required') || 'Tên loại sầu riêng không được để trống');
			return;
		}

		setCheckingName(true);
		const isDuplicate = await checkDuplicateName(
			formData.name, 
			selectedType?._id || selectedType?.id
		);
		
		if (isDuplicate) {
			setNameError(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
		} else {
			setNameError('');
		}
		setCheckingName(false);
	};



	// Reset form
	const resetForm = ({ description = '' } = {}) => {
		setFormData({ name: '', description });
		setSelectedType(null);
		setNameError('');
		setCheckingName(false);
	};

	// Open create modal
	const openCreateModal = () => {
		lastTemplateRef.current = descriptionTemplate;
		resetForm({ description: descriptionTemplate });
		setCreateModalOpen(true);
	};

	useEffect(() => {
		if (!createModalOpen) return;
		if (selectedType) return;

		// Only auto-switch the template if user hasn't modified it.
		if (formData.description === lastTemplateRef.current) {
			setFormData((prev) => ({ ...prev, description: descriptionTemplate }));
		}
		lastTemplateRef.current = descriptionTemplate;
	}, [createModalOpen, descriptionTemplate, formData.description, selectedType]);

	// Open edit modal
	const openEditModal = (type) => {
		setSelectedType(type);
		setFormData({
			name: type.name || '',
			description: type.description || '',
		});
		setEditModalOpen(true);
	};

	// Open delete modal
	const openDeleteModal = (type) => {
		setSelectedType(type);
		setDeleteModalOpen(true);
	};

	// Close modals
	const closeModals = () => {
		setCreateModalOpen(false);
		setEditModalOpen(false);
		setDeleteModalOpen(false);
		resetForm();
	};

	// Handle create
	const handleCreate = async () => {
		if (!formData.name.trim()) {
			toast.error(t('type_name_required') || 'Tên loại sầu riêng không được để trống');
			return;
		}

		if (!formData.description.trim()) {
			toast.error(t('type_description_required') || 'Mô tả không được để trống');
			return;
		}

		// Kiểm tra lỗi tên trùng lặp trước khi submit
		if (nameError) {
			toast.error(nameError);
			return;
		}

		// Kiểm tra lại lần cuối
		const isDuplicate = await checkDuplicateName(formData.name);
		if (isDuplicate) {
			setNameError(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
			toast.error(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
			return;
		}

		setActionLoading('create');
		try {
			const createData = {
				name: formData.name.trim(),
				description: formData.description.trim(),
			};

			await productTypesAPI.createProductType(createData);
			toast.success(t('create_type_success') || 'Tạo loại sầu riêng thành công');
			closeModals();
			// Fetch lại data để đảm bảo hiển thị đúng
			await fetchProductTypes();
		} catch (error) {
			// Xử lý lỗi trùng tên
			if (error.message === 'Type product name already exists' || 
				error.response?.status === 400) {
				toast.error(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
			} else {
				toast.error(error.message || t('create_type_failed') || 'Tạo loại sầu riêng thất bại');
			}
		} finally {
			setActionLoading(null);
		}
	};

	// Handle update
	const handleUpdate = async () => {
		if (!selectedType || !formData.name.trim()) {
			toast.error(t('type_name_required') || 'Tên loại sầu riêng không được để trống');
			return;
		}

		if (!formData.description.trim()) {
			toast.error(t('type_description_required') || 'Mô tả không được để trống');
			return;
		}

		// Kiểm tra lỗi tên trùng lặp trước khi submit
		if (nameError) {
			toast.error(nameError);
			return;
		}

		// Kiểm tra lại lần cuối
		const isDuplicate = await checkDuplicateName(
			formData.name, 
			selectedType._id || selectedType.id
		);
		if (isDuplicate) {
			setNameError(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
			toast.error(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
			return;
		}

		setActionLoading('edit');
		try {
			const updateData = {
				name: formData.name.trim(),
				description: formData.description.trim(),
			};

			await productTypesAPI.updateProductType(selectedType._id || selectedType.id, updateData);
			toast.success(t('update_type_success') || 'Cập nhật loại sầu riêng thành công');
			closeModals();
			// Fetch lại data để đảm bảo hiển thị đúng
			await fetchProductTypes();
		} catch (error) {
			// Xử lý lỗi trùng tên
			if (error.message === 'Type product name already exists' || 
				error.response?.status === 400) {
				toast.error(t('type_name_duplicate') || 'Tên loại sầu riêng đã tồn tại');
			} else {
				toast.error(error.message || t('update_type_failed') || 'Cập nhật loại sầu riêng thất bại');
			}
		} finally {
			setActionLoading(null);
		}
	};

	// Handle delete
	const handleDelete = async () => {
		if (!selectedType) return;

		setActionLoading('delete');
		try {
			await productTypesAPI.deleteProductType(selectedType._id || selectedType.id);
			toast.success(t('delete_type_success') || 'Xóa loại sầu riêng thành công');
			closeModals();
			// Fetch lại data để đảm bảo hiển thị đúng
			await fetchProductTypes();
		} catch (error) {
			toast.error(error.message || t('delete_type_failed') || 'Xóa loại sầu riêng thất bại');
		} finally {
			setActionLoading(null);
		}
	};

	return (
		<div className="p-4 md:p-8">
			{/* Header */}
			<div className="mb-6 md:mb-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
							{t('product_types') || 'Loại sầu riêng'}
						</h1>
						<p className="text-sm md:text-base text-gray-600">
							{t('manage_product_types') || 'Quản lý các loại sầu riêng'}
						</p>
					</div>
					<button
						onClick={openCreateModal}
						className="flex items-center gap-2 px-4 py-2.5 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors font-medium"
					>
						<Plus className="w-5 h-5" />
						{t('add_product_type') || 'Thêm loại sầu riêng'}
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder={t('search_product_types') || 'Tìm theo tên loại sầu riêng, mô tả...'}
							value={searchTerm}
							onChange={(e) => handleSearchChange(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-500 font-medium placeholder:text-gray-500 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
					</div>

					{/* Sort */}
					<div className="flex gap-3">
						{/* Sort By */}
						<div className="relative">
							<select
								value={sortBy}
								onChange={(e) => {
									const v = e.target.value;
									setSortBy(v);
									setSortOrder(v === 'date' ? 'desc' : 'asc');
								}}
								className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700
											 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
							>
								<option value="date">{t('sort_date') || 'Ngày'}</option>
								<option value="name">{t('sort_name') || 'Tên'}</option>
							</select>
						</div>

						{/* Order */}
						<div className="relative">
							<select
								value={sortOrder}
								onChange={(e) => setSortOrder(e.target.value)}
								className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700
											 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
							>
								{sortBy === 'date' ? (
									<>
										<option value="desc">{t('newest') || 'Mới nhất'}</option>
										<option value="asc">{t('oldest') || 'Cũ nhất'}</option>
									</>
								) : (
									<>
										<option value="asc">A → Z</option>
										<option value="desc">Z → A</option>
									</>
								)}
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* Product Types Table - Desktop */}
			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('product_type') || 'Loại sầu riêng'}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('description') || 'Mô tả'}
								</th>

								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('created_date') || 'Ngày tạo'}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('actions') || 'Thao tác'}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{loading ? (
								<tr>
									<td colSpan="4" className="px-6 py-8 text-center">
										<div className="text-gray-500">{t('loading') || 'Đang tải...'}</div>
									</td>
								</tr>
							) : filteredTypes.length === 0 ? (
								<tr>
									<td colSpan="4" className="px-6 py-8 text-center">
										<div className="text-gray-500">{t('no_product_types') || 'Không có loại sầu riêng nào'}</div>
									</td>
								</tr>
							) : (
								filteredTypes.map((type) => (
									<tr
										key={type._id || type.id}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] flex items-center justify-center text-white font-bold">
													<Tag className="w-5 h-5" />
												</div>
												<div className="ml-3">
													<p className="font-medium text-gray-900">
														{type.name}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm text-gray-900 whitespace-pre-line break-words max-w-md">
												{type.description || t('no_description') || 'Chưa có mô tả'}
											</p>
										</td>

										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2 text-sm text-gray-500">
												<Calendar className="w-4 h-4" />
												{formatDate(type.created_at)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-2">
												<button
													onClick={() => openEditModal(type)}
													className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
													title={t('edit') || 'Chỉnh sửa'}
													disabled={actionLoading}
												>
													<Edit3 className="w-4 h-4 text-blue-600" />
												</button>
												<button
													onClick={() => openDeleteModal(type)}
													className="p-2 hover:bg-red-100 rounded-lg transition-colors"
													title={t('delete') || 'Xóa'}
													disabled={actionLoading}
												>
													<Trash2 className="w-4 h-4 text-red-600" />
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

			{/* Product Types Cards - Mobile */}
			<div className="md:hidden space-y-4">
				{loading ? (
					<div className="text-center py-8 text-gray-500">
						{t('loading') || 'Đang tải...'}
					</div>
				) : filteredTypes.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						{t('no_product_types') || 'Không có loại sầu riêng nào'}
					</div>
				) : (
					filteredTypes.map((type) => (
						<div
							key={type._id || type.id}
							className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
						>
							<div className="flex items-start gap-3 mb-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] flex items-center justify-center text-white font-bold flex-shrink-0">
									<Tag className="w-6 h-6" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-medium text-gray-900 mb-1">
										{type.name}
									</h3>
									<div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
										<Calendar className="w-3 h-3" />
										{formatDate(type.created_at)}
									</div>
								</div>
							</div>

							<div className="mb-3">
								<p className="text-sm text-gray-700 whitespace-pre-line break-words">
									{type.description || t('no_description') || 'Chưa có mô tả'}
								</p>
							</div>

							<div className="flex justify-end gap-2">
								<button
									onClick={() => openEditModal(type)}
									className="px-3 py-2 text-sm rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50"
									disabled={actionLoading}
								>
									{t('edit') || 'Sửa'}
								</button>
								<button
									onClick={() => openDeleteModal(type)}
									className="px-3 py-2 text-sm rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
									disabled={actionLoading}
								>
									{t('delete') || 'Xóa'}
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Pagination */}
			<div className="mt-6 flex items-center justify-end gap-2">
					{/* Previous button */}
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-[#1a4d2e] hover:text-white hover:border-[#1a4d2e] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300"
					>
						‹ {t('previous') || 'Trước'}
					</button>

					{/* Page numbers */}
					<div className="flex gap-1">
						{Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
							let pageNumber;
							if (totalPages <= 7) {
								pageNumber = i + 1;
							} else {
								if (currentPage <= 4) {
									pageNumber = i + 1;
								} else if (currentPage >= totalPages - 3) {
									pageNumber = totalPages - 6 + i;
								} else {
									pageNumber = currentPage - 3 + i;
								}
							}

							const isActive = pageNumber === currentPage;
							const isEllipsis = false;

							if (isEllipsis) {
								return <span key={i} className="px-3 py-2 text-sm text-gray-400">...</span>;
							}

							return (
								<button
									key={pageNumber}
									onClick={() => handlePageChange(pageNumber)}
									className={`px-4 py-2.5 text-sm font-medium border-2 rounded-lg transition-all duration-200 ${
										isActive
											? 'bg-[#1a4d2e] text-white border-[#1a4d2e] shadow-md'
											: 'bg-white text-gray-700 border-gray-300 hover:bg-[#1a4d2e] hover:text-white hover:border-[#1a4d2e] hover:shadow-sm'
									}`}
								>
									{pageNumber}
								</button>
							);
						})}
					</div>

					{/* Next button */}
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-[#1a4d2e] hover:text-white hover:border-[#1a4d2e] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-300"
					>
						{t('next') || 'Sau'} ›
					</button>
				</div>

			{/* Create Modal */}
			{createModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					role="dialog"
					aria-modal="true"
					onClick={closeModals}
				>
					<div className="absolute inset-0 bg-black/50" />
					<div
						className="relative w-[92%] max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-100 p-6 md:p-8"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{t('add_product_type') || 'Thêm loại sầu riêng'}
							</h3>
							<button
								onClick={closeModals}
								className="text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						<div className="space-y-5">
							<div>
							<label className="block text-sm font-medium text-gray-900 mb-1">
									{t('product_type_name') || 'Tên loại sầu riêng'} *
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) => handleFormChange('name', e.target.value)}
							onBlur={handleNameBlur}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] bg-white text-gray-900 ${
								nameError ? 'border-red-500' : 'border-gray-300'
							}`}
							placeholder={t('enter_product_type_name') || 'Nhập tên loại sầu riêng'}
							disabled={checkingName}
						/>
						{checkingName && (
							<p className="mt-1 text-xs text-blue-500">
								{t('checking') || 'Đang kiểm tra...'}
							</p>
						)}
						{nameError && (
							<p className="mt-1 text-xs text-red-500">
								{nameError}
							</p>
						)}
							</div>
							<div>
							<label className="block text-sm font-medium text-gray-900 mb-1">
							{t('description') || 'Mô tả'} *
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => handleFormChange('description', e.target.value)}
							rows={10}
							className="w-full min-h-[260px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] bg-white text-gray-900 whitespace-pre-wrap"
							placeholder={t('enter_description') || ''}
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 mt-6">
							<button
								onClick={closeModals}
								className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
								disabled={actionLoading === 'create'}
							>
								{t('cancel') || 'Hủy'}
							</button>
							<button
								onClick={handleCreate}
								className="px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] disabled:opacity-50"
								disabled={actionLoading === 'create'}
							>
								{actionLoading === 'create'
									? (t('creating') || 'Đang tạo...')
									: (t('create') || 'Tạo')
								}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{editModalOpen && selectedType && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					role="dialog"
					aria-modal="true"
					onClick={closeModals}
				>
					<div className="absolute inset-0 bg-black/50" />
					<div
						className="relative w-[92%] max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-100 p-6 md:p-8"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{t('edit_product_type') || 'Chỉnh sửa loại sầu riêng'}
							</h3>
							<button
								onClick={closeModals}
								className="text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						<div className="space-y-5">
							<div>
							<label className="block text-sm font-medium text-gray-900 mb-1">
									{t('product_type_name') || 'Tên loại sầu riêng'} *
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) => handleFormChange('name', e.target.value)}
							onBlur={handleNameBlur}
							className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] bg-white text-gray-900 ${
								nameError ? 'border-red-500' : 'border-gray-300'
							}`}
							disabled={checkingName}
							/>
						{checkingName && (
							<p className="mt-1 text-xs text-blue-500">
								{t('checking') || 'Đang kiểm tra...'}
							</p>
						)}
						{nameError && (
							<p className="mt-1 text-xs text-red-500">
								{nameError}
							</p>
						)}
							</div>
							<div>
							<label className="block text-sm font-medium text-gray-900 mb-1">
							{t('description') || 'Mô tả'} *
							</label>
							<textarea
								value={formData.description}
								onChange={(e) => handleFormChange('description', e.target.value)}
							rows={10}
							className="w-full min-h-[260px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] bg-white text-gray-900 whitespace-pre-wrap"
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 mt-6">
							<button
								onClick={closeModals}
								className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
								disabled={actionLoading === 'edit'}
							>
								{t('cancel') || 'Hủy'}
							</button>
							<button
								onClick={handleUpdate}
								className="px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] disabled:opacity-50"
								disabled={actionLoading === 'edit'}
							>
								{actionLoading === 'edit'
									? (t('updating') || 'Đang cập nhật...')
									: (t('update') || 'Cập nhật')
								}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Delete Modal */}
			{deleteModalOpen && selectedType && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center"
					role="dialog"
					aria-modal="true"
					onClick={closeModals}
				>
					<div className="absolute inset-0 bg-black/50" />
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
									{t('confirm_delete_product_type') || 'Bạn có chắc muốn xóa loại sầu riêng này?'}
								</p>
								<p className="mt-1 text-sm font-medium text-gray-900">
									{selectedType.name}
								</p>
							</div>
							<button
								onClick={closeModals}
								className="text-gray-400 hover:text-gray-600"
							>
								✕
							</button>
						</div>

						<div className="mt-6 flex items-center justify-end gap-2">
							<button
								onClick={closeModals}
								className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
								disabled={actionLoading === 'delete'}
							>
								{t('cancel') || 'Hủy'}
							</button>
							<button
								onClick={handleDelete}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
								disabled={actionLoading === 'delete'}
							>
								{actionLoading === 'delete'
									? (t('deleting') || 'Đang xóa...')
									: (t('delete') || 'Xóa')
								}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
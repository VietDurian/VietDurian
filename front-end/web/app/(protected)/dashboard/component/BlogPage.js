import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Clock, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { blogAPI } from '@/lib/api';

const initial = (name = '') => name.trim().charAt(0)?.toUpperCase() || 'A';

const getBlockId = (block, index) => block?._id || block?.id || index;

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

export function BlogPage() {
	const { t } = useLanguage();
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
	const [confirmId, setConfirmId] = useState(null);
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const [detailId, setDetailId] = useState(null);
	const [detail, setDetail] = useState(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState(null);
	const [activeBlockId, setActiveBlockId] = useState(null);

	useEffect(() => {
		// Fetch list of blogs with search/sort applied
		const fetchBlogs = async () => {
			setLoading(true);
			try {
				const params = {};
				if (searchTerm.trim()) params.search = searchTerm.trim();
				if (sortOrder === 'asc') params.sort = 'oldest';
				const data = await blogAPI.getAllBlogs(params);
				// API may return either array or wrapped object
				const list = Array.isArray(data?.data)
					? data.data
					: Array.isArray(data)
						? data
						: [];
				setBlogs(list);
				setPage(1);
			} catch (error) {
				console.error(error);
				toast.error(error.message || 'Không tải được blog');
			} finally {
				setLoading(false);
			}
		};

		fetchBlogs();
	}, [searchTerm, sortOrder]);

	const totalPages = Math.max(1, Math.ceil(blogs.length / pageSize));
	const safePage = Math.min(page, totalPages);
	const paginatedBlogs = blogs.slice(
		(safePage - 1) * pageSize,
		safePage * pageSize,
	);
	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

	// Basic client-side pagination changer
	const changePage = (nextPage) => {
		if (nextPage < 1 || nextPage > totalPages) return;
		setPage(nextPage);
	};

	const handleDelete = async (blogId) => {
		setDeletingId(blogId);
		try {
			await blogAPI.deleteBlog(blogId);
			setBlogs((prev) =>
				prev.filter((b) => b._id !== blogId && b.id !== blogId),
			);
			toast.success(t('blog_deleted') || 'Đã xóa blog');
		} catch (error) {
			console.error(error);
			toast.error(error.message || 'Xóa blog thất bại');
		} finally {
			setDeletingId(null);
			setConfirmId(null);
		}
	};

	// Load a single blog detail (with blocks) for the modal
	const openDetail = async (blogId) => {
		setDetailId(blogId);
		setDetail(null);
		setDetailError(null);
		setDetailLoading(true);
		try {
			const res = await blogAPI.getBlogById(blogId);
			if (res?.data) {
				setDetail(res.data);
			} else {
				setDetailError(t('no_data') || 'Không có dữ liệu');
			}
		} catch (error) {
			console.error(error);
			setDetailError(error.message || 'Không tải được chi tiết blog');
		} finally {
			setDetailLoading(false);
		}
	};

	const closeDetail = () => {
		setDetailId(null);
		setDetail(null);
		setDetailError(null);
	};

	useEffect(() => {
		if (detail?.knowledgeBlocks?.length) {
			const first = detail.knowledgeBlocks[0];
			setActiveBlockId(getBlockId(first, 0));
		} else {
			setActiveBlockId(null);
		}
	}, [detailId, detail?.knowledgeBlocks]);

	const activeBlock =
		detail?.knowledgeBlocks?.find(
			(block) => (block._id || block.id) === activeBlockId,
		) || detail?.knowledgeBlocks?.[0];

	return (
		<div className="p-4 md:p-8">
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
					{t('blogs') || 'Blog kiến thức'}
				</h1>
				<p className="text-sm md:text-base text-gray-600">
					{t('manage_blogs') || 'Quản lý bài viết kiến thức'}
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
							placeholder={t('search_blogs') || 'Tìm kiếm blog'}
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

			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('author') || 'Họ tên'}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('title') || 'Tiêu đề'}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('image') || 'Ảnh'}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('content') || 'Nội dung'}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('actions') || 'Thao tác'}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{loading ? (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-8 text-center text-gray-500"
									>
										{t('loading') || 'Đang tải...'}
									</td>
								</tr>
							) : paginatedBlogs.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-8 text-center text-gray-500"
									>
										{t('no_data') || 'Chưa có blog nào'}
									</td>
								</tr>
							) : (
								paginatedBlogs.map((blog) => (
									<tr
										key={blog._id || blog.id}
										className="hover:bg-gray-50 transition-colors"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] text-white flex items-center justify-center text-sm font-semibold">
													{blog.author_id?.avatar ? (
														<Image
															src={blog.author_id.avatar}
															alt={blog.author_id?.full_name || 'Avatar'}
															width={40}
															height={40}
															className="w-full h-full object-cover"
															unoptimized
														/>
													) : (
														<span>{initial(blog.author_id?.full_name)}</span>
													)}
												</div>
												<div className="flex flex-col text-sm text-gray-900">
													<span className="font-medium">
														{blog.author_id?.full_name || t('unknown') || 'N/A'}
													</span>
													<span className="flex items-center gap-2 text-gray-500">
														<Clock className="w-4 h-4" />
														{formatDateTime(blog.created_at || blog.createdAt)}
													</span>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 max-w-xs">
											<p className="text-sm text-gray-700">{blog.title}</p>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{blog.image ? (
												<Image
													src={blog.image}
													alt={blog.title || 'Blog image'}
													width={72}
													height={72}
													className="w-18 h-18 object-cover rounded-lg border border-gray-200"
													unoptimized
												/>
											) : (
												<div className="w-18 h-18 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs px-3 py-2">
													{t('no_image') || 'Không có ảnh'}
												</div>
											)}
										</td>
										<td className="px-6 py-4 text-sm text-gray-700 max-w-md line-clamp-2">
											{blog.content}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex gap-2">
												<button
													onClick={() => openDetail(blog._id || blog.id)}
													className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-emerald-100 text-emerald-700 hover:bg-emerald-50"
												>
													{t('view_details') || 'Xem chi tiết'}
												</button>
												<button
													onClick={() => setConfirmId(blog._id || blog.id)}
													disabled={deletingId === (blog._id || blog.id)}
													className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
												>
													<Trash2 className="w-4 h-4" />
													{deletingId === (blog._id || blog.id)
														? t('deleting') || 'Đang xóa...'
														: t('delete') || 'Xóa'}
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

			<div className="md:hidden space-y-4">
				{loading && (
					<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center text-gray-500">
						{t('loading') || 'Đang tải...'}
					</div>
				)}
				{!loading && paginatedBlogs.length === 0 && (
					<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center text-gray-500">
						{t('no_data') || 'Chưa có blog nào'}
					</div>
				)}
				{!loading &&
					paginatedBlogs.map((blog) => (
						<div
							key={blog._id || blog.id}
							className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
						>
							<div className="flex items-start gap-3 mb-3">
								<div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
									{blog.author_id?.avatar ? (
										<Image
											src={blog.author_id.avatar}
											alt={blog.author_id?.full_name || 'Avatar'}
											width={48}
											height={48}
											className="w-full h-full object-cover"
											unoptimized
										/>
									) : (
										<span>{initial(blog.author_id?.full_name)}</span>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
										{blog.title}
									</h3>
									<div className="text-sm text-gray-700">
										{blog.author_id?.full_name || t('unknown') || 'N/A'}
									</div>
									<div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
										<Clock className="w-3 h-3" />
										{formatDateTime(blog.created_at || blog.createdAt)}
									</div>
								</div>
							</div>
							{blog.image && (
								<div className="mb-3">
									<Image
										src={blog.image}
										alt={blog.title || 'Blog image'}
										width={800}
										height={320}
										className="w-full h-40 object-cover rounded-lg border border-gray-200"
										unoptimized
									/>
								</div>
							)}
							<p className="text-sm text-gray-700 mb-3 line-clamp-2">
								{blog.content}
							</p>
							<div className="flex justify-end">
								<button
									onClick={() => openDetail(blog._id || blog.id)}
									className="px-3 py-2 text-sm rounded-md border border-emerald-100 text-emerald-700 hover:bg-emerald-50"
								>
									{t('view_details') || 'Xem chi tiết'}
								</button>
								<button
									onClick={() => setConfirmId(blog._id || blog.id)}
									disabled={deletingId === (blog._id || blog.id)}
									className="px-3 py-2 text-sm rounded-md border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50"
								>
									{deletingId === (blog._id || blog.id)
										? t('deleting') || 'Đang xóa...'
										: t('delete') || 'Xóa'}
								</button>
							</div>
						</div>
					))}
			</div>

			{/* Pagination */}
			{!loading && blogs.length > 0 && (
				<div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm">
					<div className="mt-4 text-sm text-gray-500 text-center md:text-left">
						{t('total') || 'Tổng cộng'}: {blogs.length}{' '}
						{t('blogs')?.toLowerCase() || 'blog'}
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={() => changePage(safePage - 1)}
							disabled={safePage === 1}
							className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
						>
							{t('previous') || 'Previous'}
						</button>
						{pageNumbers.map((num) => (
							<button
								key={num}
								onClick={() => changePage(num)}
								className={`w-10 h-9 rounded-md border text-sm transition-colors ${
									num === safePage
										? 'bg-emerald-700 text-white border-emerald-700'
										: 'border-gray-200 text-gray-700 hover:bg-gray-50'
								}`}
							>
								{num}
							</button>
						))}
						<button
							onClick={() => changePage(safePage + 1)}
							disabled={safePage === totalPages}
							className="px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
						>
							{t('next') || 'Next'}
						</button>
					</div>
				</div>
			)}

			{/* Confirm Delete Modal */}
			{confirmId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
						<h2 className="text-lg font-semibold text-gray-900">
							{t('confirm_delete_blog') || 'Xác nhận xóa blog'}
						</h2>
						<p className="text-sm text-gray-600">
							{t('delete_warning') || 'Hành động này không thể hoàn tác.'}
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmId(null)}
								className="px-3 py-2 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
							>
								{t('cancel') || 'Hủy'}
							</button>
							<button
								type="button"
								onClick={() => handleDelete(confirmId)}
								disabled={deletingId === confirmId}
								className="px-3 py-2 text-sm rounded-md border border-red-100 text-red-600 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
							>
								{deletingId === confirmId
									? t('deleting') || 'Đang xóa...'
									: t('delete') || 'Xóa'}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Blog Detail Modal */}
			{detailId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-1">
								<h2 className="text-xl font-semibold text-gray-900">
									{detail?.title || t('blogs') || 'Blog'}
								</h2>
								<p className="text-sm text-green-500">
									{detail?.author_id?.full_name || t('author') || 'Tác giả'}
								</p>
							</div>
							<button
								onClick={closeDetail}
								className="text-sm text-gray-600 hover:text-gray-900"
							>
								{t('close') || 'Đóng'}
							</button>
						</div>

						{detailLoading && (
							<div className="text-center text-gray-500">
								{t('loading') || 'Đang tải chi tiết...'}
							</div>
						)}

						{detailError && !detailLoading && (
							<div className="text-center text-red-500 text-sm">
								{detailError}
							</div>
						)}

						{/* show detail knowledge blocks */}
						{detail && !detailLoading && (
							<div className="space-y-5">
								<div className="flex flex-col md:flex-row gap-4">
									<div className="md:w-1/3">
										{detail.image ? (
											<Image
												src={detail.image}
												alt={detail.title || 'Blog image'}
												width={400}
												height={240}
												className="w-full h-full object-cover rounded-lg border border-gray-200"
												unoptimized
											/>
										) : (
											<div className="w-full h-full min-h-[180px] bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
												{t('no_image') || 'Không có ảnh'}
											</div>
										)}
									</div>
									<div className="flex flex-col justify-between md:w-2/3 space-y-2">
										<p className="text-sm text-gray-500 flex items-center gap-2">
											<Clock className="w-4 h-4" />
											{formatDateTime(detail.created_at || detail.createdAt)}
										</p>
										<p className="text-gray-800 leading-relaxed whitespace-pre-line">
											{detail.content}
										</p>
									</div>
								</div>

								{detail?.knowledgeBlocks?.length > 0 && (
									<div className="grid gap-4 md:grid-cols-3 bg-emerald-50/70 border border-emerald-100 rounded-xl p-4">
										<div className="space-y-3 md:pr-2">
											<div className="space-y-2">
												{detail.knowledgeBlocks.map((block, index) => {
													const isActive =
														(activeBlockId &&
															(block._id || block.id) === activeBlockId) ||
														(!activeBlockId && index === 0);

													return (
														<button
															key={getBlockId(block, index)}
															type="button"
															onClick={() =>
																setActiveBlockId(getBlockId(block, index))
															}
															className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
																isActive
																	? 'border-emerald-500 bg-white shadow-sm'
																	: 'border-emerald-100 bg-emerald-100/50 hover:border-emerald-300'
															}`}
														>
															<div className="flex items-start gap-3">
																<span
																	className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
																		isActive
																			? 'bg-emerald-700 text-white'
																			: 'bg-emerald-200 text-emerald-800'
																	}`}
																>
																	{index + 1}
																</span>
																<div className="min-w-0 space-y-1">
																	<p className="font-semibold text-emerald-900 line-clamp-2 text-sm">
																		{block.title}
																	</p>
																</div>
															</div>
														</button>
													);
												})}
											</div>
										</div>
										<div className="md:col-span-2 bg-white rounded-lg border border-emerald-100 p-4 shadow-sm">
											{activeBlock ? (
												<div className="space-y-3">
													<h4 className="text-lg font-semibold text-gray-900">
														{activeBlock.title}
													</h4>
													{activeBlock.image ? (
														<Image
															src={activeBlock.image}
															alt={activeBlock.title || 'Block image'}
															width={800}
															height={360}
															className="w-full h-56 object-cover rounded-lg border border-emerald-100"
															unoptimized
														/>
													) : null}
													<p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
														{activeBlock.content}
													</p>
												</div>
											) : (
												<p className="text-sm text-gray-600">
													{t('no_data') || 'Không có khối kiến thức'}
												</p>
											)}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

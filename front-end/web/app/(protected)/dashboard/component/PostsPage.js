'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, PauseCircle, Trash2, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

import { getOwnPosts } from '@/lib/api';
import { useLanguage } from '../context/LanguageContext';

export function PostsPage() {
	const { t } = useLanguage();
	const [posts, setPosts] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [sortOrder, setSortOrder] = useState('desc');
	const [selectedPost, setSelectedPost] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch posts with current filters and normalize author fields
	useEffect(() => {
		let isMounted = true;

		const fetchPosts = async () => {
			setIsLoading(true);
			try {
				const data = await getOwnPosts({
					status: statusFilter === 'all' ? undefined : statusFilter,
					category: categoryFilter === 'all' ? undefined : categoryFilter,
					search: searchTerm || undefined,
				});

				if (!isMounted) return;

				const normalizedPosts = data.map((item) => ({
					id: item._id || item.id,
					author:
						item?.author?.full_name ||
						item?.author_id?.full_name ||
						item.full_name ||
						'N/A',
					avatar:
						item?.author?.avatar ||
						item?.author_id?.avatar ||
						item.avatar ||
						'',
					content: item.content || '',
					category: item.category || '',
					status: item.status || 'inactive',
					createdAt: item.created_at || item.createdAt || '',
					image: item.image || '',
					contact: item.contact || '',
				}));

				setPosts(normalizedPosts);
			} catch (error) {
				if (!isMounted) return;
				toast.error(error?.message || t('error'));
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		fetchPosts();

		return () => {
			isMounted = false;
		};
	}, [searchTerm, statusFilter, categoryFilter]);

	const parseDate = (value) => {
		if (!value) return 0;
		const timestamp = new Date(value).getTime();
		return Number.isNaN(timestamp) ? 0 : timestamp;
	};

	const formatDate = (value) => {
		if (!value) return '';
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
	};

	const filteredPosts = posts.filter((post) => {
		const matchesSearch =
			post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
			post.content.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === 'all' || post.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const sortedPosts = [...filteredPosts].sort((a, b) => {
		const direction = sortOrder === 'asc' ? 1 : -1;
		return (parseDate(a.createdAt) - parseDate(b.createdAt)) * direction;
	});

	const snippet = (text = '', max = 80) =>
		text.length > max ? `${text.slice(0, max)}...` : text;

	const setInactive = (post) => {
		if (post.status === 'inactive') {
			toast(t('inactive_post'));
			return;
		}
		setPosts((prev) =>
			prev.map((p) => (p.id === post.id ? { ...p, status: 'inactive' } : p)),
		);
		toast.success(t('inactive_post'));
	};

	const deletePost = (post) => {
		setPosts((prev) => prev.filter((p) => p.id !== post.id));
		if (selectedPost?.id === post.id) {
			setSelectedPost(null);
		}
		toast.success(t('delete_post'));
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-700';
			case 'progressing':
				return 'bg-yellow-100 text-yellow-700';
			case 'inactive':
				return 'bg-gray-100 text-gray-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	return (
		<div className="p-4 md:p-8">
			{/* Header */}
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
					{t('post_management')}
				</h1>
				<p className="text-sm md:text-base text-gray-600">
					{t('content_moderation')}
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
							placeholder={t('search_users')}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
						/>
					</div>

					{/* Status Filter */}
					<div className="relative">
						<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full md:w-48 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent appearance-none bg-white"
						>
							<option value="all">Tất cả</option>
							<option value="active">Hoạt động</option>
							<option value="inactive">Ngưng hoạt động</option>
						</select>
					</div>

					{/* Category + order */}
					<div className="flex items-center gap-2">
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="w-full md:w-48 pl-4 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent bg-white"
						>
							<option value="all">Tất cả thể loại</option>
							<option value="Dịch vụ">Dịch vụ</option>
							<option value="Kinh nghiệm">Kinh nghiệm</option>
							<option value="Sản phẩm">Sản phẩm</option>
							<option value="Thuê dịch vụ">Thuê dịch vụ</option>
							<option value="Khác">Khác</option>
						</select>
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
			</div>

			{isLoading && (
				<div className="mb-4 text-sm text-gray-500">Đang tải dữ liệu...</div>
			)}

			{/* Posts Table - Desktop */}
			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('name')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('content')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('category')}
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
							{sortedPosts.map((post) => (
								<tr
									key={post.id}
									onClick={() => setSelectedPost(post)}
									className={`hover:bg-gray-50 transition-colors cursor-pointer ${
										post.status === 'inactive' ? 'bg-gray-50' : ''
									}`}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
												{post.avatar ? (
													<img
														src={post.avatar}
														alt={post.author}
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[#1a4d2e]">
														{post.author.charAt(0)}
													</div>
												)}
											</div>
											<div className="flex flex-col">
												<p className="font-medium text-gray-900">
													{post.author}
												</p>
												<p className="text-sm text-gray-500">
													{formatDate(post.createdAt)}
												</p>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
										{snippet(post.content)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
											{post.category}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
												post.status,
											)}`}
										>
											{t(post.status)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex gap-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													setInactive(post);
												}}
												className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
												title={t('inactive_post')}
											>
												<PauseCircle className="w-4 h-4 text-gray-500" />
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													deletePost(post);
												}}
												className="p-2 hover:bg-red-100 rounded-lg transition-colors"
												title={t('delete_post')}
											>
												<Trash2 className="w-4 h-4 text-red-600" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Posts Cards - Mobile */}
			<div className="md:hidden space-y-4">
				{sortedPosts.map((post) => (
					<div
						key={post.id}
						onClick={() => setSelectedPost(post)}
						className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer ${
							post.status === 'inactive' ? 'border-gray-200 bg-gray-50' : ''
						}`}
					>
						<div className="flex items-start gap-3 mb-3">
							<div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
								{post.avatar ? (
									<img
										src={post.avatar}
										alt={post.author}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[#1a4d2e]">
										{post.author.charAt(0)}
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-medium text-gray-900 truncate">
									{post.author}
								</h3>
								<p className="text-sm text-gray-500">
									{formatDate(post.createdAt)}
								</p>
							</div>
							<span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
								{post.category}
							</span>
						</div>

						<p className="text-sm text-gray-600 line-clamp-2 mb-3">
							{post.content}
						</p>

						<div className="flex items-center justify-between">
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
									post.status,
								)}`}
							>
								{t(post.status)}
							</span>
							<div className="flex gap-2">
								<button
									onClick={(e) => {
										e.stopPropagation();
										setInactive(post);
									}}
									className="p-2 rounded-lg transition-colors hover:bg-yellow-100"
								>
									<PauseCircle className="w-4 h-4 text-gray-600" />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										deletePost(post);
									}}
									className="p-2 rounded-lg transition-colors hover:bg-red-100"
								>
									<Trash2 className="w-4 h-4 text-red-600" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Results Info */}
			<div className="mt-4 text-sm text-gray-500 text-center md:text-left">
				{t('total')}: {sortedPosts.length} {t('posts').toLowerCase()}
			</div>

			{/* Detail Modal */}
			{selectedPost && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
					role="dialog"
					aria-modal="true"
				>
					<div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
						<div className="flex items-start justify-between gap-4 p-4 md:p-6 border-b border-gray-100">
							<div>
								<h2 className="text-lg font-semibold text-gray-900">
									{selectedPost.author}
								</h2>
								<p className="text-sm text-gray-500">
									{formatDate(selectedPost.createdAt)}
								</p>
							</div>
							<button
								onClick={() => setSelectedPost(null)}
								className="text-sm text-[#1a4d2e] hover:underline"
							>
								{t('close')}
							</button>
						</div>

						<div className="p-4 md:p-6 space-y-4">
							<div className="flex flex-wrap gap-2">
								<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
									{selectedPost.category}
								</span>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
										selectedPost.status,
									)}`}
								>
									{t(selectedPost.status)}
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
								<div className="space-y-2">
									<p className="text-sm font-medium text-gray-700">
										{t('content')}
									</p>
									<p className="text-gray-800 leading-relaxed">
										{selectedPost.content}
									</p>
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-700">
											{t('contact')}
										</p>
										<p className="text-gray-800">
											{selectedPost.contact || '-'}
										</p>
									</div>
								</div>
								<div className="space-y-2">
									<p className="text-sm font-medium text-gray-700">
										{t('image')}
									</p>
									{selectedPost.image ? (
										<img
											src={selectedPost.image}
											alt={selectedPost.category}
											className="w-full max-h-80 object-cover rounded-lg border border-gray-100"
										/>
									) : (
										<div className="w-full h-40 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400">
											{t('image')}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

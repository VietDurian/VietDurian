'use client';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

import { getOwnPosts, approvePost } from '@/lib/api';
import { useLanguage } from '../context/LanguageContext';

export function PostRequestPage() {
	const { t } = useLanguage();
	const [posts, setPosts] = useState([]);
	const [selectedPost, setSelectedPost] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	// Approve / Reject state & helpers
	const [isActionLoading, setIsActionLoading] = useState(false);
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectTargetId, setRejectTargetId] = useState(null);
	const [rejectReason, setRejectReason] = useState('');

	const handleApprove = async (post) => {
		setIsActionLoading(true);
		try {
			await approvePostRequest(post.id, true);
		} finally {
			setIsActionLoading(false);
		}
	};

	const openRejectModal = (post) => {
		setRejectTargetId(post.id);
		setRejectReason('');
		setRejectModalOpen(true);
	};

	const confirmReject = async () => {
		if (!rejectTargetId) return;
		if (!rejectReason || !rejectReason.trim()) {
			toast.error(t('enter_reason'));
			return;
		}
		setIsActionLoading(true);
		try {
			await approvePostRequest(rejectTargetId, false, rejectReason.trim());
			setRejectModalOpen(false);
			setRejectTargetId(null);
			setRejectReason('');
		} catch (error) {
			toast.error(error?.message || t('error'));
		}
	};

	const cancelReject = () => {
		setRejectModalOpen(false);
		setRejectTargetId(null);
		setRejectReason('');
	};

	// Fetch posts with current filters and normalize author fields
	useEffect(() => {
		let isMounted = true;

		const fetchPosts = async () => {
			setIsLoading(true);
			try {
				const data = await getOwnPosts({
					status: 'progressing',
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
					title: item.title || '',
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
	}, []);

	// Hàm duyet or từ chối bài viết
	const approvePostRequest = async (postId, isApproved, reason) => {
		try {
			let status = false;
			if (!isApproved) {
				status = 'inactive';
			} else {
				status = 'active';
			}
			await approvePost(postId, status, reason);
			toast.success(
				isApproved ? t('post_approved_success') : t('post_rejected_success'),
			);
			// Cập nhật lại danh sách bài viết sau khi duyệt hoặc từ chối
			// Khi duyệt thành công: loại bỏ bài có postId trên khỏi danh sách (ẩn)
			setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
			// Nếu đang mở chi tiết bài này thì đóng luôn
			setSelectedPost((cur) => (cur && cur.id === postId ? null : cur));
		} catch (error) {
			toast.error(error?.message || t('error'));
		}
	};

	const formatDate = (value) => {
		if (!value) return '';
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
	};

	// snippet dung de hien thi noi dung rut gon
	const snippet = (text = '', max = 80) =>
		text.length > max ? `${text.slice(0, max)}...` : text;
	
	// set ngon ngu thay doi cho status 
	

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
							{posts.map((post) => (
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
										{snippet(post.title)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
											{post.category}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
											{t(post.status)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex gap-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleApprove(post);
												}}
												className="p-2 hover:bg-green-100 rounded-lg transition-colors"
												title={t('approve')}
											>
												<Check className="w-4 h-4 text-green-600" />
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													openRejectModal(post);
												}}
												className="p-2 hover:bg-red-100 rounded-lg transition-colors"
												title={t('reject')}
											>
												<X className="w-4 h-4 text-red-600" />
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
				{posts.map((post) => (
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
							{post.title}
						</p>

						<div className="flex items-center justify-between">
							<span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
								{t(post.status)}
							</span>
							<div className="flex gap-2">
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleApprove(post._id);
									}}
									className="p-2 rounded-lg transition-colors hover:bg-green-100"
								>
									<Check className="w-4 h-4 text-green-600" />
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										openRejectModal(post);
									}}
									className="p-2 rounded-lg transition-colors hover:bg-red-100"
								>
									<X className="w-4 h-4 text-red-600" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Results Info */}
			<div className="mt-4 text-sm text-gray-500 text-center md:text-left">
				{t('total')}: {posts.length} {t('posts').toLowerCase()}
			</div>

			{rejectModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
					<div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
						<div className="p-4 border-b">
							<h3 className="text-lg font-semibold text-gray-900">
								{t('reject_post')}
							</h3>
							<p className="text-sm text-gray-500">
								{t('reject_post_message')}
							</p>
						</div>
						<div className="p-4 space-y-3">
							<textarea
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								rows={4}
								className="w-full border border-gray-200 rounded-md p-2"
								placeholder={t('enter_reason')}
							/>
							<div className="flex justify-end gap-2">
								<button
									onClick={cancelReject}
									className="px-4 py-2 rounded-md border"
								>
									{t('cancel')}
								</button>
								<button
									onClick={confirmReject}
									className="px-4 py-2 rounded-md bg-red-600 text-white"
									disabled={isActionLoading}
								>
									{isActionLoading ? t('reject_button') : t('reject')}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

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
								<span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
									{t(selectedPost.status)}
								</span>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
								<div className="space-y-2">
									<p className="text-sm font-medium text-gray-700">
										{t('content')}
									</p>
									<p className="text-gray-800 leading-relaxed">
										{selectedPost.title}
									</p>
									<p className="text-sm font-medium text-gray-700">
										{t('description')}
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

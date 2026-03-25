'use client';

import { useState, useEffect, useMemo } from 'react';
import {
	Search,
	Filter,
	Ban,
	ShieldOff,
	Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '../../../../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import { UserDetail } from './UserDetail';

export function UsersPage() {
	const { t } = useLanguage();

	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);

	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');

	const [blockModalOpen, setBlockModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);

	const [page, setPage] = useState(1);
	const LIMIT = 10;

	const [pagination, setPagination] = useState({
		totalItems: 0,
		totalPages: 0,
		currentPage: 1,
		itemsPerPage: LIMIT,
	});

	const [userDetailOpen, setUserDetailOpen] = useState(false);
	const [userDetailId, setUserDetailId] = useState(null);

	const toIsBannedParam = (status) => {
		if (status === 'blocked') return true;
		if (status === 'active') return false;
		return undefined;
	};

	const mapUser = (u) => ({
		id: u._id || u.id,
		name: u.full_name || 'No Name',
		email: u.email || 'N/A',
		avatar: u.avatar || null,
		phone: u.phone || 'N/A',
		role: u.role || 'user',
		status: u.is_banned ? 'blocked' : 'active',
		joinDate:
			u.created_at || u.createdAt
				? new Date(u.created_at || u.createdAt).toLocaleDateString('vi-VN')
				: 'N/A',
	});

	const fetchUsers = async (params = {}) => {
		setLoading(true);
		try {
			const res = await usersAPI.filterUsers(params);

			const listRaw = Array.isArray(res?.data)
				? res.data
				: Array.isArray(res?.data?.data)
					? res.data.data
					: [];

			setUsers(listRaw.map(mapUser));

			const pgn = res?.data?.pagination || res?.pagination || null;

			setPagination(
				pgn
					? {
						totalItems: Number(pgn.totalItems ?? 0),
						totalPages: Number(pgn.totalPages ?? 0),
						currentPage: Number(pgn.currentPage ?? page),
						itemsPerPage: Number(pgn.itemsPerPage ?? LIMIT),
					}
					: {
						totalItems: Number(res?.data?.totalItems ?? listRaw.length ?? 0),
						totalPages: Math.max(
							1,
							Number(
								res?.data?.totalPages ??
								Math.ceil((listRaw.length || 0) / LIMIT)
							)
						),
						currentPage: page,
						itemsPerPage: LIMIT,
					}
			);
		} catch (error) {
			console.error('Error fetching users:', error);
			toast.error(t('error_fetching_users') || 'Error fetching users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const params = {
			page,
			limit: LIMIT,
		};

		if (searchTerm?.trim()) params.keyword = searchTerm.trim();
		if (roleFilter !== 'all') params.role = roleFilter;

		const isBanned = toIsBannedParam(statusFilter);
		if (typeof isBanned === 'boolean') params.is_banned = isBanned;

		fetchUsers(params);
	}, [page, searchTerm, roleFilter, statusFilter]);

	const handleViewDetail = (user) => {
		setUserDetailId(user.id);
		setUserDetailOpen(true);
	};

	const handleBlockUnblock = (user) => {
		setSelectedUser(user);
		setBlockModalOpen(true);
	};

	const confirmBlockUnblock = async () => {
		if (!selectedUser) return;

		try {
			setLoading(true);

			const newIsBanned = selectedUser.status !== 'blocked';
			const res = await usersAPI.toggleBanUser(selectedUser.id, newIsBanned);
			const updated = res.data || res.user || null;

			setUsers((prev) =>
				prev.map((u) =>
					u.id === (updated._id || updated.id)
						? { ...u, status: updated.is_banned ? 'blocked' : 'active' }
						: u
				)
			);

			toast.success(
				updated?.is_banned ? t('user_blocked') : t('user_unblocked')
			);

			setBlockModalOpen(false);
			setSelectedUser(null);
		} catch (error) {
			console.error('Error toggling ban status:', error);
			toast.error(t('error_updating_user_status'));
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-700';
			case 'blocked':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	const getRoleBadgeColor = (role) => {
		switch (role) {
			case 'farmer':
				return 'bg-[#1a4d2e] text-white';
			case 'admin':
				return 'bg-yellow-600 text-white';
			case 'serviceProvider':
				return 'bg-blue-600 text-white';
			case 'trader':
				return 'bg-purple-600 text-white';
			case 'contentExpert':
				return 'bg-pink-600 text-white';
			default:
				return 'bg-gray-600 text-white';
		}
	};

	const goToPage = (newPage) => {
		const totalPages =
			Number(pagination.totalPages ?? 0) ||
			Math.max(
				1,
				Math.ceil((pagination.totalItems || 0) / (pagination.itemsPerPage || LIMIT))
			);

		if (newPage >= 1 && newPage <= totalPages) {
			setPage(newPage);
		}
	};

	return (
		<div className="p-4 md:p-8">
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
					{t('user_management') || 'User Management'}
				</h1>
				<p className="text-sm md:text-base text-gray-600">
					{t('manage_users') || 'Manage users'}
				</p>
			</div>

			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder={t('search_users') || 'Search users'}
							value={searchTerm}
							onChange={(e) => {
								setPage(1);
								setSearchTerm(e.target.value);
							}}
							className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
						/>
					</div>

					<select
						value={roleFilter}
						onChange={(e) => {
							setPage(1);
							setRoleFilter(e.target.value);
						}}
						className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
					>
						<option value="all">{t('all_roles') || 'All roles'}</option>
						<option value="admin">{t('admin') || 'Admin'}</option>
						<option value="farmer">{t('farmer') || 'Farmer'}</option>
						<option value="trader">{t('trader') || 'Trader'}</option>
						<option value="serviceProvider">{t('serviceProvider') || 'Service Provider'}</option>
						<option value="contentExpert">{t('contentExpert') || 'Content Expert'}</option>
					</select>

					<select
						value={statusFilter}
						onChange={(e) => {
							setPage(1);
							setStatusFilter(e.target.value);
						}}
						className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e]"
					>
						<option value="all">{t('all_status') || 'All status'}</option>
						<option value="active">{t('active') || 'Active'}</option>
						<option value="blocked">{t('blocked') || 'Blocked'}</option>
					</select>
				</div>
			</div>

			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
								<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-100">
							{users.map((user) => (
								<tr
									key={user.id}
									className={user.status === 'blocked' ? 'bg-red-50/30' : ''}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											{user.avatar ? (
												<img
													src={user.avatar}
													alt={user.name}
													className="w-10 h-10 rounded-full object-cover"
													onError={(e) => {
														e.currentTarget.style.display = 'none';
														e.currentTarget.nextSibling.style.display = 'flex';
													}}
												/>
											) : null}

											<div
												style={{ display: user.avatar ? 'none' : 'flex' }}
												className={`w-10 h-10 rounded-full items-center justify-center text-white font-bold ${user.status === 'blocked'
													? 'bg-gradient-to-br from-red-500 to-red-700'
													: 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]'
													}`}
											>
												{user.name?.charAt(0) || '?'}
											</div>
											<div className="ml-3">
												<p
													className={`font-medium ${user.status === 'blocked'
														? 'text-gray-500 line-through'
														: 'text-gray-900'
														}`}
												>
													{user.name}
												</p>
											</div>
										</div>
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{user.email}
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
										{user.phone}
									</td>

									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
											{t(user.role) || user.role}
										</span>
									</td>

									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
											{t(user.status) || user.status}
										</span>
									</td>

									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex gap-2">
											<button
												onClick={() => handleViewDetail(user)}
												className=" border-blue-200 text-blue-600 hover:bg-blue-50 "
											>
												<Eye className="w-4 h-4 mr-1" />

											</button>

											<button
												onClick={() => handleBlockUnblock(user)}
												className={`p-2 rounded-lg transition-colors group ${user.status === 'blocked'
													? 'hover:bg-green-100'
													: 'hover:bg-red-100'
													}`}
												title={
													user.status === 'blocked'
														? t('unblock') || 'Unblock'
														: t('block') || 'Block'
												}
											>
												{user.status === 'blocked' ? (
													<ShieldOff className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
												) : (
													<Ban className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
												)}
											</button>
										</div>
									</td>
								</tr>
							))}

							{!loading && users.length === 0 && (
								<tr>
									<td colSpan={6} className="px-6 py-8 text-center text-gray-500">
										{t('No users found') || 'No users found'}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<div className="md:hidden space-y-4">
				{users.map((user) => (
					<div
						key={user.id}
						className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${user.status === 'blocked' ? 'border-red-200 bg-red-50/30' : ''
							}`}
					>
						<div className="flex items-start gap-3 mb-3">
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${user.status === 'blocked'
									? 'bg-gradient-to-br from-red-500 to-red-700'
									: 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]'
									}`}
							>
								{user.name?.charAt(0) || '?'}
							</div>

							<div className="flex-1 min-w-0">
								<h3
									className={`font-medium truncate ${user.status === 'blocked'
										? 'text-gray-500 line-through'
										: 'text-gray-900'
										}`}
								>
									{user.name}
								</h3>
							</div>
						</div>

						<div className="space-y-2 mb-3">
							<p className="text-sm text-gray-600 truncate">{user.email}</p>
							<p className="text-sm text-gray-600">{user.phone}</p>
						</div>

						<div className="flex items-center justify-between">
							<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
								{t(user.status) || user.status}
							</span>

							<div className="flex gap-2">
								<button
									onClick={() => handleViewDetail(user)}
									className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm"
								>
									{t('view_detail') || 'View Detail'}
								</button>

								<button
									onClick={() => handleBlockUnblock(user)}
									className={`p-2 rounded-lg transition-colors group ${user.status === 'blocked'
										? 'hover:bg-green-100'
										: 'hover:bg-red-100'
										}`}
								>
									{user.status === 'blocked' ? (
										<ShieldOff className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
									) : (
										<Ban className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
									)}
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="text-sm text-gray-600">
					{(() => {
						const total = Number(pagination.totalItems ?? users.length ?? 0);
						const perPage = Number(pagination.itemsPerPage ?? LIMIT);
						const cur = Number(page ?? 1);
						const start = total === 0 ? 0 : (cur - 1) * perPage + 1;
						const end = Math.min(cur * perPage, total);

						return `${t('Showing') || 'Showing'} ${start}–${end} ${t('of') || 'of'} ${total} ${(t('users') || 'users').toLowerCase()}`;
					})()}
				</div>

				<div className="flex items-center justify-center md:justify-end gap-2">
					<button
						onClick={() => goToPage(page - 1)}
						disabled={page <= 1}
						className={`px-3 py-1.5 text-sm rounded-md border ${page <= 1
							? 'text-gray-400 border-gray-200 bg-white cursor-not-allowed'
							: 'text-[#1a4d2e] border-gray-300 hover:bg-gray-50'
							}`}
					>
						{t('Previous') || 'Previous'}
					</button>

					{Array.from(
						{
							length:
								Number(pagination.totalPages ?? 0) ||
								Math.max(
									1,
									Math.ceil((pagination.totalItems || 0) / (pagination.itemsPerPage || LIMIT))
								),
						},
						(_, i) => i + 1
					).map((n) => (
						<button
							key={n}
							onClick={() => goToPage(n)}
							className={`px-3 py-1.5 text-sm rounded-md border ${n === page
								? 'bg-[#1a4d2e] text-white border-[#1a4d2e]'
								: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
								}`}
						>
							{n}
						</button>
					))}

					<button
						onClick={() => goToPage(page + 1)}
						disabled={
							page >=
							(pagination.totalPages ||
								Math.max(
									1,
									Math.ceil((pagination.totalItems || 0) / (pagination.itemsPerPage || LIMIT))
								))
						}
						className={`px-3 py-1.5 text-sm rounded-md border ${page >=
							(pagination.totalPages ||
								Math.max(
									1,
									Math.ceil((pagination.totalItems || 0) / (pagination.itemsPerPage || LIMIT))
								))
							? 'text-gray-400 border-gray-200 bg-white cursor-not-allowed'
							: 'text-[#1a4d2e] border-gray-300 hover:bg-gray-50'
							}`}
					>
						{t('Next') || 'Next'}
					</button>
				</div>
			</div>

			<UserDetail
				userId={userDetailId}
				isOpen={userDetailOpen}
				onClose={() => {
					setUserDetailOpen(false);
					setUserDetailId(null);
				}}
			/>

			{blockModalOpen && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] px-4">
					<div className="w-full max-w-sm rounded-[28px] bg-white px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
						<div className="flex justify-center">
							<div
								className={`flex h-14 w-14 items-center justify-center rounded-full ${selectedUser.status === 'blocked' ? 'bg-green-50' : 'bg-red-50'
									}`}
							>
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${selectedUser.status === 'blocked'
										? 'bg-green-100 text-green-600'
										: 'bg-red-100 text-red-500'
										}`}
								>
									!
								</div>
							</div>
						</div>



						<h2 className="mt-2 text-center text-[26px] font-semibold leading-tight text-gray-900">
							{selectedUser.is_banned === true
								? t('Bạn có chắc muốn mở chặn người dùng ' + selectedUser.name) || ''
								: t('Bạn có chắc muốn chặn người dùng ' + selectedUser.name) || 'b'}
						</h2>

						<p className="mt-4 text-center text-sm leading-6 text-gray-500">
							{selectedUser.is_banned === false
								? t('Người dùng sẽ có thể truy cập lại hệ thống sau khi được mở chặn .') ||
								''
								: t('Người dùng sẽ không thể tiếp tục truy cập hệ thống cho đến khi được mở chặn.') ||
								''}
							<div className="text-sm font-semibold text-gray-800">

							</div>
						</p>



						<div className="mt-6 grid grid-cols-2 gap-3">
							<button
								onClick={() => {
									setBlockModalOpen(false);
									setSelectedUser(null);
								}}
								className="h-11 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
							>
								{t('Hủy') || 'Cancel'}
							</button>

							<button
								onClick={confirmBlockUnblock}
								disabled={loading}
								className={`h-11 rounded-xl text-sm font-medium text-white transition ${selectedUser.status === 'blocked'
									? 'bg-green-500 hover:bg-green-600'
									: 'bg-red-500 hover:bg-red-600'
									} ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
							>
								{loading
									? t('loading') || 'Đang xử lý...'
									: selectedUser.status === 'blocked'
										? t('unblock') || 'Mở chặn'
										: t('block') || 'Chặn'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>

	);

}
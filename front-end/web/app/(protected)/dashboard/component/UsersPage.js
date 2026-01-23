'use client';
import { useState, useEffect, useMemo } from 'react';
import {
	Search,
	Filter,
	CheckCircle,
	XCircle,
	Ban,
	ShieldOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '../../../../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { BlockModal } from './BlockModal';


export function UsersPage() {
	const { t } = useLanguage();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [roleFilter, setRoleFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [blockModalOpen, setBlockModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);


	const mapUser = (u) => ({
		id: u._id || u.id,
		name: u.full_name || 'No Name',
		email: u.email,
		phone: u.phone || 'N/A',
		role: u.role,
		status: u.is_banned ? 'blocked' : 'active',
		joinDate: (u.created_at || u.createdAt)
			? new Date(u.created_at || u.createdAt).toLocaleDateString('vi-VN')
			: 'N/A',
		location: u.location || 'Unknown',
	})

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const data = await usersAPI.getAllUsers({ page: 1, limit: 100 });
			console.log('Fetched Users Data:', data);
			const list = Array.isArray(data?.users) ? data.users : [];
			setUsers(list.map(mapUser));
		} catch (error) {
			console.error('Loi Loi', error);
			toast.error(t('error_fetching_users'));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const term = searchTerm.trim();
		const handler = setTimeout(async () => {
			setLoading(true);
			try {
				if (term) {
					const res = await usersAPI.searchUsers(term, { page: 1, limit: 100 });
					const list = Array.isArray(res?.data) ? res.data : [];
					setUsers(list.map(mapUser));
				} else {
					await fetchUsers();
				}
			} catch (error) {
				console.error('Error searching users:', error);
				toast.error(t('error_fetching_users'));
			} finally {
				setLoading(false);
			}
		}, 500);

		return () => clearTimeout(handler);
	}, [searchTerm]);


	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesRole = roleFilter === 'all' || user.role === roleFilter;
		const matchesStatus =
			statusFilter === 'all' || user.status === statusFilter;
		return matchesSearch && matchesRole && matchesStatus;
	});

	const handleBlockUnblock = (user) => {
		setSelectedUser(user);
		setBlockModalOpen(true);
	};

	const confirmBlockUnblock = () => {
		if (!selectedUser) return;

		setUsers(
			users.map((user) => {
				if (user.id === selectedUser.id) {
					const newStatus = user.status === 'blocked' ? 'active' : 'blocked';

					// Show toast notification
					if (newStatus === 'blocked') {
						toast.success(t('user_blocked'), {
							description: `${user.name} ${t('blocked').toLowerCase()}`,
						});
					} else {
						toast.success(t('user_unblocked'), {
							description: `${user.name} ${t('active').toLowerCase()}`,
						});
					}

					return { ...user, status: newStatus };
				}
				return user;
			}),
		);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-700';
			case 'inactive':
				return 'bg-gray-100 text-gray-700';
			case 'pending':
				return 'bg-yellow-100 text-yellow-700';
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

	return (
		<div className="p-4 md:p-8">
			{/* Header */}
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
					{t('user_management')}
				</h1>
				<p className="text-sm md:text-base text-gray-600">
					{t('manage_users')}
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

					{/* Role Filter */}
					<div className="relative">
						<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className="w-full md:w-48 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent appearance-none bg-white"
						>
							<option value="all">{t('all_roles')}</option>
							<option value="farmer">{t('farmer')}</option>
							<option value="expert">{t('expert')}</option>
							<option value="business">{t('business')}</option>
						</select>
					</div>

					{/* Status Filter */}
					<div className="relative">
						<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full md:w-48 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent appearance-none bg-white"
						>
							<option value="all">{t('all_status')}</option>
							<option value="active">{t('active')}</option>
							<option value="pending">{t('pending')}</option>
							<option value="blocked">{t('blocked')}</option>
							<option value="inactive">{t('inactive')}</option>
						</select>
					</div>
				</div>
			</div>

			{/* Users Table - Desktop */}
			<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('name')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('email')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('phone')}
								</th>
								<th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
									{t('role')}
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
							{filteredUsers.map((user) => (
								<tr
									key={user.id}
									className={`hover:bg-gray-50 transition-colors ${user.status === 'blocked' ? 'bg-red-50/30' : ''}`}
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.status === 'blocked'
													? 'bg-gradient-to-br from-red-500 to-red-700'
													: 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]'
													}`}
											>
												{user.name.charAt(0)}
											</div>
											<div className="ml-3">
												<p
													className={`font-medium ${user.status === 'blocked' ? 'text-gray-500 line-through' : 'text-gray-900'}`}
												>
													{user.name}
												</p>
												<p className="text-sm text-gray-500">{user.location}</p>
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
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
										>
											{t(user.role)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
										>
											{t(user.status)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex gap-2">
											{user.status === 'pending' && (
												<>
													<button
														className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
														title={t('approve')}
													>
														<CheckCircle className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
													</button>
													<button
														className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
														title={t('reject')}
													>
														<XCircle className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
													</button>
												</>
											)}
											{user.status !== 'pending' && (
												<button
													onClick={() => handleBlockUnblock(user)}
													className={`p-2 rounded-lg transition-colors group ${user.status === 'blocked'
														? 'hover:bg-green-100'
														: 'hover:bg-red-100'
														}`}
													title={
														user.status === 'blocked'
															? t('unblock')
															: t('block')
													}
												>
													{user.status === 'blocked' ? (
														<ShieldOff className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
													) : (
														<Ban className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
													)}
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Users Cards - Mobile */}
			<div className="md:hidden space-y-4">
				{filteredUsers.map((user) => (
					<div
						key={user.id}
						className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${user.status === 'blocked' ? 'border-red-200 bg-red-50/30' : ''}`}
					>
						<div className="flex items-start gap-3 mb-3">
							<div
								className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${user.status === 'blocked'
									? 'bg-gradient-to-br from-red-500 to-red-700'
									: 'bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4f]'
									}`}
							>
								{user.name.charAt(0)}
							</div>
							<div className="flex-1 min-w-0">
								<h3
									className={`font-medium truncate ${user.status === 'blocked' ? 'text-gray-500 line-through' : 'text-gray-900'}`}
								>
									{user.name}
								</h3>
								<p className="text-sm text-gray-500">{user.location}</p>
							</div>
							<div className="flex gap-1">
								<span
									className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
								>
									{t(user.role)}
								</span>
							</div>
						</div>

						<div className="space-y-2 mb-3">
							<p className="text-sm text-gray-600 truncate">{user.email}</p>
							<p className="text-sm text-gray-600">{user.phone}</p>
						</div>

						<div className="flex items-center justify-between">
							<span
								className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
							>
								{t(user.status)}
							</span>
							<div className="flex gap-2">
								{user.status === 'pending' && (
									<>
										<button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
											<CheckCircle className="w-4 h-4 text-green-600" />
										</button>
										<button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
											<XCircle className="w-4 h-4 text-red-600" />
										</button>
									</>
								)}
								{user.status !== 'pending' && (
									<button
										onClick={() => handleBlockUnblock(user)}
										className={`p-2 rounded-lg transition-colors ${user.status === 'blocked'
											? 'hover:bg-green-100'
											: 'hover:bg-red-100'
											}`}
									>
										{user.status === 'blocked' ? (
											<ShieldOff className="w-4 h-4 text-green-600" />
										) : (
											<Ban className="w-4 h-4 text-red-600" />
										)}
									</button>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Results Info */}
			<div className="mt-4 text-sm text-gray-500 text-center md:text-left">
				{t('total')}: {filteredUsers.length} {t('users').toLowerCase()}
			</div>

			{/* Block/Unblock Modal */}
			{selectedUser && (
				<BlockModal
					isOpen={blockModalOpen}
					userName={selectedUser.name}
					isBlocked={selectedUser.status === 'blocked'}
					onClose={() => setBlockModalOpen(false)}
					onConfirm={confirmBlockUnblock}
				/>
			)}
		</div>
	);
};

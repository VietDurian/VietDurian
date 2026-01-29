import React, { useState } from 'react';
import {
	Users,
	ShoppingBag,
	FileCheck,
	LayoutDashboard,
	Settings,
	Sprout,
	X,
	Newspaper,
	MessageSquareText,
	ChevronDown,
	Flag,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function AdminSidebar({
	currentPage,
	onNavigate,
	isMobileOpen,
	onMobileClose,
}) {
	const { t } = useLanguage();
	const {user} = useAuth();
	const [isModerationOpen, setIsModerationOpen] = useState(false);
	const [isReportsOpen, setIsReportsOpen] = useState(false);

	const menuItems = [
		{ id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
		{ id: 'users', icon: Users, label: t('users') },
		{ id: 'gardens', icon: Sprout, label: t('gardens') },
		{ id: 'stages', icon: ShoppingBag, label: t('stages') },
		{ id: 'posts', icon: MessageSquareText, label: t('posts') },
		{ id: 'blogs', icon: Newspaper, label: t('blogs') },
		{ id: 'reports', icon: Flag, label: t('reports') },
		{ id: 'moderation', icon: FileCheck, label: t('moderation') },
		{ id: 'settings', icon: Settings, label: t('settings') },
	];

	const handleItemClick = (id) => {
		onNavigate(id);
		onMobileClose();
	};

	return (
		<>
			{/* Mobile Overlay */}
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={onMobileClose}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 h-screen bg-[#1a4d2e] text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
			>
				{/* Close button - Mobile only */}
				<button
					onClick={onMobileClose}
					className="lg:hidden absolute top-4 right-4 p-2 hover:bg-[#2d7a4f] rounded-lg transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				{/* Logo */}
				<div className="p-6 border-b border-[#2d7a4f]">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-[#ffd93d] rounded-lg flex items-center justify-center">
							<Sprout className="w-6 h-6 text-[#1a4d2e]" />
						</div>
						<div>
							<h1 className="text-xl font-bold text-white">VietDurian</h1>
							<p className="text-xs text-[#a8d5ba]">Admin Dashboard</p>
						</div>
					</div>
				</div>

				{/* Menu Items */}
				<nav className="flex-1 p-4 space-y-2">
					{menuItems.map((item) => {
						const Icon = item.icon;

						// Moderation is expandable and contains two sub-items
						if (item.id === 'moderation') {
							return (
								<div key={item.id}>
									<button
										onClick={() => setIsModerationOpen((s) => !s)}
										className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id ||
											(currentPage && currentPage.startsWith('moderation'))
											? 'bg-[#ffd93d] text-[#1a4d2e] shadow-lg'
											: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
											}`}
									>
										<div className="flex items-center gap-3">
											<Icon className="w-5 h-5" />
											<span className="font-medium">{item.label}</span>
										</div>
										<ChevronDown
											className={`w-4 h-4 transform transition-transform ${isModerationOpen ? 'rotate-180' : ''}`}
										/>
									</button>

									{/* Sub-items for moderation */}
									{isModerationOpen && (
										<div className="mt-2 space-y-1 pl-8">
											<button
												onClick={() => handleItemClick('postRequests')}
												className={`w-full text-left px-4 py-2 rounded-lg transition-all ${currentPage === 'postRequests'
													? 'bg-[#ffd93d] text-[#1a4d2e]'
													: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
													}`}
											>
												<span className="text-sm">{t('posts')}</span>
											</button>

											<button
												onClick={() => handleItemClick('moderation_users')}
												className={`w-full text-left px-4 py-2 rounded-lg transition-all ${currentPage === 'moderation_users'
													? 'bg-[#ffd93d] text-[#1a4d2e]'
													: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
													}`}
											>
												<span className="text-sm">{t('users')}</span>
											</button>
										</div>
									)}
								</div>
							);
						}

						// Reports dropdown (expandable)
						if (item.id === 'reports') {
							return (
								<div key={item.id}>
									<button
										onClick={() => setIsReportsOpen((s) => !s)}
										className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id ||
											currentPage === 'reportComments'
											? 'bg-[#ffd93d] text-[#1a4d2e] shadow-lg'
											: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
											}`}
									>
										<div className="flex items-center gap-3">
											<Icon className="w-5 h-5" />
											<span className="font-medium">{item.label}</span>
										</div>
										<ChevronDown
											className={`w-4 h-4 transform transition-transform ${isReportsOpen ? 'rotate-180' : ''}`}
										/>
									</button>

									{isReportsOpen && (
										<div className="mt-2 space-y-1 pl-8">
											<button
												onClick={() => handleItemClick('reports')}
												className={`w-full text-left px-4 py-2 rounded-lg transition-all ${currentPage === 'reports'
													? 'bg-[#ffd93d] text-[#1a4d2e]'
													: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
													}`}
											>
												<span className="text-sm">{t('report_post')}</span>
											</button>

											<button
												onClick={() => handleItemClick('reportComments')}
												className={`w-full text-left px-4 py-2 rounded-lg transition-all ${currentPage === 'reportComments'
													? 'bg-[#ffd93d] text-[#1a4d2e]'
													: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
													}`}
											>
												<span className="text-sm">
													{t('report_comment')}
												</span>
											</button>
										</div>
									)}
								</div>
							);
						}

						return (
							<button
								key={item.id}
								onClick={() => handleItemClick(item.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
									? 'bg-[#ffd93d] text-[#1a4d2e] shadow-lg'
									: 'text-[#a8d5ba] hover:bg-[#2d7a4f] hover:text-white'
									}`}
							>
								<Icon className="w-5 h-5" />
								<span className="font-medium">{item.label}</span>
							</button>
						);
					})}
				</nav>

				{/* Admin Info */}
				<div className="p-6 border-t border-[#2d7a4f]">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-[#ffd93d] rounded-full flex items-center justify-center">
							<span className="text-[#1a4d2e] font-bold">AD</span>
						</div>
						<div>
							<p className="font-medium text-white">{user?.full_name}</p>
							<p className="text-xs text-[#a8d5ba]">{user?.email}</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

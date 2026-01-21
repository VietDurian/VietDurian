'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Toaster } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminSidebar } from './component/AdminSidebar';
import { DashboardPage } from './component/DashboardPage';
import { UsersPage } from './component/UsersPage';
import { PostsPage } from './component/PostsPage';
import { LanguageSwitcher } from './component/LanguageSwitcher';

export default function App() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [currentPage, setCurrentPage] = useState('dashboard');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		if (loading) return;
		if (!user || user.role !== 'admin') {
			router.push('/');
		}
	}, [loading, router, user]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen text-[#1a4d2e] font-semibold">
				Đang kiểm tra quyền truy cập...
			</div>
		);
	}

	if (!user || user.role !== 'admin') {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-50 text-gray-700">
				Bạn không có quyền truy cập trang này.
			</div>
		);
	}

	const renderPage = () => {
		switch (currentPage) {
			case 'dashboard':
				return <DashboardPage onNavigate={setCurrentPage} />;
			case 'users':
				return <UsersPage />;
			case 'gardens':
				return (
					<div className="p-8 text-center">
						<h1 className="text-2xl font-bold text-[#1a4d2e]">
							Trang Vườn sầu riêng
						</h1>
						<p className="text-gray-600 mt-2">Đang phát triển...</p>
					</div>
				);
			case 'products':
				return (
					<div className="p-8 text-center">
						<h1 className="text-2xl font-bold text-[#1a4d2e]">
							Trang Sản phẩm
						</h1>
						<p className="text-gray-600 mt-2">Đang phát triển...</p>
					</div>
				);
			case 'posts':
				return <PostsPage />;

			case 'blogs':
				return (
					<div className="p-8 text-center">
						<h1 className="text-2xl font-bold text-[#1a4d2e]">Trang Blog</h1>
						<p className="text-gray-600 mt-2">Đang phát triển...</p>
					</div>
				);
			case 'moderation':
				return (
					<div className="p-8 text-center">
						<h1 className="text-2xl font-bold text-[#1a4d2e]">
							Trang Kiểm duyệt
						</h1>
						<p className="text-gray-600 mt-2">Đang phát triển...</p>
					</div>
				);
			case 'settings':
				return (
					<div className="p-8 text-center">
						<h1 className="text-2xl font-bold text-[#1a4d2e]">Trang Cài đặt</h1>
						<p className="text-gray-600 mt-2">Đang phát triển...</p>
					</div>
				);
			default:
				return <DashboardPage onNavigate={setCurrentPage} />;
		}
	};

	return (
		<LanguageProvider>
			<div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
				{/* Sidebar */}
				<AdminSidebar
					currentPage={currentPage}
					onNavigate={setCurrentPage}
					isMobileOpen={isMobileMenuOpen}
					onMobileClose={() => setIsMobileMenuOpen(false)}
				/>

				{/* Main Content */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{/* Mobile Header */}
					<div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
						<button
							onClick={() => setIsMobileMenuOpen(true)}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<Menu className="w-6 h-6 text-[#1a4d2e]" />
						</button>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-[#ffd93d] rounded-lg flex items-center justify-center">
								<span className="text-[#1a4d2e] font-bold text-sm">VD</span>
							</div>
							<span className="font-bold text-[#1a4d2e]">VietDurian</span>
						</div>
						<LanguageSwitcher />
					</div>

					{/* Desktop Header with Language Switcher */}
					<div className="hidden lg:flex bg-white border-b border-gray-200 p-4 justify-end">
						<LanguageSwitcher />
					</div>

					{/* Page Content */}
					<div className="flex-1 overflow-auto">{renderPage()}</div>
				</div>
			</div>

			{/* Toast Notifications */}
			<Toaster
				position="top-right"
				richColors
				closeButton
				toastOptions={{
					style: {
						background: 'white',
						border: '1px solid #e5e7eb',
					},
				}}
			/>
		</LanguageProvider>
	);
}

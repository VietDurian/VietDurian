'use client';
import { createContext, useContext, useState } from 'react';

const translations = {
	vi: {
		// Header
		welcome: 'Chào mừng trở lại, Admin!',
		overview: 'Tổng quan hoạt động hệ thống VietDurian',

		// Sidebar
		dashboard: 'Bảng điều khiển',
		users: 'Người dùng',
		gardens: 'Vườn sầu riêng',
		products: 'Sản phẩm',
		posts: 'Bài viết',
		blogs: 'Blog',
		moderation: 'Kiểm duyệt',
		settings: 'Cài đặt',

		// Stats
		total_farmers: 'Tổng số nông dân',
		experts: 'Chuyên gia',
		durian_gardens: 'Tổng số bài Post',
		growth: 'Tổng số bài Blog',
		vs_last_month: 'so với tháng trước',

		// Posts
		post_management: 'Quản lý bài viết',
		content: 'Nội dung',
		category: 'Thể loại',
		inactive_post: 'Đưa về trạng thái Inactive',
		delete_post: 'Xóa bài viết',
		close: 'Đóng',
		image: 'Hình ảnh',
		contact: 'Liên hệ',

		// Charts
		market_trend: 'Xu hướng thị trường sầu riêng',
		price_volume: 'Giá và khối lượng giao dịch theo tháng',
		garden_distribution: 'Bản đồ phân bổ vườn sầu riêng',
		track_coordinates: 'Theo dõi tọa độ và diện tích vườn trên toàn quốc',
		avg_price: 'Giá trung bình',
		volume: 'Khối lượng',
		area: 'Diện tích',
		total: 'Tổng',

		// Control Center
		permission_requests: 'Yêu cầu duyệt quyền',
		manage_users: 'Quản lý tài khoản người dùng',
		reported_posts: 'Báo cáo vi phạm',
		content_moderation: 'Kiểm duyệt nội dung bài viết',
		view_all: 'Xem tất cả',
		view_details: 'Xem chi tiết',

		// Users Page
		user_management: 'Quản lý người dùng',
		search_users: 'Tìm kiếm người dùng...',
		all_roles: 'Tất cả vai trò',
		all_status: 'Tất cả trạng thái',
		farmer: 'Nông dân',
		expert: 'Chuyên gia',
		business: 'Doanh nghiệp',
		active: 'Hoạt động',
		inactive: 'Ngưng hoạt động',
		pending: 'Chờ duyệt',
		name: 'Họ tên',
		email: 'Email',
		phone: 'Số điện thoại',
		role: 'Vai trò',
		status: 'Trạng thái',
		actions: 'Thao tác',
		edit: 'Sửa',
		delete: 'Xóa',
		approve: 'Duyệt',
		reject: 'Từ chối',
		block: 'Chặn',
		unblock: 'Bỏ chặn',
		blocked: 'Đã chặn',
		block_user: 'Chặn người dùng',
		unblock_user: 'Bỏ chặn người dùng',
		block_confirm: 'Bạn có chắc chắn muốn chặn người dùng này?',
		unblock_confirm: 'Bạn có chắc chắn muốn bỏ chặn người dùng này?',
		block_description: 'Người dùng sẽ không thể đăng nhập và sử dụng hệ thống.',
		unblock_description:
			'Người dùng sẽ có thể đăng nhập và sử dụng hệ thống trở lại.',
		cancel: 'Hủy',
		confirm: 'Xác nhận',
		success: 'Thành công',
		user_blocked: 'Đã chặn người dùng thành công',
		user_unblocked: 'Đã bỏ chặn người dùng thành công',

		// Priority
		high: 'Cao',
		medium: 'Trung bình',
		low: 'Thấp',
	},
	en: {
		// Header
		welcome: 'Welcome back, Admin!',
		overview: 'VietDurian System Overview',

		// Sidebar
		dashboard: 'Dashboard',
		users: 'Users',
		gardens: 'Durian Gardens',
		products: 'Products',
		posts: 'Posts',
		blogs: 'Blogs',
		moderation: 'Moderation',
		settings: 'Settings',

		// Stats
		total_farmers: 'Total Farmers',
		experts: 'Experts',
		durian_gardens: 'Total Posts',
		growth: 'Total Blogs',
		vs_last_month: 'vs last month',

		// Posts
		post_management: 'Post Management',
		content: 'Content',
		category: 'Category',
		inactive_post: 'Set to Inactive',
		delete_post: 'Delete Post',
		close: 'Close',
		image: 'Image',
		contact: 'Contact',

		// Charts
		market_trend: 'Durian Market Trend',
		price_volume: 'Price and volume by month',
		garden_distribution: 'Durian Garden Distribution Map',
		track_coordinates: 'Track garden coordinates and area nationwide',
		avg_price: 'Average Price',
		volume: 'Volume',
		area: 'Area',
		total: 'Total',

		// Control Center
		permission_requests: 'Permission Requests',
		manage_users: 'Manage user accounts',
		reported_posts: 'Reported Posts',
		content_moderation: 'Content moderation',
		view_all: 'View all',
		view_details: 'View details',

		// Users Page
		user_management: 'User Management',
		search_users: 'Search users...',
		all_roles: 'All roles',
		all_status: 'All status',
		farmer: 'Farmer',
		expert: 'Expert',
		business: 'Business',
		active: 'Active',
		inactive: 'Inactive',
		pending: 'Pending',
		name: 'Name',
		email: 'Email',
		phone: 'Phone',
		role: 'Role',
		status: 'Status',
		actions: 'Actions',
		edit: 'Edit',
		delete: 'Delete',
		approve: 'Approve',
		reject: 'Reject',
		block: 'Block',
		unblock: 'Unblock',
		blocked: 'Blocked',
		block_user: 'Block User',
		unblock_user: 'Unblock User',
		block_confirm: 'Are you sure you want to block this user?',
		unblock_confirm: 'Are you sure you want to unblock this user?',
		block_description: 'User will not be able to login and use the system.',
		unblock_description: 'User will be able to login and use the system again.',
		cancel: 'Cancel',
		confirm: 'Confirm',
		success: 'Success',
		user_blocked: 'User blocked successfully',
		user_unblocked: 'User unblocked successfully',

		// Priority
		high: 'High',
		medium: 'Medium',
		low: 'Low',
	},
};

const LanguageContext = createContext(undefined);

export function LanguageProvider({ children }) {
	const [language, setLanguage] = useState('vi');

	const t = (key) => {
		const value = translations[language]?.[key];
		return value || key;
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (!context) {
		throw new Error('useLanguage must be used within a LanguageProvider');
	}
	return context;
}

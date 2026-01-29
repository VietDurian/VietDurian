'use client';
import { createContext, useContext, useState } from 'react';

const translations = {
	vi: {
		// Header
		welcome: 'Chào mừng trở lại, Admin!',
		overview: 'Tổng quan hoạt động hệ thống VietDurian',
		logout: 'Đăng xuất',

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
		inactive_post: 'Đưa về trạng thái Ngưng hoạt động',
		active_post: 'Đưa về trạng thái Hoạt động',
		delete_post: 'Xóa bài viết',
		close: 'Đóng',
		image: 'Hình ảnh',
		contact: 'Liên hệ',
		showing_range: 'Hiển thị',

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

		// Status labels
		Pending: 'Chờ duyệt',
		Resolved: 'Đã xử lý',

		// Priority
		high: 'Cao',
		medium: 'Trung bình',
		low: 'Thấp',

		// page
		to: 'đến',
		of: 'trên',
		page: 'Trang',

		// Delete Post Modal
		delete_post_title: 'Xóa bài viết',
		delete_post_message: 'Bạn có chắc chắn muốn xóa bài viết này?',

		// postRequests
		postRequests: 'Yêu cầu bài viết',
		search_posts: 'Tìm kiếm bài viết...',
		reject_post: 'Từ chối bài viết',
		reject_post_message: 'Bạn có chắc chắn muốn từ chối bài viết này?',
		enter_reason: 'Nhập lý do từ chối...',
		post_approved_success: 'Duyệt bài viết thành công',
		post_rejected_success: 'Từ chối bài viết thành công',
		reject_button: 'Từ chối',

		// Reports Page
		reports: 'Báo cáo',
		manage_reports: 'Xử lý các báo cáo vi phạm từ người dùng',
		search_reports: 'Tìm theo tên người báo cáo / lý do / trạng thái…',
		reporter: 'Người báo cáo',
		reason: 'Lý do',
		report_image: 'Hình ảnh',
		time: 'Thời gian',
		resolve: 'Xử lí',
		resolved: 'Đã xử lý',
		completed: 'Đã hoàn thành',
		newest: 'Mới nhất',
		oldest: 'Cũ nhất',
		sort_date: 'Ngày',
		sort_name: 'Tên',
		report_resolved: 'Đã xử lý báo cáo thành công',
		report_resolved_desc: 'Báo cáo đã được đánh dấu là đã hoàn thành',
		confirm_delete_title: 'Xác nhận xóa',
		confirm_delete_desc: 'Bạn có chắc muốn xóa báo cáo này?',
		no_image: 'Không có hình ảnh',
		report_post: 'Bài viết',
		report_comment: 'Bình luận',
		ban_confirm_comment: 'Bạn có chắc chắn muốn khoá bình luận này?',
		ban_success: 'Bình luận đã bị khoá',
		hide: 'Ẩn bình luận',
		hide_confirm_comment:
			'Bạn có chắc chắn muốn ẩn bình luận này và đánh dấu báo cáo là đã xử lý?',
		hide_success: 'Bình luận đã được ẩn',
		hide_and_resolved_success:
			'Bình luận đã được ẩn và báo cáo đã được đánh dấu là đã xử lý',
		report_status_updated: 'Cập nhật trạng thái thành công',
		no_reports: 'Không có báo cáo',

		// blogs
		author: 'Họ tên tác giả',
		title: 'Tiêu đề',
		manage_blogs: 'Quản lý bài viết kiến thức',
		search_blogs: 'Tìm kiếm blog...',
		confirm_delete_blog: 'Bạn có chắc chắn muốn xóa blog này?',
		delete_warning: 'Hành động này không thể hoàn tác!',

		// stages
		stages: 'Giai đoạn',
	},
	en: {
		// Header
		welcome: 'Welcome back, Admin!',
		overview: 'VietDurian System Overview',
		logout: 'Logout',

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
		search_posts: 'Search posts...',
		content: 'Content',
		category: 'Category',
		inactive_post: 'Set to Inactive',
		active_post: 'Set to Active',
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
		// Status labels
		Pending: 'Pending',
		Resolved: 'Resolved',

		// Priority
		high: 'High',
		medium: 'Medium',
		low: 'Low',

		// page
		to: 'to',
		of: 'of',
		page: 'Page',

		// Delete Post Modal
		delete_post_title: 'Delete Post',
		delete_post_message: 'Are you sure you want to delete this post?',

		// postRequests
		postRequests: 'Post Requests',
		reject_post: 'Reject Post',
		reject_post_message: 'Are you sure you want to reject this post?',
		enter_reason: 'Enter rejection reason...',
		post_approved_success: 'Post approved successfully',
		post_rejected_success: 'Post rejected successfully',
		reject_button: 'Reject',

		// Reports Page
		reports: 'Reports',
		manage_reports: 'Handle violation reports from users',
		search_reports: 'Search by reporter name / reason / status…',
		reporter: 'Reporter',
		reason: 'Reason',
		report_image: 'Image',
		time: 'Time',
		resolve: 'Resolve',
		resolved: 'Resolved',
		completed: 'Completed',
		newest: 'Newest',
		oldest: 'Oldest',
		sort_date: 'Date',
		sort_name: 'Name',
		report_resolved: 'Report resolved successfully',
		report_resolved_desc: 'Report has been marked as completed',
		confirm_delete_title: 'Confirm deletion',
		confirm_delete_desc: 'Are you sure you want to delete this report?',
		no_image: 'No image',
		report_post: 'Posts',
		report_comment: 'Comment',
		ban_confirm_comment: 'Are you sure you want to ban this comment?',
		ban_success: 'Comment banned successfully',
		hide: 'Hide Comment',
		hide_confirm_comment:
			'Are you sure you want to hide this comment and mark the report as resolved?',
		hide_success: 'Comment hidden successfully',
		hide_and_resolved_success: 'Comment hidden and report marked as resolved',
		report_status_updated: 'Status updated successfully',
		no_reports: 'No reports',
		showing_range: 'Showing',

		// blogs
		author: 'Author Name',
		title: 'Title',
		manage_blogs: 'Manage knowledge blogs',
		search_blogs: 'Search blogs...',
		confirm_delete_blog: 'Are you sure you want to delete this blog?',
		delete_warning: 'This action cannot be undone!',

		// stages
		stages: 'Stages',
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

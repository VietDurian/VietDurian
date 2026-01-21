import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

// Mock data cho yêu cầu duyệt quyền
const permissionRequests = [
	{
		id: 1,
		user: 'Nguyễn Văn A',
		role: 'Nông dân',
		date: '16/01/2026',
		status: 'pending',
	},
	{
		id: 2,
		user: 'Trần Thị B',
		role: 'Chuyên gia',
		date: '16/01/2026',
		status: 'pending',
	},
	{
		id: 3,
		user: 'Lê Văn C',
		role: 'Nông dân',
		date: '15/01/2026',
		status: 'pending',
	},
	{
		id: 4,
		user: 'Phạm Thị D',
		role: 'Doanh nghiệp',
		date: '15/01/2026',
		status: 'pending',
	},
];

// Mock data cho báo cáo vi phạm
const reportedPosts = [
	{
		id: 1,
		post: 'Bài viết về giá sầu riêng',
		reporter: 'User123',
		reason: 'Thông tin sai lệch',
		priority: 'high',
	},
	{
		id: 2,
		post: 'Chia sẻ kinh nghiệm chăm sóc',
		reporter: 'User456',
		reason: 'Spam quảng cáo',
		priority: 'medium',
	},
	{
		id: 3,
		post: 'Hỏi về giống sầu riêng',
		reporter: 'User789',
		reason: 'Ngôn từ không phù hợp',
		priority: 'low',
	},
	{
		id: 4,
		post: 'Bán sầu riêng giá rẻ',
		reporter: 'User101',
		reason: 'Lừa đảo',
		priority: 'high',
	},
];

export function ControlCenter() {
	const { t } = useLanguage();

	const getPriorityColor = (priority) => {
		switch (priority) {
			case 'high':
				return 'text-red-600 bg-red-50';
			case 'medium':
				return 'text-yellow-600 bg-yellow-50';
			case 'low':
				return 'text-blue-600 bg-blue-50';
			default:
				return 'text-gray-600 bg-gray-50';
		}
	};

	const getPriorityLabel = (priority) => {
		return t(priority);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
			{/* Permission Requests */}
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<div>
						<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
							{t('permission_requests')}
						</h2>
						<p className="text-xs md:text-sm text-gray-500">
							{t('manage_users')}
						</p>
					</div>
					<div className="w-8 h-8 md:w-10 md:h-10 bg-[#ffd93d] rounded-lg flex items-center justify-center flex-shrink-0">
						<Clock className="w-4 h-4 md:w-5 md:h-5 text-[#1a4d2e]" />
					</div>
				</div>

				<div className="space-y-3">
					{permissionRequests.map((request) => (
						<div
							key={request.id}
							className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-[#1a4d2e] text-sm md:text-base truncate">
									{request.user}
								</p>
								<div className="flex items-center gap-2 mt-1 flex-wrap">
									<span className="text-xs px-2 py-1 bg-[#1a4d2e] text-white rounded">
										{t(request.role)}
									</span>
									<span className="text-xs text-gray-500">{request.date}</span>
								</div>
							</div>
							<div className="flex gap-1 md:gap-2 flex-shrink-0 ml-2">
								<button className="p-1.5 md:p-2 hover:bg-green-100 rounded-lg transition-colors group">
									<CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-green-600" />
								</button>
								<button className="p-1.5 md:p-2 hover:bg-red-100 rounded-lg transition-colors group">
									<XCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-red-600" />
								</button>
							</div>
						</div>
					))}
				</div>

				<button className="w-full mt-4 py-2 text-xs md:text-sm text-[#1a4d2e] hover:bg-gray-50 rounded-lg transition-colors">
					{t('view_all')} ({permissionRequests.length})
				</button>
			</div>

			{/* Reported Posts */}
			<div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<div>
						<h2 className="text-base md:text-lg font-bold text-[#1a4d2e]">
							{t('reported_posts')}
						</h2>
						<p className="text-xs md:text-sm text-gray-500">
							{t('content_moderation')}
						</p>
					</div>
					<div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
					</div>
				</div>

				<div className="space-y-3">
					{reportedPosts.map((report) => (
						<div
							key={report.id}
							className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-[#1a4d2e] text-sm md:text-base truncate">
									{report.post}
								</p>
								<div className="flex items-center gap-2 mt-1 flex-wrap">
									<span
										className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(report.priority)}`}
									>
										{getPriorityLabel(report.priority)}
									</span>
									<span className="text-xs text-gray-500 truncate">
										{report.reason}
									</span>
								</div>
							</div>
							<div className="flex gap-2 flex-shrink-0 ml-2">
								<button className="px-2 md:px-3 py-1 md:py-1.5 text-xs bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors">
									{t('view_details')}
								</button>
							</div>
						</div>
					))}
				</div>

				<button className="w-full mt-4 py-2 text-xs md:text-sm text-[#1a4d2e] hover:bg-gray-50 rounded-lg transition-colors">
					{t('view_all')} ({reportedPosts.length})
				</button>
			</div>
		</div>
	);
}

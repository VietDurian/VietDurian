import { Users, UserCheck, MessageSquareText, Newspaper } from 'lucide-react';

import { ControlCenter } from './ControlCenter';
import { GardenHeatmap } from './GardenHeatmap';
import { MarketTrendChart } from './MarketTrendChart';
import { StatsCard } from './StatsCard';
import { useLanguage } from '../context/LanguageContext';

export function DashboardPage({ onNavigate }) {
	const { t } = useLanguage();

	return (

		<div className="p-4 md:p-8">
			{/* Header */}
			<div className="mb-6 md:mb-8">
				<h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
					{t('welcome')}
				</h1>
				<p className="text-sm md:text-base text-gray-600">{t('overview')}</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
				<StatsCard
					title={t('total_farmers')}
					value="1,234"
					change="+12.5%"
					changeType="increase"
					icon={Users}
					onClick={() => onNavigate?.('users')}
				/>
				<StatsCard
					title={t('experts')}
					value="87"
					change="+5.2%"
					changeType="increase"
					icon={UserCheck}
				/>
				<StatsCard
					title={t('durian_gardens')}
					value="456"
					change="+8.7%"
					changeType="increase"
					icon={Newspaper}
					onClick={() => onNavigate?.('posts')}
				/>
				<StatsCard
					title={t('growth')}
					value="18.4%"
					change="+3.1%"
					changeType="increase"
					icon={MessageSquareText}
					onClick={() => onNavigate?.('blogs')}
				/>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
				<MarketTrendChart />
				<GardenHeatmap />
			</div>

			{/* Control Center */}
			<ControlCenter />
		</div>
	);
}

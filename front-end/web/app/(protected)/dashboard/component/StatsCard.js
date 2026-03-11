"use client";
import { useLanguage } from '../context/LanguageContext';

export function StatsCard({
	title,
	value,
	change,
	changeType,
	icon: Icon,
	onClick,
}) {
	const { t } = useLanguage();
	const hasChange = change !== undefined && change !== null && String(change).trim() !== '';
	const tone =
		changeType === 'increase'
			? 'text-green-600'
			: changeType === 'decrease'
				? 'text-red-600'
				: 'text-gray-600';
	const arrow =
		changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '→';

	return (
		<div
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			className={`bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a4d2e]' : ''}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<p className="text-xs md:text-sm text-gray-600 mb-1">{title}</p>
					<h3 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
						{value}
					</h3>
					{hasChange && (
						<div className="flex items-center gap-1">
							<span className={`text-xs md:text-sm font-medium ${tone}`}>
								{arrow} {change}
							</span>
							<span className="text-xs text-gray-500 hidden md:inline">
								{t('vs_last_month')}
							</span>
						</div>
					)}
				</div>
				{Icon ? (
					<div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-[#1a4d2e] to-[#2d7a4f] rounded-lg flex items-center justify-center shrink-0">
						<Icon className="w-5 h-5 md:w-6 md:h-6 text-[#ffd93d]" />
					</div>
				) : null}
			</div>
		</div>
	);
}

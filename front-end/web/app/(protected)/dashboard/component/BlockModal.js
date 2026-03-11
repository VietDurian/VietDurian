"use client";
import { X, AlertTriangle, ShieldOff } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export function BlockModal({
	isOpen,
	userName,
	isBlocked,
	onClose,
	onConfirm,
}) {
	const { t } = useLanguage();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Overlay */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
				>
					<X className="w-5 h-5 text-gray-500" />
				</button>

				{/* Icon */}
				<div
					className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${
						isBlocked ? 'bg-green-100' : 'bg-red-100'
					}`}
				>
					{isBlocked ? (
						<ShieldOff className="w-8 h-8 text-green-600" />
					) : (
						<AlertTriangle className="w-8 h-8 text-red-600" />
					)}
				</div>

				{/* Title */}
				<h2 className="text-xl font-bold text-center text-gray-900 mb-2">
					{isBlocked ? t('unblock_user') : t('block_user')}
				</h2>

				{/* User Name */}
				<p className="text-center text-gray-700 mb-2">
					<span className="font-semibold text-[#1a4d2e]">{userName}</span>
				</p>

				{/* Description */}
				<p className="text-center text-sm text-gray-600 mb-2">
					{isBlocked ? t('unblock_confirm') : t('block_confirm')}
				</p>

				{/* Additional Info */}
				<div
					className={`p-3 rounded-lg mb-6 ${
						isBlocked
							? 'bg-green-50 border border-green-200'
							: 'bg-red-50 border border-red-200'
					}`}
				>
					<p className="text-xs text-center text-gray-700">
						{isBlocked ? t('unblock_description') : t('block_description')}
					</p>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
					>
						{t('cancel')}
					</button>
					<button
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium text-white ${
							isBlocked
								? 'bg-green-600 hover:bg-green-700'
								: 'bg-red-600 hover:bg-red-700'
						}`}
					>
						{t('confirm')}
					</button>
				</div>
			</div>
		</div>
	);
}

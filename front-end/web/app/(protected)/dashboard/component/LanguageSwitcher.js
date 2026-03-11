"use client";
import { Globe } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

export function LanguageSwitcher() {
	const { language, setLanguage } = useLanguage();

	return (
		<div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
			<Globe className="w-4 h-4 text-gray-500 ml-2" />
			<button
				onClick={() => setLanguage('vi')}
				className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
					language === 'vi'
						? 'bg-[#1a4d2e] text-white'
						: 'text-gray-600 hover:text-[#1a4d2e]'
				}`}
			>
				VI
			</button>
			<button
				onClick={() => setLanguage('en')}
				className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
					language === 'en'
						? 'bg-[#1a4d2e] text-white'
						: 'text-gray-600 hover:text-[#1a4d2e]'
				}`}
			>
				EN
			</button>
		</div>
	);
}

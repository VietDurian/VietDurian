'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
	X,
	RefreshCcw,
	ArrowUp,
	Sparkles,
	Plus,
	MessageCircleMore,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const initialMessages = [
	{
		id: 'welcome',
		role: 'model',
		content: 'Xin chào! Tôi là trợ lý AI. Bạn cần hỗ trợ gì về sầu riêng?',
	},
];

export default function AiFloatingButton() {
	const pathname = usePathname();
	const { user, loading } = useAuth();
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState(initialMessages);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showSuggestions, setShowSuggestions] = useState(true);
	const [image, setImage] = useState(null);
	const endRef = useRef(null);
	const fileInputRef = useRef(null);

	const suggestions = [
		'Cách chăm sóc sầu riêng mùa hạn mặn ?',
		'Sầu riêng có dễ trồng không ?',
		'Bí quyết xử lý cây sầu riêng bị vàng lá ?',
	];

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, open]);

	if (loading || !user) return null;
	if (pathname?.startsWith('/dashboard')) return null;

	const toggle = () => setOpen((v) => !v);

	const startNewConversation = () => {
		setMessages(initialMessages);
		setInput('');
		setError(null);
		setShowSuggestions(true);
		setImage(null);
	};

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			setError('Chỉ hỗ trợ ảnh');
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			setImage({
				name: file.name,
				mimeType: file.type,
				dataUrl: reader.result,
			});
			setError(null);
		};
		reader.readAsDataURL(file);
	};

	const handleSend = async (e) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		const userMessage = {
			id: `u-${Date.now()}`,
			role: 'user',
			content: input.trim(),
			image,
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setImage(null);
		setIsLoading(true);
		setError(null);
		setShowSuggestions(false);

		try {
			const history = messages
				.filter((m) => m.id !== 'welcome' && !m.isError)
				.map((m) => ({ role: m.role, content: m.content }));

			const res = await fetch('/api/gemini', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: userMessage.content,
					history,
					image: image
						? { data: image.dataUrl, mimeType: image.mimeType }
						: null,
				}),
			});

			const data = await res.json();
			if (data.success) {
				setMessages((prev) => [
					...prev,
					{
						id: `m-${Date.now()}`,
						role: 'model',
						content: data.data,
					},
				]);
			} else {
				throw new Error(data.error || 'Không thể gọi AI');
			}
		} catch (err) {
			const failMessage = {
				id: `e-${Date.now()}`,
				role: 'model',
				content: 'Xin lỗi, tôi đang bận. Vui lòng thử lại sau.',
				isError: true,
			};
			setMessages((prev) => [...prev, failMessage]);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Floating Chat Box */}
			{open && (
				<div className="fixed bottom-24 right-6 z-50 w-96 max-w-[92vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up">
					<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
						<div className="font-semibold">Trợ lý AI</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={startNewConversation}
								className="p-2 rounded-full hover:bg-white/15 transition-colors"
								title="Cuộc trò chuyện mới"
							>
								<RefreshCcw size={18} />
							</button>
							<button
								type="button"
								onClick={toggle}
								className="p-2 rounded-full hover:bg-white/15 transition-colors"
								title="Đóng"
							>
								<X size={18} />
							</button>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
						{messages.map((msg) => (
							<div
								key={msg.id}
								className={`flex ${
									msg.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div
									className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
										msg.role === 'user'
											? 'bg-green-600 text-white rounded-br-none'
											: msg.isError
												? 'bg-red-50 text-red-600 border border-red-100'
												: 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
									}
									`}
								>
									{msg.content}
								</div>
							</div>
						))}
						{isLoading && (
							<div className="text-xs text-gray-500">AI đang trả lời...</div>
						)}
						<div ref={endRef} />
					</div>
					<form
						onSubmit={handleSend}
						className="p-3 border-t border-gray-200 bg-white space-y-2"
					>
						{showSuggestions && (
							<div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-2">
								<div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-2">
									<Sparkles size={14} />
									<span>Gợi ý nhanh</span>
								</div>
								<div className="flex gap-2 overflow-x-auto pb-1 pr-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
									{suggestions.map((s, idx) => (
										<button
											type="button"
											key={idx}
											onClick={() => setInput(s)}
											className="relative text-left px-3 py-2 text-sm rounded-xl bg-white/90 border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-emerald-800 snap-start shrink-0 min-w-[240px]"
										>
											<span
												className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-500"
												aria-hidden="true"
											></span>
											<span className="pl-4 block">{s}</span>
										</button>
									))}
								</div>
							</div>
						)}
						<div className="flex items-center gap-2 rounded-full border border-purple-300 bg-white shadow-sm px-3 py-1.5 focus-within:border-purple-500">
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Trả lời hoặc hỏi bất cứ điều gì"
								className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
							/>
							<div className="flex items-center gap-2">
								<input
									type="file"
									accept="image/*"
									className="hidden"
									ref={fileInputRef}
									onChange={handleFileChange}
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60 cursor-pointer"
									disabled={isLoading}
									title="Đính kèm ảnh"
								>
									<Plus size={16} strokeWidth={2.5} />
								</button>
							</div>
							<button
								type="submit"
								disabled={!input.trim() || isLoading}
								className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-emerald-400 flex items-center justify-center disabled:opacity-60 cursor-pointer"
							>
								<ArrowUp size={18} />
							</button>
						</div>
						{image && (
							<div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
								<span className="truncate">Ảnh: {image.name}</span>
								<button
									type="button"
									onClick={() => setImage(null)}
									className="text-emerald-700 hover:text-emerald-900"
								>
									X
								</button>
							</div>
						)}
						<p className="text-center text-xs text-gray-500">
							Do AI tạo. Hãy kiểm tra kỹ độ chính xác.
						</p>
						{error && <p className="text-xs text-red-500">{error}</p>}
					</form>
				</div>
			)}

			{/* Floating Button */}
			<button
				onClick={toggle}
				type="button"
				className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-15 h-15 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 group cursor-pointer font-medium text-3xl"
				aria-label="Mở trợ lý AI"
			>
				<span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-20 animate-ping"></span>
				<MessageCircleMore size={30} />
				<div className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none translate-x-2 group-hover:translate-x-0 duration-200">
					Hỗ trợ
					<div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
				</div>
			</button>
		</>
	);
}

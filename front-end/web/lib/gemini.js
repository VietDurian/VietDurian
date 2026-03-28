export async function askGemini({ message, history = [], image = null }) {
	const fallbackReply =
		'Hệ thống AI đang tạm quá tải. Bạn thử lại sau ít phút để nhận tư vấn chi tiết hơn.';

	const hasText = !!message?.trim();
	const hasImage = !!(image?.data && image?.mimeType);

	if (!hasText && !hasImage) {
		return 'Bạn vui lòng nhập câu hỏi hoặc đính kèm ảnh để mình hỗ trợ.';
	}

	try {
		const response = await fetch('/api/gemini', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message: message || '',
				history,
				image,
			}),
		});

		const payload = await response.json().catch(() => null);

		if (!response.ok || !payload?.success || !payload?.data) {
			return payload?.data || fallbackReply;
		}

		return payload.data;
	} catch {
		return fallbackReply;
	}
}
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBt6M-3PMZkNUXcaRkDE6SLIC3HnxD3iIM';
const BACKEND_API_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	'http://localhost:8080/api/v1';

const systemInstruction = `Bạn là trợ lý nông nghiệp chuyên về sầu riêng.
- Trả lời ngắn gọn, tiếng Việt hoặc tiếng anh tùy theo câu hỏi, thân thiện.
- Ưu tiên hướng dẫn chăm sóc, dinh dưỡng, tưới tiêu, phòng trừ sâu bệnh.
- Nếu người dùng hỏi về chức năng của ứng dụng, hãy mô tả các tính năng chính: quản lý vườn, nhật ký canh tác, công bố thông tin lô sản phẩm để kết nối người trồng và người mua, hỏi đáp và chia sẻ kinh nghiệm về sầu riêng.
- Nếu câu hỏi ngoài chủ đề sầu riêng/nông nghiệp, từ chối lịch sự.
- Quan trọng: xuất trả lời dưới dạng plain text, không dùng Markdown, không dùng ký hiệu **, *, gạch đầu dòng, tiêu đề hoặc danh sách.`;

const plainTextGuard =
	'Please return the answer as plain text only — do not use Markdown, bullets, lists, or ** for bold.';

const examples = [
	{
		role: 'user',
		parts: [{ text: 'Tôi có vườn sầu riêng 3 năm tuổi ở vùng hạn mặn, chăm sóc sao?' }],
	},
	{
		role: 'model',
		parts: [
			{
				text: 'Phủ rơm giữ ẩm, tưới nhỏ giọt nước ngọt, bón kali tăng chịu mặn, che tán khi nắng gắt, theo dõi vàng lá để xử lý sớm.',
			},
		],
	},
];

const generationConfig = { temperature: 0.3, maxOutputTokens: 512 };

const imageDataToBase64 = (data) => {
	if (!data || typeof data !== 'string') return null;
	return data.includes('base64,') ? data.split('base64,')[1] : data;
};

const toPercent = (value) => {
	const num = Number(value);
	if (!Number.isFinite(num)) return null;
	return (num * 100).toFixed(2);
};

const formatDiseaseResultText = (result) => {
	const disease = result?.predicted_class_vi || result?.predicted_class || 'Không xác định';
	const confidence = toPercent(result?.confidence);
	const guardConfidence = toPercent(result?.guard?.confidence);
	const solutions = Array.isArray(result?.solutions) ? result.solutions : [];

	let text = `Kết quả nhận diện: ${disease}.`;
	if (confidence) text += ` Độ tin cậy: ${confidence}%.`;
	if (guardConfidence) text += ` Mức tin cậy ảnh liên quan sầu riêng: ${guardConfidence}%.`;
	if (result?.guard?.reason) text += ` Ghi chú: ${result.guard.reason}.`;
	if (solutions.length > 0) text += ` Gợi ý xử lý: ${solutions.slice(0, 5).join('; ')}.`;

	return text;
};

const dataUrlToBlob = async (dataUrl) => {
	if (!dataUrl) return null;
	try {
		const response = await fetch(dataUrl);
		if (!response.ok) return null;
		return await response.blob();
	} catch {
		return null;
	}
};

const detectDiseaseViaBackend = async (image) => {
	const base64 = imageDataToBase64(image?.data);
	if (!base64 || !image?.mimeType) return null;

	const blob = await dataUrlToBlob(image.data);
	if (!blob) return null;
	const form = new FormData();
	form.append('image', blob, image?.name || 'chat-upload.jpg');

	let response;
	try {
		response = await fetch(`${BACKEND_API_URL.replace(/\/$/, '')}/ai/predict`, {
			method: 'POST',
			body: form,
		});
	} catch {
		return null;
	}

	const payload = await response.json().catch(() => null);

	if (response.ok && payload?.success) {
		return { handled: true, text: formatDiseaseResultText(payload.data) };
	}

	if (response.status === 422) {
		const reason = payload?.data?.guard?.reason;
		return {
			handled: true,
			text: reason
				? `Ảnh bạn gửi không phải ảnh sầu riêng nên mình chưa thể chẩn đoán bệnh. Lý do: ${reason}.`
				: 'Ảnh bạn gửi không phải ảnh sầu riêng nên mình chưa thể chẩn đoán bệnh.',
		};
	}

	if (response.status === 429) {
		return {
			handled: true,
			text: 'Hệ thống kiểm tra ảnh bằng Gemini đang tạm hết quota, bạn vui lòng thử lại sau ít phút.',
		};
	}

	return null;
};

export async function askGemini({ message, history, image }) {
	const hasText = !!message?.trim();
	const hasImage = !!(image?.data && image?.mimeType);

	if (!GEMINI_API_KEY) {
		throw new Error('Thiếu NEXT_PUBLIC_GEMINI_API_KEY');
	}

	if (!hasText && !hasImage) {
		throw new Error('Cần nhập nội dung hoặc đính kèm ảnh');
	}

	// Nếu có ảnh, chạy pipeline nhận diện bệnh trước
	if (hasImage) {
		const diagnosis = await detectDiseaseViaBackend(image);
		if (diagnosis?.handled) return diagnosis.text;
	}

	// Lấy danh sách model khả dụng
	const listRes = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
	);
	const listJson = await listRes.json();

	if (!listRes.ok) {
		throw new Error('Cannot list models for this API key');
	}

	const generateModels = (listJson.models || []).filter((m) =>
		m.supportedGenerationMethods?.includes('generateContent'),
	);
	const preferred = generateModels.find(
		(m) =>
			m.name.includes('flash') ||
			m.name.includes('vision') ||
			m.displayName?.includes('flash') ||
			m.displayName?.includes('vision'),
	);
	const picked = preferred || generateModels[0];

	if (!picked) {
		throw new Error('No generateContent model available for this API key');
	}

	const userParts = [];
	if (hasText) userParts.push({ text: `${message}\n\n${plainTextGuard}` });
	if (hasImage) {
		const base64 = imageDataToBase64(image.data);
		userParts.push({ inlineData: { data: base64, mimeType: image.mimeType } });
	}

	const contents = [
		...examples,
		...(history || []).map((msg) => ({
			role: msg.role === 'user' ? 'user' : 'model',
			parts: [{ text: msg.content }],
		})),
		{ role: 'user', parts: userParts },
	];

	const modelName = picked.name;
	const genRes = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				systemInstruction: { parts: [{ text: systemInstruction }] },
				contents,
				generationConfig,
			}),
		},
	);

	const payload = await genRes.json().catch(() => null);
	if (!genRes.ok) {
		throw new Error(payload?.error?.message || 'Không thể gọi Gemini');
	}

	const text = (payload?.candidates || [])
		.flatMap((candidate) => candidate?.content?.parts || [])
		.map((part) => part?.text)
		.filter(Boolean)
		.join('\n')
		.trim();

	if (!text) {
		throw new Error('Gemini không trả về nội dung');
	}

	return text;
}
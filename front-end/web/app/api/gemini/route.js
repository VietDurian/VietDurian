import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `Bạn là trợ lý nông nghiệp chuyên về sầu riêng.
- Trả lời ngắn gọn, tiếng Việt hoặc tiếng anh tùy theo câu hỏi, thân thiện.
- Ưu tiên hướng dẫn chăm sóc, dinh dưỡng, tưới tiêu, phòng trừ sâu bệnh.
- Nếu câu hỏi ngoài chủ đề sầu riêng/nông nghiệp, từ chối lịch sự.
- Quan trọng: xuất trả lời dưới dạng plain text, không dùng Markdown, không dùng ký hiệu **, *, gạch đầu dòng, tiêu đề hoặc danh sách.`;

const plainTextGuard =
	'Please return the answer as plain text only — do not use Markdown, bullets, lists, or ** for bold.';

const examples = [
	{
		role: 'user',
		parts: [
			{
				text: 'Tôi có vườn sầu riêng 3 năm tuổi ở vùng hạn mặn, chăm sóc sao?',
			},
		],
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

// temperature điều chỉnh độ sáng tạo, maxOutputTokens giới hạn độ dài câu trả lời
const generationConfig = { temperature: 0.3, maxOutputTokens: 512 };

export async function POST(request) {
	try {
		const { message, history, image } = await request.json();

		const hasText = !!message?.trim();
		const hasImage = !!(image?.data && image?.mimeType);
		if (!hasText && !hasImage) {
			return Response.json(
				{ success: false, error: 'Cần nhập nội dung hoặc đính kèm ảnh' },
				{ status: 400 },
			);
		}

		// List models via REST to see what this key can access
		const listRes = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
		);
		const listJson = await listRes.json();
		if (!listRes.ok) {
			return Response.json(
				{
					success: false,
					error: 'Cannot list models for this API key',
					details: listJson,
				},
				{ status: 502 },
			);
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
			return Response.json(
				{
					success: false,
					error: 'No generateContent model available for this API key',
					available: listJson.models?.map((m) => m.name) || [],
				},
				{ status: 502 },
			);
		}
		const model = genAI.getGenerativeModel({
			model: picked.name,
			systemInstruction,
		});

		const userParts = [];
		if (hasText) userParts.push({ text: `${message}\n\n${plainTextGuard}` });
		if (hasImage) {
			const base64 = image.data.includes('base64,')
				? image.data.split('base64,')[1]
				: image.data;
			userParts.push({
				inlineData: { data: base64, mimeType: image.mimeType },
			});
		}

		const contents = [
			...examples,
			...(history || []).map((msg) => ({
				role: msg.role === 'user' ? 'user' : 'model',
				parts: [{ text: msg.content }],
			})),
			{ role: 'user', parts: userParts },
		];
		const result = await model.generateContent({ contents, generationConfig });

		const text = result.response.text();

		return Response.json({ success: true, data: text }, { status: 200 });
	} catch (error) {
		console.error('Gemini error:', error.message);
		return Response.json(
			{ success: false, error: error.message || 'Gemini API error' },
			{ status: 502 },
		);
	}
}

export async function GET() {
	try {
		return Response.json(
			{ success: true, message: 'Gemini route is alive' },
			{ status: 200 },
		);
	} catch (error) {
		return Response.json(
			{ success: false, error: error.message || 'Status error' },
			{ status: 500 },
		);
	}
}

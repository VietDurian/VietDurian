import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8080/api/v1";

const systemInstruction = `Bạn là trợ lý nông nghiệp chuyên về sầu riêng.
- Trả lời ngắn gọn, tiếng Việt hoặc tiếng anh tùy theo câu hỏi, thân thiện.
- Ưu tiên hướng dẫn chăm sóc, dinh dưỡng, tưới tiêu, phòng trừ sâu bệnh.
- Nếu người dùng hỏi về chức năng của ứng dụng, hãy mô tả các tính năng chính: quản lý vườn, nhật ký canh tác, công bố thông tin lô sản phẩm để kết nối người trồng và người mua, hỏi đáp và chia sẻ kinh nghiệm về sầu riêng.
- Nếu câu hỏi ngoài chủ đề sầu riêng/nông nghiệp, từ chối lịch sự.
- Quan trọng: xuất trả lời dưới dạng plain text, không dùng Markdown, không dùng ký hiệu **, *, gạch đầu dòng, tiêu đề hoặc danh sách.`;

const plainTextGuard =
  "Please return the answer as plain text only — do not use Markdown, bullets, lists, or ** for bold.";

const examples = [
  {
    role: "user",
    parts: [
      {
        text: "Tôi có vườn sầu riêng 3 năm tuổi ở vùng hạn mặn, chăm sóc sao?",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "Phủ rơm giữ ẩm, tưới nhỏ giọt nước ngọt, bón kali tăng chịu mặn, che tán khi nắng gắt, theo dõi vàng lá để xử lý sớm.",
      },
    ],
  },
];

// temperature điều chỉnh độ sáng tạo, maxOutputTokens giới hạn độ dài câu trả lời
const generationConfig = { temperature: 0.3, maxOutputTokens: 512 };

const imageDataToBase64 = (data) => {
  if (!data || typeof data !== "string") return null;
  return data.includes("base64,") ? data.split("base64,")[1] : data;
};

const toPercent = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return (num * 100).toFixed(2);
};

const formatDiseaseResultText = (result) => {
  const disease =
    result?.predicted_class_vi || result?.predicted_class || "Không xác định";
  const confidence = toPercent(result?.confidence);
  const guardConfidence = toPercent(result?.guard?.confidence);
  const solutions = Array.isArray(result?.solutions) ? result.solutions : [];

  let text = `Kết quả nhận diện: ${disease}.`;
  if (confidence) {
    text += ` Độ tin cậy: ${confidence}%.`;
  }
  if (guardConfidence) {
    text += ` Mức tin cậy ảnh liên quan sầu riêng: ${guardConfidence}%.`;
  }
  if (result?.guard?.reason) {
    text += ` Ghi chú: ${result.guard.reason}.`;
  }
  if (solutions.length > 0) {
    text += ` Gợi ý xử lý: ${solutions.slice(0, 5).join("; ")}.`;
  }

  return text;
};

const detectDiseaseViaBackend = async (image) => {
  const base64 = imageDataToBase64(image?.data);
  if (!base64 || !image?.mimeType) {
    return null;
  }

  const byteArray = Buffer.from(base64, "base64");
  const form = new FormData();
  const blob = new Blob([byteArray], {
    type: image.mimeType || "image/jpeg",
  });
  form.append("image", blob, "chat-upload.jpg");

  let response;
  try {
    response = await fetch(`${BACKEND_API_URL.replace(/\/$/, "")}/ai/predict`, {
      method: "POST",
      body: form,
    });
  } catch {
    return null;
  }

  const payload = await response.json().catch(() => null);

  if (response.ok && payload?.success) {
    return {
      handled: true,
      text: formatDiseaseResultText(payload.data),
    };
  }

  if (response.status === 422) {
    const reason = payload?.data?.guard?.reason;
    return {
      handled: true,
      text: reason
        ? `Ảnh bạn gửi không phải ảnh sầu riêng nên mình chưa thể chẩn đoán bệnh. Lý do: ${reason}.`
        : "Ảnh bạn gửi không phải ảnh sầu riêng nên mình chưa thể chẩn đoán bệnh.",
    };
  }

  if (response.status === 429) {
    return {
      handled: true,
      text: "Hệ thống kiểm tra ảnh bằng Gemini đang tạm hết quota, bạn vui lòng thử lại sau ít phút.",
    };
  }

  return null;
};

export async function POST(request) {
  try {
    const { message, history, image } = await request.json();

    const hasText = !!message?.trim();
    const hasImage = !!(image?.data && image?.mimeType);
    if (!hasText && !hasImage) {
      return Response.json(
        { success: false, error: "Cần nhập nội dung hoặc đính kèm ảnh" },
        { status: 400 },
      );
    }

    // If user sends an image in chat, run disease pipeline first.
    // Backend /ai/predict already applies Gemini durian-image guard.
    if (hasImage) {
      const diagnosis = await detectDiseaseViaBackend(image);
      if (diagnosis?.handled) {
        return Response.json(
          { success: true, data: diagnosis.text },
          { status: 200 },
        );
      }
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
          error: "Cannot list models for this API key",
          details: listJson,
        },
        { status: 502 },
      );
    }
    const generateModels = (listJson.models || []).filter((m) =>
      m.supportedGenerationMethods?.includes("generateContent"),
    );
    const preferred = generateModels.find(
      (m) =>
        m.name.includes("flash") ||
        m.name.includes("vision") ||
        m.displayName?.includes("flash") ||
        m.displayName?.includes("vision"),
    );
    const picked = preferred || generateModels[0];
    if (!picked) {
      return Response.json(
        {
          success: false,
          error: "No generateContent model available for this API key",
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
      const base64 = imageDataToBase64(image.data);
      userParts.push({
        inlineData: { data: base64, mimeType: image.mimeType },
      });
    }

    const contents = [
      ...examples,
      ...(history || []).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: userParts },
    ];
    const result = await model.generateContent({ contents, generationConfig });

    const text = result.response.text();

    return Response.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    console.error("Gemini error:", error.message);
    return Response.json(
      { success: false, error: error.message || "Gemini API error" },
      { status: 502 },
    );
  }
}

export async function GET() {
  try {
    return Response.json(
      { success: true, message: "Gemini route is alive" },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { success: false, error: error.message || "Status error" },
      { status: 500 },
    );
  }
}

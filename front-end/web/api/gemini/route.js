const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8080/api/v1";

const DIRECT_MODELS = [
  "gemini-3.1-flash-lite",       // 500 RPD - tốt nhất
  "gemini-2.5-flash-lite",       // 20 RPD - fallback
  "gemini-2.5-flash-preview-04-17", // 20 RPD - fallback
  "gemini-3-flash",              // 20 RPD - fallback
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fallbackText =
  "Hệ thống AI đang tạm quá tải. Bạn thử lại sau ít phút để nhận tư vấn chi tiết hơn.";

const callGeminiWithRetry = async ({ modelName, apiKey, payload, maxAttempts = 3 }) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const json = await genRes.json().catch(() => null);
    if (genRes.ok) return json;

    const err = new Error(json?.error?.message || `Gemini call failed: ${genRes.status}`);
    err.statusCode = genRes.status;
    lastError = err;

    const isRetryable = genRes.status === 429 || genRes.status === 503;
    if (!isRetryable || attempt === maxAttempts) throw err;

    await sleep(1000 * 2 ** (attempt - 1));
  }

  throw lastError || new Error("Gemini call failed");
};

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
    parts: [{ text: "Tôi có vườn sầu riêng 3 năm tuổi ở vùng hạn mặn, chăm sóc sao?" }],
  },
  {
    role: "model",
    parts: [{ text: "Phủ rơm giữ ẩm, tưới nhỏ giọt nước ngọt, bón kali tăng chịu mặn, che tán khi nắng gắt, theo dõi vàng lá để xử lý sớm." }],
  },
];

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
  if (confidence) text += ` Độ tin cậy: ${confidence}%.`;
  if (guardConfidence) text += ` Mức tin cậy ảnh liên quan sầu riêng: ${guardConfidence}%.`;
  if (result?.guard?.reason) text += ` Ghi chú: ${result.guard.reason}.`;
  if (solutions.length > 0) text += ` Gợi ý xử lý: ${solutions.slice(0, 5).join("; ")}.`;

  return text;
};

const detectDiseaseViaBackend = async (image) => {
  const base64 = imageDataToBase64(image?.data);
  if (!base64 || !image?.mimeType) return null;

  const byteArray = Buffer.from(base64, "base64");
  const form = new FormData();
  const blob = new Blob([byteArray], { type: image.mimeType || "image/jpeg" });
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
    return { handled: true, text: formatDiseaseResultText(payload.data) };
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: "Thiếu GEMINI_API_KEY" },
        { status: 500 },
      );
    }

    const { message, history, image } = await request.json();

    const hasText = !!message?.trim();
    const hasImage = !!(image?.data && image?.mimeType);
    if (!hasText && !hasImage) {
      return Response.json(
        { success: false, error: "Cần nhập nội dung hoặc đính kèm ảnh" },
        { status: 400 },
      );
    }

    if (hasImage) {
      const diagnosis = await detectDiseaseViaBackend(image);
      if (diagnosis?.handled) {
        return Response.json(
          { success: true, data: diagnosis.text },
          { status: 200 },
        );
      }
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
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: userParts },
    ];

    let text = "";
    let lastError;

    for (const modelName of DIRECT_MODELS) {
      try {
        const result = await callGeminiWithRetry({
          modelName,
          apiKey,
          payload: {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig,
          },
        });

        text = (result?.candidates || [])
          .flatMap((c) => c?.content?.parts || [])
          .map((p) => p?.text)
          .filter(Boolean)
          .join("\n")
          .trim();

        if (text) break;
      } catch (error) {
        lastError = error;
        console.error(`[Gemini] ${modelName} →`, error.statusCode, error.message);
        const code = error?.statusCode;
        // 429/503 = rate limit, 404 = model not found → thử model tiếp
        // các lỗi khác (400, 403...) → dừng luôn
        if (code !== 429 && code !== 503 && code !== 404) break;
      }
    }

    if (!text) {
      throw (
        lastError ||
        new Error(`Không có model Gemini khả dụng. Models đã thử: ${DIRECT_MODELS.join(", ")}`)
      );
    }

    return Response.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    console.error("Gemini error:", error.statusCode, error.message);

    // Trả fallback thay vì 502 cho mọi lỗi
    return Response.json(
      { success: true, data: fallbackText, degraded: true },
      { status: 200 },
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
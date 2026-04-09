const LOCAL_AI_SERVICE_URL = "http://127.0.0.1:8001";
const GEMINI_GUARD_API_KEY = process.env.GEMINI_GUARD_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_GUARD_MODEL =
  process.env.GEMINI_GUARD_MODEL || process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

// Dedicated model candidates for AI guard (separate from chatbox).
const DIRECT_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];



const DURIAN_GUARD_PROMPT = `
Bạn là bộ phân loại ảnh cho hệ thống bệnh sầu riêng.
Hãy xác định ảnh có liên quan đến sầu riêng hay không.

Được xem là liên quan:
- Lá, thân, cành, hoa, trái sầu riêng
- Vườn/cây sầu riêng có dấu hiệu bệnh hoặc sâu hại

Không liên quan:
- Ảnh cây trồng khác, vật thể không phải nông nghiệp, người, đồ vật bất kỳ

Trả về JSON duy nhất theo đúng schema:
{
  "is_durian_related": true/false,
  "confidence": 0.0-1.0,
  "reason": "Mô tả ngắn gọn bằng tiếng Việt"
}
`;

const extractRetryAfterSeconds = ({ resp, message }) => {
  const headerValue = resp?.headers?.get?.("retry-after");
  if (headerValue) {
    const n = Number(headerValue);
    if (Number.isFinite(n) && n > 0) return Math.ceil(n);
  }

  const text = String(message || "");
  const m = text.match(/Please retry in\s*([0-9.]+)s/i);
  if (!m) return null;
  const sec = Number(m[1]);
  return Number.isFinite(sec) && sec > 0 ? Math.ceil(sec) : null;
};

const toSafeJson = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const normalizeGuardResult = (payload, provider) => {
  const related = Boolean(payload?.is_durian_related);
  const confidenceRaw = Number(payload?.confidence);
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.max(0, Math.min(1, confidenceRaw))
    : null;

  return {
    provider,
    isDurianRelated: related,
    confidence,
    reason: payload?.reason || "",
  };
};

const fallbackNotDurianResult = (provider, reason) => ({
  provider,
  isDurianRelated: false,
  confidence: 0,
  reason:
    reason ||
    "Anh tai len khong phai anh sau rieng hoac khong lien quan den sau rieng. Vui long tai anh ro la, than, canh hoac trai sau rieng.",
});

const getAiServiceUrl = () => {
  const configuredUrl = String(process.env.AI_SERVICE_URL || "").trim();
  if (configuredUrl) return configuredUrl;

  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  if (nodeEnv === "production") {
    const err = new Error("AI_SERVICE_URL is required in production environment.");
    err.status = 500;
    err.code = "AI_SERVICE_URL_MISSING";
    throw err;
  }

  return LOCAL_AI_SERVICE_URL;
};

const requestGeminiGuard = async ({ modelName, base64, mimetype }) => {
  const normalizedModelName = (modelName || "").replace(/^models\//, "").trim() || null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizedModelName)}:generateContent?key=${encodeURIComponent(GEMINI_GUARD_API_KEY)}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: DURIAN_GUARD_PROMPT },
            {
              inlineData: {
                mimeType: mimetype || "image/jpeg",
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    }),
  });

  const data = await resp.json().catch(() => null);
  return { resp, data };
};

const guardWithGemini = async ({ buffer, mimetype }) => {
  if (!GEMINI_GUARD_API_KEY) {
    const err = new Error("Chua cau hinh GEMINI_GUARD_API_KEY (hoac GEMINI_API_KEY) cho bo loc hinh anh sau rieng.");
    err.status = 500;
    err.code = "GUARD_NOT_CONFIGURED";
    throw err;
  }

  const base64 = buffer.toString("base64");
  const candidateModels = [...new Set([GEMINI_GUARD_MODEL, ...DIRECT_MODELS].map((m) => String(m || "").trim()).filter(Boolean))];
  let lastError = null;
  const quotaErrors = [];

  for (const modelName of candidateModels) {
    const { resp, data } = await requestGeminiGuard({ modelName, base64, mimetype });

    if (!resp.ok) {
      // Retry another candidate only when current model is not found.
      if (resp.status === 404) {
        lastError = data?.error || { code: 404, message: `Model ${modelName} not found.` };
        continue;
      }

      // When one model is out of quota, try the next available candidate.
      if (resp.status === 429) {
        const providerError = data?.error || {
          code: 429,
          message: `Quota exceeded for model ${modelName}.`,
          status: "RESOURCE_EXHAUSTED",
        };
        quotaErrors.push({
          model: modelName,
          providerError,
          retryAfterSeconds: extractRetryAfterSeconds({
            resp,
            message: providerError?.message,
          }),
        });
        lastError = providerError;
        continue;
      }

      const providerError = data?.error || null;
      const errorReason = providerError?.details?.find?.((d) => d?.reason)?.reason || null;
      const errorMessage = String(providerError?.message || "").toUpperCase();

      // Treat invalid/misconfigured credentials as configuration errors, not provider outage.
      if (
        resp.status === 400 &&
        (errorReason === "API_KEY_INVALID" || errorMessage.includes("API KEY NOT VALID"))
      ) {
        const err = new Error("GEMINI_GUARD_API_KEY khong hop le hoac da het hieu luc.");
        err.status = 500;
        err.code = "GUARD_NOT_CONFIGURED";
        err.detail = {
          model: modelName,
          providerError,
        };
        throw err;
      }

      if (resp.status === 403) {
        const err = new Error("Khong co quyen truy cap Gemini API. Kiem tra API key, billing, va API restriction.");
        err.status = 500;
        err.code = "GUARD_NOT_CONFIGURED";
        err.detail = {
          model: modelName,
          providerError,
        };
        throw err;
      }

      const err = new Error(data?.error?.message || `Khong the goi Gemini (${resp.status}).`);
      err.status = resp.status;
      err.code = "GUARD_PROVIDER_ERROR";
      err.detail = {
        model: modelName,
        providerError: data?.error || null,
      };
      err.retryAfterSeconds = extractRetryAfterSeconds({
        resp,
        message: data?.error?.message,
      });
      throw err;
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.find((p) => typeof p?.text === "string")?.text;
    const parsed = toSafeJson(rawText);
    if (!parsed) {
      const blockReason = data?.promptFeedback?.blockReason;
      if (blockReason || !rawText) {
        return {
          ...fallbackNotDurianResult(
            "gemini",
            "Anh tai len khong phai anh sau rieng hoac khong du thong tin de xac dinh lien quan den sau rieng.",
          ),
          model: modelName,
          blockedReason: blockReason || null,
        };
      }

      // Prefer a safe rejection over a 502 when provider text is not strict JSON.
      return {
        ...fallbackNotDurianResult("gemini"),
        model: modelName,
      };
    }

    return {
      ...normalizeGuardResult(parsed, "gemini"),
      model: modelName,
    };
  }

  if (quotaErrors.length > 0) {
    const err = new Error(
      "Tat ca model Gemini kha dung deu tam het quota. Vui long thu lai sau hoac doi GEMINI_GUARD_API_KEY.",
    );
    err.status = 429;
    err.code = "GUARD_PROVIDER_ERROR";
    err.detail = {
      message: "All Gemini model candidates are quota-limited.",
      triedModels: candidateModels,
      quotaErrors,
      availableModels: candidateModels,
      lastError,
    };
    err.retryAfterSeconds = quotaErrors
      .map((e) => Number(e?.retryAfterSeconds))
      .filter((n) => Number.isFinite(n) && n > 0)
      .reduce((max, n) => Math.max(max, n), 0) || null;
    throw err;
  }

  const err = new Error("Khong tim thay model Gemini phu hop de kiem tra hinh anh.");
  err.status = 502;
  err.code = "GUARD_PROVIDER_ERROR";
  err.detail = {
    message: "All Gemini model candidates failed with NOT_FOUND.",
    triedModels: candidateModels,
    availableModels: candidateModels,
    lastError,
  };
  throw err;
};

const guardDurianImage = async ({ buffer, mimetype }) => {
  if (typeof fetch === "undefined") {
    const err = new Error("He thong can Node.js 18+ de goi AI guard.");
    err.status = 500;
    err.code = "GUARD_RUNTIME_ERROR";
    throw err;
  }

  return guardWithGemini({ buffer, mimetype });
};

const predictDisease = async ({ buffer, filename, mimetype }) => {
  if (typeof fetch === "undefined" || typeof FormData === "undefined" || typeof Blob === "undefined") {
    const err = new Error(
      "This endpoint requires Node.js 18+ (fetch/FormData/Blob). Please upgrade Node or add a fetch polyfill.",
    );
    err.status = 500;
    throw err;
  }

  const aiServiceUrl = getAiServiceUrl();
  const url = `${aiServiceUrl.replace(/\/$/, "")}/predict`;

  // Node 18+ provides global fetch/FormData/Blob
  const form = new FormData();
  const blob = new Blob([buffer], { type: mimetype || "application/octet-stream" });
  form.append("image", blob, filename || "image");

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      body: form,
    });
  } catch (cause) {
    const err = new Error(
      `Cannot reach AI service at ${aiServiceUrl}. Start the Python service (uvicorn) or set AI_SERVICE_URL correctly.`,
    );
    err.status = 502;
    err.cause = cause;
    throw err;
  }

  let payload;
  try {
    payload = await resp.json();
  } catch {
    payload = null;
  }

  if (!resp.ok) {
    const message =
      payload?.detail || payload?.message || `AI service error (${resp.status})`;
    const err = new Error(message);
    err.status = resp.status;
    throw err;
  }

  if (!payload?.success) {
    const err = new Error(payload?.error || payload?.message || "AI service failed");
    err.status = 502;
    throw err;
  }

  return payload.data;
};

export const aiService = {
  guardDurianImage,
  predictDisease,
};

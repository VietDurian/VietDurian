const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

// Keep fallbacks conservative. Auto-switching across major model families can
// introduce unexpected quota/availability differences.
const GEMINI_FALLBACK_MODELS = [
  GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
].filter((v, i, arr) => v && arr.indexOf(v) === i);

const normalizeGeminiModelName = (name) => {
  if (!name || typeof name !== "string") return null;
  return name.replace(/^models\//, "").trim() || null;
};

const buildGeminiCandidateModels = (modelList = []) => {
  const dynamic = modelList
    .filter((m) => m?.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => normalizeGeminiModelName(m?.name))
    .filter(Boolean)
    // Prefer flash models first for speed/cost and broad availability.
    .sort((a, b) => {
      const score = (v) => {
        const lower = v.toLowerCase();
        if (lower.includes("flash")) return 0;
        if (lower.includes("pro")) return 1;
        return 2;
      };
      return score(a) - score(b);
    });

  return [...GEMINI_FALLBACK_MODELS, ...dynamic]
    .map((v) => normalizeGeminiModelName(v))
    .filter((v, i, arr) => v && arr.indexOf(v) === i);
};

const listGeminiModels = async () => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const resp = await fetch(url);
  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const err = new Error(data?.error?.message || `Khong the lay danh sach model Gemini (${resp.status}).`);
    err.status = resp.status;
    err.code = "GUARD_PROVIDER_ERROR";
    err.detail = {
      providerError: data?.error || null,
      operation: "listModels",
    };
    err.retryAfterSeconds = extractRetryAfterSeconds({
      resp,
      message: data?.error?.message,
    });
    throw err;
  }

  return Array.isArray(data?.models) ? data.models : [];
};

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

const requestGeminiGuard = async ({ modelName, base64, mimetype }) => {
  const normalizedModelName = normalizeGeminiModelName(modelName);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(normalizedModelName)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

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
              inline_data: {
                mime_type: mimetype || "image/jpeg",
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
  if (!GEMINI_API_KEY) {
    const err = new Error("Chua cau hinh GEMINI_API_KEY cho bo loc hinh anh sau rieng.");
    err.status = 500;
    err.code = "GUARD_NOT_CONFIGURED";
    throw err;
  }

  const base64 = buffer.toString("base64");
  const availableModels = await listGeminiModels();
  const candidateModels = buildGeminiCandidateModels(availableModels);
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
      const err = new Error("Gemini tra ve du lieu khong hop le.");
      err.status = 502;
      err.code = "GUARD_PROVIDER_ERROR";
      err.detail = { raw: rawText || null, model: modelName };
      throw err;
    }

    return {
      ...normalizeGuardResult(parsed, "gemini"),
      model: modelName,
    };
  }

  if (quotaErrors.length > 0) {
    const err = new Error(
      "Tat ca model Gemini kha dung deu tam het quota. Vui long thu lai sau hoac doi GEMINI_API_KEY.",
    );
    err.status = 429;
    err.code = "GUARD_PROVIDER_ERROR";
    err.detail = {
      message: "All Gemini model candidates are quota-limited.",
      triedModels: candidateModels,
      quotaErrors,
      availableModels: availableModels.map((m) => normalizeGeminiModelName(m?.name)).filter(Boolean),
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
    availableModels: availableModels.map((m) => normalizeGeminiModelName(m?.name)).filter(Boolean),
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

  const url = `${AI_SERVICE_URL.replace(/\/$/, "")}/predict`;

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
      `Cannot reach AI service at ${AI_SERVICE_URL}. Start the Python service (uvicorn) or set AI_SERVICE_URL correctly.`,
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

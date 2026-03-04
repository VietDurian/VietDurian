const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8001";

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
  predictDisease,
};

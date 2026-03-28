import { GET, POST } from "../../api/gemini/route";

function resolveOrigin(req) {
  const protoHeader = req.headers["x-forwarded-proto"];
  const hostHeader = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  if (proto && host) return `${proto}://${host}`;
  if (host) return `http://${host}`;
  return "http://localhost:3000";
}

async function forward(routeFn, req, res) {
  try {
    const isGet = req.method === "GET";
    const origin = resolveOrigin(req);
    const request = new Request(`${origin}/api/gemini`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: isGet ? undefined : JSON.stringify(req.body || {}),
    });

    const response = await routeFn(request);
    const payload = await response.json().catch(() => null);

    return res.status(response.status).json(
      payload || {
        success: false,
        error: "Không thể đọc phản hồi từ trợ lý AI",
      },
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Lỗi nội bộ khi xử lý Gemini API",
    });
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    return forward(POST, req, res);
  }

  if (req.method === "GET") {
    return forward(GET, req, res);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({
    success: false,
    error: "Method Not Allowed",
  });
}

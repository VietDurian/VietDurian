"use client";


import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  X,
  RefreshCcw,
  ArrowUp,
  Sparkles,
  Plus,
  ScanSearch,
  MessageCircleMore,
  Leaf,
  Upload,
  TriangleAlert,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { aiAPI } from "@/lib/api";


const initialMessages = [
  {
    id: "welcome",
    role: "model",
    content: "Xin chào! Tôi là trợ lý AI. Bạn cần hỗ trợ gì về sầu riêng?",
  },
];


export default function AiFloatingButton() {
  const pathname = usePathname();
  const { authUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [image, setImage] = useState(null);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);
  const scanFileInputRef = useRef(null);


  const suggestions = [
    "Cách chăm sóc sầu riêng mùa hạn mặn ?",
    "Sầu riêng có dễ trồng không ?",
    "Bí quyết xử lý cây sầu riêng bị vàng lá ?",
  ];


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatOpen]);


  useEffect(() => {
    if (!scanFile) {
      setScanPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(scanFile);
    setScanPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [scanFile]);


  if (!authUser) return null;
  if (pathname?.startsWith("/dashboard")) return null;

  const isNotDurianImageError =
    typeof scanError === "string" &&
    /chua phai anh sau rieng|chưa phải ảnh sầu riêng|liên quan đến sầu riêng/i.test(scanError);


  const openMenu = () => {
    if (chatOpen) return;
    setMenuOpen(true);
  };


  const closeMenu = () => setMenuOpen(false);


  const openChat = () => {
    setChatOpen(true);
    setMenuOpen(false);
  };


  const closeChat = () => setChatOpen(false);


  const openScan = () => {
    setScanOpen(true);
    setMenuOpen(false);
    setScanError(null);
  };


  const closeScan = () => setScanOpen(false);


  const resetScan = () => {
    setScanFile(null);
    setScanResult(null);
    setScanError(null);
  };


  const startNewConversation = () => {
    setMessages(initialMessages);
    setInput("");
    setError(null);
    setShowSuggestions(true);
    setImage(null);
  };


  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Chỉ hỗ trợ ảnh");
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


  const handleScanFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;


    // Allow selecting the same file again.
    e.target.value = "";


    if (!file.type.startsWith("image/")) {
      setScanError("Chỉ hỗ trợ ảnh");
      return;
    }


    setScanFile(file);
    setScanResult(null);
    setScanError(null);


    setScanLoading(true);
    try {
      const res = await aiAPI.predictDisease(file);
      if (!res?.success) {
        throw new Error(res?.message || "Không thể gọi AI nhận diện");
      }
      setScanResult(res.data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Không thể nhận diện ảnh lúc này";
      setScanError(message);
    } finally {
      setScanLoading(false);
    }
  };


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;


    const userMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      image,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImage(null);
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);


    try {
      const history = messages
        .filter((m) => m.id !== "welcome" && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));


      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            role: "model",
            content: data.data,
          },
        ]);
      } else {
        throw new Error(data.error || "Không thể gọi AI");
      }
    } catch (err) {
      const failMessage = {
        id: `e-${Date.now()}`,
        role: "model",
        content: "Xin lỗi, tôi đang bận. Vui lòng thử lại sau.",
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
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[92vw] h-130 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white">
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
                onClick={closeChat}
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
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : msg.isError
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
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
                      className="relative text-left px-3 py-2 text-sm rounded-xl bg-white/90 border border-emerald-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-emerald-800 snap-start shrink-0 min-w-60"
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
            <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-white shadow-sm px-3 py-1.5 focus-within:border-emerald-500">
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


      {/* Floating Scan Popup */}
{scanOpen && (
  <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px]">
    <div className="w-[min(680px,96vw)] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-emerald-700 via-green-600 to-lime-500 text-white">
        <div className="font-semibold flex items-center gap-2">
          <ScanSearch size={18} />
          Scan AI
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetScan}
            className="p-2 rounded-full hover:bg-white/15 transition-colors"
            disabled={scanLoading}
            title="Quét mới"
          >
            <RefreshCcw size={18} />
          </button>

          <button
            type="button"
            onClick={closeScan}
            className="p-2 rounded-full hover:bg-white/15 transition-colors"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative overflow-y-auto p-4 md:p-5 bg-linear-to-b from-emerald-50/70 via-lime-50/40 to-white space-y-4">
        {/* Upload Card */}
        <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-lime-50 to-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-800 mb-2">
            Tải hình ảnh bệnh của sầu riêng
          </div>

          <button
            type="button"
            onClick={() => scanFileInputRef.current?.click()}
            disabled={scanLoading}
            className="group relative w-full rounded-2xl border-2 border-dashed border-emerald-300 bg-white/90 p-4 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/50 disabled:opacity-70"
          >
            <span className="absolute right-4 top-4 rounded-full bg-emerald-100 p-2 text-emerald-700 group-hover:bg-emerald-200">
              <Upload size={16} />
            </span>

            <div className="flex items-start gap-3 pr-10">
              <span className="mt-0.5 rounded-full bg-lime-100 p-2 text-lime-700">
                <Leaf size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Tải ảnh lá hoặc vùng bệnh sầu riêng
                </p>
                <p className="text-xs text-emerald-700/90 mt-1">
                  Nhấn để chọn ảnh rõ nét, đủ sáng.
                </p>
              </div>
            </div>
          </button>

          <div className="text-xs text-gray-500 mt-2 text-center truncate">
            {scanFile ? scanFile.name : "Chưa chọn ảnh"}
          </div>

          <div className="mt-3 rounded-xl border border-emerald-100 bg-white/80 p-3 text-xs text-emerald-900 space-y-1.5">
            <div className="font-semibold">Mẹo ảnh rõ nét để AI nhận diện tốt hơn</div>
            <div>- Chụp gần vùng lá bị bệnh, chiếm ít nhất 70% khung hình.</div>
            <div>- Ảnh đủ sáng, không rung tay, không bị ngược sáng.</div>
            <div>- Tránh mờ nhòe, tránh che khuất bởi tay hoặc vật khác.</div>
          </div>

        </div>

        {/* Preview */}
        {scanPreviewUrl && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="text-xs font-semibold text-gray-600 px-3 pt-3">Xem trước ảnh</div>

            <Image
              src={scanPreviewUrl}
              alt="Scan preview"
              width={900}
              height={500}
              unoptimized
              className="w-full h-64 md:h-72 object-contain bg-gray-100"
            />
          </div>
        )}

        {/* Result */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-600">Kết quả AI</div>

          {scanError && (
            <div
              className={`rounded-xl border p-3 ${
                isNotDurianImageError
                  ? "border-amber-200 bg-linear-to-r from-amber-50 to-lime-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 rounded-full p-1.5 ${
                    isNotDurianImageError ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <TriangleAlert size={14} />
                </span>
                <div className="space-y-1">
                  <p className={`text-sm font-semibold ${isNotDurianImageError ? "text-amber-900" : "text-red-800"}`}>
                    {isNotDurianImageError ? "Ảnh chưa phù hợp để chẩn đoán" : "Không thể phân tích ảnh"}
                  </p>
                  <p className={`text-sm ${isNotDurianImageError ? "text-amber-800" : "text-red-700"}`}>
                    {scanError}
                  </p>
                  {isNotDurianImageError && (
                    <p className="text-xs text-emerald-800">
                      Gợi ý: Chụp cận cảnh lá hoặc vùng bệnh trên cây sầu riêng, tránh nền quá nhiều chi tiết.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="space-y-3">
              {/* Predicted Disease */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-sm text-gray-800">
                  <b>Dự đoán:</b> {scanResult.predicted_class_vi || scanResult.predicted_class}
                </div>

                {/* Confidence bar */}
                {scanResult.confidence && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">
                      Độ tin cậy {(Number(scanResult.confidence) * 100).toFixed(2)}%
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${Number(scanResult.confidence) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Solutions */}
              {Array.isArray(scanResult?.solutions) && scanResult.solutions.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">Giải pháp</div>

                  <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                    {scanResult.solutions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!scanLoading && !scanResult && !scanError && (
            <div className="text-sm text-gray-500">Chọn ảnh để bắt đầu nhận diện bệnh.</div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          Do AI tạo. Hãy kiểm tra kỹ độ chính xác.
        </p>

        {/* Loading overlay */}
        {scanLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-44 w-44 flex items-center justify-center">
              <span className="absolute h-40 w-40 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
              <span className="absolute h-28 w-28 rounded-full border-4 border-lime-200 border-b-lime-500 animate-spin [animation-direction:reverse] [animation-duration:900ms]" />
              </div>
              <div className="text-center px-4 py-2.5 rounded-xl bg-white/95 border border-emerald-200 shadow-sm">
                <p className="text-base font-extrabold tracking-tight text-emerald-900">VietDurian</p>
                <p className="text-sm font-semibold text-emerald-950">đang phân tích hình ảnh của bạn</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}


      {/* Hoverable Floating Cluster */}
      <div
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
      >
        {/* Floating Menu (2 icons) */}
        {menuOpen && (
          <div className="flex flex-col gap-3">
            {/* Icon bên trên (placeholder - bạn sẽ xử lý sau) */}
            <button
              type="button"
              className="group relative flex items-center justify-end gap-3 focus-visible:outline-none"
              aria-label="Scan AI - Nhận diện sâu bệnh"
              onClick={() => {
                openScan();
              }}
              disabled={scanLoading}
            >
              <div className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 text-right leading-tight px-4 py-2.5 rounded-xl bg-gray-900/85 backdrop-blur-sm shadow-xl ring-1 ring-white/10 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all whitespace-nowrap">
                <div className="text-white font-semibold">Scan AI</div>
                <div className="text-white/80 text-sm">Nhận diện sâu bệnh</div>
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 -right-2 -translate-y-1/2 border-8 border-transparent border-l-gray-900"
                />
              </div>
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-emerald-900 shadow-2xl ring-2 ring-emerald-400/60 transition-transform group-hover:scale-110">
                {/* Hiệu ứng scan */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-emerald-400/10"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 scan-sweep"
                />
                <ScanSearch size={22} />
              </div>
            </button>


            {/* Icon đầu tiên: message -> mở box chat như hiện tại */}
            <button
              type="button"
              className="group relative flex items-center justify-end gap-3 focus-visible:outline-none"
              aria-label="Mở chat tư vấn sầu riêng"
              onClick={openChat}
            >
              <div className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 text-right leading-tight px-4 py-2.5 rounded-xl bg-gray-900/85 backdrop-blur-sm shadow-xl ring-1 ring-white/10 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all whitespace-nowrap">
                <div className="text-white font-semibold">Trợ lý AI</div>
                <div className="text-white/80 text-sm">Giải đáp thắc mắc</div>
                <div
                  aria-hidden="true"
                  className="absolute top-1/2 -right-2 -translate-y-1/2 border-8 border-transparent border-l-gray-900"
                />
              </div>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-2xl ring-1 ring-white/20 transition-transform group-hover:scale-110">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-2 rounded-full border border-emerald-200/60 motion-safe:animate-ping"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-full border border-green-200/40 motion-safe:animate-pulse"
                />
                <MessageCircleMore size={22} />
              </div>
            </button>
          </div>
        )}


        {/* Floating Main Button (AI icon) */}
        <button
          type="button"
          className="flex items-center justify-center w-15 h-15 bg-linear-to-br from-emerald-700 via-green-600 to-lime-500 text-white rounded-full shadow-2xl ring-1 ring-white/20 hover:scale-110 transition-all duration-300 group cursor-pointer font-medium text-3xl focus-visible:outline-none"
          aria-label={menuOpen ? "Đóng menu trợ lý AI" : "Mở menu trợ lý AI"}
        >
          {menuOpen ? <X size={30} /> : <Sparkles size={30} className="ai-wiggle" />}
          <div className="absolute right-full mr-4 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none translate-x-2 group-hover:translate-x-0 duration-200">
            AI hỗ trợ
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        </button>


        {/* Hidden input for Scan AI */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={scanFileInputRef}
          onChange={handleScanFileChange}
        />
      </div>
    </>
  );
}




"use client";

import { useState, useRef } from "react";
import {
  CreditCard,
  Info,
  ShieldCheck,
  Upload,
  X,
  CheckCircle,
  ArrowRight,
  Loader2,
  ScanLine,
  ChevronLeft,
  IdCard,
  Scroll,
} from "lucide-react";
import { usePermissionStore } from "@/store/usePermissionStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Upload Zone Component ────────────────────────────────────────────────────

function UploadZone({
  hint,
  label,
  description,
  file,
  onFileChange,
  className,
  icon: Icon,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const previewUrl =
    file && file.type?.startsWith("image/") ? URL.createObjectURL(file) : null;

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        {file && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
            <CheckCircle className="w-3 h-3" />
            Đã nhận
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          file
            ? "border-emerald-200 bg-emerald-50/40 cursor-default"
            : dragging
              ? "border-emerald-400 bg-emerald-50 cursor-pointer scale-[1.01]"
              : "border-gray-200 bg-gray-50/60 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer",
        ].join(" ")}
      >
        {file ? (
          /* File preview */
          <div className="flex items-center gap-3 p-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`${hint} preview`}
                className="w-50 h-full max-h-33 object-cover rounded-lg border border-emerald-100 shrink-0"
              />
            ) : (
              <div className="w-16 h-11 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest">
                  {file.name.split(".").pop().toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex-1 min-w-0">
              <p className="text-xs text-gray-400 mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Empty upload state */
          <div className="flex flex-col items-center justify-center py-9 px-4 gap-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm mb-1">
              <Upload className="w-[18px] h-[18px]" />
            </div>
            <p className="text-sm font-medium text-gray-600">{hint}</p>
            <p className="text-xs text-gray-400">PNG hoặc JPG tối đa 5MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files[0] || null)}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubmitProofPage() {
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { submitProof, isSubmittingProof } = usePermissionStore();
  const router = useRouter();

  const canSubmit = Boolean(
    frontFile && backFile && certificate && !isSubmittingProof,
  );

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const [frontUrl, backUrl, certificateUrl] = await Promise.all([
      fileToDataUrl(frontFile),
      fileToDataUrl(backFile),
      fileToDataUrl(certificate),
    ]);

    const payload = {
      proofs: [
        { type: "cccd_front", url: frontUrl },
        { type: "cccd_back", url: backUrl },
        { type: "certificate", url: certificateUrl },
      ],
    };

    const result = await submitProof(payload);
    if (result) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFrontFile(null);
    setBackFile(null);
    setCertificate(null);
    setSubmitted(false);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex justify-center items-center px-4 bg-gray-50 font-sans p-5 lg:pt-0 w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Đã gửi thành công!
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            CCCD của bạn đã được nhận. Chúng tôi sẽ xem xét và xác minh danh
            tính của bạn trong vòng 1–2 ngày làm việc.
          </p>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl py-3 transition-all"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center px-4 bg-gray-50 font-sans p-5 lg:pt-0 w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]">
      <Link
        className="absolute top-5 left-5 flex items-center hover:text-emerald-500 transition-colors duration-300"
        href={"/"}
      >
        <ChevronLeft /> Quay về trang chủ
      </Link>
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 pb-2 pt-10 lg:pt-5">
          <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">
            Xác nhận CCCD
          </h1>
          <p className="text-[13.5px] text-gray-500 leading-relaxed max-w-md">
            Vui lòng tải lên ảnh rõ nét của cả hai mặt CCCD (Căn cước công dân).
            Đảm bảo tất cả thông tin đều có thể đọc được và hình ảnh không bị
            mờ.
          </p>
        </div>

        {/* Front Side Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <UploadZone
            hint="Nhấn để tải ảnh mặt trước"
            label="Mặt trước"
            description="Chọn ảnh CCCD có mặt của bạn"
            icon={IdCard}
            file={frontFile}
            onFileChange={setFrontFile}
          />

          {/* Back Side Upload */}
          <UploadZone
            hint="Nhấn để tải ảnh mặt sau"
            label="Mặt sau"
            description="Chọn ảnh CCCD mặt sau của bạn"
            icon={CreditCard}
            file={backFile}
            onFileChange={setBackFile}
          />

          {/* Certificate Upload */}
          <UploadZone
            hint="Nhấn để tải ảnh giấy chứng nhận"
            label="Giấy chứng nhận"
            description="Chọn ảnh chứng nhận của bạn"
            file={certificate}
            icon={Scroll}
            onFileChange={setCertificate}
            className={"col-span-1 lg:col-span-2"}
          />
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-[13px] mb-3">
            <Info className="w-4 h-4" />
            Thông tin quan trọng
          </div>
          <ul className="space-y-1.5">
            {[
              "Đảm bảo CCCD của bạn được đặt trên bề mặt phẳng với ánh sáng tốt.",
              "Tất cả chữ viết phải hiển thị rõ ràng và có thể đọc được.",
              "Hỗ trợ format ảnh: JPG hoặc PNG",
              "Kích thước ảnh tối đa: 5MB",
              "Mọi thông tin sẽ được mã hóa và được giữ bí mật",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-blue-700"
              >
                <span className="mt-[5px] w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-[13px] mb-2">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            Quyền riêng tư &amp; Bảo mật
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Thông tin CCCD của bạn được mã hóa và lưu trữ an toàn. Chúng tôi chỉ
            sử dụng thông tin này cho mục đích xác minh danh tính và tuân thủ
            các quy định bảo vệ dữ liệu của Việt Nam.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer px-6 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              "cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
              canSubmit
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:shadow-lg active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            {isSubmittingProof ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                Gửi xác minh
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Gặp vấn để? Liên hệ{" "}
          <a
            href="https://zalo.me/0328718050"
            target="_blank"
            className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
          >
            Customer Support
          </a>{" "}
          để được hỗ trợ
        </p>
      </div>
    </div>
  );
}

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
import { cloudinaryService } from "@/lib/cloudinaryService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import FloatingLangToggle from "@/components/FloatingLangToggle";
import { useLanguage } from "@/context/LanguageContext";

// ─── Upload Zone Component ────────────────────────────────────────────────────

function UploadZone({
  hint,
  label,
  description,
  file,
  onFileChange,
  files,
  onFilesChange,
  multiple = false,
  maxFiles = 1,
  className,
  icon: Icon,
  receivedLabel,
  fileTypeHint,
  maxFileSizeMB = 5,
  fileTooLargeText,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const selectedFiles = multiple ? files || [] : file ? [file] : [];
  const hasFiles = selectedFiles.length > 0;
  const canAddMore = !multiple || selectedFiles.length < maxFiles;
  const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

  const getValidFiles = (incomingFiles) => {
    const oversizedFiles = incomingFiles.filter(
      (incoming) => incoming.size > maxFileSizeBytes,
    );

    if (oversizedFiles.length > 0) {
      toast.error(
        fileTooLargeText || `Each image must be up to ${maxFileSizeMB}MB`,
      );
    }

    return incomingFiles.filter(
      (incoming) => incoming.size <= maxFileSizeBytes,
    );
  };

  const applyFiles = (incomingFiles) => {
    const validFiles = getValidFiles(incomingFiles);

    if (validFiles.length === 0) {
      return;
    }

    if (!multiple) {
      onFileChange?.(validFiles[0] || null);
      return;
    }

    const nextFiles = [...selectedFiles];
    for (const incoming of validFiles) {
      if (nextFiles.length >= maxFiles) break;

      const duplicated = nextFiles.some(
        (f) =>
          f.name === incoming.name &&
          f.size === incoming.size &&
          f.lastModified === incoming.lastModified,
      );

      if (!duplicated) {
        nextFiles.push(incoming);
      }
    }

    onFilesChange?.(nextFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    if (!canAddMore) return;

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      applyFiles(droppedFiles);
    }
  };

  const handleRemove = (e, removeIndex = 0) => {
    e.stopPropagation();

    if (!multiple) {
      onFileChange?.(null);
    } else {
      const nextFiles = selectedFiles.filter(
        (_, index) => index !== removeIndex,
      );
      onFilesChange?.(nextFiles);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

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
        {hasFiles && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
            <CheckCircle className="w-3 h-3" />
            {multiple
              ? `${receivedLabel} (${selectedFiles.length}/${maxFiles})`
              : receivedLabel}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => canAddMore && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (canAddMore) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          hasFiles
            ? "border-emerald-200 bg-emerald-50/40 cursor-default"
            : dragging
              ? "border-emerald-400 bg-emerald-50 cursor-pointer scale-[1.01]"
              : "border-gray-200 bg-gray-50/60 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer",
        ].join(" ")}
      >
        {hasFiles ? (
          /* File preview */
          multiple ? (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedFiles.map((selected, index) => {
                  const previewUrl = selected.type?.startsWith("image/")
                    ? URL.createObjectURL(selected)
                    : null;

                  return (
                    <div
                      key={`${selected.name}-${selected.lastModified}-${index}`}
                      className="relative rounded-lg border border-emerald-100 bg-white overflow-hidden"
                    >
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt={`${hint} preview ${index + 1}`}
                          width={160}
                          height={96}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 bg-emerald-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-600 tracking-widest">
                            {selected.name.split(".").pop().toUpperCase()}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={(e) => handleRemove(e, index)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-md border border-gray-200 bg-white/95 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="px-2 py-1.5 bg-white/95">
                        <p className="text-[11px] text-gray-500 truncate">
                          {(selected.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  );
                })}

                {canAddMore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                    className="h-24 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-600 text-xs font-medium hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    + {hint}
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500">
                {selectedFiles.length}/{maxFiles} files selected
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              {selectedFiles[0]?.type?.startsWith("image/") ? (
                <Image
                  src={URL.createObjectURL(selectedFiles[0])}
                  alt={`${hint} preview`}
                  width={96}
                  height={96}
                  className="w-50 h-full max-h-33 object-cover rounded-lg border border-emerald-100 shrink-0"
                />
              ) : (
                <div className="w-16 h-11 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-600 tracking-widest">
                    {selectedFiles[0]?.name.split(".").pop().toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex-1 min-w-0">
                <p className="text-xs text-gray-400 mt-0.5">
                  {(selectedFiles[0]?.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleRemove}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        ) : (
          /* Empty upload state */
          <div className="flex flex-col items-center justify-center py-9 px-4 gap-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm mb-1">
              <Upload className="w-[18px] h-[18px]" />
            </div>
            <p className="text-sm font-medium text-gray-600">{hint}</p>
            <p className="text-xs text-gray-400">{fileTypeHint}</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic"
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            const incomingFiles = Array.from(e.target.files || []);
            if (incomingFiles.length > 0) {
              applyFiles(incomingFiles);
            }
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubmitProofPage() {
  const { language } = useLanguage();
  const isVi = language === "vi";
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { submitProof, isSubmittingProof } = usePermissionStore();
  const router = useRouter();

  const canSubmit = Boolean(
    frontFile &&
    backFile &&
    certificateFiles.length > 0 &&
    !isSubmittingProof &&
    !uploading,
  );

  const texts = isVi
    ? {
        toastUploading: "Đang tải file lên...",
        toastUploadError: "Lỗi khi tải file lên",
        successTitle: "Đã gửi thành công!",
        successDesc:
          "CCCD của bạn đã được nhận. Chúng tôi sẽ xem xét và xác minh danh tính của bạn trong vòng 1–2 ngày làm việc.",
        backHome: "Quay về trang chủ",
        backHomeShort: "Quay về trang chủ",
        pageTitle: "Xác nhận CCCD",
        pageDesc:
          "Vui lòng tải lên ảnh rõ nét của cả hai mặt CCCD (Căn cước công dân). Đảm bảo tất cả thông tin đều có thể đọc được và hình ảnh không bị mờ.",
        frontHint: "Nhấn để tải ảnh mặt trước",
        frontLabel: "Mặt trước",
        frontDesc: "Chọn ảnh CCCD có mặt của bạn",
        backHint: "Nhấn để tải ảnh mặt sau",
        backLabel: "Mặt sau",
        backDesc: "Chọn ảnh CCCD mặt sau của bạn",
        certHint: "Nhấn để tải ảnh giấy chứng nhận",
        certLabel: "Các chứng nhận liên quan",
        certDesc: "Chọn tối đa 5 ảnh chứng nhận của bạn",
        receivedLabel: "Đã nhận",
        fileTypeHint: "PNG hoặc JPG tối đa 5MB",
        fileTooLargeText: "Mỗi ảnh chỉ được tối đa 5MB",
        importantTitle: "Thông tin quan trọng",
        importantItems: [
          "Đảm bảo CCCD của bạn được đặt trên bề mặt phẳng với ánh sáng tốt.",
          "Tất cả chữ viết phải hiển thị rõ ràng và có thể đọc được.",
          "Hỗ trợ format ảnh: JPG hoặc PNG",
          "Kích thước ảnh tối đa: 5MB",
          "Mọi thông tin sẽ được mã hóa và được giữ bí mật",
        ],
        privacyTitle: "Quyền riêng tư & Bảo mật",
        privacyDesc:
          "Thông tin CCCD của bạn được mã hóa và lưu trữ an toàn. Chúng tôi chỉ sử dụng thông tin này cho mục đích xác minh danh tính và tuân thủ các quy định bảo vệ dữ liệu của Việt Nam.",
        cancel: "Hủy",
        submittingUpload: "Đang tải file...",
        submitting: "Đang gửi...",
        submit: "Gửi xác minh",
        supportPrefix: "Gặp vấn đề? Liên hệ",
        supportSuffix: "để được hỗ trợ",
      }
    : {
        toastUploading: "Uploading files...",
        toastUploadError: "Error while uploading files",
        successTitle: "Submitted successfully!",
        successDesc:
          "Your ID documents have been received. We will review and verify your identity within 1-2 business days.",
        backHome: "Back to homepage",
        backHomeShort: "Back to homepage",
        pageTitle: "Identity verification",
        pageDesc:
          "Please upload clear photos of both sides of your ID card. Make sure all information is readable and images are not blurry.",
        frontHint: "Click to upload front side",
        frontLabel: "Front side",
        frontDesc: "Choose front ID image with your portrait",
        backHint: "Click to upload back side",
        backLabel: "Back side",
        backDesc: "Choose back ID image",
        certHint: "Click to upload certificate",
        certLabel: "Other Certificates",
        certDesc: "Choose up to 5 certificate images",
        receivedLabel: "Received",
        fileTypeHint: "PNG or JPG up to 5MB",
        fileTooLargeText: "Each image must be up to 5MB",
        importantTitle: "Important information",
        importantItems: [
          "Place your ID card on a flat surface with good lighting.",
          "All text must be clearly visible and readable.",
          "Supported formats: JPG or PNG",
          "Maximum image size: 5MB",
          "All data is encrypted and kept confidential",
        ],
        privacyTitle: "Privacy & Security",
        privacyDesc:
          "Your identity information is encrypted and securely stored. We only use this data for identity verification and compliance purposes.",
        cancel: "Cancel",
        submittingUpload: "Uploading files...",
        submitting: "Submitting...",
        submit: "Submit verification",
        supportPrefix: "Having issues? Contact",
        supportSuffix: "for support",
      };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setUploading(true);
      toast.loading(texts.toastUploading);

      // Upload files to Cloudinary via backend
      const [frontProof, backProof, certProofs] = await Promise.all([
        cloudinaryService.uploadProofToCloudinary(frontFile, "cccd_front"),
        cloudinaryService.uploadProofToCloudinary(backFile, "cccd_back"),
        Promise.all(
          certificateFiles.map((certificateFile) =>
            cloudinaryService.uploadProofToCloudinary(
              certificateFile,
              "certificate",
            ),
          ),
        ),
      ]);

      toast.dismiss();

      const payload = {
        proofs: [frontProof, backProof, ...certProofs],
      };

      const result = await submitProof(payload);
      if (result) {
        setSubmitted(true);
      }
    } catch (error) {
      toast.error(error?.message || texts.toastUploadError);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      toast.dismiss();
    }
  };

  const handleReset = () => {
    setFrontFile(null);
    setBackFile(null);
    setCertificateFiles([]);
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
            {texts.successTitle}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {texts.successDesc}
          </p>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl py-3 transition-all"
          >
            {texts.backHome}
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
        <ChevronLeft /> {texts.backHomeShort}
      </Link>
      <div className="w-full max-w-4xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-3 pb-2 pt-10 lg:pt-5">
          <h1 className="text-[22px] font-bold text-gray-800 tracking-tight">
            {texts.pageTitle}
          </h1>
          <p className="text-[13.5px] text-gray-500 leading-relaxed max-w-md">
            {texts.pageDesc}
          </p>
        </div>

        {/* Front Side Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <UploadZone
            hint={texts.frontHint}
            label={texts.frontLabel}
            description={texts.frontDesc}
            icon={IdCard}
            file={frontFile}
            onFileChange={setFrontFile}
            receivedLabel={texts.receivedLabel}
            fileTypeHint={texts.fileTypeHint}
            fileTooLargeText={texts.fileTooLargeText}
          />

          {/* Back Side Upload */}
          <UploadZone
            hint={texts.backHint}
            label={texts.backLabel}
            description={texts.backDesc}
            icon={CreditCard}
            file={backFile}
            onFileChange={setBackFile}
            receivedLabel={texts.receivedLabel}
            fileTypeHint={texts.fileTypeHint}
            fileTooLargeText={texts.fileTooLargeText}
          />

          {/* Certificate Upload */}
          <UploadZone
            hint={texts.certHint}
            label={texts.certLabel}
            description={texts.certDesc}
            files={certificateFiles}
            icon={Scroll}
            onFilesChange={setCertificateFiles}
            multiple
            maxFiles={5}
            className={"col-span-1 lg:col-span-2"}
            receivedLabel={texts.receivedLabel}
            fileTypeHint={texts.fileTypeHint}
            fileTooLargeText={texts.fileTooLargeText}
          />
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-[13px] mb-3">
            <Info className="w-4 h-4" />
            {texts.importantTitle}
          </div>
          <ul className="space-y-1.5">
            {texts.importantItems.map((item, i) => (
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
            {texts.privacyTitle}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            {texts.privacyDesc}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer px-6 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            {texts.cancel}
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
            {uploading || isSubmittingProof ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? texts.submittingUpload : texts.submitting}
              </>
            ) : (
              <>
                {texts.submit}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          {texts.supportPrefix}{" "}
          <a
            href="https://zalo.me/0328718050"
            target="_blank"
            className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
          >
            Customer Support
          </a>{" "}
          {texts.supportSuffix}
        </p>
      </div>
    </div>
  );
}

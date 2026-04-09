"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Leaf,
  RefreshCcw,
  ScanSearch,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { aiAPI } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfileAiPage() {
  const { t, language } = useLanguage();
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const scanFileInputRef = useRef(null);

  const humanizeDiseaseKey = (value) =>
    String(value || "")
      .split("_")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  useEffect(() => {
    if (!scanFile) {
      setScanPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(scanFile);
    setScanPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [scanFile]);

  const isNotDurianImageError =
    typeof scanError === "string" &&
    /chua phai anh sau rieng|chưa phải ảnh sầu riêng|liên quan đến sầu riêng/i.test(
      scanError,
    );

  const relatedDiseases = useMemo(() => {
    if (!Array.isArray(scanResult?.top_k)) return [];

    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const predictedSet = new Set([
      normalize(scanResult?.predicted_class),
      normalize(scanResult?.predicted_class_en),
      normalize(scanResult?.predicted_class_vi),
    ]);

    const isNonDiseaseLabel = (label) => {
      const normalized = normalize(label);
      return (
        normalized.includes("healthy") ||
        normalized.includes("khỏe mạnh") ||
        normalized.includes("khoe manh") ||
        normalized.includes("binh thuong") ||
        normalized.includes("bình thường")
      );
    };

    return scanResult.top_k
      .map((item) => {
        const probability = Number(item?.probability);
        if (!Number.isFinite(probability)) return null;

        const label =
          language === "en"
            ? item?.class_name_en ||
              humanizeDiseaseKey(item?.class_name) ||
              t("ai_disease_unknown")
            : item?.class_name_vi ||
              item?.class_name_en ||
              item?.class_name ||
              t("ai_disease_unknown");
        const aliases = [
          normalize(item?.class_name),
          normalize(item?.class_name_en),
          normalize(item?.class_name_vi),
          normalize(label),
        ];

        const isPredictedClass = aliases.some((name) => predictedSet.has(name));
        if (isPredictedClass || isNonDiseaseLabel(label)) return null;

        return {
          id:
            item?.class_name_en ||
            item?.class_name ||
            item?.class_name_vi ||
            "unknown",
          label,
          probability: Math.max(0, Math.min(1, probability)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 4);
  }, [scanResult, t, language]);

  const resetScan = () => {
    setScanFile(null);
    setScanResult(null);
    setScanError(null);
  };

  const handleScanFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setScanError(t("ai_error_image_type"));
      return;
    }

    setScanFile(file);
    setScanResult(null);
    setScanError(null);

    setScanLoading(true);
    try {
      const res = await aiAPI.predictDisease(file);
      if (!res?.success) {
        throw new Error(res?.message || t("ai_error_ai_call"));
      }
      setScanResult(res.data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t("ai_error_generic");
      setScanError(message);
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-56px)] p-4 md:p-6 lg:p-8">
      <div className="w-full rounded-2xl border border-emerald-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-emerald-700 via-green-600 to-lime-500 text-white">
          <div className="font-semibold flex items-center gap-2">
            <ScanSearch size={18} />
            {t("ai_page_title")}
          </div>
          <button
            type="button"
            onClick={resetScan}
            className="p-2 rounded-full hover:bg-white/15 transition-colors"
            disabled={scanLoading}
            title={t("ai_page_reset_title")}
          >
            <RefreshCcw size={18} />
          </button>
        </div>

        <div className="relative p-4 md:p-5 bg-linear-to-b from-emerald-50/70 via-lime-50/40 to-white">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-7 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-lime-50 to-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  {t("ai_upload_label")}
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
                        {t("ai_upload_btn_title")}
                      </p>
                      <p className="text-xs text-emerald-700/90 mt-1">
                        {t("ai_upload_btn_desc")}
                      </p>
                    </div>
                  </div>
                </button>

                <div className="text-xs text-gray-500 mt-2 text-center truncate">
                  {scanFile ? scanFile.name : t("ai_upload_no_file")}
                </div>

                <div className="mt-3 rounded-xl border border-emerald-100 bg-white/80 p-3 text-xs text-emerald-900 space-y-1.5">
                  <div className="font-semibold">{t("ai_tips_title")}</div>
                  <div>{t("ai_tip_1")}</div>
                  <div>{t("ai_tip_2")}</div>
                  <div>{t("ai_tip_3")}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="text-xs font-semibold text-gray-600 px-3 pt-3">
                  {t("ai_preview_label")}
                </div>
                {scanPreviewUrl ? (
                  <Image
                    src={scanPreviewUrl}
                    alt="Scan preview"
                    width={900}
                    height={500}
                    unoptimized
                    className="w-full h-64 md:h-72 object-contain bg-gray-100"
                  />
                ) : (
                  <div className="h-64 md:h-72 flex items-center justify-center text-sm text-gray-400 bg-gray-50 border-t border-dashed border-gray-200">
                    {t("ai_preview_empty")}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-5 xl:sticky xl:top-20 self-start">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4 space-y-3 xl:min-h-135">
                <div className="text-xs font-semibold text-gray-600">
                  {t("ai_result_label")}
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    {t("ai_scan_info_title")}
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div>
                      {t("ai_scan_file_label")}{" "}
                      <span className="font-medium text-gray-700">
                        {scanFile?.name || t("ai_scan_file_none")}
                      </span>
                    </div>
                    <div>
                      {t("ai_scan_status_label")}{" "}
                      <span className="font-medium text-emerald-700">
                        {scanLoading
                          ? t("ai_scan_status_analyzing")
                          : scanResult
                            ? t("ai_scan_status_done")
                            : t("ai_scan_status_ready")}
                      </span>
                    </div>
                  </div>
                </div>

                {scanError && (
                  <div
                    className={`rounded-xl border p-3 ${isNotDurianImageError ? "border-amber-200 bg-linear-to-r from-amber-50 to-lime-50" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 rounded-full p-1.5 ${isNotDurianImageError ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                      >
                        <TriangleAlert size={14} />
                      </span>
                      <div className="space-y-1">
                        <p
                          className={`text-sm font-semibold ${isNotDurianImageError ? "text-amber-900" : "text-red-800"}`}
                        >
                          {isNotDurianImageError
                            ? t("ai_error_not_durian_title")
                            : t("ai_error_generic_title")}
                        </p>
                        <p
                          className={`text-sm ${isNotDurianImageError ? "text-amber-800" : "text-red-700"}`}
                        >
                          {scanError}
                        </p>
                        {isNotDurianImageError && (
                          <p className="text-xs text-emerald-800">
                            {t("ai_error_not_durian_hint")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {scanResult && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <div className="text-sm text-gray-800">
                        <b>{t("ai_prediction_label")}</b>{" "}
                        {language === "en"
                          ? scanResult.predicted_class_en ||
                            humanizeDiseaseKey(scanResult.predicted_class) ||
                            scanResult.predicted_class
                          : scanResult.predicted_class_vi ||
                            scanResult.predicted_class}
                      </div>
                      {scanResult.confidence && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">
                            {t("ai_confidence_label")}{" "}
                            {(Number(scanResult.confidence) * 100).toFixed(2)}%
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

                    {relatedDiseases.length > 0 && (
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">
                          {t("ai_related_diseases_title")}
                        </div>
                        <div className="space-y-2.5">
                          {relatedDiseases.map((disease, index) => (
                            <div key={`${disease.id}-${index}`}>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-700 truncate pr-2">
                                  {index + 1}. {disease.label}
                                </span>
                                <span className="font-semibold text-emerald-700">
                                  {(disease.probability * 100).toFixed(2)}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{
                                    width: `${disease.probability * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!scanLoading && !scanResult && !scanError && (
                  <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
                    <p className="text-sm text-gray-600">
                      {t("ai_guide_title")}
                    </p>
                    <div className="text-xs text-gray-600">
                      {t("ai_guide_hint")}
                    </div>
                    <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                      <li>{t("ai_guide_tip_1")}</li>
                      <li>{t("ai_guide_tip_2")}</li>
                      <li>{t("ai_guide_tip_3")}</li>
                    </ul>
                  </div>
                )}

                {scanResult && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      {t("ai_solution_title")}
                    </div>
                    {Array.isArray(scanResult?.solutions) &&
                    scanResult.solutions.length > 0 ? (
                      <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                        {scanResult.solutions.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                        <li>{t("ai_solution_default_1")}</li>
                        <li>{t("ai_solution_default_2")}</li>
                        <li>{t("ai_solution_default_3")}</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 pt-3 border-t border-emerald-100 text-center text-xs text-gray-500">
            {t("ai_disclaimer")}
          </p>

          {scanLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <span className="absolute h-40 w-40 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                  <span className="absolute h-28 w-28 rounded-full border-4 border-lime-200 border-b-lime-500 animate-spin [animation-direction:reverse] [animation-duration:900ms]" />
                </div>
                <div className="text-center px-4 py-2.5 rounded-xl bg-white/95 border border-emerald-200 shadow-sm">
                  <p className="text-base font-extrabold tracking-tight text-emerald-900">
                    {t("ai_loading_brand")}
                  </p>
                  <p className="text-sm font-semibold text-emerald-950">
                    {t("ai_loading_desc")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={scanFileInputRef}
        onChange={handleScanFileChange}
      />
    </section>
  );
}

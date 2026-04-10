"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useBuyingSeedStore } from "@/store/useBuyingSeedStore";
import { useBuyingFertilizerStore } from "@/store/useBuyingFertilizerStore";
import { useUseFertilizerStore } from "@/store/useUseFertilizerStore";
import { usePackagingHandlingStore } from "@/store/usePackagingHandlingStore";
import { useHarvestConsumptionStore } from "@/store/useHarvestConsumptionStore";
import { useIrrigationCostStore } from "@/store/useIrrigationCostStore";
import { useLaborCostsStore } from "@/store/useLaborCostsStore";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useLanguage } from "@/context/LanguageContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── HELPERS ───────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const flatCols = (d) => d.groups.flatMap((g) => g.cols);
const emptyRow = (d) => Object.fromEntries(flatCols(d).map((c) => [c.key, ""]));
const PDF_FONT_FILE = "Roboto-Regular.ttf";
const PDF_FONT_URL = "/fonts/Roboto/static/Roboto-Regular.ttf";
const PDF_FONT_BOLD_FILE = "Roboto-Bold.ttf";
const PDF_FONT_BOLD_URL = "/fonts/Roboto/static/Roboto-Bold.ttf";
const PDF_FONT_FAMILY = "Roboto";

let pdfFontBase64Promise;
let pdfFontBoldBase64Promise;

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const getPdfFontBase64 = async () => {
  if (pdfFontBase64Promise) return pdfFontBase64Promise;

  pdfFontBase64Promise = fetch(PDF_FONT_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Unable to load PDF font");
      return res.arrayBuffer();
    })
    .then(arrayBufferToBase64);

  return pdfFontBase64Promise;
};

const getPdfFontBoldBase64 = async () => {
  if (pdfFontBoldBase64Promise) return pdfFontBoldBase64Promise;

  pdfFontBoldBase64Promise = fetch(PDF_FONT_BOLD_URL)
    .then((res) => {
      if (!res.ok) throw new Error("Unable to load PDF bold font");
      return res.arrayBuffer();
    })
    .then(arrayBufferToBase64);

  return pdfFontBoldBase64Promise;
};

const sanitizeFileNamePart = (value) =>
  String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    // Keep original calendar day from common API date string formats.
    const matchedDate = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matchedDate) return matchedDate[1];
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString().slice(0, 10);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().slice(0, 10);
};

const normalizeBuyingSeed = (item) => ({
  id: item?._id,
  purchase_date: normalizeDateInputValue(item?.purchase_date),
  seed_name: item?.seed_name || "",
  quantity: item?.quantity ?? "",
  total_price: item?.total_price ?? "",
  supplier_name: item?.supplier_name || "",
  supplier_address: item?.supplier_address || "",
});

const buildBuyingSeedPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  purchase_date: form.purchase_date || null,
  seed_name: String(form.seed_name || "").trim(),
  quantity: Number(form.quantity) || 0,
  total_price: Number(form.total_price) || 0,
  supplier_name: String(form.supplier_name || "").trim(),
  supplier_address: String(form.supplier_address || "").trim(),
});

const normalizeBuyingFertilizer = (item) => ({
  id: item?._id,
  purchase_date: normalizeDateInputValue(item?.purchase_date),
  material_name: item?.material_name || "",
  quantity: item?.quantity ?? "",
  unit: item?.unit || "",
  total_price: item?.total_price ?? "",
  supplier_name: item?.supplier_name || "",
  supplier_address: item?.supplier_address || "",
});

const buildBuyingFertilizerPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  purchase_date: form.purchase_date || null,
  material_name: String(form.material_name || "").trim(),
  quantity: Number(form.quantity) || 0,
  unit: String(form.unit || "").trim(),
  total_price: Number(form.total_price) || 0,
  supplier_name: String(form.supplier_name || "").trim(),
  supplier_address: String(form.supplier_address || "").trim(),
});

const normalizeUseFertilizer = (item) => ({
  id: item?._id,
  usage_date: normalizeDateInputValue(item?.usage_date),
  fertilizer_name: item?.fertilizer_name || "",
  fertilizer_amount: item?.fertilizer_amount || "",
  pesticide_name: item?.pesticide_name || "",
  pesticide_concentration_amount: item?.pesticide_concentration_amount || "",
  preharvest_interval: item?.preharvest_interval || "",
});

const buildUseFertilizerPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  usage_date: form.usage_date || null,
  fertilizer_name: String(form.fertilizer_name || "").trim(),
  fertilizer_amount: String(form.fertilizer_amount || "").trim(),
  pesticide_name: String(form.pesticide_name || "").trim(),
  pesticide_concentration_amount: String(
    form.pesticide_concentration_amount || "",
  ).trim(),
  preharvest_interval: String(form.preharvest_interval || "").trim(),
});

const normalizePackagingHandling = (item) => ({
  id: item?._id || item?.id,
  handling_date: normalizeDateInputValue(item?.handling_date),
  packaging_type: item?.packaging_type || "",
  storage_location: item?.storage_location || "",
  treatment_method: item?.treatment_method || "",
});

const buildPackagingHandlingPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  handling_date: form.handling_date || null,
  packaging_type: String(form.packaging_type || "").trim(),
  storage_location: String(form.storage_location || "").trim(),
  treatment_method: String(form.treatment_method || "").trim(),
});

const normalizeHarvestConsumption = (item) => ({
  id: item?._id || item?.id,
  harvest_date: normalizeDateInputValue(item?.harvest_date),
  harvest_quantity_kg: item?.harvest_quantity_kg ?? "",
  sale_date: normalizeDateInputValue(item?.sale_date),
  buyer_or_consumption_address: item?.buyer_or_consumption_address || "",
  consumed_weight_kg: item?.consumed_weight_kg ?? "",
  sale_unit_price_vnd: item?.sale_unit_price_vnd ?? "",
});

const buildHarvestConsumptionPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  harvest_date: form.harvest_date || null,
  harvest_quantity_kg: Number(form.harvest_quantity_kg) || 0,
  sale_date: form.sale_date || null,
  buyer_or_consumption_address: String(
    form.buyer_or_consumption_address || "",
  ).trim(),
  consumed_weight_kg:
    form.consumed_weight_kg === "" || form.consumed_weight_kg === null
      ? null
      : Number(form.consumed_weight_kg) || 0,
  sale_unit_price_vnd:
    form.sale_unit_price_vnd === "" || form.sale_unit_price_vnd === null
      ? null
      : Number(form.sale_unit_price_vnd) || 0,
});

const normalizeIrrigationCost = (item) => ({
  id: item?._id || item?.id,
  execution_date: normalizeDateInputValue(item?.execution_date),
  irrigation_item: item?.irrigation_item || "",
  irrigation_method: item?.irrigation_method || "",
  irrigation_duration_hours: item?.irrigation_duration?.hours ?? "",
  irrigation_duration_minutes: item?.irrigation_duration?.minutes ?? "",
  irrigation_area: item?.irrigation_area || "",
  electricity_fuel_cost: item?.electricity_fuel_cost ?? "",
  performed_by: item?.performed_by || "",
});

const buildIrrigationCostPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  execution_date: form.execution_date || null,
  irrigation_item: String(form.irrigation_item || "").trim(),
  irrigation_method: form.irrigation_method || null,
  irrigation_duration: {
    hours:
      form.irrigation_duration_hours === "" ||
      form.irrigation_duration_hours === null
        ? null
        : Number(form.irrigation_duration_hours) || 0,
    minutes:
      form.irrigation_duration_minutes === "" ||
      form.irrigation_duration_minutes === null
        ? null
        : Number(form.irrigation_duration_minutes) || 0,
  },
  irrigation_area: String(form.irrigation_area || "").trim(),
  electricity_fuel_cost:
    form.electricity_fuel_cost === "" || form.electricity_fuel_cost === null
      ? null
      : Number(form.electricity_fuel_cost) || 0,
  performed_by: String(form.performed_by || "").trim(),
});

const normalizeLaborCost = (item) => ({
  id: item?._id || item?.id,
  labor_hire_date: normalizeDateInputValue(item?.labor_hire_date),
  work_description: item?.work_description || "",
  worker_quantity: item?.worker_quantity ?? "",
  working_time_hours: item?.working_time?.hours ?? "",
  working_time_minutes: item?.working_time?.minutes ?? "",
  total_price_vnd: item?.total_price_vnd ?? "",
  worker_or_team_name: item?.worker_or_team_name || "",
  supervisor_name: item?.supervisor_name || "",
});

const buildLaborCostPayload = (form, seasonDiaryId) => ({
  season_diary_id: seasonDiaryId,
  labor_hire_date: form.labor_hire_date || null,
  work_description: String(form.work_description || "").trim(),
  worker_quantity:
    form.worker_quantity === "" || form.worker_quantity === null
      ? null
      : Number(form.worker_quantity) || 0,
  working_time: {
    hours:
      form.working_time_hours === "" || form.working_time_hours === null
        ? null
        : Number(form.working_time_hours) || 0,
    minutes:
      form.working_time_minutes === "" || form.working_time_minutes === null
        ? null
        : Number(form.working_time_minutes) || 0,
  },
  total_price_vnd:
    form.total_price_vnd === "" || form.total_price_vnd === null
      ? null
      : Number(form.total_price_vnd) || 0,
  worker_or_team_name: String(form.worker_or_team_name || "").trim(),
  supervisor_name: String(form.supervisor_name || "").trim(),
});

const SEED_DATA = {
  1: [
    {
      id: "681111111111111111111101",
      purchase_date: "2026-01-05",
      seed_name: "Sầu riêng Ri6 (Gốc ghép 2 năm)",
      quantity: 120,
      total_price: 18000000,
      supplier_name: "Cơ sở Cây giống Út Hiện",
      supplier_address: "Huyện Chợ Lách, Tỉnh Bến Tre",
    },
    {
      id: "681111111111111111111102",
      purchase_date: "2026-03-12",
      seed_name: "Ri6",
      quantity: 200,
      total_price: 3500000,
      supplier_name: "Đại lý cây giống An Phát",
      supplier_address: "Cái Mơn, Bến Tre",
    },
  ],
  2: [
    {
      id: "683111111111111111111101",
      purchase_date: "2026-01-20",
      material_name: "Phân bón NPK 20-20-15 Đầu Trâu",
      quantity: 100,
      unit: "kg",
      total_price: 2850000,
      supplier_name: "Đại lý Vật tư Nông nghiệp Tám Hữu",
      supplier_address: "Chợ Cái Mơn, Huyện Chợ Lách, Tỉnh Bến Tre",
    },
    {
      id: "683111111111111111111102",
      purchase_date: "2026-03-12",
      material_name: "NPK 16-16-8",
      quantity: 200,
      unit: "kg",
      total_price: 4800000,
      supplier_name: "Đại lý vật tư An Phát",
      supplier_address: "Cái Mơn, Bến Tre",
    },
  ],
  3: [
    {
      id: "684111111111111111111101",
      usage_date: "2026-02-10",
      fertilizer_name: "Phân bón NPK 20-20-15 Đầu Trâu",
      fertilizer_amount: "2 kg/gốc",
      pesticide_name: "",
      pesticide_concentration_amount: "",
      preharvest_interval: "0",
    },
    {
      id: "684111111111111111111102",
      usage_date: "2026-03-10",
      fertilizer_name: "NPK 16-16-8",
      fertilizer_amount: "20 kg",
      pesticide_name: "Abamectin",
      pesticide_concentration_amount: "1.8EC - 400ml/200L",
      preharvest_interval: "14 ngày",
    },
  ],
  4: [
    {
      id: "685111111111111111111101",
      handling_date: "2026-02-15",
      packaging_type: "Vỏ bao phân bón NPK (Plastic)",
      storage_location: "Kho chứa phế liệu phía Tây",
      treatment_method: "Vệ sinh sạch và bán tái chế",
    },
    {
      id: "685111111111111111111102",
      handling_date: "2026-03-16",
      packaging_type: "Thùng carton",
      storage_location: "Kho A - Chợ Lách",
      treatment_method: "Khử trùng và đóng gói hút ẩm",
    },
  ],
  5: [
    {
      id: "69e111111111111111111102",
      harvest_date: "2026-03-28",
      harvest_quantity_kg: 1420,
      sale_date: "2026-03-30",
      buyer_or_consumption_address: "Hợp tác xã Sầu Riêng Bến Tre",
      consumed_weight_kg: 1150.75,
      sale_unit_price_vnd: 67000,
    },
    {
      id: "69e111111111111111111101",
      harvest_date: "2026-03-18",
      harvest_quantity_kg: 1250.5,
      sale_date: "",
      buyer_or_consumption_address: "",
      consumed_weight_kg: "",
      sale_unit_price_vnd: "",
    },
  ],
  6: [
    {
      id: "69c111111111111111111102",
      execution_date: "2026-03-18",
      irrigation_item: "Tưới duy trì độ ẩm sau bón phân",
      irrigation_method: "phun_mua",
      irrigation_duration_hours: 1,
      irrigation_duration_minutes: 45,
      irrigation_area: "2.2 ha",
      electricity_fuel_cost: 280000,
      performed_by: "Tổ chăm sóc vườn 1",
    },
    {
      id: "69c111111111111111111101",
      execution_date: "2026-03-10",
      irrigation_item: "Tưới giai đoạn ra hoa đợt 1",
      irrigation_method: "nho_giot",
      irrigation_duration_hours: 2,
      irrigation_duration_minutes: 30,
      irrigation_area: "2500 m2",
      electricity_fuel_cost: 320000,
      performed_by: "Nguyễn Văn A",
    },
  ],
  7: [
    {
      id: "69d111111111111111111102",
      labor_hire_date: "2026-03-12",
      work_description: "Tỉa cành tạo tán",
      worker_quantity: 4,
      working_time_hours: 6,
      working_time_minutes: 45,
      total_price_vnd: 320000,
      worker_or_team_name: "Nhóm anh Phúc",
      supervisor_name: "Trần Văn B",
    },
    {
      id: "69d111111111111111111101",
      labor_hire_date: "2026-03-08",
      work_description: "Phát cỏ, dọn vệ sinh vườn",
      worker_quantity: 5,
      working_time_hours: 7,
      working_time_minutes: 30,
      total_price_vnd: 280000,
      worker_or_team_name: "Tổ lao động Bến Tre 01",
      supervisor_name: "Nguyễn Văn A",
    },
  ],
};

const PAGE_SIZE = 8;

const isFieldRequired = (diary, col) => {
  if (typeof col.required === "boolean") return col.required;
  return diary.required === true;
};

// ── TOAST HOOK ────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  return { toast, show };
}

// ── RECORD MODAL ──────────────────────────────────────────────────────────────
function RecordModal({ diary, row, onSave, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...row });
  const isEdit = !!row.id;
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const isNumericColumn = (col) =>
    col.type === "number" || col.type === "currency";

  const handleNumericKeyDown = (e) => {
    if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
  };

  const handleInputChange = (col, value) => {
    if (!isNumericColumn(col)) {
      set(col.key, value);
      return;
    }
    if (value === "") {
      set(col.key, value);
      return;
    }
    const next = Number(value);
    if (Number.isNaN(next) || next < 0) return;
    set(col.key, value);
  };

  const isEmptyRequiredValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    return false;
  };

  const requiredColumns = diary.groups.flatMap((group) =>
    group.cols.filter((col) => isFieldRequired(diary, col)),
  );
  const hasMissingRequired = requiredColumns.some((col) =>
    isEmptyRequiredValue(form[col.key]),
  );
  const disableSubmit = !isEdit && hasMissingRequired;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-emerald-600 font-medium mb-0.5">
              {t("diary_label")} {diary.id}
            </p>
            <h2 className="text-sm font-semibold text-gray-800">
              {isEdit ? t("diary_edit_title") : t("diary_add_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {diary.groups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3 pb-1 border-b border-emerald-100">
                  {group.label}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {group.cols.map((col) => {
                  const isWide =
                    (col.type === "text" && col.width === "w-48") ||
                    col.type === "textarea";
                  const isRequired = isFieldRequired(diary, col);
                  return (
                    <div key={col.key} className={isWide ? "col-span-2" : ""}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {col.label.replace(/\n/g, " ")}
                        {isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                        {col.type === "currency" && (
                          <span className="text-gray-400 font-normal ml-1">
                            {t("diary_modal_currency_label")}
                          </span>
                        )}
                      </label>
                      {col.type === "select" ? (
                        <select
                          value={form[col.key] ?? ""}
                          onChange={(e) => set(col.key, e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        >
                          <option value="">
                            {t("diary_modal_select_placeholder")}
                          </option>
                          {(col.options ?? []).map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <input
                            type={
                              col.type === "number" || col.type === "currency"
                                ? "number"
                                : col.type === "date"
                                  ? "date"
                                  : "text"
                            }
                            value={form[col.key] ?? ""}
                            onChange={(e) =>
                              handleInputChange(col, e.target.value)
                            }
                            onKeyDown={
                              isNumericColumn(col)
                                ? handleNumericKeyDown
                                : undefined
                            }
                            min={
                              col.type === "number" || col.type === "currency"
                                ? "0"
                                : undefined
                            }
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                          />
                          {col.type === "currency" && form[col.key] && (
                            <p className="text-xs text-emerald-600 mt-1">
                              ={" "}
                              {new Intl.NumberFormat("vi-VN").format(
                                Number(form[col.key]) || 0,
                              )}{" "}
                              ₫
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-6 pb-5 pt-3 border-t border-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            {t("diary_modal_cancel")}
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={disableSubmit}
            className={`flex-1 py-2.5 rounded-xl text-sm text-white font-medium transition shadow-sm ${disableSubmit ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"}`}
          >
            {isEdit ? t("diary_modal_save") : t("diary_modal_add")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DELETE MODAL ──────────────────────────────────────────────────────────────
function DeleteModal({ count, onConfirm, onClose }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="px-6 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            {t("diary_delete_confirm_title")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("diary_delete_confirm_prefix")}{" "}
            <span className="font-medium text-gray-700">
              {count} {t("diary_delete_confirm_suffix")}
            </span>
            . {t("diary_delete_confirm_warning")}
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            {t("diary_delete_cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm text-white font-medium transition"
          >
            {t("diary_delete_confirm_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DIARY TABLE ───────────────────────────────────────────────────────────────
function DiaryTable({
  diary,
  diaries,
  seasonDiaryId,
  initialRows,
  onRowsChange,
}) {
  const { t } = useLanguage();
  const cols = flatCols(diary);
  const isBuyingSeedDiary = diary.id === "1";
  const isBuyingFertilizerDiary = diary.id === "2";
  const isUseFertilizerDiary = diary.id === "3";
  const isPackagingHandlingDiary = diary.id === "4";
  const isHarvestConsumptionDiary = diary.id === "5";
  const isIrrigationCostDiary = diary.id === "6";
  const isLaborCostsDiary = diary.id === "7";

  const {
    buyingSeeds,
    isBuyingSeedsLoading,
    isBuyingSeedCreating,
    isBuyingSeedUpdating,
    isBuyingSeedDeleting,
    getBuyingSeeds,
    createBuyingSeed,
    updateBuyingSeed,
    deleteBuyingSeed,
  } = useBuyingSeedStore();
  const {
    buyingFertilizers,
    isBuyingFertilizersLoading,
    isBuyingFertilizerCreating,
    isBuyingFertilizerUpdating,
    isBuyingFertilizerDeleting,
    getBuyingFertilizers,
    createBuyingFertilizer,
    updateBuyingFertilizer,
    deleteBuyingFertilizer,
  } = useBuyingFertilizerStore();
  const {
    useFertilizers,
    isUseFertilizersLoading,
    isUseFertilizerCreating,
    isUseFertilizerUpdating,
    isUseFertilizerDeleting,
    getUseFertilizers,
    createUseFertilizer,
    updateUseFertilizer,
    deleteUseFertilizer,
  } = useUseFertilizerStore();
  const {
    packagingHandlings,
    isPackagingHandlingsLoading,
    isPackagingHandlingCreating,
    isPackagingHandlingUpdating,
    isPackagingHandlingDeleting,
    getPackagingHandlings,
    createPackagingHandling,
    updatePackagingHandling,
    deletePackagingHandling,
  } = usePackagingHandlingStore();
  const {
    harvestConsumptions,
    isHarvestConsumptionsLoading,
    isHarvestConsumptionCreating,
    isHarvestConsumptionUpdating,
    isHarvestConsumptionDeleting,
    getHarvestConsumptions,
    createHarvestConsumption,
    updateHarvestConsumption,
    deleteHarvestConsumption,
  } = useHarvestConsumptionStore();
  const {
    irrigationCosts,
    isIrrigationCostsLoading,
    isIrrigationCostCreating,
    isIrrigationCostUpdating,
    isIrrigationCostDeleting,
    getIrrigationCosts,
    createIrrigationCost,
    updateIrrigationCost,
    deleteIrrigationCost,
  } = useIrrigationCostStore();
  const {
    laborCosts,
    isLaborCostsLoading,
    isLaborCostCreating,
    isLaborCostUpdating,
    isLaborCostDeleting,
    getLaborCosts,
    createLaborCost,
    updateLaborCost,
    deleteLaborCost,
  } = useLaborCostsStore();

  const [localRows, setLocalRows] = useState(
    initialRows ?? SEED_DATA[diary.id] ?? [],
  );
  const setRows = (updater) => {
    setLocalRows((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onRowsChange?.(next);
      return next;
    });
  };

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { toast, show: showToast } = useToast();

  useEffect(() => {
    if (!isBuyingSeedDiary || !seasonDiaryId) return;
    getBuyingSeeds({ seasonDiaryId, page: 1, limit: 200 });
  }, [isBuyingSeedDiary, seasonDiaryId, getBuyingSeeds]);
  useEffect(() => {
    if (!isBuyingFertilizerDiary || !seasonDiaryId) return;
    getBuyingFertilizers({ seasonDiaryId, page: 1, limit: 200 });
  }, [isBuyingFertilizerDiary, seasonDiaryId, getBuyingFertilizers]);
  useEffect(() => {
    if (!isUseFertilizerDiary || !seasonDiaryId) return;
    getUseFertilizers({ seasonDiaryId, page: 1, limit: 200 });
  }, [isUseFertilizerDiary, seasonDiaryId, getUseFertilizers]);
  useEffect(() => {
    if (!isPackagingHandlingDiary || !seasonDiaryId) return;
    getPackagingHandlings({ seasonDiaryId, page: 1, limit: 200 });
  }, [isPackagingHandlingDiary, seasonDiaryId, getPackagingHandlings]);
  useEffect(() => {
    if (!isHarvestConsumptionDiary || !seasonDiaryId) return;
    getHarvestConsumptions({ seasonDiaryId, page: 1, limit: 200 });
  }, [isHarvestConsumptionDiary, seasonDiaryId, getHarvestConsumptions]);
  useEffect(() => {
    if (!isIrrigationCostDiary || !seasonDiaryId) return;
    getIrrigationCosts({ seasonDiaryId, page: 1, limit: 200 });
  }, [isIrrigationCostDiary, seasonDiaryId, getIrrigationCosts]);
  useEffect(() => {
    if (!isLaborCostsDiary || !seasonDiaryId) return;
    getLaborCosts({ seasonDiaryId, page: 1, limit: 200 });
  }, [isLaborCostsDiary, seasonDiaryId, getLaborCosts]);

  const apiRows = useMemo(
    () => (buyingSeeds || []).map(normalizeBuyingSeed).filter((r) => r.id),
    [buyingSeeds],
  );
  const apiFertilizerRows = useMemo(
    () =>
      (buyingFertilizers || [])
        .map(normalizeBuyingFertilizer)
        .filter((r) => r.id),
    [buyingFertilizers],
  );
  const apiUseFertilizerRows = useMemo(
    () =>
      (useFertilizers || []).map(normalizeUseFertilizer).filter((r) => r.id),
    [useFertilizers],
  );
  const apiPackagingHandlingRows = useMemo(
    () =>
      (packagingHandlings || [])
        .map(normalizePackagingHandling)
        .filter((r) => r.id),
    [packagingHandlings],
  );
  const apiHarvestConsumptionRows = useMemo(
    () =>
      (harvestConsumptions || [])
        .map(normalizeHarvestConsumption)
        .filter((r) => r.id),
    [harvestConsumptions],
  );
  const apiIrrigationCostRows = useMemo(
    () =>
      (irrigationCosts || []).map(normalizeIrrigationCost).filter((r) => r.id),
    [irrigationCosts],
  );
  const apiLaborCostRows = useMemo(
    () => (laborCosts || []).map(normalizeLaborCost).filter((r) => r.id),
    [laborCosts],
  );

  const rows = isBuyingSeedDiary
    ? apiRows
    : isBuyingFertilizerDiary
      ? apiFertilizerRows
      : isUseFertilizerDiary
        ? apiUseFertilizerRows
        : isPackagingHandlingDiary
          ? apiPackagingHandlingRows
          : isHarvestConsumptionDiary
            ? apiHarvestConsumptionRows
            : isIrrigationCostDiary
              ? apiIrrigationCostRows
              : isLaborCostsDiary
                ? apiLaborCostRows
                : localRows;

  const isActionBusy =
    (isBuyingSeedDiary &&
      (isBuyingSeedCreating || isBuyingSeedUpdating || isBuyingSeedDeleting)) ||
    (isBuyingFertilizerDiary &&
      (isBuyingFertilizerCreating ||
        isBuyingFertilizerUpdating ||
        isBuyingFertilizerDeleting)) ||
    (isUseFertilizerDiary &&
      (isUseFertilizerCreating ||
        isUseFertilizerUpdating ||
        isUseFertilizerDeleting)) ||
    (isPackagingHandlingDiary &&
      (isPackagingHandlingCreating ||
        isPackagingHandlingUpdating ||
        isPackagingHandlingDeleting)) ||
    (isHarvestConsumptionDiary &&
      (isHarvestConsumptionCreating ||
        isHarvestConsumptionUpdating ||
        isHarvestConsumptionDeleting)) ||
    (isIrrigationCostDiary &&
      (isIrrigationCostCreating ||
        isIrrigationCostUpdating ||
        isIrrigationCostDeleting)) ||
    (isLaborCostsDiary &&
      (isLaborCostCreating || isLaborCostUpdating || isLaborCostDeleting)) ||
    isExportingPdf;

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      cols.some((c) =>
        String(r[c.key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [rows, search, cols]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected =
    paginated.length > 0 && paginated.every((r) => selected.has(r.id));

  const openCreate = () => {
    setEditRow(emptyRow(diary));
    setModal("create");
  };
  const openEdit = (row) => {
    setEditRow({ ...row });
    setModal("edit");
  };

  const formatCellForExport = (col, val) => {
    if (val === "" || val === null || val === undefined) return "-";

    if (col.type === "date") {
      try {
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return String(val);
        return d.toLocaleDateString("vi-VN");
      } catch {
        return String(val);
      }
    }

    if (col.type === "currency") {
      const n = Number(val);
      return Number.isNaN(n)
        ? String(val)
        : `${new Intl.NumberFormat("vi-VN").format(n)} VND`;
    }

    if (col.type === "select" && col.options) {
      const opt = col.options.find((o) => o.value === val);
      return opt?.label || String(val);
    }

    return String(val);
  };

  const handleExportPDF = async () => {
    if (!seasonDiaryId || isExportingPdf) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
      }
      return;
    }

    setIsExportingPdf(true);
    try {
      await Promise.all([
        getBuyingSeeds({ seasonDiaryId, page: 1, limit: 1000 }),
        getBuyingFertilizers({ seasonDiaryId, page: 1, limit: 1000 }),
        getUseFertilizers({ seasonDiaryId, page: 1, limit: 1000 }),
        getPackagingHandlings({ seasonDiaryId, page: 1, limit: 1000 }),
        getHarvestConsumptions({ seasonDiaryId, page: 1, limit: 1000 }),
        getIrrigationCosts({ seasonDiaryId, page: 1, limit: 1000 }),
        getLaborCosts({ seasonDiaryId, page: 1, limit: 1000 }),
      ]);

      const rowsByDiaryId = {
        1: (useBuyingSeedStore.getState().buyingSeeds || [])
          .map(normalizeBuyingSeed)
          .filter((r) => r.id),
        2: (useBuyingFertilizerStore.getState().buyingFertilizers || [])
          .map(normalizeBuyingFertilizer)
          .filter((r) => r.id),
        3: (useUseFertilizerStore.getState().useFertilizers || [])
          .map(normalizeUseFertilizer)
          .filter((r) => r.id),
        4: (usePackagingHandlingStore.getState().packagingHandlings || [])
          .map(normalizePackagingHandling)
          .filter((r) => r.id),
        5: (useHarvestConsumptionStore.getState().harvestConsumptions || [])
          .map(normalizeHarvestConsumption)
          .filter((r) => r.id),
        6: (useIrrigationCostStore.getState().irrigationCosts || [])
          .map(normalizeIrrigationCost)
          .filter((r) => r.id),
        7: (useLaborCostsStore.getState().laborCosts || [])
          .map(normalizeLaborCost)
          .filter((r) => r.id),
      };

      const exportDiaries = (diaries || []).filter((d) =>
        ["1", "2", "3", "4", "5", "6", "7"].includes(d.id),
      );

      if (exportDiaries.length === 0) {
        showToast("Khong tim thay cau hinh nhat ky de xuat PDF", "error");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      let pdfFontFamily = "helvetica";

      try {
        const pdfFontBase64 = await getPdfFontBase64();
        const pdfFontBoldBase64 = await getPdfFontBoldBase64();
        doc.addFileToVFS(PDF_FONT_FILE, pdfFontBase64);
        doc.addFileToVFS(PDF_FONT_BOLD_FILE, pdfFontBoldBase64);
        doc.addFont(PDF_FONT_FILE, PDF_FONT_FAMILY, "normal");
        doc.addFont(PDF_FONT_BOLD_FILE, PDF_FONT_FAMILY, "bold");
        pdfFontFamily = PDF_FONT_FAMILY;
      } catch {
        pdfFontFamily = "helvetica";
      }

      doc.setFont(pdfFontFamily, "normal");

      exportDiaries.forEach((d, idx) => {
        if (idx > 0) doc.addPage();

        const colsDef = flatCols(d);
        const tableHead = colsDef.map((c) =>
          String(c.label || "").replace(/\n/g, " "),
        );
        const tableRows = (rowsByDiaryId[d.id] || []).map((row) =>
          colsDef.map((c) => formatCellForExport(c, row[c.key])),
        );

        doc.setFontSize(14);
        doc.setFont(pdfFontFamily, "normal");
        doc.text(`Nhật ký ${d.id}: ${d.title}`, 40, 40);
        doc.setFontSize(10);
        doc.setFont(pdfFontFamily, "normal");
        doc.text(`Tổng số bản ghi: ${tableRows.length}`, 40, 58);

        autoTable(doc, {
          startY: 72,
          head: [tableHead],
          body: tableRows.length > 0 ? tableRows : [["Không có dữ liệu"]],
          styles: {
            font: pdfFontFamily,
            fontStyle: "normal",
            fontSize: 8,
            cellPadding: 4,
            overflow: "linebreak",
          },
          headStyles: {
            font: pdfFontFamily,
            fontStyle: "bold",
            fillColor: [5, 150, 105],
            textColor: 255,
          },
          theme: "grid",
          margin: { left: 20, right: 20 },
        });
      });

      const seasonDiaryStore = useSeasonDiaryStore.getState();
      let seasonDiaryDetail = seasonDiaryStore.seasonDiaryDetail;

      if (seasonDiaryDetail?._id !== seasonDiaryId) {
        seasonDiaryDetail =
          await seasonDiaryStore.getSeasonDiaryDetail(seasonDiaryId);
      }

      const rawGardenName =
        seasonDiaryDetail?.garden_name ||
        seasonDiaryDetail?.gardenName ||
        seasonDiaryDetail?.name ||
        "season-diary";
      const safeGardenName =
        sanitizeFileNamePart(rawGardenName) || "season-diary";
      const datePart = new Date().toISOString().slice(0, 10);

      doc.save(`${safeGardenName}-${datePart}.pdf`);
      showToast("Xuất PDF thành công");
    } catch {
      showToast("Xuất PDF thất bại", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSave = async (form) => {
    if (isBuyingSeedDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildBuyingSeedPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createBuyingSeed(payload);
        if (!created) return;
      } else {
        const updated = await updateBuyingSeed(editRow.id, payload);
        if (!updated) return;
      }
    } else if (isBuyingFertilizerDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildBuyingFertilizerPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createBuyingFertilizer(payload);
        if (!created) return;
      } else {
        const updated = await updateBuyingFertilizer(editRow.id, payload);
        if (!updated) return;
      }
    } else if (isUseFertilizerDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildUseFertilizerPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createUseFertilizer(payload);
        if (!created) return;
      } else {
        const updated = await updateUseFertilizer(editRow.id, payload);
        if (!updated) return;
      }
    } else if (isPackagingHandlingDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildPackagingHandlingPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createPackagingHandling(payload);
        if (!created) return;
      } else {
        const updated = await updatePackagingHandling(editRow.id, payload);
        if (!updated) return;
      }
    } else if (isHarvestConsumptionDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildHarvestConsumptionPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createHarvestConsumption(payload);
        if (!created) return;
      } else {
        const updated = await updateHarvestConsumption(editRow.id, payload);
        if (!updated) return;
      }
    } else if (isIrrigationCostDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildIrrigationCostPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createIrrigationCost(payload);
        if (!created) return;
      } else {
        const updated = await updateIrrigationCost(editRow.id, payload);
        if (!updated) return;
      }
    } else if (isLaborCostsDiary) {
      if (!seasonDiaryId) {
        showToast(t("diary_toast_missing_season"), "error");
        return;
      }
      const payload = buildLaborCostPayload(form, seasonDiaryId);
      if (modal === "create") {
        const created = await createLaborCost(payload);
        if (!created) return;
      } else {
        const updated = await updateLaborCost(editRow.id, payload);
        if (!updated) return;
      }
    } else if (modal === "create") {
      setRows((prev) => [{ ...form, id: genId() }, ...prev]);
      showToast(t("diary_toast_added"));
    } else {
      setRows((prev) =>
        prev.map((r) => (r.id === editRow.id ? { ...form, id: r.id } : r)),
      );
      showToast(t("diary_toast_updated"));
    }
    setModal(null);
    setPage(1);
  };

  const handleDelete = async (ids) => {
    if (isBuyingSeedDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deleteBuyingSeed(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else if (isBuyingFertilizerDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deleteBuyingFertilizer(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else if (isUseFertilizerDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deleteUseFertilizer(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else if (isPackagingHandlingDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deletePackagingHandling(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else if (isHarvestConsumptionDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deleteHarvestConsumption(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else if (isIrrigationCostDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deleteIrrigationCost(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else if (isLaborCostsDiary) {
      const results = await Promise.all(
        Array.from(ids).map((id) => deleteLaborCost(id)),
      );
      if (results.some((ok) => !ok)) return;
    } else {
      setRows((prev) => prev.filter((r) => !ids.has(r.id)));
    }
    setSelected(new Set());
    setDeleteConfirm(null);
    showToast(
      `${t("diary_toast_deleted_prefix")} ${ids.size} ${t("diary_toast_deleted_suffix")}`,
    );
  };

  const toggleRow = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => {
    if (allSelected)
      setSelected((prev) => {
        const n = new Set(prev);
        paginated.forEach((r) => n.delete(r.id));
        return n;
      });
    else
      setSelected((prev) => {
        const n = new Set(prev);
        paginated.forEach((r) => n.add(r.id));
        return n;
      });
  };

  const fmtVal = (col, val) => {
    if (val === "" || val === null || val === undefined)
      return <span className="text-gray-300">—</span>;
    if (col.type === "date") {
      try {
        return new Date(val).toLocaleDateString("vi-VN");
      } catch {
        return val;
      }
    }
    if (col.type === "currency") {
      const n = Number(val);
      if (isNaN(n)) return val;
      return (
        <span className="font-medium text-emerald-700">
          {new Intl.NumberFormat("vi-VN").format(n)} ₫
        </span>
      );
    }
    if (col.type === "select" && col.options) {
      const opt = col.options.find((o) => o.value === val);
      return opt ? (
        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
          {opt.label}
        </span>
      ) : (
        val
      );
    }
    return val;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("diary_search_placeholder")}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white placeholder:text-gray-400"
          />
        </div>
        {selected.size > 0 && (
          <button
            onClick={() => setDeleteConfirm(new Set(selected))}
            disabled={isActionBusy}
            className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-100 transition font-medium"
          >
            {t("diary_delete_selected")} {selected.size}{" "}
            {t("diary_delete_selected_suffix")}
          </button>
        )}
        {/* Create new record button */}
        <button
          onClick={openCreate}
          disabled={isActionBusy}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-emerald-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("diary_add_btn")}
        </button>
        {/* Export PDF file button */}
        <button
          onClick={handleExportPDF}
          disabled={isExportingPdf}
          className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-emerald-200 text-emerald-700 rounded-xl text-sm font-medium transition shadow-sm shadow-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {isExportingPdf ? "Đang xuất PDF..." : "Xuất PDF"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="text-xs border-collapse"
            style={{ minWidth: "max-content", width: "100%" }}
          >
            <thead>
              <tr>
                <th
                  className="border border-emerald-200 bg-emerald-700 text-white px-3 py-2 text-center"
                  rowSpan={2}
                  style={{ minWidth: 36 }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded border-emerald-300 text-emerald-600"
                  />
                </th>
                {diary.groups.map((group, gi) =>
                  group.label ? (
                    <th
                      key={gi}
                      className="border border-emerald-200 bg-emerald-600 text-white px-2 py-2 text-center font-semibold"
                      colSpan={group.cols.length}
                    >
                      {group.label}
                    </th>
                  ) : (
                    group.cols.map((col, ci) => (
                      <th
                        key={`${gi}-${ci}`}
                        className="border border-emerald-200 bg-emerald-700 text-white px-2 py-1 text-center font-medium leading-snug"
                        rowSpan={2}
                        style={{
                          minWidth:
                            parseInt((col.width || "w-28").replace("w-", "")) *
                            4,
                        }}
                      >
                        {col.label.split("\n").map((l, i) => (
                          <span key={i} className="block">
                            {l}
                          </span>
                        ))}
                      </th>
                    ))
                  ),
                )}
                <th
                  className="border border-emerald-200 bg-emerald-700 text-white px-3 py-2 text-center font-medium"
                  rowSpan={2}
                  style={{ minWidth: 80 }}
                >
                  {t("diary_action_col")}
                </th>
              </tr>
              <tr>
                {diary.groups
                  .filter((g) => g.label)
                  .flatMap((g) => g.cols)
                  .map((col, ci) => (
                    <th
                      key={ci}
                      className="border border-emerald-200 bg-emerald-500 text-white px-2 py-1.5 text-center font-medium leading-snug whitespace-nowrap"
                      style={{
                        minWidth:
                          parseInt((col.width || "w-28").replace("w-", "")) * 4,
                      }}
                    >
                      {col.label.split("\n").map((l, i) => (
                        <span key={i} className="block">
                          {l}
                        </span>
                      ))}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {(isBuyingSeedDiary && isBuyingSeedsLoading) ||
              (isBuyingFertilizerDiary && isBuyingFertilizersLoading) ||
              (isUseFertilizerDiary && isUseFertilizersLoading) ||
              (isPackagingHandlingDiary && isPackagingHandlingsLoading) ||
              (isHarvestConsumptionDiary && isHarvestConsumptionsLoading) ||
              (isIrrigationCostDiary && isIrrigationCostsLoading) ||
              (isLaborCostsDiary && isLaborCostsLoading) ? (
                <tr>
                  <td
                    colSpan={cols.length + 2}
                    className="text-center py-12 text-gray-400"
                  >
                    {t("diary_loading")}
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={cols.length + 2}
                    className="text-center py-14 text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-8 h-8 text-gray-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      {t("diary_empty")}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((row, ri) => (
                  <tr
                    key={row.id}
                    className={`transition border-b border-gray-50 ${selected.has(row.id) ? "bg-emerald-50" : ri % 2 === 0 ? "bg-white hover:bg-gray-50/60" : "bg-gray-50/40 hover:bg-gray-50"}`}
                  >
                    <td className="border border-gray-100 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    {cols.map((col) => (
                      <td
                        key={col.key}
                        className="border border-gray-100 px-2.5 py-2.5 text-gray-700 whitespace-nowrap"
                      >
                        {fmtVal(col, row[col.key])}
                      </td>
                    ))}
                    <td className="border border-gray-100 px-2 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                          title={t("diary_edit_btn_title")}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(new Set([row.id]))}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title={t("diary_delete_btn_title")}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            {filtered.length > 0
              ? `${Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–${Math.min(page * PAGE_SIZE, filtered.length)} ${t("diary_pagination_of")} ${filtered.length} ${t("diary_pagination_records")}`
              : `0 ${t("diary_pagination_records")}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-lg font-medium transition ${p === page ? "bg-emerald-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-100"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <RecordModal
          diary={diary}
          row={editRow}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteConfirm && (
        <DeleteModal
          count={deleteConfirm.size}
          onConfirm={() => handleDelete(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-600"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                toast.type === "error"
                  ? "M6 18L18 6M6 6l12 12"
                  : "M5 13l4 4L19 7"
              }
            />
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const { t } = useLanguage();
  const { seasonDiaryId } = useParams();
  const [activeIdx, setActiveIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const DIARIES = useMemo(
    () => [
      {
        id: "1",
        required: true,
        title: t("diary_1_4_title"),
        icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
        groups: [
          {
            label: null,
            cols: [
              {
                key: "purchase_date",
                label: t("diary_col_purchase_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "seed_name",
                label: t("diary_col_seed_name"),
                type: "text",
                width: "w-44",
              },
              {
                key: "quantity",
                label: t("diary_col_quantity"),
                type: "number",
                width: "w-24",
              },
              {
                key: "total_price",
                label: t("diary_col_total_price"),
                type: "currency",
                width: "w-36",
              },
            ],
          },
          {
            label: t("diary_group_supplier"),
            cols: [
              {
                key: "supplier_name",
                label: t("diary_col_supplier_name"),
                type: "text",
                width: "w-40",
              },
              {
                key: "supplier_address",
                label: t("diary_col_supplier_address"),
                type: "text",
                width: "w-44",
              },
            ],
          },
        ],
      },
      {
        id: "2",
        required: true,
        title: t("diary_1_5_title"),
        icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
        groups: [
          {
            label: null,
            cols: [
              {
                key: "purchase_date",
                label: t("diary_col_purchase_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "material_name",
                label: t("diary_col_material_name"),
                type: "text",
                width: "w-44",
              },
              {
                key: "quantity",
                label: t("diary_col_quantity_plain"),
                type: "number",
                width: "w-24",
              },
              {
                key: "unit",
                label: t("diary_col_unit"),
                type: "text",
                width: "w-20",
              },
              {
                key: "total_price",
                label: t("diary_col_total_price"),
                type: "currency",
                width: "w-36",
              },
            ],
          },
          {
            label: t("diary_group_supplier"),
            cols: [
              {
                key: "supplier_name",
                label: t("diary_col_supplier_name"),
                type: "text",
                width: "w-40",
              },
              {
                key: "supplier_address",
                label: t("diary_col_supplier_address"),
                type: "text",
                width: "w-48",
              },
            ],
          },
        ],
      },
      {
        id: "3",
        required: false,
        title: t("diary_1_6_title"),
        icon: "M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1v1a1 1 0 002 0v-1h6v1a1 1 0 002 0v-1h1a1 1 0 001-1V5a1 1 0 00-1-1H3zm2 3h10v2H5V7zm0 4h4v2H5v-2zm7 0h3v2h-3v-2z",
        groups: [
          {
            label: null,
            cols: [
              {
                key: "usage_date",
                label: t("diary_col_usage_date"),
                type: "date",
                width: "w-28",
                required: true,
              },
            ],
          },
          {
            label: t("diary_group_fertilizer"),
            cols: [
              {
                key: "fertilizer_name",
                label: t("diary_col_fertilizer_name"),
                type: "text",
                width: "w-44",
              },
              {
                key: "fertilizer_amount",
                label: t("diary_col_fertilizer_amount"),
                type: "text",
                width: "w-32",
              },
            ],
          },
          {
            label: t("diary_group_pesticide"),
            cols: [
              {
                key: "pesticide_name",
                label: t("diary_col_pesticide_name"),
                type: "text",
                width: "w-40",
              },
              {
                key: "pesticide_concentration_amount",
                label: t("diary_col_pesticide_concentration"),
                type: "text",
                width: "w-40",
              },
              {
                key: "preharvest_interval",
                label: t("diary_col_preharvest_interval"),
                type: "text",
                width: "w-28",
              },
            ],
          },
        ],
      },
      {
        id: "4",
        required: true,
        title: t("diary_1_7_title"),
        icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
        groups: [
          {
            label: null,
            cols: [
              {
                key: "handling_date",
                label: t("diary_col_handling_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "packaging_type",
                label: t("diary_col_packaging_type"),
                type: "text",
                width: "w-48",
              },
              {
                key: "storage_location",
                label: t("diary_col_storage_location"),
                type: "text",
                width: "w-40",
              },
              {
                key: "treatment_method",
                label: t("diary_col_treatment_method"),
                type: "text",
                width: "w-44",
              },
            ],
          },
        ],
      },
      {
        id: "5",
        title: t("diary_1_8_title"),
        icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
        groups: [
          {
            label: t("diary_group_harvest"),
            cols: [
              {
                key: "harvest_date",
                required: true,
                label: t("diary_col_harvest_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "harvest_quantity_kg",
                required: true,
                label: t("diary_col_harvest_quantity"),
                type: "number",
                width: "w-32",
              },
            ],
          },
          {
            label: t("diary_group_consumption"),
            cols: [
              {
                key: "sale_date",
                label: t("diary_col_sale_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "buyer_or_consumption_address",
                label: t("diary_col_buyer_address"),
                type: "text",
                width: "w-52",
              },
              {
                key: "consumed_weight_kg",
                label: t("diary_col_consumed_weight"),
                type: "number",
                width: "w-32",
              },
              {
                key: "sale_unit_price_vnd",
                label: t("diary_col_sale_unit_price"),
                type: "currency",
                width: "w-36",
              },
            ],
          },
        ],
      },
      {
        id: "6",
        required: true,
        title: t("diary_1_9_title"),
        icon: "M12 3v1m0 16v1m8.66-13l-.87.5M4.21 8.5l-.87-.5M19.78 15.5l-.87-.5M4.21 15.5l-.87.5M21 12h-1M4 12H3m15.36-6.36l-.7.7M6.34 17.66l-.7.7M17.66 17.66l.7.7M6.34 6.34l.7.7",
        groups: [
          {
            label: null,
            cols: [
              {
                key: "execution_date",
                label: t("diary_col_execution_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "irrigation_item",
                label: t("diary_col_irrigation_item"),
                type: "text",
                width: "w-48",
              },
              {
                key: "irrigation_method",
                label: t("diary_col_irrigation_method"),
                type: "select",
                options: [
                  { value: "nho_giot", label: t("diary_irrigation_nho_giot") },
                  { value: "phun_mua", label: t("diary_irrigation_phun_mua") },
                  { value: "thu_cong", label: t("diary_irrigation_thu_cong") },
                ],
                width: "w-28",
              },
              {
                key: "irrigation_duration_hours",
                label: t("diary_col_irrigation_hours"),
                type: "number",
                width: "w-24",
              },
              {
                key: "irrigation_duration_minutes",
                label: t("diary_col_irrigation_minutes"),
                type: "number",
                width: "w-24",
              },
              {
                key: "irrigation_area",
                label: t("diary_col_irrigation_area"),
                type: "text",
                width: "w-28",
              },
              {
                key: "electricity_fuel_cost",
                label: t("diary_col_electricity_cost"),
                type: "currency",
                width: "w-36",
              },
              {
                key: "performed_by",
                label: t("diary_col_performed_by"),
                type: "text",
                width: "w-36",
              },
            ],
          },
        ],
      },
      {
        id: "7",
        required: true,
        title: t("diary_1_10_title"),
        icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
        groups: [
          {
            label: null,
            cols: [
              {
                key: "labor_hire_date",
                label: t("diary_col_labor_date"),
                type: "date",
                width: "w-28",
              },
              {
                key: "work_description",
                label: t("diary_col_work_description"),
                type: "text",
                width: "w-48",
              },
              {
                key: "worker_quantity",
                label: t("diary_col_worker_quantity"),
                type: "number",
                width: "w-24",
              },
              {
                key: "working_time_hours",
                label: t("diary_col_working_hours"),
                type: "number",
                width: "w-24",
              },
              {
                key: "working_time_minutes",
                label: t("diary_col_working_minutes"),
                type: "number",
                width: "w-24",
              },
              {
                key: "total_price_vnd",
                label: t("diary_col_total_price_vnd"),
                type: "currency",
                width: "w-36",
              },
              {
                key: "worker_or_team_name",
                label: t("diary_col_worker_name"),
                type: "text",
                width: "w-40",
              },
              {
                key: "supervisor_name",
                label: t("diary_col_supervisor"),
                type: "text",
                width: "w-32",
              },
            ],
          },
        ],
      },
    ],
    [t],
  );

  const diary = DIARIES[activeIdx];

  return (
    <div
      className="space-y-4 min-h-screen p-5"
      onClick={() => setDropdownOpen(false)}
    >
      {/* Dropdown header */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 group"
        >
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex-shrink-0">
            {t("diary_label")} {diary.id}
          </span>
          <h1 className="text-base font-semibold text-gray-800">
            {diary.title}
          </h1>
          <svg
            className={`w-4 h-4 text-emerald-500 flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 py-1.5 z-30 overflow-hidden">
            {DIARIES.map((d, i) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveIdx(i);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition hover:bg-emerald-50 ${i === activeIdx ? "bg-emerald-50" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${i === activeIdx ? "bg-emerald-600" : "bg-gray-100"}`}
                >
                  <svg
                    className={`w-4 h-4 ${i === activeIdx ? "text-white" : "text-gray-500"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d={d.icon}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 ${i === activeIdx ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    {t("diary_label")} {d.id}
                  </p>
                  <p
                    className={`text-xs leading-snug ${i === activeIdx ? "text-emerald-800 font-medium" : "text-gray-600"}`}
                  >
                    {d.title}
                  </p>
                </div>
                {i === activeIdx && (
                  <svg
                    className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-auto mt-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table — re-mounts on switch to reset state */}
      <DiaryTable
        key={diary.id}
        diary={diary}
        diaries={DIARIES}
        seasonDiaryId={seasonDiaryId}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  X,
  BookOpen,
  Check,
  Loader2,
  Users,
  Hash,
  Rows3,
  Sprout,
  Layers,
} from "lucide-react";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useTypeProductStore } from "@/store/useTypeProduct";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import ImageSelect from "@/components/ImageSelect";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false },
);

const INITIAL_FORM = {
  garden_name: "",
  image: "",
  farmer_name: "",
  location: "",
  latitude: "",
  longitude: "",
  members: "",
  planting_area_code: "",
  crop_variety: [],
  farmer_code: "",
  row_bed_count: "",
  area: "",
  land_use_history: "",
};

// ── Mã tỉnh/thành viết tắt 2 ký tự ─────────────────────────────────────────
const PROVINCE_CODES = new Set([
  "AG",
  "BL",
  "BK",
  "BG",
  "BN",
  "BR",
  "BD",
  "BP",
  "BT",
  "CM",
  "CT",
  "CB",
  "DN",
  "DL",
  "DK",
  "DB",
  "DT",
  "GL",
  "HG",
  "HN",
  "HA",
  "HT",
  "HD",
  "HP",
  "HB",
  "HU",
  "HY",
  "KH",
  "KG",
  "KT",
  "LC",
  "LD",
  "LS",
  "LA",
  "ND",
  "NA",
  "NB",
  "NT",
  "PT",
  "PY",
  "QB",
  "QN",
  "QG",
  "QT",
  "ST",
  "SL",
  "TN",
  "TB",
  "TH",
  "TT",
  "TG",
  "TV",
  "TQ",
  "VL",
  "VP",
  "YB",
  "SG",
]);

// ── Label + optional hint ────────────────────────────────────────────────────
const FieldLabel = ({ htmlFor, children, hint, required }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-semibold text-gray-900 mb-1.5"
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
    {hint && (
      <span className="text-gray-400 font-normal ml-1.5 text-xs">({hint})</span>
    )}
  </label>
);

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-emerald-600" />
      </div>
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="px-6 py-5 space-y-5">{children}</div>
  </div>
);

// ── Input ────────────────────────────────────────────────────────────────────
const Input = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  suffix,
  onKeyDown,
}) => (
  <div className="relative">
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      min={min}
      step={step}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm ${suffix ? "pr-12" : ""}`}
    />
    {suffix && (
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
        {suffix}
      </span>
    )}
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CreateSeasonDiary() {
  const router = useRouter();
  const { t } = useLanguage();

  const { createSeasonDiary, isSeasonDiaryCreating } = useSeasonDiaryStore();
  const { types, fetchTypes, isTypesLoading } = useTypeProductStore();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedVariety, setSelectedVariety] = useState("");
  const [memberInput, setMemberInput] = useState("");

  const cropVarieties = Array.from(
    new Set(
      (types || [])
        .map((type) => type?.name?.trim())
        .filter((name) => typeof name === "string" && name.length > 0),
    ),
  );

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const normalizePlantingAreaCode = (code) =>
    String(code || "")
      .toUpperCase()
      .replace(/\s+/g, "");

  // VN-XXOR-YYYY  →  XX ∈ PROVINCE_CODES, YYYY = 0001..5999
  const validatePlantingAreaCode = (code) => {
    const normalizedCode = normalizePlantingAreaCode(code);
    if (!normalizedCode) return null;
    const match = normalizedCode.match(/^VN-([A-Z]{2})OR-([0-5]\d{3})$/);
    if (!match) return t("create_code_err_format");
    const [, province, num] = match;
    if (!PROVINCE_CODES.has(province))
      return t("create_code_err_province").replace("%s", province);
    if (num === "0000") return t("create_code_err_zero");
    return null; // hợp lệ
  };

  const plantingAreaCodeError = validatePlantingAreaCode(
    formData.planting_area_code,
  );

  // ── Derived ──────────────────────────────────────────────────────────────
  const isCreateDisabled =
    isSeasonDiaryCreating ||
    !formData.garden_name.trim() ||
    !formData.image.trim() ||
    !formData.farmer_name.trim() ||
    !formData.location.trim() ||
    !formData.latitude ||
    !formData.longitude ||
    !!plantingAreaCodeError ||
    formData.crop_variety.length === 0 ||
    !formData.row_bed_count.toString().trim() ||
    !formData.area.toString().trim() ||
    !formData.land_use_history.trim();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePickLocation = (latitude, longitude, placeDetails) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      location: placeDetails?.locationText || prev.location,
    }));
  };

  const handleAddMember = () => {
    const val = memberInput.trim();
    if (!val) return;
    const current = formData.members
      ? formData.members
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
      : [];
    if (current.includes(val)) {
      toast.error(t("create_member_duplicate"));
      return;
    }
    const next = [...current, val].join(", ");
    setFormData((prev) => ({ ...prev, members: next }));
    setMemberInput("");
  };

  const handleRemoveMember = (name) => {
    const current = formData.members
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m && m !== name);
    setFormData((prev) => ({ ...prev, members: current.join(", ") }));
  };

  const handleAddVariety = (e) => {
    const val = e.target.value;
    setSelectedVariety(val);
    if (!val) return;

    if (formData.crop_variety.includes(val)) {
      toast.error(t("create_variety_duplicate"));
      setSelectedVariety("");
      return;
    }
    if (formData.crop_variety.length >= 5) {
      toast.error(t("create_variety_max_toast"));
      setSelectedVariety("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      crop_variety: [...prev.crop_variety, val],
    }));
    setSelectedVariety("");
  };

  const handleRemoveVariety = (name) => {
    setFormData((prev) => ({
      ...prev,
      crop_variety: prev.crop_variety.filter((v) => v !== name),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      planting_area_code: normalizePlantingAreaCode(
        formData.planting_area_code,
      ),
      row_bed_count: Number(formData.row_bed_count),
      area: Number(formData.area),
    };

    // TODO: thay bằng Zustand action
    await createSeasonDiary(payload);
    console.log("Payload:", payload);
    toast.success(t("create_success"));
    router.push("/profile/season-diaries");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {t("create_season_title")}
              </h1>
              <p className="text-gray-500 text-sm">
                {t("create_season_subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Section 1: Thông tin cơ bản ── */}
          <Section title={t("create_section_basic")} icon={BookOpen}>
            {/* Garden name */}
            <div>
              <FieldLabel htmlFor="garden_name" required>
                {t("create_garden_name")}
              </FieldLabel>
              <Input
                id="garden_name"
                name="garden_name"
                value={formData.garden_name}
                onChange={handleChange}
                placeholder={t("create_garden_name_placeholder")}
              />
            </div>

            {/* Season image */}
            <div>
              <ImageSelect
                label="Ảnh"
                required
                hint=""
                value={formData.image}
                onChange={(image) =>
                  setFormData((prev) => ({ ...prev, image }))
                }
              />
            </div>

            {/* Farmer name + Farmer code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="farmer_name" required>
                  {t("create_farmer_name")}
                </FieldLabel>
                <Input
                  id="farmer_name"
                  name="farmer_name"
                  value={formData.farmer_name}
                  onChange={handleChange}
                  placeholder={t("create_farmer_name_placeholder")}
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="farmer_code"
                  hint={t("create_farmer_code_hint")}
                >
                  {t("create_farmer_code")}
                </FieldLabel>
                <Input
                  id="farmer_code"
                  name="farmer_code"
                  value={formData.farmer_code}
                  onChange={handleChange}
                  placeholder={t("create_farmer_code_placeholder")}
                />
              </div>
            </div>

            {/* Planting area code */}
            <div>
              <FieldLabel
                htmlFor="planting_area_code"
                hint={t("create_planting_code_hint")}
              >
                {t("create_planting_code")}
              </FieldLabel>
              <input
                id="planting_area_code"
                name="planting_area_code"
                value={formData.planting_area_code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    planting_area_code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder={t("create_planting_code_placeholder")}
                maxLength={13}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-colors text-sm
      ${
        plantingAreaCodeError && formData.planting_area_code
          ? "border-red-400 focus:ring-red-400 focus:border-red-400"
          : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
      }`}
              />
              {/* hint luôn hiện */}
              <p className="text-xs text-gray-400 mt-1">
                {t("create_planting_code_format")}{" "}
                <span>{t("create_planting_code_format_desc")}</span>
                &nbsp;·&nbsp;{t("create_planting_code_example")}{" "}
                <span>{t("create_planting_code_example_val")}</span>
              </p>
              {/* error chỉ hiện khi có giá trị */}
              {plantingAreaCodeError && formData.planting_area_code && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {plantingAreaCodeError}
                </p>
              )}
              {/* success */}
              {!plantingAreaCodeError && formData.planting_area_code && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {t("create_planting_code_valid")}
                </p>
              )}
            </div>

            {/* Members */}
            <div>
              <FieldLabel htmlFor="member_input">
                {t("create_members")}
              </FieldLabel>
              <div className="flex gap-2">
                <input
                  id="member_input"
                  type="text"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder={t("create_members_placeholder")}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5" />
                  {t("create_members_add")}
                </button>
              </div>
              {formData.members.trim() && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.members
                    .split(",")
                    .map((m) => m.trim())
                    .filter(Boolean)
                    .map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium"
                      >
                        <Users className="w-3 h-3" />
                        {m}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m)}
                          className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </Section>

          {/* ── Section 2: Canh tác ── */}
          <Section title={t("create_section_farming")} icon={Sprout}>
            {/* Crop variety */}
            <div>
              <FieldLabel required>{t("create_variety")}</FieldLabel>
              <select
                value={selectedVariety}
                onChange={handleAddVariety}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              >
                <option value="">
                  {isTypesLoading
                    ? t("create_variety_loading")
                    : formData.crop_variety.length >= 5
                      ? t("create_variety_max")
                      : cropVarieties.length === 0
                        ? t("create_variety_empty")
                        : t("create_variety_placeholder")}
                </option>
                {cropVarieties
                  .filter((v) => !formData.crop_variety.includes(v))
                  .map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
              </select>
              {formData.crop_variety.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.crop_variety.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
                    >
                      <Sprout className="w-3 h-3" />
                      {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariety(v)}
                        className="ml-0.5 hover:bg-emerald-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Area + Row bed count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="area" required>
                  {t("create_area")}
                </FieldLabel>
                <Input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min="1"
                  step="any"
                  onWheel={(e) => e.target.blur()}
                  placeholder={t("create_area_placeholder")}
                  suffix={t("create_area_unit")}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
                {formData.area && (
                  <p className="text-xs text-gray-400 mt-1">
                    ≈ {(parseFloat(formData.area) / 10000).toFixed(4)} ha
                  </p>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="row_bed_count" required>
                  {t("create_rowbed")}
                </FieldLabel>
                <Input
                  type="number"
                  id="row_bed_count"
                  name="row_bed_count"
                  value={formData.row_bed_count}
                  onChange={handleChange}
                  min="1"
                  step="any"
                  onWheel={(e) => e.target.blur()}
                  placeholder={t("create_area_placeholder")}
                  suffix={t("create_rowbed_unit")}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") e.preventDefault();
                  }}
                />
              </div>
            </div>

            {/* Land use history */}
            <div>
              <FieldLabel htmlFor="land_use_history" required>
                {t("create_land_history")}
              </FieldLabel>
              <textarea
                id="land_use_history"
                name="land_use_history"
                value={formData.land_use_history}
                onChange={handleChange}
                rows={3}
                placeholder={t("create_land_history_placeholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-sm"
              />
            </div>
          </Section>

          {/* ── Section 3: Vị trí ── */}
          <Section title={t("create_section_location")} icon={Layers}>
            <p className="text-xs text-gray-500 -mt-2">
              {t("create_map_hint")}
            </p>

            <LocationPickerMap
              latitude={
                formData.latitude ? Number(formData.latitude) : undefined
              }
              longitude={
                formData.longitude ? Number(formData.longitude) : undefined
              }
              onPick={handlePickLocation}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                <span className="text-gray-500">{t("create_lat")} </span>
                <span className="font-medium text-gray-900">
                  {formData.latitude || t("create_not_selected")}
                </span>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                <span className="text-gray-500">{t("create_lng")} </span>
                <span className="font-medium text-gray-900">
                  {formData.longitude || t("create_not_selected")}
                </span>
              </div>
            </div>

            <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
              <span className="text-gray-500">{t("create_address")} </span>
              <span className="font-medium text-gray-900">
                {formData.location || t("create_not_selected_map")}
              </span>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div className="flex items-center gap-4 pb-8">
            <button
              type="submit"
              disabled={isCreateDisabled}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {isSeasonDiaryCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("create_submitting")}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t("create_submit")}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/season-diaries")}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium text-sm transition-colors border border-gray-300"
            >
              <X className="w-4 h-4" />
              {t("create_cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

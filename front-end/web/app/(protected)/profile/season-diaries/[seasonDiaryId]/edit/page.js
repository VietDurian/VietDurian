"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  X,
  BookOpen,
  Check,
  Loader2,
  Users,
  Sprout,
  Layers,
} from "lucide-react";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false },
);

// ── Sample crop varieties (thay bằng API types nếu cần) ──────────────────────
const CROP_VARIETIES = [
  "Ri6",
  "Monthong",
  "Musang King",
  "Dona",
  "Black Thorn",
];

const INITIAL_FORM = {
  garden_name: "",
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

// ── Label + optional hint ────────────────────────────────────────────────────
const FieldLabel = ({ htmlFor, children, hint, required }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-900 mb-1.5"
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
export default function EditSeasonDiary() {
  const router = useRouter();
  const { seasonDiaryId } = useParams();

  const {
    seasonDiaryDetail,
    getSeasonDiaryDetail,
    isSeasonDiaryDetailLoading,
    updateSeasonDiary,
    isSeasonDiaryUpdating,
  } = useSeasonDiaryStore();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [selectedVariety, setSelectedVariety] = useState("");
  const [memberInput, setMemberInput] = useState("");

  useEffect(() => {
    if (!seasonDiaryId) return;
    getSeasonDiaryDetail(seasonDiaryId);
  }, [seasonDiaryId, getSeasonDiaryDetail]);

  useEffect(() => {
    if (!seasonDiaryDetail?._id) return;

    const members = Array.isArray(seasonDiaryDetail.members)
      ? seasonDiaryDetail.members.join(", ")
      : seasonDiaryDetail.members || "";

    setFormData({
      garden_name: seasonDiaryDetail.garden_name || "",
      farmer_name: seasonDiaryDetail.farmer_name || "",
      location: seasonDiaryDetail.location || "",
      latitude: seasonDiaryDetail.latitude
        ? String(seasonDiaryDetail.latitude)
        : "",
      longitude: seasonDiaryDetail.longitude
        ? String(seasonDiaryDetail.longitude)
        : "",
      members,
      planting_area_code: seasonDiaryDetail.planting_area_code || "",
      crop_variety: Array.isArray(seasonDiaryDetail.crop_variety)
        ? seasonDiaryDetail.crop_variety
        : [],
      farmer_code: seasonDiaryDetail.farmer_code || "",
      row_bed_count: seasonDiaryDetail.row_bed_count
        ? String(seasonDiaryDetail.row_bed_count)
        : "",
      area: seasonDiaryDetail.area ? String(seasonDiaryDetail.area) : "",
      land_use_history: seasonDiaryDetail.land_use_history || "",
    });
  }, [seasonDiaryDetail]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const isSubmitDisabled =
    isSeasonDiaryUpdating ||
    isSeasonDiaryDetailLoading ||
    !formData.garden_name.trim() ||
    !formData.farmer_name.trim() ||
    !formData.location.trim() ||
    !formData.latitude ||
    !formData.longitude ||
    !formData.planting_area_code.trim() ||
    !formData.farmer_code.trim() ||
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
      toast.error("Thành viên này đã được thêm");
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
      toast.error("Giống cây này đã được chọn");
      setSelectedVariety("");
      return;
    }
    if (formData.crop_variety.length >= 5) {
      toast.error("Chỉ được chọn tối đa 5 giống cây");
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

    if (!seasonDiaryId) return;

    const payload = {
      ...formData,
      row_bed_count: Number(formData.row_bed_count),
      area: Number(formData.area),
    };

    const updated = await updateSeasonDiary(seasonDiaryId, payload);
    if (updated) {
      router.push(`/profile/season-diaries/${seasonDiaryId}`);
    }
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
                Chỉnh sửa vườn
              </h1>
              <p className="text-gray-500 text-sm">
                Cập nhật thông tin canh tác cho mùa vụ sầu riêng của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Section 1: Thông tin cơ bản ── */}
          <Section title="Thông tin cơ bản" icon={BookOpen}>
            {/* Garden name */}
            <div>
              <FieldLabel htmlFor="garden_name" required>
                Tên vườn
              </FieldLabel>
              <Input
                id="garden_name"
                name="garden_name"
                value={formData.garden_name}
                onChange={handleChange}
                placeholder="ví dụ: Vườn Musang King Phụng Hiệp"
              />
            </div>

            {/* Farmer name + Farmer code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="farmer_name" required>
                  Tên nông hộ
                </FieldLabel>
                <Input
                  id="farmer_name"
                  name="farmer_name"
                  value={formData.farmer_name}
                  onChange={handleChange}
                  placeholder="ví dụ: Nguyễn Văn A"
                />
              </div>
              <div>
                <FieldLabel
                  htmlFor="farmer_code"
                  required
                  hint="mã hộ nông dân"
                >
                  Mã số nông hộ
                </FieldLabel>
                <Input
                  id="farmer_code"
                  name="farmer_code"
                  value={formData.farmer_code}
                  onChange={handleChange}
                  placeholder="ví dụ: HH-CT-2025-001"
                />
              </div>
            </div>

            {/* Planting area code */}
            <div>
              <FieldLabel
                htmlFor="planting_area_code"
                required
                hint="mã vùng trồng"
              >
                Mã số vùng trồng
              </FieldLabel>
              <Input
                id="planting_area_code"
                name="planting_area_code"
                value={formData.planting_area_code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    planting_area_code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="ví dụ: VT-HG-009"
              />
            </div>

            {/* Members */}
            <div>
              <FieldLabel htmlFor="member_input">Thành viên</FieldLabel>
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
                  placeholder="ví dụ: Nguyễn Văn A"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5" />+ Thêm
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
          <Section title="Thông tin canh tác" icon={Sprout}>
            {/* Crop variety */}
            <div>
              <FieldLabel required>Tên giống cây trồng</FieldLabel>
              <select
                value={selectedVariety}
                onChange={handleAddVariety}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              >
                <option value="">
                  {formData.crop_variety.length >= 5
                    ? "Đã chọn tối đa 5 giống"
                    : "Chọn giống cây..."}
                </option>
                {CROP_VARIETIES.filter(
                  (v) => !formData.crop_variety.includes(v),
                ).map((v) => (
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
                  Diện tích
                </FieldLabel>
                <Input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  min="1"
                  step="any"
                  placeholder="0"
                  suffix="m²"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "0")
                      e.preventDefault();
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
                  Số hàng / luống / liếp cây trông vườn
                </FieldLabel>
                <Input
                  type="number"
                  id="row_bed_count"
                  name="row_bed_count"
                  value={formData.row_bed_count}
                  onChange={handleChange}
                  min="1"
                  placeholder="0"
                  suffix="luống"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "0")
                      e.preventDefault();
                  }}
                />
              </div>
            </div>

            {/* Land use history */}
            <div>
              <FieldLabel htmlFor="land_use_history" required>
                Lịch sử khu đất canh tác
              </FieldLabel>
              <textarea
                id="land_use_history"
                name="land_use_history"
                value={formData.land_use_history}
                onChange={handleChange}
                rows={3}
                placeholder="ví dụ: Đất lúa chuyển đổi sang cây ăn trái từ 2021..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none text-sm"
              />
            </div>
          </Section>

          {/* ── Section 3: Vị trí ── */}
          <Section title="Địa chỉ" icon={Layers}>
            <p className="text-xs text-gray-500 -mt-2">
              Nhấp vào bản đồ để chọn vị trí — hệ thống tự lấy Quận/Huyện,
              Tỉnh/Thành
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
                <span className="text-gray-500">Vĩ độ: </span>
                <span className="font-medium text-gray-900">
                  {formData.latitude || "Chưa chọn"}
                </span>
              </div>
              <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                <span className="text-gray-500">Kinh độ: </span>
                <span className="font-medium text-gray-900">
                  {formData.longitude || "Chưa chọn"}
                </span>
              </div>
            </div>

            <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
              <span className="text-gray-500">Địa chỉ: </span>
              <span className="font-medium text-gray-900">
                {formData.location || "Chưa chọn trên bản đồ"}
              </span>
            </div>
          </Section>

          {/* ── Actions ── */}
          <div className="flex items-center gap-4 pb-8">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {isSeasonDiaryUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Cập nhật nhật ký
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(`/profile/season-diaries/${seasonDiaryId}`)
              }
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium text-sm transition-colors border border-gray-300"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

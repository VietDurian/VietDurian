"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, X, Sprout, Check, ImageIcon, Loader2 } from "lucide-react";
import { useGardenStore } from "@/store/useGardenStore";
import { useTypeProductStore } from "@/store/useTypeProduct";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
  },
);

export default function EditGarden() {
  const router = useRouter();
  const params = useParams();
  const gardenId = params.id;
  const { types, fetchTypes, isTypesLoading } = useTypeProductStore();

  const {
    getGardenDetails,
    editGarden,
    gardenDetail,
    isGardenDetailsLoading,
    isGardenEditing,
  } = useGardenStore();
  const [formData, setFormData] = useState({
    name: "",
    unit_code: "",
    crop_type: [],
    area: "",
    location: "",
    latitude: "",
    longitude: "",
    description: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [imageData, setImageData] = useState("");
  const [selectedCropType, setSelectedCropType] = useState("");

  const isSaveDisabled =
    isGardenEditing ||
    !formData.name.toString().trim() ||
    !formData.unit_code.toString().trim() ||
    !Array.isArray(formData.crop_type) ||
    formData.crop_type.length === 0 ||
    !formData.area.toString().trim() ||
    !formData.location.toString().trim() ||
    !formData.latitude.toString().trim() ||
    !formData.longitude.toString().trim() ||
    !formData.description.toString().trim() ||
    !formData.image;

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // 🔽 Load garden data
  useEffect(() => {
    if (gardenId) getGardenDetails(gardenId);
  }, [gardenId, getGardenDetails]);

  // 🔽 Fill form when data arrives
  useEffect(() => {
    if (!gardenDetail?._id) return;

    setFormData((prev) => ({
      ...prev,
      name: gardenDetail.name || "",
      unit_code: gardenDetail.unit_code || "",
      crop_type: Array.isArray(gardenDetail.crop_type)
        ? gardenDetail.crop_type
        : gardenDetail.crop_type
          ? [gardenDetail.crop_type]
          : [],
      area: gardenDetail.area || "",
      location: gardenDetail.location || "",
      latitude: gardenDetail.latitude || "",
      longitude: gardenDetail.longitude || "",
      description: gardenDetail.description || "",
      image: gardenDetail.image || "",
    }));

    setImagePreview(gardenDetail.image || "");
  }, [gardenDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await editGarden(gardenId, formData);
    router.push(`/profile/gardens/${gardenId}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePickLocation = (latitude, longitude, placeDetails) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      location: placeDetails?.locationText || prev.location,
    }));
  };

  const handleCropTypeChange = (e) => {
    const nextType = e.target.value;
    setSelectedCropType(nextType);

    if (!nextType) return;

    if (formData.crop_type.includes(nextType)) {
      setSelectedCropType("");
      return;
    }

    if (formData.crop_type.length >= 3) {
      toast.error("Chỉ được chọn tối đa 3 loại cây");
      setSelectedCropType("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      crop_type: [...prev.crop_type, nextType],
    }));
    setSelectedCropType("");
  };

  const handleRemoveCropType = (typeName) => {
    setFormData((prev) => ({
      ...prev,
      crop_type: prev.crop_type.filter((item) => item !== typeName),
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn. Tối đa 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      setImageData(result);
      setImagePreview(result);

      setFormData((prev) => ({
        ...prev,
        image: result,
      }));
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div>
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push(`/profile/gardens/${gardenId}`)}
            className="cursor-pointer inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở lại vườn cây
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa khu vườn
              </h1>
              <p className="text-gray-600 text-sm">
                Chỉnh sửa thông tin khu vườn của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Tên khu vườn
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="ví dụ: Khu vườn Thanh Hóa"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            {/* Unit Code */}
            <div>
              <label
                htmlFor="unit_code"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Mã vườn
              </label>
              <input
                type="text"
                id="unit_code"
                name="unit_code"
                value={formData.unit_code}
                onChange={handleChange}
                required
                placeholder="ví dụ: VTDR-001"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            {/* Crop Type */}
            <div>
              <label
                htmlFor="crop_type"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Loại cây
              </label>
              <select
                id="crop_type"
                name="crop_type"
                value={selectedCropType}
                onChange={handleCropTypeChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
              >
                <option value="">
                  {isTypesLoading
                    ? "Đang tải loại cây..."
                    : formData.crop_type.length >= 3
                      ? "Đã chọn tối đa 3 loại"
                      : "Chọn loại cây"}
                </option>
                {types
                  ?.filter((type) => {
                    const typeName = type?.name || "";
                    return typeName && !formData.crop_type.includes(typeName);
                  })
                  .map((type) => (
                    <option key={type?._id} value={type?.name || ""}>
                      {type?.name}
                    </option>
                  ))}
              </select>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.crop_type.map((typeName) => (
                  <span
                    key={typeName}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
                  >
                    {typeName}
                    <button
                      type="button"
                      onClick={() => handleRemoveCropType(typeName)}
                      className="cursor-pointer rounded-full hover:bg-emerald-200 p-0.5"
                      aria-label={`Xóa ${typeName}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Area */}
            <div>
              <label
                htmlFor="area"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Diện tích (m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  m²
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.area &&
                  `≈ ${Math.round(parseFloat(formData.area) * 10.764)} ft²`}
              </p>
            </div>

            {/* Coordinates */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tọa độ <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Nhấp vào bản đồ để chọn vị trí khu vườn (hệ thống tự lấy
                Quận/Huyện, Tỉnh/Thành)
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
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                  <span className="text-gray-500">Vĩ độ: </span>
                  <span className="font-medium text-gray-900">
                    {formData.latitude || "Chưa chọn"}
                  </span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                  <span className="text-gray-500">Kinh độ: </span>
                  <span className="font-medium text-gray-900">
                    {formData.longitude || "Chưa chọn"}
                  </span>
                </div>
              </div>
              <div className="mt-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                <span className="text-gray-500">Vị trí (Quận/Tỉnh): </span>
                <span className="font-medium text-gray-900">
                  {formData.location || "Chưa chọn trên bản đồ"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Mô tả khu vườn của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
              />
            </div>
          </div>
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ảnh</label>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600">
                  Nhấp để chọn ảnh
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF tối đa 5MB
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto object-contain bg-gray-50 max-h-80"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setImageData("");
                    setFormData((prev) => ({
                      ...prev,
                      image: "",
                    }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {isGardenEditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Lưu thông tin
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/profile/gardens/${gardenId}`)}
              className="cursor-pointer inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300"
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

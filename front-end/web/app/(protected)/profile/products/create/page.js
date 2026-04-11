"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Check, ImageIcon, Package } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useProductStore as useTypeProductStore } from "@/store/useTypeProduct";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

export default function CreateProduct() {
  const router = useRouter();
  const { t } = useLanguage();
  const { createProduct, isProductCreating } = useProductStore();
  const { types, fetchTypes, isTypesLoading } = useTypeProductStore();
  const { authUser } = useAuthStore();
  const { seasonDiaries, getSeasonDiaries, isSeasonDiariesLoading } =
    useSeasonDiaryStore();
  const [formData, setFormData] = useState({
    seasonDiaryId: "",
    name: "",
    description: "",
    price: "",
    weight: "",
    origin: "",
    typeId: "",
    harvestStartDate: "",
    harvestEndDate: "",
    status: "active",
    images: [],
  });

  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!types?.length) {
      fetchTypes();
    }
  }, [types?.length, fetchTypes]);

  useEffect(() => {
    if (authUser?._id) {
      getSeasonDiaries(authUser._id);
    }
  }, [authUser?._id, getSeasonDiaries]);

  const priceValue = Number(formData.price);
  const weightValue = Number(formData.weight);
  const isFormComplete =
    !!formData.seasonDiaryId &&
    !!formData.name.trim() &&
    !!formData.description.trim() &&
    formData.price !== "" &&
    formData.weight !== "" &&
    !!formData.origin.trim() &&
    !!formData.typeId &&
    !!formData.harvestStartDate &&
    !!formData.harvestEndDate &&
    !!formData.status &&
    formData.images.length > 0;
  const isNonNegativeNumber =
    Number.isFinite(priceValue) &&
    Number.isFinite(weightValue) &&
    priceValue >= 0 &&
    weightValue >= 0;
  const isValidHarvestDateRange =
    !formData.harvestStartDate ||
    !formData.harvestEndDate ||
    formData.harvestEndDate >= formData.harvestStartDate;
  const isSubmitDisabled =
    isProductCreating ||
    !isFormComplete ||
    !isNonNegativeNumber ||
    !isValidHarvestDateRange;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.seasonDiaryId) {
      setError(t("edit_product_err_season"));
      return;
    }

    if (formData.harvestEndDate < formData.harvestStartDate) {
      setError(t("edit_product_err_date"));
      return;
    }

    if (!formData.images.length) {
      setError(t("edit_product_err_image"));
      return;
    }

    const payload = {
      ...formData,
      seasonDiaryId: formData.seasonDiaryId,
      season_diary_id: formData.seasonDiaryId,
      price: Number(formData.price) || 0,
      weight: Number(formData.weight) || 0,
      images: formData.images?.length ? formData.images : [],
    };

    try {
      await createProduct(payload);
      router.push("/profile/products");
    } catch (err) {
      setError(err?.response?.data?.message || t("create_product_err_create"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if ((name === "price" || name === "weight") && value !== "") {
      const numberValue = Number(value);
      if (!Number.isNaN(numberValue) && numberValue < 0) {
        nextValue = "0";
      }
    }

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [name]: nextValue,
      };

      if (
        name === "harvestStartDate" &&
        nextFormData.harvestEndDate &&
        nextFormData.harvestEndDate < nextValue
      ) {
        nextFormData.harvestEndDate = "";
      }

      return nextFormData;
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(t("edit_product_err_image_size"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      setImagePreview(result);

      setFormData((prev) => ({
        ...prev,
        images: [result],
      }));
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div>
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("create_product_title")}
              </h1>
              <p className="text-gray-600 text-sm">
                {t("create_product_subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="">
          {/* First block */}
          <div className="bg-white rounded-xl shadow-sm p-8 pb-2">
            <p className="font-bold mb-5">{t("edit_product_basic_info")}</p>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="seasonDiaryId"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_season")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="seasonDiaryId"
                  name="seasonDiaryId"
                  value={formData.seasonDiaryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white"
                >
                  <option value="">
                    {t("edit_product_season_placeholder")}
                  </option>
                  {seasonDiaries?.map((season, index) => (
                    <option key={season?._id} value={season?._id}>
                      {season?.garden_name ||
                        season?.name ||
                        season?.planting_area_code ||
                        `${t("edit_product_season_fallback")} ${index + 1}`}
                    </option>
                  ))}
                </select>
                {isSeasonDiariesLoading ? (
                  <p className="mt-1 text-xs text-gray-500">
                    {t("edit_product_season_loading")}
                  </p>
                ) : null}
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_name")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t("edit_product_name_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_desc")}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder={t("edit_product_desc_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Price, Weight, Origin, Type */}
            <div className="grid grid-cols-2 gap-5 my-5">
              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_price")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min={0}
                  step="any"
                  onWheel={(e) => e.target.blur()}
                  required
                  placeholder={t("edit_product_price_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Weight */}
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_weight")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min={0}
                  step="any"
                  onWheel={(e) => e.target.blur()}
                  required
                  placeholder={t("edit_product_weight_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Origin */}
              <div>
                <label
                  htmlFor="origin"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_origin")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  placeholder={t("edit_product_origin_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="typeId"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_type")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="typeId"
                  name="typeId"
                  value={formData.typeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white"
                >
                  <option value="">{t("edit_product_type_placeholder")}</option>
                  {types?.map((type) => (
                    <option key={type?._id} value={type?._id}>
                      {type?.name}
                    </option>
                  ))}
                </select>
                {isTypesLoading ? (
                  <p className="mt-1 text-xs text-gray-500">
                    {t("edit_product_type_loading")}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Second block */}
          <div className="bg-white rounded-xl shadow-sm p-8 pb-2 mt-5">
            <p className="font-bold mb-5">{t("edit_product_harvest")}</p>
            {/* Harvest date */}
            <div className="grid grid-cols-2 gap-5 my-5">
              {/* Start date */}
              <div>
                <label
                  htmlFor="harvestStartDate"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_start_date")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="harvestStartDate"
                  name="harvestStartDate"
                  value={formData.harvestStartDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* End date */}
              <div>
                <label
                  htmlFor="harvestEndDate"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t("edit_product_end_date")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="harvestEndDate"
                  name="harvestEndDate"
                  value={formData.harvestEndDate}
                  onChange={handleChange}
                  min={formData.harvestStartDate || undefined}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm p-8 mt-5 space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("edit_product_image")} <span className="text-red-500">*</span>
            </label>

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
              >
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600">
                  {t("edit_product_image_click")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("edit_product_image_hint")}
                </p>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-full h-auto object-contain bg-gray-50 max-h-80"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setFormData((prev) => ({ ...prev, images: [] }));
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
              disabled={isSubmitDisabled}
              className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              {isProductCreating
                ? t("create_product_creating")
                : t("create_product_submit")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/products")}
              className="cursor-pointer inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300"
            >
              <X className="w-4 h-4" />
              {t("edit_product_cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

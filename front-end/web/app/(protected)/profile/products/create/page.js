"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Check, ImageIcon, Package } from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useProductStore as useTypeProductStore } from "@/store/useTypeProduct";

export default function CreateProduct() {
  const router = useRouter();
  const { createProduct, isProductCreating } = useProductStore();
  const { types, fetchTypes, isTypesLoading } = useTypeProductStore();
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      weight: Number(formData.weight) || 0,
      images: formData.images?.length ? formData.images : [],
    };

    try {
      await createProduct(payload);
      router.push("/profile/products");
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tạo sản phẩm");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh quá lớn. Tối đa 5MB");
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
          <button
            onClick={() => router.push("/profile/products")}
            className="cursor-pointer inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở lại sản phẩm
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo sản phẩm mới
              </h1>
              <p className="text-gray-600 text-sm">
                Thêm một sản phẩm vào kho sản phẩm của bạn
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
            <p className="font-bold mb-5">Thông tin cơ bản</p>
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="ví dụ: Sầu riêng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
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
                  rows={4}
                  placeholder="Mô tả khu vườn của bạn..."
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
                  Giá (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="ví dụ: 120000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Weight */}
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Cân nặng (KG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  placeholder="ví dụ: 2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Origin */}
              <div>
                <label
                  htmlFor="origin"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Xuất xứ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  placeholder="ví dụ: Cần Thơ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="typeId"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Loại sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  id="typeId"
                  name="typeId"
                  value={formData.typeId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-white"
                >
                  <option value="">Chọn loại sản phẩm</option>
                  {types?.map((type) => (
                    <option key={type?._id} value={type?._id}>
                      {type?.name}
                    </option>
                  ))}
                </select>
                {isTypesLoading ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Đang tải loại sản phẩm...
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Second block */}
          <div className="bg-white rounded-xl shadow-sm p-8 pb-2 mt-5">
            <p className="font-bold mb-5">Ngày thu hoạch</p>
            {/* Harvest date */}
            <div className="grid grid-cols-2 gap-5 my-5">
              {/* Start date */}
              <div>
                <label
                  htmlFor="harvestStartDate"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Ngày bắt đầu <span className="text-red-500">*</span>
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
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="harvestEndDate"
                  name="harvestEndDate"
                  value={formData.harvestEndDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Third block */}
          <div className="bg-white rounded-xl shadow-sm p-8 mt-5">
            <p className="font-bold mb-5">Trạng thái sản phẩm</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "active" }))
                }
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all ${
                  formData.status === "active"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                    : "bg-white border-gray-300 text-gray-400 hover:bg-gray-50"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "inactive" }))
                }
                className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all ${
                  formData.status === "inactive"
                    ? "bg-red-50 border-red-400 text-red-500"
                    : "bg-white border-gray-300 text-gray-400 hover:bg-gray-50"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm p-8 mt-5 space-y-2">
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
              disabled={isProductCreating}
              className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              {isProductCreating ? "Đang tạo..." : "Tạo sản phẩm"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile/products")}
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

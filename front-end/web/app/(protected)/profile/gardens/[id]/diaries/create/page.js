"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Sprout, Check, ImageIcon } from "lucide-react";
import { useGardenStore } from "@/store/useGardenStore";
import { useDiaryStore } from "@/store/useDiaryStore";

export default function CreateDiary() {
  const { id } = useParams();
  const router = useRouter();
  const { getGardenDetails, gardenDetail } = useGardenStore();
  const { createDiary } = useDiaryStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    garden_id: id,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    createDiary(formData);
    router.push(`/profile/gardens/${id}/diaries`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    getGardenDetails(id);
  }, [getGardenDetails, id]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push(`/profile/gardens/${id}/diaries`)}
            className="cursor-pointer inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở lại nhật ký
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tạo nhật ký mới
              </h1>
              <p className="text-gray-600 text-sm">Cho {gardenDetail?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Tên khu vườn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="ví dụ: Khu vườn Thanh Hóa"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Mô tả khu vườn của bạn..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Tạo nhật ký
            </button>
            <button
              type="button"
              onClick={() => router.push(`/profile/gardens/${id}/diaries`)}
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

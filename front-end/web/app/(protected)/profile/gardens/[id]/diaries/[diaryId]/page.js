"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Sprout,
  CheckCircle2,
  BookOpen,
  Edit,
  Clock,
  Plus,
  DollarSign,
  X,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDiaryStore } from "@/store/useDiaryStore";
import { axiosInstance } from "@/lib/axios";

export default function GardenDiaryDetail() {
  const { id: gardenId, diaryId } = useParams();
  const router = useRouter();

  const { diaryDetail, isDiaryDetailsLoading, getDiaryDetails } =
    useDiaryStore();

  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [newStep, setNewStep] = useState({
    step_name: "",
    description: "",
    cost: "",
    image: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!diaryId) return;
    getDiaryDetails(diaryId);
  }, [diaryId, getDiaryDetails]);

  const date = useMemo(
    () => (diaryDetail?.start_date ? new Date(diaryDetail.start_date) : null),
    [diaryDetail?.start_date],
  );

  const formattedDate = date
    ? date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const relativeTime = date ? getRelativeTime(date) : "";

  const stages = diaryDetail?.stages || [];

  const openAddStepModal = (stageId) => {
    setSelectedStageId(stageId);
    setShowAddStepModal(true);
  };

  const closeAddStepModal = () => {
    setShowAddStepModal(false);
    setSelectedStageId(null);
    setNewStep({
      step_name: "",
      description: "",
      cost: "",
      image: "",
    });
    setImagePreview("");
  };

  const handleAddStep = async (e) => {
    e.preventDefault();

    if (!selectedStageId) {
      toast.error("Vui lòng chọn giai đoạn để thêm bước");
      return;
    }

    try {
      setIsSubmittingStep(true);
      await axiosInstance.post(`/diary/${diaryId}/step`, {
        stage_id: selectedStageId,
        step_name: newStep.step_name.trim(),
        description: newStep.description.trim(),
        cost: Number(newStep.cost) || 0,
        image: newStep.image || undefined,
      });

      toast.success("Thêm bước thành công");
      await getDiaryDetails(diaryId);
      closeAddStepModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể thêm bước");
    } finally {
      setIsSubmittingStep(false);
    }
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
      setImagePreview(result);
      setNewStep((prev) => ({
        ...prev,
        image: result,
      }));
    };

    reader.readAsDataURL(file);
  };

  if (isDiaryDetailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-700 font-medium">
          Đang tải chi tiết nhật ký...
        </div>
      </div>
    );
  }

  if (!diaryDetail?._id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy nhật ký
          </h2>
          <button
            onClick={() => router.push(`/profile/gardens/${gardenId}/diaries`)}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Quay lại danh sách nhật ký
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <button
            onClick={() => router.push(`/profile/gardens/${gardenId}/diaries`)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở về nhật ký
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {diaryDetail.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {diaryDetail?.garden_id?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  diaryDetail.status === "In progressing"
                    ? "bg-emerald-100 text-emerald-700"
                    : diaryDetail.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {diaryDetail.status}
              </span>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Crop Type
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {diaryDetail.crop_type}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                Start Date
              </div>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">{formattedDate}</span>
                <span className="text-sm text-gray-500">({relativeTime})</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-2">
              Description
            </div>
            <p className="text-gray-700 leading-relaxed">
              {diaryDetail.description}
            </p>
          </div>
        </div>

        {/* Stages Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">Growth Stages</h2>
          </div>

          {stages.map((stage) => (
            <div
              key={stage.stage_id || stage._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Stage Header */}
              <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {stage.order_index ?? 0}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {stage.stage_title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stage.stage_description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      openAddStepModal(stage.stage_id || stage._id)
                    }
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>
              </div>

              {/* Stage Steps */}
              <div className="p-6">
                {(stage.steps || []).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <CheckCircle2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">
                      No steps added yet for this stage
                    </p>
                    <button
                      onClick={() =>
                        openAddStepModal(stage.stage_id || stage._id)
                      }
                      className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stage.steps.map((step, idx) => (
                      <StepCard key={step._id} step={step} index={idx} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Step</h3>
              <button
                onClick={closeAddStepModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddStep} className="p-6 space-y-5">
              {/* Step Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Step Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStep.step_name}
                  onChange={(e) =>
                    setNewStep({ ...newStep, step_name: e.target.value })
                  }
                  placeholder="e.g., Mua 24 bao phân NPK"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newStep.description}
                  onChange={(e) =>
                    setNewStep({ ...newStep, description: e.target.value })
                  }
                  placeholder="Describe what you did in this step..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors resize-none"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Cost (VND) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={newStep.cost}
                    onChange={(e) =>
                      setNewStep({ ...newStep, cost: e.target.value })
                    }
                    placeholder="0"
                    required
                    min="0"
                    step="1000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Ảnh
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    <ImageIcon
                      className="mx-auto text-gray-400 mb-2"
                      size={32}
                    />
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

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeAddStepModal}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStep}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {isSubmittingStep ? "Đang thêm..." : "Add Step"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ step, index }) {
  const actionDate = step?.action_date ? new Date(step.action_date) : null;
  const formattedDate = actionDate
    ? actionDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex gap-4 p-4 bg-gray-50 hover:bg-emerald-50/50 rounded-lg border border-gray-200 hover:border-emerald-200 transition-all group">
      {/* Step Number */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-emerald-100 group-hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors">
          <span className="text-sm font-bold text-emerald-700">
            {index + 1}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h4 className="font-semibold text-gray-900">{step.step_name}</h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{formattedDate}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {step.description}
        </p>

        {/* Cost */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-gray-900">
              {Number(step.cost || 0).toLocaleString("vi-VN")} VND
            </span>
          </div>
        </div>

        {/* Image */}
        {step.image && (
          <div className="mt-3">
            <img
              src={step.image}
              alt={step.step_name}
              className="w-full max-w-sm h-60 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function getRelativeTime(date) {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
}

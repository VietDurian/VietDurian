"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Sprout,
  CheckCircle2,
  BookOpen,
  Edit,
  Plus,
  DollarSign,
  X,
  Image as ImageIcon,
  Award,
  Weight,
  TrendingUp,
  TrendingDown,
  Wallet,
  CircleDot,
  BadgeCheck,
  Ban,
  Layers,
  CircleAlert,
  PackageOpen,
  Hammer,
  BarChart2,
  Store,
  Droplets,
  Beaker,
  Clock,
  BookOpenCheck,
} from "lucide-react";
import { useDiaryStore } from "@/store/useDiaryStore";
import { useGardenStore } from "@/store/useGardenStore";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeTime(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff <= 0) return "Hôm nay";
  if (diff === 1) return "Hôm qua";
  if (diff < 7) return `${diff} ngày trước`;
  if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
  if (diff < 365) return `${Math.floor(diff / 30)} tháng trước`;
  return `${Math.floor(diff / 365)} năm trước`;
}

const ACTION_TYPES = ["Vật tư", "Công việc", "Chỉ số"];

const actionTypeConfig = {
  "Vật tư": {
    icon: PackageOpen,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    activeBg: "bg-orange-500",
    activeText: "text-white",
    dot: "bg-orange-400",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },
  "Công việc": {
    icon: Hammer,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBg: "bg-blue-600",
    activeText: "text-white",
    dot: "bg-blue-400",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  "Chỉ số": {
    icon: BarChart2,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    activeBg: "bg-violet-600",
    activeText: "text-white",
    dot: "bg-violet-400",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
  },
};

const statusConfig = {
  "In progressing": {
    label: "Đang tiến hành",
    bar: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: CircleDot,
  },
  Completed: {
    label: "Hoàn thành",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: BadgeCheck,
  },
  Cancelled: {
    label: "Đã hủy",
    bar: "bg-gray-400",
    badge: "bg-gray-100 text-gray-600 border-gray-200",
    icon: Ban,
  },
};

export default function GardenDiaryDetailPage() {
  const { id, diaryId } = useParams();
  const router = useRouter();

  const {
    diaryDetail,
    isDiaryDetailsLoading,
    isDiaryStepAdding,
    isDiaryCompleting,
    getDiaryDetails,
    addDiaryStep,
    completeDiary,
  } = useDiaryStore();
  const { gardenDetail, getGardenDetails } = useGardenStore();

  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [actionType, setActionType] = useState("Công việc");
  const [newStep, setNewStep] = useState({
    step_name: "",
    description: "",
    cost: "",
    image: "",
    item_name: "",
    dosage: "",
    supplier: "",
  });

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishData, setFinishData] = useState({
    weight_durian: "",
    price: "",
  });
  const [finishErrors, setFinishErrors] = useState({
    weight_durian: "",
    price: "",
  });

  useEffect(() => {
    if (!diaryId) return;
    getDiaryDetails(diaryId);
  }, [diaryId, getDiaryDetails]);

  useEffect(() => {
    if (!id) return;
    getGardenDetails(id);
  }, [id, getGardenDetails]);

  const diary = diaryDetail?._id ? diaryDetail : null;
  const garden = diary?.garden_id || gardenDetail;

  const normalizedStages = useMemo(() => {
    if (!diary?.stages || !Array.isArray(diary.stages)) return [];
    return diary.stages.map((stage, index) => ({
      _id: stage.stage_id,
      stage_number: index + 1,
      stage_name: stage.stage_title,
      description: stage.stage_description,
      steps: stage.steps || [],
    }));
  }, [diary]);

  const status = statusConfig[diary?.status] || statusConfig["In progressing"];
  const StatusIcon = status.icon;
  const totalSteps = normalizedStages.reduce(
    (sum, stage) => sum + stage.steps.length,
    0,
  );
  const activeStages = normalizedStages.filter(
    (stage) => stage.steps.length > 0,
  );
  const profitPositive = Number(diary?.profit || 0) > 0;

  const openAddStep = (stageId) => {
    setSelectedStageId(stageId);
    setActionType("Công việc");
    setNewStep({
      step_name: "",
      description: "",
      cost: "",
      image: "",
      item_name: "",
      dosage: "",
      supplier: "",
    });
    setShowAddStepModal(true);
  };

  const closeAddStep = () => {
    setShowAddStepModal(false);
    setSelectedStageId(null);
  };

  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!selectedStageId || !diaryId) return;

    const payload = {
      stage_id: selectedStageId,
      action_type: actionType,
      step_name: newStep.step_name.trim(),
      description: newStep.description.trim(),
      cost: Number(newStep.cost || 0),
      image: newStep.image?.trim() || undefined,
      item_name:
        actionType === "Vật tư" ? newStep.item_name?.trim() : undefined,
      dosage: actionType === "Vật tư" ? newStep.dosage?.trim() : undefined,
      supplier: actionType === "Vật tư" ? newStep.supplier?.trim() : undefined,
    };

    await addDiaryStep(diaryId, payload);
    closeAddStep();
  };

  const openFinish = () => {
    setShowFinishModal(true);
    setFinishData({ weight_durian: "", price: "" });
    setFinishErrors({ weight_durian: "", price: "" });
  };

  const closeFinish = () => setShowFinishModal(false);

  const validateFinish = () => {
    const errors = { weight_durian: "", price: "" };
    if (!finishData.weight_durian || Number(finishData.weight_durian) <= 0) {
      errors.weight_durian = "Sản lượng phải lớn hơn 0";
    }
    if (!finishData.price || Number(finishData.price) <= 0) {
      errors.price = "Giá bán phải lớn hơn 0";
    }
    setFinishErrors(errors);
    return !Object.values(errors).some((value) => value !== "");
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!validateFinish() || !diaryId) return;

    await completeDiary(diaryId, {
      weight_durian: Number(finishData.weight_durian),
      price: Number(finishData.price),
    });
    closeFinish();
  };

  if (isDiaryDetailsLoading && !diary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-sm">
          Đang tải chi tiết nhật ký...
        </div>
      </div>
    );
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy nhật ký
          </h2>
          <button
            onClick={() => router.push(`/profile/gardens/${id}/diaries`)}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Quay lại danh sách nhật ký
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`h-1 w-full ${status.bar}`} />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push(`/profile/gardens/${id}/diaries`)}
            className="cursor-pointer inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại nhật ký
          </button>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900 truncate">
                    {diary.title}
                  </h1>
                </div>
                <p className="text-sm text-gray-500">{garden?.name || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {diary.status === "In progressing" ? (
                <>
                  <button
                    onClick={openFinish}
                    className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                  >
                    <BookOpenCheck className="w-4 h-4" /> Kết thúc vụ
                  </button>
                  <button className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm transition-colors">
                    <Edit className="w-4 h-4" /> Sửa
                  </button>
                </>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${status.badge}`}
                >
                  <StatusIcon className="w-3 h-3" /> {status.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <h2 className="font-bold text-gray-900">Thông tin nhật ký</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-gray-500 font-medium">
                      Ngày bắt đầu
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatDate(diary.start_date)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getRelativeTime(diary.start_date)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">
                      Cập nhật lần cuối
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatDateShort(diary.updated_at)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Mô tả vụ
                </p>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {diary.description || "—"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Layers className="w-4 h-4 text-teal-600" />
                <h2 className="font-bold text-gray-900">Tiến độ giai đoạn</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-teal-700">
                    {activeStages.length}
                  </p>
                  <p className="text-xs text-teal-600 mt-0.5">
                    / {normalizedStages.length} giai đoạn
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Đang hoạt động</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-black text-emerald-700">
                    {totalSteps}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Bước đã ghi</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Tiến độ</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {activeStages.length}/{normalizedStages.length} giai đoạn
                  </span>
                </div>
                <div className="flex gap-1">
                  {normalizedStages.map((stage) => (
                    <div
                      key={stage._id}
                      className={`flex-1 h-2 rounded-full ${stage.steps.length > 0 ? "bg-emerald-500" : "bg-gray-100"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-emerald-100" />
                  <h2 className="font-bold text-white text-sm">Tài chính vụ</h2>
                </div>
                <p className="text-emerald-100 text-xs">
                  {diary.status === "Completed"
                    ? "Đã kết toán"
                    : "Đang theo dõi"}
                </p>
              </div>
              <div className="p-5 space-y-4">
                <FinancialRow
                  icon={DollarSign}
                  iconBg="bg-red-50"
                  iconColor="text-red-500"
                  label="Chi phí"
                  valueColor="text-red-600"
                  value={
                    Number(diary.total_cost || 0) > 0
                      ? `${Number(diary.total_cost).toLocaleString("vi-VN")} ₫`
                      : "—"
                  }
                />
                <div className="border-t border-dashed border-gray-100" />
                <FinancialRow
                  icon={Weight}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-500"
                  label="Sản lượng"
                  value={
                    Number(diary.weight_durian || 0) > 0
                      ? `${Number(diary.weight_durian).toLocaleString("vi-VN")} kg`
                      : "—"
                  }
                />
                <FinancialRow
                  icon={BarChart2}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-500"
                  label="Giá bán / kg"
                  value={
                    Number(diary.price || 0) > 0
                      ? `${Number(diary.price).toLocaleString("vi-VN")} ₫`
                      : "—"
                  }
                />
                <FinancialRow
                  icon={TrendingUp}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-500"
                  label="Doanh thu"
                  value={
                    Number(diary.total_revenue || 0) > 0
                      ? `${Number(diary.total_revenue).toLocaleString("vi-VN")} ₫`
                      : "—"
                  }
                  valueColor="text-emerald-600"
                />
                <div
                  className={`rounded-xl p-4 border ${
                    profitPositive
                      ? "bg-emerald-50 border-emerald-200"
                      : Number(diary.profit || 0) < 0
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {profitPositive ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : Number(diary.profit || 0) < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <CircleAlert className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-semibold text-gray-700">
                        Lợi nhuận
                      </span>
                    </div>
                    <span
                      className={`font-black text-sm ${
                        profitPositive
                          ? "text-emerald-600"
                          : Number(diary.profit || 0) < 0
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {Number(diary.profit || 0) !== 0
                        ? `${Number(diary.profit) > 0 ? "+" : ""}${Number(diary.profit).toLocaleString("vi-VN")} ₫`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-5">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Các giai đoạn canh tác
            </h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full font-semibold ml-1">
              {normalizedStages.length} giai đoạn
            </span>
          </div>

          <div className="space-y-4">
            {normalizedStages.map((stage) => {
              const stageCost = stage.steps.reduce(
                (sum, step) => sum + (Number(step.cost) || 0),
                0,
              );
              return (
                <div
                  key={stage._id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                    stage.steps.length > 0
                      ? "border-emerald-200"
                      : "border-gray-100"
                  }`}
                >
                  <div
                    className={`px-6 py-4 flex items-center justify-between ${
                      stage.steps.length > 0
                        ? "bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100"
                        : "bg-gray-50 border-b border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          stage.steps.length > 0
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {stage.stage_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">
                            {stage.stage_name}
                          </h3>
                          {stage.steps.length > 0 && (
                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                              {stage.steps.length} bước
                            </span>
                          )}
                        </div>
                        {stage.description && (
                          <p className="text-xs text-gray-500">
                            {stage.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      Tổng chi phí giai đoạn:
                      {stageCost > 0 && (
                        <span className="text-sm text-red-600">
                          <span className="font-semibold text-red-600">
                            {stageCost.toLocaleString("vi-VN")}
                          </span>{" "}
                          ₫
                        </span>
                      )}
                      {diary.status !== "Completed" && (
                        <button
                          onClick={() => openAddStep(stage._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            stage.steps.length > 0
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" /> Thêm bước
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    {stage.steps.length === 0 ? (
                      <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        <div className="text-center">
                          <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 mb-2">
                            Chưa có bước nào ở giai đoạn này
                          </p>
                          <button
                            onClick={() => openAddStep(stage._id)}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-medium inline-flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm bước đầu tiên
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {stage.steps.map((step, idx) => (
                          <StepCard key={step._id} step={step} index={idx} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddStepModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-700" />
                </div>
                <h3 className="font-bold text-gray-900">Thêm bước thực hiện</h3>
              </div>
              <button
                onClick={closeAddStep}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStep} className="p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2.5">
                  Loại hành động
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {ACTION_TYPES.map((type) => {
                    const cfg = actionTypeConfig[type];
                    const TypeIcon = cfg.icon;
                    const isActive = actionType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActionType(type)}
                        className={`cursor-pointer flex flex-col items-center gap-2 py-3.5 px-3 rounded-xl border-2 transition-all font-medium text-sm ${
                          isActive
                            ? `${cfg.activeBg} ${cfg.activeText} border-transparent shadow-sm`
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        <TypeIcon
                          className={`w-5 h-5 ${isActive ? cfg.activeText : cfg.color}`}
                        />
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={`mt-3 rounded-xl p-3 flex items-start gap-2 ${actionTypeConfig[actionType].bg} border ${actionTypeConfig[actionType].border}`}
                >
                  {(() => {
                    const Ic = actionTypeConfig[actionType].icon;
                    return (
                      <Ic
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${actionTypeConfig[actionType].color}`}
                      />
                    );
                  })()}
                  <p
                    className={`text-xs leading-relaxed ${actionTypeConfig[actionType].color}`}
                  >
                    {actionType === "Vật tư" &&
                      "Ghi nhận vật tư, phân bón, thuốc bảo vệ thực vật đã sử dụng. Điền tên sản phẩm, liều lượng và nhà cung cấp."}
                    {actionType === "Công việc" &&
                      "Ghi nhận công việc lao động thực tế: làm đất, tưới nước, cắt tỉa... Có thể thêm hình ảnh minh họa."}
                    {actionType === "Chỉ số" &&
                      "Ghi nhận các chỉ số quan sát: pH đất, tỷ lệ nảy mầm, mức độ sâu bệnh... Thường không có chi phí."}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Tên bước <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newStep.step_name}
                  onChange={(e) =>
                    setNewStep({ ...newStep, step_name: e.target.value })
                  }
                  placeholder={
                    actionType === "Vật tư"
                      ? "VD: Xử lý vôi bột"
                      : actionType === "Công việc"
                        ? "VD: Trồng cây con"
                        : "VD: Kiểm tra mắt cua"
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {actionType === "Vật tư" && (
                <div
                  className={`space-y-4 p-4 rounded-xl border ${actionTypeConfig["Vật tư"].border} ${actionTypeConfig["Vật tư"].bg}`}
                >
                  <p className="text-xs font-bold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
                    <PackageOpen className="w-3.5 h-3.5" /> Thông tin vật tư
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newStep.item_name}
                      onChange={(e) =>
                        setNewStep({ ...newStep, item_name: e.target.value })
                      }
                      placeholder="VD: Vôi bột nông nghiệp"
                      required={actionType === "Vật tư"}
                      className="w-full px-4 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all bg-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-orange-500" />{" "}
                        Liều lượng
                      </label>
                      <input
                        type="text"
                        value={newStep.dosage}
                        onChange={(e) =>
                          setNewStep({ ...newStep, dosage: e.target.value })
                        }
                        placeholder="VD: 2kg/gốc"
                        className="w-full px-3 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-orange-500" /> Nhà
                        cung cấp
                      </label>
                      <input
                        type="text"
                        value={newStep.supplier}
                        onChange={(e) =>
                          setNewStep({ ...newStep, supplier: e.target.value })
                        }
                        placeholder="VD: Đại lý VTNN Hòa Bình"
                        className="w-full px-3 py-2.5 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newStep.description}
                  onChange={(e) =>
                    setNewStep({ ...newStep, description: e.target.value })
                  }
                  placeholder={
                    actionType === "Vật tư"
                      ? "VD: Rải vôi khử trùng đất và nâng pH."
                      : actionType === "Công việc"
                        ? "VD: Đặt cây vào hố, cắm cọc cố định thân cây..."
                        : "VD: Mầm cây đã nở đều khoảng 30%."
                  }
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Chi phí (VNĐ){" "}
                  {actionType === "Chỉ số" && (
                    <span className="text-gray-400 font-normal">
                      (thường là 0)
                    </span>
                  )}
                  {actionType !== "Chỉ số" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={newStep.cost}
                    onChange={(e) =>
                      setNewStep({ ...newStep, cost: e.target.value })
                    }
                    placeholder="0"
                    required={actionType !== "Chỉ số"}
                    min="0"
                    step="1000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {actionType !== "Chỉ số" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    URL hình ảnh{" "}
                    <span className="text-gray-400 font-normal">
                      (tuỳ chọn)
                    </span>
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={newStep.image}
                      onChange={(e) =>
                        setNewStep({ ...newStep, image: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  {newStep.image && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={newStep.image}
                        alt="Preview"
                        className="w-full h-36 object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/400x200?text=URL+không+hợp+lệ";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAddStep}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-medium transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isDiaryStepAdding}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />{" "}
                  {isDiaryStepAdding ? "Đang lưu..." : "Lưu bước"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFinishModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">
                      Kết thúc vụ canh tác
                    </h3>
                    <p className="text-emerald-100 text-xs">
                      Nhập kết quả thu hoạch
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeFinish}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleFinish} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Sản lượng thu hoạch (kg){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={finishData.weight_durian}
                    onChange={(e) => {
                      setFinishData({
                        ...finishData,
                        weight_durian: e.target.value,
                      });
                      if (finishErrors.weight_durian) {
                        setFinishErrors({ ...finishErrors, weight_durian: "" });
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white ${
                      finishErrors.weight_durian
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                </div>
                {finishErrors.weight_durian && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {finishErrors.weight_durian}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Giá bán / kg (VNĐ) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={finishData.price}
                    onChange={(e) => {
                      setFinishData({ ...finishData, price: e.target.value });
                      if (finishErrors.price) {
                        setFinishErrors({ ...finishErrors, price: "" });
                      }
                    }}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-gray-50 focus:bg-white ${
                      finishErrors.price ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                </div>
                {finishErrors.price && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {finishErrors.price}
                  </p>
                )}
              </div>

              {finishData.weight_durian && finishData.price && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Doanh thu ước tính
                    </span>
                    <span className="font-black text-emerald-700">
                      {(
                        Number(finishData.weight_durian) *
                        Number(finishData.price)
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </span>
                  </div>
                  {Number(diary.total_cost || 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Lợi nhuận ước tính
                      </span>
                      <span
                        className={`font-bold ${
                          Number(finishData.weight_durian) *
                            Number(finishData.price) -
                            Number(diary.total_cost || 0) >
                          0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {(
                          Number(finishData.weight_durian) *
                            Number(finishData.price) -
                          Number(diary.total_cost || 0)
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeFinish}
                  className="flex-1 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isDiaryCompleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />{" "}
                  {isDiaryCompleting ? "Đang xử lý..." : "Xác nhận hoàn thành"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor = "text-gray-900",
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className={`font-bold text-sm ${valueColor}`}>{value}</p>
    </div>
  );
}

function StepCard({ step, index }) {
  const resolvedActionType = actionTypeConfig[step.action_type]
    ? step.action_type
    : "Công việc";
  const cfg = actionTypeConfig[resolvedActionType];
  const TypeIcon = cfg.icon;
  const actionDate = step.action_date
    ? new Date(step.action_date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all group hover:shadow-sm ${cfg.border} ${cfg.bg}`}
    >
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${cfg.border}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.activeBg}`}
          >
            <span className="text-white text-xs font-bold">{index + 1}</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            {step.action_type || "Công việc"}
          </span>
          <h4 className="font-semibold text-gray-900 text-sm">
            {step.step_name}
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          <span>{actionDate}</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3 bg-white">
        {step.action_type === "Vật tư" &&
          (step.item_name || step.dosage || step.supplier) && (
            <div className="grid grid-cols-3 gap-2">
              {step.item_name && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Beaker className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-semibold text-orange-600 uppercase">
                      Sản phẩm
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {step.item_name}
                  </p>
                </div>
              )}
              {step.dosage && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Droplets className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-semibold text-orange-600 uppercase">
                      Liều lượng
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    {step.dosage}
                  </p>
                </div>
              )}
              {step.supplier && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-2.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Store className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-semibold text-orange-600 uppercase">
                      Nhà CC
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-tight">
                    {step.supplier}
                  </p>
                </div>
              )}
            </div>
          )}

        <p className="text-sm text-gray-600 leading-relaxed">
          {step.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold ${
              Number(step.cost || 0) > 0
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {Number(step.cost || 0) > 0
              ? `${Number(step.cost).toLocaleString("vi-VN")} ₫`
              : "Không có chi phí"}
          </span>
        </div>

        {step.image && (
          <div className="rounded-xl overflow-hidden border border-gray-200 max-w-xs">
            <img
              src={step.image}
              alt={step.step_name}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

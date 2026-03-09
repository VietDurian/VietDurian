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
  Weight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Layers,
  CircleAlert,
  BarChart2,
  Clock,
  BookOpenCheck,
} from "lucide-react";
import { useDiaryStore } from "@/store/useDiaryStore";
import { useGardenStore } from "@/store/useGardenStore";
import { statusConfig } from "@/constants";
import {
  formatDate,
  formatDateShort,
  getRelativeTime,
} from "@/lib/diary/formatter";
import { StepCard } from "@/components/diary-details/StepCard";
import AddStepModal from "@/components/diary-details/AddStepModal";
import FinishModal from "@/components/diary-details/FinishModal";

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
  const [actionType, setActionType] = useState("Vật tư");
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
    setActionType("Vật tư");
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
            onClick={() =>
              router.push(`/profile/gardens/${id}/diaries/${diaryId}`)
            }
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
                  <button
                    onClick={() =>
                      router.push(
                        `/profile/gardens/${id}/diaries/${diaryId}/edit`,
                      )
                    }
                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm transition-colors"
                  >
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
                          <StepCard
                            key={step._id}
                            step={step}
                            index={idx}
                            diaryId={diaryId}
                            canEdit={diary.status !== "Completed"}
                          />
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
        <AddStepModal
          closeAddStep={closeAddStep}
          handleAddStep={handleAddStep}
          isDiaryStepAdding={isDiaryStepAdding}
          actionType={actionType}
          setActionType={setActionType}
          newStep={newStep}
          setNewStep={setNewStep}
        />
      )}

      {showFinishModal && (
        <FinishModal
          closeFinish={closeFinish}
          handleFinish={handleFinish}
          isDiaryCompleting={isDiaryCompleting}
          finishData={finishData}
          setFinishData={setFinishData}
          finishErrors={finishErrors}
          setFinishErrors={setFinishErrors}
          totalCost={diary.total_cost}
        />
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

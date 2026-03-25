import { useState } from "react";
import {
  Beaker,
  Calendar,
  Droplets,
  Store,
  Pencil,
  Trash2,
} from "lucide-react";
import { actionTypeConfig } from "@/constants";
import { useDiaryStore } from "@/store/useDiaryStore";
import EditStepModal from "@/components/diary-details/EditStepModal";
import Image from "next/image";

export function StepCard({ step, index, diaryId, canEdit = true }) {
  const { editStep, isStepEditing, deleteStep, isStepDeleting } =
    useDiaryStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    step_name: step.step_name || "",
    description: step.description || "",
    cost: step.cost ?? "",
    item_name: step.item_name || "",
    dosage: step.dosage || "",
    supplier: step.supplier || "",
    image: step.image || "",
  });

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

  const openEditModal = () => {
    setFormData({
      step_name: step.step_name || "",
      description: step.description || "",
      cost: step.cost ?? "",
      item_name: step.item_name || "",
      dosage: step.dosage || "",
      supplier: step.supplier || "",
      image: step.image || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const handleDeleteStep = async () => {
    if (!diaryId || !step?._id) return;
    await deleteStep(diaryId, step._id);
    setShowDeleteModal(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!diaryId || !step?._id) return;

    const payload = {
      step_name: formData.step_name.trim(),
      description: formData.description.trim(),
      cost: Number(formData.cost || 0),
      item_name:
        step.action_type === "Vật tư" ? formData.item_name.trim() : undefined,
      dosage:
        step.action_type === "Vật tư" ? formData.dosage.trim() : undefined,
      supplier:
        step.action_type === "Vật tư" ? formData.supplier.trim() : undefined,
      image: formData.image.trim() || undefined,
    };

    await editStep(diaryId, step._id, payload);
    closeEditModal();
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all group hover:shadow-sm ${cfg.border} ${cfg.bg}`}
    >
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${cfg.border}`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cfg.activeBg}`}
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
        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          {canEdit && (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Sửa bước
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-100 hover:bg-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa bước
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{actionDate}</span>
          </div>
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
            <Image
              src={step.image}
              alt={step.step_name}
              width={96}
              height={96}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>

      {showEditModal && (
        <EditStepModal
          closeAddStep={closeEditModal}
          handleAddStep={handleSaveEdit}
          isDiaryStepAdding={isStepEditing}
          actionType={step.action_type || "Công việc"}
          setActionType={() => {}}
          newStep={formData}
          setNewStep={setFormData}
          title="Chỉnh sửa bước thực hiện"
          submitLabel="Lưu thay đổi"
          isActionTypeLocked
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Xóa bước</h3>
                <p className="text-sm text-gray-500">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 bg-gray-50 rounded-xl p-4 text-sm leading-relaxed">
              Bạn có chắc chắn muốn xóa bước{" "}
              <strong className="text-gray-900">
                &quot;{step.step_name}&quot;
              </strong>
              ? Thông tin công việc và chi phí của bước này sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteStep}
                disabled={isStepDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
              >
                {isStepDeleting ? "Đang xóa..." : "Xóa bước"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isStepDeleting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

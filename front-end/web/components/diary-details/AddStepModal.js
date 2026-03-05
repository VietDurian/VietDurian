import {
  DollarSign,
  Droplets,
  ImageIcon,
  PackageOpen,
  Plus,
  Store,
  X,
} from "lucide-react";

import { ACTION_TYPES, actionTypeConfig } from "@/constants";

export default function AddStepModal({
  closeAddStep,
  handleAddStep,
  isDiaryStepAdding,
  actionType,
  setActionType,
  newStep,
  setNewStep,
}) {
  return (
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
                    className={`w-4 h-4 mt-0.5 shrink-0 ${actionTypeConfig[actionType].color}`}
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
                  <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-orange-500" /> Liều
                    lượng
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
                  <label className="text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-orange-500" /> Nhà cung
                    cấp
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
                <span className="text-gray-400 font-normal">(thường là 0)</span>
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
                <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
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
              className="cursor-pointer px-5 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-medium transition-colors text-sm"
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
  );
}

import { Beaker, Calendar, Droplets, Store } from "lucide-react";
import { actionTypeConfig } from "@/constants";

export function StepCard({ step, index }) {
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
        <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
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

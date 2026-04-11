import { Award, CheckCircle2, DollarSign, Weight, X } from "lucide-react";

export default function FinishModal({
  closeFinish,
  handleFinish,
  isDiaryCompleting,
  finishData,
  setFinishData,
  finishErrors,
  setFinishErrors,
  totalCost,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-linear-to-br from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">Kết thúc vụ canh tác</h3>
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
              Sản lượng thu hoạch (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={finishData.weight_durian}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setFinishData({ ...finishData, weight_durian: val });
                    if (finishErrors.weight_durian) {
                      setFinishErrors({ ...finishErrors, weight_durian: "" });
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                placeholder="0"
                min="0"
                step="any"
                onWheel={(e) => e.target.blur()}
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
                  const val = e.target.value;
                  if (val === "" || Number(val) >= 0) {
                    setFinishData({ ...finishData, price: val });
                    if (finishErrors.price) {
                      setFinishErrors({ ...finishErrors, price: "" });
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                placeholder="0"
                min="0"
                step="any"
                onWheel={(e) => e.target.blur()}
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
                    Number(finishData.weight_durian) * Number(finishData.price)
                  ).toLocaleString("vi-VN")}{" "}
                  ₫
                </span>
              </div>
              {Number(totalCost || 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Lợi nhuận ước tính
                  </span>
                  <span
                    className={`font-bold ${
                      Number(finishData.weight_durian) *
                        Number(finishData.price) -
                        Number(totalCost || 0) >
                      0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {(
                      Number(finishData.weight_durian) *
                        Number(finishData.price) -
                      Number(totalCost || 0)
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
              className="cursor-pointer flex-1 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isDiaryCompleting}
              className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />{" "}
              {isDiaryCompleting ? "Đang xử lý..." : "Xác nhận hoàn thành"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

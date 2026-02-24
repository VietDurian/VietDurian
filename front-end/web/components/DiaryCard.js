import Link from "next/link";

const { Sprout, ChevronRight, BookOpen, Calendar } = require("lucide-react");

export default function DiaryCard({ diary }) {
  const date = new Date(diary.start_date);
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const isCompleted = diary.status === "Completed";

  return (
    <div className="relative flex gap-6 group">
      {/* Timeline Node */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-sm z-10">
          <Calendar className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="absolute inset-0 w-12 h-12 bg-emerald-500/20 rounded-full opacity-0"></div>
      </div>

      {/* Card Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-md transition-all pb-6">
        {/* Date Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-emerald-600">
              {formattedDate}
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                isCompleted
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {diary.status}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {diary.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {diary.description}
          </p>

          <div className="text-sm text-gray-500 mb-3">🌱 {diary.crop_type}</div>

          {isCompleted && (
            <div className="text-sm text-gray-700 mb-4">
              {diary.weight_durian?.toLocaleString()} kg ·{" "}
              {diary.price?.toLocaleString()} đ/kg
            </div>
          )}

          <Link
            href={`/profile/gardens/${diary.garden_id?._id}/diaries/${diary._id}`}
            className="text-emerald-700 text-sm font-medium hover:underline"
          >
            Read Full Entry →
          </Link>
        </div>
      </div>
    </div>
  );
}

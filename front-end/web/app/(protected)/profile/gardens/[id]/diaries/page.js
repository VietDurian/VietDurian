"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Filter } from "lucide-react";
import { useDiaryStore } from "@/store/useDiaryStore";
import { useGardenStore } from "@/store/useGardenStore";
import DiaryCard from "@/components/DiaryCard";

export default function GardenDiaryList() {
  const { id } = useParams();
  const router = useRouter();

  const { diaries, isDiariesLoading, getAllDiariesByGardenId } =
    useDiaryStore();

  const { getGardenDetails, gardenDetail } = useGardenStore();

  const [year, setYear] = useState("all");

  const [garden, setGarden] = useState({});

  useEffect(() => {
    if (!id) return;

    const yearParam = year === "all" ? null : Number(year);
    getAllDiariesByGardenId(id, yearParam);
  }, [id, year, getAllDiariesByGardenId]);

  useEffect(() => {
    getGardenDetails(id);
  }, [id, getGardenDetails]);

  if (!diaries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-bold">Diaries not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={() => router.push(`/profile/gardens/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors duration-300 ease-in-out mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Trở lại chi tiết khu vườn
          </button>

          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Nhật Ký</h1>
                <p className="text-gray-600">
                  <span className="text-emerald-700 font-semibold">
                    {gardenDetail?.name}
                  </span>{" "}
                  · {diaries.length} nhật ký
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2 outline-0 cursor-pointer"
                >
                  <option value="all">Tất cả</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <Link
                href={`/profile/gardens/${id}/diaries/create`}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Tạo nhật ký mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {isDiariesLoading ? (
          <div className="text-center text-gray-500">Loading diaries...</div>
        ) : diaries.length === 0 ? (
          <div className="text-center text-gray-500">
            Không tìm thấy nhật ký.
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-emerald-500"></div>
            {diaries
              .sort(
                (a, b) =>
                  new Date(b.start_date).getTime() -
                  new Date(a.start_date).getTime(),
              )
              .map((diary) => (
                <DiaryCard key={diary._id} diary={diary} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

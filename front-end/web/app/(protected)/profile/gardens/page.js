"use client";
import { useEffect, useState } from "react";

import { Plus, MapPin, Ruler, Sprout, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useGardenStore } from "@/store/useGardenStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfileGarden() {
  const searchParams = useSearchParams();
  const {
    gardens,
    getUserGardens,
    isGardensLoading,
    isGardenEditing,
    isGardenCreating,
  } = useGardenStore();
  const { authUser } = useAuthStore();
  const [isDiaryGuideOpen, setIsDiaryGuideOpen] = useState(false);

  useEffect(() => {
    if (authUser?._id) {
      getUserGardens(authUser._id);
    }
  }, [authUser, getUserGardens]);

  useEffect(() => {
    const shouldShowGuide = searchParams.get("diaryGuide") === "1";
    setIsDiaryGuideOpen(shouldShowGuide);
  }, [searchParams]);

  if (isGardensLoading) return <div>Loading gardens...</div>;
  return (
    <>
      {isGardenEditing ||
        (isGardenCreating && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
              <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full"></span>
              <span className="text-gray-700 font-medium">
                Đang cập nhật khu vườn...
              </span>
            </div>
          </div>
        ))}
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30 mt-7">
        {/* Header */}
        <div className="mx-auto bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl shadow-xl max-w-7xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Khu vườn của tôi
                </h1>
                <p className="text-white">Quản lí khu vườn & Nhật ký</p>
              </div>
              <Link
                href="/profile/gardens/create"
                className="inline-flex items-center gap-2 bg-white hover:bg-emerald-100 text-emerald-700 px-6 py-3 rounded-lg font-bold transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Tạo khu vườn
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {gardens.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Sprout className="w-16 h-16 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chưa có khu vườn nào
              </h2>
              <p className="text-gray-600 text-center max-w-md mb-8">
                Để bắt đầu tạo một khu vườn mới, bấm nút tạo khu vườn và bắt
                đầu!
              </p>
              <Link
                href={"/profile/gardens/create"}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Tạo khu vườn
              </Link>
            </div>
          ) : (
            /* Garden Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gardens.map((garden, index) => (
                <div key={garden._id} className="relative">
                  <GardenCard garden={garden} />

                  {isDiaryGuideOpen && index === 0 && (
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 w-72 bg-white border border-emerald-200 rounded-xl shadow-xl p-3 ">
                      <button
                        type="button"
                        onClick={() => setIsDiaryGuideOpen(false)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Đóng hướng dẫn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-sm text-gray-700 pr-5">
                        Để tạo nhật ký, hãy chọn một trong những khu vườn đã tạo
                        để bắt đầu.
                      </p>

                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r border-b border-emerald-200 rotate-45"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function GardenCard({ garden }) {
  return (
    <Link
      href={`/profile/gardens/${garden._id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group"
    >
      {/* Card Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={garden.image}
          alt={garden.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Crop Type Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
            {garden.crop_type}
          </span>
        </div>

        {/* Garden Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">
            {garden.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm">{garden.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Ruler className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm">
            {garden.area} m² ({Math.round(garden.area * 10.764)} ft²)
          </span>
        </div>

        {/* View Details Button */}
        <div className="pt-2">
          <div className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg font-medium group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            Xem chi tiết
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

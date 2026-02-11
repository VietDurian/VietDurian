"use client";
import { useEffect, useState } from "react";

import {
  Plus,
  MapPin,
  Ruler,
  Sprout,
  ArrowRight,
  ChevronLeft,
  Notebook,
  Pen,
} from "lucide-react";
import Link from "next/link";
import { useGardenStore } from "@/store/useGardenStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, usePathname } from "next/navigation";

export default function ProfileGardenDiaries() {
  const { id } = useParams();
  const pathname = usePathname();
  const { getGardenDetails, gardenDetail, isGardenDetailsLoading } =
    useGardenStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (authUser?._id) {
      getGardenDetails(id);
    }
  }, [authUser, getGardenDetails, id]);

  if (isGardenDetailsLoading) return <div>Loading gardens...</div>;
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
      {/* Header */}
      <div className=" bg-white border-b border-gray-200">
        <div className=" mx-auto px-6 py-8">
          <div className="flex items-center justify-between mt-3">
            <Link
              href={`/profile/gardens/${id}`}
              className="mr-5 text-gray-300 hover:text-green-500 transition-all duration-300 ease-in-out"
            >
              <ChevronLeft size={64} />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Nhật Ký</h1>
              <p className="flex items-center gap-2  mt-1 text-gray-700">
                {gardenDetail?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`${pathname}/diaries`}
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Notebook className="w-5 h-5" />
                Nhật Ký
              </Link>

              <Link
                href="/profile/gardens/create"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Pen className="w-5 h-5" />
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 bg-red-300"></div>
    </div>
  );
}

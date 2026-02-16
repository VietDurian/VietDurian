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
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useGardenStore } from "@/store/useGardenStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function ProfileGardenDetail() {
  const { id } = useParams();
  const {
    getGardenDetails,
    gardenDetail,
    isGardenDetailsLoading,
    deleteGarden,
    isGardenDeleting,
  } = useGardenStore();
  const { authUser } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (authUser?._id) {
      getGardenDetails(id);
    }
  }, [authUser, getGardenDetails, id]);

  if (isGardenDetailsLoading) return <div>Loading gardens...</div>;
  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Xác nhận xóa khu vườn
            </h2>
            <p className="text-gray-600 mb-4">
              Nhập tên khu vườn <b>{gardenDetail?.name}</b> để xác nhận xóa.
            </p>

            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Nhập tên khu vườn..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmName("");
                }}
                className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>

              <button
                disabled={
                  confirmName !== gardenDetail?.name || isGardenDeleting
                }
                onClick={async () => {
                  await deleteGarden(id);
                  router.push("/profile/gardens"); // go back after delete
                }}
                className={`cursor-pointer px-4 py-2 rounded-lg text-white ${
                  confirmName === gardenDetail?.name
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                {isGardenDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50/30">
        {/* Header */}
        <div className=" bg-white border-b border-gray-200">
          <div className=" mx-auto px-6 py-7">
            <div className="flex items-center justify-between mt-3">
              <Link
                href={"/profile/gardens"}
                className="mr-5 text-gray-300 hover:text-green-500 transition-all duration-300 ease-in-out"
              >
                <ChevronLeft size={64} />
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {gardenDetail?.name}
                </h1>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/profile/gardens/${id}/diaries`}
                  className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Notebook className="w-5 h-5" />
                  <p className="font-bold">Nhật Ký</p>
                </Link>

                <Link
                  href={`/profile/gardens/${id}/edit`}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Pen className="w-5 h-5" />
                  <p className="font-bold">Chỉnh sửa</p>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="cursor-pointer inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <Trash className="w-5 h-5" />
                  <p className="font-bold">Xóa</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-6 py-8 ">
          {/* Grid layout */}
          <div className="grid grid-cols-3 gap-5">
            {/* Crop Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-emerald-100 ">
                <Sprout className="text-emerald-600 " />
              </div>
              <p className="text-sm text-gray-600 mb-1">Loại cây</p>
              <p className="text-2xl font-bold text-gray-900">
                {gardenDetail?.crop_type}
              </p>
            </div>
            {/* Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-blue-100">
                <Ruler className="text-blue-600 " />
              </div>
              <p className="text-sm text-gray-600 mb-1">Tổng diện tích</p>
              <p className="text-2xl font-bold text-gray-900">
                {gardenDetail?.area} m²
              </p>
            </div>
            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-purple-100 ">
                <MapPin className="text-purple-600 " />
              </div>
              <p className="text-sm text-gray-600 mb-1">Vị trí</p>
              <p className="text-2xl font-bold text-gray-900">
                {gardenDetail?.location}
              </p>
            </div>
            {/* Image */}
            <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ">
              <p className="text-2xl font-bold text-gray-900 mb-3  pb-3">
                Ảnh vườn
              </p>
              <img src={gardenDetail?.image} className="w-full rounded-lg" />
            </div>
            {/* Description */}
            <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ">
              <p className="text-2xl font-bold text-gray-900 mb-3">
                Thông tin mô tả
              </p>
              <p className="text-md text-gray-700 leading-relaxed max-h-100 overflow-auto">
                {gardenDetail?.description}
              </p>
            </div>
            {/* Coordinates */}
            <div className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ">
              <p className="text-2xl font-bold text-gray-900 mb-3">Tọa độ</p>
              {/* Grid layout */}
              <div className="grid grid-cols-2 gap-5">
                {/* Latitude */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <p className="text-sm text-gray-600 mb-1">Vĩ độ</p>
                  <p className="text-xl font-bold text-gray-900">
                    {gardenDetail?.latitude}
                  </p>
                </div>
                {/* Longitude */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <p className="text-sm text-gray-600 mb-1">Kinh độ</p>
                  <p className="text-xl font-bold text-gray-900">
                    {gardenDetail?.longitude}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

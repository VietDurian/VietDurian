"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Sprout,
  Leaf,
  Package,
  Lock,
} from "lucide-react";
import { usePermissionStore } from "@/store/usePermissionStore";
import { useEffect } from "react";

export default function TraderHome() {
  const { isApprovedAccount, checkApprovedAccount } = usePermissionStore();

  useEffect(() => {
    checkApprovedAccount();
    console.log("ASDSADSAD", isApprovedAccount);
  }, [checkApprovedAccount]);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────── */}
      <div className="pt-20 pb-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-linear-to-br from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-3xl rotate-12"></div>
              <div className="absolute top-12 -right-4 w-44 h-44 bg-white/5 rounded-2xl rotate-6"></div>
              <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-white/10 rounded-3xl -rotate-12"></div>
              <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-white/5 rounded-xl rotate-45"></div>
            </div>

            <div className="relative z-10 px-8 md:px-16 pt-12 pb-10">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2.5 bg-white/25 backdrop-blur-sm px-5 py-2 rounded-xl text-white text-base font-medium border border-white/30 shadow-lg">
                  <Leaf className="w-5 h-5" />
                  <span>Dành cho Nông dân trồng sầu riêng</span>
                </div>
              </div>

              <div className="text-center mb-10">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow leading-tight">
                  Quản lý Vườn{" "}
                  <span className="text-yellow-300">Sầu Riêng</span>
                  <br />
                </h1>
                <p className="text-emerald-50 text-md max-w-3xl mx-auto">
                  Tạo vườn · Viết nhật ký · Đăng sản phẩm
                </p>
              </div>

              {/* Action cards */}
              <div className="relative">
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {/* Card 1 */}
                  <Link
                    href="/profile/gardens/create"
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div className="bg-linear-to-br from-emerald-500 to-emerald-700 p-5 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-xl rotate-12"></div>
                      <div className="relative flex items-start gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-md font-bold mb-1">
                            Bước 1
                          </div>
                          <h3 className="text-white font-bold text-xl leading-tight">
                            Tạo vườn
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-500 text-sm mb-4">
                        Đăng ký thông tin vườn sầu riêng: vị trí GPS, diện tích,
                        loại giống
                      </p>
                      <ul className="space-y-2 mb-5">
                        {[
                          "Thông tin vị trí GPS",
                          "Diện tích và giống cây",
                          "Mô tả vùng đất",
                        ].map((t) => (
                          <li
                            key={t}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm shadow-md shadow-emerald-500/30">
                        Tạo vườn ngay <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>

                  {/* Card 2 */}
                  <Link
                    href="/profile/gardens?diaryGuide=1"
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-xl rotate-12"></div>
                      <div className="relative flex items-start gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-md font-bold mb-1">
                            Bước 2
                          </div>
                          <h3 className="text-white font-bold text-xl leading-tight">
                            Viết nhật ký
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-500 text-sm mb-4">
                        Ghi chép chi tiết từng giai đoạn chăm sóc, phân bón,
                        thuốc BVTV
                      </p>
                      <ul className="space-y-2 mb-5">
                        {[
                          "8 giai đoạn canh tác",
                          "Ghi chi phí thực tế",
                          "Đính kèm hình ảnh",
                        ].map((t) => (
                          <li
                            key={t}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm shadow-md shadow-emerald-500/30">
                        Viết nhật ký <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>

                  {/* Card 3 */}
                  <Link
                    href="/profile/products/create"
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden group hover:-translate-y-1.5 transition-all duration-300"
                  >
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-xl rotate-12"></div>
                      <div className="relative flex items-start gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1 bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-md font-bold mb-1">
                            Bước 3
                          </div>
                          <h3 className="text-white font-bold text-xl leading-tight">
                            Đăng sản phẩm
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-500 text-sm mb-4">
                        Đăng lô sầu riêng sắp thu hoạch để thương lái liên hệ
                        mua
                      </p>
                      <ul className="space-y-2 mb-5">
                        {[
                          "Thời gian thu hoạch",
                          "Sản lượng ước tính",
                          "Giá bán mong muốn",
                        ].map((t) => (
                          <li
                            key={t}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                      <div
                        href="/profile/products"
                        className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors font-semibold text-sm shadow-md shadow-emerald-500/30"
                      >
                        Tạo sản phẩm <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </div>
                {/* Overlay khi chưa approved */}
                {!isApprovedAccount && (
                  <div className="absolute border border-white/50 inset-0 backdrop-blur-md bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 z-20">
                    <div className="p-5 bg-white rounded-xl shadow">
                      <Lock />
                    </div>
                    <p className="font-bold text-center">Cần xác thực CCCD</p>
                    <p className="text-md text-gray-600 text-center">
                      Xác thực căn cước công dân để mở khóa tính năng này
                    </p>
                    <Link
                      href="/submit-proof"
                      className="flex items-center gap-2 bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                      Xác thực ngay <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { ArrowUpDown, Check, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  getAllReportComment,
  updateReportComment,
  banReportComment,
} from "@/lib/api";
import { useLanguage } from "../context/LanguageContext";
import Image from "next/image";

export function ReportCommentPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await getAllReportComment(params);
      console.log("Fetched reports comment:", data);
      setReports(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Không thể lấy báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const filtered = [...reports].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
  });

  const formatDate = (v) => {
    if (!v) return "";
    const d = new Date(v);
    return d.toLocaleString("vi-VN", { hour12: false });
  };

  const handleUpdateStatus = async (
    id,
    status,
    { skipLoading = false } = {},
  ) => {
    if (!skipLoading) setActionLoading(id);
    try {
      const res = await updateReportComment(id, status);
      setReports((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status: res?.status || status } : r,
        ),
      );
      toast.success(
        t("report_status_updated") || "Cập nhật trạng thái thành công",
      );
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    } finally {
      if (!skipLoading) setActionLoading(null);
    }
  };

  const handleHideAndResolve = async (id) => {
    setActionLoading(id);
    try {
      // 1) update status to reviewed
      await handleUpdateStatus(id, "reviewed", { skipLoading: true });
      // 2) ban the comment
      await banReportComment(id);
      toast.success(
        t("hide_and_resolved_success") ||
          "Bình luận đã được ẩn và báo cáo đã được đánh dấu là đã xử lý",
      );
    } catch (error) {
      toast.error(error?.message || "Không thể ẩn bình luận");
    } finally {
      setActionLoading(null);
    }
  };

  // Render action for a report row (shows resolved label for reviewed reports)
  const renderAction = (r) => {
    const status = String(r.status || "").toLowerCase();
    if (status === "reviewed") {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-100">
          <Check className="w-4 h-4" />
          <span className="text-sm">{t("resolved") || "Đã xử lý"}</span>
        </div>
      );
    }

    return (
      <button
        onClick={() => handleHideAndResolve(r._id)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={actionLoading === r._id || status !== "pending"}
      >
        <EyeOff className="w-4 h-4" />
        <span className="text-sm">{t("hide") || "Ẩn"}</span>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1a4d2e] mb-2">
          {t("report_comment") || "Báo cáo bình luận"}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {t("manage_reports")}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col justify-end md:flex-row gap-4 items-center">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-3 py-2 rounded-lg border border-gray-200 bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="pending">{t("pending") || "Chờ xử lý"}</option>
              <option value="reviewed">{t("resolved") || "Đã xử lý"}</option>
            </select>
          </div>
          <div>
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Đổi thứ tự thời gian"
            >
              <ArrowUpDown
                className={`w-4 h-4 text-gray-600 ${sortOrder === "desc" ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* List / Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("reporter")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("reason")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("content")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    {t("no_reports")}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r._id}
                    className={`${r.status === "reviewed" ? "bg-green-50/30" : ""}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                          {r.avatar ? (
                            <Image
                              src={r.avatar}
                              alt={
                                r.reporter?.name ||
                                r.user_id?.full_name ||
                                "avatar"
                              }
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-[#1a4d2e]">
                              {r.reporter?.name.charAt(0) ||
                                r.user_id?.full_name.charAt(0) ||
                                "—"}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900">
                            {r.reporter?.name || r.user_id?.full_name || "—"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(r.created_at)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-gray-600">
                      {r.reason}
                    </td>
                    <td className="px-6 py-4 align-top text-sm text-gray-700">
                      {r.comment_id?.content}
                    </td>
                    <td className="px-6 py-4 align-top space-y-2">
                      {renderAction(r)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-4 text-center">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t("no_reports")}
            </div>
          ) : (
            <div className="space-y-3 p-3">
              {filtered.map((r) => (
                <div
                  key={r._id}
                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {r.reporter?.name || r.user_id?.full_name || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(r.created_at)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{r.reason}</div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    {r.comment_id?.content}
                  </div>
                  <div className="mt-3 flex gap-2">{renderAction(r)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

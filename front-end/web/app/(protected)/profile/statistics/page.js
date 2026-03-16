"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HƯỚNG DẪN TÍCH HỢP ZUSTAND
// ─────────────────────────────────────────────────────────────────────────────
// Bước 1: Xoá SAMPLE_GARDENS bên dưới
// Bước 2: Import store, ví dụ:
//   import { useSeasonStore } from "@/stores/seasonStore";
// Bước 3: Trong StatisticsPage, thay 2 dòng được comment thành:
//   const gardens       = useSeasonStore((state) => state.gardens);
//   const selectedId    = useSeasonStore((state) => state.selectedId);
//   const setSelectedId = useSeasonStore((state) => state.setSelectedId);
// ─────────────────────────────────────────────────────────────────────────────

// ── SAMPLE DATA ───────────────────────────────────────────────────────────────
const SAMPLE_GARDENS = [
  {
    diary: {
      id: "garden_001",
      garden_name: "Vườn Ri6 Cái Mơn",
      status: "In progressing",
      area: 5200,
      start_date: "2025-12-17T12:15:42.917Z",
      end_date: null,
    },
    overview: {
      total_cost: 22050000,
      total_revenue: 77100250,
      profit: 55050250,
      margin_percent: 71.4,
      cost_per_kg: 8256.88,
      yield_per_area: 0.51,
    },
    harvest: {
      total_harvest_kg: 2670.5,
      total_consumed_kg: 1150.75,
      unsold_weight_kg: 1519.75,
      consumed_rate_percent: 43.09,
    },
    cost_breakdown: {
      seed: {
        amount: 18000000,
        percent: 81.63,
        label: "Giống",
        color: "#059669",
      },
      fertilizer: {
        amount: 2850000,
        percent: 12.93,
        label: "Phân bón",
        color: "#34d399",
      },
      labor: {
        amount: 600000,
        percent: 2.72,
        label: "Nhân công",
        color: "#6ee7b7",
      },
      irrigation: {
        amount: 600000,
        percent: 2.72,
        label: "Tưới tiêu",
        color: "#a7f3d0",
      },
    },
  },
  {
    diary: {
      id: "garden_002",
      garden_name: "Vườn Musang King Bến Tre",
      status: "In progressing",
      area: 8100,
      start_date: "2025-10-05T08:00:00.000Z",
      end_date: null,
    },
    overview: {
      total_cost: 38500000,
      total_revenue: 124000000,
      profit: 85500000,
      margin_percent: 68.95,
      cost_per_kg: 9500,
      yield_per_area: 0.5,
    },
    harvest: {
      total_harvest_kg: 4050,
      total_consumed_kg: 2430,
      unsold_weight_kg: 1620,
      consumed_rate_percent: 60.0,
    },
    cost_breakdown: {
      seed: {
        amount: 28000000,
        percent: 72.73,
        label: "Giống",
        color: "#059669",
      },
      fertilizer: {
        amount: 6500000,
        percent: 16.88,
        label: "Phân bón",
        color: "#34d399",
      },
      labor: {
        amount: 2000000,
        percent: 5.19,
        label: "Nhân công",
        color: "#6ee7b7",
      },
      irrigation: {
        amount: 2000000,
        percent: 5.19,
        label: "Tưới tiêu",
        color: "#a7f3d0",
      },
    },
  },
  {
    diary: {
      id: "garden_003",
      garden_name: "Vườn Monthong Tiền Giang",
      status: "Completed",
      area: 3400,
      start_date: "2025-03-01T07:00:00.000Z",
      end_date: "2025-11-20T07:00:00.000Z",
    },
    overview: {
      total_cost: 15200000,
      total_revenue: 48750000,
      profit: 33550000,
      margin_percent: 68.82,
      cost_per_kg: 7200,
      yield_per_area: 0.62,
    },
    harvest: {
      total_harvest_kg: 2111,
      total_consumed_kg: 2111,
      unsold_weight_kg: 0,
      consumed_rate_percent: 100,
    },
    cost_breakdown: {
      seed: {
        amount: 9000000,
        percent: 59.21,
        label: "Giống",
        color: "#059669",
      },
      fertilizer: {
        amount: 4200000,
        percent: 27.63,
        label: "Phân bón",
        color: "#34d399",
      },
      labor: {
        amount: 1200000,
        percent: 7.89,
        label: "Nhân công",
        color: "#6ee7b7",
      },
      irrigation: {
        amount: 800000,
        percent: 5.26,
        label: "Tưới tiêu",
        color: "#a7f3d0",
      },
    },
  },
];

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
const fmtVND = (n) => fmt(n) + " ₫";
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : null;

// ── DONUT CHART ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 180 }) {
  const r = 70,
    cx = size / 2,
    cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let cumOffset = 0;
  const slices = segments.map((s) => {
    const dash = (s.percent / 100) * circumference;
    const slice = { ...s, dash, gap: circumference - dash, offset: cumOffset };
    cumOffset += dash;
    return slice;
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rotate-[-90deg]"
    >
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth="28"
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset}
        />
      ))}
      <circle cx={cx} cy={cy} r={56} fill="white" />
    </svg>
  );
}

// ── KPI CARD ──────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon,
  bgClass,
  iconColorClass,
  valueColorClass,
}) {
  return (
    <div className={`${bgClass} rounded-2xl p-4 space-y-2`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <svg
            className={`w-4 h-4 ${iconColorClass}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d={icon}
            />
          </svg>
        </div>
      </div>
      <p className={`text-lg font-bold ${valueColorClass} leading-tight`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 leading-snug">{sub}</p>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-5">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
        {eyebrow}
      </p>
      <h3 className="text-sm font-bold text-gray-800 mt-0.5">{title}</h3>
    </div>
  );
}

// ── GARDEN DROPDOWN ───────────────────────────────────────────────────────────
function GardenDropdown({ gardens, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);

  const statusLabel = (s) =>
    s === "In progressing" ? "Đang canh tác" : "Đã kết thúc";
  const statusStyle = (s) =>
    s === "In progressing"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-gray-100 text-gray-500";

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 group"
      >
        <h2 className="text-white text-xl font-bold leading-tight group-hover:text-emerald-100 transition-colors">
          {gardens.find((g) => g.diary.id === selectedId)?.diary.garden_name}
        </h2>
        <svg
          className={`w-5 h-5 text-emerald-200 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-emerald-900/20 py-2 z-50">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest px-4 pt-1 pb-2">
            Chọn khu vườn
          </p>

          {gardens.map((g) => {
            const isActive = g.diary.id === selectedId;
            return (
              <button
                key={g.diary.id}
                onClick={() => {
                  onSelect(g.diary.id);
                  setOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-50 ${isActive ? "bg-emerald-50" : ""}`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isActive ? "bg-emerald-600" : "bg-gray-100"}`}
                >
                  <svg
                    className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${isActive ? "text-emerald-800" : "text-gray-700"}`}
                  >
                    {g.diary.garden_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${statusStyle(g.diary.status)}`}
                    >
                      {statusLabel(g.diary.status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {fmt(g.diary.area)} m²
                    </span>
                  </div>
                </div>

                {/* Checkmark */}
                {isActive && (
                  <svg
                    className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function StatisticsPage() {
  // ── Thay 2 dòng này bằng Zustand store ─────────────────────────────────────
  const gardens = SAMPLE_GARDENS;
  const [selectedId, setSelectedId] = useState(SAMPLE_GARDENS[0].diary.id);
  // ───────────────────────────────────────────────────────────────────────────

  const stats = gardens.find((g) => g.diary.id === selectedId) ?? gardens[0];
  const { diary, overview, harvest, cost_breakdown } = stats;
  const breakdown = Object.values(cost_breakdown);

  // ── Derived data ────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Tổng chi phí",
      value: fmtVND(overview.total_cost),
      sub: `Giá vốn/kg: ${fmt(overview.cost_per_kg)} ₫`,
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
      bgClass: "bg-red-50",
      iconColorClass: "text-red-500",
      valueColorClass: "text-red-700",
    },
    {
      label: "Tổng doanh thu",
      value: fmtVND(overview.total_revenue),
      sub: `Biên lợi nhuận ${overview.margin_percent}%`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      bgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
      valueColorClass: "text-emerald-700",
    },
    {
      label: "Sản lượng thu hoạch",
      value: `${fmt(harvest.total_harvest_kg)} kg`,
      sub: `Năng suất ${overview.yield_per_area} kg/m²`,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      bgClass: "bg-yellow-50",
      iconColorClass: "text-yellow-600",
      valueColorClass: "text-yellow-700",
    },
    {
      label: "Đã tiêu thụ",
      value: `${fmt(harvest.total_consumed_kg)} kg`,
      sub: `Tỷ lệ ${harvest.consumed_rate_percent}% · Tồn ${fmt(harvest.unsold_weight_kg)} kg`,
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
      bgClass: "bg-blue-50",
      iconColorClass: "text-blue-500",
      valueColorClass: "text-blue-700",
    },
  ];

  const barData = [
    {
      label: "Chi phí",
      value: overview.total_cost,
      colorClass: "bg-red-400",
      text: fmtVND(overview.total_cost),
    },
    {
      label: "Doanh thu",
      value: overview.total_revenue,
      colorClass: "bg-emerald-500",
      text: fmtVND(overview.total_revenue),
    },
    {
      label: "Lợi nhuận",
      value: overview.profit,
      colorClass: "bg-teal-400",
      text: fmtVND(overview.profit),
    },
  ];

  const harvestBars = [
    {
      label: "Tổng thu hoạch",
      value: `${fmt(harvest.total_harvest_kg)} kg`,
      pct: 100,
      colorClass: "bg-gray-300",
    },
    {
      label: "Đã tiêu thụ",
      value: `${fmt(harvest.total_consumed_kg)} kg`,
      pct: harvest.consumed_rate_percent,
      colorClass: "bg-emerald-500",
    },
    {
      label: "Còn tồn kho",
      value: `${fmt(harvest.unsold_weight_kg)} kg`,
      pct: 100 - harvest.consumed_rate_percent,
      colorClass: "bg-amber-400",
    },
  ];

  return (
    <div className="space-y-6 p-5">
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-2xl px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Status pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {diary.status === "In progressing"
                ? "Đang canh tác"
                : "Đã kết thúc"}
            </span>
          </div>

          {/* Garden name — acts as dropdown trigger */}
          <GardenDropdown
            gardens={gardens}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          {/* Meta */}
          <p className="text-emerald-100 text-sm mt-2">
            Bắt đầu {fmtDate(diary.start_date)}
            {fmtDate(diary.end_date)
              ? ` · Kết thúc ${fmtDate(diary.end_date)}`
              : ""}{" "}
            · Diện tích {fmt(diary.area)} m²
          </p>
        </div>

        {/* Quick-glance cards */}
        <div className="flex gap-3 flex-wrap">
          {[
            {
              label: "Doanh thu",
              value: fmtVND(overview.total_revenue),
              sub: "tổng cộng",
            },
            {
              label: "Lợi nhuận",
              value: fmtVND(overview.profit),
              sub: `biên ${overview.margin_percent}%`,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-right min-w-[140px]"
            >
              <p className="text-emerald-100 text-xs">{c.label}</p>
              <p className="text-white font-bold text-base mt-0.5">{c.value}</p>
              <p className="text-emerald-200 text-xs mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut — cost breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader
            eyebrow="Phân tích chi phí"
            title="Cơ cấu chi phí sản xuất"
          />
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <DonutChart segments={breakdown} size={180} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-400">Tổng</p>
                <p className="text-sm font-bold text-gray-700">
                  {fmt(overview.total_cost / 1_000_000)}tr ₫
                </p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-700">
                        {item.percent}%
                      </span>
                      <span className="text-xs text-gray-400 ml-1.5">
                        {fmt(item.amount / 1_000_000)}tr
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percent}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Arc gauge — harvest rate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionHeader
            eyebrow="Thu hoạch & tiêu thụ"
            title="Tình hình sản lượng"
          />
          <div className="flex justify-center mb-5">
            <svg width="200" height="115" viewBox="0 0 200 115">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#059669"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(Math.min(harvest.consumed_rate_percent, 100) / 100) * 251.2} 251.2`}
              />
              <text
                x="100"
                y="90"
                textAnchor="middle"
                style={{ fontSize: 24, fontWeight: 700, fill: "#065f46" }}
              >
                {harvest.consumed_rate_percent}%
              </text>
              <text
                x="100"
                y="110"
                textAnchor="middle"
                style={{ fontSize: 10, fill: "#9ca3af" }}
              >
                đã tiêu thụ
              </text>
            </svg>
          </div>
          <div className="space-y-4">
            {harvestBars.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {row.value}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.colorClass}`}
                    style={{ width: `${Math.min(row.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart — full width */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <SectionHeader
            eyebrow="Tài chính tổng quan"
            title="So sánh doanh thu — chi phí — lợi nhuận"
          />
          <div className="flex items-end gap-6" style={{ height: 176 }}>
            {barData.map((bar) => (
              <div
                key={bar.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <p className="text-xs font-bold text-gray-700 text-center">
                  {bar.text}
                </p>
                <div className="w-full flex items-end" style={{ height: 100 }}>
                  <div
                    className={`w-full rounded-t-xl ${bar.colorClass}`}
                    style={{
                      height: `${(bar.value / overview.total_revenue) * 100}%`,
                      minHeight: 8,
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-sm ${bar.colorClass}`} />
                  <span className="text-xs text-gray-500">{bar.label}</span>
                </div>
              </div>
            ))}
            <div className="flex-1 flex flex-col justify-center gap-3 pl-5 border-l border-gray-100">
              {[
                {
                  label: "Giá vốn/kg",
                  value: `${fmt(overview.cost_per_kg)} ₫/kg`,
                },
                {
                  label: "Năng suất",
                  value: `${overview.yield_per_area} kg/m²`,
                },
                {
                  label: "Biên lợi nhuận",
                  value: `${overview.margin_percent}%`,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex justify-between items-center gap-3"
                >
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {m.label}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

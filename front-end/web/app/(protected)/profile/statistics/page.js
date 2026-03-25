"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSeasonDiaryStore } from "@/store/useSeasonDiaryStore";
import { useLanguage } from "@/context/LanguageContext";

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n));
const fmtVND = (n) => fmt(n) + " ₫";
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : null;

const EMPTY_OVERVIEW = {
  total_cost: 0,
  total_revenue: 0,
  profit: 0,
  margin_percent: 0,
  cost_per_kg: 0,
  yield_per_area: 0,
};

const EMPTY_HARVEST = {
  total_harvest_kg: 0,
  total_consumed_kg: 0,
  unsold_weight_kg: 0,
  consumed_rate_percent: 0,
};

// ── DONUT CHART ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 180 }) {
  const r = 70,
    cx = size / 2,
    cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const slices = segments.reduce((acc, s) => {
    const dash = (s.percent / 100) * circumference;
    const offset =
      acc.length > 0
        ? acc[acc.length - 1].offset + acc[acc.length - 1].dash
        : 0;
    acc.push({ ...s, dash, gap: circumference - dash, offset });
    return acc;
  }, []);

  return (
    // ← cái này bị mất
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
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
} // ← cái này cũng bị mất

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
function GardenDropdown({ gardens, selectedId, onSelect, t }) {
  const [open, setOpen] = useState(false);

  const statusLabel = (s) =>
    s === "In progressing"
      ? t("stats_status_inprogress")
      : t("stats_status_ended");
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
          {gardens.find((g) => g.diary.id === selectedId)?.diary.garden_name ||
            t("stats_dropdown_label")}
        </h2>
        <svg
          className={`w-5 h-5 text-emerald-200 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
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
            {t("stats_dropdown_label")}
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
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isActive ? "bg-emerald-600" : "bg-gray-100"}`}
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
                      {fmt(g.diary.area)} {t("stats_area_unit")}
                    </span>
                  </div>
                </div>

                {/* Checkmark */}
                {isActive && (
                  <svg
                    className="w-4 h-4 text-emerald-500 shrink-0 mt-1.5"
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
  const { t } = useLanguage();
  const { authUser } = useAuthStore();
  const {
    seasonDiaries,
    seasonDiaryStatistics,
    isSeasonDiariesLoading,
    isStatisticsLoading,
    getSeasonDiaries,
    getSeasonDiaryStatistics,
  } = useSeasonDiaryStore();

  const [selectedId, setSelectedId] = useState(null);

  // COST_BREAKDOWN_META dùng t() nên đặt trong component
  const COST_BREAKDOWN_META = {
    seed: { label: t("stats_cost_seed"), color: "#059669" },
    fertilizer: { label: t("stats_cost_fertilizer"), color: "#34d399" },
    labor: { label: t("stats_cost_labor"), color: "#6ee7b7" },
    irrigation: { label: t("stats_cost_irrigation"), color: "#a7f3d0" },
  };

  useEffect(() => {
    if (authUser?._id) {
      getSeasonDiaries(authUser._id);
    }
  }, [authUser?._id, getSeasonDiaries]);

  const gardens = useMemo(
    () =>
      seasonDiaries.map((d) => ({
        diary: {
          id: d._id,
          garden_name: d.garden_name,
          status: d.status,
          area: Number(d.area) || 0,
          start_date: d.created_at || null,
          end_date: d.end_date || null,
        },
      })),
    [seasonDiaries],
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!gardens.length) {
        if (!cancelled) setSelectedId(null);
        return;
      }
      if (!cancelled) {
        setSelectedId((prev) => {
          if (prev && gardens.some((g) => g.diary.id === prev)) return prev;
          return gardens[0].diary.id;
        });
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [gardens]);

  useEffect(() => {
    if (selectedId) {
      getSeasonDiaryStatistics(selectedId);
    }
  }, [selectedId, getSeasonDiaryStatistics]);

  const selectedGarden =
    gardens.find((g) => g.diary.id === selectedId) ?? gardens[0] ?? null;

  const stats =
    seasonDiaryStatistics?.diary &&
    String(seasonDiaryStatistics.diary.id) === String(selectedId)
      ? seasonDiaryStatistics
      : null;

  const diary = stats?.diary ?? selectedGarden?.diary ?? {};
  const overview = stats?.overview ?? EMPTY_OVERVIEW;
  const harvest = stats?.harvest ?? EMPTY_HARVEST;
  const breakdown = Object.entries(stats?.cost_breakdown || {}).map(
    ([key, value]) => ({
      amount: value?.amount || 0,
      percent: value?.percent || 0,
      label: COST_BREAKDOWN_META[key]?.label || key,
      color: COST_BREAKDOWN_META[key]?.color || "#d1d5db",
    }),
  );

  if (isSeasonDiariesLoading && !gardens.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
          {t("stats_loading")}
        </div>
      </div>
    );
  }

  if (!isSeasonDiariesLoading && !gardens.length) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm text-gray-500">{t("stats_empty")}</p>
      </div>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: t("stats_kpi_total_cost"),
      value: fmtVND(overview.total_cost),
      sub: `${t("stats_kpi_cost_per_kg")} ${fmt(overview.cost_per_kg)} ₫`,
      icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
      bgClass: "bg-red-50",
      iconColorClass: "text-red-500",
      valueColorClass: "text-red-700",
    },
    {
      label: t("stats_kpi_revenue"),
      value: fmtVND(overview.total_revenue),
      sub: `${t("stats_kpi_margin")} ${overview.margin_percent}%`,
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      bgClass: "bg-emerald-50",
      iconColorClass: "text-emerald-600",
      valueColorClass: "text-emerald-700",
    },
    {
      label: t("stats_kpi_harvest"),
      value: `${fmt(harvest.total_harvest_kg)} kg`,
      sub: `${t("stats_kpi_yield")} ${overview.yield_per_area} kg/m²`,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      bgClass: "bg-yellow-50",
      iconColorClass: "text-yellow-600",
      valueColorClass: "text-yellow-700",
    },
    {
      label: t("stats_kpi_consumed"),
      value: `${fmt(harvest.total_consumed_kg)} kg`,
      sub: `${t("stats_kpi_consumed_rate")} ${harvest.consumed_rate_percent}% · ${t("stats_kpi_stock")} ${fmt(harvest.unsold_weight_kg)} kg`,
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
      bgClass: "bg-blue-50",
      iconColorClass: "text-blue-500",
      valueColorClass: "text-blue-700",
    },
  ];

  const barData = [
    {
      label: t("stats_bar_cost"),
      value: overview.total_cost,
      colorClass: "bg-red-400",
      text: fmtVND(overview.total_cost),
    },
    {
      label: t("stats_bar_revenue"),
      value: overview.total_revenue,
      colorClass: "bg-emerald-500",
      text: fmtVND(overview.total_revenue),
    },
    {
      label: t("stats_bar_profit"),
      value: overview.profit,
      colorClass: "bg-teal-400",
      text: fmtVND(overview.profit),
    },
  ];

  const harvestBars = [
    {
      label: t("stats_bar_total_harvest"),
      value: `${fmt(harvest.total_harvest_kg)} kg`,
      pct: 100,
      colorClass: "bg-gray-300",
    },
    {
      label: t("stats_bar_consumed"),
      value: `${fmt(harvest.total_consumed_kg)} kg`,
      pct: harvest.consumed_rate_percent,
      colorClass: "bg-emerald-500",
    },
    {
      label: t("stats_bar_stock"),
      value: `${fmt(harvest.unsold_weight_kg)} kg`,
      pct: 100 - harvest.consumed_rate_percent,
      colorClass: "bg-amber-400",
    },
  ];

  return (
    <div className="space-y-6 p-5">
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-r from-emerald-700 to-emerald-500 rounded-2xl px-6 py-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Status pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {diary.status === "In progressing"
                ? t("stats_status_inprogress")
                : t("stats_status_ended")}
            </span>
          </div>

          {/* Garden name — acts as dropdown trigger */}
          <GardenDropdown
            gardens={gardens}
            selectedId={selectedId}
            onSelect={setSelectedId}
            t={t}
          />

          {/* Meta */}
          <p className="text-emerald-100 text-sm mt-2">
            {t("stats_start")} {fmtDate(diary.start_date)}
            {fmtDate(diary.end_date)
              ? ` · ${t("stats_end")} ${fmtDate(diary.end_date)}`
              : ""}{" "}
            · {fmt(diary.area)} {t("stats_area_unit")}
          </p>
        </div>

        {/* Quick-glance cards */}
        <div className="flex gap-3 flex-wrap">
          {[
            {
              label: t("stats_revenue_label"),
              value: fmtVND(overview.total_revenue),
              sub: t("stats_revenue_sub"),
            },
            {
              label: t("stats_profit_label"),
              value: fmtVND(overview.profit),
              sub: `${t("stats_profit_sub")} ${overview.margin_percent}%`,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-right min-w-35"
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
            eyebrow={t("stats_cost_breakdown_eyebrow")}
            title={t("stats_cost_breakdown_title")}
          />
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <DonutChart segments={breakdown} size={180} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-gray-400">{t("stats_cost_total")}</p>
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
                        className="w-2.5 h-2.5 rounded-full shrink-0"
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
            eyebrow={t("stats_harvest_eyebrow")}
            title={t("stats_harvest_title")}
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
                {t("stats_harvest_consumed_arc")}
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
            eyebrow={t("stats_finance_eyebrow")}
            title={t("stats_finance_title")}
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
                      height: `${overview.total_revenue > 0 ? (bar.value / overview.total_revenue) * 100 : 0}%`,
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
                  label: t("stats_metric_cost_per_kg"),
                  value: `${fmt(overview.cost_per_kg)} ₫/kg`,
                },
                {
                  label: t("stats_metric_yield"),
                  value: `${overview.yield_per_area} kg/m²`,
                },
                {
                  label: t("stats_metric_margin"),
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
              {isStatisticsLoading && (
                <p className="text-xs text-gray-400">{t("stats_updating")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

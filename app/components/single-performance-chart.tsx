"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SingleRow = {
  practiceName: string;
  providerName: string;
  qualityMeasureId: string;
  performanceRate: number;
};

type SinglePerformanceTab = "performance" | "comparison";

type SinglePerformanceChartProps = {
  onTabChange?: (tab: SinglePerformanceTab) => void;
};

const COLORS: [string, string][] = [
  ["#60a5fa", "#2563eb"],
  ["#fbbf24", "#ea580c"],
  ["#4ade80", "#16a34a"],
  ["#a78bfa", "#7c3aed"],
  ["#f472b6", "#db2777"],
  ["#22d3ee", "#0891b2"],
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path d="M10 14l-2 2a3 3 0 104 4l2-2M14 10l2-2a3 3 0 10-4-4L10 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconCycleArrows() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path d="M6 9a7 7 0 0111-2l1-2v6h-6l2-2A5 5 0 007 10M18 15a7 7 0 01-11 2l-1 2v-6h6l-2 2a5 5 0 007-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path d="M12 3v18M15.5 7.5c0-1.6-1.5-2.5-3.5-2.5S8.5 6 8.5 7.5 10 9.8 12 10.3s3.5 1.3 3.5 3.2-1.5 2.9-3.5 2.9-3.5-1-3.5-2.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SinglePerformanceChart({ onTabChange }: SinglePerformanceChartProps) {
  const [rows, setRows] = useState<SingleRow[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<SinglePerformanceTab>("performance");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/single-performance")
      .then(async (res) => {
        const body = (await res.json()) as { rows?: SingleRow[] };
        return body.rows ?? [];
      })
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setSelectedProviders((prev) =>
          prev.length > 0 ? prev : Array.from(new Set(data.map((r) => r.providerName))).slice(0, 3),
        );
        setSelectedMeasureIds((prev) =>
          prev.length > 0
            ? prev
            : Array.from(new Set(data.map((r) => r.qualityMeasureId))).slice(0, 4),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  const practice = rows[0]?.practiceName ?? "Spokane Valley ENT";
  const providers = useMemo(
    () => Array.from(new Set(rows.map((r) => r.providerName))),
    [rows],
  );
  const measures = useMemo(
    () => Array.from(new Set(rows.map((r) => r.qualityMeasureId))),
    [rows],
  );

  const chartData = useMemo(() => {
    return selectedMeasureIds.map((measureId) => {
      const point: Record<string, string | number> = { measureId };
      for (const providerName of selectedProviders) {
        const row = rows.find(
          (r) => r.providerName === providerName && r.qualityMeasureId === measureId,
        );
        point[providerName] = row?.performanceRate ?? 0;
      }
      return point;
    });
  }, [rows, selectedMeasureIds, selectedProviders]);

  const comparisonData = useMemo(() => {
    const selectedRows = rows.filter(
      (r) =>
        selectedProviders.includes(r.providerName) &&
        selectedMeasureIds.includes(r.qualityMeasureId),
    );
    const baseline =
      selectedRows.length > 0
        ? selectedRows.reduce((sum, r) => sum + r.performanceRate, 0) / selectedRows.length
        : 70;
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    return MONTHS.map((month, idx) => {
      const progress = idx / (MONTHS.length - 1);
      const target = Math.max(55, Math.min(95, baseline));
      const acceleration = Math.pow(progress, 0.72);
      const seasonal = Math.sin((idx / 12) * Math.PI * 2) * 2.2;
      const currentYear = clamp(target * acceleration + seasonal);
      const previousYear = clamp(currentYear - (5 - progress * 1.5) + ((idx % 3) - 1) * 1.1);
      return {
        month,
        currentYear: Number(currentYear.toFixed(2)),
        previousYear: Number(previousYear.toFixed(2)),
      };
    });
  }, [rows, selectedProviders, selectedMeasureIds]);

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-sky-100 bg-white/85 p-5 shadow-2xl shadow-sky-100/60 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-sky-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-4 h-44 w-44 rounded-full bg-fuchsia-200/40 blur-3xl" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Single Data Performance (Provider by Measure)
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Practice: {practice}
          </p>
        </div>
        <div className="inline-flex self-end rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
          <button
            type="button"
            onClick={() => setActiveTab("performance")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "performance"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Performance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comparison")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "comparison"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Comparison
          </button>
        </div>
      </div>

      {activeTab === "performance" && (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Practice Name
              <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800" value={practice} disabled>
                <option>{practice}</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Provider Name (Multi Select)
              <select
                className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                value={selectedProviders}
                multiple
                onChange={(e) =>
                  setSelectedProviders(
                    Array.from(e.currentTarget.selectedOptions).map((x) => x.value),
                  )
                }
              >
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Quality Measure IDs (Multi Select)
              <select
                className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                value={selectedMeasureIds}
                multiple
                onChange={(e) =>
                  setSelectedMeasureIds(
                    Array.from(e.currentTarget.selectedOptions).map((x) => x.value),
                  )
                }
              >
                {measures.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 pb-2">
            <div className="flex flex-wrap items-stretch justify-center gap-3">
              <div className="min-w-[12rem] rounded-xl bg-gradient-to-br from-[#1e5bb8] to-[#2563eb] px-4 py-4 text-white shadow-lg">
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm">
                  <IconStar />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Quality</p>
                <p className="mt-2 text-2xl font-bold">30%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </div>
              <div className="min-w-[12rem] rounded-xl bg-gradient-to-br from-[#d97706] to-[#ea580c] px-4 py-4 text-white shadow-lg">
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm">
                  <IconLink />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Promoting Interoperability</p>
                <p className="mt-2 text-2xl font-bold">25%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </div>
              <div className="min-w-[12rem] rounded-xl bg-gradient-to-br from-[#0d9488] to-[#0f766e] px-4 py-4 text-white shadow-lg">
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm">
                  <IconCycleArrows />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Improvement Activity</p>
                <p className="mt-2 text-2xl font-bold">15%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </div>
              <div className="min-w-[12rem] rounded-xl bg-gradient-to-br from-[#64748b] to-[#475569] px-4 py-4 text-white shadow-lg">
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm">
                  <IconDollar />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Cost</p>
                <p className="mt-2 text-2xl font-bold">30%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "performance" ? (
        <div className="mt-4 h-[380px] w-full rounded-2xl border border-sky-200/80 bg-gradient-to-b from-white via-sky-50/60 to-sky-100/40 p-4 shadow-[0_18px_40px_rgba(14,165,233,0.18)] ring-1 ring-white/80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 16, right: 8, left: 0, bottom: 10 }}
              barCategoryGap="28%"
              barGap={6}
            >
              <defs>
                {selectedProviders.map((_, idx) => (
                  <linearGradient key={`g-${idx}`} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[idx % COLORS.length][0]} />
                    <stop offset="100%" stopColor={COLORS[idx % COLORS.length][1]} />
                  </linearGradient>
                ))}
                <filter id="barShadow" x="-30%" y="-30%" width="160%" height="180%">
                  <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.25" floodColor="#334155" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="measureId" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                formatter={(value) => {
                  const parsed = typeof value === "number" ? value : Number(value);
                  if (!Number.isFinite(parsed)) return "";
                  return `${Number.isInteger(parsed) ? parsed : parsed.toFixed(2)}%`;
                }}
              />
              <Legend />
              {selectedProviders.map((providerName, idx) => (
                <Bar
                  key={providerName}
                  dataKey={providerName}
                  name={providerName}
                  fill={`url(#barGrad-${idx})`}
                  radius={[6, 6, 0, 0]}
                  barSize={selectedProviders.length > 3 ? 20 : 30}
                  filter="url(#barShadow)"
                  animationBegin={idx * 120}
                  animationDuration={850}
                  animationEasing="ease-out"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 h-[380px] w-full rounded-2xl border border-sky-200/80 bg-gradient-to-b from-white via-sky-50/60 to-sky-100/40 p-4 shadow-[0_18px_40px_rgba(14,165,233,0.18)] ring-1 ring-white/80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 14, right: 14, left: 6, bottom: 10 }}>
              <defs>
                <linearGradient id="currentLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="previousLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="month" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: 12, color: "#0f172a" }}
                formatter={(value, name) => {
                  const parsed = typeof value === "number" ? value : Number(value);
                  if (!Number.isFinite(parsed)) return ["", name];
                  return [`${Number.isInteger(parsed) ? parsed : parsed.toFixed(2)}%`, name];
                }}
              />
              <Legend
                layout="vertical"
                align="left"
                verticalAlign="top"
                wrapperStyle={{ color: "#0f172a", paddingTop: 2 }}
              />
              <Line
                type="monotone"
                dataKey="currentYear"
                name="Current Year"
                stroke="url(#currentLine)"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: "#22d3ee", stroke: "#0e7490" }}
                activeDot={{ r: 6 }}
                animationDuration={950}
              />
              <Line
                type="monotone"
                dataKey="previousYear"
                name="Previous Year"
                stroke="url(#previousLine)"
                strokeWidth={4}
                dot={{ r: 4, strokeWidth: 2, fill: "#fb923c", stroke: "#c2410c" }}
                activeDot={{ r: 6 }}
                animationDuration={950}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

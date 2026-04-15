"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import { PI_PERFORMANCE_ROWS } from "@/lib/pi-performance-data";
import { IA_PERFORMANCE_ROWS } from "@/lib/ia-performance-data";

type SingleRow = {
  practiceName: string;
  providerName: string;
  qualityMeasureId: string;
  performanceRate: number;
  groupMeasureId?: string;
};

type SinglePerformanceTab = "performance" | "comparison";
type ScoreCategory = "quality" | "pi" | "ia" | "cost";
type TrendYear = "2024" | "2025" | "2026";

type SinglePerformanceChartProps = {
  onTabChange?: (tab: SinglePerformanceTab) => void;
  onCategoryChange?: (category: ScoreCategory) => void;
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
const COST_ROWS: SingleRow[] = [
  { practiceName: "Spokane Valley ENT", providerName: "Eric Leavitt", qualityMeasureId: "Cost Measure A", performanceRate: 0 },
  { practiceName: "Spokane Valley ENT", providerName: "Geoffrey Julian", qualityMeasureId: "Cost Measure B", performanceRate: 0 },
  { practiceName: "Spokane Valley ENT", providerName: "Jeffrey Falco", qualityMeasureId: "Cost Measure C", performanceRate: 0 },
];
const BLANK_COST_COMPARISON_DATA = MONTHS.map((month) => ({
  month,
  y2024: null,
  y2025: null,
  y2026: null,
}));

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden>
      <path d="M12 3l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9L12 3z" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden>
      <path d="M10 14l-2 2a3 3 0 104 4l2-2M14 10l2-2a3 3 0 10-4-4L10 6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function IconCycleArrows() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden>
      <path d="M6 9a7 7 0 0111-2l1-2v6h-6l2-2A5 5 0 007 10M18 15a7 7 0 01-11 2l-1 2v-6h6l-2 2a5 5 0 007-1" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden>
      <path d="M12 3v18M15.5 7.5c0-1.6-1.5-2.5-3.5-2.5S8.5 6 8.5 7.5 10 9.8 12 10.3s3.5 1.3 3.5 3.2-1.5 2.9-3.5 2.9-3.5-1-3.5-2.9" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

export function SinglePerformanceChart({ onTabChange, onCategoryChange }: SinglePerformanceChartProps) {
  const [rows, setRows] = useState<SingleRow[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>([]);
  const [selectedPiQualityMeasures, setSelectedPiQualityMeasures] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<SinglePerformanceTab>("performance");
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory>("quality");
  const [highlightedYear, setHighlightedYear] = useState<TrendYear | null>(null);

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

  useEffect(() => {
    onCategoryChange?.(selectedCategory);
  }, [selectedCategory, onCategoryChange]);

  const activeRows = useMemo<SingleRow[]>(() => {
    if (selectedCategory === "pi") {
      return PI_PERFORMANCE_ROWS.map((row) => ({
        practiceName: row.practiceName,
        providerName: row.providerName,
        qualityMeasureId: row.objectiveName,
        performanceRate: row.performanceRate,
        groupMeasureId: row.qualityMeasureId,
      }));
    }
    if (selectedCategory === "ia") {
      return IA_PERFORMANCE_ROWS.map((row) => ({
        practiceName: row.practiceName,
        providerName: row.providerName,
        qualityMeasureId: row.activityId,
        performanceRate: row.performanceRate,
      }));
    }
    if (selectedCategory === "cost") {
      return COST_ROWS;
    }
    return rows;
  }, [rows, selectedCategory]);

  const practice = activeRows[0]?.practiceName ?? "Spokane Valley ENT";
  const providers = useMemo(
    () => Array.from(new Set(activeRows.map((r) => r.providerName))),
    [activeRows],
  );
  const measures = useMemo(
    () => Array.from(new Set(activeRows.map((r) => r.qualityMeasureId))),
    [activeRows],
  );
  const piQualityMeasures = useMemo(
    () => Array.from(new Set(activeRows.map((r) => r.groupMeasureId).filter(Boolean) as string[])),
    [activeRows],
  );

  useEffect(() => {
    setSelectedProviders(providers.slice(0, 3));
    setSelectedMeasureIds(measures.slice(0, 4));
    setSelectedPiQualityMeasures(piQualityMeasures);
  }, [selectedCategory, providers, measures, piQualityMeasures]);

  const filteredRows = useMemo(() => {
    if (selectedCategory !== "pi") return activeRows;
    if (selectedPiQualityMeasures.length === 0) return [];
    return activeRows.filter((row) =>
      row.groupMeasureId ? selectedPiQualityMeasures.includes(row.groupMeasureId) : false,
    );
  }, [activeRows, selectedCategory, selectedPiQualityMeasures]);

  const chartData = useMemo(() => {
    return selectedMeasureIds.map((measureId) => {
      const point: Record<string, string | number> = { measureId };
      for (const providerName of selectedProviders) {
        const row = filteredRows.find(
          (r) => r.providerName === providerName && r.qualityMeasureId === measureId,
        );
        point[providerName] = row?.performanceRate ?? 0;
      }
      return point;
    });
  }, [filteredRows, selectedMeasureIds, selectedProviders]);

  const comparisonData = useMemo(() => {
    const selectedRows = filteredRows.filter(
      (r) =>
        selectedProviders.includes(r.providerName) &&
        selectedMeasureIds.includes(r.qualityMeasureId),
    );
    const baseline =
      selectedRows.length > 0
        ? selectedRows.reduce((sum, r) => sum + r.performanceRate, 0) / selectedRows.length
        : 70;
    const clamp = (value: number) => Math.max(0, Math.min(100, value));
    const currentMonthIndex = new Date().getMonth();
    const categoryTuning =
      selectedCategory === "quality"
        ? { base: baseline * 0.58, growth2024: 4.1, lift2025: 4.2, lift2026: 3.4 }
        : selectedCategory === "pi"
          ? { base: baseline * 0.52, growth2024: 3.9, lift2025: 3.5, lift2026: 2.7 }
          : selectedCategory === "ia"
            ? { base: baseline * 0.49, growth2024: 4.4, lift2025: 3.1, lift2026: 2.2 }
            : { base: 24, growth2024: 2.4, lift2025: 2.7, lift2026: 1.8 };
    return MONTHS.map((month, idx) => {
      const seasonal = Math.sin((idx / 12) * Math.PI * 2) * 1.6;
      const y2024 = clamp(
        categoryTuning.base +
          idx * categoryTuning.growth2024 +
          seasonal +
          ((idx % 3) - 1) * 1.0,
      );
      const y2025 = clamp(
        y2024 +
          categoryTuning.lift2025 +
          Math.cos((idx / 12) * Math.PI * 2) * 0.8,
      );
      const y2026 = idx <= currentMonthIndex
        ? clamp(y2025 + categoryTuning.lift2026 + ((idx % 2) === 0 ? 0.6 : -0.4))
        : null;
      return {
        month,
        y2024: Number(y2024.toFixed(2)),
        y2025: Number(y2025.toFixed(2)),
        y2026: y2026 === null ? null : Number(y2026.toFixed(2)),
      };
    });
  }, [filteredRows, selectedProviders, selectedMeasureIds, selectedCategory]);

  const overallScore = useMemo(() => {
    const selectedRows = filteredRows.filter(
      (r) =>
        selectedProviders.includes(r.providerName) &&
        selectedMeasureIds.includes(r.qualityMeasureId),
    );
    if (selectedRows.length === 0) return 0;
    return selectedRows.reduce((sum, r) => sum + r.performanceRate, 0) / selectedRows.length;
  }, [filteredRows, selectedProviders, selectedMeasureIds]);
  const isCategoryReady =
    selectedCategory === "quality" ||
    selectedCategory === "pi" ||
    selectedCategory === "ia" ||
    selectedCategory === "cost";
  const isCostSelected = selectedCategory === "cost";

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-sky-100 bg-white/85 p-5 shadow-2xl shadow-sky-100/60 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full bg-sky-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-4 h-44 w-44 rounded-full bg-fuchsia-200/40 blur-3xl" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {selectedCategory === "quality"
              ? "Single Data Performance (Provider by Measure)"
              : selectedCategory === "pi"
                ? "Promoting Interoperability Performance"
                : selectedCategory === "ia"
                  ? "Improvement Activity Performance"
                : "Category Performance"}
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

      <div className="mt-4 pb-2">
            <div className="flex flex-nowrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("quality")}
                className={`w-[10.1rem] cursor-pointer rounded-2xl border-2 border-white/25 bg-gradient-to-br from-[#1e5bb8] to-[#2563eb] px-4 py-4 text-left text-white shadow-[0_10px_22px_rgba(37,99,235,0.42)] transition ${selectedCategory === "quality" ? "scale-[1.03] border-white outline outline-4 outline-cyan-200/90 ring-4 ring-white/55 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.65),0_0_0_2px_rgba(14,165,233,0.5),0_14px_24px_rgba(37,99,235,0.55)]" : "opacity-90 hover:scale-[1.01] hover:border-white/50 hover:opacity-100"}`}
              >
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/30 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Image src="/Quality.png" alt="Quality icon" width={34} height={34} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Quality</p>
                <p className="mt-2 text-base font-bold">15.00% of 30%</p>
                <p className="mt-1 text-xs text-white/90">Category score</p>
              </button>
              <span className="px-0.5 text-2xl font-black text-slate-500">+</span>
              <button
                type="button"
                onClick={() => setSelectedCategory("pi")}
                className={`w-[10.1rem] cursor-pointer rounded-2xl border-2 border-white/25 bg-gradient-to-b from-[#f3a1d2] to-[#df4fa2] px-4 py-4 text-left text-white shadow-[0_10px_20px_rgba(223,79,162,0.26)] transition ${selectedCategory === "pi" ? "scale-[1.03] border-white outline outline-4 outline-fuchsia-200/90 ring-4 ring-white/55 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.65),0_0_0_2px_rgba(236,153,210,0.35),0_14px_24px_rgba(223,79,162,0.35)]" : "opacity-90 hover:scale-[1.01] hover:border-white/50 hover:opacity-100"}`}
              >
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/30 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Image src="/promoting-interoperability.png" alt="PI icon" width={34} height={34} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Promoting Interoperability</p>
                <p className="mt-2 text-base font-bold">25% of 25%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </button>
              <span className="px-0.5 text-2xl font-black text-slate-500">+</span>
              <button
                type="button"
                onClick={() => setSelectedCategory("ia")}
                className={`w-[10.1rem] cursor-pointer rounded-2xl border-2 border-white/25 bg-gradient-to-br from-[#0d9488] to-[#0f766e] px-4 py-4 text-left text-white shadow-[0_10px_22px_rgba(15,118,110,0.42)] transition ${selectedCategory === "ia" ? "scale-[1.03] border-white outline outline-4 outline-teal-200/90 ring-4 ring-white/55 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.65),0_0_0_2px_rgba(20,184,166,0.5),0_14px_24px_rgba(15,118,110,0.55)]" : "opacity-90 hover:scale-[1.01] hover:border-white/50 hover:opacity-100"}`}
              >
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/30 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Image src="/Improvment-Activity-ICon.png" alt="IA icon" width={34} height={34} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Improvement Activity</p>
                <p className="mt-2 text-base font-bold">15.00% of 15%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </button>
              <span className="px-0.5 text-2xl font-black text-slate-500">+</span>
              <button
                type="button"
                onClick={() => setSelectedCategory("cost")}
                className={`w-[10.1rem] cursor-pointer rounded-2xl border-2 border-white/25 bg-gradient-to-br from-[#64748b] to-[#475569] px-4 py-4 text-left text-white shadow-[0_10px_22px_rgba(71,85,105,0.4)] transition ${selectedCategory === "cost" ? "scale-[1.03] border-white outline outline-4 outline-slate-200/90 ring-4 ring-white/55 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.65),0_0_0_2px_rgba(100,116,139,0.5),0_14px_24px_rgba(71,85,105,0.55)]" : "opacity-90 hover:scale-[1.01] hover:border-white/50 hover:opacity-100"}`}
              >
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/30 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <Image src="/Cost.png" alt="Cost icon" width={34} height={34} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Cost</p>
                <p className="mt-2 text-base font-bold">0% of 0%</p>
                <p className="mt-1 text-xs text-white/90">Category weight</p>
              </button>
              <span className="px-0.5 text-2xl font-black text-slate-500">=</span>
              <div className="w-[10.1rem] rounded-2xl bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] px-4 py-4 text-white shadow-[0_10px_22px_rgba(124,58,237,0.45)] ring-1 ring-white/25">
                <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-white/30 text-white backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" aria-hidden>
                    <path d="M5 17h14M5 7h14M8 7v10M16 7v10" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Overall Score</p>
                <p className="mt-2 text-xl font-bold">{overallScore.toFixed(2)}%</p>
                <p className="mt-1 text-xs text-white/90">From selected data</p>
              </div>
            </div>
      </div>

      {activeTab === "performance" && isCategoryReady && (
          <div className={`mt-4 grid gap-4 ${selectedCategory === "pi" ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Practice Name
              {isCostSelected ? (
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  defaultValue=""
                  disabled
                >
                  <option value="">--</option>
                </select>
              ) : (
                <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800" value={practice} disabled>
                  <option>{practice}</option>
                </select>
              )}
            </label>

            <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Provider Name (Multi Select)
              {isCostSelected ? (
                <select
                  className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  disabled
                  multiple
                  value={[]}
                  onChange={() => {}}
                />
              ) : (
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
              )}
            </label>

            <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {selectedCategory === "pi"
                ? "Objective Name (Multi Select)"
                : selectedCategory === "ia"
                  ? "Quality Measure IDs (Multi Select)"
                : "Quality Measure IDs (Multi Select)"}
              {isCostSelected ? (
                <select
                  className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  disabled
                  multiple
                  value={[]}
                  onChange={() => {}}
                />
              ) : (
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
              )}
            </label>
            {selectedCategory === "pi" ? (
              <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Quality Measure IDs (Multi Select)
                <select
                  className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
                  value={selectedPiQualityMeasures}
                  multiple
                  onChange={(e) =>
                    setSelectedPiQualityMeasures(
                      Array.from(e.currentTarget.selectedOptions).map((x) => x.value),
                    )
                  }
                >
                  {piQualityMeasures.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
      )}

      {isCategoryReady ? (
      activeTab === "performance" ? (
        selectedCategory === "cost" ? (
          <div className="mt-4 h-[380px] w-full rounded-2xl border border-slate-300/80 bg-gradient-to-b from-white via-slate-50/60 to-slate-100/40 p-4 shadow-[0_18px_40px_rgba(100,116,139,0.15)] ring-1 ring-white/80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]} margin={{ top: 16, right: 8, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="measureId" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-center text-sm font-semibold text-slate-600">
              Cost Performance structure ready (blank chart).
            </p>
          </div>
        ) : (
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
        )
      ) : (
        selectedCategory === "cost" ? (
          <div className="mt-4 h-[380px] w-full rounded-2xl border border-slate-300/80 bg-gradient-to-b from-white via-slate-50/60 to-slate-100/40 p-4 shadow-[0_18px_40px_rgba(100,116,139,0.15)] ring-1 ring-white/80">
            <div className="mb-2 flex items-center gap-5 text-sm font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                2024
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                2025
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                2026
              </span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BLANK_COST_COMPARISON_DATA} margin={{ top: 14, right: 14, left: 6, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-center text-sm font-semibold text-slate-600">
              Cost Comparison structure ready (blank chart).
            </p>
          </div>
        ) : (
        <div className="mt-4 h-[380px] w-full rounded-2xl border border-sky-200/80 bg-gradient-to-b from-white via-sky-50/60 to-sky-100/40 p-4 shadow-[0_18px_40px_rgba(14,165,233,0.18)] ring-1 ring-white/80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 14, right: 14, left: 6, bottom: 10 }}>
              <defs>
                <linearGradient id="line2024" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="line2025" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="line2026" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
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
                wrapperStyle={{ color: "#0f172a", paddingTop: 2, cursor: "pointer" }}
                onClick={(entry) => {
                  const year = entry.value as TrendYear;
                  if (year !== "2024" && year !== "2025" && year !== "2026") return;
                  setHighlightedYear((prev) => (prev === year ? null : year));
                }}
              />
              <Line
                type="monotone"
                dataKey="y2024"
                name="2024"
                stroke="url(#line2024)"
                strokeWidth={highlightedYear === "2024" ? 6 : 4}
                strokeOpacity={highlightedYear && highlightedYear !== "2024" ? 0.22 : 1}
                dot={{ r: 4, strokeWidth: 2, fill: "#fb923c", stroke: "#c2410c" }}
                activeDot={{ r: 6 }}
                animationDuration={950}
              />
              <Line
                type="monotone"
                dataKey="y2025"
                name="2025"
                stroke="url(#line2025)"
                strokeWidth={highlightedYear === "2025" ? 6 : 4}
                strokeOpacity={highlightedYear && highlightedYear !== "2025" ? 0.22 : 1}
                dot={{ r: 4, strokeWidth: 2, fill: "#22d3ee", stroke: "#0e7490" }}
                activeDot={{ r: 6 }}
                animationDuration={950}
              />
              <Line
                type="monotone"
                connectNulls={false}
                dataKey="y2026"
                name="2026"
                stroke="url(#line2026)"
                strokeWidth={highlightedYear === "2026" ? 6 : 4}
                strokeOpacity={highlightedYear && highlightedYear !== "2026" ? 0.22 : 1}
                dot={{ r: 4, strokeWidth: 2, fill: "#10b981", stroke: "#047857" }}
                activeDot={{ r: 6 }}
                animationDuration={950}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )
      )
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-800">
            {activeTab === "performance" ? "Performance" : "Comparison"} view for this category is coming next.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Select a ready category to view charts.
          </p>
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GroupedRow = {
  practiceName: string;
  qualityMeasureId: string;
  performanceRate: number;
};

export function GroupedPerformanceChart() {
  const [rows, setRows] = useState<GroupedRow[]>([]);
  const [selectedPractice, setSelectedPractice] = useState("");
  const [selectedMeasureIds, setSelectedMeasureIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/grouped-performance")
      .then(async (res) => {
        const body = (await res.json()) as { rows?: GroupedRow[] };
        return body.rows ?? [];
      })
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        const practices = Array.from(new Set(data.map((r) => r.practiceName)));
        const measures = Array.from(new Set(data.map((r) => r.qualityMeasureId)));
        setSelectedPractice(practices[0] ?? "");
        setSelectedMeasureIds(measures);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const practices = useMemo(
    () => Array.from(new Set(rows.map((r) => r.practiceName))),
    [rows],
  );
  const measures = useMemo(
    () => Array.from(new Set(rows.map((r) => r.qualityMeasureId))),
    [rows],
  );

  const chartData = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            r.practiceName === selectedPractice &&
            selectedMeasureIds.includes(r.qualityMeasureId),
        )
        .map((r) => ({
          measureId: r.qualityMeasureId,
          performanceRate: r.performanceRate,
        })),
    [rows, selectedMeasureIds, selectedPractice],
  );

  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-cyan-100 bg-white/85 p-5 shadow-2xl shadow-cyan-100/60 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-emerald-200/35 blur-3xl" />

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Grouped Data Performance (Practice by Measure)
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Practice Name
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
            value={selectedPractice}
            onChange={(e) => setSelectedPractice(e.target.value)}
          >
            {practices.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Quality Measure ID
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

      <div className="mt-5 h-[360px] w-full rounded-2xl border border-cyan-200/80 bg-gradient-to-b from-white via-cyan-50/60 to-emerald-50/50 p-4 shadow-[0_18px_40px_rgba(20,184,166,0.16)] ring-1 ring-white/80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 8, left: 0, bottom: 10 }}
            barCategoryGap="14%"
          >
            <defs>
              <linearGradient id="groupedBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
              <filter id="groupedBarShadow" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.25" floodColor="#115e59" />
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
            <Bar
              dataKey="performanceRate"
              name="Performance Rate"
              fill="url(#groupedBarGrad)"
              radius={[8, 8, 0, 0]}
              barSize={56}
              filter="url(#groupedBarShadow)"
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

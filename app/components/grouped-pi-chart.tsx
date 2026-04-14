"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PI_PERFORMANCE_ROWS } from "@/lib/pi-performance-data";

export function GroupedPiChart() {
  const practices = useMemo(
    () => Array.from(new Set(PI_PERFORMANCE_ROWS.map((r) => r.practiceName))),
    [],
  );
  const objectives = useMemo(
    () => Array.from(new Set(PI_PERFORMANCE_ROWS.map((r) => r.objectiveName))),
    [],
  );
  const qualityMeasures = useMemo(
    () => Array.from(new Set(PI_PERFORMANCE_ROWS.map((r) => r.qualityMeasureId))),
    [],
  );

  const [selectedPractice, setSelectedPractice] = useState(practices[0] ?? "");
  const [selectedQualityMeasures, setSelectedQualityMeasures] = useState<string[]>(qualityMeasures);

  const chartData = useMemo(() => {
    return objectives
      .map((objective) => {
        const matches = PI_PERFORMANCE_ROWS.filter(
          (r) =>
            r.practiceName === selectedPractice &&
            r.objectiveName === objective &&
            selectedQualityMeasures.includes(r.qualityMeasureId),
        );
        if (matches.length === 0) return null;
        const avg = matches.reduce((sum, row) => sum + row.performanceRate, 0) / matches.length;
        return { objective, performanceRate: Number(avg.toFixed(2)) };
      })
      .filter(Boolean) as Array<{ objective: string; performanceRate: number }>;
  }, [objectives, selectedPractice, selectedQualityMeasures]);

  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-amber-100 bg-white/85 p-5 shadow-2xl shadow-amber-100/60 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-amber-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-orange-200/35 blur-3xl" />

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Grouped PI Performance (Practice by Objective)
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
          Quality Measure IDs (Multi Select)
          <select
            className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800"
            value={selectedQualityMeasures}
            multiple
            onChange={(e) =>
              setSelectedQualityMeasures(Array.from(e.currentTarget.selectedOptions).map((x) => x.value))
            }
          >
            {qualityMeasures.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 h-[360px] w-full rounded-2xl border border-amber-200/80 bg-gradient-to-b from-white via-amber-50/60 to-orange-50/50 p-4 shadow-[0_18px_40px_rgba(245,158,11,0.14)] ring-1 ring-white/80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 10 }} barCategoryGap="16%">
            <defs>
              <linearGradient id="groupedPiBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="objective" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
            <Bar dataKey="performanceRate" name="Performance Rate" fill="url(#groupedPiBarGrad)" radius={[8, 8, 0, 0]} barSize={52} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

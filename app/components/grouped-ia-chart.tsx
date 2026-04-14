"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { IA_PERFORMANCE_ROWS } from "@/lib/ia-performance-data";

export function GroupedIaChart() {
  const practices = useMemo(
    () => Array.from(new Set(IA_PERFORMANCE_ROWS.map((r) => r.practiceName))),
    [],
  );
  const activities = useMemo(
    () => Array.from(new Set(IA_PERFORMANCE_ROWS.map((r) => r.activityId))),
    [],
  );

  const [selectedPractice, setSelectedPractice] = useState(practices[0] ?? "");
  const [selectedActivities, setSelectedActivities] = useState<string[]>(activities);

  const chartData = useMemo(() => {
    return selectedActivities
      .map((activityId) => {
        const matches = IA_PERFORMANCE_ROWS.filter(
          (row) => row.practiceName === selectedPractice && row.activityId === activityId,
        );
        if (matches.length === 0) return null;
        const avg = matches.reduce((sum, row) => sum + row.performanceRate, 0) / matches.length;
        return { activityId, performanceRate: Number(avg.toFixed(2)) };
      })
      .filter(Boolean) as Array<{ activityId: string; performanceRate: number }>;
  }, [selectedActivities, selectedPractice]);

  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-teal-100 bg-white/85 p-5 shadow-2xl shadow-teal-100/60 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-teal-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-cyan-200/35 blur-3xl" />

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Grouped IA Performance (Practice by Activity)
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
            value={selectedActivities}
            multiple
            onChange={(e) =>
              setSelectedActivities(Array.from(e.currentTarget.selectedOptions).map((x) => x.value))
            }
          >
            {activities.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 h-[360px] w-full rounded-2xl border border-teal-200/80 bg-gradient-to-b from-white via-teal-50/60 to-cyan-50/50 p-4 shadow-[0_18px_40px_rgba(20,184,166,0.14)] ring-1 ring-white/80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 10 }} barCategoryGap="16%">
            <defs>
              <linearGradient id="groupedIaBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="activityId" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
            <Bar dataKey="performanceRate" name="Performance Rate" fill="url(#groupedIaBarGrad)" radius={[8, 8, 0, 0]} barSize={52} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

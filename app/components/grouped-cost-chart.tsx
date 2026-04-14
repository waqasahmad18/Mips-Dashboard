"use client";

import { BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function GroupedCostChart() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-2xl shadow-slate-200/60 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-slate-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-40 w-40 rounded-full bg-zinc-200/35 blur-3xl" />

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Grouped Cost Performance (Structure)
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Practice Name
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
            disabled
          />
        </label>

        <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Quality Measure IDs (Multi Select)
          <select
            className="mt-1 h-28 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
            disabled
            multiple
            value={[]}
            onChange={() => {}}
          />
        </label>
      </div>

      <div className="mt-5 h-[360px] w-full rounded-2xl border border-slate-300/80 bg-gradient-to-b from-white via-slate-50/60 to-slate-100/40 p-4 shadow-[0_18px_40px_rgba(100,116,139,0.15)] ring-1 ring-white/80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[]} margin={{ top: 12, right: 8, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="measureId" tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }} />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
              tick={{ fill: "#111827", fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

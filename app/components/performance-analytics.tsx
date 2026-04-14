"use client";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PERFORMANCE_TABS, type PerformanceByTab, type PerformanceTabId } from "@/lib/dashboard-payload";
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
function fmt(f: "currency" | "percent" | "count", n: number) {
  return f === "currency" ? usd.format(n) : f === "percent" ? `${n.toFixed(1)}%` : `${Math.round(n).toLocaleString("en-US")}`;
}
function spark(trend: number[]) {
  return trend.map((v, i) => ({ i, v }));
}
function Spark({ data, pos }: { data: { i: number; v: number }[]; pos: boolean }) {
  return (
    <div className="h-9 w-[88px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Line type="monotone" dataKey="v" stroke={pos ? "#10b981" : "#f43f5e"} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function Table({ title, rows, pl }: { title: string; rows: PerformanceByTab[PerformanceTabId]["topRows"]; pl: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
            <th className="px-3 py-2.5">Metric</th>
            <th className="px-3 py-2.5">{pl}</th>
            <th className="px-3 py-2.5">Benchmark</th>
            <th className="px-3 py-2.5">Variance</th>
            <th className="px-3 py-2.5">YTD</th>
            <th className="px-3 py-2.5">Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pos = row.variancePct >= 0;
            return (
              <tr key={row.name} className="border-b border-slate-100 hover:bg-sky-50/40 dark:border-slate-800 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">{row.name}</td>
                <td className="px-3 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{fmt(row.format, row.current)}</td>
                <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-400">{fmt(row.format, row.benchmark)}</td>
                <td className={`px-3 py-2.5 tabular-nums font-semibold ${pos ? "text-emerald-600" : "text-rose-600"}`}>
                  {pos ? "+" : ""}
                  {row.variancePct.toFixed(1)}%
                </td>
                <td className="px-3 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">{fmt(row.format, row.ytd)}</td>
                <td className="px-3 py-2.5">
                  <Spark data={spark(row.trend)} pos={pos} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-1 px-1 text-xs text-slate-400">{title}</p>
    </div>
  );
}
export function PerformanceAnalytics({
  performanceByTab,
  overallComposite,
  dataSource,
}: {
  performanceByTab: PerformanceByTab;
  overallComposite: number;
  dataSource?: string;
}) {
  const [tab, setTab] = useState<PerformanceTabId>("Growth");
  const b = performanceByTab[tab];
  return (
    <section className="mt-10 rounded-2xl border border-slate-200/80 bg-white shadow-lg ring-1 ring-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Practice performance</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            MIPS composite {overallComposite.toFixed(2)}%
            {dataSource ? (
              <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-slate-800">{dataSource}</span>
            ) : null}
          </p>
        </div>
        <nav className="flex flex-wrap gap-1" aria-label="Performance views">
          {PERFORMANCE_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold sm:text-sm ${tab === t ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <Table title="Summary metrics" rows={b.topRows} pl="Current period" />
      </div>
      <div className="border-t border-slate-100 px-4 py-5 sm:px-6 dark:border-slate-800">
        <div className="mb-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tab} — rolling 12-month signal</p>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Composite activity (indexed)</h3>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={b.chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => usd.format(v)} width={72} />
              <Tooltip
                formatter={(value) => {
                  const parsed = typeof value === "number" ? value : Number(value);
                  if (!Number.isFinite(parsed)) return ["", "Value"];
                  return [usd.format(parsed), "Value"];
                }}
                contentStyle={{ borderRadius: 8 }}
              />
              <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: "#06b6d4" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 sm:px-6 dark:border-slate-800">
        <Table title="Measure drill-down (proxy %)" rows={b.bottomRows} pl="Current period" />
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800 dark:bg-slate-800/40">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Period total (chart series)</p>
          <p className="text-lg font-bold tabular-nums">{usd.format(b.chartTotal)}</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-white px-4 py-3 dark:border-sky-900/50 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Aligned MIPS composite</p>
          <p className="text-xl font-bold tabular-nums text-sky-700">{overallComposite.toFixed(2)}%</p>
        </div>
      </div>
    </section>
  );
}

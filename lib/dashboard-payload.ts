import { fnv1aMix, mulberry32, round2 } from "@/lib/dashboard-seed";
import { computeScores, overallFromScores, type CategoryScores } from "@/lib/mips-scores";

export const PERFORMANCE_TABS = ["Growth", "Payor Mix", "Acuity", "Collections"] as const;
export type PerformanceTabId = (typeof PERFORMANCE_TABS)[number];
export type RowFormat = "currency" | "percent" | "count";
export type MetricRow = {
  name: string;
  format: RowFormat;
  current: number;
  benchmark: number;
  variancePct: number;
  ytd: number;
  trend: number[];
};
export type ChartPoint = { month: string; value: number };
export type TabPerformanceBundle = {
  topRows: MetricRow[];
  bottomRows: MetricRow[];
  chartData: ChartPoint[];
  chartTotal: number;
};
export type PerformanceByTab = Record<PerformanceTabId, TabPerformanceBundle>;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

function makeTrend12(u: () => number, base: number, amp: number, clamp?: [number, number]) {
  const [lo, hi] = clamp ?? [-Infinity, Infinity];
  return Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((i / 11) * Math.PI) * amp;
    const noise = (u() - 0.5) * amp * 0.35;
    return round2(Math.min(hi, Math.max(lo, base + wave + noise)));
  });
}

const TAB_ROWS: Record<PerformanceTabId, { name: string; format: RowFormat; baseScale: number; amp: number; clamp?: [number, number] }[]> = {
  Growth: [
    { name: "Quality performance rate", format: "percent", baseScale: 55, amp: 12, clamp: [0, 100] },
    { name: "Reporting completeness", format: "percent", baseScale: 48, amp: 10, clamp: [0, 100] },
    { name: "Patient encounters (mo)", format: "count", baseScale: 820, amp: 140 },
    { name: "Est. MIPS incentive", format: "currency", baseScale: 125000, amp: 45000 },
  ],
  "Payor Mix": [
    { name: "Commercial share", format: "percent", baseScale: 42, amp: 8, clamp: [0, 100] },
    { name: "Medicare share", format: "percent", baseScale: 38, amp: 9, clamp: [0, 100] },
    { name: "Medicaid share", format: "percent", baseScale: 14, amp: 6, clamp: [0, 100] },
    { name: "Self-pay / other", format: "percent", baseScale: 6, amp: 4, clamp: [0, 100] },
  ],
  Acuity: [
    { name: "Avg. complexity index", format: "count", baseScale: 3.2, amp: 0.45 },
    { name: "High-acuity visits", format: "count", baseScale: 210, amp: 55 },
    { name: "Care coordination time (hrs)", format: "count", baseScale: 118, amp: 28 },
    { name: "Readmission proxy rate", format: "percent", baseScale: 9.5, amp: 3, clamp: [0, 100] },
  ],
  Collections: [
    { name: "Net collections", format: "currency", baseScale: 285000, amp: 62000 },
    { name: "Days in A/R", format: "count", baseScale: 38, amp: 9, clamp: [18, 75] },
    { name: "Bad debt write-off", format: "currency", baseScale: 12000, amp: 8000 },
    { name: "Collection rate", format: "percent", baseScale: 94, amp: 4, clamp: [0, 100] },
  ],
};

export function buildRowsForTab(tab: PerformanceTabId, practice: string, provider: string, measure: string): MetricRow[] {
  const u = mulberry32(fnv1aMix([practice, provider, measure, "perf", tab]));
  return TAB_ROWS[tab].map((d) => {
    const jitter = 0.85 + u() * 0.3;
    const base = d.baseScale * jitter;
    const trend = makeTrend12(u, base, d.amp, d.clamp);
    const current = trend[11]!;
    const benchmark = round2(trend[0]! * (0.88 + u() * 0.12));
    const variancePct = benchmark === 0 ? 0 : round2(((current - benchmark) / Math.abs(benchmark)) * 100);
    const ytd = d.format === "currency" || d.format === "count"
      ? round2(trend.reduce((a, b) => a + b, 0))
      : round2(trend.reduce((a, b) => a + b, 0) / 12);
    return { name: d.name, format: d.format, current, benchmark, variancePct, ytd, trend };
  });
}

export function buildMainChartSeries(practice: string, provider: string, measure: string, tab: PerformanceTabId): ChartPoint[] {
  const u = mulberry32(fnv1aMix([practice, provider, measure, "chart", tab]));
  const floor = 120000 + u() * 90000;
  const peakBoost = 80000 + u() * 120000;
  return MONTHS.map((month, i) => ({
    month,
    value: round2(Math.max(0, floor + Math.sin((i / 11) * Math.PI) * peakBoost + (u() - 0.5) * 22000)),
  }));
}

export function buildBottomRows(tab: PerformanceTabId, practice: string, provider: string, measure: string): MetricRow[] {
  const u = mulberry32(fnv1aMix([practice, provider, measure, "bottom", tab]));
  const names = ["Measure-level numerator", "Denominator eligible", "Documentation gap index", "Workflow completion"] as const;
  return names.map((name, idx) => {
    const trend = makeTrend12(u, 55 + idx * 7 + u() * 12, 8, [0, 100]);
    const current = trend[11]!;
    const benchmark = round2(trend[3]! * (0.92 + u() * 0.06));
    const variancePct = benchmark === 0 ? 0 : round2(((current - benchmark) / benchmark) * 100);
    return { name, format: "percent" as const, current, benchmark, variancePct, ytd: round2(trend.reduce((a, b) => a + b, 0) / 12), trend };
  });
}

export function buildPerformanceByTab(practice: string, provider: string, measure: string): PerformanceByTab {
  const out = {} as PerformanceByTab;
  for (const tab of PERFORMANCE_TABS) {
    const chartData = buildMainChartSeries(practice, provider, measure, tab);
    out[tab] = {
      topRows: buildRowsForTab(tab, practice, provider, measure),
      bottomRows: buildBottomRows(tab, practice, provider, measure),
      chartData,
      chartTotal: round2(chartData.reduce((a, p) => a + p.value, 0)),
    };
  }
  return out;
}

export type DashboardPayload = {
  practice: string;
  provider: string;
  measure: string;
  scores: CategoryScores;
  overall: number;
  performanceByTab: PerformanceByTab;
};

export function buildDashboardPayload(practice: string, provider: string, measure: string): DashboardPayload {
  const scores = computeScores(practice, provider, measure);
  return {
    practice,
    provider,
    measure,
    scores,
    overall: overallFromScores(scores),
    performanceByTab: buildPerformanceByTab(practice, provider, measure),
  };
}

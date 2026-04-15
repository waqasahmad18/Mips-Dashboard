"use client";
import { useState } from "react";
import { SinglePerformanceChart } from "./single-performance-chart";
import { GroupedPerformanceChart } from "./grouped-performance-chart";
import { GroupedPiChart } from "./grouped-pi-chart";
import { GroupedIaChart } from "./grouped-ia-chart";
import { GroupedCostChart } from "./grouped-cost-chart";

export function MipsDashboard() {
  const [singleTab, setSingleTab] = useState<"performance" | "comparison">("performance");
  const [selectedCategory, setSelectedCategory] = useState<"quality" | "pi" | "ia" | "cost">("quality");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-slate-50 to-sky-50/40 dark:from-slate-950 dark:to-slate-950">
      <header className="relative overflow-hidden border-b border-slate-300 bg-[#cfcfd1] px-4 py-8 shadow-sm">
        <div className="pointer-events-none absolute -top-16 left-10 h-36 w-36 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center [font-family:var(--font-poppins)]">
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-5 py-1 text-xs font-semibold tracking-wide text-slate-700 shadow-sm">
            Performance Intelligence
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            MIPS Dashboard
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-800 sm:text-base">
            Track quality, compare providers, and monitor yearly progress in one place
          </p>
          <p className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-slate-900/35" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <SinglePerformanceChart onTabChange={setSingleTab} onCategoryChange={setSelectedCategory} />
        {singleTab === "performance" && selectedCategory === "quality" && <GroupedPerformanceChart />}
        {singleTab === "performance" && selectedCategory === "pi" && <GroupedPiChart />}
        {singleTab === "performance" && selectedCategory === "ia" && <GroupedIaChart />}
        {singleTab === "performance" && selectedCategory === "cost" && <GroupedCostChart />}
      </main>
    </div>
  );
}

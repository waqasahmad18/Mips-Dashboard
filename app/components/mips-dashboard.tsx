"use client";
import { useState } from "react";
import Image from "next/image";
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
      <header className="relative overflow-hidden rounded-b-3xl border-b border-cyan-300/50 bg-gradient-to-r from-[#66f5dc] to-[#58d8d8] px-4 py-7 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
        <div className="pointer-events-none absolute -left-4 -top-4 h-32 w-32 overflow-hidden rounded-br-3xl opacity-90">
          <Image src="/logo.png" alt="" width={126} height={126} className="translate-x-1 translate-y-1 contrast-125 brightness-75 drop-shadow-[0_2px_4px_rgba(15,23,42,0.45)]" />
        </div>
        <div className="pointer-events-none absolute -left-4 -top-4 h-32 w-32 rounded-br-3xl border border-white/35 bg-white/20" />
        <div className="pointer-events-none absolute -right-8 -bottom-10 h-28 w-28 rounded-full bg-cyan-200/40 blur-2xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center rounded-full border-2 border-cyan-200 bg-[#8ef8e5] px-5 py-1 text-xs font-semibold tracking-wide text-slate-800 shadow-[0_4px_10px_rgba(15,23,42,0.25)]">
            Performance Intelligence
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            MIPS Dashboard
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-800 sm:text-base">
            Track quality, compare providers, and monitor yearly progress in one place
          </p>
          <p className="mx-auto mt-3 h-1.5 w-32 rounded-full bg-slate-900/35" />
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

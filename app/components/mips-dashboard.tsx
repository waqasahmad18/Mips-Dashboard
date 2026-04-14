"use client";
import { useState } from "react";
import { SinglePerformanceChart } from "./single-performance-chart";
import { GroupedPerformanceChart } from "./grouped-performance-chart";

export function MipsDashboard() {
  const [singleTab, setSingleTab] = useState<"performance" | "comparison">("performance");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-slate-50 to-sky-50/40 dark:from-slate-950 dark:to-slate-950">
      <header className="relative overflow-hidden border-b border-sky-100 bg-white/85 px-4 py-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        <div className="pointer-events-none absolute -top-16 left-10 h-36 w-36 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <h1 className="bg-gradient-to-r from-slate-900 via-sky-700 to-violet-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-slate-100 dark:via-sky-300 dark:to-violet-300 sm:text-5xl">
            MIPS Dashboard
          </h1>
          <p className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-gradient-to-r from-sky-500 to-violet-500 opacity-80" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <SinglePerformanceChart onTabChange={setSingleTab} />
        {singleTab === "performance" && <GroupedPerformanceChart />}
      </main>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SinglePerformanceChart } from "./single-performance-chart";
import { GroupedPerformanceChart } from "./grouped-performance-chart";
import { GroupedPiChart } from "./grouped-pi-chart";
import { GroupedIaChart } from "./grouped-ia-chart";
import { GroupedCostChart } from "./grouped-cost-chart";

export function MipsDashboard() {
  const router = useRouter();
  const [singleTab, setSingleTab] = useState<"performance" | "comparison">("performance");
  const [selectedCategory, setSelectedCategory] = useState<"quality" | "pi" | "ia" | "cost">("quality");
  const [selectedQuarter, setSelectedQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4" | "Overall">("Q1");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-slate-50 to-sky-50/40 dark:from-slate-950 dark:to-slate-950">
      <header className="relative overflow-hidden border-b border-slate-700 bg-[#0f172a] px-4 py-8 shadow-sm">
        <div className="pointer-events-none absolute -top-16 left-10 h-36 w-36 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center [font-family:var(--font-poppins)]">
          <div className="absolute right-0 top-0 z-20" ref={menuRef}>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zm3.75 12a7.5 7.5 0 10-15 0"
                  />
                </svg>
              </span>
              <span>Spokane</span>
              <button
                type="button"
                aria-label="Open user menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full px-1.5 py-0.5 text-lg leading-none transition hover:bg-white/20"
              >
                &#8942;
              </button>
            </div>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            ) : null}
          </div>
          <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-5 py-1 text-xs font-semibold tracking-wide text-white shadow-sm backdrop-blur-sm">
            Performance Intelligence
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
            MIPS Dashboard
          </h1>
          <p className="mt-2 text-sm font-semibold text-white sm:text-base">
            Track quality, compare providers, and monitor yearly progress in one place
          </p>
          <p className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-white/40" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <SinglePerformanceChart
          onTabChange={setSingleTab}
          onCategoryChange={setSelectedCategory}
          onQuarterChange={setSelectedQuarter}
        />
        {singleTab === "performance" && selectedQuarter === "Q1" && selectedCategory === "quality" && <GroupedPerformanceChart />}
        {singleTab === "performance" && selectedCategory === "pi" && (
          selectedQuarter === "Q1" ? (
            <GroupedPiChart />
          ) : (
            <section className="mt-10 min-h-[470px] rounded-2xl border border-amber-100 bg-white/60 p-5 shadow-2xl shadow-amber-100/40 transition-all duration-300">
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-amber-200/70 bg-white/70">
                <p className="text-sm font-semibold text-slate-500">
                  Promoting Interoperability grouped view is available in Q1.
                </p>
              </div>
            </section>
          )
        )}
        {singleTab === "performance" && selectedCategory === "ia" && (
          selectedQuarter === "Q1" ? (
            <GroupedIaChart />
          ) : (
            <section className="mt-10 min-h-[470px] rounded-2xl border border-teal-100 bg-white/60 p-5 shadow-2xl shadow-teal-100/40 transition-all duration-300">
              <div className="flex h-[420px] items-center justify-center rounded-xl border border-teal-200/70 bg-white/70">
                <p className="text-sm font-semibold text-slate-500">
                  Improvement Activity grouped view is available in Q1.
                </p>
              </div>
            </section>
          )
        )}
        {singleTab === "performance" && selectedQuarter === "Q1" && selectedCategory === "cost" && <GroupedCostChart />}
      </main>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savePassword, setSavePassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const remembered = window.localStorage.getItem("mips_login_saved");
    if (!remembered) return;
    try {
      const data = JSON.parse(remembered) as { username?: string; password?: string };
      setUsername(data.username ?? "");
      setPassword(data.password ?? "");
      setSavePassword(true);
    } catch {
      window.localStorage.removeItem("mips_login_saved");
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember: savePassword }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setError(data.message ?? "Login failed. Please try again.");
        return;
      }

      if (savePassword) {
        window.localStorage.setItem(
          "mips_login_saved",
          JSON.stringify({ username, password }),
        );
      } else {
        window.localStorage.removeItem("mips_login_saved");
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-violet-100 px-4 py-10">
      <div className="pointer-events-none absolute -left-12 -top-14 h-52 w-52 rounded-full bg-sky-300/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-fuchsia-300/40 blur-3xl" />
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white/55 p-6 shadow-[0_24px_55px_rgba(14,165,233,0.25)] backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <Image src="/logo.png" alt="MIPS Logo" width={92} height={92} priority />
          </div>
          <h1 className="bg-gradient-to-r from-slate-900 via-sky-700 to-violet-700 bg-clip-text text-2xl font-bold text-transparent">
            MIPS Dashboard
          </h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            User
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Enter user id"
              autoComplete="username"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <div className="mt-1 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-slate-800 outline-none"
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={savePassword}
              onChange={(event) => setSavePassword(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Save password
          </label>

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

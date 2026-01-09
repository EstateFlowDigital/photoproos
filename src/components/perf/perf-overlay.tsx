"use client";

import { useEffect, useMemo, useState } from "react";
import type { NextWebVitalsMetric } from "next/app";
import { cn } from "@/lib/utils";

type PerfEntry = NextWebVitalsMetric & { timestamp: number };

const METRIC_LABELS: Record<string, string> = {
  FCP: "First Contentful Paint",
  LCP: "Largest Contentful Paint",
  CLS: "Cumulative Layout Shift",
  FID: "First Input Delay",
  INP: "Interaction to Next Paint",
  TTFB: "Time to First Byte",
  TTFB_next: "Server TTFB",
  custom: "Custom",
};

export function PerfOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [entries, setEntries] = useState<PerfEntry[]>([]);

  // Detect flag & listen for toggle
  useEffect(() => {
    const readFlag = () => localStorage.getItem("ppos_perf_logging") === "true";
    setEnabled(readFlag());

    const onStorage = (event: StorageEvent) => {
      if (event.key === "ppos_perf_logging") {
        setEnabled(event.newValue === "true");
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Listen for dispatched vitals
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<PerfEntry>).detail;
      if (!detail) return;
      setEntries((prev) => {
        const next = [detail, ...prev].slice(0, 8);
        return next;
      });
    };
    window.addEventListener("ppos:vitals", handler as EventListener);
    return () => window.removeEventListener("ppos:vitals", handler as EventListener);
  }, [enabled]);

  const stats = useMemo(() => {
    const grouped: Record<string, PerfEntry[]> = {};
    entries.forEach((entry) => {
      if (!grouped[entry.name]) grouped[entry.name] = [];
      grouped[entry.name].push(entry);
    });
    return Object.entries(grouped).map(([name, list]) => {
      const latest = list[0];
      const values = list.map((i) => i.value as number);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      return { name, latest: latest.value, avg, count: list.length, ts: latest.timestamp };
    });
  }, [entries]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-80 rounded-xl border border-[var(--card-border)] bg-[color-mix(in srgb, var(--card) 85%, transparent)] shadow-2xl backdrop-blur">
      <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] px-4 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Perf overlay</p>
          <p className="text-xs text-foreground-muted">localStorage ppos_perf_logging=true</p>
        </div>
        <button
          onClick={() => setEntries([])}
          className="text-xs text-foreground-muted hover:text-foreground"
        >
          Clear
        </button>
      </div>
      <div className="max-h-64 overflow-auto divide-y divide-[var(--card-border)]">
        {stats.length === 0 ? (
          <div className="p-4 text-xs text-foreground-muted">Waiting for metrics…</div>
        ) : (
          stats.map((metric) => (
            <div key={metric.name} className="px-4 py-3 text-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="font-medium text-foreground">
                  {METRIC_LABELS[metric.name] || metric.name}
                </span>
                <span className="text-xs text-foreground-muted">
                  {new Date(metric.ts).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 flex items-start justify-between gap-4 flex-wrap text-xs">
                <span className="text-foreground-muted">Latest</span>
                <span className={cn("font-semibold", highlightClass(metric.name, metric.latest))}>
                  {formatMetric(metric.name, metric.latest)}
                </span>
              </div>
              <div className="mt-1 flex items-start justify-between gap-4 flex-wrap text-xs text-foreground-muted">
                <span>Avg ({metric.count})</span>
                <span className="font-semibold text-foreground">
                  {formatMetric(metric.name, metric.avg)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatMetric(name: string, value: number | string) {
  if (typeof value !== "number") return String(value);
  if (name === "CLS") return value.toFixed(3);
  return `${value.toFixed(0)} ms`;
}

function highlightClass(name: string, value: number | string) {
  if (typeof value !== "number") return "";
  if (name === "LCP" && value > 4000) return "text-[var(--warning)]";
  if (name === "TTFB" && value > 800) return "text-[var(--warning)]";
  if (name === "INP" && value > 200) return "text-[var(--warning)]";
  return "";
}

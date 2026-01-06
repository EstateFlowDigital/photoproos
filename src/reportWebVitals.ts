import type { NextWebVitalsMetric } from "next/app";

declare global {
  interface Window {
    __pposVitals?: Array<NextWebVitalsMetric & { timestamp: number }>;
  }
}

/**
 * Lightweight web-vitals logger. Enable detailed logging in the browser console by
 * running: localStorage.setItem("ppos_perf_logging", "true")
 */
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (typeof window === "undefined") return;

  const entry = { ...metric, timestamp: Date.now() };
  if (!window.__pposVitals) {
    window.__pposVitals = [];
  }
  window.__pposVitals.push(entry);

  const shouldLog = localStorage.getItem("ppos_perf_logging") === "true";
  if (shouldLog) {
    const value = typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value;
    // eslint-disable-next-line no-console
    console.log("[perf]", metric.name, value, entry);
  }
}

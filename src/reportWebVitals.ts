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
  try {
    window.dispatchEvent(new CustomEvent("ppos:vitals", { detail: entry }));
  } catch {
    // no-op if dispatch fails
  }
  // Ship vitals to telemetry endpoint (fire-and-forget).
  try {
    const payload = JSON.stringify({
      route: window.location.pathname,
      name: metric.name,
      value: metric.value,
      label: metric.label,
      id: metric.id,
      timestamp: entry.timestamp,
    });
    const headers = { type: "application/json" };
    const url = "/api/telemetry";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, payload);
    } else {
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ppos-route": window.location.pathname,
        },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* ignore */
      });
    }
  } catch {
    // ignore telemetry failures
  }
  if (shouldLog) {
    const value = typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value;
     
    console.log("[perf]", metric.name, value, entry);
  }
}

import { performance } from "perf_hooks";

const PERF_ENABLED = process.env.PPOS_PERF_LOG === "1";

export function perfStart(label: string): number | null {
  if (!PERF_ENABLED) return null;
  return performance.now();
}

export function perfEnd(label: string, start: number | null | undefined) {
  if (!PERF_ENABLED || start == null) return;
  const duration = performance.now() - start;
  // eslint-disable-next-line no-console
  console.info(`[perf][${label}] ${duration.toFixed(1)}ms`);
}

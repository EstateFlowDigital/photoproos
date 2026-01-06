"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type PresetRange = "this_month" | "last_month" | "this_quarter" | "this_year" | "last_year" | "custom";

const PRESET_OPTIONS: { value: PresetRange; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

interface DateRangeFilterProps {
  initialRange?: PresetRange;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function DateRangeFilter({
  initialRange = "this_month",
  initialStartDate,
  initialEndDate,
}: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedRange, setSelectedRange] = useState<PresetRange>(initialRange);
  const [startDate, setStartDate] = useState(initialStartDate || "");
  const [endDate, setEndDate] = useState(initialEndDate || "");
  const [showCustom, setShowCustom] = useState(initialRange === "custom");

  const updateParams = useCallback((range: PresetRange, start?: string, end?: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("range", range);

    if (range === "custom" && start && end) {
      params.set("start", start);
      params.set("end", end);
    } else {
      params.delete("start");
      params.delete("end");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const handleRangeChange = (range: PresetRange) => {
    setSelectedRange(range);
    if (range === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      updateParams(range);
    }
  };

  const handleCustomApply = () => {
    if (startDate && endDate) {
      updateParams("custom", startDate, endDate);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Preset Range Buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESET_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleRangeChange(option.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selectedRange === option.value
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Custom Date Picker */}
      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <span className="text-foreground-muted">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <button
            onClick={handleCustomApply}
            disabled={!startDate || !endDate}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

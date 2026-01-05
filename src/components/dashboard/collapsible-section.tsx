"use client";

import { useState, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toggleSectionCollapsed } from "@/lib/actions/dashboard";
import type { DashboardSectionId } from "@/lib/dashboard-types";

interface CollapsibleSectionProps {
  sectionId: DashboardSectionId;
  title: string;
  titleAction?: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  canCollapse?: boolean;
  className?: string;
}

function ChevronIcon({ className, collapsed }: { className?: string; collapsed: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn(
        "h-4 w-4 text-foreground-muted transition-transform duration-200",
        collapsed ? "-rotate-90" : "rotate-0",
        className
      )}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CollapsibleSection({
  sectionId,
  title,
  titleAction,
  children,
  defaultCollapsed = false,
  canCollapse = true,
  className,
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!canCollapse) return;

    // Optimistic update
    setIsCollapsed((prev) => !prev);

    // Persist to server
    startTransition(async () => {
      const result = await toggleSectionCollapsed(sectionId);
      if (!result.success) {
        // Revert on error
        setIsCollapsed((prev) => !prev);
        console.error("Failed to toggle section:", result.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col density-gap", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={!canCollapse || isPending}
          className={cn(
            "flex items-center gap-1.5 text-lg font-semibold text-foreground",
            canCollapse && "hover:text-foreground-secondary transition-colors cursor-pointer",
            !canCollapse && "cursor-default",
            isPending && "opacity-50"
          )}
        >
          {canCollapse && <ChevronIcon collapsed={isCollapsed} />}
          {title}
        </button>
        {titleAction}
      </div>

      <div
        className={cn(
          "transition-all duration-200 ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  );
}

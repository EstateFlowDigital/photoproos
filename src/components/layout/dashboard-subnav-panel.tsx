"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getActiveDashboardNav,
  isActiveRoute,
  type DashboardNavData,
} from "@/lib/navigation/dashboard-nav";

interface DashboardSubnavPanelProps {
  navData: DashboardNavData;
  className?: string;
}

export function DashboardSubnavPanel({ navData, className }: DashboardSubnavPanelProps) {
  const pathname = usePathname() || "";
  const { activeItem } = getActiveDashboardNav(pathname, navData.items);
  const subNav = activeItem?.subNav ?? [];

  if (!activeItem || subNav.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "shell-subnav flex min-h-screen flex-col border-r border-[var(--card-border)] bg-[var(--card)]",
        className
      )}
      style={{
        height: "calc(var(--shell-vh, 1vh) * 100)",
        maxHeight: "calc(var(--shell-vh, 1vh) * 100)",
      }}
    >
      <div className="flex h-16 items-center justify-between border-b border-[var(--card-border)] px-4">
        <span className="text-sm font-semibold text-foreground">{activeItem.label}</span>
        <Link
          href={activeItem.href}
          className="text-xs font-semibold text-foreground-muted transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
        }}
      >
        <div className="space-y-1">
          {subNav.map((child) => {
            const isActive = isActiveRoute(pathname, child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-[var(--primary)]" : "bg-foreground-muted/60"
                  )}
                />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

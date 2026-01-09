"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function DashboardMenuButton({ onClick, className }: DashboardMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shell-menu-toggle flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--card-border)] text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground",
        className
      )}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

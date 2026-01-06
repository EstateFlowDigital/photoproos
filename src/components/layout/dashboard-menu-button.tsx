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
        "shell-menu-toggle flex h-9 w-9 items-center justify-center rounded-lg text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground",
        className
      )}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

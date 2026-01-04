"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { applyThemePreset } from "@/lib/actions/appearance";
import { THEME_PRESETS } from "@/lib/appearance-types";

interface QuickThemeSwitcherProps {
  className?: string;
}

export function QuickThemeSwitcher({ className }: QuickThemeSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close popover when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleThemeSelect = async (presetId: string) => {
    setIsPending(true);
    const result = await applyThemePreset(presetId);
    setIsPending(false);

    if (result.success) {
      setIsOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          isPending && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Quick theme switcher"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <PaletteIcon className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-lg"
          role="dialog"
          aria-label="Choose accent color"
        >
          <p className="text-xs font-medium text-foreground-muted mb-3 uppercase tracking-wider">
            Accent Color
          </p>
          <div className="grid grid-cols-5 gap-2">
            {THEME_PRESETS.filter((preset) => preset.id !== "custom").map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleThemeSelect(preset.id)}
                disabled={isPending}
                className={cn(
                  "group relative h-8 w-8 rounded-lg transition-transform hover:scale-110",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]",
                  isPending && "opacity-50 cursor-not-allowed"
                )}
                style={{ backgroundColor: preset.accent }}
                title={preset.name}
                aria-label={preset.name}
              >
                <span className="sr-only">{preset.name}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
            <a
              href="/settings/appearance"
              className="text-xs text-[var(--primary)] hover:underline"
            >
              More options...
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M3.5 2A1.5 1.5 0 0 0 2 3.5v13A1.5 1.5 0 0 0 3.5 18h13a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-13ZM10 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5.5 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM7 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleSettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  itemCount?: number;
}

const STORAGE_KEY = "settings-collapsed-sections";

/**
 * CollapsibleSettingsSection
 *
 * A settings section that can be collapsed/expanded.
 * Remembers state in localStorage.
 */
export function CollapsibleSettingsSection({
  id,
  title,
  description,
  children,
  defaultOpen = true,
  itemCount,
}: CollapsibleSettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const collapsed = JSON.parse(stored) as string[];
        setIsOpen(!collapsed.includes(id));
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsHydrated(true);
  }, [id]);

  // Save collapsed state to localStorage
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let collapsed: string[] = stored ? JSON.parse(stored) : [];

      if (newIsOpen) {
        collapsed = collapsed.filter((s) => s !== id);
      } else {
        if (!collapsed.includes(id)) {
          collapsed.push(id);
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Prevent hydration mismatch by showing default state until hydrated
  const displayOpen = isHydrated ? isOpen : defaultOpen;

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-3 text-left group"
        aria-expanded={displayOpen}
        aria-controls={`section-${id}`}
      >
        <div className="flex items-baseline gap-3">
          <h2 className="text-base font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-foreground-muted hidden sm:block">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {itemCount !== undefined && (
            <span className="text-xs text-foreground-muted px-2 py-0.5 rounded-full bg-[var(--background-tertiary)]">
              {itemCount}
            </span>
          )}
          <ChevronIcon
            className={cn(
              "h-5 w-5 text-foreground-muted transition-transform duration-200",
              displayOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      <div
        id={`section-${id}`}
        className={cn(
          "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden transition-all duration-200",
          displayOpen ? "opacity-100" : "hidden opacity-0"
        )}
      >
        {children}
      </div>
    </section>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

CollapsibleSettingsSection.displayName = "CollapsibleSettingsSection";

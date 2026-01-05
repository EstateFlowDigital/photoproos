"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  toggleSectionVisibility,
  resetDashboardConfig,
} from "@/lib/actions/dashboard";
import {
  type DashboardConfig,
  type DashboardSectionId,
  DASHBOARD_SECTIONS,
} from "@/lib/dashboard-types";

interface DashboardCustomizePanelProps {
  config: DashboardConfig;
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EyeSlashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z"
        clipRule="evenodd"
      />
      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
    </svg>
  );
}

function getSectionIcon(iconName: string) {
  switch (iconName) {
    case "chart-bar":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
        </svg>
      );
    case "lightning-bolt":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z" />
        </svg>
      );
    case "calendar":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
        </svg>
      );
    case "photo":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
        </svg>
      );
    case "clock":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
        </svg>
      );
    case "activity":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
        </svg>
      );
    case "gift":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M14 6a2.5 2.5 0 0 0-4-3 2.5 2.5 0 0 0-4 3H3.25C2.56 6 2 6.56 2 7.25v.5C2 8.44 2.56 9 3.25 9h6V6h1.5v3h6C17.44 9 18 8.44 18 7.75v-.5C18 6.56 17.44 6 16.75 6H14Zm-1-1.5a1 1 0 0 1-1 1h-1v-1a1 1 0 1 1 2 0Zm-6 0a1 1 0 0 0 1 1h1v-1a1 1 0 1 0-2 0Z" clipRule="evenodd" />
          <path d="M9.25 10.5H3v4.75A2.75 2.75 0 0 0 5.75 18h3.5v-7.5ZM10.75 18v-7.5H17v4.75A2.75 2.75 0 0 1 14.25 18h-3.5Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function DashboardCustomizePanel({
  config,
}: DashboardCustomizePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Sync local config with prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleToggleVisibility = (sectionId: DashboardSectionId) => {
    const section = DASHBOARD_SECTIONS.find((s) => s.id === sectionId);
    if (!section?.canHide) return;

    // Optimistic update
    setLocalConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    }));

    startTransition(async () => {
      const result = await toggleSectionVisibility(sectionId);
      if (!result.success) {
        // Revert on error
        setLocalConfig(config);
        console.error("Failed to toggle visibility:", result.error);
      }
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetDashboardConfig();
      if (!result.success) {
        console.error("Failed to reset config:", result.error);
      }
    });
  };

  const getSectionVisibility = (sectionId: DashboardSectionId) => {
    const section = localConfig.sections.find((s) => s.id === sectionId);
    return section?.visible ?? true;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
          "border border-[var(--card-border)] bg-[var(--card)]",
          "text-foreground-secondary hover:text-foreground",
          "hover:bg-[var(--background-hover)] transition-colors",
          isOpen && "bg-[var(--background-hover)] text-foreground"
        )}
        title="Customize dashboard"
      >
        <SettingsIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Customize</span>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-2 w-72",
            "rounded-xl border border-[var(--card-border)] bg-[var(--card)]",
            "shadow-lg"
          )}
        >
          <div className="border-b border-[var(--card-border)] px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Customize Dashboard
            </h3>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Show or hide dashboard sections
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {DASHBOARD_SECTIONS.map((section) => {
              const isVisible = getSectionVisibility(section.id);
              const canHide = section.canHide;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleToggleVisibility(section.id)}
                  disabled={!canHide || isPending}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                    "text-left transition-colors",
                    canHide
                      ? "hover:bg-[var(--background-hover)] cursor-pointer"
                      : "opacity-60 cursor-not-allowed",
                    isPending && "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isVisible
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}
                  >
                    {getSectionIcon(section.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {section.label}
                    </div>
                    <div className="text-xs text-foreground-muted truncate">
                      {section.description}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {canHide ? (
                      isVisible ? (
                        <EyeIcon className="h-4 w-4 text-foreground-muted" />
                      ) : (
                        <EyeSlashIcon className="h-4 w-4 text-foreground-muted" />
                      )
                    ) : (
                      <span className="text-xs text-foreground-muted">Required</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--card-border)] px-4 py-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-sm font-medium",
                "text-foreground-secondary hover:text-foreground",
                "hover:bg-[var(--background-hover)] transition-colors",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

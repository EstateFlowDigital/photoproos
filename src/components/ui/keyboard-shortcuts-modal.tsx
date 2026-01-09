"use client";

import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

// Detect if user is on Mac
function useIsMac() {
  const [isMac, setIsMac] = useState(true); // Default to Mac for SSR
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);
  return isMac;
}

// Get modifier key based on platform
function getModKey(isMac: boolean) {
  return isMac ? "⌘" : "Ctrl";
}

function getShortcutGroups(isMac: boolean): ShortcutGroup[] {
  const mod = getModKey(isMac);
  return [
    {
      title: "Navigation",
      shortcuts: [
        { keys: [mod, "⇧", "D"], description: "Go to Dashboard" },
        { keys: [mod, "⇧", "G"], description: "Go to Galleries" },
        { keys: [mod, "⇧", "C"], description: "Go to Clients" },
        { keys: [mod, "⇧", "P"], description: "Go to Payments" },
        { keys: [mod, "⇧", "S"], description: "Go to Scheduling" },
        { keys: [mod, "⇧", "I"], description: "Go to Invoices" },
        { keys: [mod, "⇧", "O"], description: "Go to Contracts" },
        { keys: [mod, "⇧", "R"], description: "Go to Properties" },
        { keys: [mod, "⇧", "V"], description: "Go to Services" },
        { keys: [mod, "⇧", "A"], description: "Go to Analytics" },
        { keys: [mod, "⇧", "T"], description: "Go to Settings" },
        { keys: [mod, "⇧", "F"], description: "Go to Forms" },
        { keys: [mod, "⇧", "J"], description: "Go to Projects" },
      ],
    },
    {
      title: "Global",
      shortcuts: [
        { keys: [mod, "K"], description: "Open command palette" },
        { keys: [mod, "⇧", "N"], description: "Create new item (context-aware)" },
        { keys: [mod, "/"], description: "Open keyboard shortcuts" },
        { keys: ["Esc"], description: "Go back / Close modal" },
      ],
    },
    {
      title: "Gallery View",
      shortcuts: [
        { keys: ["S"], description: "Toggle selection mode" },
        { keys: ["A"], description: "Select all photos" },
        { keys: ["R"], description: "Toggle reorder mode" },
        { keys: ["Delete"], description: "Delete selected photos" },
      ],
    },
    {
      title: "Photo Lightbox",
      shortcuts: [
        { keys: ["←"], description: "Previous photo" },
        { keys: ["→"], description: "Next photo" },
        { keys: ["+"], description: "Zoom in" },
        { keys: ["-"], description: "Zoom out" },
        { keys: ["Esc"], description: "Close lightbox" },
      ],
    },
  ];
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const isMac = useIsMac();
  const shortcutGroups = getShortcutGroups(isMac);
  const modKey = getModKey(isMac);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <KeyboardIcon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
              <p className="text-sm text-foreground-muted">Navigate faster with these shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="min-w-[24px] rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1.5 py-0.5 text-center text-xs font-medium text-foreground-muted">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-foreground-muted">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
            <p className="text-xs text-foreground-muted text-center">
              Press{" "}
              <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs font-medium text-foreground-muted">
                {modKey}
              </kbd>
              <span className="mx-0.5 text-foreground-muted">+</span>
              <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-secondary)] px-1.5 py-0.5 text-xs font-medium text-foreground-muted">
                /
              </kbd>{" "}
              anywhere to open this dialog
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

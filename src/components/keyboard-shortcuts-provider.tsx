"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { KeyboardShortcutsModal } from "./ui/keyboard-shortcuts-modal";

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

/**
 * Global keyboard shortcuts provider
 * Implements navigation and action shortcuts across the dashboard
 * Uses Cmd/Ctrl+Shift+key combinations for navigation
 */
export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    const isTyping =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;

    const key = e.key.toLowerCase();
    const isMod = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    // Cmd/Ctrl+/ to open keyboard shortcuts modal (works even when typing)
    if (isMod && e.key === "/") {
      e.preventDefault();
      setIsShortcutsModalOpen((prev) => !prev);
      return;
    }

    // Don't trigger other shortcuts when typing
    if (isTyping) return;

    // Escape to go back (context-aware)
    if (e.key === "Escape" && !isShortcutsModalOpen) {
      // Don't navigate if there's a modal open
      const hasModal = document.querySelector('[role="dialog"]');
      if (!hasModal && pathname !== "/dashboard") {
        // Go back to parent page
        const segments = pathname?.split("/").filter(Boolean) || [];
        if (segments.length > 1) {
          e.preventDefault();
          router.push("/" + segments.slice(0, -1).join("/"));
        }
      }
      return;
    }

    // Cmd/Ctrl+Shift+key navigation shortcuts
    if (isMod && isShift) {
      switch (key) {
        case "d":
          e.preventDefault();
          router.push("/dashboard");
          break;
        case "g":
          e.preventDefault();
          router.push("/galleries");
          break;
        case "c":
          e.preventDefault();
          router.push("/clients");
          break;
        case "p":
          e.preventDefault();
          router.push("/payments");
          break;
        case "s":
          e.preventDefault();
          router.push("/scheduling");
          break;
        case "i":
          e.preventDefault();
          router.push("/invoices");
          break;
        case "o":
          e.preventDefault();
          router.push("/contracts");
          break;
        case "r":
          e.preventDefault();
          router.push("/properties");
          break;
        case "v":
          e.preventDefault();
          router.push("/services");
          break;
        case "a":
          e.preventDefault();
          router.push("/analytics");
          break;
        case "t":
          e.preventDefault();
          router.push("/settings");
          break;
        case "f":
          e.preventDefault();
          router.push("/forms");
          break;
        case "j":
          e.preventDefault();
          router.push("/projects");
          break;
        case "n":
          // New item based on context
          e.preventDefault();
          if (pathname === "/scheduling" || pathname?.startsWith("/scheduling")) {
            router.push("/scheduling/new");
          } else if (pathname === "/clients" || pathname?.startsWith("/clients")) {
            router.push("/clients/new");
          } else if (pathname === "/invoices" || pathname?.startsWith("/invoices")) {
            router.push("/invoices/new");
          } else {
            router.push("/galleries/new");
          }
          break;
      }
    }
  }, [router, pathname, isShortcutsModalOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      {children}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </>
  );
}

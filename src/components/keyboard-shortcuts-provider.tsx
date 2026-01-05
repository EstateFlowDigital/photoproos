"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

/**
 * Global keyboard shortcuts provider
 * Implements navigation and action shortcuts across the dashboard
 */
export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingKeyRef = useRef<string | null>(null);
  const pendingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear pending key after timeout
  const clearPendingKey = useCallback(() => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    pendingKeyRef.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      // Skip if modifier keys are pressed (except for Cmd+K which is handled elsewhere)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Two-key navigation shortcuts (G + letter)
      if (pendingKeyRef.current === "g") {
        clearPendingKey();

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
        }
        return;
      }

      // Start two-key sequence
      if (key === "g") {
        e.preventDefault();
        pendingKeyRef.current = "g";
        pendingTimeoutRef.current = setTimeout(clearPendingKey, 1000);
        return;
      }

      // Single-key shortcuts
      switch (key) {
        // "N" for new gallery (only from galleries or dashboard page)
        case "n":
          if (pathname === "/dashboard" || pathname === "/galleries" || pathname?.startsWith("/galleries")) {
            e.preventDefault();
            router.push("/galleries/new");
          }
          break;
        // "B" for new booking (only from scheduling pages)
        case "b":
          if (pathname === "/scheduling" || pathname?.startsWith("/scheduling")) {
            e.preventDefault();
            router.push("/scheduling/new");
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearPendingKey();
    };
  }, [router, pathname, clearPendingKey]);

  return <>{children}</>;
}

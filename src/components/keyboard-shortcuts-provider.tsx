"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      const key = e.key.toLowerCase();
      const isMod = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

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
          case "n":
            // New item based on context
            e.preventDefault();
            if (pathname === "/scheduling" || pathname?.startsWith("/scheduling")) {
              router.push("/scheduling/new");
            } else {
              router.push("/galleries/new");
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, pathname]);

  return <>{children}</>;
}

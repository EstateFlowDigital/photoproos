"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Search,
  X,
  Zap,
  Calendar,
  DollarSign,
  Clock,
  Send,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Headphones,
  Hash,
} from "lucide-react";
import {
  getCannedResponses,
  searchCannedResponses,
  recordCannedResponseUsage,
  type CannedResponseWithUser,
} from "@/lib/actions/canned-responses";
import type { CannedResponseCategory } from "@prisma/client";

// =============================================================================
// Types
// =============================================================================

interface QuickReplyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
  position?: "above" | "below";
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const CATEGORY_ICONS: Record<CannedResponseCategory, React.ReactNode> = {
  booking: <Calendar className="h-4 w-4" />,
  pricing: <DollarSign className="h-4 w-4" />,
  scheduling: <Clock className="h-4 w-4" />,
  delivery: <Send className="h-4 w-4" />,
  follow_up: <MessageCircle className="h-4 w-4" />,
  greeting: <MessageSquare className="h-4 w-4" />,
  objection: <AlertCircle className="h-4 w-4" />,
  closing: <CheckCircle className="h-4 w-4" />,
  support: <Headphones className="h-4 w-4" />,
  general: <Hash className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<CannedResponseCategory, string> = {
  booking: "Booking",
  pricing: "Pricing",
  scheduling: "Scheduling",
  delivery: "Delivery",
  follow_up: "Follow-up",
  greeting: "Greeting",
  objection: "Objection",
  closing: "Closing",
  support: "Support",
  general: "General",
};

const CATEGORY_ORDER: CannedResponseCategory[] = [
  "greeting",
  "booking",
  "pricing",
  "scheduling",
  "delivery",
  "follow_up",
  "objection",
  "closing",
  "support",
  "general",
];

// =============================================================================
// Component
// =============================================================================

export function QuickReplyPicker({
  isOpen,
  onClose,
  onSelect,
  position = "above",
  className,
}: QuickReplyPickerProps) {
  const [responses, setResponses] = useState<CannedResponseWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CannedResponseCategory | "all">("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load canned responses when opened
  useEffect(() => {
    if (isOpen) {
      loadResponses();
      // Focus search input after a short delay
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
      setSelectedCategory("all");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const loadResponses = async () => {
    setIsLoading(true);
    const result = await getCannedResponses();
    if (result.success) {
      setResponses(result.data);
    }
    setIsLoading(false);
  };

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const timer = setTimeout(async () => {
      const result = await searchCannedResponses(searchQuery);
      if (result.success) {
        setResponses(result.data);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to full list when search is cleared
  useEffect(() => {
    if (!searchQuery.trim() && isOpen) {
      loadResponses();
    }
  }, [searchQuery, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Filter by category
  const filteredResponses = useMemo(() => {
    if (selectedCategory === "all") return responses;
    return responses.filter((r) => r.category === selectedCategory);
  }, [responses, selectedCategory]);

  // Group by category for display
  const groupedResponses = useMemo(() => {
    const groups: Partial<Record<CannedResponseCategory, CannedResponseWithUser[]>> = {};

    filteredResponses.forEach((response) => {
      if (!groups[response.category]) {
        groups[response.category] = [];
      }
      groups[response.category]!.push(response);
    });

    // Sort by category order
    return CATEGORY_ORDER
      .filter((cat) => groups[cat])
      .map((cat) => ({
        category: cat,
        responses: groups[cat]!,
      }));
  }, [filteredResponses]);

  // Flat list for keyboard navigation
  const flatResponses = useMemo(() => {
    return groupedResponses.flatMap((g) => g.responses);
  }, [groupedResponses]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResponses.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flatResponses[selectedIndex]) {
          handleSelect(flatResponses[selectedIndex]);
        }
        break;
    }
  };

  const handleSelect = async (response: CannedResponseWithUser) => {
    // Record usage for analytics
    await recordCannedResponseUsage(response.id);

    // Pass content to parent
    onSelect(response.content);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={cn(
        "quick-reply-picker absolute z-50 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl",
        position === "above" ? "bottom-full mb-2" : "top-full mt-2",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Replies"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          <h3 className="font-semibold text-[var(--foreground)]">Quick Replies</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close quick replies"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-[var(--card-border)] p-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or type shortcut (e.g., /pricing)"
            className="w-full rounded-lg border-0 bg-[var(--background-tertiary)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            aria-label="Search quick replies"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-[var(--card-border)] p-2">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
            )}
          >
            All
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const hasResponses = responses.some((r) => r.category === cat);
            if (!hasResponses) return null;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Response List */}
      <div
        className="max-h-64 overflow-y-auto py-2"
        role="listbox"
        aria-label="Quick reply options"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : flatResponses.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--foreground-muted)]">
              {searchQuery ? "No matching responses found" : "No quick replies available"}
            </p>
            {!searchQuery && (
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Create templates in Settings → Canned Responses
              </p>
            )}
          </div>
        ) : (
          <>
            {groupedResponses.map(({ category, responses: categoryResponses }) => (
              <div key={category}>
                {/* Category Header */}
                {selectedCategory === "all" && (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <span className="text-[var(--foreground-muted)]">
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                      {CATEGORY_LABELS[category]}
                    </span>
                  </div>
                )}

                {/* Responses */}
                {categoryResponses.map((response) => {
                  const index = flatResponses.findIndex((r) => r.id === response.id);
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={response.id}
                      onClick={() => handleSelect(response)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "quick-reply-item w-full px-4 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-[var(--primary)]/10"
                          : "hover:bg-[var(--background-hover)]"
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-[var(--foreground)]">
                              {response.title}
                            </span>
                            {response.shortcut && (
                              <span className="rounded bg-[var(--background-tertiary)] px-1.5 py-0.5 text-xs font-mono text-[var(--foreground-muted)]">
                                {response.shortcut}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--foreground-muted)] line-clamp-2">
                            {response.content}
                          </p>
                        </div>
                        {response.userId && (
                          <span className="shrink-0 rounded-full bg-purple-500/10 px-1.5 py-0.5 text-xs text-purple-400">
                            Personal
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--card-border)] px-4 py-2">
        <p className="text-xs text-[var(--foreground-muted)]">
          <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-tertiary)] px-1.5 py-0.5 text-xs">
            ↑↓
          </kbd>{" "}
          to navigate,{" "}
          <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-tertiary)] px-1.5 py-0.5 text-xs">
            Enter
          </kbd>{" "}
          to select,{" "}
          <kbd className="rounded border border-[var(--card-border)] bg-[var(--background-tertiary)] px-1.5 py-0.5 text-xs">
            Esc
          </kbd>{" "}
          to close
        </p>
      </div>
    </div>
  );
}

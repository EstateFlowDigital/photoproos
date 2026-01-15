"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  MOCKUPS,
  getFilteredMockups,
  getMockupById,
} from "@/components/mockups/mockup-registry";
import type { MockupCategory, IndustryId } from "@/components/mockups/types";
import { ImageIcon, Check, Search, X } from "lucide-react";

interface MockupPickerProps {
  selectedMockupId?: string;
  onSelect: (mockupId: string) => void;
  industry?: IndustryId;
  className?: string;
}

export function MockupPicker({
  selectedMockupId,
  onSelect,
  industry = "real_estate",
  className,
}: MockupPickerProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<MockupCategory | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get filtered mockups
  const filteredMockups = React.useMemo(() => {
    let mockups = getFilteredMockups(selectedCategory, industry);

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      mockups = mockups.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      );
    }

    return mockups;
  }, [selectedCategory, industry, searchQuery]);

  // Get counts per category
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: MOCKUPS.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = getFilteredMockups(cat.id, industry).length;
    });
    return counts;
  }, [industry]);

  return (
    <div className={cn("mockup-picker flex flex-col h-full", className)}>
      {/* Search */}
      <div className="p-3 border-b border-[var(--card-border)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mockups..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-8 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex-shrink-0 border-b border-[var(--card-border)] overflow-x-auto">
        <div className="flex p-2 gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              selectedCategory === null
                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
            )}
          >
            All
            <span className="opacity-60">({categoryCounts.all})</span>
          </button>
          {CATEGORIES.slice(0, 6).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                selectedCategory === category.id
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
              )}
            >
              {category.name}
              <span className="opacity-60">({categoryCounts[category.id]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mockup Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredMockups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <ImageIcon className="h-8 w-8 text-[var(--foreground-muted)] mb-2" />
            <p className="text-sm text-[var(--foreground-muted)]">
              {searchQuery
                ? "No mockups match your search"
                : "No mockups available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredMockups.map((mockup) => {
              const isSelected = selectedMockupId === mockup.id;
              return (
                <button
                  key={mockup.id}
                  onClick={() => onSelect(mockup.id)}
                  className={cn(
                    "group relative rounded-lg border p-2 text-left transition-all",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)] hover:shadow-md"
                  )}
                >
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video rounded-md bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 mb-2 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-[var(--primary)]/30" />
                  </div>

                  <h4 className="text-xs font-medium text-[var(--foreground)] truncate">
                    {mockup.name}
                  </h4>
                  <p className="text-[10px] text-[var(--foreground-muted)] truncate mt-0.5">
                    {mockup.description}
                  </p>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 rounded-full bg-[var(--primary)] p-0.5">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected mockup info */}
      {selectedMockupId && (
        <div className="flex-shrink-0 p-3 border-t border-[var(--card-border)] bg-[var(--background-secondary)]">
          {(() => {
            const mockup = getMockupById(selectedMockupId);
            if (!mockup) return null;
            return (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-[var(--primary)]/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {mockup.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] truncate">
                    Selected
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

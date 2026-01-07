"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  width: number;
  height: number;
}

interface MasonryGridProps<T extends Photo> {
  /** Array of photos to display */
  photos: T[];
  /** Number of columns at different breakpoints */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap between items in pixels */
  gap?: number;
  /** Render function for each photo item */
  renderItem: (photo: T, index: number) => React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * CSS Columns-based masonry layout for photo grids
 *
 * This is a pure CSS approach using CSS columns, which provides
 * excellent performance and doesn't require JavaScript calculations.
 */
export function MasonryGrid<T extends Photo>({
  photos,
  columns = { sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 16,
  renderItem,
  className,
}: MasonryGridProps<T>) {
  // Generate responsive column classes
  const columnClasses = useMemo(() => {
    const classes: string[] = [];

    if (columns.sm) classes.push(`columns-${columns.sm}`);
    if (columns.md) classes.push(`md:columns-${columns.md}`);
    if (columns.lg) classes.push(`lg:columns-${columns.lg}`);
    if (columns.xl) classes.push(`xl:columns-${columns.xl}`);

    return classes.join(" ");
  }, [columns]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        columnClasses,
        "[&>*]:mb-4 [&>*]:break-inside-avoid",
        className
      )}
      style={{ gap: gap, columnGap: gap }}
    >
      {photos.map((photo, index) => (
        <MasonryItem key={photo.id} index={index}>
          {renderItem(photo, index)}
        </MasonryItem>
      ))}
    </div>
  );
}

interface MasonryItemProps {
  children: React.ReactNode;
  index: number;
}

function MasonryItem({ children, index }: MasonryItemProps) {
  return (
    <div
      className="break-inside-avoid animate-fade-in"
      style={{
        animationDelay: `${Math.min(index * 50, 500)}ms`,
        animationFillMode: "backwards",
      }}
    >
      {children}
    </div>
  );
}

// Layout toggle component
export type LayoutType = "grid" | "masonry";

interface LayoutToggleProps {
  layout: LayoutType;
  onChange: (layout: LayoutType) => void;
  className?: string;
}

export function LayoutToggle({ layout, onChange, className }: LayoutToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1",
        className
      )}
    >
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          layout === "grid"
            ? "bg-[var(--background-elevated)] text-foreground"
            : "text-foreground-muted hover:text-foreground"
        )}
        title="Grid view"
      >
        <GridIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Grid</span>
      </button>
      <button
        onClick={() => onChange("masonry")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          layout === "masonry"
            ? "bg-[var(--background-elevated)] text-foreground"
            : "text-foreground-muted hover:text-foreground"
        )}
        title="Masonry view"
      >
        <MasonryIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Masonry</span>
      </button>
    </div>
  );
}

// Hook for persisting layout preference
export function useLayoutPreference(key: string = "gallery-layout"): [LayoutType, (layout: LayoutType) => void] {
  // This would be implemented with useState + localStorage
  // For now, just provide the interface
  const [layout, setLayout] = useState<LayoutType>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(key);
    return (saved as LayoutType) || "grid";
  });

  const updateLayout = (newLayout: LayoutType) => {
    setLayout(newLayout);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, newLayout);
    }
  };

  return [layout, updateLayout];
}

// Need to import useState for the hook
import { useState } from "react";

// Icons
function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MasonryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h2.5A2.25 2.25 0 0 1 9 4.25v4.5A2.25 2.25 0 0 1 6.75 11h-2.5A2.25 2.25 0 0 1 2 8.75v-4.5Z" />
      <path d="M2 14.25A2.25 2.25 0 0 1 4.25 12h2.5A2.25 2.25 0 0 1 9 14.25v1.5A2.25 2.25 0 0 1 6.75 18h-2.5A2.25 2.25 0 0 1 2 15.75v-1.5Z" />
      <path d="M11 4.25A2.25 2.25 0 0 1 13.25 2h2.5A2.25 2.25 0 0 1 18 4.25v1.5A2.25 2.25 0 0 1 15.75 8h-2.5A2.25 2.25 0 0 1 11 5.75v-1.5Z" />
      <path d="M11 11.25A2.25 2.25 0 0 1 13.25 9h2.5A2.25 2.25 0 0 1 18 11.25v4.5A2.25 2.25 0 0 1 15.75 18h-2.5A2.25 2.25 0 0 1 11 15.75v-4.5Z" />
    </svg>
  );
}

"use client";

import type { ReactNode, RefObject } from "react";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

type VirtualListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  estimateSize?: (item: T, index: number) => number;
  getItemKey?: (item: T, index: number) => string | number;
  overscan?: number;
  className?: string;
  itemGap?: number;
  scrollRef?: RefObject<HTMLElement>;
  prepend?: ReactNode;
  append?: ReactNode;
  emptyPlaceholder?: ReactNode;
};

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize,
  getItemKey,
  overscan = 6,
  className,
  itemGap = 8,
  scrollRef,
  prepend,
  append,
  emptyPlaceholder,
}: VirtualListProps<T>) {
  const internalRef = useRef<HTMLDivElement | null>(null);
  const parentRef = scrollRef ?? internalRef;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = items[index];
      const baseEstimate = estimateSize ? estimateSize(item, index) : 180;
      return baseEstimate + itemGap;
    },
    overscan,
    getItemKey: (index) => {
      const item = items[index];
      return getItemKey ? getItemKey(item, index) : index;
    },
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  const hasItems = items.length > 0;

  return (
    <div
      ref={parentRef as RefObject<HTMLDivElement>}
      className={cn("overflow-auto", className)}
    >
      {prepend}

      {hasItems ? (
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            const key = getItemKey ? getItemKey(item, virtualItem.index) : virtualItem.key;
            return (
              <div
                key={key}
                ref={virtualizer.measureElement}
                className="absolute left-0 right-0"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: itemGap,
                }}
              >
                {renderItem(item, virtualItem.index)}
              </div>
            );
          })}
        </div>
      ) : (
        emptyPlaceholder ?? null
      )}

      {append}
    </div>
  );
}

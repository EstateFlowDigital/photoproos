"use client";

import type { ReactNode, RefObject } from "react";
import { useCallback, useRef } from "react";
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

  // Keep stable references so the virtualizer doesn't thrash when parents re-render
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const getItemKeyRef = useRef(getItemKey);
  getItemKeyRef.current = getItemKey;

  const estimateSizeRef = useRef(estimateSize);
  estimateSizeRef.current = estimateSize;

  const itemKeyGetter = useCallback((index: number) => {
    const item = itemsRef.current[index];
    const keyFn = getItemKeyRef.current;
    return keyFn ? keyFn(item, index) : index;
  }, []);

  const sizeEstimator = useCallback(
    (index: number) => {
      const item = itemsRef.current[index];
      const baseEstimate = estimateSizeRef.current ? estimateSizeRef.current(item, index) : 180;
      return baseEstimate + itemGap;
    },
    [itemGap]
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: sizeEstimator,
    overscan,
    getItemKey: itemKeyGetter,
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
            const key = itemKeyGetter(virtualItem.index);
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

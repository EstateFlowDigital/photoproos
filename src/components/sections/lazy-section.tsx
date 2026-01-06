"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  placeholderHeight?: number;
  rootMargin?: string;
}

/**
 * Defers rendering children until the section scrolls near the viewport.
 * Useful for below-the-fold marketing slices to reduce initial JS/paint.
 */
export function LazySection({
  children,
  placeholderHeight = 320,
  rootMargin = "400px",
}: LazySectionProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} className="w-full">
      {visible ? (
        children
      ) : (
        <div
          style={{ minHeight: placeholderHeight }}
          className="w-full"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

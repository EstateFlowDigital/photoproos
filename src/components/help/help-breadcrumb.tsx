"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HelpBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function HelpBreadcrumb({ items, className }: HelpBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <ol className="flex items-center">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index > 0 && (
              <svg
                className="h-4 w-4 mx-1.5 text-foreground-muted/60 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-foreground-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default HelpBreadcrumb;

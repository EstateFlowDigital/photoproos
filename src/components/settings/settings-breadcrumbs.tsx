"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SETTINGS_NAVIGATION,
  findSettingsItemByHref,
  findCategoryForHref,
} from "@/lib/constants/settings-navigation";

interface SettingsBreadcrumbsProps {
  className?: string;
}

/**
 * SettingsBreadcrumbs
 *
 * Displays a breadcrumb trail for settings pages.
 * Shows: Settings > Category > Page
 */
export function SettingsBreadcrumbs({ className }: SettingsBreadcrumbsProps) {
  const pathname = usePathname();

  // Don't show breadcrumbs on the main settings page
  if (pathname === "/settings") {
    return null;
  }

  // Find the current item and its category
  const currentItem = findSettingsItemByHref(pathname);
  const category = findCategoryForHref(pathname);

  // Handle nested pages (e.g., /settings/reviews/requests)
  const pathParts = pathname.split("/").filter(Boolean);
  const isNestedPage = pathParts.length > 2;

  // For nested pages, try to find the parent settings item
  let parentItem = null;
  let nestedPageLabel = null;
  if (isNestedPage) {
    const parentPath = `/${pathParts.slice(0, 2).join("/")}`;
    parentItem = findSettingsItemByHref(parentPath);
    // Generate a readable label from the last path segment
    const lastSegment = pathParts[pathParts.length - 1];
    nestedPageLabel = lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <nav
      className={cn(
        "flex items-center gap-1.5 text-sm text-foreground-muted mb-4",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {/* Settings root */}
        <li className="flex items-center">
          <Link
            href="/settings"
            className="hover:text-foreground transition-colors"
          >
            Settings
          </Link>
        </li>

        {/* Category */}
        {category && (
          <>
            <li aria-hidden="true">
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <span className="text-foreground-secondary">{category.label}</span>
            </li>
          </>
        )}

        {/* Current page or parent page for nested routes */}
        {isNestedPage && parentItem ? (
          <>
            <li aria-hidden="true">
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <Link
                href={parentItem.href}
                className="hover:text-foreground transition-colors"
              >
                {parentItem.label}
              </Link>
            </li>
            {nestedPageLabel && (
              <>
                <li aria-hidden="true">
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </li>
                <li className="flex items-center">
                  <span className="text-foreground font-medium" aria-current="page">
                    {nestedPageLabel}
                  </span>
                </li>
              </>
            )}
          </>
        ) : currentItem ? (
          <>
            <li aria-hidden="true">
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </li>
            <li className="flex items-center">
              <span className="text-foreground font-medium" aria-current="page">
                {currentItem.label}
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

SettingsBreadcrumbs.displayName = "SettingsBreadcrumbs";

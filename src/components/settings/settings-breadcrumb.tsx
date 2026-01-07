"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Settings, type LucideIcon } from "lucide-react";
import {
  findSettingsItemByHref,
  findCategoryForHref,
} from "@/lib/constants/settings-navigation";

/**
 * SettingsBreadcrumb
 *
 * Displays navigation breadcrumbs within the settings section.
 * Automatically generates path based on current URL.
 */

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface SettingsBreadcrumbProps {
  /** Additional className */
  className?: string;
  /** Optional custom page title (overrides auto-detected) */
  pageTitle?: string;
}

export function SettingsBreadcrumb({
  className,
  pageTitle,
}: SettingsBreadcrumbProps) {
  const pathname = usePathname();

  // Don't show on main settings page or if pathname is null
  if (!pathname || pathname === "/settings") {
    return null;
  }

  // Find the current page info
  const currentItem = findSettingsItemByHref(pathname);
  const category = findCategoryForHref(pathname);

  // Build breadcrumb items
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (category) {
    breadcrumbs.push({
      label: category.label,
      href: category.items[0]?.href || "/settings",
    });
  }

  // Add current page
  const currentLabel = pageTitle || currentItem?.label || "Page";

  return (
    <nav
      aria-label="Settings breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-foreground-muted/60" aria-hidden />
          )}
          <Link
            href={crumb.href}
            className="flex items-center gap-1.5 text-foreground-muted transition-colors hover:text-foreground"
          >
            {crumb.icon && <crumb.icon className="h-4 w-4" />}
            <span>{crumb.label}</span>
          </Link>
        </React.Fragment>
      ))}
      <ChevronRight className="h-4 w-4 text-foreground-muted/60" aria-hidden />
      <span className="font-medium text-foreground">{currentLabel}</span>
    </nav>
  );
}

SettingsBreadcrumb.displayName = "SettingsBreadcrumb";

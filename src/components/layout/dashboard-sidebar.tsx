"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type DashboardNavData,
  isActiveRoute,
} from "@/lib/navigation/dashboard-nav";

interface DashboardSidebarProps {
  className?: string;
  navData: DashboardNavData;
  variant?: "inline" | "overlay";
  onClose?: () => void;
}

export function DashboardSidebar({
  className,
  navData,
  variant = "inline",
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname() || "";
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [viewportVH, setViewportVH] = React.useState<number | null>(null);
  const { topItems, sections } = navData;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      setViewportVH(vh);
      document.documentElement.style.setProperty("--shell-vh", `${vh}px`);
    };
    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);
    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  const handleToggle = (id: string, nextState: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: nextState }));
  };

  return (
    <aside
      data-variant={variant}
      className={cn(
        "sidebar-shell flex min-h-screen min-h-0 flex-col border-r border-[var(--card-border)] bg-[var(--card)]",
        variant === "inline" ? "sticky top-0 self-start" : "shadow-2xl",
        className
      )}
      style={
        viewportVH
          ? {
              height: `calc(var(--shell-vh, 1vh) * 100)`,
              maxHeight: `calc(var(--shell-vh, 1vh) * 100)`,
            }
          : undefined
      }
    >
      <div className="flex h-16 items-center justify-between border-b border-[var(--card-border)] px-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="sidebar-brand flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]">
            <CameraIcon className="h-4 w-4 text-white" />
          </div>
          <span className="sidebar-label text-base font-semibold text-foreground">
            PhotoProOS
          </span>
        </Link>
        {variant === "overlay" && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)",
        }}
      >
        <div className="space-y-5">
          {topItems.length > 0 ? (
            <div className="space-y-2">
              {topItems.map((item) => {
                const isActive = isActiveRoute(pathname, item.href);
                const Icon = item.icon;
                const badgeClassName =
                  item.id === "notifications"
                    ? "bg-red-500 text-white"
                    : "bg-[var(--primary)]/15 text-[var(--primary)]";

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "sidebar-item-link group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors justify-start",
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-[var(--primary)]" : "text-foreground-muted"
                      )}
                    />
                    <span className="sidebar-label flex-1 truncate">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "sidebar-badge ml-auto rounded-full px-2 py-0.5 text-xs font-semibold",
                        badgeClassName
                      )}
                    >
                      {item.badge && item.badge > 99 ? "99+" : item.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}
          {sections.map((section) => {
            const items = section.items;
            if (!items.length) return null;
            return (
              <div key={section.id} className="space-y-2">
                <p className="sidebar-section-title px-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const children = item.subNav ?? [];
                    const hasChildren = children.length > 0;
                    const childActive = hasChildren
                      ? children.some((child) => isActiveRoute(pathname, child.href))
                      : false;
                    const isActive = isActiveRoute(pathname, item.href) || childActive;
                    const isExpanded = hasChildren
                      ? expanded[item.id] ?? isActive
                      : false;
                    const Icon = item.icon;
                    const hasBadge = item.badge !== undefined && item.badge > 0;
                    const itemClassName = cn(
                      "sidebar-item-link group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      "justify-start",
                      isActive
                        ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                    );

                    return (
                      <div key={item.id} className="space-y-1">
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => handleToggle(item.id, !isExpanded)}
                            className={itemClassName}
                            aria-label={`Toggle ${item.label}`}
                            aria-expanded={isExpanded}
                          >
                            <Icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                isActive ? "text-[var(--primary)]" : "text-foreground-muted"
                              )}
                            />
                            <span className="sidebar-label flex-1 truncate">
                              {item.label}
                            </span>
                            {hasBadge ? (
                              <span className="sidebar-badge ml-auto rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            ) : null}
                            <ChevronDown
                              className={cn(
                                "sidebar-chevron h-4 w-4 transition-transform",
                                isExpanded ? "rotate-180" : "rotate-0",
                                hasBadge ? "ml-2" : "ml-auto"
                              )}
                            />
                          </button>
                        ) : (
                          <Link href={item.href} onClick={onClose} className={itemClassName}>
                            <Icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                isActive ? "text-[var(--primary)]" : "text-foreground-muted"
                              )}
                            />
                            <span className="sidebar-label flex-1 truncate">
                              {item.label}
                            </span>
                            {hasBadge ? (
                              <span className="sidebar-badge ml-auto rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            ) : null}
                          </Link>
                        )}
                        {hasChildren && isExpanded ? (
                          <div className="sidebar-subnav ml-4 space-y-1 border-l border-[var(--card-border)] pl-3">
                            {children.map((child) => {
                              const isChildActive = isActiveRoute(pathname, child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onClose}
                                  className={cn(
                                    "group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                                    isChildActive
                                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                      : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      isChildActive
                                        ? "bg-[var(--primary)]"
                                        : "bg-foreground-muted/60"
                                    )}
                                  />
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

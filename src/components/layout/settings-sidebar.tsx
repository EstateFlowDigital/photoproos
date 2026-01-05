"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SETTINGS_NAVIGATION,
  type SettingsIconName,
} from "@/lib/constants/settings-navigation";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  UserIcon,
  PaletteIcon,
  CreditCardIcon,
  StripeIcon,
  BankIcon,
  UsersIcon,
  MapIcon,
  GiftIcon,
  MailIcon,
  MailOutlineIcon,
  MessageIcon,
  BellIcon,
  PlugIcon,
  CalendarIcon,
  DropboxIcon,
  SparklesIcon,
  CarIcon,
  CameraIcon,
  LayersIcon,
  CodeIcon,
} from "@/components/ui/settings-icons";

// ============================================================================
// Icon Mapping
// ============================================================================

const ICON_MAP: Record<SettingsIconName, React.FC<{ className?: string }>> = {
  user: UserIcon,
  palette: PaletteIcon,
  creditCard: CreditCardIcon,
  stripe: StripeIcon,
  bank: BankIcon,
  users: UsersIcon,
  map: MapIcon,
  gift: GiftIcon,
  mail: MailIcon,
  mailOutline: MailOutlineIcon,
  message: MessageIcon,
  bell: BellIcon,
  plug: PlugIcon,
  calendar: CalendarIcon,
  dropbox: DropboxIcon,
  sparkles: SparklesIcon,
  car: CarIcon,
  camera: CameraIcon,
  layers: LayersIcon,
  code: CodeIcon,
};

// ============================================================================
// Component
// ============================================================================

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const pathname = usePathname() || "";

  // Track expanded categories - initialize based on current path
  const [expandedCategories, setExpandedCategories] = React.useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    for (const category of SETTINGS_NAVIGATION) {
      // Expand if defaultOpen or if current path is in this category
      const isInCategory = category.items.some(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      );
      initial[category.id] = category.defaultOpen || isInCategory;
    }
    return initial;
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className={cn(
        "flex h-full w-[260px] flex-col border-r border-[var(--card-border)] bg-[var(--card)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-[var(--card-border)] px-4">
        <Link
          href="/dashboard"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          title="Back to Dashboard"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <span className="text-base font-semibold text-foreground">Settings</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {SETTINGS_NAVIGATION.map((category) => (
            <div key={category.id} className="mb-2">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-foreground-muted transition-colors hover:text-foreground"
              >
                <span>{category.label}</span>
                <ChevronDownIcon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    expandedCategories[category.id] ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {/* Category Items */}
              <div
                className={cn(
                  "mt-1 space-y-0.5 overflow-hidden transition-all duration-200",
                  expandedCategories[category.id]
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                {category.items.map((item) => {
                  const IconComponent = ICON_MAP[item.iconName];
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-[var(--primary)] text-white"
                          : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                      )}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            active
                              ? "text-white"
                              : "text-foreground-muted group-hover:text-foreground"
                          )}
                        />
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[var(--primary)]/10 text-[var(--primary)]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--card-border)] p-4">
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
              clipRule="evenodd"
            />
          </svg>
          <span>Settings Home</span>
        </Link>
      </div>
    </aside>
  );
}

export default SettingsSidebar;

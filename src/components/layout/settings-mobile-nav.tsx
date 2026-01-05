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
  XIcon,
  MenuIcon,
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
  SettingsIcon,
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
// Mobile Menu Button
// ============================================================================

interface SettingsMobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function SettingsMobileMenuButton({
  onClick,
  className,
}: SettingsMobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground lg:hidden",
        className
      )}
      aria-label="Open settings menu"
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );
}

// ============================================================================
// Mobile Navigation
// ============================================================================

interface SettingsMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsMobileNav({ isOpen, onClose }: SettingsMobileNavProps) {
  const pathname = usePathname() || "";

  // Track expanded categories
  const [expandedCategories, setExpandedCategories] = React.useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    for (const category of SETTINGS_NAVIGATION) {
      const isInCategory = category.items.some(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      );
      initial[category.id] = category.defaultOpen || isInCategory;
    }
    return initial;
  });

  // Close menu on route change
  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--card)] border-r border-[var(--card-border)] lg:hidden",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--card-border)] px-4">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-foreground-muted" />
            <span className="text-base font-semibold text-foreground">
              Settings
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            aria-label="Close menu"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Back to Dashboard */}
          <Link
            href="/dashboard"
            className="mb-4 flex items-center gap-2.5 rounded-lg border border-[var(--card-border)] px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="space-y-1">
            {SETTINGS_NAVIGATION.map((category) => (
              <div key={category.id} className="mb-2">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-xs font-medium uppercase tracking-wider text-foreground-muted transition-colors hover:text-foreground"
                >
                  <span>{category.label}</span>
                  <ChevronDownIcon
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      expandedCategories[category.id]
                        ? "rotate-180"
                        : "rotate-0"
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
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                          active
                            ? "bg-[var(--primary)] text-white"
                            : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                        )}
                      >
                        {IconComponent && (
                          <IconComponent
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-white" : "text-foreground-muted"
                            )}
                          />
                        )}
                        <span className="flex-1">{item.label}</span>
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
    </>
  );
}

export default SettingsMobileNav;

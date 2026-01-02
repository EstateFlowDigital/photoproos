"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  ChevronRight,
  Sparkles,
  Users,
  Images,
  CreditCard,
  Tag,
  Building2,
  Palette,
} from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
  organizationName?: string;
  className?: string;
}

const STORAGE_KEY = "onboarding-checklist-dismissed";

export function OnboardingChecklist({
  items,
  organizationName = "your business",
  className,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === "true");
    setIsLoaded(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Don't render until we've loaded the dismissed state
  if (!isLoaded) return null;

  // Don't render if dismissed or all completed
  if (isDismissed || allCompleted) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-transparent p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Finish setting up {organizationName}
            </h3>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Complete these steps to get the most out of your account
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-lg p-1.5 text-foreground-muted hover:bg-[var(--background-secondary)] hover:text-foreground transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-muted">
            {completedCount} of {totalCount} completed
          </span>
          <span className="font-medium text-[var(--primary)]">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--background-secondary)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.completed ? "#" : item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg p-3 transition-all",
              item.completed
                ? "cursor-default opacity-60"
                : "hover:bg-[var(--card)] hover:shadow-sm"
            )}
            onClick={(e) => item.completed && e.preventDefault()}
          >
            {/* Checkbox */}
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                item.completed
                  ? "border-[var(--success)] bg-[var(--success)] text-white"
                  : "border-[var(--border)] group-hover:border-[var(--primary)]"
              )}
            >
              {item.completed && <Check className="h-3.5 w-3.5" />}
            </div>

            {/* Icon */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                item.completed
                  ? "bg-[var(--background-secondary)] text-foreground-muted"
                  : "bg-[var(--primary)]/10 text-[var(--primary)]"
              )}
            >
              {item.icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  item.completed
                    ? "text-foreground-muted line-through"
                    : "text-foreground"
                )}
              >
                {item.label}
              </p>
              <p className="text-xs text-foreground-muted truncate">
                {item.description}
              </p>
            </div>

            {/* Arrow */}
            {!item.completed && (
              <ChevronRight className="h-4 w-4 shrink-0 text-foreground-muted group-hover:text-[var(--primary)] transition-colors" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Helper function to create default checklist items based on organization data
export function getChecklistItems(data: {
  hasClients: boolean;
  hasServices: boolean;
  hasGalleries: boolean;
  hasPaymentMethod: boolean;
  hasBranding: boolean;
  hasProperties: boolean;
  isRealEstate: boolean;
}): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      id: "clients",
      label: "Add your first client",
      description: "Start building your client database",
      href: "/clients/new",
      completed: data.hasClients,
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "services",
      label: "Create a service package",
      description: "Define your photography packages and pricing",
      href: "/services/new",
      completed: data.hasServices,
      icon: <Tag className="h-4 w-4" />,
    },
    {
      id: "galleries",
      label: "Create your first gallery",
      description: "Upload photos and deliver to clients",
      href: "/galleries/new",
      completed: data.hasGalleries,
      icon: <Images className="h-4 w-4" />,
    },
    {
      id: "branding",
      label: "Customize your branding",
      description: "Add your logo and brand colors",
      href: "/settings/branding",
      completed: data.hasBranding,
      icon: <Palette className="h-4 w-4" />,
    },
    {
      id: "payments",
      label: "Set up payments",
      description: "Connect Stripe to accept payments",
      href: "/settings/payments",
      completed: data.hasPaymentMethod,
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  // Add property-specific item for real estate
  if (data.isRealEstate) {
    items.splice(3, 0, {
      id: "properties",
      label: "Create a property website",
      description: "Build your first property listing page",
      href: "/properties/new",
      completed: data.hasProperties,
      icon: <Building2 className="h-4 w-4" />,
    });
  }

  return items;
}

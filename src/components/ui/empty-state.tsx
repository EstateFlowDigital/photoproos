"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

// Built-in icon presets for common empty states
export type EmptyStatePreset = "gallery" | "photos" | "clients" | "invoices" | "search" | "favorites" | "notifications";

interface EmptyStateProps {
  /** Lucide icon to display */
  icon?: LucideIcon;
  /** Use a built-in preset icon */
  preset?: EmptyStatePreset;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action element (button, link, etc.) or action config */
  action?: React.ReactNode | { label: string; href?: string; onClick?: () => void };
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Enable floating animation on icon */
  animated?: boolean;
}

export function EmptyState({
  icon: Icon,
  preset,
  title,
  description,
  action,
  className,
  size = "md",
  animated = true,
}: EmptyStateProps) {
  // Get icon from preset if not provided
  const FinalIcon = Icon || (preset ? getPresetIcon(preset) : undefined);

  const sizeStyles = {
    sm: {
      container: "p-6",
      iconBg: "p-3",
      iconSize: "h-5 w-5",
      title: "text-base",
      description: "text-xs",
    },
    md: {
      container: "p-12",
      iconBg: "p-4",
      iconSize: "h-8 w-8",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "p-16",
      iconBg: "p-6",
      iconSize: "h-10 w-10",
      title: "text-xl",
      description: "text-base",
    },
  };

  const styles = sizeStyles[size];

  // Floating animation
  const floatAnimation = animated
    ? {
        y: [0, -6, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }
    : {};

  // Render action button/link
  const renderAction = () => {
    if (!action) return null;

    // If action is already a React node, return it
    if (React.isValidElement(action)) {
      return <div className="mt-6">{action}</div>;
    }

    // If action is a config object
    if (typeof action === "object" && "label" in action) {
      const { label, href, onClick } = action;

      if (href) {
        return (
          <div className="mt-6">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              {label}
            </Link>
          </div>
        );
      }

      if (onClick) {
        return (
          <div className="mt-6">
            <button
              onClick={onClick}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              {label}
            </button>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-center",
        styles.container,
        className
      )}
    >
      {FinalIcon && (
        <motion.div
          className={cn(
            "mb-4 rounded-full",
            styles.iconBg,
            // Gradient background
            "bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background-secondary)] to-[var(--ai)]/10"
          )}
          animate={floatAnimation}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
          >
            <FinalIcon className={cn(styles.iconSize, "text-foreground-muted")} />
          </motion.div>
        </motion.div>
      )}

      <motion.h3
        className={cn("font-semibold text-foreground", styles.title)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          className={cn("mt-2 max-w-sm text-foreground-muted", styles.description)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {renderAction()}
        </motion.div>
      )}
    </div>
  );
}

// Preset icons
function getPresetIcon(preset: EmptyStatePreset): React.FC<{ className?: string }> {
  switch (preset) {
    case "gallery":
      return GalleryIcon;
    case "photos":
      return PhotosIcon;
    case "clients":
      return ClientsIcon;
    case "invoices":
      return InvoicesIcon;
    case "search":
      return SearchIcon;
    case "favorites":
      return FavoritesIcon;
    case "notifications":
      return NotificationsIcon;
    default:
      return PhotosIcon;
  }
}

// Built-in icons
function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
    </svg>
  );
}

function PhotosIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ClientsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
    </svg>
  );
}

function InvoicesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
    </svg>
  );
}

function FavoritesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  );
}

function NotificationsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
    </svg>
  );
}

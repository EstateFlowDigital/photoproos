"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type ActionId =
  | "new-gallery"
  | "new-client"
  | "new-invoice"
  | "new-booking"
  | "new-contract"
  | "new-property"
  | "upload-photos"
  | "send-email";

interface QuickAction {
  id: ActionId;
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

interface QuickActionsWidgetProps {
  actions?: ActionId[];
  layout?: "grid" | "list";
  className?: string;
}

// ============================================================================
// Action Definitions
// ============================================================================

const ACTION_DEFINITIONS: Record<ActionId, QuickAction> = {
  "new-gallery": {
    id: "new-gallery",
    label: "New Gallery",
    href: "/galleries/new",
    description: "Create a photo gallery",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
      </svg>
    ),
  },
  "new-client": {
    id: "new-client",
    label: "New Client",
    href: "/clients/new",
    description: "Add a new client",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
      </svg>
    ),
  },
  "new-invoice": {
    id: "new-invoice",
    label: "New Invoice",
    href: "/invoices/new",
    description: "Create an invoice",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  "new-booking": {
    id: "new-booking",
    label: "New Booking",
    href: "/scheduling/new",
    description: "Schedule a session",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
      </svg>
    ),
  },
  "new-contract": {
    id: "new-contract",
    label: "New Contract",
    href: "/contracts/new",
    description: "Create a contract",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
      </svg>
    ),
  },
  "new-property": {
    id: "new-property",
    label: "New Property",
    href: "/properties/new",
    description: "Add a property website",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
      </svg>
    ),
  },
  "upload-photos": {
    id: "upload-photos",
    label: "Upload Photos",
    href: "/galleries?action=upload",
    description: "Add photos to a gallery",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
      </svg>
    ),
  },
  "send-email": {
    id: "send-email",
    label: "Send Email",
    href: "/messaging/new",
    description: "Compose a message",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
        <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
      </svg>
    ),
  },
};

const DEFAULT_ACTIONS: ActionId[] = ["new-gallery", "new-client", "new-invoice", "new-booking"];

// ============================================================================
// Component
// ============================================================================

export function QuickActionsWidget({
  actions = DEFAULT_ACTIONS,
  layout = "grid",
  className,
}: QuickActionsWidgetProps) {
  const displayActions = actions.map((id) => ACTION_DEFINITIONS[id]).filter(Boolean);

  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-2 gap-2 sm:grid-cols-4"
          : "flex flex-col gap-2",
        className
      )}
    >
      {displayActions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={cn(
            "group flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-all hover:border-[var(--primary)] hover:bg-[var(--background-elevated)]",
            layout === "grid" && "flex-col text-center"
          )}
        >
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
            {action.icon}
          </span>
          <div className={cn(layout === "list" && "min-w-0 flex-1")}>
            <p className="text-sm font-medium text-foreground">
              {action.label}
            </p>
            {layout === "list" && action.description && (
              <p className="truncate text-xs text-foreground-muted">
                {action.description}
              </p>
            )}
          </div>
          {layout === "list" && (
            <svg
              className="h-4 w-4 flex-shrink-0 text-foreground-muted transition-transform group-hover:translate-x-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </Link>
      ))}
    </div>
  );
}

export default QuickActionsWidget;

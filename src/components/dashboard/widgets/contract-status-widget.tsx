"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface Contract {
  id: string;
  title: string;
  client: string;
  status: "draft" | "sent" | "viewed" | "signed" | "expired";
  sentAt?: Date;
  signedAt?: Date;
  expiresAt?: Date;
}

interface ContractStatusWidgetProps {
  contracts?: Contract[];
  maxItems?: number;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const STATUS_STYLES: Record<Contract["status"], { bg: string; text: string; label: string }> = {
  draft: {
    bg: "bg-[var(--background-secondary)]",
    text: "text-foreground-muted",
    label: "Draft",
  },
  sent: {
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    label: "Awaiting",
  },
  viewed: {
    bg: "bg-[var(--warning)]/10",
    text: "text-[var(--warning)]",
    label: "Viewed",
  },
  signed: {
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    label: "Signed",
  },
  expired: {
    bg: "bg-[var(--error)]/10",
    text: "text-[var(--error)]",
    label: "Expired",
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================================================
// Component
// ============================================================================

export function ContractStatusWidget({
  contracts = [],
  maxItems = 5,
  className,
}: ContractStatusWidgetProps) {
  // Filter to pending contracts (not signed or expired)
  const pendingContracts = contracts
    .filter((c) => c.status !== "signed")
    .slice(0, maxItems);

  // Stats
  const stats = {
    awaiting: contracts.filter((c) => c.status === "sent" || c.status === "viewed").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    expired: contracts.filter((c) => c.status === "expired").length,
  };

  if (pendingContracts.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/10">
          <svg
            className="h-5 w-5 text-[var(--success)]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">All contracts signed</p>
        <p className="mt-1 text-xs text-foreground-muted">No pending contracts</p>
        <Link
          href="/contracts/new"
          className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Create contract
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-[var(--primary)]/10 px-3 py-2 text-center">
          <p className="text-lg font-semibold text-[var(--primary)]">{stats.awaiting}</p>
          <p className="text-xs text-foreground-muted">Awaiting</p>
        </div>
        <div className="rounded-lg bg-[var(--success)]/10 px-3 py-2 text-center">
          <p className="text-lg font-semibold text-[var(--success)]">{stats.signed}</p>
          <p className="text-xs text-foreground-muted">Signed</p>
        </div>
        <div className="rounded-lg bg-[var(--error)]/10 px-3 py-2 text-center">
          <p className="text-lg font-semibold text-[var(--error)]">{stats.expired}</p>
          <p className="text-xs text-foreground-muted">Expired</p>
        </div>
      </div>

      {/* Contracts list */}
      <ul className="space-y-2">
        {pendingContracts.map((contract) => (
          <li key={contract.id}>
            <Link
              href={`/contracts/${contract.id}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-3 transition-colors hover:bg-[var(--background-elevated)]"
            >
              {/* Status indicator */}
              <span
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  STATUS_STYLES[contract.status].bg
                )}
              >
                <svg
                  className={cn("h-4 w-4", STATUS_STYLES[contract.status].text)}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" />
                </svg>
              </span>

              {/* Contract info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {contract.title}
                </p>
                <p className="truncate text-xs text-foreground-muted">
                  {contract.client}
                </p>
              </div>

              {/* Status badge & time */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_STYLES[contract.status].bg,
                    STATUS_STYLES[contract.status].text
                  )}
                >
                  {STATUS_STYLES[contract.status].label}
                </span>
                {contract.sentAt && (
                  <span className="text-xs text-foreground-muted">
                    Sent {formatTimeAgo(contract.sentAt)}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* View all link */}
      {contracts.length > maxItems && (
        <Link
          href="/contracts"
          className="block text-center text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View all {contracts.length} contracts
        </Link>
      )}
    </div>
  );
}

export default ContractStatusWidget;

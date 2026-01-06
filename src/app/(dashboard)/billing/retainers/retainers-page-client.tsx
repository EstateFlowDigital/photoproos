"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

type Retainer = {
  id: string;
  name: string;
  client?: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string | null;
  } | null;
  balanceCents: number;
  totalDepositedCents: number;
  totalUsedCents: number;
  isActive: boolean;
  lowBalanceThresholdCents: number | null;
  transactions: Array<{
    id: string;
    amountCents: number;
    createdAt: string | Date;
    type: string;
  }>;
};

interface Props {
  retainers: Retainer[];
  filter: string;
}

export function RetainersPageClient({ retainers, filter }: Props) {
  if (!retainers.length) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
        <p className="text-sm text-foreground-muted">No retainers found for this filter.</p>
        <Link
          href="/billing/retainers/new"
          className="mt-3 inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary)]/90"
        >
          Create retainer
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="hidden grid-cols-5 gap-4 bg-[var(--background-secondary)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground-muted sm:grid">
        <span>Retainer</span>
        <span>Client</span>
        <span className="text-right">Balance</span>
        <span className="text-right">Deposited</span>
        <span className="text-right">Used</span>
      </div>
      <div className="divide-y divide-[var(--card-border)]">
        {retainers.map((retainer) => {
          const lowBalance =
            retainer.lowBalanceThresholdCents !== null &&
            retainer.balanceCents <= retainer.lowBalanceThresholdCents;
          return (
            <div key={retainer.id} className="grid gap-3 px-4 py-3 sm:grid-cols-5 sm:items-center sm:gap-4">
              <div className="space-y-1">
                <Link
                  href={`/billing/retainers/${retainer.id}`}
                  className="text-sm font-semibold text-foreground hover:text-[var(--primary)]"
                >
                  {retainer.name || "Untitled Retainer"}
                </Link>
                <p className="text-xs text-foreground-muted">
                  {retainer.isActive ? "Active" : "Inactive"}{lowBalance ? " · Low balance" : ""}
                </p>
              </div>
              <div className="text-sm text-foreground">
                {retainer.client?.fullName || retainer.client?.company || "No client"}
                {retainer.client?.email && (
                  <div className="text-xs text-foreground-muted">{retainer.client.email}</div>
                )}
              </div>
              <div className="text-sm font-semibold text-right text-foreground">
                {formatCurrency(retainer.balanceCents)}
              </div>
              <div className="text-sm text-right text-foreground-muted">
                {formatCurrency(retainer.totalDepositedCents)}
              </div>
              <div className="text-sm text-right text-foreground-muted">
                {formatCurrency(retainer.totalUsedCents)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

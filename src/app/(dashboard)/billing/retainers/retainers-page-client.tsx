"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";
import type { RetainerTransactionType } from "@prisma/client";
import { updateRetainer, addDeposit } from "@/lib/actions/retainers";

interface RetainerTransaction {
  id: string;
  type: RetainerTransactionType;
  amountCents: number;
  description: string | null;
  balanceAfterCents: number;
  createdAt: Date;
}

interface Retainer {
  id: string;
  clientId: string;
  balanceCents: number;
  totalDepositedCents: number;
  totalUsedCents: number;
  lowBalanceThresholdCents: number | null;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string;
  };
  transactions: RetainerTransaction[];
}

interface RetainersPageClientProps {
  retainers: Retainer[];
  filter: string;
}

export function RetainersPageClient({ retainers, filter }: RetainersPageClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [depositModal, setDepositModal] = useState<{ id: string; clientName: string } | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const filteredRetainers = retainers.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.client.fullName?.toLowerCase().includes(query) ||
      r.client.company?.toLowerCase().includes(query) ||
      r.client.email.toLowerCase().includes(query)
    );
  });

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    setIsLoading(id);
    const result = await updateRetainer(id, { isActive: !currentlyActive });
    if (result.success) {
      router.refresh();
    }
    setIsLoading(null);
  };

  const handleAddDeposit = async () => {
    if (!depositModal || !depositAmount) return;
    const amountCents = Math.round(parseFloat(depositAmount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;

    setIsLoading(depositModal.id);
    const result = await addDeposit(depositModal.id, {
      amountCents,
      description: "Manual deposit",
    });
    if (result.success) {
      router.refresh();
      setDepositModal(null);
      setDepositAmount("");
    }
    setIsLoading(null);
  };

  const isLowBalance = (r: Retainer) => {
    return r.lowBalanceThresholdCents !== null && r.balanceCents <= r.lowBalanceThresholdCents;
  };

  const getTransactionIcon = (type: RetainerTransactionType) => {
    switch (type) {
      case "deposit":
        return <ArrowDownIcon className="h-3 w-3 text-[var(--success)]" />;
      case "usage":
        return <ArrowUpIcon className="h-3 w-3 text-[var(--primary)]" />;
      case "refund":
        return <ArrowUpIcon className="h-3 w-3 text-[var(--warning)]" />;
      case "adjustment":
        return <AdjustIcon className="h-3 w-3 text-foreground-muted" />;
      default:
        return null;
    }
  };

  if (filteredRetainers.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
        <WalletIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {searchQuery ? "No retainers found" : "No retainer accounts yet"}
        </h3>
        <p className="mt-2 text-foreground-muted">
          {searchQuery
            ? "Try adjusting your search terms"
            : "Create retainer accounts to track prepaid client balances."}
        </p>
        {!searchQuery && (
          <Link
            href="/billing/retainers/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            New Retainer
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search retainers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Retainers Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRetainers.map((retainer) => (
            <div
              key={retainer.id}
              className={cn(
                "rounded-xl border bg-[var(--card)] p-5 transition-colors",
                isLowBalance(retainer)
                  ? "border-[var(--warning)]/50"
                  : "border-[var(--card-border)]",
                !retainer.isActive && "opacity-60"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/clients/${retainer.client.id}`}
                    className="font-semibold text-foreground hover:text-[var(--primary)]"
                  >
                    {retainer.client.fullName || retainer.client.company || "Unknown"}
                  </Link>
                  <p className="text-sm text-foreground-muted">{retainer.client.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isLowBalance(retainer) && (
                    <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                      Low
                    </span>
                  )}
                  {!retainer.isActive && (
                    <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div className="mt-4">
                <p className="text-sm text-foreground-muted">Current Balance</p>
                <p className={cn(
                  "text-2xl font-bold",
                  isLowBalance(retainer) ? "text-[var(--warning)]" : "text-foreground"
                )}>
                  {formatCurrency(retainer.balanceCents)}
                </p>
                {retainer.lowBalanceThresholdCents && (
                  <p className="text-xs text-foreground-muted">
                    Alert below {formatCurrency(retainer.lowBalanceThresholdCents)}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--card-border)] pt-4">
                <div>
                  <p className="text-xs text-foreground-muted">Deposited</p>
                  <p className="font-medium text-[var(--success)]">
                    {formatCurrency(retainer.totalDepositedCents)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">Used</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(retainer.totalUsedCents)}
                  </p>
                </div>
              </div>

              {/* Recent Transactions */}
              {retainer.transactions.length > 0 && (
                <div className="mt-4 border-t border-[var(--card-border)] pt-4">
                  <p className="mb-2 text-xs font-medium text-foreground-muted">Recent Activity</p>
                  <div className="space-y-1">
                    {retainer.transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          {getTransactionIcon(tx.type)}
                          <span className="text-foreground-muted capitalize">
                            {tx.type.replace("_", " ")}
                          </span>
                        </div>
                        <span className={cn(
                          "font-medium",
                          tx.type === "deposit" ? "text-[var(--success)]" : "text-foreground"
                        )}>
                          {tx.type === "deposit" ? "+" : "-"}{formatCurrency(tx.amountCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-[var(--card-border)] pt-4">
                <button
                  onClick={() => setDepositModal({ id: retainer.id, clientName: retainer.client.fullName || "Client" })}
                  disabled={!retainer.isActive || isLoading === retainer.id}
                  className="flex-1 rounded-lg bg-[var(--success)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                >
                  Add Deposit
                </button>
                <Link
                  href={`/billing/retainers/${retainer.id}`}
                  className="flex-1 rounded-lg bg-[var(--background-secondary)] px-3 py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-tertiary)]"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleToggleActive(retainer.id, retainer.isActive)}
                  disabled={isLoading === retainer.id}
                  className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-[var(--background-tertiary)] hover:text-foreground disabled:opacity-50"
                  title={retainer.isActive ? "Deactivate" : "Activate"}
                >
                  {retainer.isActive ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-lg font-semibold text-foreground">Add Deposit</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Add funds to {depositModal.clientName}&apos;s retainer account
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground">Amount</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] py-2 pl-8 pr-4 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setDepositModal(null);
                  setDepositAmount("");
                }}
                className="flex-1 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeposit}
                disabled={!depositAmount || isLoading === depositModal.id}
                className="flex-1 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
              >
                Add Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M1 4.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25ZM1 7.25a3.733 3.733 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 0 1 7.25ZM7 8a1 1 0 0 1 1 1 2 2 0 1 0 4 0 1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8H7Z" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" />
    </svg>
  );
}

function AdjustIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M17 10a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 .75.75Z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
    </svg>
  );
}

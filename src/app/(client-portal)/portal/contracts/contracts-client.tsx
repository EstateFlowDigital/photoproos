"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Download, CheckCircle2, Clock, Send, AlertCircle } from "lucide-react";

interface ContractSigner {
  id: string;
  email: string;
  name: string | null;
  signedAt: string | null;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  sentAt: string | null;
  signedAt: string | null;
  createdAt: string;
  signers: ContractSigner[];
}

interface PortalContractsClientProps {
  contracts: Contract[];
}

export function PortalContractsClient({ contracts }: PortalContractsClientProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "signed">("all");

  const filteredContracts = contracts.filter((contract) => {
    if (filter === "all") return true;
    if (filter === "pending") return contract.status !== "SIGNED";
    if (filter === "signed") return contract.status === "SIGNED";
    return true;
  });

  const pendingCount = contracts.filter((c) => c.status !== "SIGNED").length;
  const signedCount = contracts.filter((c) => c.status === "SIGNED").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-element="portal-contracts-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
        <p className="mt-1 text-foreground-muted">
          View and sign your contracts
        </p>
      </div>

      {/* Stats */}
      {contracts.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Total Contracts</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{contracts.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Pending Signature</p>
            <p className="mt-1 text-2xl font-bold text-[var(--warning)]">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Signed</p>
            <p className="mt-1 text-2xl font-bold text-[var(--success)]">{signedCount}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {contracts.length > 0 && (
        <div className="mb-6 flex gap-2">
          <FilterButton
            label="All"
            count={contracts.length}
            isActive={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {pendingCount > 0 && (
            <FilterButton
              label="Pending"
              count={pendingCount}
              isActive={filter === "pending"}
              onClick={() => setFilter("pending")}
              variant="warning"
            />
          )}
          {signedCount > 0 && (
            <FilterButton
              label="Signed"
              count={signedCount}
              isActive={filter === "signed"}
              onClick={() => setFilter("signed")}
              variant="success"
            />
          )}
        </div>
      )}

      {/* Contract List */}
      {contracts.length === 0 ? (
        <EmptyState />
      ) : filteredContracts.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-foreground-muted">No contracts match the current filter.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-2 text-sm text-[var(--primary)] hover:underline"
          >
            Show all contracts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContractCard({ contract }: { contract: Contract }) {
  const statusConfig = getStatusConfig(contract.status);
  const needsSignature = contract.status === "SENT" || contract.status === "PENDING";

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
            <FileText className="h-5 w-5 text-foreground-muted" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{contract.title}</h3>
            <p className="text-sm text-foreground-muted">
              {contract.sentAt
                ? `Sent ${formatDate(contract.sentAt)}`
                : `Created ${formatDate(contract.createdAt)}`}
              {contract.signedAt && ` • Signed ${formatDate(contract.signedAt)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusConfig.style}`}>
            <statusConfig.icon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </span>

          {/* Actions */}
          {needsSignature && (
            <Link
              href={`/portal/contracts/${contract.id}/sign`}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Sign Now
            </Link>
          )}

          {contract.status === "SIGNED" && (
            <button
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--card-border)]"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          )}
        </div>
      </div>

      {/* Signers */}
      {contract.signers.length > 0 && (
        <div className="mt-4 border-t border-[var(--card-border)] pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground-muted">
            Signers
          </p>
          <div className="flex flex-wrap gap-2">
            {contract.signers.map((signer) => (
              <span
                key={signer.id}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  signer.signedAt
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                }`}
              >
                {signer.signedAt ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {signer.name || signer.email}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case "SIGNED":
      return {
        label: "Signed",
        icon: CheckCircle2,
        style: "bg-[var(--success)]/10 text-[var(--success)]",
      };
    case "SENT":
      return {
        label: "Awaiting Signature",
        icon: Send,
        style: "bg-[var(--warning)]/10 text-[var(--warning)]",
      };
    case "PENDING":
      return {
        label: "Pending",
        icon: Clock,
        style: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        icon: AlertCircle,
        style: "bg-[var(--error)]/10 text-[var(--error)]",
      };
    default:
      return {
        label: status,
        icon: FileText,
        style: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
      };
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
      <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
        <FileText className="h-8 w-8 text-foreground-muted" />
      </div>
      <p className="mt-4 text-lg font-medium text-foreground">No contracts yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-muted">
        Your contracts will appear here when your photographer sends them. You&apos;ll be able to
        view details, sign digitally, and download signed copies.
      </p>
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  variant?: "default" | "warning" | "success";
}

function FilterButton({ label, count, isActive, onClick, variant = "default" }: FilterButtonProps) {
  const variantStyles = {
    default: isActive
      ? "bg-[var(--foreground)] text-[var(--background)]"
      : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)]",
    warning: isActive
      ? "bg-[var(--warning)] text-white"
      : "bg-[var(--warning)]/10 text-[var(--warning)] hover:bg-[var(--warning)]/20",
    success: isActive
      ? "bg-[var(--success)] text-white"
      : "bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border border-[var(--card-border)] px-3 py-1.5 text-sm font-medium transition-colors ${variantStyles[variant]}`}
    >
      {label}
      <span className="opacity-70">{count}</span>
    </button>
  );
}

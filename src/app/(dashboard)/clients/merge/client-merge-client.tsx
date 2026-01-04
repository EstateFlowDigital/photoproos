"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  findDuplicateClients,
  getClientMergePreview,
  mergeClients,
  type DuplicateGroup,
} from "@/lib/actions/client-merge";

type MergePreview = Awaited<ReturnType<typeof getClientMergePreview>> extends { success: true; data: infer T } ? T : never;

export function ClientMergeClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const [primaryClientId, setPrimaryClientId] = useState<string | null>(null);
  const [secondaryClientId, setSecondaryClientId] = useState<string | null>(null);
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [keepSecondaryEmail, setKeepSecondaryEmail] = useState(true);
  const [keepSecondaryPhone, setKeepSecondaryPhone] = useState(true);

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    setIsLoading(true);
    const result = await findDuplicateClients();
    if (result.success) {
      setDuplicates(result.data.duplicates);
    } else {
      showToast(result.error, "error");
    }
    setIsLoading(false);
  };

  const loadMergePreview = async () => {
    if (!primaryClientId || !secondaryClientId) return;

    const result = await getClientMergePreview(primaryClientId, secondaryClientId);
    if (result.success) {
      setMergePreview(result.data);
    } else {
      showToast(result.error, "error");
    }
  };

  useEffect(() => {
    if (primaryClientId && secondaryClientId) {
      loadMergePreview();
    } else {
      setMergePreview(null);
    }
  }, [primaryClientId, secondaryClientId]);

  const handleSelectGroup = (group: DuplicateGroup) => {
    setSelectedGroup(group);
    setPrimaryClientId(null);
    setSecondaryClientId(null);
    setMergePreview(null);
  };

  const handleSelectClient = (clientId: string, role: "primary" | "secondary") => {
    if (role === "primary") {
      setPrimaryClientId(clientId);
      if (secondaryClientId === clientId) {
        setSecondaryClientId(null);
      }
    } else {
      setSecondaryClientId(clientId);
      if (primaryClientId === clientId) {
        setPrimaryClientId(null);
      }
    }
  };

  const handleMerge = async () => {
    if (!primaryClientId || !secondaryClientId) return;

    setIsMerging(true);
    const result = await mergeClients(primaryClientId, secondaryClientId, {
      keepSecondaryEmail,
      keepSecondaryPhone,
    });

    if (result.success) {
      showToast(
        `Successfully merged clients. Transferred ${Object.values(result.data.recordsTransferred).reduce((a, b) => a + b, 0)} records.`,
        "success"
      );
      // Reload duplicates
      await loadDuplicates();
      setSelectedGroup(null);
      setPrimaryClientId(null);
      setSecondaryClientId(null);
      setMergePreview(null);
    } else {
      showToast(result.error, "error");
    }
    setIsMerging(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getConfidenceBadgeClasses = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/30";
      case "medium":
        return "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/30";
      default:
        return "bg-[var(--foreground-muted)]/10 text-foreground-muted border-[var(--foreground-muted)]/30";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <span className="text-foreground-muted">Scanning for duplicates...</span>
        </div>
      </div>
    );
  }

  if (duplicates.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/10">
          <CheckIcon className="h-6 w-6 text-[var(--success)]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Duplicates Found</h3>
        <p className="mt-2 text-foreground-muted">
          Your client database is clean! No potential duplicate records were detected.
        </p>
        <button
          onClick={() => router.push("/clients")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Duplicate Groups List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Potential Duplicates ({duplicates.length} groups)
          </h2>
          <button
            onClick={loadDuplicates}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {duplicates.map((group, index) => (
            <button
              key={index}
              onClick={() => handleSelectGroup(group)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors",
                selectedGroup === group
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)]"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        getConfidenceBadgeClasses(group.confidence)
                      )}
                    >
                      {group.confidence} confidence
                    </span>
                    <span className="text-xs text-foreground-muted">
                      {group.matchType} match
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {group.clients.slice(0, 3).map((client) => (
                      <p key={client.id} className="text-sm text-foreground">
                        {client.fullName || client.email}
                        {client.projectCount > 0 && (
                          <span className="ml-2 text-foreground-muted">
                            ({client.projectCount} projects)
                          </span>
                        )}
                      </p>
                    ))}
                    {group.clients.length > 3 && (
                      <p className="text-sm text-foreground-muted">
                        +{group.clients.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
                <span className="rounded-full bg-[var(--background-secondary)] px-2 py-1 text-xs font-medium text-foreground">
                  {group.clients.length} clients
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Merge Panel */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        {!selectedGroup ? (
          <div className="flex h-full items-center justify-center py-12 text-center">
            <div>
              <MergeIcon className="mx-auto h-12 w-12 text-foreground-muted" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Select a Duplicate Group
              </h3>
              <p className="mt-2 text-sm text-foreground-muted">
                Click on a duplicate group on the left to review and merge clients.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Merge Clients
              </h3>
              <p className="text-sm text-foreground-muted">
                Select a primary client (to keep) and secondary client (to merge in).
              </p>
            </div>

            {/* Client Selection */}
            <div className="space-y-3">
              {selectedGroup.clients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    primaryClientId === client.id
                      ? "border-[var(--success)] bg-[var(--success)]/5"
                      : secondaryClientId === client.id
                        ? "border-[var(--warning)] bg-[var(--warning)]/5"
                        : "border-[var(--card-border)] bg-[var(--background-secondary)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {client.fullName || "No name"}
                      </p>
                      <p className="text-sm text-foreground-muted">{client.email}</p>
                      {client.phone && (
                        <p className="text-sm text-foreground-muted">{client.phone}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground-muted">
                        <span>{client.projectCount} projects</span>
                        <span>•</span>
                        <span>{client.invoiceCount} invoices</span>
                        <span>•</span>
                        <span>{formatCurrency(client.lifetimeRevenueCents)} revenue</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectClient(client.id, "primary")}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          primaryClientId === client.id
                            ? "bg-[var(--success)] text-white"
                            : "bg-[var(--background)] border border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]"
                        )}
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => handleSelectClient(client.id, "secondary")}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                          secondaryClientId === client.id
                            ? "bg-[var(--warning)] text-white"
                            : "bg-[var(--background)] border border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]"
                        )}
                      >
                        Merge
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Merge Preview */}
            {mergePreview && (
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
                <h4 className="font-medium text-foreground mb-3">Merge Preview</h4>
                <p className="text-sm text-foreground-muted mb-3">
                  The following records will be transferred from{" "}
                  <span className="font-medium text-foreground">{mergePreview.secondary.email}</span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground">{mergePreview.primary.email}</span>:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(mergePreview.recordsToTransfer).map(([key, count]) => (
                    count > 0 && (
                      <div key={key} className="flex justify-between">
                        <span className="text-foreground-muted capitalize">{key}</span>
                        <span className="font-medium text-foreground">{count}</span>
                      </div>
                    )
                  ))}
                </div>

                {/* Options */}
                <div className="mt-4 pt-4 border-t border-[var(--card-border)] space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={keepSecondaryEmail}
                      onChange={(e) => setKeepSecondaryEmail(e.target.checked)}
                      className="rounded border-[var(--card-border)]"
                    />
                    <span className="text-foreground">Save secondary email to notes</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={keepSecondaryPhone}
                      onChange={(e) => setKeepSecondaryPhone(e.target.checked)}
                      className="rounded border-[var(--card-border)]"
                    />
                    <span className="text-foreground">Save secondary phone to notes</span>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-[var(--card-border)]">
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setPrimaryClientId(null);
                  setSecondaryClientId(null);
                  setMergePreview(null);
                }}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                disabled={!primaryClientId || !secondaryClientId || isMerging}
                className="flex-1 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMerging ? "Merging..." : "Merge Clients"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function MergeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

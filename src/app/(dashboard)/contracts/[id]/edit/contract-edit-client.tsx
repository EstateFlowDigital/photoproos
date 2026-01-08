"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updateContract, sendContract } from "@/lib/actions/contracts";
import {
  addContractSigner,
  removeContractSigner,
  resendSigningInvitation,
} from "@/lib/actions/contract-signing";
import type { ContractStatus } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

interface Client {
  id: string;
  fullName: string | null;
  company: string | null;
  email: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  content: string;
}

interface Signer {
  id: string;
  email: string;
  name: string | null;
  signedAt: Date | null;
  sortOrder: number;
}

interface Contract {
  id: string;
  name: string;
  content: string;
  status: ContractStatus;
  clientId: string | null;
  templateId: string | null;
  expiresAt: Date | null;
  sentAt: Date | null;
  signers: Signer[];
  client: {
    id: string;
    fullName: string | null;
    company: string | null;
    email: string;
  } | null;
}

interface ContractEditClientProps {
  contract: Contract;
  clients: Client[];
  templates: Template[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ContractEditClient({
  contract,
  clients,
  templates: _templates,
}: ContractEditClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState(contract.name);
  const [content, setContent] = useState(contract.content);
  const [clientId, setClientId] = useState(contract.clientId || "");
  const [expiresAt, setExpiresAt] = useState(
    contract.expiresAt
      ? new Date(contract.expiresAt).toISOString().split("T")[0]
      : ""
  );

  // Signer state
  const [signers, setSigners] = useState<Signer[]>(contract.signers);
  const [newSignerEmail, setNewSignerEmail] = useState("");
  const [newSignerName, setNewSignerName] = useState("");
  const [showAddSigner, setShowAddSigner] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"content" | "signers">("content");

  const hasUnsavedChanges =
    name !== contract.name ||
    content !== contract.content ||
    clientId !== (contract.clientId || "") ||
    expiresAt !==
      (contract.expiresAt
        ? new Date(contract.expiresAt).toISOString().split("T")[0]
        : "");

  const canSend = contract.status === "draft" && signers.length > 0;
  const isSent = contract.status === "sent";

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateContract(contract.id, {
        name,
        content,
        clientId: clientId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      if (result.success) {
        showToast("Contract saved", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to save contract", "error");
      }
    });
  };

  const handleSend = () => {
    if (signers.length === 0) {
      showToast("Add at least one signer before sending", "error");
      return;
    }

    startTransition(async () => {
      // Save first if there are changes
      if (hasUnsavedChanges) {
        const saveResult = await updateContract(contract.id, {
          name,
          content,
          clientId: clientId || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        if (!saveResult.success) {
          showToast("Failed to save contract before sending", "error");
          return;
        }
      }

      const result = await sendContract(contract.id);

      if (result.success) {
        showToast("Contract sent to signers", "success");
        router.push(`/contracts/${contract.id}`);
        router.refresh();
      } else {
        showToast(result.error || "Failed to send contract", "error");
      }
    });
  };

  const handleAddSigner = () => {
    if (!newSignerEmail.trim()) {
      showToast("Email is required", "error");
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newSignerEmail)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    startTransition(async () => {
      const result = await addContractSigner({
        contractId: contract.id,
        email: newSignerEmail.trim(),
        name: newSignerName.trim() || undefined,
      });

      if (result.success) {
        showToast("Signer added", "success");
        setSigners([
          ...signers,
          {
            id: result.data.id,
            email: newSignerEmail.trim(),
            name: newSignerName.trim() || null,
            signedAt: null,
            sortOrder: signers.length,
          },
        ]);
        setNewSignerEmail("");
        setNewSignerName("");
        setShowAddSigner(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to add signer", "error");
      }
    });
  };

  const handleRemoveSigner = (signerId: string) => {
    const signer = signers.find((s) => s.id === signerId);
    if (signer?.signedAt) {
      showToast("Cannot remove a signer who has already signed", "error");
      return;
    }

    startTransition(async () => {
      const result = await removeContractSigner(signerId);

      if (result.success) {
        showToast("Signer removed", "success");
        setSigners(signers.filter((s) => s.id !== signerId));
        router.refresh();
      } else {
        showToast(result.error || "Failed to remove signer", "error");
      }
    });
  };

  const handleResendInvitation = (signerId: string) => {
    startTransition(async () => {
      const result = await resendSigningInvitation(signerId);

      if (result.success) {
        showToast("Invitation resent", "success");
      } else {
        showToast(result.error || "Failed to resend invitation", "error");
      }
    });
  };

  const handleAddClientAsSigner = () => {
    if (!contract.client) return;

    setNewSignerEmail(contract.client.email);
    setNewSignerName(
      contract.client.fullName || contract.client.company || ""
    );
    setShowAddSigner(true);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-500">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              Unsaved changes
            </span>
          )}
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
            contract.status === "draft" && "bg-[var(--background-tertiary)] text-foreground-muted",
            contract.status === "sent" && "bg-[var(--primary)]/10 text-[var(--primary)]",
            contract.status === "signed" && "bg-[var(--success)]/10 text-[var(--success)]"
          )}>
            {contract.status === "draft" && "Draft"}
            {contract.status === "sent" && "Awaiting Signatures"}
            {contract.status === "signed" && "Signed"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending || !hasUnsavedChanges}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>

          {!isSent && (
            <button
              onClick={handleSend}
              disabled={isPending || !canSend}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              <SendIcon className="h-4 w-4" />
              {isPending ? "Sending..." : "Send for Signing"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--card-border)]">
        <button
          onClick={() => setActiveTab("content")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
            activeTab === "content"
              ? "border-[var(--primary)] text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground"
          )}
        >
          Contract Content
        </button>
        <button
          onClick={() => setActiveTab("signers")}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2",
            activeTab === "signers"
              ? "border-[var(--primary)] text-foreground"
              : "border-transparent text-foreground-muted hover:text-foreground"
          )}
        >
          Signers
          <span
            className={cn(
              "px-1.5 py-0.5 text-xs rounded-full",
              signers.length > 0
                ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                : "bg-[var(--background-tertiary)] text-foreground-muted"
            )}
          >
            {signers.length}
          </span>
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Details Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Contract Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Contract Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Client
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={isSent}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none disabled:opacity-50"
                  >
                    <option value="">No client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.fullName || client.company || client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Expires On
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Contract Content
            </h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSent}
              rows={16}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-foreground font-mono focus:border-[var(--primary)] focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Signers Tab */}
      {activeTab === "signers" && (
        <div className="space-y-6">
          {/* Add Signer Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Signers
              </h2>
              {!showAddSigner && (
                <button
                  onClick={() => setShowAddSigner(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Signer
                </button>
              )}
            </div>

            {showAddSigner && (
              <div className="mb-6 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Add New Signer
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Email <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                      type="email"
                      value={newSignerEmail}
                      onChange={(e) => setNewSignerEmail(e.target.value)}
                      placeholder="signer@example.com"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground-muted mb-1">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={newSignerName}
                      onChange={(e) => setNewSignerName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleAddSigner}
                      disabled={isPending}
                      className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50"
                    >
                      {isPending ? "Adding..." : "Add Signer"}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSigner(false);
                        setNewSignerEmail("");
                        setNewSignerName("");
                      }}
                      className="text-sm text-foreground-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Add Client */}
            {contract.client &&
              !signers.some((s) => s.email === contract.client?.email) && (
                <button
                  onClick={handleAddClientAsSigner}
                  className="mb-4 w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-[var(--card-border)] text-sm text-foreground-muted hover:text-foreground hover:border-[var(--border-hover)] transition-colors"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add {contract.client.fullName || contract.client.email} as
                  signer
                </button>
              )}

            {/* Signers List */}
            {signers.length > 0 ? (
              <div className="space-y-3">
                {signers.map((signer) => (
                  <div
                    key={signer.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      signer.signedAt
                        ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                        : "border-[var(--card-border)] bg-[var(--background)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                          signer.signedAt
                            ? "bg-[var(--success)]/20 text-[var(--success)]"
                            : "bg-[var(--background-tertiary)] text-foreground-muted"
                        )}
                      >
                        {signer.signedAt ? (
                          <CheckIcon className="h-5 w-5" />
                        ) : (
                          (signer.name || signer.email)
                            .substring(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {signer.name || signer.email}
                        </p>
                        {signer.name && (
                          <p className="text-xs text-foreground-muted">
                            {signer.email}
                          </p>
                        )}
                        {signer.signedAt && (
                          <p className="text-xs text-[var(--success)]">
                            Signed on{" "}
                            {new Date(signer.signedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!signer.signedAt && isSent && (
                        <button
                          onClick={() => handleResendInvitation(signer.id)}
                          disabled={isPending}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
                        >
                          Resend
                        </button>
                      )}
                      {!signer.signedAt && (
                        <button
                          onClick={() => handleRemoveSigner(signer.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlusIcon className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
                <p className="text-sm text-foreground-muted mb-2">
                  No signers added yet
                </p>
                <p className="text-xs text-foreground-muted">
                  Add at least one signer before sending the contract
                </p>
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              How Signing Works
            </h3>
            <ul className="space-y-2 text-xs text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                Each signer receives a unique, secure signing link via email
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                Signers can draw or type their signature
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                All signatures are tracked with timestamps and IP addresses
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                You&apos;ll be notified when all parties have signed
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.046 15.253c-.058.468.172.92.57 1.175A9.953 9.953 0 0 0 8 18c1.982 0 3.83-.578 5.384-1.573.398-.254.628-.707.57-1.175a6.001 6.001 0 0 0-11.908 0ZM15.75 6a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5a.75.75 0 0 1 .75-.75Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

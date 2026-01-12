export const dynamic = "force-dynamic";

import { PageHeader, Breadcrumb } from "@/components/dashboard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContract, deleteContract, sendContract } from "@/lib/actions/contracts";
import { cancelContract } from "@/lib/actions/contract-signing";
import { ContractDownloadButton } from "./contract-download-button";
import { cn } from "@/lib/utils";
import { formatStatusLabel, getStatusBadgeClasses } from "@/lib/status-badges";
import { sanitizeRichText } from "@/lib/sanitize";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

interface ContractDetailPageProps {
  params: Promise<{ id: string }>;
}

// Helper to format date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Status badge classes are centralized in lib/status-badges.ts

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const { id } = await params;

  const contract = await getContract(id);

  if (!contract) {
    notFound();
  }

  const statusLabel = contract.status === "sent"
    ? "Awaiting Signature"
    : formatStatusLabel(contract.status);
  const statusClasses = cn(
    getStatusBadgeClasses(contract.status),
    contract.status === "cancelled" && "line-through"
  );
  const clientName = contract.client?.fullName || contract.client?.company || "No client";
  const signedCount = contract.signers.filter(s => s.signedAt).length;
  const totalSigners = contract.signers.length;

  // Map signers with their signature data
  const mappedSigners = contract.signers.map(signer => {
    const signature = contract.signatures.find(sig => sig.signerId === signer.id);
    return {
      ...signer,
      hasSigned: !!signer.signedAt,
      signature: signature ? {
        signedAt: signature.signedAt,
        type: signature.signatureType,
        ipAddress: signature.ipAddress,
      } : null,
    };
  });

  // Server action handlers
  async function handleSend() {
    "use server";
    const result = await sendContract(id);
    if (result.success) {
      revalidatePath(`/contracts/${id}`);
    }
  }

  async function handleCancel() {
    "use server";
    const result = await cancelContract(id);
    if (result.success) {
      revalidatePath(`/contracts/${id}`);
    }
  }

  async function handleDelete() {
    "use server";
    const result = await deleteContract(id);
    if (result.success) {
      redirect("/contracts");
    }
  }

  return (
    <div className="space-y-6" data-element="contracts-detail-page">
      <Breadcrumb
        items={[
          { label: "Contracts", href: "/contracts" },
          { label: contract.name },
        ]}
      />

      <PageHeader
        title={contract.name}
        subtitle={
          <span className="flex items-center gap-3 flex-wrap">
            <span className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
              statusClasses
            )}>
              {statusLabel}
            </span>
            <span className="text-foreground-muted">•</span>
            <span>Created {formatDateShort(contract.createdAt)}</span>
            {contract.client && (
              <>
                <span className="text-foreground-muted">•</span>
                <Link
                  href={`/clients/${contract.client.id}`}
                  className="text-[var(--primary)] hover:underline"
                >
                  {clientName}
                </Link>
              </>
            )}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>

            {contract.status === "draft" && (
              <>
                <Link
                  href={`/contracts/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  <EditIcon className="h-4 w-4" />
                  Edit
                </Link>
                {totalSigners > 0 && (
                  <form action={handleSend}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                    >
                      <SendIcon className="h-4 w-4" />
                      Send Contract
                    </button>
                  </form>
                )}
              </>
            )}

            {(contract.status === "sent" || contract.status === "expired") && (
              <form action={handleCancel}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
                >
                  <CancelIcon className="h-4 w-4" />
                  Cancel Contract
                </button>
              </form>
            )}
          </div>
        }
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Contract Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Preview */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <h2 className="font-semibold text-foreground">Contract Content</h2>
            </div>
            <div className="p-6">
              <div
                className="prose prose-invert max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(contract.content) }}
              />
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <h2 className="font-semibold text-foreground">Activity Log</h2>
            </div>
            <div className="divide-y divide-[var(--card-border)]">
              {contract.auditLogs.length > 0 ? (
                contract.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--foreground-muted)]/15">
                      <ActivityIcon action={log.action} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatAction(log.action)}
                      </p>
                      {log.actorEmail && (
                        <p className="text-xs text-foreground-muted">
                          by {log.actorEmail}
                        </p>
                      )}
                      <p className="text-xs text-foreground-muted mt-1">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-foreground-muted">
                  No activity yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Signers Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold text-foreground">Signers</h2>
              {totalSigners > 0 && (
                <span className="text-sm text-foreground-muted">
                  {signedCount}/{totalSigners} signed
                </span>
              )}
            </div>
            <div className="p-6">
              {totalSigners > 0 ? (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--success)] transition-all duration-300"
                      style={{ width: `${(signedCount / totalSigners) * 100}%` }}
                    />
                  </div>

                  {/* Signer List */}
                  <div className="space-y-3">
                    {mappedSigners.map((signer) => (
                      <div
                        key={signer.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3",
                          signer.hasSigned
                            ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                            : "border-[var(--card-border)] bg-[var(--background-secondary)]"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                          signer.hasSigned
                            ? "bg-[var(--success)]/20 text-[var(--success)]"
                            : "bg-[var(--background-tertiary)] text-foreground-muted"
                        )}>
                          {signer.hasSigned ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            signer.name?.substring(0, 2).toUpperCase() || signer.email.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {signer.name || signer.email}
                          </p>
                          {signer.name && (
                            <p className="text-xs text-foreground-muted truncate">
                              {signer.email}
                            </p>
                          )}
                          {signer.hasSigned && signer.signedAt && (
                            <p className="text-xs text-[var(--success)] mt-0.5">
                              Signed {formatDateShort(signer.signedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-foreground-muted mb-3">
                    No signers added yet
                  </p>
                  {contract.status === "draft" && (
                    <Link
                      href={`/contracts/${id}/edit`}
                      className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add signers
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Details Card */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <h2 className="font-semibold text-foreground">Details</h2>
            </div>
            <div className="p-6 space-y-4">
              {contract.client && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-1">
                    Client
                  </p>
                  <Link
                    href={`/clients/${contract.client.id}`}
                    className="text-sm text-foreground hover:text-[var(--primary)]"
                  >
                    {clientName}
                  </Link>
                  {contract.client.email && (
                    <p className="text-xs text-foreground-muted">{contract.client.email}</p>
                  )}
                </div>
              )}

              {contract.template && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-1">
                    Template
                  </p>
                  <p className="text-sm text-foreground">
                    {contract.template.name}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-1">
                  Created
                </p>
                <p className="text-sm text-foreground">
                  {formatDateShort(contract.createdAt)}
                </p>
              </div>

              {contract.sentAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-1">
                    Sent
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDateShort(contract.sentAt)}
                  </p>
                </div>
              )}

              {contract.signedAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-1">
                    Fully Signed
                  </p>
                  <p className="text-sm text-[var(--success)]">
                    {formatDateShort(contract.signedAt)}
                  </p>
                </div>
              )}

              {contract.expiresAt && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted mb-1">
                    Expires
                  </p>
                  <p className={cn(
                    "text-sm",
                    new Date(contract.expiresAt) < new Date()
                      ? "text-[var(--error)]"
                      : "text-foreground"
                  )}>
                    {formatDateShort(contract.expiresAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Download/Export Actions - Available for all contracts */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
              <h2 className="font-semibold text-foreground">Export</h2>
            </div>
            <div className="p-6 space-y-3">
              <ContractDownloadButton contractId={id} />
            </div>
          </div>

          {/* Actions Card - Only for draft/cancelled contracts */}
          {(contract.status === "draft" || contract.status === "cancelled") && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
              <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
                <h2 className="font-semibold text-foreground">Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href={`/contracts/new?duplicate=${id}`}
                  className="flex items-center gap-3 w-full rounded-lg border border-[var(--card-border)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-secondary)]"
                >
                  <CopyIcon className="h-4 w-4 text-foreground-muted" />
                  Duplicate Contract
                </Link>
                <form action={handleDelete}>
                  <button
                    type="submit"
                    className="flex items-center gap-3 w-full rounded-lg border border-[var(--error)]/30 px-4 py-3 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Contract
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format action names
function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    contract_created: "Contract created",
    contract_updated: "Contract updated",
    contract_sent: "Contract sent for signature",
    contract_signed: "Contract signed",
    contract_cancelled: "Contract cancelled",
    signer_added: "Signer added",
    signer_removed: "Signer removed",
    invitation_resent: "Signing invitation resent",
    expiration_extended: "Expiration date extended",
  };
  return actionMap[action] || action.replace(/_/g, " ");
}

// Icon Components
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function CancelIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12a1.5 1.5 0 0 1 .439 1.061V14.5A1.5 1.5 0 0 1 15.5 16H8.5A1.5 1.5 0 0 1 7 14.5V3.5Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-2h-4.5A2.5 2.5 0 0 1 6 12V6H4.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ActivityIcon({ action }: { action: string }) {
  const iconClass = "h-4 w-4 text-foreground-muted";

  switch (action) {
    case "contract_created":
      return <PlusIcon className={iconClass} />;
    case "contract_sent":
      return <SendIcon className={iconClass} />;
    case "contract_signed":
      return <CheckIcon className="h-4 w-4 text-[var(--success)]" />;
    case "contract_cancelled":
      return <CancelIcon className="h-4 w-4 text-[var(--error)]" />;
    case "signer_added":
    case "signer_removed":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
        </svg>
      );
  }
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { updateInvoiceStatus, deleteInvoice } from "@/lib/actions/invoices";
import { generateInvoicePdf } from "@/lib/actions/invoice-pdf";
import type { InvoiceStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface InvoiceActionsProps {
  invoiceId: string;
  currentStatus: InvoiceStatus;
  clientEmail: string | null;
}

export function InvoiceActions({ invoiceId, currentStatus, clientEmail }: InvoiceActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setIsLoading(true);
    setShowMenu(false);
    try {
      const result = await updateInvoiceStatus(invoiceId, newStatus);
      if (result.success) {
        showToast(`Invoice marked as ${newStatus}`, "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to update status", "error");
      }
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete invoice",
      description: "Are you sure you want to delete this draft invoice? This action cannot be undone.",
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!confirmed) return;

    setIsLoading(true);
    setShowMenu(false);
    try {
      const result = await deleteInvoice(invoiceId);
      if (result.success) {
        showToast("Invoice deleted", "success");
        router.push("/invoices");
      } else {
        showToast(result.error || "Failed to delete invoice", "error");
      }
    } catch {
      showToast("Failed to delete invoice", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = () => {
    if (clientEmail) {
      const subject = encodeURIComponent(`Invoice ${invoiceId.slice(0, 8).toUpperCase()}`);
      const body = encodeURIComponent(
        `Hi,\n\nPlease find attached your invoice.\n\nYou can view and pay your invoice at:\n${window.location.href}\n\nThank you for your business!`
      );
      window.location.href = `mailto:${clientEmail}?subject=${subject}&body=${body}`;
    } else {
      showToast("No client email address", "error");
    }
    setShowMenu(false);
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setShowMenu(false);

    try {
      const result = await generateInvoicePdf(invoiceId);

      if (!result.success || !result.pdfBuffer) {
        showToast(result.error || "Failed to generate PDF", "error");
        return;
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdfBuffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || `invoice-${invoiceId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Invoice PDF downloaded", "success");
    } catch {
      showToast("Failed to download invoice", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {/* Primary Action based on status */}
      {currentStatus === "draft" && (
        <button
          onClick={() => handleStatusChange("sent")}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
          Send Invoice
        </button>
      )}

      {currentStatus === "sent" && (
        <button
          onClick={() => handleStatusChange("paid")}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <CheckIcon className="h-4 w-4" />
          Mark as Paid
        </button>
      )}

      {currentStatus === "overdue" && (
        <button
          onClick={() => handleStatusChange("paid")}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          <CheckIcon className="h-4 w-4" />
          Mark as Paid
        </button>
      )}

      {/* More Actions Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
        >
          <MoreIcon className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-lg">
              {currentStatus === "draft" && (
                <>
                  <button
                    onClick={handleSendEmail}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                  >
                    <MailIcon className="h-4 w-4" />
                    Send via Email
                  </button>
                  {/* Edit page coming in future update */}
                </>
              )}

              {currentStatus === "sent" && (
                <button
                  onClick={handleSendEmail}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  <MailIcon className="h-4 w-4" />
                  Send Reminder
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                <DownloadIcon className="h-4 w-4" />
                {isLoading ? "Generating PDF..." : "Download PDF"}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied to clipboard", "success");
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
              >
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </button>

              {currentStatus !== "paid" && currentStatus !== "cancelled" && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)]"
                >
                  <XIcon className="h-4 w-4" />
                  Cancel Invoice
                </button>
              )}

              {currentStatus === "draft" && (
                <>
                  <div className="my-1 border-t border-[var(--card-border)]" />
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Invoice
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Icons
function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
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

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
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

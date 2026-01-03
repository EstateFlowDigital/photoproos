"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";
import { deleteClient, impersonateClientPortal } from "@/lib/actions/clients";
import { createTaskFromClient } from "@/lib/actions/projects";

interface ClientActionsProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
}

export function ClientActions({
  clientId,
  clientName,
  clientEmail,
}: ClientActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const handleAddToProject = async () => {
    setIsAddingToProject(true);
    try {
      const result = await createTaskFromClient(clientId);
      if (result.success && result.taskId) {
        showToast("Added to project board", "success");
        router.push(`/projects`);
      } else if (!result.success) {
        showToast(result.error || "Failed to add to project", "error");
      }
    } catch {
      showToast("Failed to add to project", "error");
    } finally {
      setIsAddingToProject(false);
    }
  };

  const handleDelete = async () => {
    const result = await deleteClient(clientId);

    if (result.success) {
      showToast("Client deleted successfully", "success");
      setShowDeleteModal(false);
      router.push("/clients");
      router.refresh();
    } else {
      showToast(result.error || "Failed to delete client", "error");
    }
  };

  const handleImpersonate = async () => {
    setIsImpersonating(true);
    try {
      const result = await impersonateClientPortal(clientId);
      if (result.success) {
        const portalUrl = result.data.portalUrl || "/portal";
        const newWindow = window.open(portalUrl, "_blank", "noopener,noreferrer");
        if (!newWindow) {
          window.location.href = portalUrl;
        }
      } else {
        showToast(result.error || "Unable to open client portal", "error");
      }
    } catch {
      showToast("Unable to open client portal", "error");
    } finally {
      setIsImpersonating(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
        <div className="space-y-2">
          <a
            href={`mailto:${clientEmail}`}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <EmailIcon className="h-4 w-4 text-foreground-muted" />
            Send Email
          </a>
          <button
            type="button"
            onClick={handleImpersonate}
            disabled={isImpersonating}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            <ImpersonateIcon className="h-4 w-4 text-foreground-muted" />
            {isImpersonating ? "Opening Portal..." : "View Client Portal"}
          </button>
          <Link
            href={`/galleries/new?client=${clientId}`}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <PhotoIcon className="h-4 w-4 text-foreground-muted" />
            Create Gallery
          </Link>
          <Link
            href={`/properties/new?client=${clientId}`}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <PropertyIcon className="h-4 w-4 text-foreground-muted" />
            Create Property Website
          </Link>
          <Link
            href={`/scheduling/new?client=${clientId}`}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <CalendarIcon className="h-4 w-4 text-foreground-muted" />
            Schedule Shoot
          </Link>
          <Link
            href={`/invoices/new?clientId=${clientId}`}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <InvoiceIcon className="h-4 w-4 text-foreground-muted" />
            Create Invoice
          </Link>
          <button
            type="button"
            onClick={handleAddToProject}
            disabled={isAddingToProject}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            <ProjectIcon className="h-4 w-4 text-foreground-muted" />
            {isAddingToProject ? "Adding..." : "Add to Project"}
          </button>
          <hr className="border-[var(--card-border)] my-2" />
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
          >
            <TrashIcon className="h-4 w-4" />
            Delete Client
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Client"
        description="Are you sure you want to delete this client? All associated data including galleries, bookings, and payment history will be permanently removed."
        itemName={clientName}
      />
    </>
  );
}

// Icon Components
function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
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

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z" clipRule="evenodd" />
    </svg>
  );
}

function PropertyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ImpersonateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 10.75a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
      <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8-6.5a5.5 5.5 0 0 0-4.313 9.02c.04.04.083.079.125.118A6.48 6.48 0 0 0 10 14.5a6.48 6.48 0 0 0 4.188-1.862c.043-.04.085-.078.125-.118A5.5 5.5 0 0 0 10 3.5Z" clipRule="evenodd" />
    </svg>
  );
}

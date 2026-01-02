"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { duplicateService, deleteService } from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";

interface ServiceQuickActionsProps {
  serviceId: string;
  serviceName: string;
  isDefault?: boolean;
  usageCount?: number;
}

export function ServiceQuickActions({
  serviceId,
  serviceName,
  isDefault = false,
  usageCount = 0,
}: ServiceQuickActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const result = await duplicateService(serviceId);
      if (result.success) {
        showToast(`Created "${serviceName} (Copy)"`, "success");
        router.push(`/galleries/services/${result.data.id}`);
      } else {
        showToast(result.error, "error");
      }
    } catch {
      showToast("Failed to duplicate service", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    const result = await deleteService(serviceId);
    if (result.success) {
      showToast("Service deleted successfully", "success");
      setShowDeleteModal(false);
      router.push("/services");
      router.refresh();
    } else {
      showToast(result.error || "Failed to delete service", "error");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleDuplicate}
          disabled={isDuplicating}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors text-left disabled:opacity-50"
        >
          <DuplicateIcon className="h-4 w-4" />
          {isDuplicating ? "Duplicating..." : "Duplicate Service"}
        </button>
        <Link
          href={`/galleries/new?serviceId=${serviceId}`}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
        >
          <GalleryIcon className="h-4 w-4" />
          Create Gallery with this Service
        </Link>
        <Link
          href={`/scheduling/new?serviceId=${serviceId}`}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
        >
          <CalendarIcon className="h-4 w-4" />
          Create Booking with this Service
        </Link>
        {!isDefault && (
          <>
            <hr className="border-[var(--card-border)] my-2" />
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors text-left"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Service
            </button>
          </>
        )}
      </div>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Service"
        description={
          usageCount > 0
            ? `This service has been used in ${usageCount} galleries/bookings. Deleting it will not affect existing data, but you won't be able to use it for new projects.`
            : "Are you sure you want to delete this service? This action cannot be undone."
        }
        itemName={serviceName}
      />
    </>
  );
}

// Icons
function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
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

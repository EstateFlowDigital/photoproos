"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";
import { deleteGallery } from "@/lib/actions/galleries";

interface GalleryActionsProps {
  galleryId: string;
  galleryName: string;
  photoCount: number;
}

export function GalleryActions({
  galleryId,
  galleryName,
  photoCount,
}: GalleryActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    const result = await deleteGallery(galleryId);

    if (result.success) {
      showToast("Gallery deleted successfully", "success");
      setShowDeleteModal(false);
      router.push("/galleries");
      router.refresh();
    } else {
      showToast(result.error || "Failed to delete gallery", "error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Gallery"
        description={`Are you sure you want to delete this gallery? This will permanently remove all ${photoCount} photos and cannot be undone.`}
        itemName={galleryName}
      />
    </>
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

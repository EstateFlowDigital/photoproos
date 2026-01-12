"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal";
import { QRCodeModal } from "@/components/ui/qr-code";
import { deleteGallery } from "@/lib/actions/galleries";
import { getOrCreateProjectConversation } from "@/lib/actions/conversations";

interface GalleryActionsProps {
  galleryId: string;
  galleryName: string;
  photoCount: number;
  deliveryLink?: string | null;
  hasFavorites?: boolean;
}

export function GalleryActions({
  galleryId,
  galleryName,
  photoCount,
  deliveryLink,
  hasFavorites = false,
}: GalleryActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDownloadingProofSheet, setIsDownloadingProofSheet] = useState(false);
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [isExportingFavorites, setIsExportingFavorites] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  const handleDownloadProofSheet = useCallback(async () => {
    setIsDownloadingProofSheet(true);
    try {
      const response = await fetch(`/api/gallery/${galleryId}/proof-sheet`);
      if (!response.ok) {
        // Try to get error details from JSON response
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to generate proof sheet");
        }
        throw new Error(`Failed to generate proof sheet (${response.status})`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${galleryName.replace(/[^a-z0-9]/gi, "-").substring(0, 50)}-proof-sheet.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Proof sheet downloaded successfully", "success");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[GalleryActions] Error downloading proof sheet:", error);
      }
      const message = error instanceof Error ? error.message : "Failed to download proof sheet";
      showToast(message, "error");
    } finally {
      setIsDownloadingProofSheet(false);
    }
  }, [galleryId, galleryName, showToast]);

  const handleExportFavorites = useCallback(async (format: "csv" | "zip" | "json") => {
    setIsExportingFavorites(true);
    setShowFavoritesMenu(false);
    try {
      const response = await fetch(`/api/gallery/${galleryId}/favorites-export?format=${format}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to export favorites");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "zip" ? "zip" : format === "json" ? "json" : "csv";
      a.download = `${galleryName.replace(/[^a-z0-9]/gi, "-")}-favorites.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Favorites exported successfully", "success");
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[GalleryActions] Error exporting favorites:", error);
      }
      showToast(error instanceof Error ? error.message : "Failed to export favorites", "error");
    } finally {
      setIsExportingFavorites(false);
    }
  }, [galleryId, galleryName, showToast]);

  const handleOpenTeamChat = useCallback(async () => {
    setIsOpeningChat(true);
    try {
      const result = await getOrCreateProjectConversation(galleryId);
      if (result.success) {
        router.push(`/messages/${result.data.id}`);
      } else {
        showToast(result.error || "Failed to open team chat", "error");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[GalleryActions] Error opening team chat:", error);
      }
      showToast("Failed to open team chat", "error");
    } finally {
      setIsOpeningChat(false);
    }
  }, [galleryId, router, showToast]);

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
      {deliveryLink && (
        <button
          type="button"
          onClick={() => setShowQRModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          title="QR Code"
        >
          <QRIcon className="h-4 w-4" />
          <span className="hidden md:inline">QR Code</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleOpenTeamChat}
        disabled={isOpeningChat}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Team Chat"
      >
        <ChatIcon className="h-4 w-4" />
        <span className="hidden md:inline">{isOpeningChat ? "Opening..." : "Team Chat"}</span>
      </button>

      <button
        type="button"
        onClick={handleDownloadProofSheet}
        disabled={isDownloadingProofSheet || photoCount === 0}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        title="Proof Sheet"
      >
        <ProofSheetIcon className="h-4 w-4" />
        <span className="hidden md:inline">{isDownloadingProofSheet ? "Generating..." : "Proof Sheet"}</span>
      </button>

      {hasFavorites && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
            disabled={isExportingFavorites}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Favorites"
          >
            <HeartIcon className="h-4 w-4" />
            <span className="hidden md:inline">{isExportingFavorites ? "Exporting..." : "Favorites"}</span>
            <ChevronDownIcon className="h-3 w-3 hidden md:block" />
          </button>

          {showFavoritesMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg">
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => handleExportFavorites("csv")}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export as CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportFavorites("json")}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Export as JSON
                </button>
                <button
                  type="button"
                  onClick={() => handleExportFavorites("zip")}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download as ZIP
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowDeleteModal(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
        title="Delete"
      >
        <TrashIcon className="h-4 w-4" />
        <span className="hidden md:inline">Delete</span>
      </button>

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Gallery"
        description={`Are you sure you want to delete this gallery? This will permanently remove all ${photoCount} photos and cannot be undone.`}
        itemName={galleryName}
      />

      {deliveryLink && (
        <QRCodeModal
          url={deliveryLink}
          title={galleryName}
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
        />
      )}
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

function QRIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M3.75 2A1.75 1.75 0 0 0 2 3.75v3.5C2 8.216 2.784 9 3.75 9h3.5A1.75 1.75 0 0 0 9 7.25v-3.5A1.75 1.75 0 0 0 7.25 2h-3.5ZM3.5 3.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM3.75 11A1.75 1.75 0 0 0 2 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 9 16.25v-3.5A1.75 1.75 0 0 0 7.25 11h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM12.75 2A1.75 1.75 0 0 0 11 3.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 18 7.25v-3.5A1.75 1.75 0 0 0 16.25 2h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM11 12.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Zm3-3a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H15.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h1.75a.75.75 0 0 0 0-1.5H15.5Zm-4 3a.75.75 0 0 1 .75-.75h4.75a.75.75 0 0 1 0 1.5h-4.75a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ProofSheetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 5.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.102 41.102 0 0 1-3.55.414c-.28.02-.521.18-.643.413l-1.712 3.293a.75.75 0 0 1-1.33 0l-1.713-3.293a.783.783 0 0 0-.642-.413 41.108 41.108 0 0 1-3.55-.414C1.993 13.245 1 11.986 1 10.574V5.426c0-1.413.993-2.67 2.43-2.902Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

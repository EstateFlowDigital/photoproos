"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { createGallery } from "@/lib/actions/galleries";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface CreateGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (gallery: { id: string; name: string }) => void;
  clients: Client[];
  defaultClientId?: string;
}

export function CreateGalleryModal({
  open,
  onOpenChange,
  onSuccess,
  clients,
  defaultClientId,
}: CreateGalleryModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [priceCents, setPriceCents] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Gallery name is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createGallery({
          name: name.trim(),
          description: description.trim() || null,
          clientId: clientId || null,
          serviceId: null,
          locationId: null,
          status: "draft",
          priceCents,
          currency: "USD",
          coverImageUrl: null,
          password: null,
          expiresAt: null,
          allowDownloads: true,
          showWatermark: false,
          allowFavorites: true,
          sendNotifications: true,
        });

        if (result.success) {
          // Reset form
          setName("");
          setDescription("");
          setClientId(defaultClientId || "");
          setPriceCents(0);
          onOpenChange(false);

          // Call success callback
          onSuccess?.({ id: result.data.id, name: name.trim() });

          // Navigate to the new gallery
          router.push(`/galleries/${result.data.id}`);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setDescription("");
      setClientId(defaultClientId || "");
      setPriceCents(0);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create New Gallery</DialogTitle>
          <DialogDescription>
            Set up a new photo gallery for your client. You can add photos after creating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {error && (
              <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
                {error}
              </div>
            )}

            {/* Gallery Name */}
            <div>
              <label htmlFor="gallery-name" className="block text-sm font-medium text-foreground mb-1.5">
                Gallery Name <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                id="gallery-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Downtown Luxury Listing"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="gallery-description" className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                id="gallery-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this gallery..."
                rows={2}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
            </div>

            {/* Client Selection */}
            <div>
              <label htmlFor="gallery-client" className="block text-sm font-medium text-foreground mb-1.5">
                Client
              </label>
              <select
                id="gallery-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="gallery-price" className="block text-sm font-medium text-foreground mb-1.5">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                <input
                  type="number"
                  id="gallery-price"
                  value={priceCents / 100}
                  onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                Set to $0 for free access, or enter a price for pay-to-unlock
              </p>
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Gallery"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

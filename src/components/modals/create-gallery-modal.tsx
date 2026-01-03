"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { createGallery } from "@/lib/actions/galleries";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface FieldErrors {
  name?: string;
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
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [priceCents, setPriceCents] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "name" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: "Gallery name is required" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getInputClassName = (fieldName: keyof FieldErrors) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    return cn(
      "w-full rounded-lg border bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1",
      hasError
        ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
        : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Gallery name is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ name: true });
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

          showToast(`Gallery "${name.trim()}" created successfully`, "success");

          // Call success callback
          onSuccess?.({ id: result.data.id, name: name.trim() });

          // Navigate to the new gallery
          router.push(`/galleries/${result.data.id}`);
        } else {
          setError(result.error);
          showToast(result.error, "error");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        showToast("An unexpected error occurred", "error");
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
      setFieldErrors({});
      setTouched({});
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
                onBlur={(e) => handleBlur("name", e.target.value)}
                placeholder="e.g., Downtown Luxury Listing"
                className={getInputClassName("name")}
                autoFocus
              />
              {touched.name && fieldErrors.name && (
                <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.name}</p>
              )}
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
            <Select
              name="client"
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Select a client..."
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.name} (${client.email})`,
              }))}
            />

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

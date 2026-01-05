"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ServiceSelector, type DatabaseServiceType } from "@/components/dashboard/service-selector";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getServiceById, type ServiceType } from "@/lib/services";
import { updateGallery, deleteGallery } from "@/lib/actions/galleries";
import { useToast } from "@/components/ui/toast";

// Union type for selected service (can be static or database service)
type SelectedService = ServiceType | DatabaseServiceType | null;

interface FieldErrors {
  name?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface GalleryData {
  id: string;
  name: string;
  description: string;
  clientId: string;
  priceCents: number;
  serviceId?: string;
  serviceDescription?: string;
  accessType: "public" | "password";
  coverImageUrl: string | null;
  expiresAt: Date | null;
  settings: {
    allowDownloads: boolean;
    allowFavorites: boolean;
    showWatermarks: boolean;
    emailNotifications: boolean;
  };
}

interface GalleryEditFormProps {
  gallery: GalleryData;
  clients: Client[];
  services?: DatabaseServiceType[];
}

export function GalleryEditForm({ gallery, clients, services }: GalleryEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Service & pricing state
  const dbService = services?.find((service) => service.id === gallery.serviceId);
  const staticService = gallery.serviceId ? getServiceById(gallery.serviceId) : null;
  const initialService = dbService || staticService || null;
  const [selectedService, setSelectedService] = useState<SelectedService>(initialService || null);
  const [price, setPrice] = useState(gallery.priceCents);
  const [serviceDescription, setServiceDescription] = useState(gallery.serviceDescription || "");

  // Form field state
  const [name, setName] = useState(gallery.name);
  const [galleryDescription, setGalleryDescription] = useState(gallery.description);
  const [clientId, setClientId] = useState(gallery.clientId);
  const [accessType, setAccessType] = useState<"public" | "password">(gallery.accessType);
  const [settings, setSettings] = useState(gallery.settings);

  // Expiration state - determine initial type based on existing expiresAt
  const getInitialExpirationType = (): "never" | "30days" | "60days" | "90days" | "custom" => {
    if (!gallery.expiresAt) return "never";

    const expiresDate = new Date(gallery.expiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 28 && diffDays <= 32) return "30days";
    if (diffDays >= 58 && diffDays <= 62) return "60days";
    if (diffDays >= 88 && diffDays <= 92) return "90days";
    return "custom";
  };

  const [expirationType, setExpirationType] = useState<"never" | "30days" | "60days" | "90days" | "custom">(
    getInitialExpirationType()
  );
  const [customExpirationDate, setCustomExpirationDate] = useState(
    gallery.expiresAt && getInitialExpirationType() === "custom"
      ? new Date(gallery.expiresAt).toISOString().split('T')[0]
      : ""
  );

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Gallery name is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ name: true });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate expiresAt based on expiration type
      let expiresAt: Date | null = null;
      if (expirationType === "30days") {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else if (expirationType === "60days") {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 60);
      } else if (expirationType === "90days") {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90);
      } else if (expirationType === "custom" && customExpirationDate) {
        expiresAt = new Date(customExpirationDate);
      }

      const result = await updateGallery({
        id: gallery.id,
        name: name.trim(),
        description: galleryDescription.trim() || null,
        clientId: clientId || null,
        serviceId: selectedService?.id || null,
        priceCents: price,
        password: accessType === "password" ? undefined : null, // Keep existing password or clear
        expiresAt,
        allowDownloads: settings.allowDownloads,
        showWatermark: settings.showWatermarks,
        // Note: allowFavorites and emailNotifications would need schema updates
      });

      if (result.success) {
        showToast("Gallery updated successfully", "success");
        router.push(`/galleries/${gallery.id}`);
        router.refresh();
      } else {
        showToast(result.error || "Failed to update gallery", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteGallery(gallery.id);

      if (result.success) {
        showToast("Gallery deleted successfully", "success");
        router.push("/galleries");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete gallery", "error");
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Gallery Details Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Details</h2>

        <div className="space-y-4">
          {/* Gallery Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Gallery Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => handleBlur("name", e.target.value)}
              className={getInputClassName("name")}
            />
            {touched.name && fieldErrors.name && (
              <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="galleryDescription" className="block text-sm font-medium text-foreground mb-1.5">
              Gallery Description
            </label>
            <textarea
              id="galleryDescription"
              name="galleryDescription"
              rows={3}
              value={galleryDescription}
              onChange={(e) => setGalleryDescription(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Client Selection */}
          <div>
            <Select
              name="clientId"
              label="Client"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Select a client..."
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.name} (${client.email})`,
              }))}
            />
            <p className="mt-1.5 text-xs text-foreground-muted">
              Or{" "}
              <Link href="/clients/new" className="text-[var(--primary)] hover:underline">
                create a new client
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Service & Pricing Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Service & Pricing</h2>
        <p className="text-sm text-foreground-muted mb-6">
          Select a predefined service package or set custom pricing for this gallery.
        </p>

        <ServiceSelector
          services={services}
          selectedServiceId={selectedService?.id}
          customPrice={price}
          customDescription={serviceDescription}
          onServiceChange={setSelectedService}
          onPriceChange={setPrice}
          onDescriptionChange={setServiceDescription}
          mode="gallery"
        />
      </div>

      {/* Access Type Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Access Control</h2>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="accessType"
              value="public"
              checked={accessType === "public"}
              onChange={() => setAccessType("public")}
              className="mt-0.5 h-4 w-4 rounded-full border-2 border-[var(--border-visible)] bg-transparent checked:border-[var(--primary)] checked:bg-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 focus:ring-offset-transparent"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Public Link</span>
              <p className="text-xs text-foreground-muted">Anyone with the link can view (and pay to download)</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="accessType"
              value="password"
              checked={accessType === "password"}
              onChange={() => setAccessType("password")}
              className="mt-0.5 h-4 w-4 rounded-full border-2 border-[var(--border-visible)] bg-transparent checked:border-[var(--primary)] checked:bg-[var(--primary)] focus:ring-[var(--primary)] focus:ring-offset-0 focus:ring-offset-transparent"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Password Protected</span>
              <p className="text-xs text-foreground-muted">Require a password to view the gallery</p>
            </div>
          </label>
        </div>
      </div>

      {/* Cover Image Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Cover Image</h2>

        {gallery.coverImageUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--background)]">
              <img
                src={gallery.coverImageUrl}
                alt="Cover"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 rounded-lg bg-black/50 p-1.5 text-white hover:bg-black/70"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Replace Cover Image
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
            <UploadIcon className="mx-auto h-10 w-10 text-foreground-muted" />
            <p className="mt-3 text-sm text-foreground">
              <span className="text-[var(--primary)] font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              PNG, JPG, or WebP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Gallery Settings Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>

        <div className="space-y-4">
          <ToggleSetting
            label="Allow Downloads"
            description="Let clients download photos after payment"
            checked={settings.allowDownloads}
            onToggle={() => toggleSetting("allowDownloads")}
          />
          <ToggleSetting
            label="Allow Favorites"
            description="Let clients mark their favorite photos"
            checked={settings.allowFavorites}
            onToggle={() => toggleSetting("allowFavorites")}
          />
          <ToggleSetting
            label="Show Watermarks"
            description="Display watermarks on photos until purchased"
            checked={settings.showWatermarks}
            onToggle={() => toggleSetting("showWatermarks")}
          />
          <ToggleSetting
            label="Email Notifications"
            description="Get notified when clients view or purchase"
            checked={settings.emailNotifications}
            onToggle={() => toggleSetting("emailNotifications")}
          />
        </div>
      </div>

      {/* Gallery Expiration Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Gallery Expiration</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Set when this gallery should expire and become inaccessible
        </p>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--border-hover)] transition-colors">
            <input
              type="radio"
              name="expirationType"
              checked={expirationType === "never"}
              onChange={() => setExpirationType("never")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Never Expires</div>
              <div className="text-xs text-foreground-muted mt-0.5">
                Gallery stays accessible indefinitely
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--border-hover)] transition-colors">
            <input
              type="radio"
              name="expirationType"
              checked={expirationType === "30days"}
              onChange={() => setExpirationType("30days")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">30 Days From Now</div>
              <div className="text-xs text-foreground-muted mt-0.5">
                Gallery expires in 30 days
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--border-hover)] transition-colors">
            <input
              type="radio"
              name="expirationType"
              checked={expirationType === "60days"}
              onChange={() => setExpirationType("60days")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">60 Days From Now</div>
              <div className="text-xs text-foreground-muted mt-0.5">
                Gallery expires in 60 days
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--border-hover)] transition-colors">
            <input
              type="radio"
              name="expirationType"
              checked={expirationType === "90days"}
              onChange={() => setExpirationType("90days")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">90 Days From Now</div>
              <div className="text-xs text-foreground-muted mt-0.5">
                Gallery expires in 90 days
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--border-hover)] transition-colors">
            <input
              type="radio"
              name="expirationType"
              checked={expirationType === "custom"}
              onChange={() => setExpirationType("custom")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground mb-2">Custom Date</div>
              {expirationType === "custom" && (
                <input
                  type="date"
                  value={customExpirationDate}
                  onChange={(e) => setCustomExpirationDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
        >
          <TrashIcon className="h-4 w-4" />
          Delete Gallery
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/galleries/${gallery.id}`}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Delete Gallery</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Are you sure you want to delete &ldquo;{gallery.name}&rdquo;? This action cannot be undone and all photos will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Gallery"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function ToggleSetting({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
      />
    </label>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { ServiceSelector, type DatabaseServiceType } from "@/components/dashboard/service-selector";
import type { ServiceType, ServiceCategory } from "@/lib/services";

// Union type for selected service (can be static or database service)
type SelectedService = ServiceType | DatabaseServiceType | null;

interface Client {
  id: string;
  name: string;
  email: string;
}

interface GalleryNewFormProps {
  clients: Client[];
}

export function GalleryNewForm({ clients }: GalleryNewFormProps) {
  const [selectedService, setSelectedService] = useState<SelectedService>(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [category, setCategory] = useState<ServiceCategory>("other");
  const [duration, setDuration] = useState("");
  const [accessType, setAccessType] = useState<"public" | "password">("public");
  const [galleryPassword, setGalleryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-6">
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
              placeholder="e.g., Downtown Luxury Listing"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
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
              placeholder="Add a description for this gallery..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Client Selection */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-foreground mb-1.5">
              Client <span className="text-[var(--error)]">*</span>
            </label>
            <select
              id="client"
              name="clientId"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
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
          selectedServiceId={selectedService?.id}
          customPrice={price}
          customDescription={description}
          customServiceName={serviceName}
          customDeliverables={deliverables}
          customCategory={category}
          customDuration={duration}
          onServiceChange={setSelectedService}
          onPriceChange={setPrice}
          onDescriptionChange={setDescription}
          onServiceNameChange={setServiceName}
          onDeliverablesChange={setDeliverables}
          onCategoryChange={setCategory}
          onDurationChange={setDuration}
          mode="gallery"
        />

        {/* Hidden inputs for form submission */}
        <input type="hidden" name="serviceId" value={selectedService?.id || ""} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="serviceDescription" value={description} />
        <input type="hidden" name="serviceName" value={serviceName} />
        <input type="hidden" name="deliverables" value={JSON.stringify(deliverables)} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="duration" value={duration} />
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
              className="mt-0.5 h-4 w-4 border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
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
              className="mt-0.5 h-4 w-4 border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Password Protected</span>
              <p className="text-xs text-foreground-muted">Require a password to view the gallery</p>
            </div>
          </label>
        </div>

        {/* Password Input - shows when password protected is selected */}
        {accessType === "password" && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <label htmlFor="galleryPassword" className="block text-sm font-medium text-foreground mb-1.5">
              Gallery Password <span className="text-[var(--error)]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="galleryPassword"
                name="galleryPassword"
                value={galleryPassword}
                onChange={(e) => setGalleryPassword(e.target.value)}
                placeholder="Enter a password for this gallery"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 pr-12 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-foreground-muted">
              Clients will need this password to access the gallery. You can share it via email or text.
            </p>

            {/* Password strength indicator */}
            {galleryPassword && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--background-hover)] overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        galleryPassword.length < 4
                          ? "w-1/4 bg-[var(--error)]"
                          : galleryPassword.length < 8
                          ? "w-2/4 bg-[var(--warning)]"
                          : galleryPassword.length < 12
                          ? "w-3/4 bg-[var(--primary)]"
                          : "w-full bg-[var(--success)]"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    galleryPassword.length < 4
                      ? "text-[var(--error)]"
                      : galleryPassword.length < 8
                      ? "text-[var(--warning)]"
                      : galleryPassword.length < 12
                      ? "text-[var(--primary)]"
                      : "text-[var(--success)]"
                  }`}>
                    {galleryPassword.length < 4
                      ? "Weak"
                      : galleryPassword.length < 8
                      ? "Fair"
                      : galleryPassword.length < 12
                      ? "Good"
                      : "Strong"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cover Image Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Cover Image</h2>

        <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center hover:border-[var(--primary)]/50 transition-colors cursor-pointer">
          <UploadIcon className="mx-auto h-10 w-10 text-foreground-muted" />
          <p className="mt-3 text-sm text-foreground">
            <span className="text-[var(--primary)] font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            PNG, JPG, or WebP up to 10MB
          </p>
        </div>
      </div>

      {/* Gallery Settings Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Settings</h2>

        <div className="space-y-4">
          <ToggleSetting
            label="Allow Downloads"
            description="Let clients download photos after payment"
            defaultChecked
          />
          <ToggleSetting
            label="Allow Favorites"
            description="Let clients mark their favorite photos"
            defaultChecked
          />
          <ToggleSetting
            label="Show Watermarks"
            description="Display watermarks on photos until purchased"
            defaultChecked={false}
          />
          <ToggleSetting
            label="Email Notifications"
            description="Get notified when clients view or purchase"
            defaultChecked
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/galleries"
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Gallery
        </button>
      </div>
    </form>
  );
}

function ToggleSetting({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
      <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
    </svg>
  );
}

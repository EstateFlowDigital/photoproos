"use client";

import { useState } from "react";
import Link from "next/link";
import { ServiceSelector } from "@/components/dashboard/service-selector";
import type { ServiceType, ServiceCategory } from "@/lib/services";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface GalleryNewFormProps {
  clients: Client[];
}

export function GalleryNewForm({ clients }: GalleryNewFormProps) {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [category, setCategory] = useState<ServiceCategory>("other");
  const [duration, setDuration] = useState("");

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
              defaultChecked
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
              className="mt-0.5 h-4 w-4 border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
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

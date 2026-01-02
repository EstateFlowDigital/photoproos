"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { updatePropertyWebsite } from "@/lib/actions/property-websites";
import type { PropertyWebsiteWithRelations } from "@/lib/actions/property-websites";
import type { PropertyType, PropertyWebsiteTemplate } from "@prisma/client";

interface PropertyEditFormProps {
  website: PropertyWebsiteWithRelations;
}

const TEMPLATE_OPTIONS: { value: PropertyWebsiteTemplate; label: string; description: string }[] = [
  { value: "modern", label: "Modern", description: "Clean lines, large photos, contemporary feel" },
  { value: "classic", label: "Classic", description: "Traditional layout, warm and inviting" },
  { value: "luxury", label: "Luxury", description: "Elegant dark theme, high-end properties" },
  { value: "minimal", label: "Minimal", description: "Ultra-clean, photo-focused presentation" },
  { value: "commercial", label: "Commercial", description: "Professional, data-focused layout" },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi Family" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

export function PropertyEditForm({ website }: PropertyEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Address fields
  const [address, setAddress] = useState(website.address);
  const [city, setCity] = useState(website.city);
  const [state, setState] = useState(website.state);
  const [zipCode, setZipCode] = useState(website.zipCode);

  // Property details
  const [price, setPrice] = useState(website.price ? String(website.price / 100) : "");
  const [beds, setBeds] = useState(website.beds?.toString() || "");
  const [baths, setBaths] = useState(website.baths?.toString() || "");
  const [sqft, setSqft] = useState(website.sqft?.toString() || "");
  const [lotSize, setLotSize] = useState(website.lotSize || "");
  const [yearBuilt, setYearBuilt] = useState(website.yearBuilt?.toString() || "");
  const [propertyType, setPropertyType] = useState<PropertyType>(website.propertyType || "single_family");

  // Content
  const [headline, setHeadline] = useState(website.headline || "");
  const [description, setDescription] = useState(website.description || "");
  const [features, setFeatures] = useState(website.features.join("\n"));
  const [virtualTourUrl, setVirtualTourUrl] = useState(website.virtualTourUrl || "");
  const [videoUrl, setVideoUrl] = useState(website.videoUrl || "");

  // Design & Settings
  const [template, setTemplate] = useState<PropertyWebsiteTemplate>(website.template);
  const [isBranded, setIsBranded] = useState(website.isBranded);
  const [showPrice, setShowPrice] = useState(website.showPrice);
  const [showAgent, setShowAgent] = useState(website.showAgent);

  // SEO
  const [metaTitle, setMetaTitle] = useState(website.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(website.metaDescription || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !city || !state || !zipCode) {
      showToast("Please fill in all address fields", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updatePropertyWebsite(website.id, {
          address,
          city,
          state,
          zipCode,
          price: price ? parseFloat(price) * 100 : null,
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseFloat(baths) : null,
          sqft: sqft ? parseInt(sqft) : null,
          lotSize: lotSize || null,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          propertyType,
          headline: headline || null,
          description: description || null,
          features: features.split("\n").map(f => f.trim()).filter(Boolean),
          virtualTourUrl: virtualTourUrl || null,
          videoUrl: videoUrl || null,
          template,
          isBranded,
          showPrice,
          showAgent,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
        });

        if (result.success) {
          showToast("Property website updated successfully", "success");
          router.push(`/properties/${website.id}`);
        } else {
          showToast(result.error || "Failed to update", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/properties/${website.id}`} className="text-foreground-muted hover:text-foreground transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Property Website</h1>
            <p className="text-sm text-foreground-muted">{website.address}, {website.city}</p>
          </div>
        </div>
        <a
          href={`/p/${website.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          View Live Site
        </a>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Section */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Property Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Street Address *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Los Angeles"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">ZIP *</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="90001"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Property Details</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="500000"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Beds</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  placeholder="3"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Baths</label>
                <input
                  type="number"
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  placeholder="2"
                  step="0.5"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Sq Ft</label>
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="1500"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Lot Size</label>
                <input
                  type="text"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="0.25 acres"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Year Built</label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(e.target.value)}
                  placeholder="2000"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1.5">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Stunning Modern Home with Mountain Views"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">Optional headline shown above the description</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the property in detail..."
                  rows={6}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">{description.length}/2000 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Features</label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Enter one feature per line:&#10;Hardwood floors&#10;Granite countertops&#10;Smart home system"
                  rows={5}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">One feature per line. These appear as bullet points.</p>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Media & Tours</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Virtual Tour URL</label>
                <input
                  type="url"
                  value={virtualTourUrl}
                  onChange={(e) => setVirtualTourUrl(e.target.value)}
                  placeholder="https://my.matterport.com/show/?m=..."
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">Matterport, iGuide, Zillow 3D, or any embeddable tour URL</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Video URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">YouTube, Vimeo, or direct video URL</p>
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Custom page title for search engines"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">Leave blank to auto-generate from address</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search results"
                  rows={2}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Design Template</h2>
            <div className="space-y-2">
              {TEMPLATE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    template === option.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={option.value}
                    checked={template === option.value}
                    onChange={(e) => setTemplate(e.target.value as PropertyWebsiteTemplate)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-xs text-foreground-muted">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Display Settings */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Display Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">Show photographer branding</span>
                <input
                  type="checkbox"
                  checked={isBranded}
                  onChange={(e) => setIsBranded(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">Show price</span>
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">Show agent contact info</span>
                <input
                  type="checkbox"
                  checked={showAgent}
                  onChange={(e) => setShowAgent(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
              </label>
            </div>
          </div>

          {/* Gallery Preview */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {website.project.assets.slice(0, 6).map((asset) => (
                <div key={asset.id} className="aspect-square overflow-hidden rounded-lg bg-[var(--background)]">
                  <img
                    src={asset.thumbnailUrl || asset.originalUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground-muted">
              {website.project.assets.length} photos from linked gallery
            </p>
            <Link
              href={`/galleries/${website.project.id}`}
              className="mt-2 inline-block text-sm text-[var(--primary)] hover:underline"
            >
              Manage photos in gallery
            </Link>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href={`/properties/${website.id}`}
                className="block w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

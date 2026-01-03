"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { PropertyWebsiteWithRelations } from "@/lib/actions/property-websites";
import type { PropertyLead } from "@prisma/client";
import {
  togglePropertyWebsitePublish,
  updatePropertyWebsite,
  deletePropertyWebsite,
  updateLeadStatus,
} from "@/lib/actions/property-websites";
import {
  generatePropertyFlyer,
  generateSocialSquare,
  type SocialVariant,
} from "@/lib/actions/marketing-assets";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { PhotoUploadModal } from "@/components/upload/photo-upload-modal";

interface PropertyDetailClientProps {
  website: PropertyWebsiteWithRelations;
  leads: PropertyLead[];
  analytics: {
    dailyData: Array<{
      date: Date;
      pageViews: number;
      uniqueVisitors: number;
      tourClicks: number;
      photoViews: number;
      socialShares: number;
    }>;
    totals: {
      pageViews: number;
      uniqueVisitors: number;
      tourClicks: number;
      photoViews: number;
      socialShares: number;
    };
  };
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function PropertyDetailClient({ website, leads, analytics }: PropertyDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "leads" | "analytics" | "marketing" | "settings">("overview");
  const [isPublished, setIsPublished] = useState(website.isPublished);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Settings state
  const [isBranded, setIsBranded] = useState(website.isBranded);
  const [showPrice, setShowPrice] = useState(website.showPrice);
  const [showAgent, setShowAgent] = useState(website.showAgent);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Marketing state
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [selectedSocialVariant, setSelectedSocialVariant] = useState<SocialVariant>("listing");

  const handleTogglePublish = async () => {
    setIsPublishing(true);
    try {
      const result = await togglePropertyWebsitePublish(website.id);
      if (result.success) {
        setIsPublished(result.isPublished ?? !isPublished);
        showToast(result.isPublished ? "Website published!" : "Website unpublished", "success");
      } else {
        showToast(result.error || "Failed to update publish status", "error");
      }
    } catch {
      showToast("Failed to update publish status", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const result = await updatePropertyWebsite(website.id, {
        isBranded,
        showPrice,
        showAgent,
      });
      if (result.success) {
        showToast("Settings saved successfully", "success");
      } else {
        showToast(result.error || "Failed to save settings", "error");
      }
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePropertyWebsite(website.id);
        if (result.success) {
          showToast("Property website deleted", "success");
          router.push("/properties");
        } else {
          showToast(result.error || "Failed to delete", "error");
        }
      } catch {
        showToast("Failed to delete property website", "error");
      }
    });
  };

  const handleLeadStatusChange = async (leadId: string, status: string) => {
    try {
      const result = await updateLeadStatus(leadId, status as "new" | "contacted" | "qualified" | "closed");
      if (result.success) {
        showToast("Lead status updated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to update status", "error");
      }
    } catch {
      showToast("Failed to update lead status", "error");
    }
  };

  const handleGenerateFlyer = async () => {
    setIsGeneratingFlyer(true);
    try {
      const result = await generatePropertyFlyer({
        propertyWebsiteId: website.id,
        branded: isBranded,
      });

      if (result.success && result.pdfBuffer) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.pdfBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${website.address.replace(/\s+/g, "-")}-flyer.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Flyer generated successfully!", "success");
      } else {
        showToast(result.error || "Failed to generate flyer", "error");
      }
    } catch (error) {
      showToast("Failed to generate flyer", "error");
    } finally {
      setIsGeneratingFlyer(false);
    }
  };

  const handleUploadComplete = (files: Array<{ id: string; url: string; filename: string }>) => {
    showToast(`Successfully uploaded ${files.length} photo${files.length === 1 ? "" : "s"}`, "success");
    router.refresh();
  };

  const handleGenerateSocial = async () => {
    setIsGeneratingSocial(true);
    try {
      const result = await generateSocialSquare({
        propertyWebsiteId: website.id,
        variant: selectedSocialVariant,
      });

      if (result.success && result.pdfBuffer) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.pdfBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${website.address.replace(/\s+/g, "-")}-${selectedSocialVariant}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Social graphic generated successfully!", "success");
      } else {
        showToast(result.error || "Failed to generate social graphic", "error");
      }
    } catch (error) {
      showToast("Failed to generate social graphic", "error");
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${website.slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Link
                href="/properties"
                className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground break-words">{website.address}</h1>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isPublished
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "bg-foreground/10 text-foreground-secondary"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {website.city}, {website.state} {website.zipCode}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Link
                href={`/properties/${website.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EditIcon className="h-4 w-4" />
                Edit
              </Link>
              {isPublished && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  View Live
                </a>
              )}
              <button
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isPublished
                    ? "border border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]"
                    : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                }`}
              >
                {isPublishing ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : isPublished ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <GlobeIcon className="h-4 w-4" />
                )}
                {isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--card-border)] pt-4">
            {(["overview", "photos", "leads", "analytics", "marketing", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-foreground text-background"
                    : "text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "photos" && website.project.assets.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-foreground/10 px-1.5 py-0.5 text-xs text-foreground-secondary">
                    {website.project.assets.length}
                  </span>
                )}
                {tab === "leads" && leads.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[var(--primary)]/20 px-1.5 py-0.5 text-xs text-[var(--primary)]">
                    {leads.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Photo Gallery Preview */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="mb-4 font-semibold text-foreground">Photo Gallery</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {website.project.assets.slice(0, 8).map((asset, i) => (
                    <div
                      key={asset.id}
                      className={`relative aspect-square overflow-hidden rounded-lg bg-[var(--background-tertiary)] ${
                        i === 0 ? "col-span-2 row-span-2" : ""
                      }`}
                    >
                      {asset.thumbnailUrl || asset.originalUrl ? (
                        <img
                          src={asset.thumbnailUrl || asset.originalUrl}
                          alt={`Photo ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-foreground-muted" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-foreground-muted">
                  {website.project.assets.length} photos from {website.project.name}
                </p>
              </div>

              {/* Property Description */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="mb-4 font-semibold text-foreground">Description</h2>
                {website.headline && (
                  <p className="mb-3 text-lg font-medium text-foreground">{website.headline}</p>
                )}
                <p className="text-foreground-secondary">{website.description || "No description provided."}</p>

                {website.features.length > 0 && (
                  <>
                    <h3 className="mb-3 mt-6 font-medium text-foreground">Features</h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {website.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground-secondary">
                          <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--success)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Virtual Tour & Video */}
              {(website.virtualTourUrl || website.videoUrl) && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <h2 className="mb-4 font-semibold text-foreground">Virtual Tour & Video</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {website.virtualTourUrl && (
                      <a
                        href={website.virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-4 transition-colors hover:border-[var(--border-hover)]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                          <CubeIcon className="h-5 w-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">3D Virtual Tour</p>
                          <p className="text-sm text-foreground-muted">View tour</p>
                        </div>
                      </a>
                    )}
                    {website.videoUrl && (
                      <a
                        href={website.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] p-4 transition-colors hover:border-[var(--border-hover)]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--error)]/10">
                          <PlayIcon className="h-5 w-5 text-[var(--error)]" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Video Tour</p>
                          <p className="text-sm text-foreground-muted">Watch video</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="mb-4 font-semibold text-foreground">Performance</h2>
                <div className="auto-grid grid-gap-4 [--grid-min:160px]">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{website.viewCount}</p>
                    <p className="text-sm text-foreground-muted">Page Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--primary)]">{leads.length}</p>
                    <p className="text-sm text-foreground-muted">Leads</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analytics.totals.tourClicks}</p>
                    <p className="text-sm text-foreground-muted">Tour Clicks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{analytics.totals.socialShares}</p>
                    <p className="text-sm text-foreground-muted">Shares</p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="mb-4 font-semibold text-foreground">Property Details</h2>
                <dl className="space-y-3">
                  {website.price && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-foreground-muted">Price</dt>
                      <dd className="font-medium text-foreground sm:text-right">{formatPrice(website.price)}</dd>
                    </div>
                  )}
                  {website.beds && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-foreground-muted">Beds</dt>
                      <dd className="font-medium text-foreground sm:text-right">{website.beds}</dd>
                    </div>
                  )}
                  {website.baths && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-foreground-muted">Baths</dt>
                      <dd className="font-medium text-foreground sm:text-right">{website.baths}</dd>
                    </div>
                  )}
                  {website.sqft && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-foreground-muted">Sq. Ft.</dt>
                      <dd className="font-medium text-foreground sm:text-right">{website.sqft.toLocaleString()}</dd>
                    </div>
                  )}
                  {website.lotSize && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-foreground-muted">Lot Size</dt>
                      <dd className="font-medium text-foreground sm:text-right">{website.lotSize}</dd>
                    </div>
                  )}
                  {website.yearBuilt && (
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-foreground-muted">Year Built</dt>
                      <dd className="font-medium text-foreground sm:text-right">{website.yearBuilt}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Agent Info */}
              {website.project.client && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                  <h2 className="mb-4 font-semibold text-foreground">Listing Agent</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-lg font-medium text-[var(--primary)]">
                      {website.project.client.fullName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{website.project.client.fullName}</p>
                      <p className="text-sm text-foreground-muted">{website.project.client.company}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-foreground-secondary">{website.project.client.email}</p>
                    {website.project.client.phone && (
                      <p className="text-foreground-secondary">{website.project.client.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Share Link */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="mb-4 font-semibold text-foreground">Share Link</h2>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={publicUrl}
                    readOnly
                    className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      showToast("Link copied to clipboard", "success");
                    }}
                    className="flex h-10 w-full items-center justify-center rounded-lg border border-[var(--card-border)] text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground sm:w-10 sm:flex-shrink-0"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Photos</h2>
                <p className="mt-1 text-foreground-secondary">
                  {website.project.assets.length} photos from {website.project.name}
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <UploadIcon className="h-4 w-4" />
                Upload Photos
              </button>
            </div>

            {website.project.assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No photos yet</h3>
                <p className="mt-2 text-foreground-secondary">
                  Upload photos to display on your property website.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  <UploadIcon className="h-4 w-4" />
                  Upload Photos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {website.project.assets.map((asset, i) => (
                  <div
                    key={asset.id}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-[var(--background-tertiary)]"
                  >
                    {asset.thumbnailUrl || asset.originalUrl ? (
                      <img
                        src={asset.thumbnailUrl || asset.originalUrl}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-foreground-muted" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                  </div>
                ))}
              </div>
            )}

            {/* Quick tip */}
            <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
              <div className="flex gap-3">
                <LightbulbIcon className="h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
                <div>
                  <h4 className="font-medium text-[var(--primary)]">Photo Tips</h4>
                  <p className="mt-1 text-sm text-foreground-secondary">
                    Photos are displayed in the order they appear. The first photo becomes the hero image on your property website.
                    For best results, use high-quality photos with a 3:2 or 4:3 aspect ratio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-foreground">Leads ({leads.length})</h2>
            </div>

            {leads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
                <UserIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No leads yet</h3>
                <p className="mt-2 text-foreground-secondary">
                  Leads will appear here when visitors submit inquiries on your property website.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-medium text-[var(--primary)]">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{lead.name}</h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                lead.status === "new"
                                  ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                                  : lead.status === "contacted"
                                  ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                                  : lead.status === "qualified"
                                  ? "bg-[var(--success)]/20 text-[var(--success)]"
                                  : "bg-foreground/10 text-foreground-secondary"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-foreground-secondary">
                            <span>{lead.email}</span>
                            {lead.phone && (
                              <>
                                <span>•</span>
                                <span>{lead.phone}</span>
                              </>
                            )}
                          </div>
                          {lead.message && (
                            <p className="mt-3 text-sm text-foreground-secondary">{lead.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        <p className="text-xs text-foreground-muted">{formatDateTime(lead.createdAt)}</p>
                        <select
                          value={lead.status}
                          onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                          className="h-8 rounded-lg border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="auto-grid grid-min-200 grid-gap-4">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="text-sm text-foreground-muted">Page Views</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {analytics.totals.pageViews}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="text-sm text-foreground-muted">Unique Visitors</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {analytics.totals.uniqueVisitors}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="text-sm text-foreground-muted">Tour Clicks</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {analytics.totals.tourClicks}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="text-sm text-foreground-muted">Photo Views</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {analytics.totals.photoViews.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <p className="text-sm text-foreground-muted">Social Shares</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {analytics.totals.socialShares}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="mb-6 font-semibold text-foreground">Views Over Time (Last 7 Days)</h2>
              {analytics.dailyData.length > 0 ? (
                <div className="flex h-48 items-end gap-2">
                  {analytics.dailyData.map((day, i) => {
                    const maxViews = Math.max(...analytics.dailyData.map((d) => d.pageViews), 1);
                    return (
                      <div key={i} className="flex-1">
                        <div
                          className="mx-auto w-full max-w-[40px] rounded-t bg-[var(--primary)]"
                          style={{ height: `${(day.pageViews / maxViews) * 100}%`, minHeight: day.pageViews > 0 ? "4px" : "0" }}
                        />
                        <p className="mt-2 text-center text-xs text-foreground-muted">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-foreground-muted">
                  No analytics data yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === "marketing" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Marketing Kit</h2>
                <p className="mt-1 text-foreground-secondary">
                  Generate print-ready flyers and social media graphics for this property
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Property Flyer */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                    <DocumentIcon className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Property Flyer</h3>
                    <p className="mt-1 text-sm text-foreground-secondary">
                      Print-ready 8.5x11 flyer with property photos, details, and agent info
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex flex-col gap-3 rounded-lg bg-[var(--background-tertiary)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-12 rounded bg-[var(--background-hover)]" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Portrait Layout</p>
                        <p className="text-xs text-foreground-muted">8.5" x 11" PDF</p>
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateFlyer}
                      disabled={isGeneratingFlyer}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 sm:w-auto"
                    >
                      {isGeneratingFlyer ? (
                        <>
                          <LoadingSpinner className="h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Media Graphics */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ai)]/10">
                    <ShareIcon className="h-6 w-6 text-[var(--ai)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Social Media Graphics</h3>
                    <p className="mt-1 text-sm text-foreground-secondary">
                      Square graphics optimized for Instagram and Facebook
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Style
                    </label>
                    <select
                      value={selectedSocialVariant}
                      onChange={(e) => setSelectedSocialVariant(e.target.value as SocialVariant)}
                      className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
                    >
                      <option value="listing">For Sale</option>
                      <option value="just_listed">Just Listed</option>
                      <option value="just_sold">Just Sold</option>
                      <option value="open_house">Open House</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-3 rounded-lg bg-[var(--background-tertiary)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-[var(--background-hover)]" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Square (1080x1080)</p>
                        <p className="text-xs text-foreground-muted">Instagram, Facebook</p>
                      </div>
                    </div>
                    <button
                      onClick={handleGenerateSocial}
                      disabled={isGeneratingSocial}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--ai)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ai)]/90 disabled:opacity-50 sm:w-auto"
                    >
                      {isGeneratingSocial ? (
                        <>
                          <LoadingSpinner className="h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="h-4 w-4" />
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
              <div className="flex gap-3">
                <LightbulbIcon className="h-5 w-5 flex-shrink-0 text-[var(--warning)]" />
                <div>
                  <h4 className="font-medium text-[var(--warning)]">Tips for Marketing Materials</h4>
                  <ul className="mt-2 space-y-1 text-sm text-foreground-secondary">
                    <li>• Use "Just Listed" graphics when a property first hits the market</li>
                    <li>• "Just Sold" graphics build social proof and attract new clients</li>
                    <li>• Print flyers for open houses and client meetings</li>
                    <li>• Share social graphics within 24 hours of listing for maximum engagement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="mb-4 font-semibold text-foreground">Display Settings</h2>
              <div className="space-y-4">
                <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">Show Photographer Branding</p>
                    <p className="text-sm text-foreground-secondary">
                      Display your logo and business name
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBranded(!isBranded)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isBranded ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        isBranded ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>

                <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">Show Price</p>
                    <p className="text-sm text-foreground-secondary">Display the listing price</p>
                  </div>
                  <button
                    onClick={() => setShowPrice(!showPrice)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      showPrice ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        showPrice ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>

                <label className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">Show Agent Contact</p>
                    <p className="text-sm text-foreground-secondary">
                      Display listing agent information
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAgent(!showAgent)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      showAgent ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        showAgent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <LoadingSpinner className="h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
              <h2 className="mb-2 font-semibold text-[var(--error)]">Danger Zone</h2>
              <p className="mb-4 text-sm text-foreground-secondary">
                Permanently delete this property website. This action cannot be undone.
              </p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="rounded-lg border border-[var(--error)]/30 px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
              >
                Delete Property Website
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        galleryId={website.project.id}
        galleryName={website.project.name}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-[var(--error)]">Delete Property Website</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property website? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-foreground-secondary">
              The property website for <strong>{website.address}</strong> will be permanently deleted along with all associated leads and analytics.
            </p>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

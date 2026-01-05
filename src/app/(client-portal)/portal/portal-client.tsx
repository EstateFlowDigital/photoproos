"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { logoutClient } from "@/lib/actions/client-auth";
import {
  getGalleryZipDownload,
  getWebSizeDownload,
  getHighResDownload,
  getMarketingKitDownload,
  getInvoicePaymentLink,
  getInvoicePdfDownload,
} from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";

interface ClientData {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
  phone: string | null;
}

interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number | null;
  status: string;
  template: string;
  viewCount: number;
  leadCount: number;
  photoCount: number;
  slug: string;
  createdAt: Date;
  thumbnailUrl: string | null;
}

interface GalleryData {
  id: string;
  name: string;
  photoCount: number;
  status: string;
  downloadable: boolean;
  deliveredAt: Date | null;
  serviceName: string | null;
  photos: {
    id: string;
    url: string;
    thumbnailUrl: string | null;
    filename: string;
  }[];
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

interface QuestionnaireData {
  id: string;
  templateId: string;
  templateName: string;
  templateDescription: string | null;
  industry: string;
  status: string;
  isRequired: boolean;
  dueDate: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  bookingTitle: string | null;
  bookingDate: Date | null;
  responseCount: number;
}

interface PortalClientProps {
  client: ClientData;
  stats: {
    totalProperties: number;
    totalViews: number;
    totalLeads: number;
    totalPhotos: number;
    pendingQuestionnaires: number;
  };
  properties: PropertyData[];
  galleries: GalleryData[];
  invoices: InvoiceData[];
  questionnaires: QuestionnaireData[];
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function PortalClient({ client, stats, properties, galleries, invoices, questionnaires }: PortalClientProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"properties" | "galleries" | "downloads" | "invoices" | "questionnaires">(
    // Default to questionnaires if there are pending ones
    stats.pendingQuestionnaires > 0 ? "questionnaires" : "properties"
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [downloadingGallery, setDownloadingGallery] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<string | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingInvoicePdf, setDownloadingInvoicePdf] = useState<string | null>(null);

  // Handle nullable fullName
  const displayName = client.fullName || client.email.split("@")[0];
  const firstLetter = displayName.charAt(0).toUpperCase();
  const firstName = displayName.split(" ")[0];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutClient();
    // Redirect to login after logout
    window.location.href = "/portal/login";
  };

  // Download handlers
  const handleZipDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("zip");
    try {
      const result = await getGalleryZipDownload(galleryId);
      if (result.success && result.gallery) {
        // Trigger download via batch download API
        const response = await fetch("/api/download/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            galleryId: result.gallery.id,
            assetIds: result.gallery.assetIds,
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${result.gallery.name}-photos.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          showToast("Failed to download. Please try again.", "error");
        }
      } else {
        showToast(result.error || "Failed to prepare download", "error");
      }
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed. Please try again.", "error");
    } finally {
      setDownloadingGallery(null);
      setDownloadType(null);
    }
  };

  const handleWebSizeDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("web");
    try {
      const result = await getWebSizeDownload(galleryId);
      if (result.success && result.photos) {
        // Download first photo as example (in production, would zip these)
        for (const photo of result.photos) {
          if (photo.url) {
            window.open(photo.url, "_blank");
            break; // Just open first one for now
          }
        }
        showToast(`${result.photos.length} web-sized photos ready for download`, "success");
      } else {
        showToast(result.error || "Failed to prepare download", "error");
      }
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed. Please try again.", "error");
    } finally {
      setDownloadingGallery(null);
      setDownloadType(null);
    }
  };

  const handleHighResDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("highres");
    try {
      const result = await getHighResDownload(galleryId);
      if (result.success && result.photos) {
        // Same as ZIP download but with original files
        const galleryInfo = await getGalleryZipDownload(galleryId);
        if (galleryInfo.success && galleryInfo.gallery) {
          const response = await fetch("/api/download/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              galleryId: galleryInfo.gallery.id,
              assetIds: galleryInfo.gallery.assetIds,
            }),
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${galleryInfo.gallery.name}-highres.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            showToast("Failed to download. Please try again.", "error");
          }
        }
      } else {
        showToast(result.error || "Failed to prepare download", "error");
      }
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed. Please try again.", "error");
    } finally {
      setDownloadingGallery(null);
      setDownloadType(null);
    }
  };

  const handleMarketingKitDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("marketing");
    try {
      // Find the property associated with this gallery
      const gallery = galleries.find((g) => g.id === galleryId);
      if (!gallery) {
        showToast("Gallery not found", "error");
        return;
      }

      // For now, show a message - full implementation would bundle PDFs
      showToast("Marketing kit coming soon! Check the property page for marketing assets.", "info");
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed. Please try again.", "error");
    } finally {
      setDownloadingGallery(null);
      setDownloadType(null);
    }
  };

  const handleInvoicePayment = async (invoiceId: string) => {
    setPayingInvoice(invoiceId);
    try {
      const result = await getInvoicePaymentLink(invoiceId);
      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        showToast(result.error || "Payment not available", "error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      showToast("Failed to process payment. Please try again.", "error");
    } finally {
      setPayingInvoice(null);
    }
  };

  const handleInvoicePdfDownload = async (invoiceId: string) => {
    setDownloadingInvoicePdf(invoiceId);
    try {
      const result = await getInvoicePdfDownload(invoiceId);
      if (result.success && result.pdfBuffer) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.pdfBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename || `invoice-${invoiceId.slice(0, 8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showToast(result.error || "Failed to download invoice PDF", "error");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      showToast("Failed to download invoice. Please try again.", "error");
    } finally {
      setDownloadingInvoicePdf(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#141414]">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b82f6]">
                <CameraIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Client Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-[#7c7c7c]">{client.company || client.email}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6]/10 text-sm font-medium text-[#3b82f6]">
                {firstLetter}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#141414] px-3 py-2 text-sm font-medium text-[#a7a7a7] transition-colors hover:bg-[#191919] hover:text-white disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <LogoutIcon className="h-4 w-4" />
                )}
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
          <p className="mt-1 text-[#a7a7a7]">View your property websites, galleries, and downloads</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
            <p className="text-sm text-[#7c7c7c]">Properties</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.totalProperties}</p>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
            <p className="text-sm text-[#7c7c7c]">Total Views</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
            <p className="text-sm text-[#7c7c7c]">Leads</p>
            <p className="mt-1 text-2xl font-bold text-[#3b82f6]">{stats.totalLeads}</p>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
            <p className="text-sm text-[#7c7c7c]">Photos</p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.totalPhotos}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-[#262626]">
          {(["properties", "galleries", "downloads", "invoices", "questionnaires"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-[#3b82f6] text-white"
                  : "border-transparent text-[#7c7c7c] hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "questionnaires" && stats.pendingQuestionnaires > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
                  {stats.pendingQuestionnaires}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.length === 0 ? (
              <div className="col-span-full rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
                <HomeIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
                <p className="mt-4 text-lg font-medium text-white">No property websites yet</p>
                <p className="mt-2 text-sm text-[#7c7c7c]">
                  Property websites will appear here once created by your photographer
                </p>
              </div>
            ) : (
              properties.map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]"
                >
                  <div className="relative aspect-video bg-[#191919]">
                    {property.thumbnailUrl ? (
                      <Image
                        src={property.thumbnailUrl}
                        alt={property.address}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <HomeIcon className="h-12 w-12 text-[#7c7c7c]" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          property.status === "published"
                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                            : "bg-[#7c7c7c]/20 text-[#a7a7a7]"
                        }`}
                      >
                        {property.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    {property.price && (
                      <p className="font-bold text-white">{formatPrice(property.price)}</p>
                    )}
                    <p className="mt-1 font-medium text-white">{property.address}</p>
                    <p className="text-sm text-[#7c7c7c]">
                      {property.city}, {property.state} {property.zipCode}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-[#7c7c7c]">
                      <span>{property.viewCount.toLocaleString()} views</span>
                      <span>{property.leadCount} leads</span>
                      <span>{property.photoCount} photos</span>
                    </div>
                    {property.status === "published" && (
                      <Link
                        href={`/p/${property.slug}`}
                        target="_blank"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#3b82f6] py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90"
                      >
                        View Website
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Galleries Tab */}
        {activeTab === "galleries" && (
          <div className="space-y-4">
            {galleries.length === 0 ? (
              <div className="rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
                <p className="mt-4 text-lg font-medium text-white">No galleries yet</p>
                <p className="mt-2 text-sm text-[#7c7c7c]">
                  Your photo galleries will appear here once delivered
                </p>
              </div>
            ) : (
              galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      {gallery.photos.length > 0 && gallery.photos[0].thumbnailUrl ? (
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                          <Image
                            src={gallery.photos[0].thumbnailUrl}
                            alt={gallery.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#191919]">
                          <ImageIcon className="h-6 w-6 text-[#7c7c7c]" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-white">{gallery.name}</h3>
                        <p className="text-sm text-[#7c7c7c]">
                          {gallery.photoCount} photos
                          {gallery.serviceName && ` • ${gallery.serviceName}`}
                          {gallery.deliveredAt && ` • Delivered ${formatDate(gallery.deliveredAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          gallery.status === "delivered"
                            ? "bg-[#22c55e]/20 text-[#22c55e]"
                            : gallery.status === "pending"
                              ? "bg-[#f97316]/20 text-[#f97316]"
                              : "bg-[#7c7c7c]/20 text-[#a7a7a7]"
                        }`}
                      >
                        {gallery.status}
                      </span>
                      {gallery.downloadable && (
                        <button
                          onClick={() => handleZipDownload(gallery.id)}
                          disabled={downloadingGallery === gallery.id}
                          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90 disabled:opacity-50"
                        >
                          {downloadingGallery === gallery.id ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <DownloadIcon className="h-4 w-4" />
                          )}
                          {downloadingGallery === gallery.id ? "Downloading..." : "Download"}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Photo preview strip */}
                  {gallery.photos.length > 0 && (
                    <div className="border-t border-[#262626] p-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {gallery.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                          >
                            <Image
                              src={photo.thumbnailUrl || photo.url}
                              alt={photo.filename}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {gallery.photoCount > gallery.photos.length && (
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#191919] text-sm font-medium text-[#7c7c7c]">
                            +{gallery.photoCount - gallery.photos.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="space-y-6">
            <p className="text-[#a7a7a7]">Download all your photos and marketing materials</p>

            {galleries.filter((g) => g.downloadable).length === 0 ? (
              <div className="rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
                <DownloadIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
                <p className="mt-4 text-lg font-medium text-white">No downloads available</p>
                <p className="mt-2 text-sm text-[#7c7c7c]">
                  Downloads will be available once your galleries are delivered
                </p>
              </div>
            ) : (
              galleries
                .filter((g) => g.downloadable)
                .map((gallery) => (
                  <div
                    key={gallery.id}
                    className="rounded-xl border border-[#262626] bg-[#141414] p-6"
                  >
                    <h3 className="text-lg font-semibold text-white">{gallery.name}</h3>
                    <p className="mt-1 text-sm text-[#7c7c7c]">{gallery.photoCount} photos available</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <button
                        onClick={() => handleZipDownload(gallery.id)}
                        disabled={downloadingGallery === gallery.id && downloadType === "zip"}
                        className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
                      >
                        {downloadingGallery === gallery.id && downloadType === "zip" ? (
                          <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          <DownloadIcon className="h-4 w-4" />
                        )}
                        All Photos (ZIP)
                      </button>
                      <button
                        onClick={() => handleWebSizeDownload(gallery.id)}
                        disabled={downloadingGallery === gallery.id && downloadType === "web"}
                        className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
                      >
                        {downloadingGallery === gallery.id && downloadType === "web" ? (
                          <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        Web Size
                      </button>
                      <button
                        onClick={() => handleHighResDownload(gallery.id)}
                        disabled={downloadingGallery === gallery.id && downloadType === "highres"}
                        className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
                      >
                        {downloadingGallery === gallery.id && downloadType === "highres" ? (
                          <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          <FileIcon className="h-4 w-4" />
                        )}
                        High-Res
                      </button>
                      <button
                        onClick={() => handleMarketingKitDownload(gallery.id)}
                        disabled={downloadingGallery === gallery.id && downloadType === "marketing"}
                        className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
                      >
                        {downloadingGallery === gallery.id && downloadType === "marketing" ? (
                          <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          <DocumentIcon className="h-4 w-4" />
                        )}
                        Marketing Kit
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            {invoices.length === 0 ? (
              <div className="rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
                <ReceiptIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
                <p className="mt-4 text-lg font-medium text-white">No invoices yet</p>
                <p className="mt-2 text-sm text-[#7c7c7c]">
                  Your invoices will appear here
                </p>
              </div>
            ) : (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#191919]">
                      <ReceiptIcon className="h-5 w-5 text-[#7c7c7c]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-[#7c7c7c]">
                        {invoice.dueDate && `Due ${formatDate(invoice.dueDate)}`}
                        {invoice.paidAt && ` • Paid ${formatDate(invoice.paidAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-white">{formatPrice(invoice.amount)}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-[#22c55e]/20 text-[#22c55e]"
                          : invoice.status === "overdue"
                            ? "bg-[#ef4444]/20 text-[#ef4444]"
                            : "bg-[#f97316]/20 text-[#f97316]"
                      }`}
                    >
                      {invoice.status}
                    </span>
                    <button
                      onClick={() => handleInvoicePdfDownload(invoice.id)}
                      disabled={downloadingInvoicePdf === invoice.id}
                      className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
                      title="Download PDF"
                    >
                      {downloadingInvoicePdf === invoice.id ? (
                        <LoadingSpinner className="h-4 w-4" />
                      ) : (
                        <DownloadIcon className="h-4 w-4" />
                      )}
                    </button>
                    {invoice.status !== "paid" && (
                      <button
                        onClick={() => handleInvoicePayment(invoice.id)}
                        disabled={payingInvoice === invoice.id}
                        className="flex items-center gap-2 rounded-lg bg-[#22c55e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22c55e]/90 disabled:opacity-50"
                      >
                        {payingInvoice === invoice.id ? (
                          <LoadingSpinner className="h-4 w-4" />
                        ) : (
                          <CreditCardIcon className="h-4 w-4" />
                        )}
                        {payingInvoice === invoice.id ? "Processing..." : "Pay Now"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Questionnaires Tab */}
        {activeTab === "questionnaires" && (
          <div className="space-y-4">
            {questionnaires.length === 0 ? (
              <div className="rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
                <ClipboardIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
                <p className="mt-4 text-lg font-medium text-white">No questionnaires yet</p>
                <p className="mt-2 text-sm text-[#7c7c7c]">
                  Your photographer will send you questionnaires to complete before your shoot
                </p>
              </div>
            ) : (
              <>
                {/* Pending/In Progress questionnaires first */}
                {questionnaires.filter((q) => q.status === "pending" || q.status === "in_progress").length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-[#a7a7a7]">Requires your attention</h3>
                    {questionnaires
                      .filter((q) => q.status === "pending" || q.status === "in_progress")
                      .map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f97316]/20">
                              <ClipboardIcon className="h-5 w-5 text-[#f97316]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{q.templateName}</h3>
                              <p className="text-sm text-[#7c7c7c]">
                                {q.bookingTitle && `For: ${q.bookingTitle}`}
                                {q.bookingDate && ` • ${formatDate(q.bookingDate)}`}
                                {q.isRequired && (
                                  <span className="ml-2 text-[#f97316]">Required</span>
                                )}
                              </p>
                              {q.dueDate && (
                                <p className="text-xs text-[#7c7c7c]">
                                  Due: {formatDate(q.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                q.status === "in_progress"
                                  ? "bg-[#8b5cf6]/20 text-[#8b5cf6]"
                                  : "bg-[#f97316]/20 text-[#f97316]"
                              }`}
                            >
                              {q.status === "in_progress" ? "In Progress" : "Pending"}
                            </span>
                            <Link
                              href={`/portal/questionnaires/${q.id}`}
                              className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90"
                            >
                              {q.status === "in_progress" ? "Continue" : "Start"}
                              <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Completed questionnaires */}
                {questionnaires.filter((q) => q.status === "completed" || q.status === "approved").length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-[#a7a7a7]">Completed</h3>
                    {questionnaires
                      .filter((q) => q.status === "completed" || q.status === "approved")
                      .map((q) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#22c55e]/20">
                              <CheckCircleIcon className="h-5 w-5 text-[#22c55e]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{q.templateName}</h3>
                              <p className="text-sm text-[#7c7c7c]">
                                {q.bookingTitle && `For: ${q.bookingTitle}`}
                                {q.completedAt && ` • Completed ${formatDate(q.completedAt)}`}
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#22c55e]/20 px-2.5 py-1 text-xs font-medium text-[#22c55e]">
                            {q.status === "approved" ? "Approved" : "Submitted"}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#262626] py-6">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm text-[#7c7c7c]">
            Powered by{" "}
            <Link href="/" className="font-medium text-[#3b82f6] hover:underline">
              PhotoProOS
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Icons
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

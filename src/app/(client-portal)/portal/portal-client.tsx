"use client";

import { useState, useEffect, useMemo } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import {
  getGalleryZipDownload,
  getWebSizeDownload,
  getHighResDownload,
  getMarketingKitDownload,
  getInvoicePaymentLink,
  getInvoicePdfDownload,
} from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";
import {
  PortalHeader,
  PortalStats,
  PortalTabs,
  PortalFooter,
  ActionCards,
  MobileNav,
  RecentActivity,
  PropertiesTab,
  GalleriesTab,
  DownloadsTab,
  InvoicesTab,
  LeadsTab,
  QuestionnairesTab,
  MessagesTab,
  SettingsTab,
  MarketingKitModal,
  type ClientData,
  type PropertyData,
  type GalleryData,
  type InvoiceData,
  type LeadData,
  type QuestionnaireData,
  type PortalStatsData,
  type PortalTab,
  type DownloadType,
} from "./components";

// Marketing Kit data type
interface MarketingKitData {
  galleryId: string;
  galleryName: string;
  propertyAddress: string | null;
  assets: {
    id: string;
    type: string;
    name: string;
    fileUrl: string;
    thumbnailUrl: string | null;
  }[];
}

interface PortalClientProps {
  client: ClientData;
  stats: PortalStatsData;
  properties: PropertyData[];
  galleries: GalleryData[];
  invoices: InvoiceData[];
  leads: LeadData[];
  questionnaires: QuestionnaireData[];
}

// Helper: Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function PortalClient({ client, stats, properties, galleries, invoices, leads, questionnaires }: PortalClientProps) {
  const { showToast } = useToast();
  const hydrated = useHydrated();
  const [activeTab, setActiveTab] = useState<PortalTab>(
    stats.pendingQuestionnaires > 0 ? "questionnaires" : "properties"
  );
  const [downloadingGallery, setDownloadingGallery] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<DownloadType>(null);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingInvoicePdf, setDownloadingInvoicePdf] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [marketingKitModal, setMarketingKitModal] = useState<MarketingKitData | null>(null);

  // Filter data based on search query
  const normalizedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filteredProperties = useMemo(() => {
    if (!normalizedQuery) return properties;
    return properties.filter((p) => (
      p.address.toLowerCase().includes(normalizedQuery) ||
      p.city.toLowerCase().includes(normalizedQuery) ||
      p.state.toLowerCase().includes(normalizedQuery)
    ));
  }, [properties, normalizedQuery]);

  const filteredGalleries = useMemo(() => {
    if (!normalizedQuery) return galleries;
    return galleries.filter((g) => (
      g.name.toLowerCase().includes(normalizedQuery) ||
      (g.serviceName && g.serviceName.toLowerCase().includes(normalizedQuery))
    ));
  }, [galleries, normalizedQuery]);

  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return leads;
    return leads.filter((l) => (
      l.name.toLowerCase().includes(normalizedQuery) ||
      l.email.toLowerCase().includes(normalizedQuery) ||
      l.propertyAddress.toLowerCase().includes(normalizedQuery)
    ));
  }, [leads, normalizedQuery]);

  // Favorites state (persisted to localStorage) - for photos
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`portal_favorites_${client.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  // Saved properties state (persisted to localStorage)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`portal_saved_properties_${client.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  // Calculate unpaid invoices count for mobile nav
  const unpaidInvoicesCount = useMemo(() => (
    invoices.filter((inv) => inv.status !== "paid" && inv.status !== "draft").length
  ), [invoices]);

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem(
      `portal_favorites_${client.id}`,
      JSON.stringify(Array.from(favorites))
    );
  }, [favorites, client.id]);

  // Persist saved properties to localStorage
  useEffect(() => {
    localStorage.setItem(
      `portal_saved_properties_${client.id}`,
      JSON.stringify(Array.from(savedProperties))
    );
  }, [savedProperties, client.id]);

  const displayName = client.fullName || client.email.split("@")[0];
  const firstName = displayName.split(" ")[0];
  const greeting = hydrated ? getGreeting() : "Welcome";

  // Toggle favorite handler (for photos)
  const handleToggleFavorite = (photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
        showToast("Removed from favorites", "info");
      } else {
        next.add(photoId);
        showToast("Added to favorites", "success");
      }
      return next;
    });
  };

  // Toggle save handler (for properties)
  const handleToggleSaveProperty = (propertyId: string) => {
    setSavedProperties((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
        showToast("Removed from saved", "info");
      } else {
        next.add(propertyId);
        showToast("Property saved", "success");
      }
      return next;
    });
  };

  // Single photo download handler
  const handlePhotoDownload = async (photo: { id: string; url: string; filename: string }) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Photo downloaded", "success");
    } catch {
      showToast("Failed to download photo", "error");
    }
  };

  // Download handlers
  const handleZipDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("zip");
    try {
      const result = await getGalleryZipDownload(galleryId);
      if (result.success && result.gallery) {
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
        for (const photo of result.photos) {
          if (photo.url) {
            window.open(photo.url, "_blank");
            break;
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
      const result = await getMarketingKitDownload(galleryId);

      if (!result.success || !result.marketingKit) {
        showToast(result.error || "Failed to get marketing kit", "error");
        return;
      }

      const { marketingKit } = result;

      // Open the modal with marketing kit data
      setMarketingKitModal({
        galleryId: marketingKit.galleryId,
        galleryName: marketingKit.galleryName,
        propertyAddress: marketingKit.propertyAddress,
        assets: marketingKit.assets,
      });
    } catch (error) {
      console.error("Marketing kit error:", error);
      showToast("Failed to load marketing kit. Please try again.", "error");
    } finally {
      setDownloadingGallery(null);
      setDownloadType(null);
    }
  };

  const handleSelectedDownload = async (galleryId: string, photoIds: string[]) => {
    if (photoIds.length === 0) {
      showToast("No photos selected", "error");
      return;
    }

    setDownloadingGallery(galleryId);
    setDownloadType("zip");
    try {
      const gallery = galleries.find((g) => g.id === galleryId);
      if (!gallery) {
        showToast("Gallery not found", "error");
        return;
      }

      // Photo IDs are the same as asset IDs in the transformed data
      const response = await fetch("/api/download/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          assetIds: photoIds,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${gallery.name}-selected-${photoIds.length}-photos.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast(`Downloaded ${photoIds.length} selected photos`, "success");
      } else {
        showToast("Failed to download. Please try again.", "error");
      }
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
    <div className="min-h-screen bg-[var(--background)] pb-20 md:pb-0">
      <PortalHeader
        client={client}
        invoices={invoices}
        questionnaires={questionnaires}
        galleries={galleries}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Welcome with time-based greeting */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className="text-xl font-bold text-[var(--foreground)] sm:text-2xl"
                suppressHydrationWarning
              >
                {greeting}, {firstName}
              </h1>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)] sm:text-base">
                View your property websites, galleries, and downloads
              </p>
            </div>
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
              <input
                type="text"
                placeholder="Search properties, galleries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground-secondary)]"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {/* Search Results Summary */}
          {searchQuery && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--foreground-muted)]">
              <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-1">
                {filteredProperties.length} properties
              </span>
              <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-1">
                {filteredGalleries.length} galleries
              </span>
              <span className="rounded-full bg-[var(--background-tertiary)] px-2 py-1">
                {filteredLeads.length} leads
              </span>
            </div>
          )}
        </div>

        {/* Action Cards - Priority items requiring attention */}
        <ActionCards
          invoices={invoices}
          questionnaires={questionnaires}
          galleries={galleries}
          onPayInvoice={handleInvoicePayment}
          onDownloadGallery={handleZipDownload}
          payingInvoice={payingInvoice}
          downloadingGallery={downloadingGallery}
        />

        {/* Recent Activity Feed */}
        <RecentActivity
          properties={properties}
          galleries={galleries}
          invoices={invoices}
          leads={leads}
        />

        <PortalStats stats={stats} />

        {/* Desktop Tabs - Hidden on mobile */}
        <div className="hidden md:block">
          <PortalTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingQuestionnaires={stats.pendingQuestionnaires}
            newLeads={stats.newLeads}
          />
        </div>

        {/* Tab Content */}
        <div
          className="mt-6"
          role="tabpanel"
          id={`${activeTab}-panel`}
          aria-labelledby={`${activeTab}-tab`}
          tabIndex={0}
        >
          {activeTab === "properties" && (
            <PropertiesTab
              properties={filteredProperties}
              savedProperties={savedProperties}
              onToggleSave={handleToggleSaveProperty}
              onShowToast={(message) => showToast(message, "success")}
            />
          )}

          {activeTab === "galleries" && (
            <GalleriesTab
              galleries={filteredGalleries}
              downloadingGallery={downloadingGallery}
              onDownload={handleZipDownload}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPhotoDownload={handlePhotoDownload}
            />
          )}

          {activeTab === "downloads" && (
            <DownloadsTab
              galleries={galleries}
              downloadingGallery={downloadingGallery}
              downloadType={downloadType}
              onZipDownload={handleZipDownload}
              onWebSizeDownload={handleWebSizeDownload}
              onHighResDownload={handleHighResDownload}
              onMarketingKitDownload={handleMarketingKitDownload}
              favorites={favorites}
              onSelectedDownload={handleSelectedDownload}
            />
          )}

          {activeTab === "invoices" && (
            <InvoicesTab
              invoices={invoices}
              payingInvoice={payingInvoice}
              downloadingInvoicePdf={downloadingInvoicePdf}
              onPayment={handleInvoicePayment}
              onPdfDownload={handleInvoicePdfDownload}
            />
          )}

          {activeTab === "leads" && (
            <LeadsTab leads={filteredLeads} />
          )}

          {activeTab === "questionnaires" && (
            <QuestionnairesTab questionnaires={questionnaires} />
          )}

          {activeTab === "messages" && (
            <MessagesTab clientId={client.id} />
          )}

          {activeTab === "settings" && (
            <SettingsTab client={client} />
          )}
        </div>
      </div>

      <PortalFooter />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingQuestionnaires={stats.pendingQuestionnaires}
        unpaidInvoices={unpaidInvoicesCount}
        newLeads={stats.newLeads}
      />

      {/* Marketing Kit Modal */}
      {marketingKitModal && (
        <MarketingKitModal
          isOpen={!!marketingKitModal}
          onClose={() => setMarketingKitModal(null)}
          galleryName={marketingKitModal.galleryName}
          propertyAddress={marketingKitModal.propertyAddress}
          assets={marketingKitModal.assets}
        />
      )}
    </div>
  );
}

// Icon components for search
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

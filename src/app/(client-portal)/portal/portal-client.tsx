"use client";

import { useState, useEffect } from "react";
import {
  getGalleryZipDownload,
  getWebSizeDownload,
  getHighResDownload,
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
  PropertiesTab,
  GalleriesTab,
  DownloadsTab,
  InvoicesTab,
  QuestionnairesTab,
  type ClientData,
  type PropertyData,
  type GalleryData,
  type InvoiceData,
  type QuestionnaireData,
  type PortalStatsData,
  type PortalTab,
  type DownloadType,
} from "./components";

interface PortalClientProps {
  client: ClientData;
  stats: PortalStatsData;
  properties: PropertyData[];
  galleries: GalleryData[];
  invoices: InvoiceData[];
  questionnaires: QuestionnaireData[];
}

// Helper: Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function PortalClient({ client, stats, properties, galleries, invoices, questionnaires }: PortalClientProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<PortalTab>(
    stats.pendingQuestionnaires > 0 ? "questionnaires" : "properties"
  );
  const [downloadingGallery, setDownloadingGallery] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<DownloadType>(null);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingInvoicePdf, setDownloadingInvoicePdf] = useState<string | null>(null);

  // Favorites state (persisted to localStorage)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`portal_favorites_${client.id}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });

  // Calculate unpaid invoices count for mobile nav
  const unpaidInvoicesCount = invoices.filter(
    (inv) => inv.status !== "paid" && inv.status !== "draft"
  ).length;

  // Persist favorites to localStorage
  useEffect(() => {
    localStorage.setItem(
      `portal_favorites_${client.id}`,
      JSON.stringify(Array.from(favorites))
    );
  }, [favorites, client.id]);

  const displayName = client.fullName || client.email.split("@")[0];
  const firstName = displayName.split(" ")[0];
  const greeting = getGreeting();

  // Toggle favorite handler
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
      const gallery = galleries.find((g) => g.id === galleryId);
      if (!gallery) {
        showToast("Gallery not found", "error");
        return;
      }
      showToast("Marketing kit coming soon! Check the property page for marketing assets.", "info");
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed. Please try again.", "error");
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
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground-secondary)] sm:text-base">
            View your property websites, galleries, and downloads
          </p>
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

        <PortalStats stats={stats} />

        {/* Desktop Tabs - Hidden on mobile */}
        <div className="hidden md:block">
          <PortalTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingQuestionnaires={stats.pendingQuestionnaires}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "properties" && <PropertiesTab properties={properties} />}

          {activeTab === "galleries" && (
            <GalleriesTab
              galleries={galleries}
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

          {activeTab === "questionnaires" && (
            <QuestionnairesTab questionnaires={questionnaires} />
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
      />
    </div>
  );
}

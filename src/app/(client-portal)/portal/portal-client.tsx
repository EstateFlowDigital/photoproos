"use client";

import { useState } from "react";
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

export function PortalClient({ client, stats, properties, galleries, invoices, questionnaires }: PortalClientProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<PortalTab>(
    stats.pendingQuestionnaires > 0 ? "questionnaires" : "properties"
  );
  const [downloadingGallery, setDownloadingGallery] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<DownloadType>(null);
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null);
  const [downloadingInvoicePdf, setDownloadingInvoicePdf] = useState<string | null>(null);

  const displayName = client.fullName || client.email.split("@")[0];
  const firstName = displayName.split(" ")[0];

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
    <div className="min-h-screen bg-[#0a0a0a]">
      <PortalHeader client={client} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
          <p className="mt-1 text-[#a7a7a7]">View your property websites, galleries, and downloads</p>
        </div>

        <PortalStats stats={stats} />

        <PortalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingQuestionnaires={stats.pendingQuestionnaires}
        />

        {activeTab === "properties" && (
          <PropertiesTab properties={properties} />
        )}

        {activeTab === "galleries" && (
          <GalleriesTab
            galleries={galleries}
            downloadingGallery={downloadingGallery}
            onDownload={handleZipDownload}
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

      <PortalFooter />
    </div>
  );
}

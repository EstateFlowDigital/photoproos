"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDate, formatPrice } from "./utils";
import type { InvoiceData, QuestionnaireData, GalleryData } from "./types";
import { useHydrated } from "@/hooks/use-hydrated";

interface ActionCardsProps {
  invoices: InvoiceData[];
  questionnaires: QuestionnaireData[];
  galleries: GalleryData[];
  onPayInvoice: (invoiceId: string) => void;
  onDownloadGallery: (galleryId: string) => void;
  payingInvoice: string | null;
  downloadingGallery: string | null;
}

export function ActionCards({
  invoices,
  questionnaires,
  galleries,
  onPayInvoice,
  onDownloadGallery,
  payingInvoice,
  downloadingGallery,
}: ActionCardsProps) {
  const hydrated = useHydrated();
  // Get unpaid invoices
  const unpaidInvoices = useMemo(
    () => invoices.filter((inv) => inv.status !== "paid" && inv.status !== "draft"),
    [invoices]
  );

  // Get pending questionnaires
  const pendingQuestionnaires = useMemo(
    () => questionnaires.filter((q) => q.status !== "completed" && q.status !== "approved"),
    [questionnaires]
  );

  // Get recently delivered galleries (last 7 days)
  const recentGalleries = useMemo(() => {
    if (!hydrated) return [];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return galleries.filter((g) => {
      if (!g.deliveredAt || !g.downloadable) return false;
      const deliveredDate = new Date(g.deliveredAt);
      return deliveredDate > sevenDaysAgo;
    });
  }, [galleries, hydrated]);

  // If no action items, don't render anything
  if (
    unpaidInvoices.length === 0 &&
    pendingQuestionnaires.length === 0 &&
    recentGalleries.length === 0
  ) {
    return null;
  }

  return (
    <div className="mb-8 space-y-3">
      {/* Unpaid Invoices */}
      {unpaidInvoices.map((invoice) => (
        <ActionCard
          key={invoice.id}
          variant="warning"
          icon={<InvoiceIcon />}
          title={`Invoice ${invoice.invoiceNumber} requires payment`}
          subtitle={
            invoice.dueDate
              ? `Due ${formatDate(invoice.dueDate)} • ${formatPrice(invoice.amount)}`
              : formatPrice(invoice.amount)
          }
          action={
            <button
              onClick={() => onPayInvoice(invoice.id)}
              disabled={payingInvoice === invoice.id}
              className="flex items-center gap-2 rounded-lg bg-[var(--warning)] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[var(--warning)]/90 disabled:opacity-50"
            >
              {payingInvoice === invoice.id ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>
          }
        />
      ))}

      {/* Pending Questionnaires */}
      {pendingQuestionnaires.map((questionnaire) => (
        <ActionCard
          key={questionnaire.id}
          variant="primary"
          icon={<ClipboardIcon />}
          title={`Complete your ${questionnaire.templateName}`}
          subtitle={
            questionnaire.dueDate
              ? `Due ${formatDate(questionnaire.dueDate)}${questionnaire.isRequired ? " • Required" : ""}`
              : questionnaire.bookingTitle
                ? `For ${questionnaire.bookingTitle}`
                : undefined
          }
          action={
            <Link
              href={`/portal/questionnaires/${questionnaire.id}`}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--primary)]/90"
            >
              {questionnaire.startedAt ? "Continue" : "Start Now"}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          }
        />
      ))}

      {/* Recently Delivered Galleries */}
      {recentGalleries.map((gallery) => (
        <ActionCard
          key={gallery.id}
          variant="success"
          icon={<ImageIcon />}
          title={`${gallery.name} is ready for download`}
          subtitle={`${gallery.photoCount} photos${gallery.deliveredAt ? ` • Delivered ${formatDate(gallery.deliveredAt)}` : ""}`}
          action={
            <button
              onClick={() => onDownloadGallery(gallery.id)}
              disabled={downloadingGallery === gallery.id}
              className="flex items-center gap-2 rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-[var(--success)]/90 disabled:opacity-50"
            >
              {downloadingGallery === gallery.id ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Downloading...
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4" />
                  Download
                </>
              )}
            </button>
          }
        />
      ))}
    </div>
  );
}

// Action Card Component
interface ActionCardProps {
  variant: "primary" | "warning" | "success" | "error";
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action: React.ReactNode;
}

function ActionCard({ variant, icon, title, subtitle, action }: ActionCardProps) {
  const borderColors = {
    primary: "border-[var(--primary)]/30",
    warning: "border-[var(--warning)]/30",
    success: "border-[var(--success)]/30",
    error: "border-[var(--error)]/30",
  };

  const iconBgColors = {
    primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)]",
    success: "bg-[var(--success)]/10 text-[var(--success)]",
    error: "bg-[var(--error)]/10 text-[var(--error)]",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl border ${borderColors[variant]} bg-[var(--card)] p-4`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgColors[variant]}`}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium text-[var(--foreground)]">{title}</p>
          {subtitle && (
          <p className="text-sm text-[var(--foreground-muted)]" suppressHydrationWarning>
            {subtitle}
          </p>
        )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Icons
function InvoiceIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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

"use client";

import { useState } from "react";
import Link from "next/link";

// Demo client data
const demoClient = {
  id: "c1",
  fullName: "Sarah Johnson",
  email: "sarah@kwrealty.com",
  company: "Keller Williams Realty",
  phone: "(512) 555-0123",
};

// Demo properties
const demoProperties = [
  {
    id: "1",
    address: "123 Maple Street",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    price: 85000000,
    status: "published",
    template: "modern",
    viewCount: 342,
    leadCount: 5,
    photoCount: 42,
    slug: "123-maple-street",
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "2",
    address: "456 Oak Avenue",
    city: "Austin",
    state: "TX",
    zipCode: "78704",
    price: 125000000,
    status: "published",
    template: "luxury",
    viewCount: 189,
    leadCount: 12,
    photoCount: 38,
    slug: "456-oak-avenue",
    createdAt: new Date("2024-12-18"),
  },
  {
    id: "3",
    address: "789 Elm Court",
    city: "Round Rock",
    state: "TX",
    zipCode: "78664",
    price: 45000000,
    status: "draft",
    template: "minimal",
    viewCount: 0,
    leadCount: 0,
    photoCount: 28,
    slug: "789-elm-court",
    createdAt: new Date("2024-12-22"),
  },
];

// Demo galleries
const demoGalleries = [
  {
    id: "g1",
    name: "123 Maple Street",
    photoCount: 42,
    status: "delivered",
    downloadable: true,
    deliveredAt: new Date("2024-12-21"),
  },
  {
    id: "g2",
    name: "456 Oak Avenue",
    photoCount: 38,
    status: "delivered",
    downloadable: true,
    deliveredAt: new Date("2024-12-19"),
  },
  {
    id: "g3",
    name: "789 Elm Court",
    photoCount: 28,
    status: "pending",
    downloadable: false,
    deliveredAt: null,
  },
];

// Demo invoices
const demoInvoices = [
  {
    id: "inv1",
    invoiceNumber: "INV-001",
    amount: 35000, // $350.00
    status: "paid",
    dueDate: new Date("2024-12-25"),
    paidAt: new Date("2024-12-23"),
  },
  {
    id: "inv2",
    invoiceNumber: "INV-002",
    amount: 45000, // $450.00
    status: "paid",
    dueDate: new Date("2024-12-20"),
    paidAt: new Date("2024-12-19"),
  },
];

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState<"properties" | "galleries" | "downloads" | "invoices">(
    "properties"
  );

  const stats = {
    totalProperties: demoProperties.length,
    totalViews: demoProperties.reduce((acc, p) => acc + p.viewCount, 0),
    totalLeads: demoProperties.reduce((acc, p) => acc + p.leadCount, 0),
    totalPhotos: demoGalleries.reduce((acc, g) => acc + g.photoCount, 0),
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
                <p className="text-sm font-medium text-white">{demoClient.fullName}</p>
                <p className="text-xs text-[#7c7c7c]">{demoClient.company}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6]/10 text-sm font-medium text-[#3b82f6]">
                {demoClient.fullName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {demoClient.fullName.split(" ")[0]}</h1>
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
            <p className="mt-1 text-2xl font-bold text-white">{stats.totalViews}</p>
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
          {(["properties", "galleries", "downloads", "invoices"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "border-[#3b82f6] text-white"
                  : "border-transparent text-[#7c7c7c] hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demoProperties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]"
              >
                <div className="relative aspect-video bg-[#191919]">
                  <div className="flex h-full items-center justify-center">
                    <HomeIcon className="h-12 w-12 text-[#7c7c7c]" />
                  </div>
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
                  <p className="font-bold text-white">{formatPrice(property.price)}</p>
                  <p className="mt-1 font-medium text-white">{property.address}</p>
                  <p className="text-sm text-[#7c7c7c]">
                    {property.city}, {property.state} {property.zipCode}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#7c7c7c]">
                    <span>{property.viewCount} views</span>
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
            ))}
          </div>
        )}

        {/* Galleries Tab */}
        {activeTab === "galleries" && (
          <div className="space-y-4">
            {demoGalleries.map((gallery) => (
              <div
                key={gallery.id}
                className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#141414] p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#191919]">
                    <ImageIcon className="h-6 w-6 text-[#7c7c7c]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{gallery.name}</h3>
                    <p className="text-sm text-[#7c7c7c]">
                      {gallery.photoCount} photos
                      {gallery.deliveredAt && ` • Delivered ${formatDate(gallery.deliveredAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      gallery.status === "delivered"
                        ? "bg-[#22c55e]/20 text-[#22c55e]"
                        : "bg-[#f97316]/20 text-[#f97316]"
                    }`}
                  >
                    {gallery.status}
                  </span>
                  {gallery.downloadable && (
                    <button className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3b82f6]/90">
                      <DownloadIcon className="h-4 w-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="space-y-6">
            <p className="text-[#a7a7a7]">Download all your photos and marketing materials</p>

            {demoGalleries
              .filter((g) => g.downloadable)
              .map((gallery) => (
                <div
                  key={gallery.id}
                  className="rounded-xl border border-[#262626] bg-[#141414] p-6"
                >
                  <h3 className="text-lg font-semibold text-white">{gallery.name}</h3>
                  <p className="mt-1 text-sm text-[#7c7c7c]">{gallery.photoCount} photos available</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626]">
                      <DownloadIcon className="h-4 w-4" />
                      All Photos (ZIP)
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626]">
                      <ImageIcon className="h-4 w-4" />
                      Web Size
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626]">
                      <FileIcon className="h-4 w-4" />
                      High-Res
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626]">
                      <DocumentIcon className="h-4 w-4" />
                      Marketing Kit
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            {demoInvoices.map((invoice) => (
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
                      Due {formatDate(invoice.dueDate)}
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
                        : "bg-[#ef4444]/20 text-[#ef4444]"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
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

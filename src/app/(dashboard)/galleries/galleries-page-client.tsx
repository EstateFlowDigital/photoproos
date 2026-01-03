"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CreateGalleryModal } from "@/components/modals/create-gallery-modal";
import { GalleryListClient } from "./gallery-list-client";
import { PageHeader, PageContextNav, PhotoIcon, DropboxIcon } from "@/components/dashboard";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface GalleryService {
  id: string;
  name: string;
  category: string;
  isPrimary: boolean;
}

interface AvailableService {
  id: string;
  name: string;
  category: string;
}

interface Gallery {
  id: string;
  name: string;
  client: string;
  photos: number;
  status: "delivered" | "pending" | "draft" | "archived";
  revenue?: string;
  thumbnailUrl?: string;
  createdAt: string;
  views: number;
  downloads: number;
  services: GalleryService[];
}

interface GalleriesPageClientProps {
  galleries: Gallery[];
  clients: Client[];
  filter: "all" | "delivered" | "pending" | "draft";
  counts: {
    all: number;
    draft: number;
    pending: number;
    delivered: number;
    archived: number;
  };
  availableServices: AvailableService[];
}

export function GalleriesPageClient({
  galleries,
  clients,
  filter,
  counts,
  availableServices,
}: GalleriesPageClientProps) {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleGalleryCreated = (gallery: { id: string; name: string }) => {
    router.refresh();
  };

  const tabs: { id: typeof filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "delivered", label: "Delivered", count: counts.delivered },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "draft", label: "Drafts", count: counts.draft },
  ];

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Galleries"
        subtitle="Manage and deliver your photo galleries"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            New Gallery
          </button>
        }
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "Galleries", href: "/galleries", icon: <PhotoIcon className="h-4 w-4" /> },
          { label: "Services", href: "/galleries/services", icon: <ServicesIcon className="h-4 w-4" /> },
        ]}
        integrations={[
          { label: "Dropbox", href: "/settings/integrations", icon: <DropboxIcon className="h-4 w-4" /> },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "all" ? "/galleries" : `/galleries?filter=${tab.id}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                filter === tab.id
                  ? "bg-white/20"
                  : "bg-[var(--background-secondary)]"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {galleries.length === 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <GalleryIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {filter === "all" ? "No galleries yet" : `No ${filter} galleries`}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
            {filter === "all"
              ? "Create your first gallery to start delivering photos to your clients."
              : `You don't have any ${filter} galleries at the moment.`}
          </p>
          {filter === "all" && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Gallery
            </button>
          )}
        </div>
      )}

      {/* Gallery List with Search, Sort, View Toggle */}
      {galleries.length > 0 && (
        <GalleryListClient
          galleries={galleries}
          filter={filter}
          availableServices={availableServices}
        />
      )}

      {/* Create Gallery Modal */}
      <CreateGalleryModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleGalleryCreated}
        clients={clients}
        services={availableServices.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category as "real_estate" | "portrait" | "event" | "commercial" | "wedding" | "product" | "other",
          description: null,
          priceCents: 0,
          duration: null,
          deliverables: [],
          isActive: true,
          isDefault: false,
        }))}
      />
    </>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function ServicesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M.99 5.24A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25l.01 9.5A2.25 2.25 0 0 1 16.76 17H3.26A2.25 2.25 0 0 1 1 14.75l-.01-9.5Zm8.26 9.52v-.625a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75v.615c0 .414.336.75.75.75h5.373a.75.75 0 0 0 .627-.74Zm1.5 0a.75.75 0 0 0 .627.74h5.373a.75.75 0 0 0 .75-.75v-.615a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 0-.75.75v.625Zm6.75-3.63v-.625a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 0-.75.75v.625c0 .414.336.75.75.75h5.25a.75.75 0 0 0 .75-.75Zm-8.25 0v-.625a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75v.625c0 .414.336.75.75.75H8.5a.75.75 0 0 0 .75-.75ZM17.5 7.5v-.625a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 0-.75.75V7.5c0 .414.336.75.75.75h5.25a.75.75 0 0 0 .75-.75Zm-8.25 0v-.625a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75V7.5c0 .414.336.75.75.75H8.5a.75.75 0 0 0 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

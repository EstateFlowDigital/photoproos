"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { deletePropertyWebsite } from "@/lib/actions/property-websites";
import type { PropertyWebsiteWithRelations } from "@/lib/actions/property-websites";

interface PropertiesClientProps {
  websites: PropertyWebsiteWithRelations[];
}

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
  }).format(new Date(date));
}

export function PropertiesClient({ websites }: PropertiesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyWebsiteWithRelations | null>(null);

  const filteredWebsites = websites.filter((website) => {
    // Filter by status
    if (filter === "published" && !website.isPublished) return false;
    if (filter === "draft" && website.isPublished) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        website.address.toLowerCase().includes(query) ||
        website.city.toLowerCase().includes(query) ||
        website.project.client?.fullName?.toLowerCase().includes(query) ||
        website.project.client?.company?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        const result = await deletePropertyWebsite(deleteTarget.id);
        if (result.success) {
          showToast("Property website deleted", "success");
          setDeleteTarget(null);
          router.refresh();
        } else {
          showToast(result.error || "Failed to delete property website", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-foreground text-background"
                : "text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "published"
                ? "bg-foreground text-background"
                : "text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "draft"
                ? "bg-foreground text-background"
                : "text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            Drafts
          </button>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:w-64"
          />
        </div>
      </div>

      {/* Property Grid */}
      {filteredWebsites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No property websites found</h3>
          <p className="mt-2 text-foreground-secondary">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first property website to get started"}
          </p>
          {!searchQuery && (
            <Link
              href="/properties/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Website
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWebsites.map((website) => (
            <PropertyCard key={website.id} website={website} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="text-[var(--error)]">Delete Property Website</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-4">
                <div className="flex items-start gap-3">
                  <WarningIcon className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-[var(--error)]">
                      You are about to delete this property website:
                    </p>
                    {deleteTarget && (
                      <div className="mt-2 text-foreground">
                        <p className="font-medium">{deleteTarget.address}</p>
                        <p className="text-foreground-muted">
                          {deleteTarget.city}, {deleteTarget.state} {deleteTarget.zipCode}
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-foreground-muted">
                      This will permanently delete the property website and all associated leads. The original gallery will not be affected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete Property Website"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PropertyCard({ website, onDelete }: { website: PropertyWebsiteWithRelations; onDelete: (website: PropertyWebsiteWithRelations) => void }) {
  const coverImage = website.project.coverImageUrl || website.project.assets[0]?.thumbnailUrl;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[var(--border-hover)]">
      {/* Delete Button - appears on hover */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(website);
        }}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-foreground-muted opacity-0 backdrop-blur-sm transition-all hover:bg-[var(--error)]/20 hover:text-[var(--error)] group-hover:opacity-100"
        title="Delete property website"
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      <Link href={`/properties/${website.id}`} className="block">
        {/* Image Preview */}
        <div className="relative aspect-[16/10] bg-[var(--background-tertiary)]">
          {coverImage ? (
            <img
              src={coverImage}
              alt={website.address}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <HomeIcon className="h-12 w-12 text-foreground-muted" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute left-3 top-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                website.isPublished
                  ? "bg-[var(--success)]/20 text-[var(--success)]"
                  : "bg-foreground/10 text-foreground-secondary"
              }`}
            >
              {website.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          {/* Template Badge */}
          <div className="absolute right-12 top-3">
            <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {website.template.charAt(0).toUpperCase() + website.template.slice(1)}
            </span>
          </div>
        </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        {website.price && (
          <p className="text-lg font-bold text-foreground">{formatPrice(website.price)}</p>
        )}

        {/* Address */}
        <p className="mt-1 font-medium text-foreground group-hover:text-[var(--primary)]">
          {website.address}
        </p>
        <p className="text-sm text-foreground-secondary">
          {website.city}, {website.state} {website.zipCode}
        </p>

        {/* Property Details */}
        <div className="mt-3 flex items-center gap-3 text-sm text-foreground-secondary">
          {website.beds && (
            <span className="flex items-center gap-1">
              <BedIcon className="h-4 w-4" />
              {website.beds} beds
            </span>
          )}
          {website.baths && (
            <span className="flex items-center gap-1">
              <BathIcon className="h-4 w-4" />
              {website.baths} baths
            </span>
          )}
          {website.sqft && (
            <span className="flex items-center gap-1">
              <RulerIcon className="h-4 w-4" />
              {website.sqft.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Agent */}
        {website.project.client && (
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--card-border)] pt-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
              {website.project.client.fullName?.charAt(0) || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {website.project.client.fullName}
              </p>
              {website.project.client.company && (
                <p className="truncate text-xs text-foreground-muted">
                  {website.project.client.company}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 border-t border-[var(--card-border)] pt-3 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <EyeIcon className="h-3.5 w-3.5" />
            {website.viewCount} views
          </span>
          <span className="flex items-center gap-1">
            <UserIcon className="h-3.5 w-3.5" />
            {website._count.leads} leads
          </span>
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDate(website.createdAt)}
          </span>
        </div>
      </div>
      </Link>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4a2 2 0 01-2 2M4 12v6a2 2 0 002 2h12a2 2 0 002-2v-6"
      />
    </svg>
  );
}

function BathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16h16M6 16v4m12-4v4M4 12h16M6 8h.01M10 8h.01M14 8h.01M6 4h12a2 2 0 012 2v6H4V6a2 2 0 012-2z"
      />
    </svg>
  );
}

function RulerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

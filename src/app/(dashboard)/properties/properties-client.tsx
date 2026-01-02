"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");

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
            <PropertyCard key={website.id} website={website} />
          ))}
        </div>
      )}
    </>
  );
}

function PropertyCard({ website }: { website: PropertyWebsiteWithRelations }) {
  const coverImage = website.project.coverImageUrl || website.project.assets[0]?.thumbnailUrl;

  return (
    <Link
      href={`/properties/${website.id}`}
      className="group overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] transition-all hover:border-[var(--border-hover)]"
    >
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
        <div className="absolute right-3 top-3">
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

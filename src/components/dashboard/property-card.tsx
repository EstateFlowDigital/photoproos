"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  TrashIcon,
  DuplicateIcon,
  EyeIcon,
  UserIcon,
  CalendarIcon,
  HomeIcon,
} from "@/components/ui/icons";

interface PropertyClient {
  fullName?: string | null;
  company?: string | null;
}

interface PropertyProject {
  coverImageUrl?: string | null;
  assets: { thumbnailUrl?: string | null }[];
  client?: PropertyClient | null;
}

export interface PropertyWebsite {
  id: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  template: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  project: PropertyProject;
  _count: {
    leads: number;
  };
}

export interface PropertyCardProps<T extends PropertyWebsite = PropertyWebsite> {
  website: T;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: (website: T) => void;
  onDuplicate: () => void;
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

export function PropertyCard<T extends PropertyWebsite>({
  website,
  isSelected,
  onToggleSelect,
  onDelete,
  onDuplicate,
}: PropertyCardProps<T>) {
  const coverImage =
    website.project.coverImageUrl || website.project.assets[0]?.thumbnailUrl;

  return (
    <div
      className={cn(
        "group relative overflow-x-auto rounded-xl border bg-[var(--card)] transition-all hover:border-[var(--border-hover)]",
        isSelected
          ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
          : "border-[var(--card-border)]"
      )}
    >
      {/* Selection Checkbox */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelect();
        }}
        className="absolute left-2 top-2 z-20"
      >
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
            isSelected
              ? "border-[var(--primary)] bg-[var(--primary)]"
              : "border-white/50 bg-background/80 backdrop-blur-sm group-hover:border-white/80"
          )}
        >
          {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
        </div>
      </button>

      {/* Action Buttons - appear on hover */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 opacity-0 transition-all group-hover:opacity-100">
        {/* Preview Button */}
        {website.isPublished && (
          <a
            href={`/p/${website.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-foreground-muted backdrop-blur-sm transition-all hover:bg-[var(--primary)]/20 hover:text-[var(--primary)]"
            title="Preview live site"
          >
            <PreviewIcon className="h-4 w-4" />
          </a>
        )}
        {/* Duplicate Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-foreground-muted backdrop-blur-sm transition-all hover:bg-[var(--primary)]/20 hover:text-[var(--primary)]"
          title="Duplicate property website"
        >
          <DuplicateIcon className="h-4 w-4" />
        </button>
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(website);
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 text-foreground-muted backdrop-blur-sm transition-all hover:bg-[var(--error)]/20 hover:text-[var(--error)]"
          title="Delete property website"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

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
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                website.isPublished
                  ? "bg-[var(--success)]/20 text-[var(--success)]"
                  : "bg-foreground/10 text-foreground-secondary"
              )}
            >
              {website.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          {/* Template Badge */}
          <div className="absolute right-12 top-3">
            <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
              {website.template.charAt(0).toUpperCase() +
                website.template.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          {website.price && (
            <p className="text-lg font-bold text-foreground">
              {formatPrice(website.price)}
            </p>
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
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-xs font-medium text-[var(--primary)]">
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

// Property-specific icons not in centralized library
function PreviewIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path
        fillRule="evenodd"
        d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
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
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
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
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

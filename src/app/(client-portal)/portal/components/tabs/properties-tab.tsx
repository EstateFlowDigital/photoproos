"use client";

import Link from "next/link";
import Image from "next/image";
import { HomeIcon, ExternalLinkIcon } from "../icons";
import { formatPrice, BLUR_DATA_URL } from "../utils";
import { EmptyState } from "../empty-state";
import type { PropertyData } from "../types";

interface PropertiesTabProps {
  properties: PropertyData[];
}

export function PropertiesTab({ properties }: PropertiesTabProps) {
  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<HomeIcon className="h-12 w-12" />}
        illustration="property"
        title="No property websites yet"
        description="Your dedicated property websites will appear here once your photographer creates them. Each property gets its own beautiful, shareable website to showcase your listing."
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyData }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="relative aspect-video bg-[var(--background-tertiary)]">
        {property.thumbnailUrl ? (
          <Image
            src={property.thumbnailUrl}
            alt={property.address}
            fill
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <HomeIcon className="h-12 w-12 text-[var(--foreground-muted)]" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              property.status === "published"
                ? "bg-[var(--success)]/20 text-[var(--success)]"
                : "bg-[var(--foreground-muted)]/20 text-[var(--foreground-secondary)]"
            }`}
          >
            {property.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        {property.price && (
          <p className="font-bold text-[var(--foreground)]">{formatPrice(property.price)}</p>
        )}
        <p className="mt-1 font-medium text-[var(--foreground)]">{property.address}</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          {property.city}, {property.state} {property.zipCode}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
          <span>{property.viewCount.toLocaleString()} views</span>
          <span>{property.leadCount} leads</span>
          <span>{property.photoCount} photos</span>
        </div>
        {property.status === "published" && (
          <Link
            href={`/p/${property.slug}`}
            target="_blank"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            View Website
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HomeIcon, ExternalLinkIcon, HeartIcon, FireIcon, CompareIcon } from "../icons";
import { formatPrice, BLUR_DATA_URL } from "../utils";
import { EmptyState } from "../empty-state";
import type { PropertyData } from "../types";

interface PropertiesTabProps {
  properties: PropertyData[];
  savedProperties?: Set<string>;
  onToggleSave?: (propertyId: string) => void;
}

// Threshold for "hot" property badge (views in last 7 days would be ideal, but we use total for now)
const HOT_PROPERTY_THRESHOLD = 50;

export function PropertiesTab({
  properties,
  savedProperties = new Set(),
  onToggleSave,
}: PropertiesTabProps) {
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [showComparison, setShowComparison] = useState(false);

  const handleToggleComparison = (propertyId: string) => {
    setSelectedForComparison((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else if (next.size < 3) {
        next.add(propertyId);
      }
      return next;
    });
  };

  const selectedProperties = properties.filter((p) => selectedForComparison.has(p.id));

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
    <>
      {/* Comparison bar */}
      {selectedForComparison.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-4 py-3">
          <span className="text-sm font-medium text-[var(--primary)]">
            {selectedForComparison.size} {selectedForComparison.size === 1 ? "property" : "properties"} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedForComparison(new Set())}
              className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
              Clear
            </button>
            <button
              onClick={() => setShowComparison(true)}
              disabled={selectedForComparison.size < 2}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CompareIcon className="h-4 w-4" />
              Compare
            </button>
          </div>
        </div>
      )}

      {/* Saved properties section */}
      {savedProperties.size > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <HeartIcon className="h-4 w-4 text-[var(--error)]" filled />
            Saved Properties ({savedProperties.size})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties
              .filter((p) => savedProperties.has(p.id))
              .map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSaved={true}
                  isSelectedForComparison={selectedForComparison.has(property.id)}
                  onToggleSave={onToggleSave}
                  onToggleComparison={handleToggleComparison}
                />
              ))}
          </div>
        </div>
      )}

      {/* All properties */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties
          .filter((p) => !savedProperties.has(p.id))
          .map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSaved={false}
              isSelectedForComparison={selectedForComparison.has(property.id)}
              onToggleSave={onToggleSave}
              onToggleComparison={handleToggleComparison}
            />
          ))}
      </div>

      {/* Comparison Modal */}
      {showComparison && selectedProperties.length >= 2 && (
        <PropertyComparisonModal
          properties={selectedProperties}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}

interface PropertyCardProps {
  property: PropertyData;
  isSaved: boolean;
  isSelectedForComparison: boolean;
  onToggleSave?: (propertyId: string) => void;
  onToggleComparison: (propertyId: string) => void;
}

function PropertyCard({
  property,
  isSaved,
  isSelectedForComparison,
  onToggleSave,
  onToggleComparison,
}: PropertyCardProps) {
  const isHot = property.viewCount >= HOT_PROPERTY_THRESHOLD;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-[var(--card)] transition-all ${
        isSelectedForComparison
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
          : "border-[var(--card-border)]"
      }`}
    >
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

        {/* Status and badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              property.status === "published"
                ? "bg-[var(--success)]/20 text-[var(--success)]"
                : "bg-[var(--foreground-muted)]/20 text-[var(--foreground-secondary)]"
            }`}
          >
            {property.status}
          </span>
          {isHot && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--error)]/90 px-2 py-1 text-xs font-medium text-white">
              <FireIcon className="h-3 w-3" />
              Hot
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {onToggleSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleSave(property.id);
              }}
              className="rounded-full bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-black/70"
              title={isSaved ? "Remove from saved" : "Save property"}
            >
              <HeartIcon
                className={`h-4 w-4 ${isSaved ? "text-[var(--error)]" : "text-white"}`}
                filled={isSaved}
              />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleComparison(property.id);
            }}
            className={`rounded-full p-2 backdrop-blur-sm transition-colors ${
              isSelectedForComparison
                ? "bg-[var(--primary)] text-white"
                : "bg-black/50 text-white hover:bg-black/70"
            }`}
            title={isSelectedForComparison ? "Remove from comparison" : "Add to comparison"}
          >
            <CompareIcon className="h-4 w-4" />
          </button>
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

        {/* Property specs */}
        {(property.beds || property.baths || property.sqft) && (
          <div className="mt-2 flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
            {property.beds && <span>{property.beds} bed</span>}
            {property.baths && <span>{property.baths} bath</span>}
            {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
          <span className={isHot ? "text-[var(--error)] font-medium" : ""}>
            {property.viewCount.toLocaleString()} views
          </span>
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

interface PropertyComparisonModalProps {
  properties: PropertyData[];
  onClose: () => void;
}

function PropertyComparisonModal({ properties, onClose }: PropertyComparisonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-[var(--card)] shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--card-border)] bg-[var(--card)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Compare Properties ({properties.length})
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison table */}
        <div className="p-6">
          <div className={`grid gap-4 ${properties.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {properties.map((property) => (
              <div key={property.id} className="space-y-4">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--background-tertiary)]">
                  {property.thumbnailUrl ? (
                    <Image
                      src={property.thumbnailUrl}
                      alt={property.address}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <HomeIcon className="h-8 w-8 text-[var(--foreground-muted)]" />
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <p className="font-medium text-[var(--foreground)]">{property.address}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {property.city}, {property.state}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          <div className="mt-6 space-y-0">
            <ComparisonRow
              label="Price"
              values={properties.map((p) => (p.price ? formatPrice(p.price) : "—"))}
              highlight="lowest"
              numericValues={properties.map((p) => p.price || 0)}
            />
            <ComparisonRow
              label="Bedrooms"
              values={properties.map((p) => (p.beds ? `${p.beds} bed` : "—"))}
              highlight="highest"
              numericValues={properties.map((p) => p.beds || 0)}
            />
            <ComparisonRow
              label="Bathrooms"
              values={properties.map((p) => (p.baths ? `${p.baths} bath` : "—"))}
              highlight="highest"
              numericValues={properties.map((p) => p.baths || 0)}
            />
            <ComparisonRow
              label="Square Feet"
              values={properties.map((p) => (p.sqft ? `${p.sqft.toLocaleString()} sqft` : "—"))}
              highlight="highest"
              numericValues={properties.map((p) => p.sqft || 0)}
            />
            <ComparisonRow
              label="Lot Size"
              values={properties.map((p) => p.lotSize || "—")}
            />
            <ComparisonRow
              label="Year Built"
              values={properties.map((p) => (p.yearBuilt ? String(p.yearBuilt) : "—"))}
            />
            <ComparisonRow
              label="Views"
              values={properties.map((p) => p.viewCount.toLocaleString())}
              highlight="highest"
              numericValues={properties.map((p) => p.viewCount)}
            />
            <ComparisonRow
              label="Leads"
              values={properties.map((p) => String(p.leadCount))}
              highlight="highest"
              numericValues={properties.map((p) => p.leadCount)}
            />
            <ComparisonRow
              label="Photos"
              values={properties.map((p) => String(p.photoCount))}
            />
          </div>

          {/* Action buttons */}
          <div className={`mt-6 grid gap-4 ${properties.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/p/${property.slug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                View Website
                <ExternalLinkIcon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  values: string[];
  highlight?: "highest" | "lowest";
  numericValues?: number[];
}

function ComparisonRow({ label, values, highlight, numericValues }: ComparisonRowProps) {
  let highlightIndex = -1;

  if (highlight && numericValues) {
    const validValues = numericValues.filter((v) => v > 0);
    if (validValues.length > 0) {
      if (highlight === "highest") {
        const max = Math.max(...validValues);
        highlightIndex = numericValues.indexOf(max);
      } else {
        const min = Math.min(...validValues);
        highlightIndex = numericValues.indexOf(min);
      }
    }
  }

  return (
    <div className="grid gap-4 border-b border-[var(--card-border)] py-3" style={{ gridTemplateColumns: `repeat(${values.length + 1}, 1fr)` }}>
      <div className="text-sm font-medium text-[var(--foreground-muted)]">{label}</div>
      {values.map((value, index) => (
        <div
          key={index}
          className={`text-sm ${
            highlightIndex === index && numericValues && numericValues[index] > 0
              ? "font-semibold text-[var(--success)]"
              : "text-[var(--foreground)]"
          }`}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  suggestPackage,
  formatSquareFeet,
  formatLotSize,
  propertyTypeLabels,
  propertyTypeIcons,
} from "@/lib/property";
import type { PropertyDetails, PropertySuggestion, PropertyType } from "@/lib/property/types";

/**
 * PropertyDetailsCard Component
 *
 * Displays property details and suggests photography packages.
 * Allows manual entry or displays fetched data.
 *
 * @example
 * <PropertyDetailsCard
 *   property={propertyData}
 *   onPropertyChange={(property) => console.log(property)}
 *   showSuggestions
 * />
 */
export interface PropertyDetailsCardProps {
  property?: PropertyDetails | null;
  onPropertyChange?: (property: PropertyDetails) => void;
  editable?: boolean;
  showSuggestions?: boolean;
  compact?: boolean;
  className?: string;
}

export function PropertyDetailsCard({
  property,
  onPropertyChange,
  editable = false,
  showSuggestions = true,
  compact = false,
  className,
}: PropertyDetailsCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [localProperty, setLocalProperty] = React.useState<PropertyDetails>(
    property || {}
  );

  React.useEffect(() => {
    if (property) {
      setLocalProperty(property);
    }
  }, [property]);

  const suggestion = localProperty.squareFeet ? suggestPackage(localProperty) : null;

  const handleChange = (field: keyof PropertyDetails, value: string | number | boolean) => {
    const updated = { ...localProperty, [field]: value };
    setLocalProperty(updated);
    onPropertyChange?.(updated);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        {localProperty.propertyType && (
          <span className="flex items-center gap-1">
            <span>{propertyTypeIcons[localProperty.propertyType]}</span>
            <span className="text-foreground-muted">
              {propertyTypeLabels[localProperty.propertyType]}
            </span>
          </span>
        )}
        {localProperty.bedrooms && (
          <span className="text-foreground">
            {localProperty.bedrooms} bed
          </span>
        )}
        {localProperty.bathrooms && (
          <span className="text-foreground">
            {localProperty.bathrooms} bath
          </span>
        )}
        {localProperty.squareFeet && (
          <span className="text-foreground">
            {formatSquareFeet(localProperty.squareFeet)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HomeIcon className="h-4 w-4 text-foreground-muted" />
          <span className="text-sm font-medium text-foreground">Property Details</span>
        </div>
        {editable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-[var(--primary)] hover:underline"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Property Type */}
        {(localProperty.propertyType || isEditing) && (
          <div>
            <label className="block text-xs text-foreground-muted mb-1.5">
              Property Type
            </label>
            {isEditing ? (
              <select
                value={localProperty.propertyType || ""}
                onChange={(e) => handleChange("propertyType", e.target.value as PropertyType)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select type...</option>
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {propertyTypeIcons[value as PropertyType]} {label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {propertyTypeIcons[localProperty.propertyType!]}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {propertyTypeLabels[localProperty.propertyType!]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Beds/Baths/SqFt Grid */}
        <div className="grid grid-cols-3 gap-4">
          <PropertyField
            label="Bedrooms"
            value={localProperty.bedrooms}
            isEditing={isEditing}
            type="number"
            onChange={(v) => handleChange("bedrooms", parseInt(v) || 0)}
            suffix="bed"
          />
          <PropertyField
            label="Bathrooms"
            value={localProperty.bathrooms}
            isEditing={isEditing}
            type="number"
            step="0.5"
            onChange={(v) => handleChange("bathrooms", parseFloat(v) || 0)}
            suffix="bath"
          />
          <PropertyField
            label="Square Feet"
            value={localProperty.squareFeet}
            isEditing={isEditing}
            type="number"
            onChange={(v) => handleChange("squareFeet", parseInt(v) || 0)}
            formatter={(v) => formatSquareFeet(v as number)}
          />
        </div>

        {/* Additional Details */}
        {(localProperty.yearBuilt || localProperty.lotSize || isEditing) && (
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--card-border)]">
            <PropertyField
              label="Year Built"
              value={localProperty.yearBuilt}
              isEditing={isEditing}
              type="number"
              onChange={(v) => handleChange("yearBuilt", parseInt(v) || 0)}
            />
            <PropertyField
              label="Lot Size"
              value={localProperty.lotSize}
              isEditing={isEditing}
              type="number"
              onChange={(v) => handleChange("lotSize", parseInt(v) || 0)}
              formatter={(v) => formatLotSize(v as number)}
            />
          </div>
        )}

        {/* Features */}
        {(localProperty.pool !== undefined || localProperty.waterfront !== undefined || isEditing) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--card-border)]">
            <FeatureToggle
              label="Pool"
              checked={localProperty.pool || false}
              onChange={(v) => handleChange("pool", v)}
              disabled={!isEditing}
              icon="🏊"
            />
            <FeatureToggle
              label="Waterfront"
              checked={localProperty.waterfront || false}
              onChange={(v) => handleChange("waterfront", v)}
              disabled={!isEditing}
              icon="🌊"
            />
          </div>
        )}

        {/* Listing Price */}
        {(localProperty.listingPrice || isEditing) && (
          <div className="pt-3 border-t border-[var(--card-border)]">
            {isEditing ? (
              <div>
                <label className="block text-xs text-foreground-muted mb-1.5">
                  Listing Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                    $
                  </span>
                  <input
                    type="number"
                    value={(localProperty.listingPrice || 0) / 100}
                    onChange={(e) => handleChange("listingPrice", Math.round(parseFloat(e.target.value || "0") * 100))}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-3 py-2 text-sm text-foreground"
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-xs text-foreground-muted">Listing Price</span>
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(localProperty.listingPrice!)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MLS Number */}
        {(localProperty.mlsNumber || isEditing) && (
          <div>
            <label className="block text-xs text-foreground-muted mb-1.5">
              MLS Number
            </label>
            {isEditing ? (
              <input
                type="text"
                value={localProperty.mlsNumber || ""}
                onChange={(e) => handleChange("mlsNumber", e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                placeholder="MLS #"
              />
            ) : (
              <span className="text-sm font-medium text-foreground">
                #{localProperty.mlsNumber}
              </span>
            )}
          </div>
        )}

        {/* Package Suggestion */}
        {showSuggestions && suggestion && (
          <div className="pt-4 border-t border-[var(--card-border)]">
            <PackageSuggestion suggestion={suggestion} />
          </div>
        )}

        {/* Data Source */}
        {localProperty.dataSource && (
          <div className="pt-3 text-xs text-foreground-muted">
            Data source: {localProperty.dataSource}
            {localProperty.fetchedAt && (
              <> • Updated {new Date(localProperty.fetchedAt).toLocaleDateString()}</>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface PropertyFieldProps {
  label: string;
  value?: number;
  isEditing: boolean;
  type?: string;
  step?: string;
  onChange: (value: string) => void;
  suffix?: string;
  formatter?: (value: number) => string;
}

function PropertyField({
  label,
  value,
  isEditing,
  type = "text",
  step,
  onChange,
  suffix,
  formatter,
}: PropertyFieldProps) {
  return (
    <div>
      <label className="block text-xs text-foreground-muted mb-1.5">{label}</label>
      {isEditing ? (
        <input
          type={type}
          step={step}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
          placeholder="0"
        />
      ) : value ? (
        <div className="text-sm font-medium text-foreground">
          {formatter ? formatter(value) : value}
          {suffix && <span className="text-foreground-muted ml-1">{suffix}</span>}
        </div>
      ) : (
        <span className="text-sm text-foreground-muted">—</span>
      )}
    </div>
  );
}

interface FeatureToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon: string;
}

function FeatureToggle({ label, checked, onChange, disabled, icon }: FeatureToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        checked
          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
          : "bg-[var(--background-secondary)] text-foreground-muted",
        disabled && "cursor-default",
        !disabled && !checked && "hover:bg-[var(--background-hover)]"
      )}
    >
      <span>{icon}</span>
      {label}
      {checked && <CheckIcon className="h-3 w-3" />}
    </button>
  );
}

interface PackageSuggestionProps {
  suggestion: PropertySuggestion;
}

function PackageSuggestion({ suggestion }: PackageSuggestionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-[var(--primary)]" />
        <span className="text-sm font-medium text-foreground">Recommended Package</span>
      </div>

      <div className="rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-3 space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <span className="font-semibold text-foreground">{suggestion.recommendedPackage}</span>
          <span className="text-xs text-foreground-muted">{suggestion.reason}</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <CameraIcon className="h-3.5 w-3.5 text-foreground-muted" />
            <span className="text-foreground">{suggestion.estimatedPhotos} photos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5 text-foreground-muted" />
            <span className="text-foreground">{suggestion.suggestedDuration} min</span>
          </div>
        </div>

        {suggestion.additionalServices.length > 0 && (
          <div className="pt-2 border-t border-[var(--primary)]/10">
            <p className="text-xs text-foreground-muted mb-1.5">Suggested add-ons:</p>
            <div className="flex flex-wrap gap-1">
              {suggestion.additionalServices.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center rounded-full bg-[var(--background)] px-2 py-0.5 text-xs text-foreground"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

export default PropertyDetailsCard;

"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { MapPreview } from "@/components/ui/map-preview";
import { TravelInfoCard } from "@/components/dashboard/travel-info-card";
import { cn } from "@/lib/utils";
import type { PlaceDetails } from "@/lib/google-maps/types";

// Demo data for settings (would come from database in production)
const demoSettings = {
  homeBaseAddress: "123 Main Street, San Francisco, CA 94102",
  homeBaseLat: 37.7749,
  homeBaseLng: -122.4194,
  travelFeePerMile: 65, // cents
  freeThresholdMiles: 15,
  applyToAllBookings: true,
};

export default function TravelSettingsPage() {
  const [homeBaseAddress, setHomeBaseAddress] = useState(demoSettings.homeBaseAddress);
  const [homeBaseLat, setHomeBaseLat] = useState(demoSettings.homeBaseLat);
  const [homeBaseLng, setHomeBaseLng] = useState(demoSettings.homeBaseLng);
  const [travelFeePerMile, setTravelFeePerMile] = useState(demoSettings.travelFeePerMile);
  const [freeThresholdMiles, setFreeThresholdMiles] = useState(demoSettings.freeThresholdMiles);
  const [applyToAllBookings, setApplyToAllBookings] = useState(demoSettings.applyToAllBookings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Example destination for preview
  const [previewDestLat] = useState(37.8044);
  const [previewDestLng] = useState(-122.2712);
  const previewDistance = 12.5; // Example distance in miles

  const handlePlaceSelect = (place: PlaceDetails) => {
    setHomeBaseAddress(place.formattedAddress);
    setHomeBaseLat(place.latitude);
    setHomeBaseLng(place.longitude);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In production, save to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  const calculateExampleFee = () => {
    const billableMiles = Math.max(0, previewDistance - freeThresholdMiles);
    return billableMiles * travelFeePerMile;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Travel & Mileage"
        subtitle="Configure travel fees, mileage rates, and home base location"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                hasChanges
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                  : "bg-[var(--background-secondary)] text-foreground-muted cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Changes will not be persisted. Connect to a database to save settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Settings */}
        <div className="space-y-6">
          {/* Home Base Location */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Home Base Location</h2>
            <p className="text-sm text-foreground-muted mb-4">
              Set your primary location for calculating travel distances
            </p>

            <AddressAutocomplete
              label="Home Base Address"
              value={homeBaseAddress}
              onChange={(value) => {
                setHomeBaseAddress(value);
                setHasChanges(true);
              }}
              onPlaceSelect={handlePlaceSelect}
              helperText="Start typing to search for your address"
            />

            {homeBaseLat && homeBaseLng && (
              <div className="mt-4">
                <MapPreview
                  latitude={homeBaseLat}
                  longitude={homeBaseLng}
                  address={homeBaseAddress}
                  height={200}
                  showDirectionsLink={false}
                />
              </div>
            )}
          </div>

          {/* Mileage Rates */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Mileage Rates</h2>
            <p className="text-sm text-foreground-muted mb-4">
              Configure how travel fees are calculated for bookings
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Free Travel Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={freeThresholdMiles}
                    onChange={(e) => {
                      setFreeThresholdMiles(parseInt(e.target.value || "0", 10));
                      setHasChanges(true);
                    }}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 pr-16 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground-muted">
                    miles
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Bookings within this distance from your home base won't incur a travel fee
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Fee Per Mile
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-foreground-muted">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={(travelFeePerMile / 100).toFixed(2)}
                    onChange={(e) => {
                      setTravelFeePerMile(Math.round(parseFloat(e.target.value || "0") * 100));
                      setHasChanges(true);
                    }}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-16 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-foreground-muted">
                    /mile
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Rate charged per mile beyond the free threshold (IRS rate: $0.67/mile for 2024)
                </p>
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Booking Settings</h2>
            <p className="text-sm text-foreground-muted mb-4">
              Control how travel fees appear on bookings and invoices
            </p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={applyToAllBookings}
                onChange={(e) => {
                  setApplyToAllBookings(e.target.checked);
                  setHasChanges(true);
                }}
                className="mt-0.5 h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <div>
                <span className="text-sm font-medium text-foreground">
                  Automatically calculate travel fees
                </span>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  When creating a booking, automatically calculate and show travel fee based on the shoot location
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Fee Calculator Preview</h2>
            <p className="text-sm text-foreground-muted mb-4">
              See how travel fees will be calculated for a sample booking
            </p>

            <TravelInfoCard
              travelInfo={{
                distanceMiles: previewDistance,
                travelTimeMinutes: 25,
                travelFeeCents: calculateExampleFee(),
                freeThresholdMiles: freeThresholdMiles,
                feePerMile: travelFeePerMile,
              }}
              homeBaseLabel="your home base"
              showFeeBreakdown={true}
            />

            <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
              <h3 className="text-sm font-medium text-foreground mb-3">Example Calculations</h3>
              <div className="space-y-2 text-sm">
                {[5, 15, 25, 50].map((miles) => {
                  const billable = Math.max(0, miles - freeThresholdMiles);
                  const fee = billable * travelFeePerMile;
                  return (
                    <div key={miles} className="flex items-center justify-between">
                      <span className="text-foreground-muted">{miles} miles</span>
                      <span className={cn("font-medium", fee === 0 ? "text-[var(--success)]" : "text-foreground")}>
                        {fee === 0 ? "Free" : `$${(fee / 100).toFixed(2)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Team Member Override Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
            <div className="flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-foreground">Team Member Overrides</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Individual team members can set their own home base location, which will be used for travel calculations when they're assigned to a booking.
                </p>
                <Link
                  href="/settings/team"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  Manage Team Settings
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

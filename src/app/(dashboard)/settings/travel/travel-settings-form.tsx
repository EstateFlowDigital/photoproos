"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { MapPreview } from "@/components/ui/map-preview";
import { TravelInfoCard } from "@/components/dashboard/travel-info-card";
import { cn } from "@/lib/utils";
import { updateTravelSettings } from "@/lib/actions/settings";
import type { PlaceDetails } from "@/lib/google-maps/types";

interface TravelSettingsFormProps {
  settings: {
    homeBaseAddress: string | null;
    homeBaseLat: number | null;
    homeBaseLng: number | null;
    homeBaseLocationId: string | null;
    travelFeePerMile: number;
    freeThresholdMiles: number;
  };
}

export function TravelSettingsForm({ settings }: TravelSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [homeBaseAddress, setHomeBaseAddress] = useState(settings.homeBaseAddress || "");
  const [homeBaseLat, setHomeBaseLat] = useState(settings.homeBaseLat);
  const [homeBaseLng, setHomeBaseLng] = useState(settings.homeBaseLng);
  const [travelFeePerMile, setTravelFeePerMile] = useState(settings.travelFeePerMile);
  const [freeThresholdMiles, setFreeThresholdMiles] = useState(settings.freeThresholdMiles);
  const [hasChanges, setHasChanges] = useState(false);

  // Example distance for preview
  const previewDistance = 12.5;

  const handlePlaceSelect = (place: PlaceDetails) => {
    setHomeBaseAddress(place.formattedAddress);
    setHomeBaseLat(place.latitude);
    setHomeBaseLng(place.longitude);
    setHasChanges(true);
  };

  const handleSave = () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateTravelSettings({
        travelFeePerMile,
        travelFeeThreshold: freeThresholdMiles,
        // homeBaseLocationId would be handled separately with location creation
      });

      if (result.success) {
        setSuccess(true);
        setHasChanges(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save settings");
      }
    });
  };

  const calculateExampleFee = () => {
    const billableMiles = Math.max(0, previewDistance - freeThresholdMiles);
    return billableMiles * travelFeePerMile;
  };

  return (
    <>
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">Travel settings saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

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

          {/* Save Button */}
          <div className="flex flex-col items-stretch sm:items-end">
            <button
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors sm:w-auto",
                hasChanges
                  ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                  : "bg-[var(--background-secondary)] text-foreground-muted cursor-not-allowed"
              )}
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
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
                    <div key={miles} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
    </>
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

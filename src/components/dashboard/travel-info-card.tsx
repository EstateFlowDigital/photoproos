"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TravelInfo } from "@/lib/google-maps/types";

/**
 * TravelInfoCard Component
 *
 * Displays travel distance, time, and calculated travel fee.
 * Used in booking forms and detail pages.
 *
 * @example
 * <TravelInfoCard
 *   travelInfo={{
 *     distanceMiles: 15.5,
 *     travelTimeMinutes: 22,
 *     travelFeeCents: 2500,
 *     freeThresholdMiles: 10,
 *     feePerMile: 50,
 *   }}
 * />
 */
export interface TravelInfoCardProps {
  travelInfo?: TravelInfo | null;
  isLoading?: boolean;
  error?: string | null;
  homeBaseLabel?: string;
  showFeeBreakdown?: boolean;
  onRecalculate?: () => void;
  className?: string;
}

export function TravelInfoCard({
  travelInfo,
  isLoading = false,
  error = null,
  homeBaseLabel = "home base",
  showFeeBreakdown = true,
  onRecalculate,
  className,
}: TravelInfoCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4",
          className
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-[var(--background-secondary)]" />
            <div className="h-4 w-24 rounded bg-[var(--background-secondary)]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="h-3 w-16 rounded bg-[var(--background-secondary)]" />
              <div className="h-6 w-20 rounded bg-[var(--background-secondary)]" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-16 rounded bg-[var(--background-secondary)]" />
              <div className="h-6 w-20 rounded bg-[var(--background-secondary)]" />
            </div>
            <div className="space-y-1">
              <div className="h-3 w-16 rounded bg-[var(--background-secondary)]" />
              <div className="h-6 w-20 rounded bg-[var(--background-secondary)]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/5 p-4",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertIcon className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--error)]">
              Unable to calculate travel info
            </p>
            <p className="text-xs text-foreground-muted mt-1">{error}</p>
            {onRecalculate && (
              <button
                onClick={onRecalculate}
                className="mt-2 text-xs text-[var(--primary)] hover:underline"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!travelInfo) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] p-4 text-center",
          className
        )}
      >
        <CarIcon className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
        <p className="text-sm text-foreground-muted">
          Enter an address to calculate travel distance
        </p>
      </div>
    );
  }

  const { distanceMiles, travelTimeMinutes, travelFeeCents, freeThresholdMiles, feePerMile } =
    travelInfo;

  const billableMiles = Math.max(0, distanceMiles - freeThresholdMiles);
  const isFree = travelFeeCents === 0;

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CarIcon className="h-4 w-4 text-foreground-muted" />
            <span className="text-sm font-medium text-foreground">Travel Info</span>
          </div>
          <span className="text-xs text-foreground-muted">from {homeBaseLabel}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Distance */}
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">Distance</p>
            <p className="text-lg font-semibold text-foreground">
              {distanceMiles.toFixed(1)} <span className="text-sm font-normal">mi</span>
            </p>
          </div>

          {/* Travel Time */}
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
              Travel Time
            </p>
            <p className="text-lg font-semibold text-foreground">
              {formatTravelTime(travelTimeMinutes)}
            </p>
          </div>

          {/* Travel Fee */}
          <div>
            <p className="text-xs text-foreground-muted uppercase tracking-wide mb-1">Travel Fee</p>
            <p
              className={cn(
                "text-lg font-semibold",
                isFree ? "text-[var(--success)]" : "text-foreground"
              )}
            >
              {isFree ? (
                "Free"
              ) : (
                <>
                  ${(travelFeeCents / 100).toFixed(2)}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Fee Breakdown */}
        {showFeeBreakdown && (
          <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-foreground-muted">Free threshold</span>
                <span className="text-foreground">{freeThresholdMiles} miles</span>
              </div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <span className="text-foreground-muted">Rate per mile</span>
                <span className="text-foreground">${(feePerMile / 100).toFixed(2)}/mi</span>
              </div>
              {!isFree && (
                <div className="flex items-start justify-between gap-4 flex-wrap pt-2 border-t border-[var(--card-border)]">
                  <span className="text-foreground-muted">
                    Billable miles ({distanceMiles.toFixed(1)} - {freeThresholdMiles})
                  </span>
                  <span className="font-medium text-foreground">{billableMiles.toFixed(1)} mi</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Free Zone Indicator */}
        {distanceMiles <= freeThresholdMiles && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--success)]/10 px-3 py-2">
            <CheckCircleIcon className="h-4 w-4 text-[var(--success)]" />
            <span className="text-xs text-[var(--success)]">
              Within free travel zone ({freeThresholdMiles} mi)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TravelInfoCompact Component
 *
 * A compact inline version for use in tables or lists.
 */
export interface TravelInfoCompactProps {
  distanceMiles: number;
  travelTimeMinutes?: number;
  travelFeeCents?: number;
  className?: string;
}

export function TravelInfoCompact({
  distanceMiles,
  travelTimeMinutes,
  travelFeeCents,
  className,
}: TravelInfoCompactProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <span className="flex items-center gap-1 text-foreground-muted">
        <CarIcon className="h-3.5 w-3.5" />
        {distanceMiles.toFixed(1)} mi
      </span>
      {travelTimeMinutes !== undefined && (
        <span className="flex items-center gap-1 text-foreground-muted">
          <ClockIcon className="h-3.5 w-3.5" />
          {formatTravelTime(travelTimeMinutes)}
        </span>
      )}
      {travelFeeCents !== undefined && travelFeeCents > 0 && (
        <span className="flex items-center gap-1 text-foreground">
          <span className="text-xs text-foreground-muted">+</span>$
          {(travelFeeCents / 100).toFixed(2)}
        </span>
      )}
    </div>
  );
}

/**
 * TravelFeeBadge Component
 *
 * A badge showing travel fee, useful in invoice line items.
 */
export interface TravelFeeBadgeProps {
  feeCents: number;
  distanceMiles?: number;
  className?: string;
}

export function TravelFeeBadge({ feeCents, distanceMiles, className }: TravelFeeBadgeProps) {
  if (feeCents === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]",
          className
        )}
      >
        <CheckCircleIcon className="h-3 w-3" />
        No travel fee
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]",
        className
      )}
    >
      <CarIcon className="h-3 w-3" />
      ${(feeCents / 100).toFixed(2)}
      {distanceMiles !== undefined && (
        <span className="text-[var(--primary)]/70">({distanceMiles.toFixed(1)} mi)</span>
      )}
    </span>
  );
}

function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5H2v.5a1 1 0 001 1h1a1 1 0 001-1v-.5h10v.5a1 1 0 001 1h1a1 1 0 001-1v-.5h.5a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5H18V4.607a1.49 1.49 0 00-1.375-1.49A49.214 49.214 0 0013.5 3h-7zM5 8a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0zM6.5 5h7a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default TravelInfoCard;

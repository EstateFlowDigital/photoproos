"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getStaticMapUrl, getEmbedMapUrl } from "@/lib/google-maps/client";

/**
 * MapPreview Component
 *
 * Displays a Google Maps preview for a given location.
 * Supports both static image and interactive embed modes.
 *
 * @example
 * <MapPreview
 *   latitude={37.7749}
 *   longitude={-122.4194}
 *   address="123 Main St, San Francisco, CA"
 * />
 */
export interface MapPreviewProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  width?: number | string;
  height?: number | string;
  mode?: "static" | "embed";
  showAddress?: boolean;
  showDirectionsLink?: boolean;
  className?: string;
}

export function MapPreview({
  latitude,
  longitude,
  address,
  zoom = 15,
  width = "100%",
  height = 200,
  mode = "static",
  showAddress = true,
  showDirectionsLink = true,
  className,
}: MapPreviewProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  // Handle static map
  if (mode === "static") {
    const staticWidth = typeof width === "number" ? width : 600;
    const staticHeight = typeof height === "number" ? height : 300;
    const staticMapUrl = getStaticMapUrl(
      latitude,
      longitude,
      zoom,
      staticWidth,
      staticHeight
    );

    return (
      <div className={cn("overflow-hidden", className)}>
        <div
          className="relative rounded-lg overflow-hidden border border-[var(--card-border)]"
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          {!isLoaded && !imageError && (
            <div className="absolute inset-0 bg-[var(--background-secondary)] animate-pulse flex items-center justify-center">
              <MapPinIcon className="h-8 w-8 text-foreground-muted" />
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 bg-[var(--background-secondary)] flex flex-col items-center justify-center gap-2 text-center p-4">
              <MapPinIcon className="h-8 w-8 text-foreground-muted" />
              <p className="text-sm text-foreground-muted">Map preview unavailable</p>
              {showDirectionsLink && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Open in Google Maps
                </a>
              )}
            </div>
          ) : (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                src={staticMapUrl}
                alt={address || `Map location at ${latitude}, ${longitude}`}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  isLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsLoaded(true)}
                onError={() => setImageError(true)}
              />
            </a>
          )}
        </div>

        {(showAddress || showDirectionsLink) && (
          <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
            {showAddress && address && (
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <MapPinIcon className="h-4 w-4 text-foreground-muted mt-0.5 shrink-0" />
                <p className="text-sm text-foreground-secondary truncate">
                  {address}
                </p>
              </div>
            )}
            {showDirectionsLink && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline shrink-0"
              >
                <DirectionsIcon className="h-4 w-4" />
                <span>Directions</span>
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle embed mode
  const embedMapUrl = getEmbedMapUrl(latitude, longitude, zoom);

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className="relative rounded-lg overflow-hidden border border-[var(--card-border)]"
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-[var(--background-secondary)] animate-pulse flex items-center justify-center">
            <MapPinIcon className="h-8 w-8 text-foreground-muted" />
          </div>
        )}

        <iframe
          src={embedMapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={address || `Map location at ${latitude}, ${longitude}`}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {(showAddress || showDirectionsLink) && (
        <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
          {showAddress && address && (
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MapPinIcon className="h-4 w-4 text-foreground-muted mt-0.5 shrink-0" />
              <p className="text-sm text-foreground-secondary truncate">
                {address}
              </p>
            </div>
          )}
          {showDirectionsLink && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline shrink-0"
            >
              <DirectionsIcon className="h-4 w-4" />
              <span>Directions</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * MapPreviewCard Component
 *
 * A card-styled version of MapPreview with title and additional info.
 * Useful for dashboard displays and detail pages.
 */
export interface MapPreviewCardProps extends MapPreviewProps {
  title?: string;
  distanceMiles?: number;
  travelTimeMinutes?: number;
}

export function MapPreviewCard({
  title = "Location",
  distanceMiles,
  travelTimeMinutes,
  ...mapProps
}: MapPreviewCardProps) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
      <div className="px-4 py-3 border-b border-[var(--card-border)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {(distanceMiles !== undefined || travelTimeMinutes !== undefined) && (
            <div className="flex items-center gap-3 text-xs text-foreground-muted">
              {distanceMiles !== undefined && (
                <span className="flex items-center gap-1">
                  <CarIcon className="h-3.5 w-3.5" />
                  {distanceMiles.toFixed(1)} mi
                </span>
              )}
              {travelTimeMinutes !== undefined && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {formatTravelTime(travelTimeMinutes)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <MapPreview {...mapProps} showDirectionsLink={true} />
      </div>
    </div>
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
  return `${hours} hr ${remainingMinutes} min`;
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DirectionsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
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

export default MapPreview;

"use client";

import { useEffect, useState } from "react";

interface TrackingData {
  photographerName: string;
  photographerPhone: string | null;
  companyName: string;
  companyLogo: string | null;
  status: string;
  estimatedArrival: string | null;
  location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

interface TrackingClientProps {
  bookingId: string;
  initialData: {
    photographerName: string;
    photographerPhone: string | null;
    companyName: string;
    companyLogo: string | null;
    status: string;
    estimatedArrival: Date | null;
    location: {
      latitude: number;
      longitude: number;
      timestamp: Date;
    } | null;
    destination: {
      latitude: number;
      longitude: number;
      address: string;
    } | null;
  };
}

export function TrackingClient({ bookingId, initialData }: TrackingClientProps) {
  const [data] = useState<TrackingData>({
    ...initialData,
    estimatedArrival: initialData.estimatedArrival?.toString() || null,
    location: initialData.location
      ? {
          ...initialData.location,
          timestamp: initialData.location.timestamp.toString(),
        }
      : null,
  });

  useEffect(() => {
    // Placeholder: real-time updates would hook into a polling or websocket feed
    console.log("Tracking booking", bookingId);
  }, [bookingId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-secondary">Photographer</p>
          <p className="text-lg font-semibold text-foreground">{data.photographerName}</p>
          {data.photographerPhone && <p className="text-sm text-foreground-secondary">{data.photographerPhone}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground-secondary">Status</p>
          <p className="text-lg font-semibold text-foreground capitalize">{data.status.replace("_", " ")}</p>
          {data.estimatedArrival && (
            <p className="text-sm text-foreground-secondary">
              ETA: {new Date(data.estimatedArrival).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
        <h3 className="text-sm font-semibold text-foreground">Destination</h3>
        <p className="text-foreground">{data.destination?.address || "Not provided"}</p>
      </div>

      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
        <h3 className="text-sm font-semibold text-foreground">Latest Location</h3>
        {data.location ? (
          <div className="text-sm text-foreground-secondary">
            <p>
              Lat/Lng: {data.location.latitude}, {data.location.longitude}
            </p>
            <p>Updated: {new Date(data.location.timestamp).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-sm text-foreground-secondary">No location yet.</p>
        )}
      </div>
    </div>
  );
}

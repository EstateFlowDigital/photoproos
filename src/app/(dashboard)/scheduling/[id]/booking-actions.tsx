"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WeatherForecastCard } from "@/components/dashboard/weather-forecast-card";
import { generateInvoiceFromBooking } from "@/lib/actions/invoices";
import { getBookingWeather } from "@/lib/actions/weather";
import type { WeatherForecast, GoldenHourInfo } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

interface BookingActionsProps {
  bookingId: string;
  hasService: boolean;
  hasTravelFee: boolean;
  className?: string;
}

export function BookingActions({
  bookingId,
  hasService,
  hasTravelFee,
  className,
}: BookingActionsProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateInvoiceFromBooking(bookingId);
      if (result.success) {
        setSuccess(true);
        // Navigate to the new invoice
        router.push(`/invoices/${result.data.id}`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerateInvoice = hasService || hasTravelFee;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Generate Invoice Button */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Invoice</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 p-3">
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 p-3">
            <p className="text-sm text-[var(--success)]">Invoice generated successfully!</p>
          </div>
        )}

        {canGenerateInvoice ? (
          <div className="space-y-3">
            <p className="text-sm text-foreground-muted">
              Generate an invoice for this booking including:
            </p>
            <ul className="text-sm text-foreground-muted space-y-1 ml-4 list-disc">
              {hasService && <li>Service fee</li>}
              {hasTravelFee && <li>Travel fee</li>}
            </ul>
            <button
              onClick={handleGenerateInvoice}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Generating...
                </>
              ) : (
                <>
                  <InvoiceIcon className="h-4 w-4" />
                  Generate Invoice
                </>
              )}
            </button>
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">
            No billable items found for this booking. Add a service or travel fee to generate an invoice.
          </p>
        )}
      </div>
    </div>
  );
}

interface BookingWeatherProps {
  latitude: number;
  longitude: number;
  bookingDate: Date;
  shootTime?: Date;
  className?: string;
}

export function BookingWeather({
  latitude,
  longitude,
  bookingDate,
  shootTime,
  className,
}: BookingWeatherProps) {
  const [forecast, setForecast] = React.useState<WeatherForecast | null>(null);
  const [goldenHour, setGoldenHour] = React.useState<GoldenHourInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isWithinRange, setIsWithinRange] = React.useState(false);

  React.useEffect(() => {
    async function fetchWeather() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getBookingWeather(latitude, longitude, bookingDate);
        if (result.success) {
          setForecast(result.data.forecast);
          setGoldenHour(result.data.goldenHour);
          setIsWithinRange(result.data.isWithinForecastRange);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load weather data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeather();
  }, [latitude, longitude, bookingDate]);

  // Don't show anything if weather API is not configured
  if (error === "Weather API is not configured") {
    return null;
  }

  return (
    <div className={cn("rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6", className)}>
      <h2 className="text-lg font-semibold text-foreground mb-4">Weather & Lighting</h2>

      {!isWithinRange && !isLoading && !error && (
        <div className="mb-4 rounded-lg bg-[var(--background-secondary)] p-3">
          <p className="text-xs text-foreground-muted">
            Weather forecast available 5 days before the shoot. Golden hour times are shown below.
          </p>
        </div>
      )}

      <WeatherForecastCard
        forecast={forecast}
        goldenHour={goldenHour}
        shootTime={shootTime}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default BookingActions;

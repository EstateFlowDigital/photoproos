"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { WeatherForecast, GoldenHourInfo, PhotoConditions } from "@/lib/weather/types";
import { getWeatherEmoji, getConditionsColor, analyzePhotoConditions } from "@/lib/weather/forecast";
import { formatTime, formatDayLength, isGoldenHour } from "@/lib/weather/golden-hour";

/**
 * WeatherForecastCard Component
 *
 * Displays weather forecast and golden hour times for a shoot date.
 * Includes photography-specific recommendations.
 *
 * @example
 * <WeatherForecastCard
 *   forecast={weatherData}
 *   goldenHour={goldenHourData}
 *   shootTime={new Date("2024-01-15T10:00:00")}
 * />
 */
export interface WeatherForecastCardProps {
  forecast?: WeatherForecast | null;
  goldenHour?: GoldenHourInfo | null;
  shootTime?: Date;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

export function WeatherForecastCard({
  forecast,
  goldenHour,
  shootTime,
  isLoading = false,
  error = null,
  onRefresh,
  className,
}: WeatherForecastCardProps) {
  const photoConditions = forecast ? analyzePhotoConditions(forecast, shootTime) : null;
  const isShootDuringGoldenHour = shootTime && goldenHour ? isGoldenHour(shootTime, goldenHour) : false;

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background)]">
          <div className="h-5 w-32 bg-[var(--background-secondary)] rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-[var(--background-secondary)] rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-24 bg-[var(--background-secondary)] rounded animate-pulse" />
              <div className="h-4 w-32 bg-[var(--background-secondary)] rounded animate-pulse" />
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
              Unable to load weather data
            </p>
            <p className="text-xs text-foreground-muted mt-1">{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
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

  if (!forecast) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] p-4 text-center",
          className
        )}
      >
        <SunIcon className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
        <p className="text-sm text-foreground-muted">
          Set a date and location to see weather forecast
        </p>
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
      <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SunIcon className="h-4 w-4 text-foreground-muted" />
            <span className="text-sm font-medium text-foreground">Weather Forecast</span>
          </div>
          {photoConditions && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${getConditionsColor(photoConditions.overallRating)}20`,
                color: getConditionsColor(photoConditions.overallRating),
              }}
            >
              {photoConditions.overallRating.charAt(0).toUpperCase() +
                photoConditions.overallRating.slice(1)}{" "}
              for photos
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Weather Display */}
        <div className="flex items-start gap-4">
          <div className="text-4xl">{getWeatherEmoji(forecast.icon)}</div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{forecast.temperature}°</span>
              <span className="text-sm text-foreground-muted">
                H: {forecast.temperatureMax}° L: {forecast.temperatureMin}°
              </span>
            </div>
            <p className="text-sm text-foreground-secondary capitalize mt-1">
              {forecast.description}
            </p>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-[var(--card-border)]">
          <div className="text-center">
            <p className="text-xs text-foreground-muted mb-1">Humidity</p>
            <p className="text-sm font-medium text-foreground">{forecast.humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground-muted mb-1">Wind</p>
            <p className="text-sm font-medium text-foreground">{forecast.windSpeed} mph</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-foreground-muted mb-1">Rain Chance</p>
            <p className="text-sm font-medium text-foreground">
              {forecast.precipitationProbability}%
            </p>
          </div>
        </div>

        {/* Golden Hour Section */}
        {goldenHour && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GoldenHourIcon className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Golden Hour</span>
              {isShootDuringGoldenHour && (
                <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                  Shoot during golden hour!
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <SunriseIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs text-foreground-muted">Morning</span>
                </div>
                <p className="text-foreground font-medium">
                  {formatTime(goldenHour.morningGoldenHourStart)} -{" "}
                  {formatTime(goldenHour.morningGoldenHourEnd)}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-orange-500/10 to-pink-500/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <SunsetIcon className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs text-foreground-muted">Evening</span>
                </div>
                <p className="text-foreground font-medium">
                  {formatTime(goldenHour.eveningGoldenHourStart)} -{" "}
                  {formatTime(goldenHour.eveningGoldenHourEnd)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-foreground-muted pt-1">
              <span>
                Sunrise: {formatTime(goldenHour.sunrise)} | Sunset: {formatTime(goldenHour.sunset)}
              </span>
              <span>Day length: {formatDayLength(goldenHour.dayLength)}</span>
            </div>
          </div>
        )}

        {/* Photo Recommendations */}
        {photoConditions && (photoConditions.recommendations.length > 0 || photoConditions.warnings.length > 0) && (
          <div className="space-y-2">
            {photoConditions.warnings.length > 0 && (
              <div className="space-y-1">
                {photoConditions.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-[var(--warning)] bg-[var(--warning)]/10 rounded-lg px-3 py-2"
                  >
                    <AlertIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
            {photoConditions.recommendations.length > 0 && (
              <div className="space-y-1">
                {photoConditions.recommendations.slice(0, 2).map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-foreground-muted"
                  >
                    <LightbulbIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[var(--primary)]" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * WeatherForecastCompact Component
 *
 * A compact inline version for use in tables or lists.
 */
export interface WeatherForecastCompactProps {
  forecast: WeatherForecast;
  className?: string;
}

export function WeatherForecastCompact({ forecast, className }: WeatherForecastCompactProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span>{getWeatherEmoji(forecast.icon)}</span>
      <span className="font-medium text-foreground">{forecast.temperature}°</span>
      <span className="text-foreground-muted capitalize">{forecast.description}</span>
      {forecast.precipitationProbability > 30 && (
        <span className="text-xs text-[var(--warning)]">
          {forecast.precipitationProbability}% rain
        </span>
      )}
    </div>
  );
}

/**
 * GoldenHourBadge Component
 *
 * A badge showing if a time is during golden hour.
 */
export interface GoldenHourBadgeProps {
  goldenHour: GoldenHourInfo;
  time: Date;
  className?: string;
}

export function GoldenHourBadge({ goldenHour, time, className }: GoldenHourBadgeProps) {
  const isGolden = isGoldenHour(time, goldenHour);

  if (!isGolden) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-500",
        className
      )}
    >
      <GoldenHourIcon className="h-3 w-3" />
      Golden hour
    </span>
  );
}

// Icons
function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.06 1.06l1.06 1.06z" />
    </svg>
  );
}

function GoldenHourIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.06 1.06l1.06 1.06zM10 13a3 3 0 100-6 3 3 0 000 6zM3 18a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 18z" />
    </svg>
  );
}

function SunriseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 2a.75.75 0 01.75.75v3.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 011.06-1.06l1.72 1.72V2.75A.75.75 0 0110 2zM10 11a3 3 0 100 6 3 3 0 000-6zM3 18a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 18z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SunsetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 8a.75.75 0 01-.75-.75V4.06L7.53 5.78a.75.75 0 01-1.06-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06L10.75 4.06v3.19A.75.75 0 0110 8zM10 11a3 3 0 100 6 3 3 0 000-6zM3 18a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 18z"
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

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.75.75h2.5a.75.75 0 00.75-.75v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
    </svg>
  );
}

export default WeatherForecastCard;

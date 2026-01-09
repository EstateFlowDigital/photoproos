"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface WeatherDay {
  date: Date;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy" | "stormy";
  description: string;
}

interface WeatherWidgetProps {
  location?: string;
  forecast?: WeatherDay[];
  className?: string;
}

// ============================================================================
// Weather Icons
// ============================================================================

function WeatherIcon({
  condition,
  className,
}: {
  condition: WeatherDay["condition"];
  className?: string;
}) {
  switch (condition) {
    case "sunny":
      return (
        <svg
          className={cn("text-yellow-400", className)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
        </svg>
      );
    case "cloudy":
      return (
        <svg
          className={cn("text-gray-400", className)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.5 9.75a6 6 0 0 1 11.573-2.226 3.75 3.75 0 0 1 4.133 4.303A4.5 4.5 0 0 1 18 20.25H6.75a5.25 5.25 0 0 1-2.23-10.004 6.072 6.072 0 0 1-.02-.496Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "partly-cloudy":
      return (
        <svg
          className={cn("text-gray-300", className)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M4.5 9.75a6 6 0 0 1 11.573-2.226 3.75 3.75 0 0 1 4.133 4.303A4.5 4.5 0 0 1 18 20.25H6.75a5.25 5.25 0 0 1-2.23-10.004 6.072 6.072 0 0 1-.02-.496Z" />
        </svg>
      );
    case "rainy":
      return (
        <svg
          className={cn("text-blue-400", className)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.5 9.75a6 6 0 0 1 11.573-2.226 3.75 3.75 0 0 1 4.133 4.303A4.5 4.5 0 0 1 18 20.25H6.75a5.25 5.25 0 0 1-2.23-10.004 6.072 6.072 0 0 1-.02-.496Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "stormy":
      return (
        <svg
          className={cn("text-purple-400", className)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
}

// ============================================================================
// Component
// ============================================================================

export function WeatherWidget({
  location = "Loading...",
  forecast = [],
  className,
}: WeatherWidgetProps) {
  const today = forecast[0];

  // Format day name
  const formatDay = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  if (forecast.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <div className="text-center">
          <svg
            className="mx-auto h-8 w-8 text-foreground-muted"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <p className="mt-2 text-sm text-foreground-muted">
            Set your location to see weather
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Weather */}
      {today && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-foreground-muted">{location}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {today.high}°
              </span>
              <span className="text-lg text-foreground-muted">
                / {today.low}°
              </span>
            </div>
            <p className="text-sm text-foreground-secondary">
              {today.description}
            </p>
          </div>
          <WeatherIcon condition={today.condition} className="h-12 w-12" />
        </div>
      )}

      {/* 3-Day Forecast */}
      {forecast.length > 1 && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--card-border)]">
          {forecast.slice(1, 4).map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-foreground-muted">
                {formatDay(day.date)}
              </p>
              <WeatherIcon condition={day.condition} className="mx-auto h-6 w-6 my-1" />
              <p className="text-xs font-medium text-foreground">
                {day.high}° / {day.low}°
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;

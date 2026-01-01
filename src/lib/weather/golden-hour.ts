// Golden Hour and Sunrise/Sunset Utilities

import { getSunriseSunsetUrl } from "./client";
import type { GoldenHourInfo, SunriseSunsetResponse } from "./types";

// Golden hour is typically about 1 hour after sunrise and 1 hour before sunset
const GOLDEN_HOUR_DURATION_MINUTES = 60;

/**
 * Get sunrise, sunset, and golden hour times for a location and date
 */
export async function getGoldenHourInfo(
  lat: number,
  lng: number,
  date: Date
): Promise<GoldenHourInfo> {
  const response = await fetch(getSunriseSunsetUrl(lat, lng, date));

  if (!response.ok) {
    throw new Error(`Sunrise/Sunset API error: ${response.status}`);
  }

  const data: SunriseSunsetResponse = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Sunrise/Sunset API returned status: ${data.status}`);
  }

  const sunrise = new Date(data.results.sunrise);
  const sunset = new Date(data.results.sunset);
  const civilTwilightStart = new Date(data.results.civil_twilight_begin);
  const civilTwilightEnd = new Date(data.results.civil_twilight_end);

  // Calculate golden hours
  const morningGoldenHourStart = sunrise;
  const morningGoldenHourEnd = addMinutes(sunrise, GOLDEN_HOUR_DURATION_MINUTES);
  const eveningGoldenHourStart = addMinutes(sunset, -GOLDEN_HOUR_DURATION_MINUTES);
  const eveningGoldenHourEnd = sunset;

  return {
    sunrise,
    sunset,
    morningGoldenHourStart,
    morningGoldenHourEnd,
    eveningGoldenHourStart,
    eveningGoldenHourEnd,
    civilTwilightStart,
    civilTwilightEnd,
    dayLength: data.results.day_length / 60, // Convert seconds to minutes
  };
}

/**
 * Calculate golden hour info locally (fallback if API unavailable)
 * Uses simplified solar calculations
 */
export function calculateGoldenHourLocal(
  lat: number,
  lng: number,
  date: Date
): GoldenHourInfo {
  // Get timezone offset in hours
  const timezoneOffset = -date.getTimezoneOffset() / 60;

  // Day of year (1-365)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Solar declination angle
  const declination = 23.45 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
  const declinationRad = (declination * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Hour angle for sunrise/sunset (when sun is at horizon)
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declinationRad);
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle)));
  const hourAngleDeg = (hourAngle * 180) / Math.PI;

  // Solar noon in UTC
  const lngCorrection = lng / 15;
  const solarNoonUTC = 12 - lngCorrection;

  // Sunrise and sunset times
  const sunriseUTC = solarNoonUTC - hourAngleDeg / 15;
  const sunsetUTC = solarNoonUTC + hourAngleDeg / 15;

  // Convert to local time
  const sunriseHours = ((sunriseUTC + timezoneOffset + 24) % 24);
  const sunsetHours = ((sunsetUTC + timezoneOffset + 24) % 24);

  // Create date objects
  const sunrise = createTimeOnDate(date, sunriseHours);
  const sunset = createTimeOnDate(date, sunsetHours);

  // Calculate golden hours
  const morningGoldenHourStart = sunrise;
  const morningGoldenHourEnd = addMinutes(sunrise, GOLDEN_HOUR_DURATION_MINUTES);
  const eveningGoldenHourStart = addMinutes(sunset, -GOLDEN_HOUR_DURATION_MINUTES);
  const eveningGoldenHourEnd = sunset;

  // Civil twilight (sun 6 degrees below horizon)
  const civilTwilightAngle = 96; // 90 + 6 degrees
  const cosTwilightAngle =
    (Math.cos((civilTwilightAngle * Math.PI) / 180) -
      Math.sin(latRad) * Math.sin(declinationRad)) /
    (Math.cos(latRad) * Math.cos(declinationRad));
  const twilightHourAngle = Math.acos(Math.max(-1, Math.min(1, cosTwilightAngle)));
  const twilightHourAngleDeg = (twilightHourAngle * 180) / Math.PI;

  const civilTwilightStartUTC = solarNoonUTC - twilightHourAngleDeg / 15;
  const civilTwilightEndUTC = solarNoonUTC + twilightHourAngleDeg / 15;
  const civilTwilightStartHours = ((civilTwilightStartUTC + timezoneOffset + 24) % 24);
  const civilTwilightEndHours = ((civilTwilightEndUTC + timezoneOffset + 24) % 24);

  const civilTwilightStart = createTimeOnDate(date, civilTwilightStartHours);
  const civilTwilightEnd = createTimeOnDate(date, civilTwilightEndHours);

  // Day length in minutes
  const dayLength = (sunsetHours - sunriseHours) * 60;

  return {
    sunrise,
    sunset,
    morningGoldenHourStart,
    morningGoldenHourEnd,
    eveningGoldenHourStart,
    eveningGoldenHourEnd,
    civilTwilightStart,
    civilTwilightEnd,
    dayLength: dayLength > 0 ? dayLength : dayLength + 24 * 60,
  };
}

/**
 * Check if a given time is during golden hour
 */
export function isGoldenHour(time: Date, goldenHourInfo: GoldenHourInfo): boolean {
  const timeMs = time.getTime();

  const isMorningGoldenHour =
    timeMs >= goldenHourInfo.morningGoldenHourStart.getTime() &&
    timeMs <= goldenHourInfo.morningGoldenHourEnd.getTime();

  const isEveningGoldenHour =
    timeMs >= goldenHourInfo.eveningGoldenHourStart.getTime() &&
    timeMs <= goldenHourInfo.eveningGoldenHourEnd.getTime();

  return isMorningGoldenHour || isEveningGoldenHour;
}

/**
 * Get time until next golden hour
 */
export function getTimeUntilGoldenHour(
  currentTime: Date,
  goldenHourInfo: GoldenHourInfo
): { minutes: number; period: "morning" | "evening" } | null {
  const currentMs = currentTime.getTime();

  // Check morning golden hour
  if (currentMs < goldenHourInfo.morningGoldenHourStart.getTime()) {
    const diff = goldenHourInfo.morningGoldenHourStart.getTime() - currentMs;
    return { minutes: Math.round(diff / (1000 * 60)), period: "morning" };
  }

  // Check evening golden hour
  if (currentMs < goldenHourInfo.eveningGoldenHourStart.getTime()) {
    const diff = goldenHourInfo.eveningGoldenHourStart.getTime() - currentMs;
    return { minutes: Math.round(diff / (1000 * 60)), period: "evening" };
  }

  // Past today's golden hours
  return null;
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format day length for display
 */
export function formatDayLength(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

// Helper functions
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function createTimeOnDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(Math.floor(hours));
  result.setMinutes(Math.round((hours % 1) * 60));
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
}

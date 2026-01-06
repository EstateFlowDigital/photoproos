"use server";

import { getForecastForDate, getWeatherForecast } from "@/lib/weather/forecast";
import { calculateGoldenHourLocal } from "@/lib/weather/golden-hour";
import { isConfigured } from "@/lib/weather/client";
import type { WeatherForecast, GoldenHourInfo } from "@/lib/weather/types";
import { fail, success, type ActionResult } from "@/lib/types/action-result";

/**
 * Get weather forecast for a specific booking
 */
export async function getBookingWeather(
  latitude: number,
  longitude: number,
  bookingDate: Date
): Promise<ActionResult<{
  forecast: WeatherForecast | null;
  goldenHour: GoldenHourInfo | null;
  isWithinForecastRange: boolean;
}>> {
  try {
    if (!isConfigured()) {
      return fail("Weather API is not configured",);
    }

    // Check if booking is within 5-day forecast range
    const now = new Date();
    const daysDiff = Math.ceil(
      (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isWithinForecastRange = daysDiff >= 0 && daysDiff <= 5;

    // Get golden hour times (always available via calculation)
    const goldenHour = calculateGoldenHourLocal(latitude, longitude, bookingDate);

    // Get forecast if within range
    let forecast: WeatherForecast | null = null;
    if (isWithinForecastRange) {
      forecast = await getForecastForDate(latitude, longitude, bookingDate);
    }

    return success({
      forecast,
      goldenHour,
      isWithinForecastRange,
    });
  } catch (error) {
    console.error("Error fetching booking weather:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch weather data");
  }
}

/**
 * Get 5-day weather forecast for a location
 */
export async function getLocationForecast(
  latitude: number,
  longitude: number
): Promise<ActionResult<WeatherForecast[]>> {
  try {
    if (!isConfigured()) {
      return fail("Weather API is not configured",);
    }

    const forecasts = await getWeatherForecast(latitude, longitude);
    return success(forecasts);
  } catch (error) {
    console.error("Error fetching location forecast:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to fetch weather forecast");
  }
}

/**
 * Get golden hour times for a location and date
 */
export async function getGoldenHour(
  latitude: number,
  longitude: number,
  date: Date
): Promise<ActionResult<GoldenHourInfo>> {
  try {
    const goldenHour = calculateGoldenHourLocal(latitude, longitude, date);
    return success(goldenHour);
  } catch (error) {
    console.error("Error calculating golden hour:", error);
    if (error instanceof Error) {
      return fail(error.message);
    }
    return fail("Failed to calculate golden hour");
  }
}

/**
 * Check if weather API is available
 */
export async function checkWeatherApiAvailability(): Promise<boolean> {
  return isConfigured();
}

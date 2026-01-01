// Weather Forecast Utilities

import { getCurrentWeatherUrl, getForecastUrl, isConfigured } from "./client";
import type {
  WeatherForecast,
  HourlyForecast,
  WeatherIcon,
  PhotoConditions,
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  WeatherApiError,
} from "./types";

/**
 * Get the current weather for a location
 */
export async function getCurrentWeather(
  lat: number,
  lng: number
): Promise<WeatherForecast> {
  if (!isConfigured()) {
    throw new Error("Weather API is not configured");
  }

  const response = await fetch(getCurrentWeatherUrl(lat, lng));

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data: OpenWeatherCurrentResponse = await response.json();

  return {
    date: new Date(data.dt * 1000),
    temperature: Math.round(data.main.temp),
    temperatureMin: Math.round(data.main.temp_min),
    temperatureMax: Math.round(data.main.temp_max),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0]?.description || "Unknown",
    icon: mapWeatherIcon(data.weather[0]?.id || 800),
    windSpeed: Math.round(data.wind.speed),
    windDirection: data.wind.deg,
    cloudCover: data.clouds.all,
    precipitationProbability: 0, // Not available in current weather
    visibility: Math.round(data.visibility / 1609.34), // Convert meters to miles
    uvIndex: 0, // Not available in basic API
  };
}

/**
 * Get a 5-day weather forecast for a location
 */
export async function getWeatherForecast(
  lat: number,
  lng: number
): Promise<WeatherForecast[]> {
  if (!isConfigured()) {
    throw new Error("Weather API is not configured");
  }

  const response = await fetch(getForecastUrl(lat, lng));

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data: OpenWeatherForecastResponse = await response.json();

  // Group forecasts by date and get daily summary
  const dailyForecasts = new Map<string, OpenWeatherForecastResponse["list"]>();

  for (const item of data.list) {
    const dateKey = item.dt_txt.split(" ")[0];
    if (!dailyForecasts.has(dateKey)) {
      dailyForecasts.set(dateKey, []);
    }
    dailyForecasts.get(dateKey)!.push(item);
  }

  const forecasts: WeatherForecast[] = [];

  for (const [dateKey, items] of dailyForecasts) {
    // Get noon forecast for representative weather
    const noonItem = items.find((i) => i.dt_txt.includes("12:00:00")) || items[0];
    const temps = items.map((i) => i.main.temp);
    const maxPop = Math.max(...items.map((i) => i.pop));

    forecasts.push({
      date: new Date(dateKey),
      temperature: Math.round(noonItem.main.temp),
      temperatureMin: Math.round(Math.min(...temps)),
      temperatureMax: Math.round(Math.max(...temps)),
      feelsLike: Math.round(noonItem.main.feels_like),
      humidity: Math.round(items.reduce((sum, i) => sum + i.main.humidity, 0) / items.length),
      description: noonItem.weather[0]?.description || "Unknown",
      icon: mapWeatherIcon(noonItem.weather[0]?.id || 800),
      windSpeed: Math.round(items.reduce((sum, i) => sum + i.wind.speed, 0) / items.length),
      windDirection: noonItem.wind.deg,
      cloudCover: Math.round(items.reduce((sum, i) => sum + i.clouds.all, 0) / items.length),
      precipitationProbability: Math.round(maxPop * 100),
      visibility: Math.round(noonItem.visibility / 1609.34),
      uvIndex: 0,
    });
  }

  return forecasts;
}

/**
 * Get hourly forecast for a specific date
 */
export async function getHourlyForecast(
  lat: number,
  lng: number,
  targetDate: Date
): Promise<HourlyForecast[]> {
  if (!isConfigured()) {
    throw new Error("Weather API is not configured");
  }

  const response = await fetch(getForecastUrl(lat, lng));

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data: OpenWeatherForecastResponse = await response.json();

  const targetDateStr = targetDate.toISOString().split("T")[0];

  return data.list
    .filter((item) => item.dt_txt.startsWith(targetDateStr))
    .map((item) => ({
      time: new Date(item.dt * 1000),
      temperature: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      description: item.weather[0]?.description || "Unknown",
      icon: mapWeatherIcon(item.weather[0]?.id || 800),
      windSpeed: Math.round(item.wind.speed),
      precipitationProbability: Math.round(item.pop * 100),
      cloudCover: item.clouds.all,
    }));
}

/**
 * Get weather forecast for a specific date
 */
export async function getForecastForDate(
  lat: number,
  lng: number,
  targetDate: Date
): Promise<WeatherForecast | null> {
  const forecasts = await getWeatherForecast(lat, lng);
  const targetDateStr = targetDate.toISOString().split("T")[0];

  return forecasts.find(
    (f) => f.date.toISOString().split("T")[0] === targetDateStr
  ) || null;
}

/**
 * Analyze weather conditions for photography
 */
export function analyzePhotoConditions(
  forecast: WeatherForecast,
  shootTime?: Date
): PhotoConditions {
  const recommendations: string[] = [];
  const warnings: string[] = [];
  let lightingConditions: PhotoConditions["lightingConditions"] = "bright";

  // Scoring system for rating calculation
  let ratingScore = 100;

  // Check precipitation
  if (forecast.precipitationProbability > 70) {
    warnings.push("High chance of rain - consider rescheduling or have indoor backup");
    ratingScore -= 60;
  } else if (forecast.precipitationProbability > 40) {
    warnings.push("Moderate chance of rain - monitor forecast closely");
    ratingScore -= 30;
  }

  // Check wind
  if (forecast.windSpeed > 20) {
    warnings.push("High winds may affect outdoor shots");
    ratingScore -= 25;
  } else if (forecast.windSpeed > 10) {
    recommendations.push("Bring extra stands/weights for equipment stability");
    ratingScore -= 10;
  }

  // Check cloud cover for lighting
  if (forecast.cloudCover > 80) {
    lightingConditions = "overcast";
    recommendations.push("Overcast sky provides soft, even lighting - great for portraits");
  } else if (forecast.cloudCover > 50) {
    lightingConditions = "partly_cloudy";
    recommendations.push("Partly cloudy - watch for changing light conditions");
  }

  // Check temperature for comfort
  if (forecast.temperature > 90) {
    warnings.push("High temperatures - schedule breaks and stay hydrated");
    ratingScore -= 15;
  } else if (forecast.temperature < 40) {
    recommendations.push("Cold weather - dress warmly and protect batteries");
    ratingScore -= 10;
  }

  // Check visibility
  if (forecast.visibility < 5) {
    warnings.push("Low visibility may affect outdoor shots");
    ratingScore -= 20;
  }

  // Calculate overall rating based on score
  let overallRating: PhotoConditions["overallRating"];
  if (ratingScore >= 80) {
    overallRating = "excellent";
    recommendations.push("Excellent conditions for photography!");
  } else if (ratingScore >= 60) {
    overallRating = "good";
  } else if (ratingScore >= 40) {
    overallRating = "fair";
  } else {
    overallRating = "poor";
  }

  // Golden hour recommendation
  recommendations.push("Schedule outdoor shots during golden hour for best lighting");

  return {
    overallRating,
    lightingConditions,
    recommendations,
    warnings,
  };
}

/**
 * Map OpenWeather condition codes to our icon types
 */
function mapWeatherIcon(conditionCode: number): WeatherIcon {
  // Thunderstorm: 200-232
  if (conditionCode >= 200 && conditionCode < 300) {
    return "thunderstorm";
  }
  // Drizzle: 300-321
  if (conditionCode >= 300 && conditionCode < 400) {
    return "drizzle";
  }
  // Rain: 500-531
  if (conditionCode >= 500 && conditionCode < 600) {
    return "rain";
  }
  // Snow: 600-622
  if (conditionCode >= 600 && conditionCode < 700) {
    return "snow";
  }
  // Atmosphere (fog, mist, etc): 700-781
  if (conditionCode >= 700 && conditionCode < 800) {
    return "fog";
  }
  // Clear: 800
  if (conditionCode === 800) {
    return "clear";
  }
  // Clouds: 801-804
  if (conditionCode === 801 || conditionCode === 802) {
    return "partly_cloudy";
  }
  if (conditionCode === 803) {
    return "cloudy";
  }
  if (conditionCode === 804) {
    return "overcast";
  }

  return "clear";
}

/**
 * Get weather icon emoji for display
 */
export function getWeatherEmoji(icon: WeatherIcon): string {
  const emojiMap: Record<WeatherIcon, string> = {
    clear: "☀️",
    partly_cloudy: "⛅",
    cloudy: "☁️",
    overcast: "☁️",
    rain: "🌧️",
    drizzle: "🌦️",
    thunderstorm: "⛈️",
    snow: "🌨️",
    fog: "🌫️",
    windy: "💨",
  };

  return emojiMap[icon] || "🌤️";
}

/**
 * Get photo conditions rating color
 */
export function getConditionsColor(rating: PhotoConditions["overallRating"]): string {
  const colorMap: Record<PhotoConditions["overallRating"], string> = {
    excellent: "var(--success)",
    good: "var(--primary)",
    fair: "var(--warning)",
    poor: "var(--error)",
  };

  return colorMap[rating];
}

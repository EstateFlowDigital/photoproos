"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Sunrise,
  Sunset,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FieldBooking } from "@/lib/actions/field-operations";

interface WeatherClientProps {
  todaysBookings: FieldBooking[];
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  visibility: number;
}

interface SunTimes {
  sunrise: Date;
  sunset: Date;
  goldenHourMorning: { start: Date; end: Date };
  goldenHourEvening: { start: Date; end: Date };
  blueHourMorning: { start: Date; end: Date };
  blueHourEvening: { start: Date; end: Date };
}

export function WeatherClient({ todaysBookings }: WeatherClientProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Loading location...");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });

            // Calculate sun times
            const times = calculateSunTimes(latitude, longitude);
            setSunTimes(times);

            // Fetch weather data from Open-Meteo (free, no API key needed)
            try {
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility&temperature_unit=fahrenheit&wind_speed_unit=mph`
              );
              const data = await response.json();

              if (data.current) {
                setWeather({
                  temperature: Math.round(data.current.temperature_2m),
                  humidity: data.current.relative_humidity_2m,
                  windSpeed: Math.round(data.current.wind_speed_10m),
                  weatherCode: data.current.weather_code,
                  visibility: Math.round(data.current.visibility / 1000), // Convert to km
                });
              }
            } catch {
              console.error("Failed to fetch weather");
            }

            // Get location name (reverse geocode)
            try {
              const geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const geoData = await geoResponse.json();
              const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || "";
              const state = geoData.address?.state || "";
              setLocationName(city ? `${city}, ${state}` : "Current Location");
            } catch {
              setLocationName("Current Location");
            }

            setIsLoading(false);
          },
          (err) => {
            setError("Unable to get your location. Please enable location services.");
            setIsLoading(false);
            console.error(err);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
        setIsLoading(false);
      }
    } catch {
      setError("Failed to load weather data.");
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return <Sun className="h-8 w-8 text-[var(--warning)]" />;
    if (code <= 3) return <Cloud className="h-8 w-8 text-foreground-muted" />;
    if (code <= 49) return <Cloud className="h-8 w-8 text-foreground-muted" />;
    if (code <= 69) return <CloudRain className="h-8 w-8 text-[var(--primary)]" />;
    if (code <= 79) return <CloudSnow className="h-8 w-8 text-foreground-muted" />;
    if (code <= 99) return <CloudRain className="h-8 w-8 text-[var(--primary)]" />;
    return <Sun className="h-8 w-8 text-[var(--warning)]" />;
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear sky";
    if (code <= 3) return "Partly cloudy";
    if (code <= 49) return "Foggy";
    if (code <= 59) return "Drizzle";
    if (code <= 69) return "Rain";
    if (code <= 79) return "Snow";
    if (code <= 99) return "Thunderstorm";
    return "Unknown";
  };

  const isGoldenHour = () => {
    if (!sunTimes) return false;
    const now = new Date();
    return (
      (now >= sunTimes.goldenHourMorning.start && now <= sunTimes.goldenHourMorning.end) ||
      (now >= sunTimes.goldenHourEvening.start && now <= sunTimes.goldenHourEvening.end)
    );
  };

  const isBlueHour = () => {
    if (!sunTimes) return false;
    const now = new Date();
    return (
      (now >= sunTimes.blueHourMorning.start && now <= sunTimes.blueHourMorning.end) ||
      (now >= sunTimes.blueHourEvening.start && now <= sunTimes.blueHourEvening.end)
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/field">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Weather & Light</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={getLocationAndWeather} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {error ? (
          <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/10 p-4 text-center">
            <p className="text-sm text-[var(--error)]">{error}</p>
            <Button onClick={getLocationAndWeather} className="mt-4" size="sm">
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 animate-pulse">
              <div className="h-8 w-32 bg-[var(--background-tertiary)] rounded mb-4" />
              <div className="h-16 w-24 bg-[var(--background-tertiary)] rounded" />
            </div>
          </div>
        ) : (
          <>
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <MapPin className="h-4 w-4" />
              <span>{locationName}</span>
            </div>

            {/* Current Conditions */}
            {weather && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-muted">Current Conditions</p>
                    <p className="text-4xl font-bold text-foreground mt-1">{weather.temperature}°F</p>
                    <p className="text-sm text-foreground-muted mt-1">{getWeatherDescription(weather.weatherCode)}</p>
                  </div>
                  {getWeatherIcon(weather.weatherCode)}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[var(--card-border)]">
                  <div className="text-center">
                    <Droplets className="h-4 w-4 mx-auto text-[var(--primary)]" />
                    <p className="text-sm font-medium text-foreground mt-1">{weather.humidity}%</p>
                    <p className="text-xs text-foreground-muted">Humidity</p>
                  </div>
                  <div className="text-center">
                    <Wind className="h-4 w-4 mx-auto text-foreground-muted" />
                    <p className="text-sm font-medium text-foreground mt-1">{weather.windSpeed} mph</p>
                    <p className="text-xs text-foreground-muted">Wind</p>
                  </div>
                  <div className="text-center">
                    <Eye className="h-4 w-4 mx-auto text-foreground-muted" />
                    <p className="text-sm font-medium text-foreground mt-1">{weather.visibility} km</p>
                    <p className="text-xs text-foreground-muted">Visibility</p>
                  </div>
                </div>
              </div>
            )}

            {/* Golden Hour Alert */}
            {(isGoldenHour() || isBlueHour()) && (
              <div className={`rounded-xl border p-4 ${
                isGoldenHour()
                  ? "border-[var(--warning)]/30 bg-[var(--warning)]/10"
                  : "border-[var(--primary)]/30 bg-[var(--primary)]/10"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isGoldenHour() ? "bg-[var(--warning)]/20" : "bg-[var(--primary)]/20"
                  }`}>
                    <Sun className={`h-5 w-5 ${isGoldenHour() ? "text-[var(--warning)]" : "text-[var(--primary)]"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isGoldenHour() ? "text-[var(--warning)]" : "text-[var(--primary)]"}`}>
                      {isGoldenHour() ? "Golden Hour Active!" : "Blue Hour Active!"}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {isGoldenHour() ? "Perfect warm light for portraits and landscapes" : "Soft, diffused light ideal for cityscapes"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sun Times */}
            {sunTimes && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Today&apos;s Light Schedule</h3>

                <div className="space-y-3">
                  {/* Blue Hour Morning */}
                  <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10">
                        <Sun className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <span className="text-sm text-foreground">Blue Hour (AM)</span>
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {formatTime(sunTimes.blueHourMorning.start)} - {formatTime(sunTimes.blueHourMorning.end)}
                    </span>
                  </div>

                  {/* Sunrise */}
                  <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--warning)]/10">
                        <Sunrise className="h-4 w-4 text-[var(--warning)]" />
                      </div>
                      <span className="text-sm text-foreground">Sunrise</span>
                    </div>
                    <span className="text-sm text-foreground-muted">{formatTime(sunTimes.sunrise)}</span>
                  </div>

                  {/* Golden Hour Morning */}
                  <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--warning)]/10">
                        <Sun className="h-4 w-4 text-[var(--warning)]" />
                      </div>
                      <span className="text-sm text-foreground">Golden Hour (AM)</span>
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {formatTime(sunTimes.goldenHourMorning.start)} - {formatTime(sunTimes.goldenHourMorning.end)}
                    </span>
                  </div>

                  {/* Golden Hour Evening */}
                  <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--warning)]/10">
                        <Sun className="h-4 w-4 text-[var(--warning)]" />
                      </div>
                      <span className="text-sm text-foreground">Golden Hour (PM)</span>
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {formatTime(sunTimes.goldenHourEvening.start)} - {formatTime(sunTimes.goldenHourEvening.end)}
                    </span>
                  </div>

                  {/* Sunset */}
                  <div className="flex items-center justify-between py-2 border-b border-[var(--card-border)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--error)]/10">
                        <Sunset className="h-4 w-4 text-[var(--error)]" />
                      </div>
                      <span className="text-sm text-foreground">Sunset</span>
                    </div>
                    <span className="text-sm text-foreground-muted">{formatTime(sunTimes.sunset)}</span>
                  </div>

                  {/* Blue Hour Evening */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10">
                        <Sun className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <span className="text-sm text-foreground">Blue Hour (PM)</span>
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {formatTime(sunTimes.blueHourEvening.start)} - {formatTime(sunTimes.blueHourEvening.end)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Shoots */}
            {todaysBookings.length > 0 && (
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Today&apos;s Shoots
                </h3>
                <div className="space-y-3">
                  {todaysBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b border-[var(--card-border)] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{booking.clientName}</p>
                        <p className="text-xs text-foreground-muted">{booking.address}</p>
                      </div>
                      <p className="text-sm text-foreground-muted">
                        {new Date(booking.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photography Tips */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Photography Tips</h3>
              <div className="space-y-2 text-xs text-foreground-muted">
                <p><strong className="text-foreground">Golden Hour:</strong> Warm, soft light ideal for portraits and landscapes. Low sun creates long shadows.</p>
                <p><strong className="text-foreground">Blue Hour:</strong> Cool, diffused light after sunset. Perfect for cityscapes and moody shots.</p>
                <p><strong className="text-foreground">High Visibility:</strong> Great for architecture and real estate. Details are crisp and clear.</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Calculate sun times based on location
function calculateSunTimes(lat: number, lng: number): SunTimes {
  const now = new Date();
  const dayOfYear = getDayOfYear(now);

  // Simplified sunrise/sunset calculation
  const decl = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
  const ha = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(decl * Math.PI / 180)) * 180 / Math.PI;

  const solarNoon = 12 - lng / 15;
  const sunriseHours = solarNoon - ha / 15;
  const sunsetHours = solarNoon + ha / 15;

  const sunrise = new Date(now);
  sunrise.setHours(Math.floor(sunriseHours), Math.round((sunriseHours % 1) * 60), 0, 0);

  const sunset = new Date(now);
  sunset.setHours(Math.floor(sunsetHours), Math.round((sunsetHours % 1) * 60), 0, 0);

  // Golden hour is roughly 1 hour after sunrise and 1 hour before sunset
  const goldenHourMorningStart = new Date(sunrise);
  const goldenHourMorningEnd = new Date(sunrise);
  goldenHourMorningEnd.setMinutes(goldenHourMorningEnd.getMinutes() + 60);

  const goldenHourEveningStart = new Date(sunset);
  goldenHourEveningStart.setMinutes(goldenHourEveningStart.getMinutes() - 60);
  const goldenHourEveningEnd = new Date(sunset);

  // Blue hour is roughly 20-40 minutes before sunrise and after sunset
  const blueHourMorningStart = new Date(sunrise);
  blueHourMorningStart.setMinutes(blueHourMorningStart.getMinutes() - 40);
  const blueHourMorningEnd = new Date(sunrise);
  blueHourMorningEnd.setMinutes(blueHourMorningEnd.getMinutes() - 10);

  const blueHourEveningStart = new Date(sunset);
  blueHourEveningStart.setMinutes(blueHourEveningStart.getMinutes() + 10);
  const blueHourEveningEnd = new Date(sunset);
  blueHourEveningEnd.setMinutes(blueHourEveningEnd.getMinutes() + 40);

  return {
    sunrise,
    sunset,
    goldenHourMorning: { start: goldenHourMorningStart, end: goldenHourMorningEnd },
    goldenHourEvening: { start: goldenHourEveningStart, end: goldenHourEveningEnd },
    blueHourMorning: { start: blueHourMorningStart, end: blueHourMorningEnd },
    blueHourEvening: { start: blueHourEveningStart, end: blueHourEveningEnd },
  };
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

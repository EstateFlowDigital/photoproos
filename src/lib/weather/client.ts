// OpenWeather API Client Configuration

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const SUNRISE_SUNSET_API_URL = "https://api.sunrise-sunset.org/json";

export function getApiKey(): string {
  if (!OPENWEATHER_API_KEY) {
    throw new Error(
      "OPENWEATHER_API_KEY is not configured. Please add it to your environment variables."
    );
  }
  return OPENWEATHER_API_KEY;
}

export function isConfigured(): boolean {
  return !!OPENWEATHER_API_KEY;
}

export function getCurrentWeatherUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    appid: getApiKey(),
    units: "imperial",
  });

  return `${OPENWEATHER_BASE_URL}/weather?${params.toString()}`;
}

export function getForecastUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    appid: getApiKey(),
    units: "imperial",
  });

  return `${OPENWEATHER_BASE_URL}/forecast?${params.toString()}`;
}

export function getSunriseSunsetUrl(lat: number, lng: number, date?: Date): string {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    formatted: "0", // Get ISO 8601 format
  });

  if (date) {
    params.append("date", formatDateForApi(date));
  }

  return `${SUNRISE_SUNSET_API_URL}?${params.toString()}`;
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0];
}

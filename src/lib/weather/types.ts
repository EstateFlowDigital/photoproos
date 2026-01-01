// Weather API Types for PhotoProOS

export interface WeatherForecast {
  date: Date;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: WeatherIcon;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitationProbability: number;
  visibility: number;
  uvIndex: number;
}

export interface HourlyForecast {
  time: Date;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: WeatherIcon;
  windSpeed: number;
  precipitationProbability: number;
  cloudCover: number;
}

export interface GoldenHourInfo {
  sunrise: Date;
  sunset: Date;
  morningGoldenHourStart: Date;
  morningGoldenHourEnd: Date;
  eveningGoldenHourStart: Date;
  eveningGoldenHourEnd: Date;
  civilTwilightStart: Date;
  civilTwilightEnd: Date;
  dayLength: number; // in minutes
}

export interface PhotoConditions {
  overallRating: "excellent" | "good" | "fair" | "poor";
  lightingConditions: "golden_hour" | "overcast" | "partly_cloudy" | "bright" | "low_light";
  recommendations: string[];
  warnings: string[];
}

export type WeatherIcon =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "overcast"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "fog"
  | "windy";

// OpenWeather API Response Types
export interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OpenWeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number; // Probability of precipitation
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
  sys: { pod: string }; // Part of day (d/n)
  dt_txt: string;
}

export interface OpenWeatherCurrentResponse {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  dt: number;
  sys: { sunrise: number; sunset: number; country: string };
  timezone: number;
  id: number;
  name: string;
}

// Sunrise/Sunset API Response Types
export interface SunriseSunsetResponse {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

// Error types
export class WeatherApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = "WeatherApiError";
  }
}

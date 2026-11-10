import { TripOption } from './api';

export type WeatherCategory = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';

export type RainSeverity = 'none' | 'light' | 'moderate' | 'heavy';

export type WeatherConditionSource = 'current' | 'forecast' | 'both' | 'none';

export type WeatherRecommendationLevel = 'neutral' | 'recommended' | 'caution' | 'discouraged';

export interface OpenMeteoCurrentUnits {
  time?: string;
  interval?: string;
  temperature_2m?: string;
  relative_humidity_2m?: string;
  apparent_temperature?: string;
  precipitation?: string;
  rain?: string;
  weather_code?: string;
  wind_speed_10m?: string;
}

export interface OpenMeteoCurrentWeather {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  rain: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface OpenMeteoHourlyUnits {
  time?: string;
  precipitation?: string;
  precipitation_probability?: string;
  weather_code?: string;
}

export interface OpenMeteoHourlyWeather {
  time: string[];
  precipitation: number[];
  precipitation_probability?: number[];
  weather_code?: number[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current_units?: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrentWeather;
  hourly_units?: OpenMeteoHourlyUnits;
  hourly?: OpenMeteoHourlyWeather;
}

export interface ForecastHourPoint {
  time: string;
  hourLabel: string;
  weatherCode: number;
  conditionLabel: string;
  category: WeatherCategory;
  precipitationMm: number;
  precipitationProbability: number | null;
  rainSeverity: RainSeverity;
}

export interface LocationWeather {
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneAbbreviation: string;
  current: {
    time: string;
    temperatureC: number;
    apparentTemperatureC: number;
    humidityPercent: number;
    precipitationMm: number;
    rainMm: number;
    windSpeedKmh: number;
    weatherCode: number;
    conditionLabel: string;
    category: WeatherCategory;
    rainSeverity: RainSeverity;
    precipitationProbability: number | null;
  };
  forecast: {
    available: boolean;
    nextHours: ForecastHourPoint[];
    peakRainSeverity: RainSeverity;
    peakRainHour: ForecastHourPoint | null;
  };
}

export interface ModeWeatherGuidance {
  level: WeatherRecommendationLevel;
  badgeLabel: string;
  reason: string;
  conditionSource: WeatherConditionSource;
}

export interface TripWeatherSummary {
  hasWeatherData: boolean;
  overallSeverity: RainSeverity;
  conditionSource: WeatherConditionSource;
  headline: string;
  detail: string;
  originSeverity: RainSeverity;
  destinationSeverity: RainSeverity;
  getOptionGuidance: (option: TripOption) => ModeWeatherGuidance | null;
}


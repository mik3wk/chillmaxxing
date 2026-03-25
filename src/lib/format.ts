import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return "Just here";
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} mi`;
}

export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°F`;
}

export function formatWind(speed: number): string {
  if (speed < 1) return "Calm";
  return `${Math.round(speed)} mph`;
}

export function getWeatherIcon(code: number, isDay: boolean = true): string {
  // WMO Weather interpretation codes
  if (code === 0) return isDay ? "☀️" : "🌙"; // Clear sky
  if (code === 1 || code === 2) return isDay ? "🌤️" : "☁️"; // Mainly clear, partly cloudy
  if (code === 3) return "☁️"; // Overcast
  if (code >= 45 && code <= 48) return "🌫️"; // Fog
  if (code >= 51 && code <= 55) return "🌧️"; // Drizzle
  if (code >= 61 && code <= 65) return "🌧️"; // Rain
  if (code >= 71 && code <= 77) return "❄️"; // Snow
  if (code >= 80 && code <= 82) return "🌧️"; // Rain showers
  if (code >= 95 && code <= 99) return "⛈️"; // Thunderstorm
  return "🌤️";
}

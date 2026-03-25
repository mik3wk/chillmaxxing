import { useQuery } from "@tanstack/react-query";
import { fetchNearbySpots } from "../lib/places";
import { fetchWeatherForSpots } from "../lib/weather";
import { scoreSpot } from "../lib/scoring";
import { UserLocation, ChillVibe, ScoredSpot } from "../types";

export function useChillSpots(
  location: UserLocation | null,
  radius: number,
  vibe: ChillVibe,
  timeframe: "now" | "in60min"
) {
  return useQuery({
    queryKey: ["chill-spots", location?.lat, location?.lon, radius, vibe, timeframe],
    queryFn: async (): Promise<ScoredSpot[]> => {
      if (!location) return [];

      // 1. Fetch places
      const spots = await fetchNearbySpots(location.lat, location.lon, radius);
      if (spots.length === 0) return [];

      // 2. Fetch weather
      const weatherData = await fetchWeatherForSpots(
        spots.map(s => ({ lat: s.lat, lon: s.lon }))
      );

      // Simple golden hour check: between 4pm and 8pm local time roughly
      // (A real app would use suncalc based on lat/lon, keeping simple for UX)
      const currentHour = new Date().getHours();
      const isGoldenHour = currentHour >= 16 && currentHour <= 20;

      // 3. Score spots
      const scoredSpots: ScoredSpot[] = spots.map(spot => {
        const key = `${spot.lat},${spot.lon}`;
        const wData = weatherData[key];
        
        // Fallback if weather failed for this specific spot
        if (!wData) {
          return {
            ...spot,
            chillScore: 0,
            reasons: ["Weather data unavailable"],
            weather: { temp: 0, apparentTemp: 0, cloudCover: 0, precipProb: 0, windSpeed: 0, weatherCode: 0, time: "", isDay: true },
            breakdown: { tempScore: 0, windScore: 0, cloudScore: 0, precipScore: 0 }
          };
        }

        const targetWeather = timeframe === "now" ? wData.current : wData.in60;
        const scoring = scoreSpot(spot, targetWeather, vibe, isGoldenHour);

        return {
          ...spot,
          ...scoring,
          weather: targetWeather
        };
      });

      // Sort by score descending
      scoredSpots.sort((a, b) => b.chillScore - a.chillScore);

      // Mark the best ones
      if (scoredSpots.length > 0 && scoredSpots[0].chillScore > 50) {
        scoredSpots[0][timeframe === "now" ? "isBestNow" : "isBestIn60"] = true;
      }

      return scoredSpots;
    },
    enabled: !!location, // Only run if we have a location
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
}

import { WeatherSnapshot } from "../types";

export async function fetchWeatherForSpots(
  spots: { lat: number; lon: number }[]
): Promise<Record<string, { current: WeatherSnapshot; in60: WeatherSnapshot }>> {
  if (spots.length === 0) return {};

  const lats = spots.map(s => s.lat).join(",");
  const lons = spots.map(s => s.lon).join(",");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&hourly=temperature_2m,apparent_temperature,precipitation_probability,cloudcover,windspeed_10m,weathercode,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=2`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch weather");
    
    const data = await response.json();
    const result: Record<string, { current: WeatherSnapshot; in60: WeatherSnapshot }> = {};

    // Open-Meteo returns array of results if multiple locations provided, or single object if one location
    const resultsArray = Array.isArray(data) ? data : [data];

    resultsArray.forEach((locationData, index) => {
      const spot = spots[index];
      const key = `${spot.lat},${spot.lon}`;
      
      // Find current hour index based on current time
      const now = new Date();
      // Open meteo returns iso8601 strings in hourly.time
      const hourlyTimes = locationData.hourly.time;
      let currentIndex = 0;
      
      for (let i = 0; i < hourlyTimes.length; i++) {
        const time = new Date(hourlyTimes[i]);
        if (time.getTime() > now.getTime()) {
          currentIndex = Math.max(0, i - 1);
          break;
        }
      }

      const nextIndex = Math.min(currentIndex + 1, hourlyTimes.length - 1);

      const buildSnapshot = (idx: number): WeatherSnapshot => ({
        temp: locationData.hourly.temperature_2m[idx],
        apparentTemp: locationData.hourly.apparent_temperature[idx],
        cloudCover: locationData.hourly.cloudcover[idx],
        precipProb: locationData.hourly.precipitation_probability[idx],
        windSpeed: locationData.hourly.windspeed_10m[idx],
        weatherCode: locationData.hourly.weathercode[idx],
        isDay: locationData.hourly.is_day[idx] === 1,
        time: locationData.hourly.time[idx]
      });

      result[key] = {
        current: buildSnapshot(currentIndex),
        in60: buildSnapshot(nextIndex)
      };
    });

    return result;
  } catch (error) {
    console.error("Open-Meteo API Error:", error);
    throw error;
  }
}

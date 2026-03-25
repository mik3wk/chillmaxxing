import { CandidateSpot, WeatherSnapshot, ChillVibe, ScoreBreakdown, ScoredSpot } from "../types";

export function scoreSpot(
  spot: CandidateSpot,
  weather: WeatherSnapshot,
  vibe: ChillVibe,
  isGoldenHour: boolean
): { chillScore: number; reasons: string[]; breakdown: ScoreBreakdown } {
  let score = 50; // Base score
  const reasons: string[] = [];
  const breakdown: ScoreBreakdown = { tempScore: 0, windScore: 0, cloudScore: 0, precipScore: 0, timingScore: 0 };

  // 1. Basic Weather Sanity (applies to all)
  if (weather.precipProb > 50 || [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.weatherCode)) {
    score -= 30;
    breakdown.precipScore = -30;
    reasons.push("Likely raining");
  } else if (weather.precipProb === 0) {
    score += 10;
    breakdown.precipScore = 10;
    reasons.push("Dry conditions");
  }

  // 2. Temperature Sanity
  if (weather.apparentTemp < 45) {
    score -= 15;
    breakdown.tempScore = -15;
    reasons.push("Too cold");
  } else if (weather.apparentTemp > 95) {
    score -= 15;
    breakdown.tempScore = -15;
    reasons.push("Too hot");
  }

  // 3. Vibe-Specific Scoring
  switch (vibe) {
    case "sun":
      if (weather.cloudCover < 30) {
        score += 25;
        breakdown.cloudScore = 25;
        reasons.push("Plenty of sunshine");
      } else if (weather.cloudCover > 70) {
        score -= 15;
        breakdown.cloudScore = -15;
        reasons.push("Too cloudy for sun-bathing");
      }
      if (weather.apparentTemp >= 65 && weather.apparentTemp <= 85) {
        score += 15;
        breakdown.tempScore += 15;
        reasons.push("Perfect tanning temp");
      }
      if (spot.type === "beach" || spot.type === "park") {
        score += 10;
        reasons.push(`Great ${spot.type} for sun`);
      }
      break;

    case "shade":
      if (weather.cloudCover > 50) {
        score += 15;
        breakdown.cloudScore = 15;
        reasons.push("Nice natural cloud cover");
      }
      if (weather.apparentTemp >= 70 && weather.apparentTemp <= 88) {
        score += 15;
        breakdown.tempScore += 15;
        reasons.push("Warm enough to chill in shade");
      }
      if (spot.type === "park") {
        score += 15; // Parks usually have trees
        reasons.push("Likely has trees for shade");
      }
      break;

    case "lowWind":
      if (weather.windSpeed <= 5) {
        score += 25;
        breakdown.windScore = 25;
        reasons.push("Barely a breeze");
      } else if (weather.windSpeed > 15) {
        score -= 25;
        breakdown.windScore = -25;
        reasons.push("Too windy");
      } else {
        score += 10;
        breakdown.windScore = 10;
        reasons.push("Manageable breeze");
      }
      break;

    case "goldenHour":
      if (isGoldenHour) {
        score += 30;
        breakdown.timingScore = 30;
        reasons.push("Golden hour right now!");
      }
      if (weather.cloudCover >= 20 && weather.cloudCover <= 60) {
        score += 15;
        breakdown.cloudScore = 15;
        reasons.push("Clouds perfect for sunset colors");
      } else if (weather.cloudCover > 80) {
        score -= 20;
        breakdown.cloudScore = -20;
        reasons.push("Too overcast for a good sunset");
      }
      if (spot.type === "viewpoint" || spot.type === "beach") {
        score += 15;
        reasons.push(`Prime ${spot.type} for sunset views`);
      }
      break;
  }

  // Ensure score bounds
  const chillScore = Math.max(0, Math.min(100, Math.round(score)));
  
  // Deduplicate and trim reasons
  const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3);

  return { chillScore, reasons: uniqueReasons, breakdown };
}

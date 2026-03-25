export interface UserLocation {
  lat: number;
  lon: number;
  accuracy?: number;
}

export type ChillVibe = "sun" | "shade" | "lowWind" | "goldenHour";

export type SpotType = "park" | "viewpoint" | "picnic" | "beach";

export interface CandidateSpot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: SpotType;
  distanceMiles: number;
}

export interface WeatherSnapshot {
  temp: number;
  apparentTemp: number;
  cloudCover: number;
  precipProb: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
  isDay: boolean;
}

export interface ScoreBreakdown {
  tempScore: number;
  windScore: number;
  cloudScore: number;
  precipScore: number;
  timingScore?: number;
}

export interface ScoredSpot extends CandidateSpot {
  chillScore: number;
  reasons: string[];
  weather: WeatherSnapshot;
  breakdown: ScoreBreakdown;
  isBestNow?: boolean;
  isBestIn60?: boolean;
}

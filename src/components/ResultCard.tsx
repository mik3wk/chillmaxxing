import { MapPin, Wind, Cloud, Umbrella, Thermometer, ChevronRight } from "lucide-react";
import { ScoredSpot } from "../types";
import { formatDistance, formatTemp, formatWind, getWeatherIcon, cn } from "../lib/format";
import { motion } from "framer-motion";

interface ResultCardProps {
  spot: ScoredSpot;
  isSelected: boolean;
  onClick: () => void;
}

export function ResultCard({ spot, isSelected, onClick }: ResultCardProps) {
  const isHigh = spot.chillScore >= 75;
  const isMedium = spot.chillScore >= 40 && spot.chillScore < 75;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer bg-card rounded-2xl p-5 border-2 transition-all duration-300",
        isSelected 
          ? "border-primary shadow-xl shadow-primary/10" 
          : "border-border/50 shadow-md shadow-black/5 hover:border-primary/50 hover:shadow-lg"
      )}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-lg leading-tight text-foreground">{spot.name}</h3>
            {(spot.isBestNow || spot.isBestIn60) && (
              <span className="px-2 py-0.5 bg-accent/20 text-accent-foreground text-[10px] uppercase tracking-wider font-bold rounded-full whitespace-nowrap">
                🏆 Top Pick
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="capitalize px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md text-xs">
              {spot.type}
            </span>
            <span>•</span>
            <span>{formatDistance(spot.distanceMiles)}</span>
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg font-display font-black text-white shadow-inner",
            isHigh ? "bg-emerald-500" : isMedium ? "bg-amber-500" : "bg-red-500"
          )}>
            {spot.chillScore}
          </div>
          <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Score</span>
        </div>
      </div>

      {spot.reasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {spot.reasons.map((reason, idx) => (
            <span key={idx} className="px-2.5 py-1 bg-primary/5 border border-primary/10 text-primary text-xs rounded-full font-semibold">
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 py-3 border-t border-border/50">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xl mb-1">{getWeatherIcon(spot.weather.weatherCode, spot.weather.isDay)}</span>
          <span className="text-xs font-bold text-foreground">{formatTemp(spot.weather.temp)}</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <Wind className="w-4 h-4 text-muted-foreground mb-1.5" />
          <span className="text-xs font-bold text-foreground">{formatWind(spot.weather.windSpeed)}</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <Cloud className="w-4 h-4 text-muted-foreground mb-1.5" />
          <span className="text-xs font-bold text-foreground">{spot.weather.cloudCover}%</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <Umbrella className="w-4 h-4 text-muted-foreground mb-1.5" />
          <span className="text-xs font-bold text-foreground">{spot.weather.precipProb}%</span>
        </div>
      </div>

      <div className="mt-4 pt-3 flex justify-between items-center text-sm font-semibold text-primary group border-t border-border/50">
        <span>View on map</span>
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

import { Sun, Trees, Wind, Sunset } from "lucide-react";
import { ChillVibe } from "../types";
import { cn } from "../lib/format";

interface VibePickerProps {
  value: ChillVibe;
  onChange: (vibe: ChillVibe) => void;
}

export function VibePicker({ value, onChange }: VibePickerProps) {
  const vibes: { id: ChillVibe; label: string; icon: React.ReactNode; colorClass: string; activeClass: string }[] = [
    { 
      id: "sun", 
      label: "Sun", 
      icon: <Sun className="w-5 h-5" />, 
      colorClass: "hover:bg-amber-100 hover:text-amber-600 hover:border-amber-300", 
      activeClass: "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20" 
    },
    { 
      id: "shade", 
      label: "Shade", 
      icon: <Trees className="w-5 h-5" />, 
      colorClass: "hover:bg-emerald-100 hover:text-emerald-600 hover:border-emerald-300", 
      activeClass: "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20" 
    },
    { 
      id: "lowWind", 
      label: "Low Wind", 
      icon: <Wind className="w-5 h-5" />, 
      colorClass: "hover:bg-sky-100 hover:text-sky-600 hover:border-sky-300", 
      activeClass: "bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-500/20" 
    },
    { 
      id: "goldenHour", 
      label: "Sunset", 
      icon: <Sunset className="w-5 h-5" />, 
      colorClass: "hover:bg-orange-100 hover:text-orange-600 hover:border-orange-300", 
      activeClass: "bg-gradient-to-br from-orange-400 to-rose-500 text-white border-rose-600 shadow-md shadow-orange-500/30" 
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {vibes.map((v) => {
        const isActive = value === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 group",
              isActive 
                ? v.activeClass 
                : cn("bg-card border-border/60 text-muted-foreground", v.colorClass)
            )}
          >
            <div className={cn("mb-2 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")}>
              {v.icon}
            </div>
            <span className="font-bold text-sm">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}

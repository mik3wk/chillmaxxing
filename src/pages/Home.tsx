import { useState, useEffect } from "react";
import { Compass, RefreshCw, AlertTriangle, Map as MapIcon, List as ListIcon } from "lucide-react";
import { useGeolocation } from "../hooks/use-geolocation";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useLocalStorage } from "../hooks/use-local-storage";
import { useChillSpots } from "../hooks/use-chill-spots";
import { ChillVibe } from "../types";
import { VibePicker } from "../components/VibePicker";
import { Slider } from "../components/ui/slider";
import { MapPanel } from "../components/MapPanel";
import { ResultCard } from "../components/ResultCard";
import { cn } from "../lib/format";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const { location, status: geoStatus, requestLocation, errorMsg } = useGeolocation();

  const [vibe, setVibe] = useLocalStorage<ChillVibe>("chill-vibe", "sun");
  const [radius, setRadius] = useLocalStorage<number>("chill-radius", 4);
  const [timeframe, setTimeframe] = useState<"now" | "in60min">("now");
  const debouncedRadius = useDebouncedValue(radius, 450);
  const debouncedVibe = useDebouncedValue(vibe, 300);
  const debouncedTimeframe = useDebouncedValue(timeframe, 300);

  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Mobile layout toggle
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const { data: spots = [], isLoading: isLoadingSpots, error: spotsError, refetch } = useChillSpots(
    location,
    debouncedRadius,
    debouncedVibe,
    debouncedTimeframe,
  );

  // Clear selection if spots change
  useEffect(() => {
    setSelectedSpotId(null);
  }, [spots.length, debouncedVibe, debouncedTimeframe]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 ring-1 ring-border/40 bg-white">
              <img src="/favicon.svg" alt="Chillmaxxing logo" className="w-full h-full block" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl leading-none text-foreground tracking-tight">Chillmaxxing</h1>
              <p className="text-xs font-bold text-muted-foreground tracking-wide uppercase">Find your perfect spot</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {geoStatus === "loading" && <span className="text-xs font-semibold text-primary animate-pulse hidden sm:inline-block">Locating...</span>}
            <button
              onClick={() => {
                requestLocation();
                refetch();
              }}
              disabled={isLoadingSpots || geoStatus === "loading"}
              className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-primary transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-5 h-5", (isLoadingSpots || geoStatus === "loading") && "animate-spin")} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* LEFT SIDEBAR - CONTROLS */}
        <div className="w-full lg:w-1/3 xl:w-95 flex flex-col gap-8 shrink-0">
          {/* Location Request Banner if needed */}
          {geoStatus === "idle" && (
            <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-5 text-center">
              <Compass className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-foreground mb-1">Where are you chilling?</h3>
              <p className="text-sm text-muted-foreground mb-4">We need your location to find the best spots nearby.</p>
              <button
                onClick={requestLocation}
                className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                Share Location
              </button>
            </div>
          )}

          {geoStatus === "denied" && (
            <div className="bg-destructive/10 border-2 border-destructive/20 rounded-2xl p-5 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
              <h3 className="font-bold text-destructive mb-1">Location Access Denied</h3>
              <p className="text-sm text-destructive/80">Please enable location access in your browser settings to use Chillmaxxing.</p>
            </div>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="font-display font-bold text-xl mb-1">1. The Vibe</h2>
              <p className="text-sm text-muted-foreground mb-4">What kind of chill are you looking for?</p>
              <VibePicker value={vibe} onChange={setVibe} />
            </div>
          </section>

          <section className="space-y-4 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="font-display font-bold text-lg">2. Distance</h2>
                <span className="font-bold text-primary">{radius} miles</span>
              </div>
              <Slider value={radius} onValueChange={setRadius} min={1} max={25} />
              <div className="flex justify-between mt-2 text-xs font-semibold text-muted-foreground">
                <span>Near</span>
                <span>Far</span>
              </div>
            </div>

            <div className="pt-5 border-t border-border/50">
              <h2 className="font-display font-bold text-lg mb-3">3. Timing</h2>
              <div className="flex p-1 bg-secondary rounded-xl">
                <button
                  onClick={() => setTimeframe("now")}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all",
                    timeframe === "now" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Right Now
                </button>
                <button
                  onClick={() => setTimeframe("in60min")}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all",
                    timeframe === "in60min" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  In 60 Mins
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE - RESULTS & MAP */}
        <div className="flex-1 flex flex-col min-h-125 gap-6">
          {/* Mobile View Toggle */}
          <div className="lg:hidden flex bg-secondary p-1 rounded-xl shrink-0">
            <button
              onClick={() => setMobileView("list")}
              className={cn(
                "flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all",
                mobileView === "list" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <ListIcon className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={cn(
                "flex-1 py-2.5 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all",
                mobileView === "map" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <MapIcon className="w-4 h-4" /> Map
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
            {/* LIST VIEW */}
            <div className={cn("w-full lg:w-[45%] xl:w-1/2 lg:flex flex-col h-150 lg:h-auto", mobileView === "list" ? "flex" : "hidden")}>
              <div className="flex justify-between items-end mb-4 shrink-0">
                <h2 className="font-display font-bold text-2xl">Results</h2>
                <span className="text-sm font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">{spots.length} spots</span>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
                {isLoadingSpots ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card rounded-2xl p-6 border-2 border-border/50 animate-pulse">
                        <div className="h-6 bg-secondary rounded-md w-3/4 mb-3"></div>
                        <div className="h-4 bg-secondary rounded-md w-1/2 mb-6"></div>
                        <div className="flex gap-2 mb-4">
                          <div className="h-6 w-20 bg-secondary rounded-full"></div>
                          <div className="h-6 w-24 bg-secondary rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 border-t pt-4">
                          <div className="h-10 bg-secondary rounded-md"></div>
                          <div className="h-10 bg-secondary rounded-md"></div>
                          <div className="h-10 bg-secondary rounded-md"></div>
                          <div className="h-10 bg-secondary rounded-md"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : spotsError ? (
                  <div className="text-center p-8 bg-destructive/5 rounded-2xl border border-destructive/20 text-destructive">
                    <p className="font-bold">Failed to load spots.</p>
                    <p className="text-sm opacity-80 mt-1">Please try refreshing.</p>
                  </div>
                ) : spots.length === 0 && geoStatus === "granted" ? (
                  <div className="text-center p-12 bg-card rounded-2xl border-2 border-dashed border-border/50 h-full flex flex-col items-center justify-center">
                    <div className="text-4xl mb-4">🏜️</div>
                    <p className="font-display font-bold text-xl text-foreground mb-2">No chill spots found</p>
                    <p className="text-muted-foreground text-sm">Try increasing your search radius or changing the vibe.</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {spots.map((spot) => (
                      <ResultCard
                        key={spot.id}
                        spot={spot}
                        isSelected={selectedSpotId === spot.id}
                        onClick={() => {
                          setSelectedSpotId(spot.id);
                          if (window.innerWidth < 1024) setMobileView("map");
                        }}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* MAP VIEW */}
            <div className={cn("w-full lg:flex-1 h-125 lg:h-auto relative rounded-2xl overflow-hidden shadow-inner", mobileView === "map" ? "block" : "hidden lg:block")}>
              <MapPanel
                location={location}
                spots={spots}
                selectedSpotId={selectedSpotId}
                isVisible={mobileView === "map" || window.innerWidth >= 1024}
                onSpotSelect={(id) => {
                  setSelectedSpotId(id);
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

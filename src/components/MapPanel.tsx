import { useEffect, useRef, type MutableRefObject } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ScoredSpot, UserLocation } from '../types';

interface MapPanelProps {
  location: UserLocation | null;
  spots: ScoredSpot[];
  selectedSpotId: string | null;
  onSpotSelect: (id: string) => void;
  isVisible?: boolean;
}

// Component to handle auto-panning when selection changes
function MapController({ center, zoom, isVisible }: { center: [number, number], zoom: number; isVisible: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!isVisible || !Number.isFinite(center[0]) || !Number.isFinite(center[1])) return;

    const container = map.getContainer();
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    map.invalidateSize(false);
    map.setView(center, zoom, { animate: false });
  }, [center, zoom, isVisible, map]);

  return null;
}

function isValidCoordinatePair(lat: number, lon: number) {
  return Number.isFinite(lat) && Number.isFinite(lon);
}

function SelectedSpotPopupController({
  selectedSpotId,
  isVisible,
  markerRefs,
}: {
  selectedSpotId: string | null;
  isVisible: boolean;
  markerRefs: MutableRefObject<Record<string, L.Marker | null>>;
}) {
  useEffect(() => {
    if (!selectedSpotId || !isVisible) return;

    const marker = markerRefs.current[selectedSpotId];
    if (!marker) return;

    marker.openPopup();
  }, [selectedSpotId, isVisible, markerRefs]);

  return null;
}

const createCustomIcon = (score: number, isSelected: boolean) => {
  let scoreClass = 'score-medium';
  if (score >= 75) scoreClass = 'score-high';
  if (score < 40) scoreClass = 'score-low';
  
  const selectedClass = isSelected ? 'selected' : '';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="marker-pin ${scoreClass} ${selectedClass}">
        <div class="marker-score">${score}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const userIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-5 h-5 bg-blue-500 border-2 border-white rounded-full shadow-lg shadow-blue-500/50"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function MapPanel({ location, spots, selectedSpotId, onSpotSelect, isVisible = true }: MapPanelProps) {
  const defaultCenter: [number, number] = [39.8283, -98.5795]; // US Center default
  const hasValidLocation = !!location && isValidCoordinatePair(location.lat, location.lon);
  const validSpots = spots.filter((spot) => isValidCoordinatePair(spot.lat, spot.lon));
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  
  // Determine center based on selection or user location
  let center: [number, number] = hasValidLocation ? [location.lat, location.lon] : defaultCenter;
  let zoom = hasValidLocation ? 12 : 4;

  if (selectedSpotId) {
    const selectedSpot = validSpots.find(s => s.id === selectedSpotId);
    if (selectedSpot) {
      center = [selectedSpot.lat, selectedSpot.lon];
      zoom = 14;
    }
  }

  if (!hasValidLocation) {
    return (
      <div className="w-full h-full bg-secondary/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-border/50">
        <p className="text-muted-foreground font-medium">Share location to see map</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] bg-card rounded-2xl overflow-hidden shadow-lg shadow-black/5 border border-border/50 relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController center={center} zoom={zoom} isVisible={isVisible} />
        <SelectedSpotPopupController selectedSpotId={selectedSpotId} isVisible={isVisible} markerRefs={markerRefs} />
        
        {/* User Location Marker */}
        <Marker position={[location.lat, location.lon]} icon={userIcon}>
          <Popup className="font-sans font-semibold">You are here</Popup>
        </Marker>

        {/* Spot Markers */}
        {validSpots.map((spot) => (
          <Marker 
            key={spot.id} 
            ref={(marker) => {
              markerRefs.current[spot.id] = marker;
            }}
            position={[spot.lat, spot.lon]}
            icon={createCustomIcon(spot.chillScore, spot.id === selectedSpotId)}
            eventHandlers={{
              click: () => onSpotSelect(spot.id),
            }}
          >
            <Popup className="font-sans">
              <div className="text-center p-1">
                <p className="font-bold text-base mb-1">{spot.name}</p>
                <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                  Score: {spot.chillScore}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

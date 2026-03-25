import { CandidateSpot, SpotType } from "../types";

// Haversine formula to calculate distance in miles
function getDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function determineType(tags: Record<string, string>): SpotType {
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.natural === "beach") return "beach";
  if (tags.leisure === "picnic_table" || tags.leisure === "picnic_site") return "picnic";
  return "park";
}

export async function fetchNearbySpots(lat: number, lon: number, radiusMiles: number): Promise<CandidateSpot[]> {
  const radiusMeters = Math.round(radiusMiles * 1609.34);
  
  // Using Overpass API. "out center" gives us the lat/lon center of polygons/relations.
  // Limiting to 25 items to keep it fast and responsive.
  const query = `
    [out:json][timeout:15];
    (
      nwr["leisure"="park"](around:${radiusMeters},${lat},${lon});
      nwr["natural"="beach"](around:${radiusMeters},${lat},${lon});
      nwr["tourism"="viewpoint"](around:${radiusMeters},${lat},${lon});
      nwr["leisure"="picnic_table"](around:${radiusMeters},${lat},${lon});
    );
    out center 25;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) throw new Error("Failed to fetch places");
    
    const data = await response.json();
    
    const spots: CandidateSpot[] = [];
    const seenNames = new Set<string>();

    for (const element of data.elements) {
      const rawLat = element.center?.lat ?? element.lat;
      const rawLon = element.center?.lon ?? element.lon;
      const spotLat = typeof rawLat === "number" ? rawLat : Number(rawLat);
      const spotLon = typeof rawLon === "number" ? rawLon : Number(rawLon);
      
      if (!Number.isFinite(spotLat) || !Number.isFinite(spotLon)) continue;

      let name = element.tags?.name || element.tags?.description;
      const type = determineType(element.tags || {});

      if (!name) {
        // Fallbacks for unnamed spots
        name = type === "viewpoint" ? "Scenic Viewpoint" 
             : type === "beach" ? "Local Beach"
             : type === "picnic" ? "Picnic Area"
             : "Local Park";
      }

      // Deduplicate roughly by name to avoid overlapping elements from OSM
      if (seenNames.has(name) && name !== "Local Park" && name !== "Scenic Viewpoint") continue;
      seenNames.add(name);

      spots.push({
        id: element.id.toString(),
        name,
        lat: spotLat,
        lon: spotLon,
        type,
        distanceMiles: getDistanceMiles(lat, lon, spotLat, spotLon),
      });
    }

    // Sort by distance and return top 15
    return spots.sort((a, b) => a.distanceMiles - b.distanceMiles).slice(0, 15);
  } catch (error) {
    console.error("Overpass API Error:", error);
    throw error;
  }
}

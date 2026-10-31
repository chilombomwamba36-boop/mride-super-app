export interface MapCoordinate {
  lat: number;
  lng: number;
}

export type ManeuverType =
  | 'depart'
  | 'turn-left'
  | 'turn-slight-left'
  | 'turn-sharp-left'
  | 'turn-right'
  | 'turn-slight-right'
  | 'turn-sharp-right'
  | 'uturn'
  | 'roundabout'
  | 'merge'
  | 'continue'
  | 'arrive';

export interface DrivingRouteStep {
  instruction: string;
  roadName: string;
  maneuverType: ManeuverType;
  maneuverModifier?: string;
  bearingAfter?: number;
  roundaboutExit?: number;
  location: MapCoordinate;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteDirectionalArrow {
  id: string;
  coordinate: MapCoordinate;
  bearingDegrees: number;
}

export interface DrivingRoute {
  coordinates: MapCoordinate[];
  distanceMeters: number;
  durationSeconds: number;
  steps: DrivingRouteStep[];
  directionalArrows: RouteDirectionalArrow[];
  summaryLabel: string;
}

export interface GeocodedPlaceResult {
  coordinate: MapCoordinate;
  label: string;
  shortName: string;
  suburbOrRoad?: string;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
  };
}

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    legs: Array<{
      summary?: string;
      steps: Array<{
        distance: number;
        duration: number;
        name: string;
        maneuver: {
          type: string;
          modifier?: string;
          bearing_before?: number;
          bearing_after?: number;
          exit?: number;
          location: [number, number];
        };
      }>;
    }>;
    geometry: { coordinates: [number, number][] };
  }>;
}

/**
 * Verified high-accuracy coordinates for Lusaka & Zambian hubs, malls, universities,
 * hospitals, bus stations, and compounds. Checked first for instant zero-latency lookup
 * and guaranteed accuracy in Lusaka before falling back to live Nominatim geocoding.
 */
export const LUSAKA_VERIFIED_PLACES: Array<{
  keywords: string[];
  label: string;
  shortName: string;
  suburbOrRoad: string;
  city: string;
  coordinate: MapCoordinate;
}> = [
  {
    keywords: ['cavendish university', 'cavendish', 'washama road', 'villa elizabetha'],
    label: 'Cavendish University Zambia, Great North Rd / Washama Rd, Lusaka',
    shortName: 'Cavendish University',
    suburbOrRoad: 'Villa Elizabetha, Great North Rd',
    city: 'Lusaka',
    coordinate: { lat: -15.4028, lng: 28.2816 }
  },
  {
    keywords: ['eastpark mall', 'east park mall', 'eastpark', 'arcades shopping mall', 'great east rd mall'],
    label: 'EastPark Mall, Great East Road, Lusaka',
    shortName: 'EastPark Mall',
    suburbOrRoad: 'Great East Road, Kalundu',
    city: 'Lusaka',
    coordinate: { lat: -15.3897, lng: 28.3292 }
  },
  {
    keywords: ['manda hill', 'manda hill mall', 'manchinchi'],
    label: 'Manda Hill Shopping Mall, Great East Road, Lusaka',
    shortName: 'Manda Hill Mall',
    suburbOrRoad: 'Great East Road / Manchinchi Rd',
    city: 'Lusaka',
    coordinate: { lat: -15.3941, lng: 28.3046 }
  },
  {
    keywords: ['levy junction', 'levy mall', 'church road'],
    label: 'Levy Junction Shopping Mall, Church Road, Lusaka',
    shortName: 'Levy Junction Mall',
    suburbOrRoad: 'Church Road, CBD',
    city: 'Lusaka',
    coordinate: { lat: -15.4126, lng: 28.2914 }
  },
  {
    keywords: ['cairo road', 'lusaka cbd', 'town centre', 'katondo street'],
    label: 'Cairo Road Central Business District, Lusaka',
    shortName: 'Cairo Road CBD',
    suburbOrRoad: 'Central Business District',
    city: 'Lusaka',
    coordinate: { lat: -15.4167, lng: 28.2821 }
  },
  {
    keywords: ['woodlands shopping mall', 'woodlands', 'chindo road', 'leopards hill'],
    label: 'Woodlands Shopping Mall, Chindo Road, Lusaka',
    shortName: 'Woodlands Shopping Mall',
    suburbOrRoad: 'Woodlands, Chindo Rd',
    city: 'Lusaka',
    coordinate: { lat: -15.4425, lng: 28.3348 }
  },
  {
    keywords: ['kabulonga', 'centro mall', 'kabulonga road'],
    label: 'Centro Mall Kabulonga, Kabulonga Road, Lusaka',
    shortName: 'Kabulonga Centro Mall',
    suburbOrRoad: 'Kabulonga',
    city: 'Lusaka',
    coordinate: { lat: -15.4192, lng: 28.3489 }
  },
  {
    keywords: ['unza', 'university of zambia', 'great east road campus'],
    label: 'University of Zambia (UNZA) Main Gate, Great East Road, Lusaka',
    shortName: 'UNZA Main Campus',
    suburbOrRoad: 'Great East Road',
    city: 'Lusaka',
    coordinate: { lat: -15.3905, lng: 28.3324 }
  },
  {
    keywords: ['uth', 'university teaching hospital', 'nationalist road'],
    label: 'University Teaching Hospital (UTH), Nationalist Road, Lusaka',
    shortName: 'University Teaching Hospital (UTH)',
    suburbOrRoad: 'Nationalist Road, Ridgeway',
    city: 'Lusaka',
    coordinate: { lat: -15.4342, lng: 28.3081 }
  },
  {
    keywords: ['kenneth kaunda airport', 'kkia', 'lusaka airport', 'airport'],
    label: 'Kenneth Kaunda International Airport (KKIA), Lusaka',
    shortName: 'Kenneth Kaunda Intl Airport',
    suburbOrRoad: 'Airport Road, Chongwe Corridor',
    city: 'Lusaka',
    coordinate: { lat: -15.3308, lng: 28.4526 }
  },
  {
    keywords: ['intercity bus terminus', 'intercity', 'dedan kimathi'],
    label: 'Intercity Bus Terminus, Dedan Kimathi Road, Lusaka',
    shortName: 'Intercity Bus Terminus',
    suburbOrRoad: 'Dedan Kimathi Rd, Kamwala',
    city: 'Lusaka',
    coordinate: { lat: -15.4258, lng: 28.2882 }
  },
  {
    keywords: ['cosmopolitan mall', 'kafue road', 'makeni'],
    label: 'Cosmopolitan Mall, Kafue Road, Makeni, Lusaka',
    shortName: 'Cosmopolitan Mall Makeni',
    suburbOrRoad: 'Kafue Road, Makeni',
    city: 'Lusaka',
    coordinate: { lat: -15.4519, lng: 28.2734 }
  },
  {
    keywords: ['wamalunga road', 'garden chimwansa', 'garden', 'sadzu rd', 'makishi rd'],
    label: 'Garden / Makishi Road Junction, Lusaka',
    shortName: 'Garden / Makishi Rd',
    suburbOrRoad: 'Northmead / Garden, Lusaka',
    city: 'Lusaka',
    coordinate: { lat: -15.3958, lng: 28.2935 }
  },
  {
    keywords: ['chelstone', 'avondale', 'palm drive'],
    label: 'Chelstone Shopping Centre, Great East Road, Lusaka',
    shortName: 'Chelstone Centre',
    suburbOrRoad: 'Great East Road, Chelstone',
    city: 'Lusaka',
    coordinate: { lat: -15.3694, lng: 28.3782 }
  },
  {
    keywords: ['chalala', 'libala', 'chilimbulu'],
    label: 'Libala / Chilimbulu Road Roundabout, Lusaka',
    shortName: 'Libala Roundabout',
    suburbOrRoad: 'Chilimbulu Road',
    city: 'Lusaka',
    coordinate: { lat: -15.4488, lng: 28.3112 }
  },
  {
    keywords: ['roma', 'zambezi road', 'foxndale', 'foxdale court'],
    label: 'Foxdale Court, Zambezi Road, Roma, Lusaka',
    shortName: 'Foxdale Court Roma',
    suburbOrRoad: 'Zambezi Road, Roma',
    city: 'Lusaka',
    coordinate: { lat: -15.3672, lng: 28.3218 }
  },
  {
    keywords: ['mukuba mall', 'kitwe', 'parklands kitwe'],
    label: 'Mukuba Mall, Independence Avenue, Kitwe',
    shortName: 'Mukuba Mall Kitwe',
    suburbOrRoad: 'Independence Ave, Kitwe',
    city: 'Kitwe',
    coordinate: { lat: -12.7962, lng: 28.2156 }
  },
  {
    keywords: ['jacaranda mall', 'ndola', 'president avenue ndola'],
    label: 'Jacaranda Mall, Broadway, Ndola',
    shortName: 'Jacaranda Mall Ndola',
    suburbOrRoad: 'Broadway, Ndola',
    city: 'Ndola',
    coordinate: { lat: -12.9718, lng: 28.6412 }
  },
  {
    keywords: ['mosi-oa-tunya', 'victoria falls', 'livingstone'],
    label: 'Mosi-oa-Tunya Road Town Centre, Livingstone',
    shortName: 'Livingstone Centre',
    suburbOrRoad: 'Mosi-oa-Tunya Rd',
    city: 'Livingstone',
    coordinate: { lat: -17.8419, lng: 25.8543 }
  },
  {
    keywords: ['pinnacle mall', 'pinnacle woodlands'],
    label: 'Pinnacle Mall, Chindo Road, Woodlands, Lusaka',
    shortName: 'Pinnacle Mall Woodlands',
    suburbOrRoad: 'Chindo Rd, Woodlands',
    city: 'Lusaka',
    coordinate: { lat: -15.4465, lng: 28.3389 }
  },
  {
    keywords: ['crossroads mall', 'crossroads kabulonga', 'leopards hill road'],
    label: 'Crossroads Shopping Mall, Leopards Hill Road, Kabulonga, Lusaka',
    shortName: 'Crossroads Mall Kabulonga',
    suburbOrRoad: 'Leopards Hill Rd, Kabulonga',
    city: 'Lusaka',
    coordinate: { lat: -15.4281, lng: 28.3592 }
  },
  {
    keywords: ['twin palm mall', 'ibex hill', 'main street ibex'],
    label: 'Twin Palm Mall, Ibex Hill, Lusaka',
    shortName: 'Twin Palm Mall Ibex Hill',
    suburbOrRoad: 'Ibex Hill Main St',
    city: 'Lusaka',
    coordinate: { lat: -15.4148, lng: 28.3745 }
  },
  {
    keywords: ['salama park', 'grandbaobab', 'munali'],
    label: 'Salama Park Commercial Centre, Munali, Lusaka',
    shortName: 'Salama Park',
    suburbOrRoad: 'Salama Park / Munali',
    city: 'Lusaka',
    coordinate: { lat: -15.3982, lng: 28.3675 }
  },
  {
    keywords: ['northmead', 'paseli road', 'chozi road'],
    label: 'Northmead Shopping Village, Paseli Road, Lusaka',
    shortName: 'Northmead Shopping Centre',
    suburbOrRoad: 'Paseli Rd, Northmead',
    city: 'Lusaka',
    coordinate: { lat: -15.4005, lng: 28.2991 }
  },
  {
    keywords: ['rhodes park', 'addis ababa drive', 'longacres', 'haile selassie'],
    label: 'Longacres / Addis Ababa Drive Roundabout, Lusaka',
    shortName: 'Longacres / Rhodes Park',
    suburbOrRoad: 'Addis Ababa Drive',
    city: 'Lusaka',
    coordinate: { lat: -15.4184, lng: 28.3135 }
  },
  {
    keywords: ['soweto market', 'city market', 'lumumba road'],
    label: 'Soweto & City Main Market, Lumumba Road, Lusaka',
    shortName: 'Soweto / City Market',
    suburbOrRoad: 'Lumumba Road, CBD West',
    city: 'Lusaka',
    coordinate: { lat: -15.4214, lng: 28.2738 }
  },
  {
    keywords: ['kamwala', 'luburma market', 'chilimbulu road kamwala'],
    label: 'Kamwala Luburma Trading Market, Chilimbulu Road, Lusaka',
    shortName: 'Kamwala Luburma Market',
    suburbOrRoad: 'Kamwala South',
    city: 'Lusaka',
    coordinate: { lat: -15.4328, lng: 28.2916 }
  },
  {
    keywords: ['kabwata', 'burma road', 'kabwata cultural village'],
    label: 'Kabwata Cultural Village, Burma Road, Lusaka',
    shortName: 'Kabwata Burma Rd',
    suburbOrRoad: 'Burma Road, Kabwata',
    city: 'Lusaka',
    coordinate: { lat: -15.4391, lng: 28.3012 }
  },
  {
    keywords: ['chilenje', 'chilenje south', 'muramba road'],
    label: 'Chilenje South Market & Bus Terminus, Lusaka',
    shortName: 'Chilenje South',
    suburbOrRoad: 'Chilenje South',
    city: 'Lusaka',
    coordinate: { lat: -15.4534, lng: 28.3264 }
  },
  {
    keywords: ['kalingalinga', 'alick nkhata road', 'mass media'],
    label: 'Kalingalinga / Alick Nkhata Road, Lusaka',
    shortName: 'Kalingalinga (Alick Nkhata Rd)',
    suburbOrRoad: 'Alick Nkhata Rd / Mass Media',
    city: 'Lusaka',
    coordinate: { lat: -15.4052, lng: 28.3448 }
  },
  {
    keywords: ['matero', 'commonwealth road', 'heroes stadium', 'national heroes stadium'],
    label: 'National Heroes Stadium & Matero Hub, Great North Road, Lusaka',
    shortName: 'Matero / Heroes Stadium',
    suburbOrRoad: 'Great North Rd, Matero',
    city: 'Lusaka',
    coordinate: { lat: -15.3712, lng: 28.2719 }
  },
  {
    keywords: ['chawama', 'kuomboka', 'kafue roundabout'],
    label: 'Chawama Main Market, Lusaka South',
    shortName: 'Chawama Main Hub',
    suburbOrRoad: 'Chawama, Lusaka South',
    city: 'Lusaka',
    coordinate: { lat: -15.4622, lng: 28.2856 }
  },
  {
    keywords: ['kanyama', 'mumbwa road', 'chinika'],
    label: 'Kanyama / Mumbwa Road Industrial Hub, Lusaka',
    shortName: 'Kanyama (Mumbwa Rd)',
    suburbOrRoad: 'Mumbwa Road',
    city: 'Lusaka',
    coordinate: { lat: -15.4241, lng: 28.2485 }
  },
  {
    keywords: ['olympia park', 'mulungushi conference', 'katima mulilo', 'radisson blu'],
    label: 'Mulungushi International Conference Centre, Olympia Park, Lusaka',
    shortName: 'Olympia Park / Mulungushi',
    suburbOrRoad: 'Great East Rd / Katima Mulilo',
    city: 'Lusaka',
    coordinate: { lat: -15.3885, lng: 28.3168 }
  },
  {
    keywords: ['silverest', 'unilus', 'university of lusaka', 'chongwe road'],
    label: 'University of Lusaka (UNILUS) Silverest Campus, Great East Road',
    shortName: 'Silverest / UNILUS',
    suburbOrRoad: 'Great East Rd, Silverest',
    city: 'Lusaka',
    coordinate: { lat: -15.3589, lng: 28.4312 }
  },
  {
    keywords: ['lilayi', 'chilanga', 'baobab college'],
    label: 'Lilayi & Chilanga Junction, Kafue Road, Lusaka',
    shortName: 'Lilayi / Chilanga',
    suburbOrRoad: 'Kafue Road South',
    city: 'Lusaka',
    coordinate: { lat: -15.5125, lng: 28.2814 }
  },
  {
    keywords: ['cbu', 'copperbelt university', 'riverside kitwe', 'ecl mall'],
    label: 'Copperbelt University (CBU) Main Gate, Riverside, Kitwe',
    shortName: 'Copperbelt University (CBU)',
    suburbOrRoad: 'Jambo Drive, Riverside, Kitwe',
    city: 'Kitwe',
    coordinate: { lat: -12.8065, lng: 28.2389 }
  },
  {
    keywords: ['kafubu mall', 'rekay mall', 'kansenshi ndola', 'levy mwanawasa stadium'],
    label: 'Levy Mwanawasa Stadium & Kansenshi Hub, Ndola',
    shortName: 'Kansenshi / Levy Stadium Ndola',
    suburbOrRoad: 'Ndola-Kitwe Dual Carriageway',
    city: 'Ndola',
    coordinate: { lat: -12.9585, lng: 28.6184 }
  }
];

const GEOCODE_CACHE = new Map<string, GeocodedPlaceResult>();

/**
 * Calculate compass bearing in degrees [0, 360) from coordinate A to coordinate B.
 * 0 = North, 90 = East, 180 = South, 270 = West.
 */
export function computeBearingDegrees(from: MapCoordinate, to: MapCoordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Great-circle Haversine distance in meters between two GPS coordinates.
 */
export function computeDistanceMeters(a: MapCoordinate, b: MapCoordinate): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Compute minimum distance in meters from a live GPS coordinate to the active route polyline,
 * and return the index of the closest vertex along the route.
 */
export function findClosestRoutePoint(
  point: MapCoordinate,
  routeCoordinates: MapCoordinate[]
): { closestIndex: number; distanceFromRouteMeters: number } {
  if (routeCoordinates.length === 0) {
    return { closestIndex: 0, distanceFromRouteMeters: 0 };
  }
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < routeCoordinates.length; i++) {
    const d = computeDistanceMeters(point, routeCoordinates[i]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return { closestIndex: bestIdx, distanceFromRouteMeters: bestDist };
}

/**
 * Sample evenly spaced directional arrows along a driving route geometry so that every arrow
 * sits directly on the road polyline and points in the exact forward tangent bearing of travel.
 */
export function buildDirectionalArrowsAlongRoute(
  coordinates: MapCoordinate[],
  spacingMeters = 180
): RouteDirectionalArrow[] {
  if (coordinates.length < 2) return [];
  const arrows: RouteDirectionalArrow[] = [];
  let accumulated = spacingMeters * 0.45; // Start first arrow slightly after pickup

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    const segLen = computeDistanceMeters(start, end);
    if (segLen < 2) continue;

    const bearing = computeBearingDegrees(start, end);
    let distAlongSeg = spacingMeters - accumulated;

    while (distAlongSeg <= segLen) {
      const ratio = distAlongSeg / segLen;
      const lat = start.lat + (end.lat - start.lat) * ratio;
      const lng = start.lng + (end.lng - start.lng) * ratio;
      arrows.push({
        id: `arr_${i}_${Math.round(distAlongSeg)}`,
        coordinate: { lat, lng },
        bearingDegrees: bearing
      });
      distAlongSeg += spacingMeters;
    }

    accumulated = (accumulated + segLen) % spacingMeters;
  }

  // Always ensure at least one midpoint directional arrow on very short routes
  if (arrows.length === 0 && coordinates.length >= 2) {
    const midIdx = Math.floor((coordinates.length - 1) / 2);
    const p1 = coordinates[midIdx];
    const p2 = coordinates[Math.min(coordinates.length - 1, midIdx + 1)];
    arrows.push({
      id: 'arr_mid',
      coordinate: {
        lat: (p1.lat + p2.lat) / 2,
        lng: (p1.lng + p2.lng) / 2
      },
      bearingDegrees: computeBearingDegrees(p1, p2)
    });
  }

  return arrows;
}

/**
 * Geocode a place name in Lusaka / Zambia or any supported African city.
 * Also supports direct coordinate strings like "-15.4028, 28.2816".
 */
export async function findPlace(
  name: string,
  city: string,
  countryNameOrCode: string,
  signal?: AbortSignal
): Promise<GeocodedPlaceResult> {
  const cleanName = name.trim();
  const cacheKey = `${cleanName.toLowerCase()}|${city.toLowerCase()}|${countryNameOrCode.toLowerCase()}`;
  const cached = GEOCODE_CACHE.get(cacheKey);
  if (cached) return cached;

  // 1. Check if the string contains embedded GPS coordinates e.g. "Pinned Location (-15.4028, 28.2816)"
  const coordMatch = cleanName.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = Number(coordMatch[1]);
    const lng = Number(coordMatch[2]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      const res: GeocodedPlaceResult = {
        coordinate: { lat, lng },
        label: cleanName,
        shortName: cleanName.split('(')[0].trim() || 'Pinned Location'
      };
      GEOCODE_CACHE.set(cacheKey, res);
      return res;
    }
  }

  // 2. Check verified Lusaka & Zambia high-accuracy landmark gazetteer
  const normalizedQuery = cleanName.toLowerCase();
  const verifiedHit = LUSAKA_VERIFIED_PLACES.find(
    (entry) =>
      entry.city.toLowerCase() === city.toLowerCase() &&
      entry.keywords.some((kw) => normalizedQuery.includes(kw) || kw.includes(normalizedQuery))
  );
  if (verifiedHit) {
    const res: GeocodedPlaceResult = {
      coordinate: verifiedHit.coordinate,
      label: verifiedHit.label,
      shortName: verifiedHit.shortName,
      suburbOrRoad: verifiedHit.suburbOrRoad
    };
    GEOCODE_CACHE.set(cacheKey, res);
    return res;
  }

  // 3. Query Nominatim OpenStreetMap geocoding API with city & country context
  const baseUrl =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEOCODING_API_URL ||
    'https://nominatim.openstreetmap.org';
  const query = [cleanName, city, countryNameOrCode].filter(Boolean).join(', ');
  const response = await fetch(
    `${baseUrl}/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`,
    { signal, headers: { Accept: 'application/json' } }
  );
  if (!response.ok) {
    throw new Error(`Place search unavailable (${response.status})`);
  }
  const places = (await response.json()) as NominatimPlace[];
  const place = places[0];
  if (!place) {
    // Try broader city-level search if specific plot number wasn't indexed
    const fallbackResponse = await fetch(
      `${baseUrl}/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(`${city}, ${countryNameOrCode}`)}`,
      { signal, headers: { Accept: 'application/json' } }
    );
    if (fallbackResponse.ok) {
      const fallbackPlaces = (await fallbackResponse.json()) as NominatimPlace[];
      if (fallbackPlaces[0]) {
        const fb = fallbackPlaces[0];
        return {
          coordinate: { lat: Number(fb.lat), lng: Number(fb.lon) },
          label: `${cleanName}, ${city}`,
          shortName: cleanName
        };
      }
    }
    throw new Error(`No map result found for "${name}"`);
  }

  const result: GeocodedPlaceResult = {
    coordinate: { lat: Number(place.lat), lng: Number(place.lon) },
    label: place.display_name,
    shortName: place.name || cleanName,
    suburbOrRoad: place.address?.road || place.address?.suburb || place.address?.neighbourhood
  };
  GEOCODE_CACHE.set(cacheKey, result);
  return result;
}

/**
 * Live autocomplete search combining verified Lusaka landmarks + OpenStreetMap Nominatim results.
 */
export async function searchPlacesAutocomplete(
  query: string,
  city: string,
  countryName: string,
  signal?: AbortSignal
): Promise<GeocodedPlaceResult[]> {
  const q = query.trim().toLowerCase();
  const localMatches: GeocodedPlaceResult[] = LUSAKA_VERIFIED_PLACES.filter(
    (p) =>
      p.city.toLowerCase() === city.toLowerCase() &&
      (!q ||
        p.shortName.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.includes(q)))
  ).map((p) => ({
    coordinate: p.coordinate,
    label: p.label,
    shortName: p.shortName,
    suburbOrRoad: p.suburbOrRoad
  }));

  if (q.length < 3) {
    return localMatches.slice(0, 6);
  }

  try {
    const baseUrl =
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEOCODING_API_URL ||
      'https://nominatim.openstreetmap.org';
    const fullQuery = `${query.trim()}, ${city}, ${countryName}`;
    const response = await fetch(
      `${baseUrl}/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(fullQuery)}`,
      { signal, headers: { Accept: 'application/json' } }
    );
    if (!response.ok) return localMatches.slice(0, 6);
    const data = (await response.json()) as NominatimPlace[];
    const remoteMatches: GeocodedPlaceResult[] = data.map((p) => ({
      coordinate: { lat: Number(p.lat), lng: Number(p.lon) },
      label: p.display_name,
      shortName: p.name || p.display_name.split(',')[0],
      suburbOrRoad: p.address?.road || p.address?.suburb || city
    }));

    const merged = [...localMatches];
    for (const rem of remoteMatches) {
      if (!merged.some((m) => computeDistanceMeters(m.coordinate, rem.coordinate) < 120)) {
        merged.push(rem);
      }
    }
    return merged.slice(0, 7);
  } catch {
    return localMatches.slice(0, 6);
  }
}

/**
 * Reverse geocode a map pin drop or dragged pickup marker into a real Lusaka street/area name.
 */
export async function reverseGeocodeCoordinate(
  coord: MapCoordinate,
  signal?: AbortSignal
): Promise<GeocodedPlaceResult> {
  // Check if very close (< 180m) to a known Lusaka landmark first
  for (const place of LUSAKA_VERIFIED_PLACES) {
    if (computeDistanceMeters(coord, place.coordinate) <= 180) {
      return {
        coordinate: coord,
        label: place.label,
        shortName: place.shortName,
        suburbOrRoad: place.suburbOrRoad
      };
    }
  }

  try {
    const baseUrl =
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEOCODING_API_URL ||
      'https://nominatim.openstreetmap.org';
    const response = await fetch(
      `${baseUrl}/reverse?format=jsonv2&lat=${coord.lat}&lon=${coord.lng}&zoom=18&addressdetails=1`,
      { signal, headers: { Accept: 'application/json' } }
    );
    if (response.ok) {
      const data = (await response.json()) as NominatimPlace;
      const road = data.address?.road;
      const suburb = data.address?.suburb || data.address?.neighbourhood;
      const short =
        [road, suburb].filter(Boolean).join(', ') ||
        data.name ||
        data.display_name?.split(',').slice(0, 2).join(', ') ||
        `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`;
      return {
        coordinate: coord,
        label: data.display_name || short,
        shortName: short,
        suburbOrRoad: suburb || road
      };
    }
  } catch {
    // Fallback to clean coordinate label if offline
  }

  const formatted = `Pinned Point (${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)})`;
  return {
    coordinate: coord,
    label: formatted,
    shortName: formatted
  };
}

/**
 * Calculate real driving route, turn-by-turn manoeuvres, and oriented directional arrows
 * along the road geometry using OSRM (or custom VITE_ROUTING_API_URL).
 */
export async function getDrivingRoute(
  from: MapCoordinate,
  to: MapCoordinate,
  signal?: AbortSignal,
  waypoints?: MapCoordinate[]
): Promise<DrivingRoute> {
  const allPoints = [from, ...(waypoints || []), to];
  const coordinatesParam = allPoints.map((pt) => `${pt.lng},${pt.lat}`).join(';');
  const routingBase =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ROUTING_API_URL ||
    'https://router.project-osrm.org/route/v1/driving';

  const response = await fetch(
    `${routingBase}/${coordinatesParam}?overview=full&geometries=geojson&steps=true`,
    { signal, headers: { Accept: 'application/json' } }
  );
  if (!response.ok) {
    throw new Error(`Route service unavailable (${response.status})`);
  }
  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) {
    throw new Error('No driving route is available for these locations');
  }

  const coordinates: MapCoordinate[] = route.geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng
  }));

  const steps: DrivingRouteStep[] = route.legs
    .flatMap((leg) => leg.steps)
    .map((step) => {
      const parsed = classifyManeuver(
        step.maneuver.type,
        step.maneuver.modifier,
        step.name,
        step.maneuver.exit
      );
      return {
        instruction: parsed.instruction,
        roadName: step.name?.trim() || 'Local Road',
        maneuverType: parsed.maneuverType,
        maneuverModifier: step.maneuver.modifier,
        bearingAfter: step.maneuver.bearing_after,
        roundaboutExit: step.maneuver.exit,
        location: {
          lat: step.maneuver.location[1],
          lng: step.maneuver.location[0]
        },
        distanceMeters: step.distance,
        durationSeconds: step.duration
      };
    })
    .filter((step) => Boolean(step.instruction));

  const directionalArrows = buildDirectionalArrowsAlongRoute(coordinates, 160);
  const summaryLabel =
    route.legs
      .map((l) => l.summary)
      .filter(Boolean)
      .join(' → ') || 'Optimal Driving Route';

  return {
    coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    steps,
    directionalArrows,
    summaryLabel
  };
}

function classifyManeuver(
  type: string,
  modifier?: string,
  roadName?: string,
  exit?: number
): { instruction: string; maneuverType: ManeuverType } {
  const cleanRoad = roadName?.trim();
  const roadSuffix = cleanRoad ? ` onto ${cleanRoad}` : '';
  const mod = (modifier || '').toLowerCase();

  if (type === 'depart') {
    return {
      instruction: `Head out${cleanRoad ? ` on ${cleanRoad}` : ''}`,
      maneuverType: 'depart'
    };
  }
  if (type === 'arrive') {
    return {
      instruction: 'Arrive at destination',
      maneuverType: 'arrive'
    };
  }
  if (type === 'roundabout' || type === 'rotary' || type === 'exit roundabout') {
    const exitText = exit ? `take exit ${exit}` : mod ? `take the ${mod} exit` : 'continue';
    return {
      instruction: `At the roundabout, ${exitText}${roadSuffix}`,
      maneuverType: 'roundabout'
    };
  }
  if (mod.includes('uturn')) {
    return {
      instruction: `Make a U-turn${roadSuffix}`,
      maneuverType: 'uturn'
    };
  }
  if (type === 'turn' || type === 'end of road' || type === 'fork') {
    if (mod === 'sharp left') {
      return { instruction: `Turn sharp left${roadSuffix}`, maneuverType: 'turn-sharp-left' };
    }
    if (mod === 'slight left') {
      return { instruction: `Bear left${roadSuffix}`, maneuverType: 'turn-slight-left' };
    }
    if (mod.includes('left')) {
      return { instruction: `Turn left${roadSuffix}`, maneuverType: 'turn-left' };
    }
    if (mod === 'sharp right') {
      return { instruction: `Turn sharp right${roadSuffix}`, maneuverType: 'turn-sharp-right' };
    }
    if (mod === 'slight right') {
      return { instruction: `Bear right${roadSuffix}`, maneuverType: 'turn-slight-right' };
    }
    if (mod.includes('right')) {
      return { instruction: `Turn right${roadSuffix}`, maneuverType: 'turn-right' };
    }
  }
  if (type === 'merge' || type === 'on ramp' || type === 'off ramp') {
    return {
      instruction: `Merge ${mod || 'ahead'}${roadSuffix}`,
      maneuverType: 'merge'
    };
  }
  if (type === 'new name' || type === 'continue') {
    return {
      instruction: `Continue straight${roadSuffix}`,
      maneuverType: 'continue'
    };
  }
  return { instruction: '', maneuverType: 'continue' };
}

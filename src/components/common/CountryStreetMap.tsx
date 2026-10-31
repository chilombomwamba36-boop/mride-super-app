import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ArrowLeft,
  Compass,
  CornerUpLeft,
  CornerUpRight,
  LocateFixed,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  MoveUp,
  Navigation,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { CountryConfig } from '../../data/africanCountries';
import { AiVoiceCopilotService } from '../../services/aiVoiceCopilotService';
import {
  DrivingRoute,
  DrivingRouteStep,
  LUSAKA_VERIFIED_PLACES,
  ManeuverType,
  MapCoordinate,
  computeBearingDegrees,
  computeDistanceMeters,
  findClosestRoutePoint,
  findPlace,
  getDrivingRoute,
  reverseGeocodeCoordinate
} from '../../services/mapRouting';

export interface CountryStreetMapProps {
  country: CountryConfig;
  activeCity: string;
  pickupName: string;
  destinationName: string;
  onBack?: () => void;
  heightClass?: string;
  driverLocation?: MapCoordinate | null;
  driverHeadingDegrees?: number | null;
  onRouteCalculated?: (route: DrivingRoute) => void;
  onPickupChanged?: (newPickupLabel: string, coord: MapCoordinate) => void;
  onDestinationChanged?: (newDestinationLabel: string, coord: MapCoordinate) => void;
  enableNavigationFollow?: boolean;
}

const CITY_COORDINATES: Record<string, Record<string, MapCoordinate>> = {
  ZM: {
    Lusaka: { lat: -15.4167, lng: 28.2833 },
    Kitwe: { lat: -12.8024, lng: 28.2132 },
    Ndola: { lat: -12.9691, lng: 28.6366 },
    Livingstone: { lat: -17.8419, lng: 25.8543 },
    Kabwe: { lat: -14.4469, lng: 28.4464 },
    Chipata: { lat: -13.6333, lng: 32.65 },
    Solwezi: { lat: -12.1833, lng: 26.4 },
    Choma: { lat: -16.808, lng: 26.9875 },
    Kasama: { lat: -10.2129, lng: 31.1808 },
    Mongu: { lat: -15.2484, lng: 23.1274 }
  },
  KE: {
    Nairobi: { lat: -1.2921, lng: 36.8219 },
    Mombasa: { lat: -4.0435, lng: 39.6682 },
    Kisumu: { lat: -0.0917, lng: 34.768 },
    Nakuru: { lat: -0.3031, lng: 36.08 },
    Eldoret: { lat: 0.5143, lng: 35.2698 }
  },
  NG: {
    Lagos: { lat: 6.5244, lng: 3.3792 },
    Abuja: { lat: 9.0765, lng: 7.3986 },
    'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
    Ibadan: { lat: 7.3775, lng: 3.9475 },
    Kano: { lat: 12.0022, lng: 8.592 }
  },
  ZA: {
    Johannesburg: { lat: -26.2041, lng: 28.0473 },
    'Cape Town': { lat: -33.9249, lng: 18.4241 },
    Durban: { lat: -29.8587, lng: 31.0218 },
    Pretoria: { lat: -25.7479, lng: 28.2293 },
    Gqeberha: { lat: -33.9608, lng: 25.6022 }
  },
  GH: {
    Accra: { lat: 5.6037, lng: -0.187 },
    Kumasi: { lat: 6.6885, lng: -1.6244 },
    Takoradi: { lat: 4.9016, lng: -1.7831 },
    Tamale: { lat: 9.4034, lng: -0.8424 },
    Tema: { lat: 5.6698, lng: -0.0166 }
  },
  TZ: {
    'Dar es Salaam': { lat: -6.7924, lng: 39.2083 },
    Dodoma: { lat: -6.163, lng: 35.7516 },
    Arusha: { lat: -3.3869, lng: 36.683 },
    Mwanza: { lat: -2.5164, lng: 32.9175 },
    Zanzibar: { lat: -6.1659, lng: 39.2026 }
  },
  UG: {
    Kampala: { lat: 0.3476, lng: 32.5825 },
    Entebbe: { lat: 0.0512, lng: 32.4637 },
    Jinja: { lat: 0.4479, lng: 33.2026 },
    Mbarara: { lat: -0.6072, lng: 30.6545 },
    Gulu: { lat: 2.7746, lng: 32.299 }
  },
  RW: {
    Kigali: { lat: -1.9441, lng: 30.0619 },
    Rubavu: { lat: -1.6773, lng: 29.263 },
    Musanze: { lat: -1.4998, lng: 29.6347 },
    Huye: { lat: -2.5967, lng: 29.7394 }
  },
  EG: {
    Cairo: { lat: 30.0444, lng: 31.2357 },
    Alexandria: { lat: 31.2, lng: 29.9187 },
    Giza: { lat: 30.0131, lng: 31.2089 },
    'Sharm El Sheikh': { lat: 27.9158, lng: 34.3299 }
  },
  CD: {
    Kinshasa: { lat: -4.4419, lng: 15.2663 },
    Lubumbashi: { lat: -11.6876, lng: 27.5026 },
    Goma: { lat: -1.6585, lng: 29.2205 },
    Kolwezi: { lat: -10.7167, lng: 25.4667 }
  }
};

// Minimal typing for global MapLibre GL JS (loaded via index.html CDN or npm)
interface MapLibreInstance {
  remove: () => void;
  resize: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  isStyleLoaded: () => boolean;
  getSource: (id: string) => any;
  addSource: (id: string, source: any) => void;
  getLayer: (id: string) => any;
  addLayer: (layer: any) => void;
  hasImage: (id: string) => boolean;
  addImage: (id: string, img: any, options?: any) => void;
  flyTo: (options: any) => void;
  easeTo: (options: any) => void;
  fitBounds: (bounds: [[number, number], [number, number]], options?: any) => void;
  getBearing: () => number;
  getPitch: () => number;
  getZoom: () => number;
  zoomIn: () => void;
  zoomOut: () => void;
}

declare global {
  interface Window {
    maplibregl?: any;
  }
}

function getResolvedVectorStyleUrl(): string {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  if (env.VITE_MAP_STYLE_URL) return env.VITE_MAP_STYLE_URL;
  if (env.VITE_MAPTILER_API_KEY) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${env.VITE_MAPTILER_API_KEY}`;
  }
  // OpenFreeMap Liberty Vector Style: High-detail motorways, primary/secondary/residential
  // roads, street names, junctions, POIs, and 3D building extrusions in Lusaka.
  return 'https://tiles.openfreemap.org/styles/liberty';
}

/**
 * Create a crisp canvas image for the directional chevron arrow placed along the route line.
 * Drawn pointing UP (0 degrees North) so MapLibre `icon-rotate` aligns it with the road segment bearing.
 */
function createDirectionalArrowImageData(): ImageData | null {
  if (typeof document === 'undefined') return null;
  const size = 36;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  // Subtle dark halo behind chevron for high contrast over orange/yellow road casing
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#0B1528';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // Sharp forward-pointing navigation chevron (pointing North / Up = 0 deg)
  ctx.beginPath();
  ctx.moveTo(size / 2 - 5, size / 2 + 3.5);
  ctx.lineTo(size / 2, size / 2 - 4.5);
  ctx.lineTo(size / 2 + 5, size / 2 + 3.5);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

/**
 * Clean Yango-stylePickup Pin DOM element (draggable)
 */
function buildPickupPinDom(label: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'mride-yango-pin-wrapper';
  el.style.cursor = 'grab';
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-14px);">
      <div style="background:#0B1528;color:#FFFFFF;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.28);border:1.5px solid #FF6500;margin-bottom:3px;max-width:140px;overflow:hidden;text-overflow:ellipsis;">
        A • ${label}
      </div>
      <div style="width:24px;height:24px;border-radius:999px;background:#FF6500;border:3.5px solid #FFFFFF;box-shadow:0 4px 12px rgba(255,101,0,0.55);display:flex;align-items:center;justify-content:center;">
        <div style="width:6px;height:6px;border-radius:999px;background:#FFFFFF;"></div>
      </div>
    </div>
  `;
  return el;
}

/**
 * Clean Yango-style Destination Pin DOM element (draggable)
 */
function buildDestinationPinDom(label: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'mride-yango-pin-wrapper';
  el.style.cursor = 'grab';
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-14px);">
      <div style="background:#FFFFFF;color:#0B1528;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.22);border:1.5px solid #0B1528;margin-bottom:3px;max-width:140px;overflow:hidden;text-overflow:ellipsis;">
        B • ${label}
      </div>
      <div style="width:24px;height:24px;border-radius:7px;background:#0B1528;border:3.5px solid #FFFFFF;box-shadow:0 4px 12px rgba(11,21,40,0.45);display:flex;align-items:center;justify-content:center;">
        <div style="width:6px;height:6px;border-radius:2px;background:#FFE500;"></div>
      </div>
    </div>
  `;
  return el;
}

/**
 * Top-down 3D-styled Navigation Car Marker that rotates smoothly according to vehicle heading.
 */
function buildRotatingDriverCarDom(headingDegrees: number): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.width = '44px';
  wrapper.style.height = '44px';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.pointerEvents = 'none';

  wrapper.innerHTML = `
    <div class="mride-driver-car-rotator" style="width:40px;height:40px;transition:transform 280ms linear;transform:rotate(${headingDegrees}deg);display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 5px 10px rgba(0,0,0,0.38));">
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="21" fill="#FF6500" fill-opacity="0.18"/>
        <rect x="14" y="6" width="20" height="36" rx="9" fill="#FFFFFF" stroke="#0B1528" stroke-width="2.5"/>
        <path d="M16.5 15C16.5 12.5 19.5 11 24 11C28.5 11 31.5 12.5 31.5 15L30.5 21H17.5L16.5 15Z" fill="#0B1528"/>
        <rect x="17.5" y="29" width="13" height="6" rx="2.5" fill="#0B1528"/>
        <rect x="16" y="7" width="4.5" height="2.2" rx="1" fill="#FFE500"/>
        <rect x="27.5" y="7" width="4.5" height="2.2" rx="1" fill="#FFE500"/>
        <path d="M24 2L28 7H20L24 2Z" fill="#FF6500"/>
      </svg>
    </div>
  `;
  return wrapper;
}

export const CountryStreetMap: React.FC<CountryStreetMapProps> = ({
  country,
  activeCity,
  pickupName,
  destinationName,
  onBack,
  heightClass = 'h-72 sm:h-80',
  driverLocation,
  driverHeadingDegrees,
  onRouteCalculated,
  onPickupChanged,
  onDestinationChanged,
  enableNavigationFollow = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [activeRoute, setActiveRoute] = useState<DrivingRoute | null>(null);
  const [activeManeuver, setActiveManeuver] = useState<DrivingRouteStep | null>(null);
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState<number | null>(null);
  const [remainingDurationSeconds, setRemainingDurationSeconds] = useState<number | null>(null);
  const [isFollowingDriver, setIsFollowingDriver] = useState<boolean>(enableNavigationFollow);
  const [mapPinClickMode, setMapPinClickMode] = useState<'none' | 'pickup' | 'destination'>('none');
  const [is3DPitchEnabled, setIs3DPitchEnabled] = useState<boolean>(true);
  const [currentBearing, setCurrentBearing] = useState<number>(0);
  const [showMapToolsDrawer, setShowMapToolsDrawer] = useState<boolean>(false);
  const [isRealViewSatellite, setIsRealViewSatellite] = useState<boolean>(false);
  const [, setCurrentZoomLevel] = useState<number>(13.5);
  const [isAiVoiceEnabled, setIsAiVoiceEnabled] = useState<boolean>(() =>
    AiVoiceCopilotService.getVoiceEnabled()
  );

  // Coordinates state (allows dragging pins or clicking map to refine exact pickup/dropoff)
  const [customPickupCoord, setCustomPickupCoord] = useState<MapCoordinate | null>(null);
  const [customDestinationCoord, setCustomDestinationCoord] = useState<MapCoordinate | null>(null);

  const mapElementRef = useRef<HTMLDivElement>(null);
  const vectorMapRef = useRef<MapLibreInstance | null>(null);
  const leafletFallbackMapRef = useRef<L.Map | null>(null);

  // MapLibre Markers
  const vectorPickupMarkerRef = useRef<any>(null);
  const vectorDestinationMarkerRef = useRef<any>(null);
  const vectorDriverMarkerRef = useRef<any>(null);

  // Leaflet Fallback Markers & Layers
  const leafletRouteLayerRef = useRef<L.LayerGroup | null>(null);
  const leafletDriverMarkerRef = useRef<L.Marker | null>(null);

  // Smooth interpolation state for live driver vehicle marker
  const animatedDriverCoordRef = useRef<MapCoordinate | null>(null);
  const animatedDriverHeadingRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastRerouteTimestampRef = useRef<number>(0);

  const center = useMemo(
    () => CITY_COORDINATES[country.code]?.[activeCity] || country.mapCoordinates,
    [activeCity, country]
  );

  const cleanPickup = pickupName.split('(')[0].trim() || pickupName.trim();
  const cleanDestination = destinationName.split('(')[0].trim() || destinationName.trim();

  // Reset custom pin override if text prop changes externally
  useEffect(() => {
    setCustomPickupCoord(null);
  }, [pickupName]);

  useEffect(() => {
    setCustomDestinationCoord(null);
  }, [destinationName]);

  useEffect(() => {
    setIsFollowingDriver(enableNavigationFollow);
  }, [enableNavigationFollow]);

  // Helper to render route & directional arrows onto the MapLibre GL vector map
  const renderVectorRouteAndArrows = useCallback(
    (
      map: MapLibreInstance,
      route: DrivingRoute,
      pickupCoord: MapCoordinate,
      destCoord: MapCoordinate,
      fitViewport: boolean
    ) => {
      const routeGeoJson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates.map((c) => [c.lng, c.lat])
        }
      };

      const arrowsGeoJson = {
        type: 'FeatureCollection',
        features: route.directionalArrows.map((arr) => ({
          type: 'Feature',
          properties: {
            bearing: arr.bearingDegrees
          },
          geometry: {
            type: 'Point',
            coordinates: [arr.coordinate.lng, arr.coordinate.lat]
          }
        }))
      };

      if (!map.hasImage('mride-route-arrow')) {
        const imgData = createDirectionalArrowImageData();
        if (imgData) {
          map.addImage('mride-route-arrow', imgData, { pixelRatio: 2 });
        }
      }

      // 0. Real-View High-Resolution Satellite Aerial Imagery Layer (Auto-reveals when user zooms in close >= 15.8 or toggles Real View)
      if (!map.getSource('mride-real-satellite')) {
        try {
          map.addSource('mride-real-satellite', {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            maxzoom: 19
          });
          map.addLayer({
            id: 'mride-real-satellite-layer',
            type: 'raster',
            source: 'mride-real-satellite',
            paint: {
              'raster-opacity': isRealViewSatellite
                ? 0.92
                : ['interpolate', ['linear'], ['zoom'], 15.2, 0, 16.4, 0.88]
            }
          });
        } catch {
          // ignore if raster layer cannot be attached yet
        }
      }

      // 0B. Lusaka & Zambia Verified Places & Landmarks Layer (So no place is left out as user zooms in)
      const placesGeoJson = {
        type: 'FeatureCollection',
        features: LUSAKA_VERIFIED_PLACES.map((pl) => ({
          type: 'Feature',
          properties: {
            name: pl.shortName,
            suburb: pl.suburbOrRoad
          },
          geometry: {
            type: 'Point',
            coordinates: [pl.coordinate.lng, pl.coordinate.lat]
          }
        }))
      };
      if (map.getSource('mride-verified-places')) {
        map.getSource('mride-verified-places').setData(placesGeoJson);
      } else {
        try {
          map.addSource('mride-verified-places', {
            type: 'geojson',
            data: placesGeoJson
          });
          map.addLayer({
            id: 'mride-verified-places-dots',
            type: 'circle',
            source: 'mride-verified-places',
            minzoom: 11.5,
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3.5, 16, 6],
              'circle-color': '#FF6500',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#FFFFFF'
            }
          });
          map.addLayer({
            id: 'mride-verified-places-labels',
            type: 'symbol',
            source: 'mride-verified-places',
            minzoom: 12.2,
            layout: {
              'text-field': ['get', 'name'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 16, 12.5],
              'text-offset': [0, 1.15],
              'text-anchor': 'top',
              'text-Optional': true
            },
            paint: {
              'text-color': '#0B1528',
              'text-halo-color': '#FFFFFF',
              'text-halo-width': 2
            }
          });
        } catch {
          // ignore if symbol font glyph is still loading
        }
      }

      if (map.getSource('mride-active-route')) {
        map.getSource('mride-active-route').setData(routeGeoJson);
      } else {
        map.addSource('mride-active-route', {
          type: 'geojson',
          data: routeGeoJson
        });

        // 0A. Peak Demand Heatmap Zones (Shows bright orange glow over busy pick-up areas like CBD, Manda Hill, EastPark, Woodlands)
        if (!map.getSource('mride-demand-heat-zones')) {
          try {
            const demandZonesGeoJson = {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'Lusaka CBD / Cairo Rd', intensity: 'HIGH (1.4x Surge)' },
                  geometry: { type: 'Point', coordinates: [28.2833, -15.4167] }
                },
                {
                  type: 'Feature',
                  properties: { name: 'EastPark / UNZA Area', intensity: 'PEAK DEMAND (1.6x Surge)' },
                  geometry: { type: 'Point', coordinates: [28.3242, -15.3934] }
                },
                {
                  type: 'Feature',
                  properties: { name: 'Manda Hill Hub', intensity: 'HIGH (1.3x Surge)' },
                  geometry: { type: 'Point', coordinates: [28.3056, -15.3992] }
                },
                {
                  type: 'Feature',
                  properties: { name: 'Woodlands / Centro', intensity: 'STEADY ORDERS' },
                  geometry: { type: 'Point', coordinates: [28.3371, -15.4385] }
                },
                {
                  type: 'Feature',
                  properties: { name: 'Kamwala / Southgate', intensity: 'HIGH DEMAND' },
                  geometry: { type: 'Point', coordinates: [28.2917, -15.4312] }
                }
              ]
            };

            map.addSource('mride-demand-heat-zones', {
              type: 'geojson',
              data: demandZonesGeoJson
            });

            // Glowing Peak Demand Circles
            map.addLayer({
              id: 'mride-demand-heat-fill',
              type: 'circle',
              source: 'mride-demand-heat-zones',
              paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 35, 14, 70, 17, 120],
                'circle-color': '#FF6500',
                'circle-opacity': 0.28,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#FF9900',
                'circle-stroke-opacity': 0.6
              }
            });

            // Peak Demand Surge Label
            map.addLayer({
              id: 'mride-demand-heat-labels',
              type: 'symbol',
              source: 'mride-demand-heat-zones',
              minzoom: 11.5,
              layout: {
                'text-field': ['concat', ['get', 'name'], '\n⚡ ', ['get', 'intensity']],
                'text-size': 10,
                'text-offset': [0, 0],
                'text-anchor': 'center'
              },
              paint: {
                'text-color': '#9A3412',
                'text-halo-color': '#FFF7ED',
                'text-halo-width': 2
              }
            });
          } catch {
            // ignore if map canvas is refreshing
          }
        }
        map.addLayer({
          id: 'mride-route-casing',
          type: 'line',
          source: 'mride-active-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0B1528',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 7, 14, 11, 18, 16],
            'line-opacity': 0.92
          }
        });

        // 2. Vibrant Mride Orange Inner Active Route Line
        map.addLayer({
          id: 'mride-route-line',
          type: 'line',
          source: 'mride-active-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6500',
            'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4.5, 14, 7.5, 18, 11.5],
            'line-opacity': 0.98
          }
        });
      }

      // 3. Oriented Directional Arrows Layer locked to the map road geometry
      if (map.getSource('mride-route-arrows')) {
        map.getSource('mride-route-arrows').setData(arrowsGeoJson);
      } else {
        map.addSource('mride-route-arrows', {
          type: 'geojson',
          data: arrowsGeoJson
        });

        map.addLayer({
          id: 'mride-route-arrows-layer',
          type: 'symbol',
          source: 'mride-route-arrows',
          layout: {
            'icon-image': 'mride-route-arrow',
            'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.65, 14, 0.9, 17, 1.1],
            'icon-rotate': ['get', 'bearing'],
            'icon-rotation-alignment': 'map',
            'icon-pitch-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true
          }
        });
      }

      // 4. Draggable Pickup & Destination Markers
      const maplibregl = window.maplibregl;
      if (maplibregl) {
        vectorPickupMarkerRef.current?.remove();
        vectorDestinationMarkerRef.current?.remove();

        const pickupMarker = new maplibregl.Marker({
          element: buildPickupPinDom(cleanPickup),
          draggable: Boolean(onPickupChanged)
        })
          .setLngLat([pickupCoord.lng, pickupCoord.lat])
          .addTo(map);

        if (onPickupChanged) {
          pickupMarker.on('dragend', async () => {
            const lngLat = pickupMarker.getLngLat();
            const newCoord = { lat: lngLat.lat, lng: lngLat.lng };
            setCustomPickupCoord(newCoord);
            const rev = await reverseGeocodeCoordinate(newCoord);
            onPickupChanged(rev.shortName, newCoord);
          });
        }
        vectorPickupMarkerRef.current = pickupMarker;

        const destMarker = new maplibregl.Marker({
          element: buildDestinationPinDom(cleanDestination),
          draggable: Boolean(onDestinationChanged)
        })
          .setLngLat([destCoord.lng, destCoord.lat])
          .addTo(map);

        if (onDestinationChanged) {
          destMarker.on('dragend', async () => {
            const lngLat = destMarker.getLngLat();
            const newCoord = { lat: lngLat.lat, lng: lngLat.lng };
            setCustomDestinationCoord(newCoord);
            const rev = await reverseGeocodeCoordinate(newCoord);
            onDestinationChanged(rev.shortName, newCoord);
          });
        }
        vectorDestinationMarkerRef.current = destMarker;
      }

      if (fitViewport && route.coordinates.length > 0) {
        let minLng = Infinity;
        let maxLng = -Infinity;
        let minLat = Infinity;
        let maxLat = -Infinity;
        for (const pt of route.coordinates) {
          if (pt.lng < minLng) minLng = pt.lng;
          if (pt.lng > maxLng) maxLng = pt.lng;
          if (pt.lat < minLat) minLat = pt.lat;
          if (pt.lat > maxLat) maxLat = pt.lat;
        }
        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat]
          ],
          {
            padding: { top: 68, bottom: 68, left: 48, right: 48 },
            maxZoom: 15.8,
            pitch: is3DPitchEnabled ? 42 : 0,
            duration: 900
          }
        );
      }
    },
    [cleanDestination, cleanPickup, is3DPitchEnabled, onDestinationChanged, onPickupChanged]
  );

  // Fallback Leaflet renderer with real oriented SVG directional arrows if WebGL/MapLibre is unavailable
  const renderLeafletFallbackRoute = useCallback(
    (
      map: L.Map,
      route: DrivingRoute,
      pickupCoord: MapCoordinate,
      destCoord: MapCoordinate,
      fitViewport: boolean
    ) => {
      leafletRouteLayerRef.current?.remove();
      const group = L.layerGroup().addTo(map);
      leafletRouteLayerRef.current = group;

      const latLngs: [number, number][] = route.coordinates.map((c) => [c.lat, c.lng]);
      // Dark outer casing
      L.polyline(latLngs, {
        color: '#0B1528',
        weight: 10,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);
      // Vibrant orange inner line
      const mainPoly = L.polyline(latLngs, {
        color: '#FF6500',
        weight: 6,
        opacity: 0.98,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(group);

      // Oriented directional arrows along the route
      for (const arrow of route.directionalArrows) {
        const icon = L.divIcon({
          className: 'mride-route-arrow-div',
          html: `<div style="width:20px;height:20px;border-radius:999px;background:#0B1528;border:1.5px solid #FFFFFF;display:flex;align-items:center;justify-content:center;transform:rotate(${arrow.bearingDegrees}deg);box-shadow:0 2px 5px rgba(0,0,0,0.3);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([arrow.coordinate.lat, arrow.coordinate.lng], {
          icon,
          interactive: false
        }).addTo(group);
      }

      // Pickup & Destination markers
      L.marker([pickupCoord.lat, pickupCoord.lng], {
        icon: L.divIcon({
          className: 'mride-pin',
          html: buildPickupPinDom(cleanPickup).outerHTML,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(group);

      L.marker([destCoord.lat, destCoord.lng], {
        icon: L.divIcon({
          className: 'mride-pin',
          html: buildDestinationPinDom(cleanDestination).outerHTML,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(group);

      if (fitViewport) {
        map.fitBounds(mainPoly.getBounds(), { padding: [48, 48], maxZoom: 16 });
      }
    },
    [cleanDestination, cleanPickup]
  );

  // Initialize Vector Map (MapLibre GL JS with OpenFreeMap Liberty 3D Vector Tiles, or Leaflet fallback)
  useEffect(() => {
    if (!mapElementRef.current) return;
    if (vectorMapRef.current || leafletFallbackMapRef.current) return;

    const maplibregl = window.maplibregl;
    if (maplibregl) {
      try {
        const vMap: MapLibreInstance = new maplibregl.Map({
          container: mapElementRef.current,
          style: getResolvedVectorStyleUrl(),
          center: [center.lng, center.lat],
          zoom: 13.5,
          pitch: 42,
          bearing: 0,
          antialias: true,
          attributionControl: false
        });

        vMap.on('rotate', () => {
          setCurrentBearing(Math.round(vMap.getBearing()));
        });

        vMap.on('zoom', () => {
          setCurrentZoomLevel(Number(vMap.getZoom().toFixed(1)));
        });

        vMap.on('dragstart', () => {
          setIsFollowingDriver(false);
        });

        vectorMapRef.current = vMap;
        const resizeTimer = window.setTimeout(() => vMap.resize(), 150);
        return () => {
          window.clearTimeout(resizeTimer);
          vMap.remove();
          vectorMapRef.current = null;
        };
      } catch {
        // Fallback to Leaflet if headless test environment lacks WebGL context
      }
    }

    const lMap = L.map(mapElementRef.current, { zoomControl: false }).setView(
      [center.lat, center.lng],
      13
    );
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(lMap);
    leafletFallbackMapRef.current = lMap;
    const resizeTimer = window.setTimeout(() => lMap.invalidateSize(), 120);
    return () => {
      window.clearTimeout(resizeTimer);
      lMap.remove();
      leafletFallbackMapRef.current = null;
    };
  }, [center]);

  // Handle interactive map click when user selects "Set Pickup on Map" or "Set Destination on Map"
  useEffect(() => {
    const vMap = vectorMapRef.current;
    if (!vMap || mapPinClickMode === 'none') return;

    const handleClick = async (e: any) => {
      if (!e?.lngLat) return;
      const clickedCoord: MapCoordinate = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      const rev = await reverseGeocodeCoordinate(clickedCoord);
      if (mapPinClickMode === 'pickup') {
        setCustomPickupCoord(clickedCoord);
        onPickupChanged?.(rev.shortName, clickedCoord);
      } else if (mapPinClickMode === 'destination') {
        setCustomDestinationCoord(clickedCoord);
        onDestinationChanged?.(rev.shortName, clickedCoord);
      }
      setMapPinClickMode('none');
    };

    vMap.on('click', handleClick);
  }, [mapPinClickMode, onDestinationChanged, onPickupChanged]);

  // Resize map smoothly when expanded/collapsed and keep route centered
  useEffect(() => {
    const triggerResizeAndFit = () => {
      vectorMapRef.current?.resize();
      leafletFallbackMapRef.current?.invalidateSize();
      if (activeRoute && activeRoute.coordinates.length > 0 && vectorMapRef.current) {
        let minLng = Infinity;
        let maxLng = -Infinity;
        let minLat = Infinity;
        let maxLat = -Infinity;
        for (const pt of activeRoute.coordinates) {
          if (pt.lng < minLng) minLng = pt.lng;
          if (pt.lng > maxLng) maxLng = pt.lng;
          if (pt.lat < minLat) minLat = pt.lat;
          if (pt.lat > maxLat) maxLat = pt.lat;
        }
        vectorMapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat]
          ],
          {
            padding: { top: 75, bottom: 75, left: 50, right: 50 },
            maxZoom: 15.8,
            pitch: is3DPitchEnabled ? 42 : 0,
            duration: 300
          }
        );
      }
    };

    const t1 = window.setTimeout(triggerResizeAndFit, 40);
    const t2 = window.setTimeout(triggerResizeAndFit, 220);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [activeRoute, is3DPitchEnabled, isExpanded]);

  // Geocode Pickup & Destination and calculate genuine OSRM driving route + directional arrows
  useEffect(() => {
    if (!cleanPickup || !cleanDestination) return;
    const controller = new AbortController();

    const routeTimer = window.setTimeout(async () => {
      setIsRouting(true);
      setRouteError('');
      try {
        const pickupPlace = customPickupCoord
          ? { coordinate: customPickupCoord, label: cleanPickup, shortName: cleanPickup }
          : await findPlace(cleanPickup, activeCity, country.name, controller.signal);

        const destPlace = customDestinationCoord
          ? { coordinate: customDestinationCoord, label: cleanDestination, shortName: cleanDestination }
          : await findPlace(cleanDestination, activeCity, country.name, controller.signal);

        const route = await getDrivingRoute(
          pickupPlace.coordinate,
          destPlace.coordinate,
          controller.signal
        );

        setActiveRoute(route);
        setRemainingDistanceMeters(route.distanceMeters);
        setRemainingDurationSeconds(route.durationSeconds);

        // Identify the first meaningful turn manoeuvre after depart
        const nextStep =
          route.steps.find((s) => s.maneuverType !== 'depart') || route.steps[0] || null;
        setActiveManeuver(nextStep);
        onRouteCalculated?.(route);

        // AI Voice Co-Pilot natural route guidance announcement when active navigation is enabled
        if (enableNavigationFollow && nextStep) {
          const distLabel =
            nextStep.distanceMeters >= 1000
              ? `${(nextStep.distanceMeters / 1000).toFixed(1)} kilometers`
              : `${Math.max(20, Math.round(nextStep.distanceMeters / 10) * 10)} meters`;
          AiVoiceCopilotService.speakGuidance(
            `Mride AI Navigation locked. In ${distLabel}, ${nextStep.instruction}. Total trip time ${Math.max(1, Math.round(route.durationSeconds / 60))} minutes.`
          );
        }

        const vMap = vectorMapRef.current;
        if (vMap) {
          const applyLayers = () =>
            renderVectorRouteAndArrows(
              vMap,
              route,
              pickupPlace.coordinate,
              destPlace.coordinate,
              true
            );
          if (vMap.isStyleLoaded()) {
            applyLayers();
          } else {
            vMap.on('load', applyLayers);
          }
        } else if (leafletFallbackMapRef.current) {
          renderLeafletFallbackRoute(
            leafletFallbackMapRef.current,
            route,
            pickupPlace.coordinate,
            destPlace.coordinate,
            true
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRouteError(error instanceof Error ? error.message : 'Route could not be calculated');
      } finally {
        if (!controller.signal.aborted) setIsRouting(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(routeTimer);
      controller.abort();
    };
  }, [
    activeCity,
    cleanDestination,
    cleanPickup,
    country.name,
    customDestinationCoord,
    customPickupCoord,
    onRouteCalculated,
    renderLeafletFallbackRoute,
    renderVectorRouteAndArrows
  ]);

  // Smooth Live Driver GPS Marker Update, Bearing Rotation, Route Progress & Off-Route Recalculation
  useEffect(() => {
    const vMap = vectorMapRef.current;
    const lMap = leafletFallbackMapRef.current;

    if (!driverLocation) {
      vectorDriverMarkerRef.current?.remove();
      vectorDriverMarkerRef.current = null;
      leafletDriverMarkerRef.current?.remove();
      leafletDriverMarkerRef.current = null;
      return;
    }

    // 1. Determine accurate vehicle heading (from GPS heading, or tangent along route, or movement delta)
    let resolvedHeading = driverHeadingDegrees ?? animatedDriverHeadingRef.current;
    if (
      (resolvedHeading === null || resolvedHeading === undefined) &&
      animatedDriverCoordRef.current &&
      computeDistanceMeters(animatedDriverCoordRef.current, driverLocation) >= 3
    ) {
      resolvedHeading = computeBearingDegrees(animatedDriverCoordRef.current, driverLocation);
    } else if (activeRoute && activeRoute.coordinates.length >= 2) {
      const { closestIndex } = findClosestRoutePoint(driverLocation, activeRoute.coordinates);
      const nextIdx = Math.min(activeRoute.coordinates.length - 1, closestIndex + 1);
      if (nextIdx > closestIndex) {
        resolvedHeading = computeBearingDegrees(
          activeRoute.coordinates[closestIndex],
          activeRoute.coordinates[nextIdx]
        );
      }
    }
    const targetHeading = resolvedHeading || 0;
    animatedDriverHeadingRef.current = targetHeading;

    // 2. Smoothly interpolate vehicle position over 450ms using requestAnimationFrame
    const startCoord = animatedDriverCoordRef.current || driverLocation;
    const targetCoord = driverLocation;
    const startTime = performance.now();
    const durationMs = 450;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animateStep = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = t * (2 - t); // easeOutQuad
      const currentLat = startCoord.lat + (targetCoord.lat - startCoord.lat) * eased;
      const currentLng = startCoord.lng + (targetCoord.lng - startCoord.lng) * eased;
      const interpolated = { lat: currentLat, lng: currentLng };
      animatedDriverCoordRef.current = interpolated;

      if (vMap && window.maplibregl) {
        if (!vectorDriverMarkerRef.current) {
          vectorDriverMarkerRef.current = new window.maplibregl.Marker({
            element: buildRotatingDriverCarDom(targetHeading),
            rotationAlignment: 'map',
            pitchAlignment: 'map'
          })
            .setLngLat([interpolated.lng, interpolated.lat])
            .addTo(vMap);
        } else {
          vectorDriverMarkerRef.current.setLngLat([interpolated.lng, interpolated.lat]);
          const el = vectorDriverMarkerRef.current.getElement() as HTMLElement | null;
          const rotator = el?.querySelector('.mride-driver-car-rotator') as HTMLElement | null;
          if (rotator) {
            rotator.style.transform = `rotate(${targetHeading}deg)`;
          }
        }
      } else if (lMap) {
        if (!leafletDriverMarkerRef.current) {
          leafletDriverMarkerRef.current = L.marker([interpolated.lat, interpolated.lng], {
            icon: L.divIcon({
              className: 'mride-driver-car',
              html: buildRotatingDriverCarDom(targetHeading).outerHTML,
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            })
          }).addTo(lMap);
        } else {
          leafletDriverMarkerRef.current.setLatLng([interpolated.lat, interpolated.lng]);
        }
      }

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animateStep);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateStep);

    // 3. Camera auto-follow during active navigation (unless user panned manually)
    if (isFollowingDriver && vMap) {
      vMap.easeTo({
        center: [driverLocation.lng, driverLocation.lat],
        bearing: targetHeading,
        pitch: is3DPitchEnabled ? 52 : 0,
        zoom: Math.max(vMap.getZoom(), 15.5),
        duration: 650
      });
    }

    // 4. Update remaining distance/ETA & check for > 65m route deviation to trigger automatic reroute
    if (activeRoute && activeRoute.coordinates.length >= 2) {
      const destCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
      const { closestIndex, distanceFromRouteMeters } = findClosestRoutePoint(
        driverLocation,
        activeRoute.coordinates
      );

      // Update upcoming manoeuvre banner based on driver's current position along route
      const upcomingStep = activeRoute.steps.find(
        (step) => computeDistanceMeters(driverLocation, step.location) > 25
      );
      if (upcomingStep) {
        setActiveManeuver(upcomingStep);
      }

      // Compute remaining distance along remaining polyline vertices
      let remMeters = computeDistanceMeters(driverLocation, activeRoute.coordinates[closestIndex]);
      for (let i = closestIndex; i < activeRoute.coordinates.length - 1; i++) {
        remMeters += computeDistanceMeters(
          activeRoute.coordinates[i],
          activeRoute.coordinates[i + 1]
        );
      }
      setRemainingDistanceMeters(remMeters);
      const speedMps = Math.max(
        6.5,
        activeRoute.distanceMeters / Math.max(60, activeRoute.durationSeconds)
      );
      setRemainingDurationSeconds(Math.round(remMeters / speedMps));

      // Automatic route recalculation if driver deviates > 65 meters from active route
      const nowMs = Date.now();
      if (distanceFromRouteMeters > 65 && nowMs - lastRerouteTimestampRef.current > 8000) {
        lastRerouteTimestampRef.current = nowMs;
        getDrivingRoute(driverLocation, destCoord)
          .then((rerouted) => {
            setActiveRoute(rerouted);
            setRemainingDistanceMeters(rerouted.distanceMeters);
            setRemainingDurationSeconds(rerouted.durationSeconds);
            if (rerouted.steps[0]) setActiveManeuver(rerouted.steps[0]);
            if (vMap && vMap.isStyleLoaded()) {
              renderVectorRouteAndArrows(vMap, rerouted, driverLocation, destCoord, false);
            }
          })
          .catch(() => {
            // Keep existing route if offline
          });
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    activeRoute,
    driverHeadingDegrees,
    driverLocation,
    is3DPitchEnabled,
    isFollowingDriver,
    renderVectorRouteAndArrows
  ]);

  const locateCurrentPosition = () => {
    if (!navigator.geolocation) {
      setRouteError('Location is unavailable in this browser. Search for a pickup instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const userCoord: MapCoordinate = { lat: coords.latitude, lng: coords.longitude };
        setRouteError('');
        if (vectorMapRef.current) {
          vectorMapRef.current.flyTo({
            center: [userCoord.lng, userCoord.lat],
            zoom: 16,
            pitch: is3DPitchEnabled ? 48 : 0,
            duration: 900
          });
        } else if (leafletFallbackMapRef.current) {
          leafletFallbackMapRef.current.setView([userCoord.lat, userCoord.lng], 16);
        }

        if (onPickupChanged) {
          setCustomPickupCoord(userCoord);
          const rev = await reverseGeocodeCoordinate(userCoord);
          onPickupChanged(rev.shortName, userCoord);
        }
      },
      (error) =>
        setRouteError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission denied. Tap "Pin Pickup" on the map or enter a pickup manually.'
            : 'Could not get your GPS location. Tap "Pin Pickup" on the map to choose accurately.'
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  };

  const handleRecenterRouteOrDriver = () => {
    const vMap = vectorMapRef.current;
    if (driverLocation && vMap) {
      setIsFollowingDriver(true);
      vMap.flyTo({
        center: [driverLocation.lng, driverLocation.lat],
        zoom: 16,
        pitch: is3DPitchEnabled ? 52 : 0,
        bearing: animatedDriverHeadingRef.current || 0,
        duration: 750
      });
      return;
    }

    if (activeRoute && activeRoute.coordinates.length > 0 && vMap) {
      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;
      for (const pt of activeRoute.coordinates) {
        if (pt.lng < minLng) minLng = pt.lng;
        if (pt.lng > maxLng) maxLng = pt.lng;
        if (pt.lat < minLat) minLat = pt.lat;
        if (pt.lat > maxLat) maxLat = pt.lat;
      }
      vMap.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        {
          padding: { top: 68, bottom: 68, left: 48, right: 48 },
          maxZoom: 15.8,
          pitch: is3DPitchEnabled ? 42 : 0,
          duration: 750
        }
      );
    }
  };

  const handleToggle3DPitch = () => {
    const next = !is3DPitchEnabled;
    setIs3DPitchEnabled(next);
    vectorMapRef.current?.easeTo({
      pitch: next ? 48 : 0,
      duration: 500
    });
  };

  const handleResetNorthBearing = () => {
    vectorMapRef.current?.easeTo({
      bearing: 0,
      duration: 450
    });
  };

  const renderManeuverIcon = (type?: ManeuverType) => {
    if (!type) return <Navigation className="h-4 w-4 text-[#FFE500]" />;
    if (type.includes('left')) return <CornerUpLeft className="h-4 w-4 text-[#FFE500]" />;
    if (type.includes('right')) return <CornerUpRight className="h-4 w-4 text-[#FFE500]" />;
    if (type === 'uturn' || type === 'roundabout') {
      return <RotateCcw className="h-4 w-4 text-[#FFE500]" />;
    }
    return <MoveUp className="h-4 w-4 text-[#FFE500]" />;
  };

  const displayDistanceKm =
    remainingDistanceMeters !== null
      ? (remainingDistanceMeters / 1000).toFixed(1)
      : activeRoute
      ? (activeRoute.distanceMeters / 1000).toFixed(1)
      : null;

  const displayEtaMinutes =
    remainingDurationSeconds !== null
      ? Math.max(1, Math.round(remainingDurationSeconds / 60))
      : activeRoute
      ? Math.max(1, Math.round(activeRoute.durationSeconds / 60))
      : null;

  const handleZoomIn = () => {
    vectorMapRef.current?.zoomIn();
    leafletFallbackMapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    vectorMapRef.current?.zoomOut();
    leafletFallbackMapRef.current?.zoomOut();
  };

  return (
    <div
      className={`isolate overflow-hidden border border-slate-200 bg-[#ECEFF4] shadow-sm transition-all duration-200 ${
        isExpanded
          ? 'fixed inset-2 sm:inset-4 z-[9995] rounded-3xl shadow-2xl flex flex-col'
          : `relative rounded-2xl ${heightClass}`
      }`}
    >
      {/* WebGL Vector Map Canvas */}
      <div
        ref={mapElementRef}
        className="w-full h-full flex-1 min-h-[220px]"
        role="application"
        aria-label={`Interactive vector navigation map for ${activeCity}`}
      />

      {/* Minimalist Non-Intrusive Top HUD: Compact Turn Pill + AI Voice Co-Pilot Speaker */}
      <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-10 flex items-start justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5 max-w-[76%]">
          {activeManeuver ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#0B1528]/90 backdrop-blur-md text-white px-2.5 py-1.5 shadow-md border border-white/15">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FF6500] text-white">
                {renderManeuverIcon(activeManeuver.maneuverType)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="font-extrabold text-[#FFE500]">
                    {activeManeuver.distanceMeters >= 1000
                      ? `${(activeManeuver.distanceMeters / 1000).toFixed(1)} km`
                      : `${Math.max(10, Math.round(activeManeuver.distanceMeters / 10) * 10)} m`}
                  </span>
                  { displayDistanceKm && displayEtaMinutes && (
                    <span className="text-slate-300 truncate">
                      • {displayDistanceKm} km ({displayEtaMinutes} min)
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] font-extrabold text-white leading-tight">
                  {activeManeuver.instruction}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVoice = !isAiVoiceEnabled;
                  setIsAiVoiceEnabled(nextVoice);
                  AiVoiceCopilotService.setVoiceEnabled(nextVoice);
                  if (nextVoice && activeManeuver) {
                    AiVoiceCopilotService.speakGuidance(
                      `${activeManeuver.instruction} on ${activeManeuver.roadName}. Remaining time ${displayEtaMinutes || 5} minutes.`,
                      true
                    );
                  }
                }}
                className={`ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  isAiVoiceEnabled
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'bg-white/10 border-white/15 text-slate-400'
                }`}
                title={isAiVoiceEnabled ? 'AI Voice Guidance ON (Tap to mute or replay)' : 'AI Voice Guidance Muted (Tap to enable)'}
              >
                {isAiVoiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-xs px-2.5 py-1 shadow-xs">
              <MapPin className="h-3 w-3 text-[#FF6500] shrink-0" />
              <span className="text-[10px] font-extrabold text-[#15191C]">
                {activeCity}
              </span>
              <span className="text-[10px] font-bold text-[#FF6500]">
                {isRouting
                  ? '• Routing…'
                  : displayDistanceKm && displayEtaMinutes
                  ? `• ${displayDistanceKm} km (~${displayEtaMinutes}m)`
                  : ''}
              </span>
            </div>
          )}
        </div>

        {/* Active Pin-Mode Prompt Banner */}
        {mapPinClickMode !== 'none' && (
          <button
            type="button"
            onClick={() => setMapPinClickMode('none')}
            className="pointer-events-auto rounded-xl bg-[#FF6500] text-white px-2.5 py-1 text-[10px] font-extrabold shadow-md"
          >
            Tap map to set {mapPinClickMode} ✕
          </button>
        )}
      </div>

      {routeError && (
        <div
          className="absolute left-2.5 right-12 top-14 z-20 rounded-xl border border-amber-200 bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm"
          role="status"
        >
          {routeError}
        </div>
      )}

      {/* Clean Collapsible Map Tools Drawer (Keeps Map View 100% Uncluttered) */}
      <div className="absolute right-2.5 bottom-12 z-20 flex flex-col items-end gap-1.5">
        {showMapToolsDrawer && (
          <div className="flex flex-col gap-1 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              type="button"
              onClick={handleZoomIn}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-[#15191C]"
              title="Zoom In"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-[#15191C]"
              title="Zoom Out"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleToggle3DPitch}
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black ${
                is3DPitchEnabled ? 'bg-[#0B1528] text-[#FFE500]' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Toggle 3D / 2D View"
            >
              {is3DPitchEnabled ? '3D' : '2D'}
            </button>
            {currentBearing !== 0 && (
              <button
                type="button"
                onClick={handleResetNorthBearing}
                className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-[#FF6500]"
                title="Reset North"
              >
                <Compass className="h-4 w-4" style={{ transform: `rotate(${-currentBearing}deg)` }} />
              </button>
            )}
            <button
              type="button"
              onClick={handleRecenterRouteOrDriver}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-700"
              title="Fit Route / Follow Driver"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={locateCurrentPosition}
              className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 text-[#FF6500]"
              title="My Current GPS Location"
            >
              <LocateFixed className="h-4 w-4" />
            </button>
            {onPickupChanged && (
              <button
                type="button"
                onClick={() => {
                  setMapPinClickMode((m) => (m === 'pickup' ? 'none' : 'pickup'));
                  setShowMapToolsDrawer(false);
                }}
                className="px-2 py-1 rounded-lg bg-[#FFF0E6] text-[#FF6500] text-[9px] font-extrabold"
              >
                Pin A
              </button>
            )}
            {onDestinationChanged && (
              <button
                type="button"
                onClick={() => {
                  setMapPinClickMode((m) => (m === 'destination' ? 'none' : 'destination'));
                  setShowMapToolsDrawer(false);
                }}
                className="px-2 py-1 rounded-lg bg-slate-100 text-[#0B1528] text-[9px] font-extrabold"
              >
                Pin B
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ultra-Slim Bottom Corner Actions (Map Tools Toggle + Fullscreen Expand) */}
      <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 z-10 flex items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-1.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-xs"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (activeManeuver) {
                AiVoiceCopilotService.speakGuidance(
                  `${activeManeuver.instruction}. Distance ${displayDistanceKm || 3} kilometers, about ${displayEtaMinutes || 6} minutes.`,
                  true
                );
              }
            }}
            className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-xs px-2.5 py-1 shadow-xs flex items-center gap-1.5 text-[10px] font-extrabold text-[#15191C] hover:border-[#FF6500]"
            title="Tap to hear AI Voice Route Briefing"
          >
            <Volume2 className="h-3 w-3 text-[#FF6500]" />
            <span className="truncate max-w-[165px]">
              {cleanPickup} → {cleanDestination}
            </span>
          </button>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const nextReal = !isRealViewSatellite;
              setIsRealViewSatellite(nextReal);
              const vMap = vectorMapRef.current;
              if (vMap && (vMap as any).setPaintProperty && vMap.getLayer('mride-real-satellite-layer')) {
                (vMap as any).setPaintProperty(
                  'mride-real-satellite-layer',
                  'raster-opacity',
                  nextReal ? 0.95 : 0
                );
              }
              if (nextReal && vMap) {
                vMap.easeTo({ zoom: Math.max(vMap.getZoom(), 16.2), pitch: 48, duration: 600 });
              }
            }}
            className={`flex h-8 px-2.5 items-center gap-1.5 rounded-xl border text-[10px] font-extrabold shadow-xs transition-all ${
              isRealViewSatellite
                ? 'bg-[#FF6500] text-white border-[#FF6500]'
                : 'bg-white/95 text-[#15191C] border-slate-200 hover:border-[#FF6500]'
            }`}
            title="Real Aerial Satellite View Switch (ON / OFF)"
          >
            <span>Real View:</span>
            <span className={`px-1 py-0.5 rounded text-[9px] font-black ${
              isRealViewSatellite ? 'bg-white text-[#FF6500]' : 'bg-slate-100 text-slate-600'
            }`}>
              {isRealViewSatellite ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowMapToolsDrawer((prev) => !prev)}
            className={`flex h-8 px-2.5 items-center gap-1 rounded-xl border text-[10px] font-extrabold shadow-xs transition-all ${
              showMapToolsDrawer
                ? 'bg-[#0B1528] text-white border-[#0B1528]'
                : 'bg-white/90 text-[#15191C] border-slate-200 hover:border-[#FF6500]'
            }`}
            title="Map Tools (Zoom, 3D, GPS, Pin Drop)"
          >
            <SlidersHorizontal className="h-3 w-3 text-[#FF6500]" />
            <span>Tools</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-700 shadow-xs hover:text-[#15191C]"
            title={isExpanded ? 'Minimize map' : 'Full-screen map'}
            aria-label={isExpanded ? 'Close expanded map' : 'Expand map'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

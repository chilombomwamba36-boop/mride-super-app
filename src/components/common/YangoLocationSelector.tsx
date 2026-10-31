import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  ArrowUpDown, 
  Plus, 
  X, 
  Crosshair, 
  Clock, 
  Building2,
  Navigation,
  Check
} from 'lucide-react';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';
import {
  LUSAKA_VERIFIED_PLACES,
  reverseGeocodeCoordinate,
  searchPlacesAutocomplete
} from '../../services/mapRouting';

interface LocationSelectorProps {
  pickup: string;
  setPickup: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  hasIntermediateStop: boolean;
  setHasIntermediateStop: (val: boolean) => void;
  intermediateStop: string;
  setIntermediateStop: (val: string) => void;
  activeCity: string;
  country?: CountryConfig;
  disabled?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  pickup,
  setPickup,
  destination,
  setDestination,
  hasIntermediateStop,
  setHasIntermediateStop,
  intermediateStop,
  setIntermediateStop,
  activeCity,
  country = DEFAULT_COUNTRY,
  disabled = false
}) => {
  // Active focus state: 'pickup' | 'stop' | 'destination' | null
  const [activeInput, setActiveInput] = useState<'pickup' | 'stop' | 'destination' | null>(null);
  
  // Search text queries
  const [pickupQuery, setPickupQuery] = useState(pickup);
  const [destQuery, setDestQuery] = useState(destination);
  const [stopQuery, setStopQuery] = useState(intermediateStop);
  const [isLocating, setIsLocating] = useState(false);
  const [liveRemoteSuggestions, setLiveRemoteSuggestions] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal search query if external prop changes
  useEffect(() => {
    setPickupQuery(pickup);
  }, [pickup]);

  useEffect(() => {
    setDestQuery(destination);
  }, [destination]);

  useEffect(() => {
    setStopQuery(intermediateStop);
  }, [intermediateStop]);

  // Click outside listener to dismiss suggestion dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const verifiedCityLandmarks = LUSAKA_VERIFIED_PLACES.filter(
    (p) => p.city.toLowerCase() === activeCity.toLowerCase()
  ).map((p) => p.shortName);

  const cityHubs = [
    ...new Set([
      ...verifiedCityLandmarks,
      country.defaultPickup,
      country.defaultDestination,
      ...country.mapStreets.map((street) => `${street}, ${activeCity}`),
      ...country.recentDestinations.map((destination) => destination.name)
    ])
  ];

  // Filter recommendations based on active field's query + live geocoded results
  const getFilteredSuggestions = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return cityHubs.slice(0, 10);
    }
    const matched = cityHubs.filter((hub) => hub.toLowerCase().includes(q));
    return [...new Set([...matched, ...liveRemoteSuggestions])].slice(0, 10);
  };

  // Query live Nominatim / Lusaka geocoder when typing >= 3 characters
  useEffect(() => {
    if (!activeInput) return;
    const q =
      activeInput === 'pickup'
        ? pickupQuery
        : activeInput === 'stop'
        ? stopQuery
        : destQuery;
    if (q.trim().length < 3) {
      setLiveRemoteSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const results = await searchPlacesAutocomplete(
        q,
        activeCity,
        country.name,
        controller.signal
      );
      setLiveRemoteSuggestions(results.map((r) => r.shortName));
    }, 320);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeCity, activeInput, country.name, destQuery, pickupQuery, stopQuery]);

  // Swap pickup and destination.
  const handleSwap = () => {
    if (disabled) return;
    const tempPickup = pickup;
    const tempPickupQuery = pickupQuery;
    setPickup(destination);
    setPickupQuery(destQuery);
    setDestination(tempPickup);
    setDestQuery(tempPickupQuery);
  };

  // Handle GPS geo-locate with real reverse geocoding
  const handleUseCurrentLocation = () => {
    if (disabled) return;
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const rev = await reverseGeocodeCoordinate({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setIsLocating(false);
          const currentLabel = rev.shortName || `Current Location (${activeCity})`;
          setPickup(currentLabel);
          setPickupQuery(currentLabel);
          setActiveInput(null);
        },
        () => {
          setIsLocating(false);
          const currentLabel = `Current Location (${cityHubs[0]})`;
          setPickup(currentLabel);
          setPickupQuery(currentLabel);
          setActiveInput(null);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      const currentLabel = `Current Location (${activeCity} CBD)`;
      setPickup(currentLabel);
      setPickupQuery(currentLabel);
      setActiveInput(null);
    }
  };

  const handleSelectLocation = (
    type: 'pickup' | 'stop' | 'destination',
    locName: string
  ) => {
    if (type === 'pickup') {
      setPickup(locName);
      setPickupQuery(locName);
    } else if (type === 'stop') {
      setIntermediateStop(locName);
      setStopQuery(locName);
    } else {
      setDestination(locName);
      setDestQuery(locName);
    }
    setActiveInput(null);
  };

  const currentQuery = 
    activeInput === 'pickup' 
      ? pickupQuery 
      : activeInput === 'stop' 
        ? stopQuery 
        : destQuery;

  const suggestions = getFilteredSuggestions(currentQuery);

  return (
    <div ref={containerRef} className="relative space-y-3">
      {/* Connected pickup and destination fields */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative">
        <div className="flex items-stretch gap-3">
          {/* Left Vertical Route Connector Visual */}
          <div className="flex flex-col items-center justify-between py-3 px-1 select-none">
            {/* Pickup Orange Circle */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#0F766E] ring-4 ring-teal-100 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Connecting Vertical Dotted Line */}
            <div className="w-0.5 flex-1 my-1 border-l-2 border-dashed border-slate-300" />

            {/* Optional Intermediate Stop Pin */}
            {hasIntermediateStop && (
              <>
                <div className="w-3 h-3 rounded-full bg-slate-400 ring-2 ring-slate-100 shrink-0" />
                <div className="w-0.5 flex-1 my-1 border-l-2 border-dashed border-slate-300" />
              </>
            )}

            {/* Destination Black / Dark Navy Square */}
            <div className="w-3.5 h-3.5 rounded-md bg-[#1A3038] ring-4 ring-slate-100 flex items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-xs bg-white" />
            </div>
          </div>

          {/* Center Column: Inputs */}
          <div className="flex-1 space-y-2.5">
            {/* PICKUP INPUT */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  Pickup Point
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1 transition-colors"
                >
                  <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Use current location'}</span>
                </button>
              </div>

              <div className="relative mt-0.5 flex items-center">
                <input
                  type="text"
                  disabled={disabled}
                  value={pickupQuery}
                  onFocus={() => setActiveInput('pickup')}
                  onChange={(e) => {
                    setPickupQuery(e.target.value);
                    setPickup(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSelectLocation('pickup', pickupQuery);
                    }
                  }}
                  placeholder="Where from? (any street, compound, plot, landmark)"
                  className="w-full bg-[#F4F7F7] hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#0F766E] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all pr-8"
                />
                {pickupQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setPickupQuery('');
                      setPickup('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* INTERMEDIATE STOP (OPTIONAL) */}
            {hasIntermediateStop && (
              <div className="relative pt-0.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Stop 1 (+ZMW 20)
                  </label>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setHasIntermediateStop(false)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Remove Stop
                  </button>
                </div>

                <div className="relative mt-0.5 flex items-center">
                  <input
                    type="text"
                    disabled={disabled}
                    value={stopQuery}
                    onFocus={() => setActiveInput('stop')}
                    onChange={(e) => {
                      setStopQuery(e.target.value);
                      setIntermediateStop(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectLocation('stop', stopQuery);
                      }
                    }}
                    placeholder="Drop a friend, pick keys, quick stop..."
                    className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#0F766E] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all pr-8"
                  />
                  {stopQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setStopQuery('');
                        setIntermediateStop('');
                      }}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* DESTINATION INPUT */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  Destination
                </label>
                {!hasIntermediateStop && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setHasIntermediateStop(true);
                      setActiveInput('stop');
                    }}
                    className="text-[11px] font-bold text-[#0F1E36] hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Stop
                  </button>
                )}
              </div>

              <div className="relative mt-0.5 flex items-center">
                <input
                  type="text"
                  disabled={disabled}
                  value={destQuery}
                  onFocus={() => setActiveInput('destination')}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setDestination(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSelectLocation('destination', destQuery);
                    }
                  }}
                  placeholder={`Where to in ${activeCity}?`}
                  className="w-full bg-[#F4F7F7] hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#0F766E] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all pr-8"
                />
                {destQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestQuery('');
                      setDestination('');
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Invert / Swap Button */}
          <div className="flex items-center">
            <button
              type="button"
              disabled={disabled}
              onClick={handleSwap}
              title="Swap pickup and destination"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#E5F3F1] text-slate-700 hover:text-[#0F766E] transition-colors border border-slate-200 active:scale-95"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggestion Autocomplete Dropdown Popover */}
        {activeInput && (
          <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header info */}
            <div className="bg-[#E5F3F1] text-[#1A3038] p-3 px-4 flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#0F766E]" />
                Select or type a place in {activeCity}, {country.name}
              </span>
              <button 
                onClick={() => setActiveInput(null)} 
                className="text-slate-500 hover:text-slate-900 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Allow addresses that are not in the configured suggestion list. */}
            {currentQuery.trim().length > 0 && (
              <button
                type="button"
                onClick={() => handleSelectLocation(activeInput, currentQuery.trim())}
                className="w-full text-left p-3.5 px-4 bg-[#F4F7F7] hover:bg-[#E5F3F1] flex items-center gap-3 transition-colors border-b border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1A3038] truncate">
                    Set Exact Address: "{currentQuery.trim()}"
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Use this custom place in {activeCity}, {country.name}
                  </p>
                </div>
              </button>
            )}

            {/* Suggestions List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
              {suggestions.map((hub) => {
                const isSelected = 
                  (activeInput === 'pickup' && pickup === hub) ||
                  (activeInput === 'stop' && intermediateStop === hub) ||
                  (activeInput === 'destination' && destination === hub);

                return (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => handleSelectLocation(activeInput, hub)}
                    className={`w-full text-left p-3 px-4 hover:bg-slate-50 flex items-center gap-3 transition-colors ${
                      isSelected ? 'bg-[#E5F3F1] font-semibold text-[#0F625C]' : 'text-slate-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-slate-900 truncate">
                        {hub}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {activeCity}, {country.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick destination suggestions */}
      <div>
        <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
                <span>Popular places in {activeCity}:</span>
        </p>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {cityHubs.slice(0, 6).map((hub) => (
            <button
              key={hub}
              type="button"
              disabled={disabled}
              onClick={() => {
                setDestination(hub);
                setDestQuery(hub);
              }}
              className="bg-white hover:bg-[#E5F3F1] hover:text-[#0F625C] border border-slate-200 text-slate-700 text-[11px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 flex items-center gap-1"
            >
              <Building2 className="w-2.5 h-2.5 text-[#0F766E]" />
              <span>{hub.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import { ZambianCity } from '../types';

export interface LocationCoordinate {
  lat: number;
  lng: number;
}

export interface PricingQuoteResult {
  distanceKm: number;
  durationMinutes: number;
  surgeMultiplier: number;
  surgeReason: string;
  isPeakHour: boolean;
  peakPeriodName: 'Morning Rush' | 'Evening Rush' | 'Late Night' | 'Standard Off-Peak';
  recommendedFareZMW: number;
  minAllowedFareZMW: number; 
  breakdown: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    peakSurgeCost: number;
    intermediateStopCost: number;
    acCost: number;
  };
}

// Known coordinates for Zambian landmarks across Lusaka & provinces
export const ZAMBIAN_LANDMARK_COORDINATES: Record<string, LocationCoordinate> = {
  // Lusaka
  'cavendish university': { lat: -15.3885, lng: 28.2810 },
  'manda hill': { lat: -15.3992, lng: 28.3090 },
  'eastpark mall': { lat: -15.3905, lng: 28.3241 },
  'levy junction': { lat: -15.4190, lng: 28.2880 },
  'cairo road': { lat: -15.4210, lng: 28.2830 },
  'woodlands': { lat: -15.4370, lng: 28.3320 },
  'pinnacle mall': { lat: -15.4410, lng: 28.3390 },
  'kabulonga': { lat: -15.4220, lng: 28.3470 },
  'crossroads': { lat: -15.4250, lng: 28.3490 },
  'northmead': { lat: -15.4050, lng: 28.2950 },
  'rhodes park': { lat: -15.4110, lng: 28.3020 },
  'longacres': { lat: -15.4180, lng: 28.3140 },
  'unza': { lat: -15.3920, lng: 28.3310 },
  'uth': { lat: -15.4300, lng: 28.3120 },
  'intercity': { lat: -15.4280, lng: 28.2910 },
  'soweto': { lat: -15.4230, lng: 28.2740 },
  'city market': { lat: -15.4215, lng: 28.2770 },
  'kamwala': { lat: -15.4320, lng: 28.2880 },
  'kabwata': { lat: -15.4350, lng: 28.3050 },
  'chilenje': { lat: -15.4520, lng: 28.3380 },
  'kalingalinga': { lat: -15.4120, lng: 28.3270 },
  'chelstone': { lat: -15.3650, lng: 28.3750 },
  'avondale': { lat: -15.3690, lng: 28.3890 },
  'ibex hill': { lat: -15.4260, lng: 28.3820 },
  'salama park': { lat: -15.3850, lng: 28.3680 },
  'roma park': { lat: -15.3780, lng: 28.3180 },
  'kalundu': { lat: -15.3880, lng: 28.3260 },
  'olympia': { lat: -15.3920, lng: 28.2990 },
  'matero': { lat: -15.3780, lng: 28.2610 },
  'chawama': { lat: -15.4620, lng: 28.2750 },
  'kanyama': { lat: -15.4410, lng: 28.2520 },
  'makeni': { lat: -15.4550, lng: 28.2580 },
  'lilayi': { lat: -15.5200, lng: 28.3050 },
  'chilanga': { lat: -15.5670, lng: 28.2710 },
  'silverest': { lat: -15.3500, lng: 28.4600 },
  'state lodge': { lat: -15.4650, lng: 28.4200 },
  '10 miles': { lat: -15.2800, lng: 28.2400 },
  'kaunda square': { lat: -15.3700, lng: 28.3500 },
  'garden': { lat: -15.3950, lng: 28.2850 },
  'bauleni': { lat: -15.4450, lng: 28.3550 },
  'mandevu': { lat: -15.3850, lng: 28.2800 },
  'kkia': { lat: -15.3308, lng: 28.4526 },

  // Copperbelt & Provincial Hubs
  'kitwe': { lat: -12.8024, lng: 28.2132 },
  'ecl mall': { lat: -12.8090, lng: 28.2150 },
  'mukuba mall': { lat: -12.8120, lng: 28.2210 },
  'cbu': { lat: -12.7950, lng: 28.2380 },
  'ndola': { lat: -12.9691, lng: 28.6366 },
  'kafubu mall': { lat: -12.9750, lng: 28.6410 },
  'livingstone': { lat: -17.8419, lng: 25.8543 },
  'victoria falls': { lat: -17.9243, lng: 25.8559 },
  'kabwe': { lat: -14.4469, lng: 28.4464 },
  'chipata': { lat: -13.6333, lng: 32.6500 },
  'solwezi': { lat: -12.1833, lng: 26.4000 },
  'choma': { lat: -16.8080, lng: 26.9875 },
  'kasama': { lat: -10.2129, lng: 31.1808 },
  'mongu': { lat: -15.2484, lng: 23.1274 }
};

// Haversine distance calculator in kilometers
function getHaversineDistanceKm(c1: LocationCoordinate, c2: LocationCoordinate): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawKm = R * c;
  // Road transit multiplier (roads in Zambian cities are ~1.32x direct air distance)
  return Math.max(1.5, Math.round(rawKm * 1.32 * 10) / 10);
}

// Find matching coordinates by fuzzy keyword match
function resolveLocationCoordinate(locName: string, city: ZambianCity): LocationCoordinate {
  const clean = locName.toLowerCase();
  for (const [key, coord] of Object.entries(ZAMBIAN_LANDMARK_COORDINATES)) {
    if (clean.includes(key)) {
      return coord;
    }
  }
  // Default to city center with slight pseudorandom jitter based on string length
  const defaultCityCenter = ZAMBIAN_LANDMARK_COORDINATES[city.toLowerCase()] || ZAMBIAN_LANDMARK_COORDINATES['cairo road'];
  const hash = locName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) * 0.0007;
  const lngOffset = (((hash * 3) % 100) - 50) * 0.0007;
  return {
    lat: defaultCityCenter.lat + latOffset,
    lng: defaultCityCenter.lng + lngOffset
  };
}

export class PricingEngineService {
  /**
   * Determine Zambian Peak Hours / Surge based on local CAT time (UTC+2)
   */
  public static getPeakHourStatus(customTime?: Date): {
    multiplier: number;
    reason: string;
    isPeak: boolean;
    period: 'Morning Rush' | 'Evening Rush' | 'Late Night' | 'Standard Off-Peak';
  } {
    const now = customTime || new Date();
    // Convert to Central Africa Time (CAT) = UTC+2 (Zambia time zone)
    const utcHours = now.getUTCHours();
    const catHours = (utcHours + 2) % 24;
    const catMinutes = now.getUTCMinutes();
    const timeDec = catHours + catMinutes / 60;

    // Morning Rush Peak: 07:00 - 09:30
    if (timeDec >= 7.0 && timeDec <= 9.5) {
      return {
        multiplier: 1.25,
        reason: 'Morning Commute Peak (07:00 - 09:30) • High passenger demand',
        isPeak: true,
        period: 'Morning Rush'
      };
    }

    // Evening Rush Peak: 16:30 - 19:30
    if (timeDec >= 16.5 && timeDec <= 19.5) {
      return {
        multiplier: 1.30,
        reason: 'Evening Rush Hour (16:30 - 19:30) • High traffic and heavy demand',
        isPeak: true,
        period: 'Evening Rush'
      };
    }

    // Late Night Shift: 22:00 - 05:00
    if (timeDec >= 22.0 || timeDec < 5.0) {
      return {
        multiplier: 1.15,
        reason: 'Late Night Transit (22:00 - 05:00) • Night driver availability tariff',
        isPeak: true,
        period: 'Late Night'
      };
    }

    // Standard Off-Peak Fair Pricing
    return {
      multiplier: 1.0,
      reason: 'Standard Off-Peak Fair Price • Optimal driver supply',
      isPeak: false,
      period: 'Standard Off-Peak'
    };
  }

  /**
  * Calculate the city's dynamic fare estimate
   */
  public static calculateDynamicFare({
    pickup,
    destination,
    city,
    vehicleType,
    hasIntermediateStop = false,
    needAC = false,
    simulatedTime
  }: {
    pickup: string;
    destination: string;
    city: ZambianCity;
    vehicleType: 'boda' | 'standard' | 'comfort' | 'xl';
    hasIntermediateStop?: boolean;
    needAC?: boolean;
    simulatedTime?: Date;
  }): PricingQuoteResult {
    const c1 = resolveLocationCoordinate(pickup, city);
    const c2 = resolveLocationCoordinate(destination, city);

    let distanceKm = getHaversineDistanceKm(c1, c2);
    // Realistic short distance handling: if coordinates match or are adjacent, default to 1.2 km short neighborhood hop
    if (distanceKm < 0.5) {
      distanceKm = 1.2;
    }

    // Estimated duration based on average Zambian urban speeds (~26 km/h with traffic)
    const durationMinutes = Math.max(3, Math.round((distanceKm / 26) * 60));

    const peakInfo = this.getPeakHourStatus(simulatedTime);

    // Rate card by vehicle tier (Zambian Kwacha ZMW) - Strict K22 minimum fare floor for nearby trips
    // Short trips (e.g. <= 2.5 km) calculate starting from K22 baseline
    const rateCards = {
      boda: { base: 12, perKm: 2.0, perMin: 0.3, minFloor: 22 },
      standard: { base: 15, perKm: 3.0, perMin: 0.5, minFloor: 22 },
      comfort: { base: 28, perKm: 4.5, perMin: 0.8, minFloor: 40 },
      xl: { base: 45, perKm: 6.5, perMin: 1.0, minFloor: 60 }
    };

    const card = rateCards[vehicleType];

    const baseFare = card.base;
    const distanceCost = Math.round(distanceKm * card.perKm);
    const timeCost = Math.round(durationMinutes * card.perMin);
    const subtotal = baseFare + distanceCost + timeCost;

    const surgedSubtotal = Math.round(subtotal * peakInfo.multiplier);
    const peakSurgeCost = surgedSubtotal - subtotal;

    const intermediateStopCost = hasIntermediateStop ? 10 : 0;
    const acCost = needAC ? 10 : 0;

    const rawTotal = surgedSubtotal + intermediateStopCost + acCost;
    // For short trips, ensure fare strictly starts at K22 regulatory minimum floor
    const recommendedFareZMW = Math.max(22, card.minFloor, Math.round(rawTotal));
    const minAllowedFareZMW = Math.max(22, card.minFloor, Math.round(recommendedFareZMW * 0.8));

    return {
      distanceKm,
      durationMinutes,
      surgeMultiplier: peakInfo.multiplier,
      surgeReason: peakInfo.reason,
      isPeakHour: peakInfo.isPeak,
      peakPeriodName: peakInfo.period,
      recommendedFareZMW,
      minAllowedFareZMW,
      breakdown: {
        baseFare,
        distanceCost,
        timeCost,
        peakSurgeCost,
        intermediateStopCost,
        acCost
      }
    };
  }
}

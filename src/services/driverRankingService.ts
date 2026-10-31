import { DriverBid } from '../types';
import { INITIAL_DRIVER_BIDS } from '../data/mockData';

const DRIVER_RANKING_STORAGE_KEY = 'mrides_driver_rankings_v1';

export interface DriverRatingRecord {
  driverId: string;
  driverName: string;
  driverPhoto: string;
  driverPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  averageRating: number;
  totalRatingsCount: number;
  fiveStarCount: number;
  totalTrips: number;
  priorityTier: 'Top Rated Priority (+40% Orders)' | 'Gold Priority (+25% Orders)' | 'Standard Dispatch';
  allocatedOrdersToday: number;
  recentCompliments: string[];
}

const DEFAULT_DRIVER_RANKINGS: DriverRatingRecord[] = [
  {
    driverId: 'bid_drv_1',
    driverName: 'Chanda M.',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    driverPhone: '+260 97 781 2940',
    vehicleModel: 'Toyota Axio • White',
    vehiclePlate: 'BAC 1234',
    averageRating: 4.92,
    totalRatingsCount: 320,
    fiveStarCount: 298,
    totalTrips: 320,
    priorityTier: 'Top Rated Priority (+40% Orders)',
    allocatedOrdersToday: 18,
    recentCompliments: ['Good Communication', 'Nice Smell in Car', 'Polite & Respectful', 'Spotless Clean Car']
  },
  {
    driverId: 'bid_drv_2',
    driverName: 'Mwamba K.',
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    driverPhone: '+260 96 612 8871',
    vehicleModel: 'Honda Fit • Silver',
    vehiclePlate: 'BLA 8492',
    averageRating: 4.81,
    totalRatingsCount: 210,
    fiveStarCount: 182,
    totalTrips: 210,
    priorityTier: 'Gold Priority (+25% Orders)',
    allocatedOrdersToday: 13,
    recentCompliments: ['Good Communication', 'Fast Pickup & Great Route']
  },
  {
    driverId: 'bid_drv_3',
    driverName: 'Blessings P.',
    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    driverPhone: '+260 95 554 3219',
    vehicleModel: 'Toyota Vitz • Grey',
    vehiclePlate: 'BAV 3819',
    averageRating: 4.72,
    totalRatingsCount: 180,
    fiveStarCount: 145,
    totalTrips: 180,
    priorityTier: 'Standard Dispatch',
    allocatedOrdersToday: 9,
    recentCompliments: ['Polite & Respectful']
  }
];

function computePriorityTier(
  avgRating: number,
  fiveStars: number
): DriverRatingRecord['priorityTier'] {
  if (avgRating >= 4.88 && fiveStars >= 250) {
    return 'Top Rated Priority (+40% Orders)';
  }
  if (avgRating >= 4.78 && fiveStars >= 150) {
    return 'Gold Priority (+25% Orders)';
  }
  return 'Standard Dispatch';
}

export class DriverRankingService {
  public static getDriverRankings(): DriverRatingRecord[] {
    try {
      const raw = localStorage.getItem(DRIVER_RANKING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DriverRatingRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.sortByPriority(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
    return this.sortByPriority([...DEFAULT_DRIVER_RANKINGS]);
  }

  /**
   * Sort drivers by rating score + five-star volume so highest-rated drivers
   * receive priority order allocation first.
   */
  public static sortByPriority(records: DriverRatingRecord[]): DriverRatingRecord[] {
    return [...records].sort((a, b) => {
      const scoreA = a.averageRating * 100 + a.fiveStarCount * 0.15;
      const scoreB = b.averageRating * 100 + b.fiveStarCount * 0.15;
      return scoreB - scoreA;
    });
  }

  /**
   * Record a passenger's post-trip rating for a driver and recalculate
   * their priority order allocation.
   */
  public static submitDriverRating(params: {
    driverId: string;
    driverName: string;
    stars: number;
    compliments: string[];
    comment?: string;
  }): DriverRatingRecord {
    const records = this.getDriverRankings();
    const idx = records.findIndex(
      (r) => r.driverId === params.driverId || r.driverName === params.driverName
    );

    const target = idx >= 0 ? { ...records[idx] } : { ...DEFAULT_DRIVER_RANKINGS[0] };
    const clampedStars = Math.max(1, Math.min(5, params.stars));

    const newTotalCount = target.totalRatingsCount + 1;
    const newAverage =
      Math.round(
        ((target.averageRating * target.totalRatingsCount + clampedStars) / newTotalCount) * 100
      ) / 100;
    const newFiveStars = target.fiveStarCount + (clampedStars === 5 ? 1 : 0);
    const newTier = computePriorityTier(newAverage, newFiveStars);

    // Drivers rated 4 or 5 stars immediately receive additional priority order allocation
    const bonusOrders = clampedStars === 5 ? 3 : clampedStars === 4 ? 1 : 0;

    const updatedRecord: DriverRatingRecord = {
      ...target,
      averageRating: newAverage,
      totalRatingsCount: newTotalCount,
      fiveStarCount: newFiveStars,
      totalTrips: target.totalTrips + 1,
      priorityTier: newTier,
      allocatedOrdersToday: target.allocatedOrdersToday + bonusOrders,
      recentCompliments: Array.from(
        new Set([...params.compliments, ...target.recentCompliments])
      ).slice(0, 5)
    };

    if (idx >= 0) {
      records[idx] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }

    const sorted = this.sortByPriority(records);
    try {
      localStorage.setItem(DRIVER_RANKING_STORAGE_KEY, JSON.stringify(sorted));
      window.dispatchEvent(new CustomEvent('mrides:driver-ratings-updated'));
    } catch {
      // ignore
    }

    return updatedRecord;
  }

  /**
   * Build prioritized DriverBids for incoming passenger requests, ranked so
   * drivers with the highest ratings and most 5-star reviews appear at the top.
   */
  public static getPrioritizedDriverBids(proposedFareZMW: number, minFareZMW: number): DriverBid[] {
    const ranked = this.getDriverRankings();
    return ranked.map((rec, index) => {
      const baseBid = INITIAL_DRIVER_BIDS.find((b) => b.driverName === rec.driverName) || INITIAL_DRIVER_BIDS[0];
      const fareAdjustment = index === 0 ? 0 : index === 1 ? 5 : -5;
      return {
        ...baseBid,
        id: rec.driverId,
        driverName: rec.driverName,
        driverPhoto: rec.driverPhoto,
        driverPhone: rec.driverPhone,
        vehicleModel: rec.vehicleModel,
        vehiclePlate: rec.vehiclePlate,
        rating: rec.averageRating,
        totalTrips: rec.totalRatingsCount,
        offeredFareZMW: Math.max(minFareZMW, proposedFareZMW + fareAdjustment),
        status: fareAdjustment > 0 ? 'countered' : 'pending'
      };
    });
  }
}

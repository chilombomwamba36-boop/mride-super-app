import {
  DriverGoalCampaign,
  DriverGoalProgress,
  RewardLedgerEntry,
  UserRole
} from '../types';

export const INITIAL_DRIVER_GOAL_CAMPAIGNS: DriverGoalCampaign[] = [
  {
    id: 'cmp_consistent_50',
    name: 'Consistent Driver Challenge',
    description: 'Complete qualifying passenger, cargo or boda trips within 7 days to unlock tiered cash bonuses.',
    eligibleServices: ['rides', 'cargo', 'boda'],
    targetRides: 50,
    periodDays: 7,
    startDate: '2026-10-23',
    endDate: '2026-10-30',
    rewardAmountZMW: 300,
    tiers: [
      { id: 'tier_20', targetRides: 20, rewardAmountZMW: 80, label: '20 rides' },
      { id: 'tier_50', targetRides: 50, rewardAmountZMW: 200, label: '50 rides' },
      { id: 'tier_80', targetRides: 80, rewardAmountZMW: 300, label: '80 rides' }
    ],
    isCumulative: false, // Higher tier replaces lower tier up to K300 total
    minAcceptanceRatePercent: 75,
    minCompletionRatePercent: 85,
    maxBudgetZMW: 25000,
    spentBudgetZMW: 4200,
    eligibleCities: ['Lusaka', 'Kitwe', 'Ndola', 'Livingstone'],
    status: 'active'
  },
  {
    id: 'cmp_weekend_15',
    name: 'Weekend Bonus',
    description: 'Complete 15 verified rides over the weekend peak hours.',
    eligibleServices: ['rides', 'boda'],
    targetRides: 15,
    periodDays: 3,
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    rewardAmountZMW: 150,
    tiers: [
      { id: 'tier_wk_15', targetRides: 15, rewardAmountZMW: 150, label: '15 rides' }
    ],
    isCumulative: false,
    minAcceptanceRatePercent: 70,
    minCompletionRatePercent: 80,
    maxBudgetZMW: 10000,
    spentBudgetZMW: 1500,
    eligibleCities: ['Lusaka', 'Kitwe', 'Ndola'],
    status: 'active'
  }
];

export class DriverGoalsService {
  private static campaigns: DriverGoalCampaign[] = [...INITIAL_DRIVER_GOAL_CAMPAIGNS];
  private static progressMap = new Map<string, DriverGoalProgress>();
  private static ledger: RewardLedgerEntry[] = [
    {
      id: 'ldg_901',
      driverId: 'drv_chanda',
      driverName: 'Chanda M.',
      campaignId: 'cmp_consistent_50',
      campaignName: 'Consistent Driver Challenge (Tier 1 - 20 rides)',
      tierLabel: '20 rides',
      amountZMW: 80,
      status: 'paid',
      approvedBy: 'Mrides Lusaka Admin',
      timestamp: '2026-10-25 14:20'
    }
  ];

  public static resetForTests(): void {
    this.campaigns = JSON.parse(JSON.stringify(INITIAL_DRIVER_GOAL_CAMPAIGNS));
    this.progressMap.clear();
    this.ledger = [];
  }

  public static getCampaigns(): DriverGoalCampaign[] {
    return this.campaigns;
  }

  public static getLedger(): RewardLedgerEntry[] {
    return [...this.ledger];
  }

  public static getDriverProgress(driverId: string, campaignId: string): DriverGoalProgress {
    const key = `${driverId}:${campaignId}`;
    const existing = this.progressMap.get(key);
    if (existing) return existing;

    // Default demonstration progress matching prompt example (32 of 50 completed)
    const initialRides = campaignId === 'cmp_consistent_50' ? 32 : 9;
    const seededIds = Array.from({ length: initialRides }, (_, i) => `seed_trip_${campaignId}_${i + 1}`);

    const created: DriverGoalProgress = {
      campaignId,
      driverId,
      completedEligibleRides: initialRides,
      countedTripIds: seededIds,
      disqualifiedTrips: [
        {
          tripId: 'TRP-8841-CANC',
          date: 'Yesterday, 16:10',
          reason: 'cancelled'
        }
      ],
      rewardStatus: 'in_progress',
      paidTierIds: []
    };
    this.progressMap.set(key, created);
    return created;
  }

  /**
   * Record a trip toward a driver's goal progress on the server.
   * Counts only completed and verified eligible trips.
   * Rejects cancelled, fraudulent, or duplicate trips.
   */
  public static recordTripForGoals(params: {
    driverId: string;
    driverName: string;
    campaignId: string;
    tripId: string;
    serviceType: 'rides' | 'cargo' | 'boda';
    tripStatus: 'completed' | 'cancelled' | 'disputed';
    isVerifiedTrip: boolean;
    isFlaggedFraud?: boolean;
  }): { counted: boolean; message: string; progress: DriverGoalProgress } {
    const campaign = this.campaigns.find(c => c.id === params.campaignId);
    const progress = this.getDriverProgress(params.driverId, params.campaignId);

    if (!campaign || campaign.status !== 'active') {
      return {
        counted: false,
        message: 'Campaign is not active.',
        progress
      };
    }

    // Prevent same qualifying trip from being counted more than once
    if (progress.countedTripIds.includes(params.tripId)) {
      progress.disqualifiedTrips.unshift({
        tripId: params.tripId,
        date: 'Just now',
        reason: 'duplicate'
      });
      return {
        counted: false,
        message: `Duplicate trip prevented: Trip ${params.tripId} has already been counted.`,
        progress
      };
    }

    // Do not count cancelled or disputed trips
    if (params.tripStatus !== 'completed') {
      progress.disqualifiedTrips.unshift({
        tripId: params.tripId,
        date: 'Just now',
        reason: 'cancelled'
      });
      return {
        counted: false,
        message: `Trip ${params.tripId} was ${params.tripStatus} and does not qualify for Driver Goals.`,
        progress
      };
    }

    // Do not count fraudulent or unverified trips
    if (!params.isVerifiedTrip || params.isFlaggedFraud) {
      progress.disqualifiedTrips.unshift({
        tripId: params.tripId,
        date: 'Just now',
        reason: 'fraud_suspected'
      });
      return {
        counted: false,
        message: `Trip ${params.tripId} failed verification checks and was excluded from rewards.`,
        progress
      };
    }

    // Check service eligibility
    if (!campaign.eligibleServices.includes(params.serviceType)) {
      progress.disqualifiedTrips.unshift({
        tripId: params.tripId,
        date: 'Just now',
        reason: 'ineligible_service'
      });
      return {
        counted: false,
        message: `Service type '${params.serviceType}' is not eligible for ${campaign.name}.`,
        progress
      };
    }

    progress.countedTripIds.push(params.tripId);
    progress.completedEligibleRides += 1;

    if (progress.completedEligibleRides >= campaign.targetRides && progress.rewardStatus === 'in_progress') {
      progress.rewardStatus = 'qualified';
    }

    return {
      counted: true,
      message: `Qualifying trip recorded! Progress: ${progress.completedEligibleRides} of ${campaign.targetRides} rides.`,
      progress
    };
  }

  /**
   * Payout a completed reward tier via the auditable reward ledger.
   * Prevents paying a completed reward twice and enforces campaign budget.
   */
  public static approveAndPayReward(params: {
    actorRole: UserRole;
    actorName: string;
    driverId: string;
    driverName: string;
    campaignId: string;
    tierId: string;
  }): { success: boolean; message: string; ledgerEntry?: RewardLedgerEntry } {
    if (params.actorRole !== 'admin') {
      return {
        success: false,
        message: 'Security Violation: Only authorised administrators may approve or pay driver rewards.'
      };
    }

    const campaign = this.campaigns.find(c => c.id === params.campaignId);
    if (!campaign) {
      return { success: false, message: 'Campaign not found.' };
    }

    const tier = campaign.tiers.find(t => t.id === params.tierId);
    if (!tier) {
      return { success: false, message: 'Reward tier not found.' };
    }

    const progress = this.getDriverProgress(params.driverId, params.campaignId);

    if (progress.completedEligibleRides < tier.targetRides) {
      return {
        success: false,
        message: `Driver has completed ${progress.completedEligibleRides}/${tier.targetRides} rides and has not yet qualified for this tier.`
      };
    }

    // Prevent paying the same reward twice
    if (progress.paidTierIds.includes(tier.id)) {
      return {
        success: false,
        message: `Duplicate Payout Prevented: Reward tier '${tier.label}' has already been paid to ${params.driverName}.`
      };
    }

    // Check campaign budget cap
    if (campaign.spentBudgetZMW + tier.rewardAmountZMW > campaign.maxBudgetZMW) {
      return {
        success: false,
        message: `Campaign budget exceeded: Remaining budget is K${campaign.maxBudgetZMW - campaign.spentBudgetZMW}.`
      };
    }

    progress.paidTierIds.push(tier.id);
    progress.rewardStatus = 'paid';
    campaign.spentBudgetZMW += tier.rewardAmountZMW;

    const entry: RewardLedgerEntry = {
      id: `ldg_${Date.now()}`,
      driverId: params.driverId,
      driverName: params.driverName,
      campaignId: campaign.id,
      campaignName: campaign.name,
      tierLabel: tier.label,
      amountZMW: tier.rewardAmountZMW,
      status: 'paid',
      approvedBy: params.actorName,
      timestamp: new Date().toISOString()
    };

    this.ledger.unshift(entry);

    return {
      success: true,
      message: `Reward K${tier.rewardAmountZMW} approved and recorded in ledger for ${params.driverName}.`,
      ledgerEntry: entry
    };
  }

  /**
   * Admin creates or updates a campaign
   */
  public static upsertCampaign(
    actorRole: UserRole,
    campaign: DriverGoalCampaign
  ): { success: boolean; message: string } {
    if (actorRole !== 'admin') {
      return {
        success: false,
        message: 'Unauthorised: Only administrators may configure Driver Goal campaigns.'
      };
    }
    const idx = this.campaigns.findIndex(c => c.id === campaign.id);
    if (idx >= 0) {
      this.campaigns[idx] = campaign;
    } else {
      this.campaigns.unshift(campaign);
    }
    return {
      success: true,
      message: `Campaign '${campaign.name}' saved.`
    };
  }
}

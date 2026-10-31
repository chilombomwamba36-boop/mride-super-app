import { FareOfferAuditEntry, UserRole } from '../types';

export interface FairFareRuleConfig {
  minFareZMW: number;
  maxFareZMW: number;
  maxNegotiationRounds: number;
  offerExpirySeconds: number;
  commissionRatePercent: number;
}

export const DEFAULT_FAIRFARE_CONFIG: FairFareRuleConfig = {
  minFareZMW: 22,
  maxFareZMW: 1500,
  maxNegotiationRounds: 3,
  offerExpirySeconds: 90,
  commissionRatePercent: 10
};

export interface NegotiationBookingLock {
  bookingId: string;
  passengerId: string;
  assignedDriverId?: string;
  lockedFareNgwee?: number; // Stored in integer minor units (1 ZMW = 100 ngwee)
  currentRound: number;
  maxRounds: number;
  status: 'open' | 'offers_received' | 'fare_locked' | 'expired' | 'cancelled';
  auditHistory: FareOfferAuditEntry[];
  offerTimestamps: Record<string, number>;
}

const bookingRegistry = new Map<string, NegotiationBookingLock>();
const processedSubmissionKeys = new Set<string>();

/**
 * Convert ZMW to integer minor units (Ngwee) to avoid floating-point errors
 */
export function toNgwee(zmw: number): number {
  return Math.round(zmw * 100);
}

export function fromNgwee(ngwee: number): number {
  return ngwee / 100;
}

export class FairFareEngine {
  private static config: FairFareRuleConfig = { ...DEFAULT_FAIRFARE_CONFIG };

  public static getConfig(): FairFareRuleConfig {
    return { ...this.config };
  }

  public static updateConfig(
    actorRole: UserRole,
    partial: Partial<FairFareRuleConfig>
  ): { success: boolean; message: string; config: FairFareRuleConfig } {
    if (actorRole !== 'admin') {
      return {
        success: false,
        message: 'Unauthorised: Only administrators may change FairFare pricing or negotiation rules.',
        config: this.getConfig()
      };
    }
    this.config = { ...this.config, ...partial };
    return {
      success: true,
      message: 'FairFare rules updated.',
      config: this.getConfig()
    };
  }

  public static resetForTests(): void {
    bookingRegistry.clear();
    processedSubmissionKeys.clear();
    this.config = { ...DEFAULT_FAIRFARE_CONFIG };
  }

  /**
   * Validate a proposed or counteroffered fare against permitted limits
   */
  public static validateFareAmount(
    amountZMW: number,
    customMinZMW?: number,
    customMaxZMW?: number
  ): { valid: boolean; reason?: string } {
    const min = customMinZMW ?? this.config.minFareZMW;
    const max = customMaxZMW ?? this.config.maxFareZMW;

    if (typeof amountZMW !== 'number' || Number.isNaN(amountZMW) || amountZMW <= 0) {
      return {
        valid: false,
        reason: 'Proposed fare must be a positive amount in Zambian Kwacha (K).'
      };
    }

    if (amountZMW < min) {
      return {
        valid: false,
        reason: `Offer K${amountZMW} is below the minimum permitted fare of K${min} for this route.`
      };
    }

    if (amountZMW > max) {
      return {
        valid: false,
        reason: `Offer K${amountZMW} exceeds the maximum permitted fare of K${max} for this service.`
      };
    }

    return { valid: true };
  }

  /**
   * Passenger submits initial FairFare request
   */
  public static createPassengerRequest(params: {
    bookingId: string;
    passengerId: string;
    passengerName: string;
    proposedFareZMW: number;
    minFareZMW?: number;
    maxFareZMW?: number;
    idempotencyKey?: string;
  }): { success: boolean; message: string; session?: NegotiationBookingLock } {
    if (params.idempotencyKey && processedSubmissionKeys.has(params.idempotencyKey)) {
      return {
        success: false,
        message: 'Duplicate request prevented: This booking submission has already been received.'
      };
    }

    if (bookingRegistry.has(params.bookingId)) {
      return {
        success: false,
        message: 'Duplicate booking ID: A request with this ID is already active.'
      };
    }

    const validation = this.validateFareAmount(
      params.proposedFareZMW,
      params.minFareZMW,
      params.maxFareZMW
    );
    if (!validation.valid) {
      return {
        success: false,
        message: validation.reason || 'Invalid fare amount.'
      };
    }

    if (params.idempotencyKey) {
      processedSubmissionKeys.add(params.idempotencyKey);
    }

    const now = Date.now();
    const expiresAt = new Date(now + this.config.offerExpirySeconds * 1000).toISOString();

    const session: NegotiationBookingLock = {
      bookingId: params.bookingId,
      passengerId: params.passengerId,
      currentRound: 1,
      maxRounds: this.config.maxNegotiationRounds,
      status: 'open',
      offerTimestamps: { initial: now },
      auditHistory: [
        {
          id: `aud_${now}_1`,
          round: 1,
          actor: 'passenger',
          actorName: params.passengerName,
          amountZMW: params.proposedFareZMW,
          action: 'propose',
          timestamp: new Date(now).toISOString(),
          expiresAt
        }
      ]
    };

    bookingRegistry.set(params.bookingId, session);
    return {
      success: true,
      message: `FairFare request submitted at K${params.proposedFareZMW}.`,
      session
    };
  }

  /**
   * Driver submits a counteroffer (does NOT automatically confirm booking)
   */
  public static submitDriverCounterOffer(params: {
    bookingId: string;
    driverId: string;
    driverName: string;
    counterFareZMW: number;
    offerId?: string;
    nowMs?: number;
  }): { success: boolean; message: string; offerId?: string; session?: NegotiationBookingLock } {
    const session = bookingRegistry.get(params.bookingId);
    if (!session) {
      return { success: false, message: 'Booking request not found.' };
    }

    if (session.status === 'fare_locked') {
      return {
        success: false,
        message: 'This booking has already been confirmed with an agreed fare.'
      };
    }

    const validation = this.validateFareAmount(params.counterFareZMW);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Invalid counteroffer amount.' };
    }

    if (session.currentRound > session.maxRounds) {
      return {
        success: false,
        message: `Maximum negotiation limit (${session.maxRounds} rounds) reached.`
      };
    }

    const now = params.nowMs ?? Date.now();
    const offerId = params.offerId || `off_${params.driverId}_r${session.currentRound}`;
    session.offerTimestamps[offerId] = now;
    session.status = 'offers_received';

    session.auditHistory.push({
      id: offerId,
      round: session.currentRound,
      actor: 'driver',
      actorName: params.driverName,
      amountZMW: params.counterFareZMW,
      action: 'counteroffer',
      timestamp: new Date(now).toISOString(),
      expiresAt: new Date(now + this.config.offerExpirySeconds * 1000).toISOString()
    });

    return {
      success: true,
      message: `Counteroffer K${params.counterFareZMW} sent to passenger. Waiting for passenger acceptance.`,
      offerId,
      session
    };
  }

  /**
   * Passenger rejects a driver's counteroffer and optionally proposes another price within round limits
   */
  public static passengerRespondToCounterOffer(params: {
    bookingId: string;
    passengerName: string;
    offerId: string;
    decision: 'reject' | 're_offer';
    newProposedFareZMW?: number;
    nowMs?: number;
  }): { success: boolean; message: string; session?: NegotiationBookingLock } {
    const session = bookingRegistry.get(params.bookingId);
    if (!session) {
      return { success: false, message: 'Booking request not found.' };
    }

    if (session.status === 'fare_locked') {
      return { success: false, message: 'Fare is already locked and confirmed.' };
    }

    const now = params.nowMs ?? Date.now();
    const lastEntry = session.auditHistory[session.auditHistory.length - 1];

    session.auditHistory.push({
      id: `aud_rej_${now}`,
      round: session.currentRound,
      actor: 'passenger',
      actorName: params.passengerName,
      amountZMW: lastEntry ? lastEntry.amountZMW : 0,
      action: 'reject',
      timestamp: new Date(now).toISOString()
    });

    if (params.decision === 'reject') {
      return {
        success: true,
        message: 'Counteroffer declined.',
        session
      };
    }

    // Passenger wants to make another offer
    if (session.currentRound >= session.maxRounds) {
      return {
        success: false,
        message: `You can negotiate up to ${session.maxRounds} times. Maximum rounds reached.`
      };
    }

    const newFare = params.newProposedFareZMW ?? 0;
    const validation = this.validateFareAmount(newFare);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Invalid new offer amount.' };
    }

    session.currentRound += 1;
    const newOfferId = `off_pax_r${session.currentRound}_${now}`;
    session.offerTimestamps[newOfferId] = now;

    session.auditHistory.push({
      id: newOfferId,
      round: session.currentRound,
      actor: 'passenger',
      actorName: params.passengerName,
      amountZMW: newFare,
      action: 'propose',
      timestamp: new Date(now).toISOString(),
      expiresAt: new Date(now + this.config.offerExpirySeconds * 1000).toISOString()
    });

    return {
      success: true,
      message: `New offer K${newFare} submitted (Round ${session.currentRound} of ${session.maxRounds}).`,
      session
    };
  }

  /**
   * Confirm mutual agreement and atomically lock the fare + driver assignment
   */
  public static confirmMutualAgreement(params: {
    bookingId: string;
    driverId: string;
    driverName: string;
    agreedFareZMW: number;
    offerId?: string;
    nowMs?: number;
  }): { success: boolean; message: string; lockedFareZMW?: number; session?: NegotiationBookingLock } {
    const session = bookingRegistry.get(params.bookingId);
    if (!session) {
      return { success: false, message: 'Booking request not found.' };
    }

    // Prevent two drivers from claiming the same confirmed booking or duplicate acceptance
    if (session.status === 'fare_locked' || session.assignedDriverId) {
      if (session.assignedDriverId === params.driverId) {
        return {
          success: false,
          message: 'Duplicate acceptance prevented: You are already assigned to this booking.'
        };
      }
      return {
        success: false,
        message: 'Another driver has already been selected and confirmed for this trip.'
      };
    }

    // Check offer expiry if offerId provided
    const now = params.nowMs ?? Date.now();
    if (params.offerId && session.offerTimestamps[params.offerId]) {
      const createdMs = session.offerTimestamps[params.offerId];
      if (now - createdMs > this.config.offerExpirySeconds * 1000) {
        session.auditHistory.push({
          id: `aud_exp_${now}`,
          round: session.currentRound,
          actor: 'system',
          actorName: 'Mrides FairFare Guard',
          amountZMW: params.agreedFareZMW,
          action: 'expire',
          timestamp: new Date(now).toISOString()
        });
        return {
          success: false,
          message: 'Offer has expired. Please request or submit a fresh offer.'
        };
      }
    }

    const validation = this.validateFareAmount(params.agreedFareZMW);
    if (!validation.valid) {
      return { success: false, message: validation.reason || 'Invalid agreed fare.' };
    }

    session.assignedDriverId = params.driverId;
    session.lockedFareNgwee = toNgwee(params.agreedFareZMW);
    session.status = 'fare_locked';

    session.auditHistory.push({
      id: `aud_acc_${now}`,
      round: session.currentRound,
      actor: 'driver',
      actorName: params.driverName,
      amountZMW: params.agreedFareZMW,
      action: 'accept',
      timestamp: new Date(now).toISOString()
    });

    return {
      success: true,
      message: `Fare K${params.agreedFareZMW} mutually agreed and locked for ${params.driverName}.`,
      lockedFareZMW: fromNgwee(session.lockedFareNgwee),
      session
    };
  }

  /**
   * Prevent any party from unilaterally altering a locked fare
   */
  public static attemptAlterLockedFare(params: {
    bookingId: string;
    actorId: string;
    newFareZMW: number;
  }): { success: boolean; message: string } {
    const session = bookingRegistry.get(params.bookingId);
    if (!session) {
      return { success: false, message: 'Booking not found.' };
    }
    if (session.status === 'fare_locked' && session.lockedFareNgwee !== undefined) {
      return {
        success: false,
        message: `Security Lock: Agreed fare K${fromNgwee(session.lockedFareNgwee)} is locked and cannot be changed unilaterally.`
      };
    }
    return { success: true, message: 'Fare is still open for negotiation.' };
  }

  public static getSession(bookingId: string): NegotiationBookingLock | undefined {
    return bookingRegistry.get(bookingId);
  }
}

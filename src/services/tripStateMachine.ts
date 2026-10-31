import {
  AuditLogEntry,
  CargoVehicleTier,
  DeliveryTripStatus,
  RideTripStatus,
  UserRole
} from '../types';

const VALID_RIDE_TRANSITIONS: Record<RideTripStatus, RideTripStatus[]> = {
  requested: ['offers_received', 'fare_agreed', 'cancelled'],
  offers_received: ['fare_agreed', 'cancelled'],
  fare_agreed: ['driver_assigned', 'cancelled'],
  driver_assigned: ['driver_arriving', 'cancelled'],
  driver_arriving: ['passenger_picked_up', 'cancelled'],
  passenger_picked_up: ['in_progress', 'disputed'],
  in_progress: ['completed', 'disputed'],
  completed: ['disputed'],
  cancelled: [],
  disputed: ['completed', 'cancelled']
};

const VALID_DELIVERY_TRANSITIONS: Record<DeliveryTripStatus, DeliveryTripStatus[]> = {
  requested: ['offer_received', 'fare_agreed', 'cancelled'],
  offer_received: ['fare_agreed', 'cancelled'],
  fare_agreed: ['driver_assigned', 'cancelled'],
  driver_assigned: ['arriving_at_pickup', 'cancelled'],
  arriving_at_pickup: ['item_collected', 'cancelled'],
  item_collected: ['in_transit', 'disputed'],
  in_transit: ['delivered', 'disputed'],
  delivered: ['disputed'],
  cancelled: [],
  disputed: ['delivered', 'cancelled']
};

export interface PrivacyFilteredPassengerDetails {
  displayName: string;
  isVerified: boolean;
  rating: number;
  completedTrips: number;
  pickupNote: string;
  paymentMethod: string;
  lastTripRelative: string;
  phoneDisplay: string;
  canDirectContact: boolean;
  privacyNotice: string;
}

const auditLogs: AuditLogEntry[] = [
  {
    id: 'aud_init_1',
    actorId: 'usr_admin_1',
    actorName: 'Mrides HQ Admin',
    actorRole: 'admin',
    action: 'Configured FairFare Minimum Floor',
    category: 'fare_config',
    targetId: 'ZM:Lusaka',
    summary: 'Set Lusaka minimum short-hop fare floor to K22.00 and commission to 10%.',
    timestamp: '2026-10-26 09:30'
  },
  {
    id: 'aud_init_2',
    actorId: 'usr_admin_1',
    actorName: 'Mrides HQ Admin',
    actorRole: 'admin',
    action: 'Launched Consistent Driver Challenge',
    category: 'reward_campaign',
    targetId: 'cmp_consistent_50',
    summary: 'Created 7-day 50-ride target campaign with K300 top reward and K25,000 budget cap.',
    timestamp: '2026-10-26 11:15'
  }
];

export class TripSecurityAndStateService {
  public static getAuditLogs(): AuditLogEntry[] {
    return [...auditLogs];
  }

  public static recordAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const full: AuditLogEntry = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    auditLogs.unshift(full);
    return full;
  }

  /**
   * Enforce valid ride state transitions on the server.
   * A driver cannot mark a trip completed before required pickup and in-progress stages.
   */
  public static validateRideTransition(
    current: RideTripStatus,
    next: RideTripStatus,
    actorRole: UserRole = 'driver'
  ): { valid: boolean; message: string } {
    if (actorRole === 'admin') {
      return { valid: true, message: `Administrative state override: ${current} -> ${next}` };
    }
    const allowed = VALID_RIDE_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      return {
        valid: false,
        message: `Invalid state transition from '${current}' to '${next}'. Required intermediate pickup and trip stages must be completed first.`
      };
    }
    return { valid: true, message: `Trip status updated to '${next}'.` };
  }

  /**
   * Enforce valid delivery state transitions for Cargo and Boda deliveries,
   * including pickup and delivery confirmation codes.
   */
  public static validateDeliveryTransition(params: {
    current: DeliveryTripStatus;
    next: DeliveryTripStatus;
    providedCode?: string;
    expectedPickupCode?: string;
    expectedDeliveryCode?: string;
  }): { valid: boolean; message: string } {
    const allowed = VALID_DELIVERY_TRANSITIONS[params.current] || [];
    if (!allowed.includes(params.next)) {
      return {
        valid: false,
        message: `Invalid delivery transition from '${params.current}' to '${params.next}'.`
      };
    }

    if (params.next === 'item_collected' && params.expectedPickupCode) {
      if (params.providedCode !== params.expectedPickupCode) {
        return {
          valid: false,
          message: 'Pickup confirmation code does not match sender code.'
        };
      }
    }

    if (params.next === 'delivered' && params.expectedDeliveryCode) {
      if (params.providedCode !== params.expectedDeliveryCode) {
        return {
          valid: false,
          message: 'Delivery confirmation code does not match recipient code.'
        };
      }
    }

    return { valid: true, message: `Delivery status updated to '${params.next}'.` };
  }

  /**
   * Mask phone number for pre-acceptance privacy (e.g., "+260 97 *** 452")
   */
  public static maskPhoneNumber(phone: string): string {
    const cleaned = phone.trim();
    if (cleaned.length < 7) return '+260 ** *** ***';
    const prefix = cleaned.slice(0, 7);
    const suffix = cleaned.slice(-3);
    return `${prefix} *** ${suffix}`;
  }

  /**
   * Driver Passenger-Details Privacy Gate:
   * - Rejects unauthorized users.
   * - Before acceptance: returns masked phone and only decision-relevant fields.
   * - After acceptance: reveals contact method and logs access.
   */
  public static getPassengerDetailsForDriver(params: {
    requesterId: string;
    requesterRole: UserRole;
    bookingAccepted: boolean;
    assignedDriverId?: string;
    passenger: {
      name: string;
      phone: string;
      isVerified: boolean;
      rating: number;
      completedTrips: number;
      pickupNote?: string;
      paymentMethod?: string;
      lastTripAgo?: string;
    };
  }): { authorized: boolean; message?: string; data?: PrivacyFilteredPassengerDetails } {
    if (params.requesterRole !== 'driver' && params.requesterRole !== 'admin' && params.requesterRole !== 'boda_rider' && params.requesterRole !== 'cargo_operator') {
      return {
        authorized: false,
        message: 'Unauthorised access: Only verified drivers or administrators may view trip passenger details.'
      };
    }

    if (params.bookingAccepted && params.assignedDriverId && params.assignedDriverId !== params.requesterId && params.requesterRole !== 'admin') {
      return {
        authorized: false,
        message: 'Unauthorised access: This booking is assigned to another driver.'
      };
    }

    const isConfirmedForThisDriver =
      params.bookingAccepted && (!params.assignedDriverId || params.assignedDriverId === params.requesterId);

    if (isConfirmedForThisDriver) {
      this.recordAuditLog({
        actorId: params.requesterId,
        actorName: `Driver ${params.requesterId}`,
        actorRole: params.requesterRole,
        action: 'Accessed Confirmed Passenger Contact',
        category: 'privacy_access',
        targetId: params.passenger.name,
        summary: 'Revealed passenger contact details after trip acceptance.'
      });
    }

    return {
      authorized: true,
      data: {
        displayName: params.passenger.name,
        isVerified: params.passenger.isVerified,
        rating: params.passenger.rating,
        completedTrips: params.passenger.completedTrips,
        pickupNote: params.passenger.pickupNote || 'Main entrance',
        paymentMethod: params.passenger.paymentMethod || 'Cash',
        lastTripRelative: params.passenger.lastTripAgo || '2 days ago',
        phoneDisplay: isConfirmedForThisDriver
          ? params.passenger.phone
          : this.maskPhoneNumber(params.passenger.phone),
        canDirectContact: isConfirmedForThisDriver,
        privacyNotice: isConfirmedForThisDriver
          ? 'Trip accepted. Direct masked calling and pickup coordination enabled.'
          : 'Full contact details are shared only after you accept the trip.'
      }
    };
  }

  /**
   * Check Cargo & Boda vehicle eligibility before assigning a delivery
   */
  public static checkVehicleEligibilityForCargo(params: {
    weightKg: number;
    category: string;
    selectedVehicleTier: CargoVehicleTier;
  }): { eligible: boolean; reason?: string } {
    const prohibitedKeywords = ['explosive', 'firearm', 'weapon', 'illegal', 'hazardous', 'acid'];
    const lowerCat = params.category.toLowerCase();
    if (prohibitedKeywords.some(keyword => lowerCat.includes(keyword))) {
      return {
        eligible: false,
        reason: 'Prohibited Goods: Dangerous, hazardous or illegal items are strictly banned on Mrides.'
      };
    }

    const maxWeights: Record<CargoVehicleTier, number> = {
      boda_courier: 25,
      light_van: 500,
      one_ton_pickup: 1000,
      canter_3_5ton: 3500,
      heavy_flatbed: 10000
    };

    const allowedWeight = maxWeights[params.selectedVehicleTier];
    if (params.weightKg > allowedWeight) {
      return {
        eligible: false,
        reason: `Payload weight (${params.weightKg} kg) exceeds the maximum safe limit (${allowedWeight} kg) for ${params.selectedVehicleTier}. Please select a larger vehicle tier.`
      };
    }

    return { eligible: true };
  }
}

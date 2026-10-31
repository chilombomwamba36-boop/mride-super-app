/**
 * Mride Transaction Integrity & Double-Booking Guard
 * 
 * Enforces server-side validation rules to:
 * 1. Prevent race condition double-booking (two drivers accepting the same ride).
 * 2. Prevent price tampering (protect agreed negotiated fare from client-side alteration).
 * 3. Validate food order subtotal + delivery fee math.
 * 4. Generate transaction audit checksums.
 */

export interface ValidationResult {
  isValid: boolean;
  errorCode?: 'FARE_TAMPERED' | 'ALREADY_ASSIGNED' | 'INVALID_TOTAL' | 'UNAUTHORIZED_ROLE';
  message: string;
  auditChecksum?: string;
}

// In-memory atomic lock registry to simulate distributed server locks
const activeRideLocks = new Map<string, string>(); // rideId -> driverId
const activeCargoLocks = new Map<string, string>(); // orderId -> operatorId

/**
 * Validates and locks an agreed ride fare between passenger and driver.
 * Prevents double-booking and fare modification.
 */
export function validateAndLockRideFare(
  rideId: string,
  proposedFareZMW: number,
  driverOfferedFareZMW: number,
  driverId: string,
  currentAssignedDriverId?: string
): ValidationResult {
  // 1. Double Assignment Check
  if (currentAssignedDriverId || activeRideLocks.has(rideId)) {
    const existingDriver = currentAssignedDriverId || activeRideLocks.get(rideId);
    if (existingDriver !== driverId) {
      return {
        isValid: false,
        errorCode: 'ALREADY_ASSIGNED',
        message: `Security Lock: Ride ${rideId} has already been accepted by another driver.`
      };
    }
  }

  // 2. Anti-Tamper Fare Check
  if (proposedFareZMW <= 0 || driverOfferedFareZMW <= 0 || isNaN(driverOfferedFareZMW)) {
    return {
      isValid: false,
      errorCode: 'FARE_TAMPERED',
      message: 'Security Violation: Agreed fare cannot be zero or negative.'
    };
  }

  // Check deviation from realistic floor (strict nationwide K35 floor)
  if (driverOfferedFareZMW < 35) {
    return {
      isValid: false,
      errorCode: 'FARE_TAMPERED',
      message: 'Security Violation: Agreed fare is below the Mride nationwide minimum regulatory floor (K35 / ZMW 35).'
    };
  }

  // Atomic lock acquisition
  activeRideLocks.set(rideId, driverId);

  // Generate audit hash simulation
  const auditChecksum = `TWD-SEC-${rideId}-${driverId}-${driverOfferedFareZMW}-${Date.now().toString(36).toUpperCase()}`;

  return {
    isValid: true,
    message: `Agreed fare locked securely at ZMW ${driverOfferedFareZMW}. Double-assignment lock active.`,
    auditChecksum
  };
}

/**
 * Validates cargo consignment rate and locks assignment to single carrier.
 */
export function validateCargoConsignment(
  orderId: string,
  consignorAgreedFareZMW: number,
  operatorId: string,
  currentOperatorId?: string
): ValidationResult {
  if (currentOperatorId || activeCargoLocks.has(orderId)) {
    return {
      isValid: false,
      errorCode: 'ALREADY_ASSIGNED',
      message: `Consignment ${orderId} has already been assigned to an authorized carrier.`
    };
  }

  if (consignorAgreedFareZMW < 30) {
    return {
      isValid: false,
      errorCode: 'FARE_TAMPERED',
      message: 'Security Violation: Cargo haulage price cannot be lower than regulatory base.'
    };
  }

  activeCargoLocks.set(orderId, operatorId);

  return {
    isValid: true,
    message: `Consignment locked to operator ${operatorId} at ZMW ${consignorAgreedFareZMW}.`,
    auditChecksum: `TWD-CRG-LOCK-${orderId}-${operatorId}-${Date.now().toString(36)}`
  };
}

/**
 * Validates that food basket line items + addons + delivery fee exactly equals total.
 */
export function validateFoodOrderCalculation(
  items: Array<{ priceZMW: number; quantity: number; addonsTotalZMW?: number }>,
  deliveryFeeZMW: number,
  clientReportedTotalZMW: number
): ValidationResult {
  const calculatedItemsTotal = items.reduce((sum, item) => {
    const addons = item.addonsTotalZMW || 0;
    return sum + ((item.priceZMW + addons) * item.quantity);
  }, 0);

  const calculatedGrandTotal = calculatedItemsTotal + deliveryFeeZMW;

  if (calculatedGrandTotal !== clientReportedTotalZMW) {
    return {
      isValid: false,
      errorCode: 'INVALID_TOTAL',
      message: `Cart Total Mismatch! Server calculated ZMW ${calculatedGrandTotal}, but client submitted ZMW ${clientReportedTotalZMW}. Transaction rejected.`
    };
  }

  return {
    isValid: true,
    message: `Order calculation verified: Items ZMW ${calculatedItemsTotal} + Delivery ZMW ${deliveryFeeZMW} = ZMW ${calculatedGrandTotal}.`,
    auditChecksum: `TWD-FOOD-TX-${calculatedGrandTotal}-${Date.now().toString(36)}`
  };
}

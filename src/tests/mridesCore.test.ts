import { FairFareEngine } from '../services/fairFareEngine';
import { DriverGoalsService } from '../services/driverGoalsService';
import { TripSecurityAndStateService } from '../services/tripStateMachine';
import {
  LUSAKA_VERIFIED_PLACES,
  buildDirectionalArrowsAlongRoute,
  computeBearingDegrees,
  findClosestRoutePoint
} from '../services/mapRouting';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

export function runMridesTestSuite(): { passed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;

  const pass = (name: string) => {
    passed += 1;
    results.push(`PASS [${passed}]: ${name}`);
  };

  // Scenario 1: Passenger adjusts a fare and submits a request (including invalid limit check)
  FairFareEngine.resetForTests();
  const invalidLow = FairFareEngine.createPassengerRequest({
    bookingId: 'bk_low',
    passengerId: 'pax_1',
    passengerName: 'Chanda M.',
    proposedFareZMW: 10,
    minFareZMW: 22
  });
  assert(!invalidLow.success, 'Should reject fare below K22 minimum');

  const validReq = FairFareEngine.createPassengerRequest({
    bookingId: 'bk_100',
    passengerId: 'pax_1',
    passengerName: 'Chanda M.',
    proposedFareZMW: 80,
    idempotencyKey: 'idem_100'
  });
  assert(validReq.success && validReq.session?.status === 'open', 'Passenger should submit valid K80 offer');

  const dupSubmission = FairFareEngine.createPassengerRequest({
    bookingId: 'bk_100_dup',
    passengerId: 'pax_1',
    passengerName: 'Chanda M.',
    proposedFareZMW: 80,
    idempotencyKey: 'idem_100'
  });
  assert(!dupSubmission.success, 'Duplicate submission idempotency key should be blocked');
  pass('Scenario 1: Passenger adjusts a fare, validates limits, prevents duplicate submission, and submits request.');

  // Scenario 2: Driver accepts the proposed fare
  const acceptRes = FairFareEngine.confirmMutualAgreement({
    bookingId: 'bk_100',
    driverId: 'drv_1',
    driverName: 'Chanda M.',
    agreedFareZMW: 80
  });
  assert(acceptRes.success && acceptRes.lockedFareZMW === 80, 'Driver should accept K80 fare and lock booking');
  pass('Scenario 2: Driver accepts the proposed fare and locks agreement.');

  // Scenario 3: Driver counteroffers and passenger accepts (counteroffer does NOT auto-confirm)
  FairFareEngine.createPassengerRequest({
    bookingId: 'bk_200',
    passengerId: 'pax_2',
    passengerName: 'Chanda M.',
    proposedFareZMW: 80
  });
  const counterRes = FairFareEngine.submitDriverCounterOffer({
    bookingId: 'bk_200',
    driverId: 'drv_2',
    driverName: 'Mwamba K.',
    counterFareZMW: 85,
    offerId: 'off_mwamba_85'
  });
  assert(
    counterRes.success && counterRes.session?.status === 'offers_received',
    'Driver counteroffer must not auto-confirm booking'
  );
  const paxAcceptCounter = FairFareEngine.confirmMutualAgreement({
    bookingId: 'bk_200',
    driverId: 'drv_2',
    driverName: 'Mwamba K.',
    agreedFareZMW: 85,
    offerId: 'off_mwamba_85'
  });
  assert(paxAcceptCounter.success && paxAcceptCounter.lockedFareZMW === 85, 'Passenger accepts driver counteroffer K85');
  pass('Scenario 3: Driver counteroffers K85 (without auto-confirming) and passenger accepts.');

  // Scenario 4 & 5: Passenger rejects a counteroffer and makes another offer within negotiation limit
  FairFareEngine.createPassengerRequest({
    bookingId: 'bk_300',
    passengerId: 'pax_3',
    passengerName: 'Chanda M.',
    proposedFareZMW: 75
  });
  FairFareEngine.submitDriverCounterOffer({
    bookingId: 'bk_300',
    driverId: 'drv_3',
    driverName: 'Blessings P.',
    counterFareZMW: 90,
    offerId: 'off_300_1'
  });
  const rejectOnly = FairFareEngine.passengerRespondToCounterOffer({
    bookingId: 'bk_300',
    passengerName: 'Chanda M.',
    offerId: 'off_300_1',
    decision: 'reject'
  });
  assert(rejectOnly.success, 'Passenger should be able to reject counteroffer');
  pass('Scenario 4: Passenger rejects a driver counteroffer.');

  const reOffer1 = FairFareEngine.passengerRespondToCounterOffer({
    bookingId: 'bk_300',
    passengerName: 'Chanda M.',
    offerId: 'off_300_1',
    decision: 're_offer',
    newProposedFareZMW: 82
  });
  assert(reOffer1.success && reOffer1.session?.currentRound === 2, 'Round 2 re-offer should succeed');

  const reOffer2 = FairFareEngine.passengerRespondToCounterOffer({
    bookingId: 'bk_300',
    passengerName: 'Chanda M.',
    offerId: 'off_300_1',
    decision: 're_offer',
    newProposedFareZMW: 85
  });
  assert(reOffer2.success && reOffer2.session?.currentRound === 3, 'Round 3 re-offer should succeed');

  const reOfferExceeded = FairFareEngine.passengerRespondToCounterOffer({
    bookingId: 'bk_300',
    passengerName: 'Chanda M.',
    offerId: 'off_300_1',
    decision: 're_offer',
    newProposedFareZMW: 88
  });
  assert(!reOfferExceeded.success, 'Round 4 should be blocked by max 3 negotiation rounds');
  pass('Scenario 5: Passenger makes another offer within the allowed 3-round negotiation limit.');

  // Scenario 6: An offer expires
  FairFareEngine.createPassengerRequest({
    bookingId: 'bk_400',
    passengerId: 'pax_4',
    passengerName: 'Chanda M.',
    proposedFareZMW: 80
  });
  const baseTime = 1_000_000;
  FairFareEngine.submitDriverCounterOffer({
    bookingId: 'bk_400',
    driverId: 'drv_4',
    driverName: 'Mwamba K.',
    counterFareZMW: 85,
    offerId: 'off_exp_test',
    nowMs: baseTime
  });
  const expiredAccept = FairFareEngine.confirmMutualAgreement({
    bookingId: 'bk_400',
    driverId: 'drv_4',
    driverName: 'Mwamba K.',
    agreedFareZMW: 85,
    offerId: 'off_exp_test',
    nowMs: baseTime + 120_000 // 120s > 90s expiry
  });
  assert(!expiredAccept.success && expiredAccept.message.includes('expired'), 'Expired offer must be rejected');
  pass('Scenario 6: An expired offer is rejected.');

  // Scenario 7: Two drivers attempt to accept the same request
  const secondDriverAttempt = FairFareEngine.confirmMutualAgreement({
    bookingId: 'bk_100',
    driverId: 'drv_competing_99',
    driverName: 'Second Driver',
    agreedFareZMW: 80
  });
  assert(!secondDriverAttempt.success, 'Second driver must be prevented from claiming confirmed booking');
  pass('Scenario 7: Two drivers attempting to accept the same request is prevented.');

  // Scenario 8: A driver attempts to change a confirmed fare
  const tamperAttempt = FairFareEngine.attemptAlterLockedFare({
    bookingId: 'bk_100',
    actorId: 'drv_1',
    newFareZMW: 120
  });
  assert(!tamperAttempt.success, 'Driver must not be able to change a confirmed fare unilaterally');
  pass('Scenario 8: Unilateral attempt to change a confirmed fare is blocked.');

  // Scenario 9: A driver completes a qualifying trip and goal progress updates once (duplicate trip prevented)
  DriverGoalsService.resetForTests();
  const before = DriverGoalsService.getDriverProgress('drv_test_1', 'cmp_consistent_50').completedEligibleRides;
  const trip1 = DriverGoalsService.recordTripForGoals({
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tripId: 'TRP-QUAL-001',
    serviceType: 'rides',
    tripStatus: 'completed',
    isVerifiedTrip: true
  });
  assert(trip1.counted && trip1.progress.completedEligibleRides === before + 1, 'Qualifying trip increments goal progress by 1');

  const dupTrip = DriverGoalsService.recordTripForGoals({
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tripId: 'TRP-QUAL-001',
    serviceType: 'rides',
    tripStatus: 'completed',
    isVerifiedTrip: true
  });
  assert(!dupTrip.counted && dupTrip.progress.completedEligibleRides === before + 1, 'Duplicate trip ID must not increment progress twice');
  pass('Scenario 9: Qualifying trip updates goal progress once and prevents duplicate trip counting.');

  // Scenario 10: A cancelled or fraudulent trip does not earn a reward
  const cancelledTrip = DriverGoalsService.recordTripForGoals({
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tripId: 'TRP-CANC-002',
    serviceType: 'rides',
    tripStatus: 'cancelled',
    isVerifiedTrip: true
  });
  assert(!cancelledTrip.counted, 'Cancelled trip must not count toward goal');

  const fraudTrip = DriverGoalsService.recordTripForGoals({
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tripId: 'TRP-FRAUD-003',
    serviceType: 'rides',
    tripStatus: 'completed',
    isVerifiedTrip: true,
    isFlaggedFraud: true
  });
  assert(!fraudTrip.counted, 'Fraudulent trip must not count toward goal');
  pass('Scenario 10: Cancelled or fraudulent trips do not earn rewards.');

  // Scenario 11: A completed reward cannot be paid twice (and non-admin cannot pay)
  const unauthPayout = DriverGoalsService.approveAndPayReward({
    actorRole: 'driver',
    actorName: 'Chanda M.',
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tierId: 'tier_20'
  });
  assert(!unauthPayout.success, 'Driver cannot approve their own reward payout');

  const firstPayout = DriverGoalsService.approveAndPayReward({
    actorRole: 'admin',
    actorName: 'Mrides HQ Admin',
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tierId: 'tier_20'
  });
  assert(firstPayout.success, 'Admin should pay qualified Tier 1 (20 rides) reward once');

  const secondPayout = DriverGoalsService.approveAndPayReward({
    actorRole: 'admin',
    actorName: 'Mrides HQ Admin',
    driverId: 'drv_test_1',
    driverName: 'Chanda M.',
    campaignId: 'cmp_consistent_50',
    tierId: 'tier_20'
  });
  assert(!secondPayout.success, 'Completed reward tier cannot be paid twice');
  pass('Scenario 11: A completed reward cannot be paid twice and requires admin authorisation.');

  // Scenario 12: An unauthorised user attempts to access passenger or driver information + phone masking
  const unauthPrivacy = TripSecurityAndStateService.getPassengerDetailsForDriver({
    requesterId: 'usr_random_customer',
    requesterRole: 'customer',
    bookingAccepted: false,
    passenger: {
      name: 'Chanda M.',
      phone: '+260 97 789 452',
      isVerified: true,
      rating: 4.9,
      completedTrips: 23
    }
  });
  assert(!unauthPrivacy.authorized, 'Customer role must be blocked from driver passenger-details endpoint');

  const preAcceptPrivacy = TripSecurityAndStateService.getPassengerDetailsForDriver({
    requesterId: 'drv_1',
    requesterRole: 'driver',
    bookingAccepted: false,
    passenger: {
      name: 'Chanda M.',
      phone: '+260 97 789 452',
      isVerified: true,
      rating: 4.9,
      completedTrips: 23
    }
  });
  assert(
    Boolean(
      preAcceptPrivacy.authorized &&
        preAcceptPrivacy.data?.phoneDisplay.includes('***') &&
        !preAcceptPrivacy.data?.canDirectContact
    ),
    'Pre-acceptance view must mask passenger phone number'
  );
  pass('Scenario 12: Unauthorised user access is blocked and passenger phone is masked before trip acceptance.');

  // Scenario 13: A cargo request is assigned only to an eligible vehicle & blocks prohibited goods
  const overweightBoda = TripSecurityAndStateService.checkVehicleEligibilityForCargo({
    weightKg: 120,
    category: 'Household Furniture',
    selectedVehicleTier: 'boda_courier'
  });
  assert(!overweightBoda.eligible, '120kg cargo must not be assigned to a 25kg Boda courier');

  const prohibitedCargo = TripSecurityAndStateService.checkVehicleEligibilityForCargo({
    weightKg: 5,
    category: 'Explosive materials',
    selectedVehicleTier: 'light_van'
  });
  assert(!prohibitedCargo.eligible, 'Prohibited dangerous goods must be rejected');

  const validCargo = TripSecurityAndStateService.checkVehicleEligibilityForCargo({
    weightKg: 450,
    category: 'Household Furniture',
    selectedVehicleTier: 'one_ton_pickup'
  });
  assert(validCargo.eligible, '450kg furniture is eligible for 1-ton pickup');
  pass('Scenario 13: Cargo request is assigned only to an eligible vehicle and blocks prohibited goods.');

  // Scenario 14: A boda delivery requires the appropriate pickup and delivery confirmations
  const wrongPickupPin = TripSecurityAndStateService.validateDeliveryTransition({
    current: 'arriving_at_pickup',
    next: 'item_collected',
    providedCode: '0000',
    expectedPickupCode: '4290'
  });
  assert(!wrongPickupPin.valid, 'Wrong pickup PIN must block collection');

  const validPickupPin = TripSecurityAndStateService.validateDeliveryTransition({
    current: 'arriving_at_pickup',
    next: 'item_collected',
    providedCode: '4290',
    expectedPickupCode: '4290'
  });
  assert(validPickupPin.valid, 'Correct pickup PIN allows collection');

  const wrongDeliveryPin = TripSecurityAndStateService.validateDeliveryTransition({
    current: 'in_transit',
    next: 'delivered',
    providedCode: '9999',
    expectedDeliveryCode: '8154'
  });
  assert(!wrongDeliveryPin.valid, 'Wrong delivery PIN must block delivery completion');

  const validDeliveryPin = TripSecurityAndStateService.validateDeliveryTransition({
    current: 'in_transit',
    next: 'delivered',
    providedCode: '8154',
    expectedDeliveryCode: '8154'
  });
  assert(validDeliveryPin.valid, 'Correct delivery PIN confirms delivery');
  pass('Scenario 14: Boda delivery requires valid pickup and delivery confirmation codes.');

  // Scenario 15: Controlled ride state machine prevents premature completion
  const prematureComplete = TripSecurityAndStateService.validateRideTransition(
    'driver_arriving',
    'completed',
    'driver'
  );
  assert(!prematureComplete.valid, 'Driver cannot jump from driver_arriving directly to completed');

  const validComplete = TripSecurityAndStateService.validateRideTransition(
    'in_progress',
    'completed',
    'driver'
  );
  assert(validComplete.valid, 'Driver can complete trip after in_progress stage');
  pass('Scenario 15: Controlled trip state machine enforces valid pickup and trip progression.');

  // Scenario 16: Vector map directional arrows, compass bearing, Lusaka landmarks & route deviation
  const cavendish = LUSAKA_VERIFIED_PLACES.find((p) => p.shortName === 'Cavendish University')!.coordinate;
  const eastPark = LUSAKA_VERIFIED_PLACES.find((p) => p.shortName === 'EastPark Mall')!.coordinate;
  const bearingEast = computeBearingDegrees(cavendish, eastPark);
  assert(
    bearingEast > 45 && bearingEast < 95,
    `Expected east-northeast bearing from Cavendish to EastPark Mall in Lusaka, got ${bearingEast.toFixed(1)}°`
  );
  const sampleRoute = [
    cavendish,
    { lat: -15.3941, lng: 28.3046 }, // Manda Hill
    eastPark
  ];
  const arrows = buildDirectionalArrowsAlongRoute(sampleRoute, 250);
  assert(
    arrows.length >= 10 && arrows.every((a) => a.bearingDegrees >= 0 && a.bearingDegrees < 360),
    'Route directional arrows must be spaced along the active route geometry with valid forward bearings'
  );
  const offRouteCheck = findClosestRoutePoint({ lat: -15.4342, lng: 28.3081 }, sampleRoute);
  assert(
    offRouteCheck.distanceFromRouteMeters > 1000,
    'Off-route deviation detector accurately measures distance from active route polyline'
  );
  pass('Scenario 16: Vector map directional arrows, compass bearings, Lusaka landmarks, and off-route deviation checks pass.');

  return { passed, results };
}

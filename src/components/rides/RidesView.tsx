import React, { useState, useEffect, useMemo } from 'react';
import {
  Car,
  ArrowUpDown,
  Plus,
  Minus,
  ShieldCheck,
  Star,
  Phone,
  MessageSquare,
  CheckCircle2,
  Share2,
  AlertTriangle,
  Clock,
  Lock,
  ChevronLeft,
  Trophy,
  Wifi,
  Volume2,
  Play
} from 'lucide-react';
import {
  RideVehicleOption,
  DriverBid,
  RideHistoryItem,
  RideTripStatus,
  FareOfferAuditEntry
} from '../../types';
import { MOCK_RIDE_VEHICLES, INITIAL_DRIVER_BIDS } from '../../data/mockData';
import { PricingEngineService } from '../../services/pricingEngine';
import { PaymentModal } from '../payment/PaymentModal';
import { PaymentMethodType } from '../../services/paymentGateway';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';
import { CountryStreetMap } from '../common/CountryStreetMap';
import { DriverLocationUpdate, subscribeToDriverLocation } from '../../services/driverLocationChannel';
import { FairFareEngine } from '../../services/fairFareEngine';
import { TripSecurityAndStateService } from '../../services/tripStateMachine';
import { DriverRankingService } from '../../services/driverRankingService';
import { LiveDispatchChannelService } from '../../services/liveDispatchChannel';
import { InAppDataCallModal } from '../common/InAppDataCallModal';
import { MrideWaitTimeReelsModal } from '../common/MrideWaitTimeReelsModal';
import { AiVoiceCopilotService } from '../../services/aiVoiceCopilotService';
import { readMrideContent } from '../../services/contentSettings';

interface RidesViewProps {
  currentRole: string;
  activeCity?: string;
  country?: CountryConfig;
  onRideCompleted?: (ride: RideHistoryItem) => void;
  initialDestination?: string;
  onInitialDestinationApplied?: () => void;
}

const COMPLIMENT_TAGS = [
  'Good Communication',
  'Nice Smell in Car',
  'Polite & Respectful',
  'Spotless Clean Car',
  'Safe & Smooth Driving',
  'Fast Pickup & Great Route'
];

export const RidesView: React.FC<RidesViewProps> = ({
  activeCity = 'Lusaka',
  country = DEFAULT_COUNTRY,
  onRideCompleted,
  initialDestination,
  onInitialDestinationApplied
}) => {
  const [pickup, setPickup] = useState('Cavendish University');
  const [destination, setDestination] = useState('EastPark Mall');
  const [pickupNote, setPickupNote] = useState('Main entrance');
  const [selectedVehicle, setSelectedVehicle] = useState<RideVehicleOption>(MOCK_RIDE_VEHICLES[0]); // Economy default
  const [offeredFare, setOfferedFare] = useState<number>(60);
  const [isMapOpenInSelecting, setIsMapOpenInSelecting] = useState<boolean>(Boolean(initialDestination));
  const [contentFloorSettings, setContentFloorSettings] = useState(() => readMrideContent());

  // Screens: 1. selecting -> 2. offers -> 3. counter_detail -> 4. active_trip -> 5. completed
  const [screen, setScreen] = useState<'selecting' | 'offers' | 'counter_detail' | 'active_trip' | 'completed'>('selecting');
  const [tripState, setTripState] = useState<RideTripStatus>('requested');
  const [bookingId, setBookingId] = useState<string>('bk_initial');
  const [bids, setBids] = useState<DriverBid[]>(INITIAL_DRIVER_BIDS);
  const [activeCounterBid, setActiveCounterBid] = useState<DriverBid | null>(null);
  const [acceptedBid, setAcceptedBid] = useState<DriverBid | null>(null);

  const [negotiationRound, setNegotiationRound] = useState<number>(1);
  const [maxRounds] = useState<number>(3);
  const [reOfferInputZMW, setReOfferInputZMW] = useState<number>(82);
  const [showReOfferBox, setShowReOfferBox] = useState<boolean>(false);
  const [auditHistory, setAuditHistory] = useState<FareOfferAuditEntry[]>([]);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Payment, Rating, In-App Data Call & Safety States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethodLabel, setPaymentMethodLabel] = useState<PaymentMethodType>('cash');
  const [passengerRating, setPassengerRating] = useState<number>(5);
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([
    'Good Communication',
    'Nice Smell in Car',
    'Polite & Respectful'
  ]);
  const [passengerComment, setPassengerComment] = useState<string>('');
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isDataCallOpen, setIsDataCallOpen] = useState<boolean>(false);
  const [isReelsOpen, setIsReelsOpen] = useState<boolean>(false);
  const [driverLocation, setDriverLocation] = useState<DriverLocationUpdate | null>(null);

  // Real GPS telemetry + Live Cross-Tab Dispatch subscription
  useEffect(() => {
    const unsubGps = subscribeToDriverLocation(setDriverLocation);
    const stopGpsWatch = LiveDispatchChannelService.startLiveGpsTelemetry();
    const unsubDispatch = LiveDispatchChannelService.subscribe((msg) => {
      if (msg.type === 'DRIVER_COUNTER_OFFER') {
        setInfoNotice(`Live Driver Offer: ${msg.driverName} proposed K${msg.amountZMW}`);
      } else if (msg.type === 'DRIVER_ACCEPTED_REQUEST') {
        setInfoNotice(`Live Dispatch: ${msg.driverName} accepted your K${msg.agreedFareZMW} fare!`);
      }
    });
    return () => {
      unsubGps();
      stopGpsWatch();
      unsubDispatch();
    };
  }, []);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
      setIsMapOpenInSelecting(true);
      onInitialDestinationApplied?.();
    }
  }, [initialDestination, onInitialDestinationApplied]);

  useEffect(() => {
    const syncContent = () => setContentFloorSettings(readMrideContent());
    window.addEventListener('mride:content-updated', syncContent);
    window.addEventListener('storage', syncContent);
    return () => {
      window.removeEventListener('mride:content-updated', syncContent);
      window.removeEventListener('storage', syncContent);
    };
  }, []);

  const activeTierMinFareZMW = useMemo(() => {
    if (selectedVehicle.type === 'economy') {
      return contentFloorSettings.minEconomyFareZMW || 28;
    }
    if (selectedVehicle.type === 'comfort') {
      return contentFloorSettings.minComfortFareZMW || 40;
    }
    return selectedVehicle.minAllowedFareZMW;
  }, [contentFloorSettings.minComfortFareZMW, contentFloorSettings.minEconomyFareZMW, selectedVehicle]);

  const currentPricing = useMemo(() => {
    return PricingEngineService.calculateDynamicFare({
      pickup,
      destination,
      city: activeCity as any,
      vehicleType:
        selectedVehicle.type === 'economy'
          ? 'standard'
          : selectedVehicle.type === 'family_xl'
          ? 'xl'
          : (selectedVehicle.type as any),
      hasIntermediateStop: false,
      needAC: selectedVehicle.type === 'comfort',
      simulatedTime: new Date()
    });
  }, [pickup, destination, activeCity, selectedVehicle]);

  const indicativeRange = useMemo<[number, number]>(() => {
    if (selectedVehicle.type === 'economy') return [60, 70];
    if (selectedVehicle.type === 'comfort') return [80, 95];
    if (selectedVehicle.type === 'family_xl') return [120, 140];
    return [30, 45];
  }, [selectedVehicle.type]);

  const driverRankings = useMemo(() => DriverRankingService.getDriverRankings(), [screen]);

  const handleSelectVehicle = (veh: RideVehicleOption) => {
    setSelectedVehicle(veh);
    const floor =
      veh.type === 'economy'
        ? contentFloorSettings.minEconomyFareZMW || 28
        : veh.type === 'comfort'
        ? contentFloorSettings.minComfortFareZMW || 40
        : veh.minAllowedFareZMW;
    setOfferedFare(Math.max(floor, veh.baseEstimatedZMW));
    setValidationError(null);
  };

  const handleAdjustFare = (delta: number) => {
    const next = offeredFare + delta;
    setOfferedFare(Math.max(activeTierMinFareZMW, next));
    setValidationError(null);
  };

  const handleSubmitFairFareRequest = () => {
    setValidationError(null);
    setInfoNotice(null);

    if (!pickup.trim() || !destination.trim()) {
      setValidationError('Please enter both pickup and destination locations.');
      return;
    }

    const newBookingId = `MRD-BK-${Date.now()}`;
    const res = FairFareEngine.createPassengerRequest({
      bookingId: newBookingId,
      passengerId: 'usr_zm_0981',
      passengerName: 'Chanda M.',
      proposedFareZMW: offeredFare,
      minFareZMW: activeTierMinFareZMW,
      maxFareZMW: selectedVehicle.maxAllowedFareZMW
    });

    if (!res.success) {
      setValidationError(res.message);
      return;
    }

    setBookingId(newBookingId);
    setNegotiationRound(1);

    // Broadcast live request to connected Driver App instances
    LiveDispatchChannelService.broadcastPassengerRequest({
      id: newBookingId,
      passengerId: 'usr_zm_0981',
      passengerName: 'Chanda M.',
      passengerPhone: '+260 97 789 452',
      passengerRating: 4.9,
      passengerCompletedTrips: 23,
      passengerVerified: true,
      paymentMethod: paymentMethodLabel,
      pickup,
      destination,
      vehicleType: selectedVehicle.type,
      passengerProposedFareZMW: offeredFare,
      distanceKm: currentPricing.distanceKm,
      estimatedDurationMinutes: currentPricing.durationMinutes,
      notes: pickupNote,
      createdAt: 'Just now'
    });

    // Prioritize driver offers by highest driver rating & 5-star volume
    const prioritizedBids = DriverRankingService.getPrioritizedDriverBids(
      offeredFare,
      activeTierMinFareZMW
    );

    setBids(prioritizedBids);
    setAuditHistory(res.session?.auditHistory || []);
    setTripState('offers_received');
    setScreen('offers');
  };

  const handleInspectOrChooseBid = (bid: DriverBid) => {
    setValidationError(null);
    if (bid.offeredFareZMW !== offeredFare && bid.status === 'countered') {
      setActiveCounterBid(bid);
      setReOfferInputZMW(Math.round((offeredFare + bid.offeredFareZMW) / 2));
      setShowReOfferBox(false);
      setScreen('counter_detail');
      return;
    }
    handleConfirmDriverOffer(bid);
  };

  const handleConfirmDriverOffer = (bid: DriverBid) => {
    setValidationError(null);
    const lockRes = FairFareEngine.confirmMutualAgreement({
      bookingId,
      driverId: bid.id,
      driverName: bid.driverName,
      agreedFareZMW: bid.offeredFareZMW
    });

    if (!lockRes.success) {
      setValidationError(lockRes.message);
      return;
    }

    setAcceptedBid(bid);
    setOfferedFare(bid.offeredFareZMW);
    setAuditHistory(lockRes.session?.auditHistory || []);
    setTripState('driver_arriving');
    setScreen('active_trip');

    // AI Voice Co-Pilot announces confirmed driver & route
    AiVoiceCopilotService.speakGuidance(
      `Mride AI Co-Pilot: ${bid.driverName} is on the way in a ${bid.vehicleModel}, plate ${bid.vehiclePlate}, arriving at ${pickup} in ${bid.etaMinutes} minutes. You can tap Watch Reels while you wait, and I will alert you the moment your ride arrives.`,
      true
    );
  };

  const handlePassengerSubmitReOffer = () => {
    if (!activeCounterBid) return;
    setValidationError(null);

    const res = FairFareEngine.passengerRespondToCounterOffer({
      bookingId,
      passengerName: 'Chanda M.',
      offerId: activeCounterBid.id,
      decision: 're_offer',
      newProposedFareZMW: reOfferInputZMW
    });

    if (!res.success) {
      setValidationError(res.message);
      return;
    }

    const nextRound = res.session?.currentRound || negotiationRound + 1;
    setNegotiationRound(nextRound);
    setOfferedFare(reOfferInputZMW);
    setAuditHistory(res.session?.auditHistory || []);

    const updatedBid: DriverBid = {
      ...activeCounterBid,
      offeredFareZMW: reOfferInputZMW,
      negotiationRound: nextRound,
      status: 'pending'
    };

    setBids((prev) => prev.map((b) => (b.id === updatedBid.id ? updatedBid : b)));
    setActiveCounterBid(updatedBid);
    setShowReOfferBox(false);
    setInfoNotice(
      `Round ${nextRound}/${maxRounds}: Offer K${reOfferInputZMW} sent! ${updatedBid.driverName} agreed to K${reOfferInputZMW}.`
    );
  };

  const handleDeclineBid = (bidId: string) => {
    const remaining = bids.filter((b) => b.id !== bidId);
    setBids(remaining);
    setScreen('offers');
    if (remaining.length === 0) {
      setInfoNotice('All driver offers declined. Adjust your proposed fare and search again.');
      setScreen('selecting');
    }
  };

  const handleAdvanceTripState = (next: RideTripStatus) => {
    setValidationError(null);
    const check = TripSecurityAndStateService.validateRideTransition(tripState, next, 'driver');
    if (!check.valid) {
      setValidationError(check.message);
      return;
    }
    setTripState(next);
    if (next === 'passenger_picked_up' && acceptedBid) {
      AiVoiceCopilotService.playDriverArrivalChimeAndAnnounce(
        acceptedBid.driverName,
        acceptedBid.vehicleModel,
        acceptedBid.vehiclePlate,
        pickup
      );
    } else if (next === 'in_progress') {
      AiVoiceCopilotService.speakGuidance(
        `Trip started from ${pickup} to ${destination}. Estimated travel time is ${currentPricing.durationMinutes} minutes via Great East Road.`,
        true
      );
    } else if (next === 'completed') {
      AiVoiceCopilotService.speakGuidance(
        `You have arrived at ${destination}. Thank you for riding with Mrides!`,
        true
      );
      setScreen('completed');
    }
  };

  const handleToggleCompliment = (tag: string) => {
    setSelectedCompliments((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleFinishAndSaveReceipt = () => {
    if (acceptedBid) {
      // Update driver's real persistent rating & priority order allocation
      const updatedRank = DriverRankingService.submitDriverRating({
        driverId: acceptedBid.id,
        driverName: acceptedBid.driverName,
        stars: passengerRating,
        compliments: selectedCompliments,
        comment: passengerComment
      });

      const ticket = `MRD-${Date.now().toString().slice(-6)}-ZM`;
      const item: RideHistoryItem = {
        id: `ride_${Date.now()}`,
        ticketNumber: ticket,
        serviceType: 'rides',
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pickup,
        destination,
        driverName: acceptedBid.driverName,
        driverPhone: acceptedBid.driverPhone || '+260 97 781 2940',
        driverRating: updatedRank.averageRating,
        driverPhoto: acceptedBid.driverPhoto,
        vehicleModel: acceptedBid.vehicleModel,
        vehiclePlate: acceptedBid.vehiclePlate,
        fareZMW: acceptedBid.offeredFareZMW,
        paymentMethod: paymentMethodLabel,
        status: 'completed',
        countryCode: country.code,
        notes:
          passengerComment ||
          `Rated ${passengerRating}★ (${selectedCompliments.join(', ')}) • Priority Tier: ${updatedRank.priorityTier}`
      };
      onRideCompleted?.(item);
      setInfoNotice(
        `Thank you! ${acceptedBid.driverName}'s rating is now ★ ${updatedRank.averageRating} (${updatedRank.totalRatingsCount} ratings) — ${updatedRank.priorityTier}.`
      );
    }

    setScreen('selecting');
    setTripState('requested');
    setAcceptedBid(null);
    setActiveCounterBid(null);
    setPassengerComment('');
    setValidationError(null);
  };

  const handleShareLiveTrip = async () => {
    const shareUrl = `${window.location.origin}/?trip=${bookingId}`;
    const shareText = `Track my live Mrides trip with ${acceptedBid?.driverName} (${acceptedBid?.vehiclePlate}) from ${pickup} to ${destination}: ${shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Live Mrides Trip',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(shareText);
    setInfoNotice('Live GPS trip link copied to clipboard!');
  };

  return (
    <div className="space-y-2 max-w-2xl mx-auto">
      {/* Top Map Viewport (Opens automatically when user starts entering locations or is on offers/active trip) */}
      {screen !== 'completed' && (screen !== 'selecting' || isMapOpenInSelecting) && (
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm animate-in fade-in duration-200">
          <CountryStreetMap
            country={country}
            activeCity={activeCity}
            pickupName={pickup}
            destinationName={destination}
            heightClass={
              screen === 'selecting'
                ? 'h-[26vh] min-h-[180px] max-h-[220px]'
                : 'h-[29vh] min-h-[195px] max-h-[250px]'
            }
            driverLocation={screen === 'active_trip' ? driverLocation?.coordinate : null}
            driverHeadingDegrees={screen === 'active_trip' ? driverLocation?.headingDegrees : null}
            enableNavigationFollow={screen === 'active_trip'}
            onPickupChanged={
              screen === 'selecting' ? (newPickup) => setPickup(newPickup) : undefined
            }
            onDestinationChanged={
              screen === 'selecting' ? (newDest) => setDestination(newDest) : undefined
            }
          />
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
            {screen !== 'selecting' && (
              <button
                onClick={() => setScreen(screen === 'counter_detail' ? 'offers' : 'selecting')}
                className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#15191C] shadow-sm hover:bg-slate-50"
                title="Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span className="bg-white/95 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-extrabold text-[#15191C] shadow-xs">
              {screen === 'selecting' && 'Choose Ride'}
              {screen === 'offers' && `Driver offers (${bids.length})`}
              {screen === 'counter_detail' && 'Counter Offer'}
              {screen === 'active_trip' && 'Live Trip • GPS Active'}
            </span>
          </div>
          {screen === 'selecting' && (
            <button
              type="button"
              onClick={() => setIsMapOpenInSelecting(false)}
              className="absolute top-2.5 right-2.5 z-20 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-slate-700 shadow-xs hover:bg-slate-100"
            >
              Hide Map
            </button>
          )}
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-[#15191C] shadow-xs">
            {currentPricing.distanceKm} km • ~{currentPricing.durationMinutes} min
          </div>
        </div>
      )}

      {validationError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 flex items-center gap-2 text-xs text-red-700 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {infoNotice && (
        <div className="rounded-xl bg-[#FFF0E6] border border-[#FF6500]/30 p-2.5 text-xs font-semibold text-[#15191C]">
          {infoNotice}
        </div>
      )}

      {/* ================= SCREEN 3: CHOOSE RIDE & FAIRFARE ADJUSTMENT (Single-Screen No-Scroll Layout) ================= */}
      {screen === 'selecting' && (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2.5">
          {/* Route Bar (Typing or focusing automatically opens the Live 3D Map) */}
          <div className="relative rounded-xl border border-slate-200 bg-[#F7F7F5] px-2.5 py-2 space-y-1.5">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1.5 pr-8">
              <span className="h-2 w-2 rounded-full bg-[#FF6500] shrink-0" />
              <input
                value={pickup}
                onFocus={() => setIsMapOpenInSelecting(true)}
                onChange={(e) => {
                  setPickup(e.target.value);
                  setIsMapOpenInSelecting(true);
                }}
                className="w-full bg-transparent text-xs font-extrabold text-[#15191C] outline-none truncate"
                placeholder="Pickup location"
              />
            </div>
            <div className="flex items-center gap-2 pr-8">
              <span className="h-2 w-2 rounded-full bg-[#15191C] shrink-0" />
              <input
                value={destination}
                onFocus={() => setIsMapOpenInSelecting(true)}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setIsMapOpenInSelecting(true);
                }}
                className="w-full bg-transparent text-xs font-extrabold text-[#15191C] outline-none truncate"
                placeholder="Destination"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPickup(destination);
                setDestination(pickup);
                setIsMapOpenInSelecting(true);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#FF6500]"
              title="Swap route"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* Ride Type Selection: Strictly Economy (Min K28) & Comfort (Min K40) — XL Excluded */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Select a ride type (Economy & Comfort)
              </h2>
              {!isMapOpenInSelecting && (
                <button
                  type="button"
                  onClick={() => setIsMapOpenInSelecting(true)}
                  className="text-[10px] font-extrabold text-[#FF6500] hover:underline"
                >
                  Show Live Map
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {MOCK_RIDE_VEHICLES.filter((v) => v.type === 'economy' || v.type === 'comfort').map((veh) => {
                const isSelected = selectedVehicle.type === veh.type;
                const floorZMW =
                  veh.type === 'economy'
                    ? contentFloorSettings.minEconomyFareZMW || 28
                    : contentFloorSettings.minComfortFareZMW || 40;
                const rangeText =
                  veh.type === 'economy'
                    ? `Min K${floorZMW} • Est. K60`
                    : `Min K${floorZMW} • Est. K80`;
                return (
                  <button
                    key={veh.type}
                    type="button"
                    onClick={() => handleSelectVehicle(veh)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#FF6500] bg-[#FFF0E6]/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#FF6500] text-white' : 'bg-[#F7F7F5] text-[#15191C]'
                        }`}
                      >
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-[#15191C] block truncate">
                          {veh.title}
                        </span>
                        <span className="font-extrabold text-[10px] text-[#FF6500] block truncate">
                          {rangeText}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">{veh.etaMinutes}m</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FairFare Proposed Fare Adjustment (Compact Single Box with K28 Economy / K40 Comfort Floor) */}
          <div className="rounded-xl bg-[#F7F7F5] border border-slate-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#15191C] block leading-tight">
                  Your proposed fare ({selectedVehicle.title})
                </span>
                <span className="text-[10px] text-slate-500">
                  Lowest allowed: <strong className="text-[#FF6500]">K{activeTierMinFareZMW}</strong> • Est. K{indicativeRange[0]}–K{indicativeRange[1]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustFare(-2)}
                  className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#15191C] hover:border-[#FF6500]"
                  aria-label="Decrease fare"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xl font-extrabold text-[#15191C] min-w-[54px] text-center">
                  K{offeredFare}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustFare(5)}
                  className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#15191C] hover:border-[#FF6500]"
                  aria-label="Increase fare"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              type="range"
              min={activeTierMinFareZMW}
              max={150}
              step={2}
              value={Math.max(activeTierMinFareZMW, Math.min(150, offeredFare))}
              onChange={(e) => {
                setOfferedFare(Number(e.target.value));
                setValidationError(null);
              }}
              className="w-full accent-[#FF6500] cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Min K{activeTierMinFareZMW} ({selectedVehicle.title})</span>
              <span>K150</span>
            </div>
          </div>

          {/* Pickup Note + Find Drivers Action Row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-2 bg-white">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">Note:</span>
              <input
                type="text"
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                className="w-full text-xs font-semibold text-[#15191C] outline-none"
                placeholder="Main entrance"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmitFairFareRequest}
              className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-5 py-2.5 text-xs shadow-sm transition-colors shrink-0"
            >
              Find drivers
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 4: DRIVER OFFERS (Sorted by Rating & Priority Allocation) ================= */}
      {screen === 'offers' && (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-[#15191C]">Driver offers ({bids.length})</h2>
              <p className="text-[10px] text-slate-500">
                Ranked by highest passenger ratings • Proposed: <strong>K{offeredFare}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsReelsOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#15191C] to-slate-800 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-xs hover:from-[#FF6500] hover:to-[#E55A00] transition-all"
            >
              <Play className="w-3 h-3 fill-[#FF6500] text-[#FF6500]" />
              <span>Watch Reels While Waiting</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-0.5">
            {bids.map((bid, index) => {
              const rankInfo = driverRankings.find((r) => r.driverName === bid.driverName);
              return (
                <div
                  key={bid.id}
                  className={`rounded-xl border p-2.5 space-y-2 bg-white transition-all shadow-2xs ${
                    index === 0
                      ? 'border-[#FF6500] ring-1 ring-[#FF6500]/20'
                      : 'border-slate-200 hover:border-[#FF6500]/50'
                  }`}
                >
                  {index === 0 && (
                    <div className="flex items-center justify-between bg-[#FFF0E6] px-2 py-0.5 rounded-md text-[9px] font-extrabold text-[#FF6500]">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" /> #1 Highest Rated Driver • Priority Dispatch
                      </span>
                      <span>{rankInfo?.allocatedOrdersToday || 18} orders today</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={bid.driverPhoto}
                        alt={bid.driverName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-[#15191C]">
                            {bid.driverName}
                          </span>
                          <span className="bg-sky-50 text-sky-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#FF6500] fill-[#FF6500]" />
                          <strong className="text-[#15191C]">{bid.rating}</strong> ({bid.totalTrips}) • {bid.vehicleModel}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#15191C] block leading-none">
                        K{bid.offeredFareZMW}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5 mt-0.5">
                        <Clock className="w-2.5 h-2.5" /> {bid.etaMinutes} min
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInspectOrChooseBid(bid)}
                      className="flex-1 rounded-lg bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2 text-xs transition-colors"
                    >
                      {bid.offeredFareZMW !== offeredFare && bid.status === 'countered'
                        ? `Review Counter Offer (K${bid.offeredFareZMW})`
                        : 'Choose'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineBid(bid.id)}
                      className="px-2.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-500 hover:text-red-600"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SCREEN 5: COUNTER OFFER DETAIL ================= */}
      {screen === 'counter_detail' && activeCounterBid && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <img
              src={activeCounterBid.driverPhoto}
              alt={activeCounterBid.driverName}
              className="w-14 h-14 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#15191C]">
                  {activeCounterBid.driverName}
                </h2>
                <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-[#FF6500] fill-[#FF6500]" />
                <strong>{activeCounterBid.rating}</strong> ({activeCounterBid.totalTrips})
              </p>
              <p className="text-xs text-slate-500">{activeCounterBid.vehicleModel}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F7F7F5] p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Driver's counter offer</span>
            <span className="text-3xl font-extrabold text-[#FF6500] block mt-1">
              K{activeCounterBid.offeredFareZMW}
            </span>
            <p className="text-xs text-slate-600 mt-1">
              Driver wants K{activeCounterBid.offeredFareZMW} for this trip.
            </p>
          </div>

          {showReOfferBox && (
            <div className="rounded-2xl bg-[#FFF0E6] p-4 border border-[#FF6500]/30 space-y-2.5">
              <label className="block text-xs font-extrabold text-[#15191C]">
                Enter your counter-proposal (Round {negotiationRound} of {maxRounds})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={reOfferInputZMW}
                  onChange={(e) => setReOfferInputZMW(Number(e.target.value))}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-extrabold text-[#15191C]"
                />
                <button
                  type="button"
                  onClick={handlePassengerSubmitReOffer}
                  className="rounded-xl bg-[#15191C] text-white font-bold px-4 py-2.5 text-xs"
                >
                  Send K{reOfferInputZMW}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-500 block">Your response</span>
            <button
              type="button"
              onClick={() => handleConfirmDriverOffer(activeCounterBid)}
              className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-sm shadow-xs"
            >
              Accept K{activeCounterBid.offeredFareZMW}
            </button>
            <button
              type="button"
              onClick={() => setShowReOfferBox(!showReOfferBox)}
              className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#15191C] font-extrabold py-3 text-sm"
            >
              Make another offer
            </button>
            <button
              type="button"
              onClick={() => handleDeclineBid(activeCounterBid.id)}
              className="w-full rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 text-sm"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 6: YOUR TRIP — LIVE GPS, AI CO-PILOT, TIKTOK REELS & IN-APP DATA CALL ================= */}
      {screen === 'active_trip' && acceptedBid && (
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0E6] px-2.5 py-1 text-[11px] font-extrabold text-[#FF6500]">
              <span className="h-2 w-2 rounded-full bg-[#FF6500] animate-ping" />
              {tripState === 'driver_arriving' && 'Driver Arriving'}
              {tripState === 'passenger_picked_up' && 'Passenger Picked Up'}
              {tripState === 'in_progress' && 'Trip In Progress'}
            </span>
            <span className="text-[11px] font-extrabold text-[#15191C] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#FF6500]" /> Locked Fare: K{acceptedBid.offeredFareZMW}
            </span>
          </div>

          {/* Driver Card + In-App Data Call Button */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <img
                src={acceptedBid.driverPhoto}
                alt={acceptedBid.driverName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-xs text-[#15191C]">
                    {acceptedBid.driverName}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF6500]" />
                  <span className="text-[11px] text-slate-500 flex items-center gap-0.5 ml-1">
                    <Star className="w-3 h-3 text-[#FF6500] fill-[#FF6500]" />
                    <strong>{acceptedBid.rating}</strong>
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700">
                  {acceptedBid.vehicleModel} • <strong>{acceptedBid.vehiclePlate}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsDataCallOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs"
                title="Free In-App Data Call"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setInfoNotice(
                    `In-app chat sent to ${acceptedBid.driverName}: "I am ready at ${pickupNote}."`
                  )
                }
                className="h-8 w-8 rounded-xl border border-slate-200 bg-[#F7F7F5] flex items-center justify-center text-[#15191C] hover:bg-[#FFF0E6] hover:text-[#FF6500]"
                title="Message Driver"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TikTok Wait-Time Reels + AI Voice Co-Pilot Action Bar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsReelsOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#15191C] to-slate-800 px-3 py-2 text-[11px] font-extrabold text-white shadow-xs hover:from-[#FF6500] hover:to-[#E55A00] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-[#FF6500] text-[#FF6500] shrink-0" />
              <span className="truncate">Watch Reels While Waiting</span>
            </button>
            <button
              type="button"
              onClick={() =>
                AiVoiceCopilotService.speakGuidance(
                  tripState === 'driver_arriving'
                    ? `${acceptedBid.driverName} is ${acceptedBid.etaMinutes} minutes away in a ${acceptedBid.vehicleModel}, plate ${acceptedBid.vehiclePlate}. Please wait at ${pickup}.`
                    : `Navigating from ${pickup} to ${destination}. Estimated time remaining is ${currentPricing.durationMinutes} minutes.`,
                  true
                )
              }
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#FF6500]/30 bg-[#FFF0E6] px-3 py-2 text-[11px] font-extrabold text-[#15191C] hover:bg-[#FF6500] hover:text-white transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#FF6500] shrink-0" />
              <span className="truncate">AI Voice Status</span>
            </button>
          </div>

          {/* Arrival & Share Trip Row */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-xs text-[#15191C] block">
                {tripState === 'driver_arriving'
                  ? `Arriving in ${acceptedBid.etaMinutes} min • ${pickup} → ${destination}`
                  : `Heading to ${destination}`}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-600" /> Live GPS & AI Voice Alert Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleShareLiveTrip}
                className="rounded-lg border border-slate-200 bg-[#F7F7F5] px-2.5 py-1 text-[10px] font-bold text-[#15191C] flex items-center gap-1 hover:bg-slate-200"
              >
                <Share2 className="w-3 h-3 text-[#FF6500]" /> Share
              </button>
              <button
                type="button"
                onClick={() => setShowSafetyModal(true)}
                className="rounded-lg border border-red-200 bg-red-600 text-white px-2.5 py-1 text-[10px] font-extrabold shadow-2xs"
              >
                SOS 999
              </button>
            </div>
          </div>

          {/* Controlled State Progression Controls */}
          <div className="pt-0.5 space-y-1.5">
            {tripState === 'driver_arriving' && (
              <button
                type="button"
                onClick={() => handleAdvanceTripState('passenger_picked_up')}
                className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2.5 text-xs"
              >
                Confirm Passenger Picked Up (Step 1 of 3)
              </button>
            )}
            {tripState === 'passenger_picked_up' && (
              <button
                type="button"
                onClick={() => handleAdvanceTripState('in_progress')}
                className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2.5 text-xs"
              >
                Start Trip In Progress (Step 2 of 3)
              </button>
            )}
            {tripState === 'in_progress' && (
              <button
                type="button"
                onClick={() => handleAdvanceTripState('completed')}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 text-xs"
              >
                Arrive at Destination & Rate Driver (Step 3 of 3)
              </button>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-[11px] font-bold text-[#FF6500] hover:underline"
              >
                Pay via:{' '}
                {paymentMethodLabel === 'cash'
                  ? 'Cash (K' + acceptedBid.offeredFareZMW + ')'
                  : paymentMethodLabel.toUpperCase()}{' '}
                • Change Method
              </button>
              {tripState === 'driver_arriving' && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-600"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SCREEN 7: TRIP COMPLETED & DRIVER RATING (Boosts Driver Priority Orders) ================= */}
      {screen === 'completed' && acceptedBid && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#FF6500] text-white mx-auto flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#15191C]">Trip completed!</h2>
            <p className="text-4xl font-extrabold text-[#15191C] mt-2">
              K{acceptedBid.offeredFareZMW}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {paymentMethodLabel === 'cash'
                ? 'Paid in cash'
                : `Paid via ${paymentMethodLabel.replace('_', ' ').toUpperCase()}`}
            </p>
          </div>

          {/* Driver Summary Card */}
          <div className="rounded-2xl bg-[#F7F7F5] p-3.5 flex items-center justify-between text-left border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={acceptedBid.driverPhoto}
                alt={acceptedBid.driverName}
                className="w-11 h-11 rounded-full object-cover"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Rate Your Driver
                </span>
                <span className="font-extrabold text-sm text-[#15191C]">
                  {acceptedBid.driverName}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#FF6500] fill-[#FF6500]" /> {acceptedBid.rating} •
                  Top-rated drivers receive priority order allocation
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">
              {acceptedBid.vehiclePlate}
            </span>
          </div>

          {/* 5-Star Rating */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-[#15191C]">How was your trip?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPassengerRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= passengerRating
                        ? 'text-[#FF6500] fill-[#FF6500]'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] font-semibold text-[#FF6500]">
              {passengerRating === 5
                ? '5 Stars! Boosts driver priority order allocation (+3 priority orders)'
                : passengerRating === 4
                ? '4 Stars! Helps driver unlock Gold Priority orders'
                : 'Your rating directly impacts this driver’s dispatch priority'}
            </p>
          </div>

          {/* Compliment Badges: Choose What You Are Rating */}
          <div className="space-y-2 text-left bg-[#F7F7F5] rounded-2xl p-3.5 border border-slate-200">
            <span className="text-xs font-extrabold text-[#15191C] block text-center">
              What stood out about your driver? (Tap to select)
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {COMPLIMENT_TAGS.map((tag) => {
                const active = selectedCompliments.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleCompliment(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all ${
                      active
                        ? 'bg-[#FF6500] border-[#FF6500] text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#FF6500]'
                    }`}
                  >
                    {active ? `✓ ${tag}` : tag}
                  </button>
                );
              })}
            </div>
          </div>

          <input
            type="text"
            value={passengerComment}
            onChange={(e) => setPassengerComment(e.target.value)}
            placeholder="Add a comment for your driver (optional)"
            className="w-full rounded-xl border border-slate-200 bg-[#F7F7F5] px-3.5 py-2.5 text-xs text-[#15191C] outline-none"
          />

          <button
            type="button"
            onClick={handleFinishAndSaveReceipt}
            className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-sm shadow-sm"
          >
            Submit Rating & Done
          </button>
        </div>
      )}

      {/* In-App Data Call Modal */}
      {acceptedBid && (
        <InAppDataCallModal
          isOpen={isDataCallOpen}
          onClose={() => setIsDataCallOpen(false)}
          peerName={acceptedBid.driverName}
          peerRoleLabel="Mrides Verified Driver"
          peerPhoto={acceptedBid.driverPhoto}
          peerVehicleOrNote={`${acceptedBid.vehicleModel} • ${acceptedBid.vehiclePlate}`}
        />
      )}

      {/* TikTok-Style Wait-Time Reels Modal with Live Driver Arrival Chime & Voice Notification */}
      <MrideWaitTimeReelsModal
        isOpen={isReelsOpen}
        onClose={() => setIsReelsOpen(false)}
        driverName={acceptedBid?.driverName || bids[0]?.driverName || 'Chanda M.'}
        driverPhoto={
          acceptedBid?.driverPhoto ||
          bids[0]?.driverPhoto ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        }
        vehicleModel={acceptedBid?.vehicleModel || bids[0]?.vehicleModel || 'Toyota Corolla Axio'}
        vehiclePlate={acceptedBid?.vehiclePlate || bids[0]?.vehiclePlate || 'BAC 1234'}
        pickupName={pickup}
        destinationName={destination}
        initialEtaMinutes={acceptedBid?.etaMinutes || bids[0]?.etaMinutes || 2}
        hasDriverArrivedExternal={tripState === 'passenger_picked_up' || tripState === 'in_progress'}
        onConfirmBoardedVehicle={() => {
          if (screen === 'active_trip' && tripState === 'driver_arriving') {
            handleAdvanceTripState('passenger_picked_up');
          }
        }}
      />

      {/* Direct Emergency Dispatch Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-xl">
            <h3 className="font-extrabold text-base text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Emergency & Live Dispatch
            </h3>
            <p className="text-xs text-slate-600">
              Tap below to place an immediate emergency call or share your live GPS coordinates ({pickup} → {destination}).
            </p>
            <div className="space-y-2 text-xs font-extrabold">
              <a
                href="tel:999"
                className="w-full rounded-xl bg-red-600 text-white py-3 px-4 flex items-center justify-between"
              >
                <span>Call Zambia Police Emergency</span>
                <span className="font-mono">999</span>
              </a>
              <a
                href="tel:991"
                className="w-full rounded-xl bg-amber-600 text-white py-3 px-4 flex items-center justify-between"
              >
                <span>Call Medical Ambulance Dispatch</span>
                <span className="font-mono">991</span>
              </a>
              <a
                href="tel:+260977894432"
                className="w-full rounded-xl bg-[#15191C] text-white py-3 px-4 flex items-center justify-between"
              >
                <span>Call Mrides 24/7 Safety Response</span>
                <span className="font-mono">+260 97 789 4432</span>
              </a>
            </div>
            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full rounded-xl border border-slate-200 text-slate-700 font-bold py-2.5 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancellation Fee Disclosure Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-xl">
            <h3 className="font-extrabold text-base text-[#15191C]">Cancellation Policy</h3>
            <p className="text-xs text-slate-600">
              Cancelling within 3 minutes of driver assignment is <strong>free (K0)</strong>. Cancelling after a driver has travelled for more than 3 minutes incurs a disclosed <strong>K15 compensation fee</strong>.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-[#15191C]"
              >
                Keep Ride
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setScreen('selecting');
                  setTripState('cancelled');
                }}
                className="flex-1 rounded-xl bg-red-600 text-white py-2.5 text-xs font-bold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {acceptedBid && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amountZMW={acceptedBid.offeredFareZMW}
          serviceTitle={`Mrides ${selectedVehicle.title} (${pickup} -> ${destination})`}
          referenceId={bookingId}
          customerName="Chanda M."
          customerPhone="+260 97 789 452"
          rideDetails={{
            id: bookingId,
            ticketNumber: bookingId,
            date: 'Today',
            time: 'Now',
            pickup,
            destination,
            driverName: acceptedBid.driverName,
            driverPhone: acceptedBid.driverPhone || '+260 97 781 2940',
            driverRating: acceptedBid.rating,
            vehicleModel: acceptedBid.vehicleModel,
            vehiclePlate: acceptedBid.vehiclePlate,
            fareZMW: acceptedBid.offeredFareZMW,
            paymentMethod: paymentMethodLabel,
            status: 'completed',
            countryCode: country.code
          }}
          onPaymentComplete={(res) => {
            setPaymentMethodLabel(res.method);
            setIsPaymentModalOpen(false);
          }}
        />
      )}

      {/* Auditable Negotiation Log Footer */}
      {auditHistory.length > 0 && screen !== 'selecting' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-3 text-[11px] text-slate-500">
          <span className="font-extrabold text-[#15191C] block mb-1">
            FairFare Negotiation Audit Trail
          </span>
          <div className="space-y-1">
            {auditHistory.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between">
                <span>
                  R{entry.round} • <strong>{entry.actorName}</strong> ({entry.action})
                </span>
                <span className="font-bold text-[#15191C]">K{entry.amountZMW}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

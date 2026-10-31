import React, { useEffect, useState } from 'react';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  Trophy,
  Home,
  Inbox,
  UserRound,
  Phone,
  Clock,
  CreditCard,
  FileText,
  Lock,
  ChevronLeft,
  AlertTriangle,
  Car,
  Truck,
  Bike,
  Bell,
  Award,
  Sparkles,
  Wifi,
  Volume2,
  MapPin
} from 'lucide-react';
import { RideRequest, RideTripStatus } from '../../types';
import { MOCK_OPEN_RIDE_REQUESTS } from '../../data/mockData';
import { CountryStreetMap } from '../common/CountryStreetMap';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';
import { DriverGoalsService } from '../../services/driverGoalsService';
import { FairFareEngine } from '../../services/fairFareEngine';
import { TripSecurityAndStateService } from '../../services/tripStateMachine';
import { DriverRankingService, DriverRatingRecord } from '../../services/driverRankingService';
import { LiveDispatchChannelService } from '../../services/liveDispatchChannel';
import { InAppDataCallModal } from '../common/InAppDataCallModal';
import { MapCoordinate } from '../../services/mapRouting';
import { AiVoiceCopilotService } from '../../services/aiVoiceCopilotService';

interface DriverDedicatedAppProps {
  activeCity?: string;
  onCityChange?: (city: string) => void;
  country?: CountryConfig;
}

export const DriverDedicatedApp: React.FC<DriverDedicatedAppProps> = ({
  activeCity = 'Lusaka',
  country = DEFAULT_COUNTRY
}) => {
  const driverId = 'bid_drv_1';
  const driverName = 'Chanda M.';
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'requests' | 'goals' | 'earnings' | 'float' | 'profile'>('home');
  const [driverFloatBalanceZMW, setDriverFloatBalanceZMW] = useState<number>(150);
  const [topupAmountZMW, setTopupAmountZMW] = useState<number>(100);
  const [floatPaymentMethod, setFloatPaymentMethod] = useState<'mtn_momo' | 'airtel_money' | 'card' | 'cash'>('mtn_momo');
  const [floatTopupSuccess, setFloatTopupSuccess] = useState<string | null>(null);

  // Driver Work Area Preference (Filter out far orders)
  const [workAreaFilter, setWorkAreaFilter] = useState<string>('All Lusaka');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);

  // Requests & Active Trip State (Synced with LiveDispatchChannelService)
  const [requests, setRequests] = useState<RideRequest[]>(() =>
    LiveDispatchChannelService.getOpenRequests()
  );
  const [selectedPassengerRequest, setSelectedPassengerRequest] = useState<RideRequest | null>(null);
  const [activeTrip, setActiveTrip] = useState<RideRequest | null>(null);
  const [tripStatus, setTripStatus] = useState<RideTripStatus>('driver_arriving');

  // Live Driver Rating & Priority Allocation State
  const [driverRankings, setDriverRankings] = useState<DriverRatingRecord[]>(() =>
    DriverRankingService.getDriverRankings()
  );
  const myDriverRecord =
    driverRankings.find((r) => r.driverId === driverId || r.driverName === driverName) ||
    driverRankings[0];

  // Live HTML5 GPS Coordinate, Heading & In-App Data Call State
  const [liveGpsCoordinate, setLiveGpsCoordinate] = useState<MapCoordinate | null>(null);
  const [liveGpsHeading, setLiveGpsHeading] = useState<number | null>(null);
  const [isInAppCallOpen, setIsInAppCallOpen] = useState<boolean>(false);
  const [callTargetPassenger, setCallTargetPassenger] = useState<{
    name: string;
    photo?: string;
    note?: string;
  } | null>(null);

  // Counteroffer state
  const [counterOfferInput, setCounterOfferInput] = useState<Record<string, number>>({});
  const [showCounterBoxId, setShowCounterBoxId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Earnings & Goals state
  const [todayEarningsZMW, setTodayEarningsZMW] = useState<number>(420);
  const [todayTripsCount, setTodayTripsCount] = useState<number>(8);
  const commissionRatePercent = 10;

  // Driver Goals refresh trigger
  const [, setGoalsTick] = useState(0);
  const campaigns = DriverGoalsService.getCampaigns();
  const mainCampaign = campaigns[0];
  const mainProgress = DriverGoalsService.getDriverProgress('drv_chanda', mainCampaign.id);
  const rewardLedger = DriverGoalsService.getLedger();

  // Driver Eligible Services
  const [eligibleServices, setEligibleServices] = useState<{
    rides: boolean;
    cargo: boolean;
    boda: boolean;
  }>({
    rides: true,
    cargo: true,
    boda: false
  });

  // Subscribe to live passenger requests, ratings updates, and start live HTML5 GPS telemetry when online
  useEffect(() => {
    const unsubscribeDispatch = LiveDispatchChannelService.subscribe((msg) => {
      if (msg.type === 'NEW_RIDE_REQUEST') {
        setRequests((prev) => {
          const exists = prev.some((r) => r.id === msg.request.id);
          return exists ? prev : [msg.request, ...prev];
        });
        setBannerMessage(
          `Priority Dispatch Alert: New FairFare request from ${msg.request.passengerName} (${msg.request.pickup} → ${msg.request.destination}) at K${msg.request.passengerProposedFareZMW}.`
        );
      }
    });

    const handleRatingsRefresh = () => {
      setDriverRankings(DriverRankingService.getDriverRankings());
    };
    window.addEventListener('mrides:driver-ratings-updated', handleRatingsRefresh);

    let stopGps = () => {};
    if (isOnline) {
      stopGps = LiveDispatchChannelService.startLiveGpsTelemetry((coord) => {
        setLiveGpsCoordinate({ lat: coord.lat, lng: coord.lng });
        setLiveGpsHeading(coord.headingDegrees ?? null);
      });
    }

    return () => {
      unsubscribeDispatch();
      window.removeEventListener('mrides:driver-ratings-updated', handleRatingsRefresh);
      stopGps();
    };
  }, [isOnline]);

  const handleOpenInAppCall = (passengerName: string, passengerPhoto?: string, note?: string) => {
    setCallTargetPassenger({
      name: passengerName,
      photo: passengerPhoto,
      note
    });
    setIsInAppCallOpen(true);
  };

  const handleAcceptRequest = (req: RideRequest) => {
    setErrorMessage(null);
    FairFareEngine.createPassengerRequest({
      bookingId: req.id,
      passengerId: req.passengerId,
      passengerName: req.passengerName,
      proposedFareZMW: req.passengerProposedFareZMW
    });
    const confirm = FairFareEngine.confirmMutualAgreement({
      bookingId: req.id,
      driverId,
      driverName,
      agreedFareZMW: req.passengerProposedFareZMW
    });

    if (!confirm.success && !confirm.message.includes('already active')) {
      setErrorMessage(confirm.message);
      return;
    }

    LiveDispatchChannelService.broadcastDriverAction({
      type: 'DRIVER_ACCEPTED_REQUEST',
      requestId: req.id,
      driverName,
      agreedFareZMW: req.passengerProposedFareZMW
    });

    setActiveTrip(req);
    setTripStatus('driver_arriving');
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setBannerMessage(
      `Accepted ${req.passengerName}'s trip at K${req.passengerProposedFareZMW}. In-App Data Call & passenger contact unlocked.`
    );
    AiVoiceCopilotService.speakGuidance(
      `Mride Driver Co-Pilot: Trip accepted for ${req.passengerName} at ${req.passengerProposedFareZMW} Kwacha. Proceed to pickup at ${req.pickup}. Note: ${req.notes || 'Main entrance'}.`,
      true
    );
  };

  const handleSendCounterOffer = (req: RideRequest) => {
    setErrorMessage(null);
    const amount = counterOfferInput[req.id] || req.passengerProposedFareZMW + 5;
    const valid = FairFareEngine.validateFareAmount(amount, 22, 1500);
    if (!valid.valid) {
      setErrorMessage(valid.reason || 'Invalid counteroffer.');
      return;
    }

    LiveDispatchChannelService.broadcastDriverAction({
      type: 'DRIVER_COUNTER_OFFER',
      requestId: req.id,
      driverName,
      amountZMW: amount
    });

    // Important: A counteroffer must NOT automatically confirm the booking!
    setShowCounterBoxId(null);
    setBannerMessage(
      `Counteroffer K${amount} sent to ${req.passengerName}. Waiting for passenger to accept or counter.`
    );
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
    setBannerMessage('Request declined.');
  };

  const handleAdvanceActiveTrip = (nextStatus: RideTripStatus) => {
    if (!activeTrip) return;
    setErrorMessage(null);
    const check = TripSecurityAndStateService.validateRideTransition(tripStatus, nextStatus, 'driver');
    if (!check.valid) {
      setErrorMessage(check.message);
      return;
    }
    setTripStatus(nextStatus);

    if (nextStatus === 'passenger_picked_up') {
      AiVoiceCopilotService.speakGuidance(
        `Passenger ${activeTrip.passengerName} picked up at ${activeTrip.pickup}. Ready to start journey to ${activeTrip.destination}.`,
        true
      );
    } else if (nextStatus === 'in_progress') {
      AiVoiceCopilotService.speakGuidance(
        `Navigation active to ${activeTrip.destination}. Follow the highlighted orange route and directional arrows.`,
        true
      );
    } else if (nextStatus === 'completed') {
      const gross = activeTrip.passengerProposedFareZMW;
      const net = Math.round(gross * (1 - commissionRatePercent / 100));
      setTodayEarningsZMW((prev) => prev + net);
      setTodayTripsCount((prev) => prev + 1);

      const goalRes = DriverGoalsService.recordTripForGoals({
        driverId: 'drv_chanda',
        driverName,
        campaignId: mainCampaign.id,
        tripId: activeTrip.id,
        serviceType: 'rides',
        tripStatus: 'completed',
        isVerifiedTrip: true
      });
      setGoalsTick((t) => t + 1);
      setBannerMessage(
        `Trip completed! Earned K${net} net (after ${commissionRatePercent}% commission). ${goalRes.message}`
      );
      setActiveTrip(null);
    }
  };

  // Passenger Details Privacy View (Screen 3 of Driver App Reference)
  if (selectedPassengerRequest) {
    const isAccepted = activeTrip?.id === selectedPassengerRequest.id;
    const privacyView = TripSecurityAndStateService.getPassengerDetailsForDriver({
      requesterId: driverId,
      requesterRole: 'driver',
      bookingAccepted: isAccepted,
      assignedDriverId: isAccepted ? driverId : undefined,
      passenger: {
        name: selectedPassengerRequest.passengerName,
        phone: selectedPassengerRequest.passengerPhone,
        isVerified: selectedPassengerRequest.passengerVerified ?? true,
        rating: selectedPassengerRequest.passengerRating ?? 4.9,
        completedTrips: selectedPassengerRequest.passengerCompletedTrips ?? 23,
        pickupNote: selectedPassengerRequest.notes || 'Main entrance',
        paymentMethod: selectedPassengerRequest.paymentMethod === 'mtn_momo' ? 'MTN MoMo' : 'Cash',
        lastTripAgo: selectedPassengerRequest.passengerLastTrip || '2 days ago'
      }
    });

    const details = privacyView.data!;

    return (
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedPassengerRequest(null)}
            className="flex items-center gap-1 text-xs font-extrabold text-[#15191C] hover:text-[#FF6500]"
          >
            <ChevronLeft className="w-4 h-4" /> Passenger Details
          </button>
          {details.isVerified && (
            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Verified
            </span>
          )}
        </div>

        <div className="text-center space-y-2 pt-1">
          <img
            src={
              selectedPassengerRequest.passengerPhoto ||
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            }
            alt={details.displayName}
            className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#FF6500]"
          />
          <h2 className="text-lg font-extrabold text-[#15191C]">{details.displayName}</h2>
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#FF6500] fill-[#FF6500]" />
            <strong>{details.rating}</strong> (320) • {details.completedTrips} trips
          </p>
        </div>

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-[#F7F7F5] px-4">
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              {details.canDirectContact ? 'Phone (unlocked)' : 'Phone (masked)'}
            </span>
            <strong className="font-mono text-[#15191C]">{details.phoneDisplay}</strong>
          </div>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Pickup note
            </span>
            <strong className="text-[#15191C]">{details.pickupNote}</strong>
          </div>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" /> Payment method
            </span>
            <strong className="text-[#15191C]">{details.paymentMethod}</strong>
          </div>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> Last trip
            </span>
            <strong className="text-[#15191C]">{details.lastTripRelative}</strong>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F7F7F5] p-3.5 flex items-center gap-2.5 text-xs text-slate-600 border border-slate-200">
          <Lock className="w-4 h-4 text-[#FF6500] shrink-0" />
          <span>{details.privacyNotice}</span>
        </div>

        {isAccepted ? (
          <button
            onClick={() =>
              handleOpenInAppCall(
                selectedPassengerRequest.passengerName,
                selectedPassengerRequest.passengerPhoto,
                `Pickup: ${selectedPassengerRequest.pickup}`
              )
            }
            className="w-full rounded-xl bg-[#15191C] hover:bg-slate-800 text-white font-extrabold py-3 text-xs flex items-center justify-center gap-2"
          >
            <Wifi className="w-4 h-4 text-emerald-400" />
            In-App Data Call Passenger ({details.displayName})
          </button>
        ) : (
          <button
            onClick={() => {
              const req = selectedPassengerRequest;
              setSelectedPassengerRequest(null);
              handleAcceptRequest(req);
            }}
            className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs"
          >
            Accept K{selectedPassengerRequest.passengerProposedFareZMW} Trip
          </button>
        )}

        <InAppDataCallModal
          isOpen={isInAppCallOpen}
          onClose={() => setIsInAppCallOpen(false)}
          peerName={callTargetPassenger?.name || details.displayName}
          peerRoleLabel="Verified Mrides Passenger"
          peerPhoto={callTargetPassenger?.photo || selectedPassengerRequest.passengerPhoto}
          peerVehicleOrNote={callTargetPassenger?.note || details.pickupNote}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 max-w-xl mx-auto pb-2">
      {errorMessage && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 flex items-center gap-2 text-xs text-red-700 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {bannerMessage && (
        <div className="rounded-xl bg-[#FFF0E6] border border-[#FF6500]/30 p-2.5 text-xs font-semibold text-[#15191C]">
          {bannerMessage}
        </div>
      )}

      {/* ================= TAB 1: DRIVER DASHBOARD (Single-Screen No-Scroll Layout) ================= */}
      {activeTab === 'home' && (
        <div className="space-y-2.5">
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#FF6500] block">
                Mrides Driver App • Live GPS & AI Voice Co-Pilot
              </span>
              <h1 className="text-base font-extrabold text-[#15191C] leading-tight">Dashboard</h1>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  AiVoiceCopilotService.speakGuidance(
                    `Driver Co-Pilot active for ${driverName}. You are online in ${activeCity} with ${myDriverRecord.averageRating.toFixed(2)} stars and ${requests.length} open priority requests.`,
                    true
                  )
                }
                className="flex items-center gap-1 rounded-full bg-[#15191C] px-2.5 py-1.5 text-[10px] font-extrabold text-white hover:bg-[#FF6500]"
                title="AI Voice Briefing"
              >
                <Volume2 className="w-3 h-3 text-[#FF6500]" />
                <span>AI Voice</span>
              </button>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-colors ${
                  isOnline ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-white' : 'bg-slate-500'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>
          </div>

          {/* Priority Order Allocation & Rating Status Banner */}
          <div className="bg-[#15191C] text-white rounded-2xl p-3 border border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FF6500] text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FFE500] block">
                    Rating-Driven Dispatch Priority
                  </span>
                  <h3 className="text-xs font-extrabold text-white">{myDriverRecord.priorityTier}</h3>
                </div>
              </div>
              <span className="bg-white/10 text-[#FFE500] text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <Star className="w-3 h-3 fill-[#FFE500] text-[#FFE500]" />
                {myDriverRecord.averageRating.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {myDriverRecord.recentCompliments.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold bg-white/10 text-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#FF6500]" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Today's Earnings Card with Bar Chart */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Today's earnings</span>
                <span className="text-2xl font-extrabold text-[#15191C] block">K{todayEarningsZMW}</span>
                <span className="text-[11px] font-bold text-slate-600">{todayTripsCount} completed trips</span>
              </div>

              {/* Rising Bar Chart matching visual reference */}
              <div className="flex items-end gap-1 h-11">
                {[25, 38, 45, 58, 72, 85, 100].map((pct, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${pct}%` }}
                    className={`w-2 rounded-t-md ${idx >= 5 ? 'bg-[#FF6500]' : 'bg-[#FFF0E6]'}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              <div className="rounded-xl bg-[#F7F7F5] p-2">
                <span className="text-sm font-extrabold text-[#15191C] block">{todayTripsCount}</span>
                <span className="text-[10px] text-slate-500">Completed</span>
              </div>
              <div className="rounded-xl bg-[#F7F7F5] p-2">
                <span className="text-sm font-extrabold text-[#15191C] flex items-center gap-1">
                  {myDriverRecord.averageRating.toFixed(2)}{' '}
                  <Star className="w-3.5 h-3.5 text-[#FF6500] fill-[#FF6500]" />
                </span>
                <span className="text-[10px] text-slate-500">{myDriverRecord.fiveStarCount} 5-Star</span>
              </div>
              <div className="rounded-xl bg-[#FFF0E6] p-2">
                <span className="text-sm font-extrabold text-[#FF6500] block">
                  {myDriverRecord.allocatedOrdersToday}
                </span>
                <span className="text-[10px] font-bold text-[#15191C]">Priority Orders</span>
              </div>
            </div>
          </div>

          {/* Driver Goals Preview Card */}
          <div
            onClick={() => setActiveTab('goals')}
            className="cursor-pointer rounded-2xl bg-[#FFF0E6] border border-[#FF6500]/25 p-3 space-y-2 hover:border-[#FF6500] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-[#FF6500] text-white flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold text-[#FF6500] block">Driver Goals</span>
                  <h3 className="text-xs font-extrabold text-[#15191C]">
                    {mainCampaign.targetRides} rides in {mainCampaign.periodDays} days ({mainProgress.completedEligibleRides}/{mainCampaign.targetRides})
                  </h3>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#FF6500] bg-white px-2 py-0.5 rounded-full">
                +K{mainCampaign.rewardAmountZMW}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-[#FF6500] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((mainProgress.completedEligibleRides / mainCampaign.targetRides) * 100)
                  )}%`
                }}
              />
            </div>
          </div>

          {/* Quick Jump to Incoming Requests */}
          <button
            onClick={() => setActiveTab('requests')}
            className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <Inbox className="w-4 h-4" />
            View Priority Incoming Requests ({requests.length})
          </button>
        </div>
      )}

      {/* ================= TAB 2: INCOMING REQUESTS & ACTIVE TRIP ================= */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {/* Work Area Location & Radius Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#15191C] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF6500]" />
                Driver Operating Zone & Radius
              </span>
              <span className="text-[10px] font-bold text-slate-500">Max {maxRadiusKm} km</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={workAreaFilter}
                onChange={(e) => setWorkAreaFilter(e.target.value)}
                className="bg-[#F7F7F5] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#15191C]"
              >
                <option value="All Lusaka">All Lusaka Hubs</option>
                <option value="Lusaka CBD / Cairo Rd">Lusaka CBD / Cairo Rd</option>
                <option value="EastPark / UNZA">EastPark / UNZA / Arcades</option>
                <option value="Woodlands / Kabulonga">Woodlands / Kabulonga</option>
                <option value="Rhodes Park / Northmead">Rhodes Park / Northmead</option>
                <option value="Kamwala / Southgate">Kamwala / Southgate</option>
              </select>

              <select
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="bg-[#F7F7F5] border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#15191C]"
              >
                <option value={5}>Within 5 km radius</option>
                <option value={10}>Within 10 km radius</option>
                <option value={15}>Within 15 km radius</option>
                <option value={30}>All Lusaka Metro</option>
              </select>
            </div>
          </div>

          {activeTrip ? (
            <div className="bg-white rounded-2xl p-4 border-2 border-[#FF6500] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-[#FFF0E6] text-[#FF6500] text-xs font-extrabold px-3 py-1 rounded-full">
                  Active Confirmed Trip • {tripStatus.replace(/_/g, ' ')}
                </span>
                <span className="text-lg font-extrabold text-[#15191C]">
                  Agreed: K{activeTrip.passengerProposedFareZMW}
                </span>
              </div>

              <CountryStreetMap
                country={country}
                activeCity={activeCity}
                pickupName={activeTrip.pickup}
                destinationName={activeTrip.destination}
                driverLocation={liveGpsCoordinate}
                driverHeadingDegrees={liveGpsHeading}
                enableNavigationFollow={true}
                heightClass="h-[34vh] min-h-[240px]"
              />

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] gap-2">
                <div>
                  <span className="font-extrabold text-sm text-[#15191C] block">{activeTrip.passengerName}</span>
                  <span className="text-xs text-slate-600">Unlocked Phone: {activeTrip.passengerPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenInAppCall(
                        activeTrip.passengerName,
                        activeTrip.passengerPhoto,
                        `${activeTrip.pickup} → ${activeTrip.destination}`
                      )
                    }
                    className="rounded-xl bg-[#15191C] hover:bg-slate-800 text-white font-extrabold px-3 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#FF6500]" />
                    In-App Call
                  </button>
                  <button
                    onClick={() => setSelectedPassengerRequest(activeTrip)}
                    className="text-xs font-extrabold text-[#FF6500] hover:underline"
                  >
                    Details
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {tripStatus === 'driver_arriving' && (
                  <button
                    onClick={() => handleAdvanceActiveTrip('passenger_picked_up')}
                    className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-3 text-xs"
                  >
                    1. Confirm Passenger Picked Up at {activeTrip.pickup}
                  </button>
                )}
                {tripStatus === 'passenger_picked_up' && (
                  <button
                    onClick={() => handleAdvanceActiveTrip('in_progress')}
                    className="w-full rounded-xl bg-[#FF6500] text-white font-extrabold py-3 text-xs"
                  >
                    2. Start Journey to {activeTrip.destination}
                  </button>
                )}
                {tripStatus === 'in_progress' && (
                  <button
                    onClick={() => handleAdvanceActiveTrip('completed')}
                    className="w-full rounded-xl bg-emerald-600 text-white font-extrabold py-3 text-xs"
                  >
                    3. Complete Trip & Record Toward Driver Goals
                  </button>
                )}
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <p className="text-sm font-bold text-[#15191C]">All current dispatch requests handled</p>
              <button
                onClick={() => setRequests(MOCK_OPEN_RIDE_REQUESTS)}
                className="rounded-xl bg-[#FF6500] text-white font-bold px-4 py-2 text-xs"
              >
                Refresh Open Lusaka Requests
              </button>
            </div>
          ) : (
            requests
              .filter((req) => {
                if (workAreaFilter === 'All Lusaka') return true;
                return (
                  req.pickup.toLowerCase().includes(workAreaFilter.split('/')[0].trim().toLowerCase()) ||
                  req.destination.toLowerCase().includes(workAreaFilter.split('/')[0].trim().toLowerCase())
                );
              })
              .map((req) => {
              const netAfterCommission = Math.round(
                req.passengerProposedFareZMW * (1 - commissionRatePercent / 100)
              );
              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold text-[#15191C]">Incoming Request</h2>
                      <span className="bg-[#FFF0E6] text-[#FF6500] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Priority Matched ({myDriverRecord.averageRating.toFixed(2)}★)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {req.distanceKm || 5.2} km • {req.estimatedDurationMinutes || 12} min
                    </span>
                  </div>

                  <CountryStreetMap
                    country={country}
                    activeCity={activeCity}
                    pickupName={req.pickup}
                    destinationName={req.destination}
                    driverLocation={liveGpsCoordinate}
                    heightClass="h-[28vh] min-h-[210px]"
                  />

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF6500]" />
                      <strong className="text-[#15191C]">{req.pickup}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#15191C]" />
                      <strong className="text-[#15191C]">{req.destination}</strong>
                    </div>
                  </div>

                  {/* Passenger Details Summary Card */}
                  <div className="rounded-xl bg-[#F7F7F5] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          req.passengerPhoto ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={req.passengerName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-extrabold text-xs text-[#15191C] block">{req.passengerName}</span>
                        <span className="text-[11px] text-slate-600 flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#FF6500] fill-[#FF6500]" />
                          {req.passengerRating || 4.9} (320) • <strong className="text-emerald-700">Verified</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Pickup note: {req.notes || 'Main entrance'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPassengerRequest(req)}
                      className="text-xs font-extrabold text-[#FF6500] hover:underline"
                    >
                      View details
                    </button>
                  </div>

                  {/* Proposed Fare & Expected Net Earnings */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Proposed fare</span>
                      <span className="text-2xl font-extrabold text-[#15191C]">
                        K{req.passengerProposedFareZMW}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">
                        Est. net after {commissionRatePercent}% commission
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700">K{netAfterCommission}</span>
                    </div>
                  </div>

                  {showCounterBoxId === req.id && (
                    <div className="rounded-xl bg-[#FFF0E6] p-3 flex items-center gap-2">
                      <input
                        type="number"
                        value={counterOfferInput[req.id] ?? req.passengerProposedFareZMW + 5}
                        onChange={(e) =>
                          setCounterOfferInput({
                            ...counterOfferInput,
                            [req.id]: Number(e.target.value)
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-extrabold text-[#15191C]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendCounterOffer(req)}
                        className="rounded-lg bg-[#15191C] text-white font-bold px-3 py-2 text-xs"
                      >
                        Send Counter
                      </button>
                    </div>
                  )}

                  {/* Three Required Actions: Accept, Counter offer, Decline */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req)}
                      className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 text-xs shadow-xs"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCounterBoxId(showCounterBoxId === req.id ? null : req.id)}
                      className="w-full rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#15191C] font-extrabold py-2.5 text-xs"
                    >
                      Counter offer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(req.id)}
                      className="w-full rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold py-2.5 text-xs"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= TAB 3: DRIVER GOALS & REWARDS (Matches Screen 4 of Driver App Reference) ================= */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#15191C]">Driver Goals</h2>
            <span className="text-xs font-bold text-[#FF6500]">View history</span>
          </div>

          {/* Primary Orange Gradient Challenge Card */}
          <div className="rounded-3xl mrides-gradient text-white p-5 space-y-3 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-base">{mainCampaign.name}</h3>
                <p className="text-xs text-white/90">
                  Complete {mainCampaign.targetRides} rides in {mainCampaign.periodDays} days
                </p>
              </div>
              <span className="bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold">
                {mainProgress.rewardStatus === 'in_progress' ? 'In progress' : mainProgress.rewardStatus}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((mainProgress.completedEligibleRides / mainCampaign.targetRides) * 100)
                    )}%`
                  }}
                />
              </div>
              <span className="text-xs font-extrabold">
                {mainProgress.completedEligibleRides} / {mainCampaign.targetRides}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs font-bold">
              <span className="text-[#FFE500] text-sm font-extrabold">
                K{mainCampaign.rewardAmountZMW} reward
              </span>
              <span>
                3 days left • {Math.max(0, mainCampaign.targetRides - mainProgress.completedEligibleRides)}{' '}
                remaining
              </span>
            </div>
          </div>

          {/* Tiered Progress Milestones: 20 rides (K80) -> 50 rides (K200) -> 80 rides (K300) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Your progress</h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              {mainCampaign.tiers.map((tier) => {
                const reached = mainProgress.completedEligibleRides >= tier.targetRides;
                return (
                  <div
                    key={tier.id}
                    className={`rounded-2xl p-3 border ${
                      reached ? 'border-[#FF6500] bg-[#FFF0E6]' : 'border-slate-200 bg-[#F7F7F5]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center mb-1 text-xs font-extrabold ${
                        reached
                          ? 'bg-[#FF6500] text-white'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {reached ? <CheckCircle2 className="w-4 h-4" /> : <Trophy className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-extrabold text-[#15191C] block">{tier.label}</span>
                    <span className="text-xs font-bold text-[#FF6500]">K{tier.rewardAmountZMW}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Campaigns List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Active campaigns</h4>
            {campaigns.slice(1).map((cmp) => (
              <div
                key={cmp.id}
                className="rounded-2xl bg-[#F7F7F5] p-3.5 flex items-center justify-between border border-slate-200"
              >
                <div>
                  <span className="font-extrabold text-sm text-[#15191C] block">{cmp.name}</span>
                  <span className="text-xs text-slate-500">Complete {cmp.targetRides} rides</span>
                  <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">
                    K{cmp.rewardAmountZMW} reward
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Ends in 2 days</span>
              </div>
            ))}
          </div>

          {/* Eligibility & Disqualified Trip Explanations */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 text-xs">
            <h4 className="font-extrabold text-[#15191C]">Eligibility & Disqualified Trips</h4>
            <p className="text-slate-500">
              Only completed, verified rides count. Cancelled, duplicate or fraudulent trips are excluded. Min
              acceptance: {mainCampaign.minAcceptanceRatePercent}%.
            </p>
            {mainProgress.disqualifiedTrips.map((dq, i) => (
              <div
                key={i}
                className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 flex items-center justify-between text-[11px]"
              >
                <span>
                  <strong>{dq.tripId}</strong> ({dq.date})
                </span>
                <span className="font-bold text-amber-800 uppercase">Excluded: {dq.reason}</span>
              </div>
            ))}
          </div>

          {/* Auditable Reward Ledger */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs">
            <h4 className="font-extrabold text-[#15191C]">Reward Payout Ledger</h4>
            {rewardLedger.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <span className="font-bold text-[#15191C] block">{entry.campaignName}</span>
                  <span className="text-[10px] text-slate-400">Approved by {entry.approvedBy}</span>
                </div>
                <span className="font-extrabold text-emerald-700">
                  +K{entry.amountZMW} ({entry.status})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: EARNINGS & COMMISSIONS ================= */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#15191C]">Driver Settlement & Payouts</h2>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              Instant Payout Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#FFF0E6] p-4">
              <span className="text-xs font-bold text-slate-600 block">Net Balance Available</span>
              <span className="text-2xl font-extrabold text-[#15191C]">K{todayEarningsZMW}</span>
            </div>
            <div className="rounded-2xl bg-[#F7F7F5] p-4">
              <span className="text-xs font-bold text-slate-600 block">Commission Rate</span>
              <span className="text-2xl font-extrabold text-[#FF6500]">{commissionRatePercent}%</span>
            </div>
          </div>

          {/* Cash, Mobile Money & Card Settlement Options */}
          <div className="rounded-2xl border border-slate-200 bg-[#F7F7F5] p-3.5 space-y-3 text-xs">
            <h3 className="font-extrabold text-[#15191C] flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#FF6500]" /> Cash, Mobile Money & Bank Card Settlements
            </h3>
            <p className="text-slate-600">
              Withdraw earnings instantly to your preferred Zambian payout destination:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBannerMessage(`Payout of K${todayEarningsZMW} sent to MTN MoMo (+260 96 881 2290)`)}
                className="bg-amber-400 hover:bg-amber-500 text-amber-950 p-2.5 rounded-xl font-bold text-center border border-amber-500"
              >
                MTN MoMo
              </button>
              <button
                type="button"
                onClick={() => setBannerMessage(`Payout of K${todayEarningsZMW} sent to Airtel Money (+260 97 441 8820)`)}
                className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl font-bold text-center border border-red-700"
              >
                Airtel Money
              </button>
              <button
                type="button"
                onClick={() => setBannerMessage(`Payout of K${todayEarningsZMW} cleared to Bank Card / Stanbic Zambian Account`)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl font-bold text-center border border-blue-700"
              >
                Bank / Card
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-bold text-[#15191C]">Recent Settlement Records</p>
            <div className="p-3 rounded-xl bg-[#F7F7F5] flex justify-between">
              <span>Weekly Settlement (Airtel Money)</span>
              <strong className="text-[#15191C]">K2,450.00 • Settled</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F7F5] flex justify-between">
              <span>Passenger Cash Trip Balance Adjusted</span>
              <strong className="text-[#15191C]">K650.00 • Logged</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F7F5] flex justify-between">
              <span>Driver Challenge Bonus</span>
              <strong className="text-emerald-700">+K80.00 • Paid</strong>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: DRIVER FLOAT & DISPATCH WALLET ================= */}
      {activeTab === 'float' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#15191C] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#FF6500]" /> Driver Dispatch Float
              </h2>
              <p className="text-slate-500">Mride commission float required to receive incoming cash & mobile orders</p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-[11px] border border-emerald-200">
              Active Float
            </span>
          </div>

          {/* Current Non-Withdrawable Float Display */}
          <div className="rounded-2xl bg-gradient-to-br from-[#15191C] to-[#252E36] text-white p-4 space-y-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
              Current Non-Withdrawable Float Balance
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#FFE500]">
                K{driverFloatBalanceZMW}.00
              </span>
              <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-bold">
                Locked Commission Reserve
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Orders Dispatch Access:</span>
              <span className="font-extrabold text-emerald-400">UNRESTRICTED (Float &gt; K20 min)</span>
            </div>
          </div>

          {/* Non-Withdrawable Float Notice */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Important Float Policy Notice</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Driver Float is strictly used by the system to deduct Mride 10% platform commissions when you collect full cash or mobile money from passengers. <strong>Float balance cannot be withdrawn</strong>; it remains in your working dispatch wallet to keep your account receiving ride orders.
            </p>
          </div>

          {floatTopupSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{floatTopupSuccess}</span>
            </div>
          )}

          {/* Top-up Float Controls */}
          <div className="space-y-3 pt-1">
            <h3 className="font-extrabold text-slate-800">Top-up Driver Float</h3>
            
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmountZMW(amt)}
                  className={`py-2 rounded-xl font-extrabold text-xs transition-all border ${
                    topupAmountZMW === amt
                      ? 'bg-[#FF6500] text-white border-[#FF6500] shadow-xs'
                      : 'bg-[#F7F7F5] text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  +K{amt}
                </button>
              ))}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 block">Payment Channel:</label>
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setFloatPaymentMethod('mtn_momo')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    floatPaymentMethod === 'mtn_momo'
                      ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-400 font-bold'
                      : 'bg-[#F7F7F5] text-slate-700 border-slate-200'
                  }`}
                >
                  MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setFloatPaymentMethod('airtel_money')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    floatPaymentMethod === 'airtel_money'
                      ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-500'
                      : 'bg-[#F7F7F5] text-slate-700 border-slate-200'
                  }`}
                >
                  Airtel Money
                </button>
                <button
                  type="button"
                  onClick={() => setFloatPaymentMethod('card')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    floatPaymentMethod === 'card'
                      ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500'
                      : 'bg-[#F7F7F5] text-slate-700 border-slate-200'
                  }`}
                >
                  Visa Card
                </button>
                <button
                  type="button"
                  onClick={() => setFloatPaymentMethod('cash')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    floatPaymentMethod === 'cash'
                      ? 'bg-[#15191C] text-white border-[#15191C] ring-2 ring-slate-400'
                      : 'bg-[#F7F7F5] text-slate-700 border-slate-200'
                  }`}
                >
                  Cash Deposit
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDriverFloatBalanceZMW((prev) => prev + topupAmountZMW);
                setFloatTopupSuccess(
                  `Float topped up successfully by K${topupAmountZMW}.00 via ${floatPaymentMethod.toUpperCase()}! Your new float balance is K${driverFloatBalanceZMW + topupAmountZMW}.00.`
                );
              }}
              className="w-full bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3 rounded-xl text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              Pay & Deposit K{topupAmountZMW}.00 into Float
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: DRIVER PROFILE, RANKING & SERVICE SELECTION ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              alt={driverName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#FF6500]"
            />
            <div>
              <h2 className="text-base font-extrabold text-[#15191C]">{driverName}</h2>
              <p className="text-slate-500">Toyota Axio • White • Plate: BAC 1234</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  <ShieldCheck className="w-3 h-3" /> RTSA PSV & Identity Verified
                </span>
                <span className="inline-flex items-center gap-1 bg-[#FFF0E6] text-[#FF6500] font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                  <Star className="w-3 h-3 fill-[#FF6500]" /> {myDriverRecord.averageRating.toFixed(2)} (
                  {myDriverRecord.fiveStarCount} 5★)
                </span>
              </div>
            </div>
          </div>

          {/* Lusaka Driver Rating Leaderboard (Highest-Rated Drivers Get Most Orders) */}
          <div className="rounded-2xl bg-[#F7F7F5] border border-slate-200 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#15191C] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FF6500]" /> Lusaka Order Allocation Ranking
              </span>
              <span className="text-[10px] font-bold text-[#FF6500]">Most 5★ = Most Orders</span>
            </div>
            <div className="space-y-1.5">
              {driverRankings.map((drv, idx) => (
                <div
                  key={drv.driverId}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    drv.driverName === driverName
                      ? 'bg-[#FFF0E6] border-[#FF6500]/40'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#15191C] text-white font-extrabold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-extrabold text-[#15191C] block">
                        {drv.driverName} {drv.driverName === driverName ? '(You)' : ''}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {drv.averageRating.toFixed(2)}★ • {drv.fiveStarCount} five-star trips
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-[#FF6500] block">
                      {drv.allocatedOrdersToday} orders/day
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700">{drv.priorityTier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Document Expiry Reminders */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2.5 text-amber-900">
            <Bell className="w-4 h-4 text-[#FF6500] shrink-0" />
            <div>
              <strong className="block">Document Expiry Reminder</strong>
              <span>RTSA Road Fitness Disc expires in 24 days (20 Nov 2026).</span>
            </div>
          </div>

          {/* Eligible Service Toggles */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-[#15191C]">Eligible Services</h3>
            {(
              [
                { key: 'rides', label: 'Passenger Rides (Economy & Comfort)', icon: Car },
                { key: 'cargo', label: 'Light Parcel & Box Cargo Delivery', icon: Truck },
                { key: 'boda', label: 'Boda-Boda Motorcycle Delivery (Requires Registered Bike)', icon: Bike }
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7F7F5] border border-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2 font-bold text-[#15191C]">
                  <Icon className="w-4 h-4 text-[#FF6500]" /> {label}
                </span>
                <input
                  type="checkbox"
                  checked={eligibleServices[key]}
                  onChange={(e) => setEligibleServices({ ...eligibleServices, [key]: e.target.checked })}
                  className="accent-[#FF6500] w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Driver App Sticky Bottom Navigation (Home, Requests, Float, Goals, Earnings, Profile) */}
      <nav className="sticky bottom-0 inset-x-0 bg-white border border-slate-200 rounded-2xl p-1.5 flex justify-around items-center shadow-md">
        {(
          [
            { id: 'home', label: 'Home', icon: Home },
            { id: 'requests', label: 'Requests', icon: Inbox },
            { id: 'float', label: 'Float', icon: Wallet },
            { id: 'goals', label: 'Goals', icon: Trophy },
            { id: 'earnings', label: 'Earnings', icon: Wallet },
            { id: 'profile', label: 'Profile', icon: UserRound }
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
                active ? 'text-[#FF6500] bg-[#FFF0E6]' : 'text-slate-500 hover:text-[#15191C]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* In-App VoIP Data Call Modal for Driver -> Passenger */}
      <InAppDataCallModal
        isOpen={isInAppCallOpen}
        onClose={() => setIsInAppCallOpen(false)}
        peerName={callTargetPassenger?.name || 'Passenger'}
        peerRoleLabel="Verified Mrides Passenger"
        peerPhoto={callTargetPassenger?.photo}
        peerVehicleOrNote={callTargetPassenger?.note}
      />
    </div>
  );
};

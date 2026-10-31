import React, { useState } from 'react';
import {
  Bike,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  RotateCcw,
  KeyRound,
  Phone
} from 'lucide-react';
import { BodaRiderBid, DeliveryTripStatus, RideHistoryItem } from '../../types';
import { MOCK_BODA_RIDERS } from '../../data/mockData';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';
import { CountryStreetMap } from '../common/CountryStreetMap';
import { FairFareEngine } from '../../services/fairFareEngine';
import { TripSecurityAndStateService } from '../../services/tripStateMachine';
import { InAppDataCallModal } from '../common/InAppDataCallModal';
import { DriverRankingService } from '../../services/driverRankingService';

const BODA_RATING_TAGS = [
  'Good Communication',
  'Fast & Safe Rider',
  'Polite & Respectful',
  'Careful Package Handling',
  'On-Time Delivery'
];

interface BodaDeliveryViewProps {
  activeCity?: string;
  country?: CountryConfig;
  onDeliveryCompleted?: (item: RideHistoryItem) => void;
}

export const BodaDeliveryView: React.FC<BodaDeliveryViewProps> = ({
  activeCity = 'Lusaka',
  country = DEFAULT_COUNTRY,
  onDeliveryCompleted
}) => {
  const [pickup, setPickup] = useState('Cavendish University');
  const [destination, setDestination] = useState('EastPark Mall');
  const [recipientName, setRecipientName] = useState('Mutinta Mwanza');
  const [recipientPhone, setRecipientPhone] = useState('+260 97 441 8820');
  const [packageCategory, setPackageCategory] = useState('Small Parcel / Box');
  const [packageWeightKg, setPackageWeightKg] = useState<number>(4);
  const [packageNotes, setPackageNotes] = useState('Fragile electronics box — hand directly to recipient at reception.');
  const [proposedFareZMW, setProposedFareZMW] = useState<number>(40);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [deliveryState, setDeliveryState] = useState<DeliveryTripStatus>('requested');
  const [stepMode, setStepMode] = useState<'form' | 'offers' | 'active_delivery' | 'completed'>('form');
  const [riderBids, setRiderBids] = useState<BodaRiderBid[]>(MOCK_BODA_RIDERS);
  const [selectedRider, setSelectedRider] = useState<BodaRiderBid | null>(null);
  const [counterModalRider, setCounterModalRider] = useState<BodaRiderBid | null>(null);
  const [passengerReOfferZMW, setPassengerReOfferZMW] = useState<number>(42);
  const [negotiationRound, setNegotiationRound] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Security PIN codes for pickup & recipient confirmation
  const [pickupCode] = useState('4290');
  const [deliveryCode] = useState('8154');
  const [enteredPickupCode, setEnteredPickupCode] = useState('4290');
  const [enteredDeliveryCode, setEnteredDeliveryCode] = useState('8154');
  const [deliveryProofNote] = useState('Signed and received by Mutinta Mwanza at EastPark reception.');

  // In-App Data Call & Rider Rating State
  const [isBodaCallOpen, setIsBodaCallOpen] = useState(false);
  const [riderStars, setRiderStars] = useState<number>(5);
  const [riderCompliments, setRiderCompliments] = useState<string[]>([
    'Good Communication',
    'Polite & Respectful',
    'Careful Package Handling'
  ]);

  const categories = [
    'Documents & Envelopes',
    'Small Parcel / Box',
    'Pharmacy & Medical',
    'Groceries & Everyday Items',
    'Spare Parts & Keys'
  ];

  const handleSubmitBodaRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const eligibility = TripSecurityAndStateService.checkVehicleEligibilityForCargo({
      weightKg: packageWeightKg,
      category: `${packageCategory} ${packageNotes}`,
      selectedVehicleTier: 'boda_courier'
    });

    if (!eligibility.eligible) {
      setErrorMsg(eligibility.reason || 'Package is not eligible for Boda-Boda delivery.');
      return;
    }

    const fareValid = FairFareEngine.validateFareAmount(proposedFareZMW, 25, 250);
    if (!fareValid.valid) {
      setErrorMsg(fareValid.reason || 'Invalid proposed delivery fare.');
      return;
    }

    const bookingId = `boda_${Date.now()}`;
    FairFareEngine.createPassengerRequest({
      bookingId,
      passengerId: 'usr_zm_0981',
      passengerName: 'Chanda M.',
      proposedFareZMW,
      minFareZMW: 25,
      maxFareZMW: 250
    });

    setDeliveryState('offer_received');
    setStepMode('offers');
    setStatusBanner(`FairFare request broadcast at K${proposedFareZMW}. 2 verified Boda riders responded.`);
  };

  const handleAcceptRider = (rider: BodaRiderBid, finalFare: number) => {
    setErrorMsg(null);
    setSelectedRider({ ...rider, offeredFareZMW: finalFare, status: 'accepted' });
    setProposedFareZMW(finalFare);
    setDeliveryState('arriving_at_pickup');
    setStepMode('active_delivery');
    setCounterModalRider(null);
    setStatusBanner(`Fare K${finalFare} locked with ${rider.riderName} (${rider.bikePlate}).`);
  };

  const handlePassengerReOffer = () => {
    if (!counterModalRider) return;
    if (negotiationRound >= 3) {
      setErrorMsg('You can negotiate up to 3 times. Please accept K' + counterModalRider.offeredFareZMW + ' or decline.');
      return;
    }
    const valid = FairFareEngine.validateFareAmount(passengerReOfferZMW, 25, 250);
    if (!valid.valid) {
      setErrorMsg(valid.reason || 'Offer out of range.');
      return;
    }
    setNegotiationRound(prev => prev + 1);
    const updatedBids = riderBids.map(b =>
      b.id === counterModalRider.id
        ? { ...b, offeredFareZMW: passengerReOfferZMW, status: 'pending' as const }
        : b
    );
    setRiderBids(updatedBids);
    setCounterModalRider(null);
    setStatusBanner(`Round ${negotiationRound + 1}/3: Counteroffer K${passengerReOfferZMW} accepted by ${counterModalRider.riderName}!`);
  };

  const handleAdvanceDeliveryState = (nextState: DeliveryTripStatus) => {
    setErrorMsg(null);
    const check = TripSecurityAndStateService.validateDeliveryTransition({
      current: deliveryState,
      next: nextState,
      providedCode: nextState === 'item_collected' ? enteredPickupCode : nextState === 'delivered' ? enteredDeliveryCode : undefined,
      expectedPickupCode: pickupCode,
      expectedDeliveryCode: deliveryCode
    });

    if (!check.valid) {
      setErrorMsg(check.message);
      return;
    }

    setDeliveryState(nextState);
    if (nextState === 'delivered' && selectedRider) {
      setStepMode('completed');
      onDeliveryCompleted?.({
        id: `boda_done_${Date.now()}`,
        ticketNumber: `MRD-BODA-${Date.now().toString().slice(-4)}`,
        serviceType: 'boda',
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pickup,
        destination,
        driverName: selectedRider.riderName,
        driverPhone: selectedRider.riderPhone,
        driverRating: selectedRider.rating,
        driverPhoto: selectedRider.riderPhoto,
        vehicleModel: selectedRider.bikeModel,
        vehiclePlate: selectedRider.bikePlate,
        fareZMW: proposedFareZMW,
        paymentMethod: 'cash',
        status: 'completed',
        countryCode: country.code,
        notes: `Boda Delivery • Proof: ${deliveryProofNote}`
      });
    }
  };

  const handleReset = () => {
    setStepMode('form');
    setDeliveryState('requested');
    setSelectedRider(null);
    setRiderBids(MOCK_BODA_RIDERS);
    setNegotiationRound(1);
    setErrorMsg(null);
    setStatusBanner(null);
  };

  return (
    <div className="space-y-2.5">
      {/* Top Map - Opens when user enters locations or on active trip */}
      {(isMapOpen || stepMode !== 'form') && (
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm animate-in fade-in duration-200">
          <CountryStreetMap
            country={country}
            activeCity={activeCity}
            pickupName={pickup}
            destinationName={destination}
            heightClass="h-[22vh] min-h-[160px] max-h-[210px]"
            onPickupChanged={stepMode === 'form' ? (newPick) => setPickup(newPick) : undefined}
            onDestinationChanged={stepMode === 'form' ? (newDest) => setDestination(newDest) : undefined}
          />
          <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-xs">
            <span className="w-5 h-5 rounded-lg bg-[#FF6500] text-white flex items-center justify-center">
              <Bike className="w-3 h-3" />
            </span>
            <div>
              <span className="text-[11px] font-extrabold text-[#15191C] block leading-none">Mrides Boda Delivery</span>
              <span className="text-[9px] text-slate-500">Fast courier • Max 25 kg</span>
            </div>
          </div>
          {stepMode === 'form' && (
            <button
              type="button"
              onClick={() => setIsMapOpen(false)}
              className="absolute top-2.5 right-2.5 z-20 bg-white/90 hover:bg-white text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs border border-slate-200"
            >
              Hide Map
            </button>
          )}
        </div>
      )}

      {/* Quick Map Bar if closed in form mode */}
      {!isMapOpen && stepMode === 'form' && (
        <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-5 h-5 rounded-lg bg-[#FF6500] text-white flex items-center justify-center shrink-0">
              <Bike className="w-3 h-3" />
            </span>
            <span className="text-[11px] font-bold text-slate-800 truncate">{pickup} → {destination}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="text-[10px] font-bold text-[#FF6500] hover:underline shrink-0 pl-2"
          >
            Show Route Map
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-700 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {statusBanner && (
        <div className="rounded-xl bg-[#FFF0E6] border border-[#FF6500]/30 p-3 flex items-center justify-between text-xs text-[#15191C]">
          <span className="font-semibold">{statusBanner}</span>
          {stepMode !== 'form' && (
            <button
              onClick={handleReset}
              className="text-[#FF6500] font-bold flex items-center gap-1 hover:underline ml-2 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Delivery
            </button>
          )}
        </div>
      )}

      {/* STEP 1: BODA REQUEST FORM & FAIRFARE SLIDER (COMPACT SINGLE SCREEN) */}
      {stepMode === 'form' && (
        <form onSubmit={handleSubmitBodaRequest} className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-extrabold text-[#15191C] flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-[#FF6500]" /> Send Package by Boda
              </h2>
              <p className="text-[11px] text-slate-500">Fast express motorcycle courier in Lusaka</p>
            </div>
            <span className="bg-[#FFF0E6] text-[#FF6500] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
              K35 – K50 • 12m
            </span>
          </div>

          {/* Route Inputs (Compact 2-col) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-[#F7F7F5] px-2.5 py-1.5">
              <label className="block text-[9px] font-bold uppercase text-slate-500">Pickup</label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF6500] shrink-0" />
                <input
                  type="text"
                  value={pickup}
                  onFocus={() => setIsMapOpen(true)}
                  onChange={(e) => {
                    setPickup(e.target.value);
                    setIsMapOpen(true);
                  }}
                  className="w-full bg-transparent text-xs font-semibold text-[#15191C] outline-none"
                  required
                />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#F7F7F5] px-2.5 py-1.5">
              <label className="block text-[9px] font-bold uppercase text-slate-500">Drop-off</label>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#15191C] shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onFocus={() => setIsMapOpen(true)}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setIsMapOpen(true);
                  }}
                  className="w-full bg-transparent text-xs font-semibold text-[#15191C] outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Recipient Details (Compact 2-col) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Recipient</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Receiver name"
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-[#15191C]"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Phone</label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+260 97 ..."
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-[#15191C]"
                required
              />
            </div>
          </div>

          {/* Package Category & Weight (Compact row) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category</label>
              <select
                value={packageCategory}
                onChange={(e) => setPackageCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-[#15191C] bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Weight (kg)</label>
              <input
                type="number"
                min={0.5}
                max={25}
                step={0.5}
                value={packageWeightKg}
                onChange={(e) => setPackageWeightKg(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-[#15191C]"
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              value={packageNotes}
              onChange={(e) => setPackageNotes(e.target.value)}
              placeholder="Package notes: e.g. Fragile box, hand to reception"
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] text-[#15191C]"
            />
          </div>

          {/* FairFare Offer Adjuster (- / + inline) */}
          <div className="rounded-xl bg-[#FFF0E6] border border-[#FF6500]/25 p-2.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6500]" />
                <span className="text-[11px] font-extrabold text-[#15191C]">Your FairFare Offer</span>
              </div>
              <span className="text-[10px] text-slate-500">Min K25 • Fair market rate</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProposedFareZMW((prev) => Math.max(25, prev - 5))}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs"
              >
                -
              </button>
              <span className="text-lg font-black text-[#15191C] min-w-[54px] text-center">
                K{proposedFareZMW}
              </span>
              <button
                type="button"
                onClick={() => setProposedFareZMW((prev) => Math.min(150, prev + 5))}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-2xs"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-2.5 text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Bike className="w-4 h-4" />
            Find Boda Riders (Offer K{proposedFareZMW})
          </button>
        </form>
      )}

      {/* STEP 2: INCOMING BODA RIDER OFFERS & COUNTEROFFERS */}
      {stepMode === 'offers' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#15191C]">Boda Rider Offers</h3>
              <p className="text-xs text-slate-500">{riderBids.length} verified riders match your delivery</p>
            </div>
            <span className="text-xs font-bold bg-[#F7F7F5] px-2.5 py-1 rounded-lg text-slate-700">
              Your Offer: K{proposedFareZMW}
            </span>
          </div>

          <div className="space-y-3">
            {riderBids.map((rider) => (
              <div key={rider.id} className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 bg-white shadow-2xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.riderPhoto}
                      alt={rider.riderName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#15191C]">{rider.riderName}</span>
                        {rider.isVerified && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <strong className="text-[#15191C]">{rider.rating}</strong> ({rider.completedDeliveries} deliveries) • {rider.etaMinutes} min away
                      </p>
                      <p className="text-[11px] text-slate-500">{rider.bikeModel} • {rider.bikePlate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-[#15191C] block">K{rider.offeredFareZMW}</span>
                    {rider.offeredFareZMW > proposedFareZMW && (
                      <span className="text-[10px] font-bold text-[#FF6500]">Counteroffer</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAcceptRider(rider, rider.offeredFareZMW)}
                    className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-bold py-2.5 text-xs transition-colors"
                  >
                    Accept K{rider.offeredFareZMW}
                  </button>
                  <button
                    onClick={() => {
                      setCounterModalRider(rider);
                      setPassengerReOfferZMW(proposedFareZMW + 2);
                    }}
                    className="rounded-xl border border-slate-300 hover:bg-slate-50 text-[#15191C] font-bold py-2.5 text-xs"
                  >
                    Make another offer
                  </button>
                  <button
                    onClick={() => setRiderBids(prev => prev.filter(r => r.id !== rider.id))}
                    className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 text-slate-500 hover:text-red-600 font-semibold py-2.5 text-xs"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counteroffer Modal */}
      {counterModalRider && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img src={counterModalRider.riderPhoto} alt="" className="w-11 h-11 rounded-full object-cover" />
              <div>
                <h4 className="font-extrabold text-sm text-[#15191C]">{counterModalRider.riderName}</h4>
                <p className="text-xs text-slate-500">Rider wants K{counterModalRider.offeredFareZMW} for this delivery</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Your Counteroffer (Round {negotiationRound} of 3)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={passengerReOfferZMW}
                  onChange={(e) => setPassengerReOfferZMW(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg font-extrabold text-[#15191C]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">You can negotiate up to 3 times.</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleAcceptRider(counterModalRider, counterModalRider.offeredFareZMW)}
                className="w-full rounded-xl bg-[#FF6500] text-white font-bold py-2.5 text-xs"
              >
                Accept Rider's K{counterModalRider.offeredFareZMW}
              </button>
              <button
                onClick={handlePassengerReOffer}
                className="w-full rounded-xl border border-[#15191C] text-[#15191C] font-bold py-2.5 text-xs"
              >
                Send K{passengerReOfferZMW} Offer
              </button>
              <button
                onClick={() => setCounterModalRider(null)}
                className="w-full rounded-xl text-slate-500 font-semibold py-2 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONTROLLED BODA DELIVERY TRACKING & PIN CONFIRMATION */}
      {stepMode === 'active_delivery' && selectedRider && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <img src={selectedRider.riderPhoto} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-[#15191C]">{selectedRider.riderName}</h3>
                  <span className="bg-[#FFF0E6] text-[#FF6500] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {deliveryState.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{selectedRider.bikeModel} • <strong>{selectedRider.bikePlate}</strong></p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsBodaCallOpen(true)}
                className="rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-3 py-2 text-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> In-App Call
              </button>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Locked Fare</span>
                <span className="text-xl font-extrabold text-[#15191C] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#FF6500]" /> K{proposedFareZMW}
                </span>
              </div>
            </div>
          </div>

          {/* Security Pickup & Delivery PIN Codes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F7F7F5] p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#FF6500]" /> Pickup Code (Sender)
                </span>
                <span className="font-mono font-extrabold text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pickupCode}
                </span>
              </div>
              <input
                type="text"
                value={enteredPickupCode}
                onChange={(e) => setEnteredPickupCode(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono"
                placeholder="Enter pickup PIN to confirm collection"
              />
            </div>

            <div className="rounded-xl bg-[#F7F7F5] p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" /> Delivery Code (Recipient)
                </span>
                <span className="font-mono font-extrabold text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                  {deliveryCode}
                </span>
              </div>
              <input
                type="text"
                value={enteredDeliveryCode}
                onChange={(e) => setEnteredDeliveryCode(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono"
                placeholder="Enter recipient PIN to confirm delivery"
              />
            </div>
          </div>

          {/* Controlled State Progression Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {deliveryState === 'arriving_at_pickup' && (
              <button
                onClick={() => handleAdvanceDeliveryState('item_collected')}
                className="flex-1 rounded-xl bg-[#FF6500] text-white font-bold py-3 text-xs"
              >
                1. Confirm Package Collected (Verify Pickup PIN {pickupCode})
              </button>
            )}
            {deliveryState === 'item_collected' && (
              <button
                onClick={() => handleAdvanceDeliveryState('in_transit')}
                className="flex-1 rounded-xl bg-[#FF6500] text-white font-bold py-3 text-xs"
              >
                2. Start Boda In-Transit to {destination}
              </button>
            )}
            {deliveryState === 'in_transit' && (
              <button
                onClick={() => handleAdvanceDeliveryState('delivered')}
                className="flex-1 rounded-xl bg-emerald-600 text-white font-bold py-3 text-xs"
              >
                3. Confirm Recipient Delivery (Verify PIN {deliveryCode})
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: COMPLETED & RIDER RATING */}
      {stepMode === 'completed' && selectedRider && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FF6500] text-white mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-extrabold text-[#15191C]">Boda Delivery Completed!</h3>
          <p className="text-2xl font-extrabold text-[#15191C]">K{proposedFareZMW}</p>
          <p className="text-xs text-slate-500">{deliveryProofNote}</p>

          {/* Rider Rating & Compliments */}
          <div className="rounded-2xl bg-[#F7F7F5] p-4 border border-slate-200 space-y-3">
            <p className="text-xs font-extrabold text-[#15191C]">
              Rate {selectedRider.riderName} (Highest-rated riders get priority orders)
            </p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRiderStars(star)}
                  className="p-1"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= riderStars ? 'text-[#FF6500] fill-[#FF6500]' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {BODA_RATING_TAGS.map((tag) => {
                const active = riderCompliments.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setRiderCompliments((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      active
                        ? 'bg-[#FF6500] border-[#FF6500] text-white'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {active ? `✓ ${tag}` : tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              DriverRankingService.submitDriverRating({
                driverId: selectedRider.id,
                driverName: selectedRider.riderName,
                stars: riderStars,
                compliments: riderCompliments
              });
              handleReset();
            }}
            className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold px-6 py-3 text-xs"
          >
            Submit Rider Rating & Done
          </button>
        </div>
      )}

      {selectedRider && (
        <InAppDataCallModal
          isOpen={isBodaCallOpen}
          onClose={() => setIsBodaCallOpen(false)}
          peerName={selectedRider.riderName}
          peerRoleLabel="Verified Mrides Boda Courier"
          peerPhoto={selectedRider.riderPhoto}
          peerVehicleOrNote={`${selectedRider.bikeModel} • ${selectedRider.bikePlate}`}
        />
      )}
    </div>
  );
};

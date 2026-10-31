import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Phone,
  Check
} from 'lucide-react';
import { 
  CargoVehicleTierOption, 
  CargoQuoteBid,
  UserRole
} from '../../types';
import { 
  MOCK_CARGO_TIERS,
  MOCK_CARGO_QUOTES 
} from '../../data/mockData';
import { CountryStreetMap } from '../common/CountryStreetMap';
import { LocationSelector } from '../common/YangoLocationSelector';
import { CountryConfig, DEFAULT_COUNTRY } from '../../data/africanCountries';

interface CargoViewProps {
  currentRole?: UserRole;
  activeCity?: string;
  country?: CountryConfig;
}

export const CargoView: React.FC<CargoViewProps> = ({ 
  currentRole = 'customer',
  activeCity = 'Lusaka',
  country = DEFAULT_COUNTRY
}) => {
  // Consignor / Customer state
  const [pickup, setPickup] = useState(country.defaultPickup);
  const [destination, setDestination] = useState(country.defaultDestination);
  const [hasIntermediateStop, setHasIntermediateStop] = useState(false);
  const [intermediateStop, setIntermediateStop] = useState('');
  const [selectedTier, setSelectedTier] = useState<CargoVehicleTierOption>(MOCK_CARGO_TIERS[2]); // 1-Ton Pickup
  const [cargoCategory, setCargoCategory] = useState('Household Furniture & Appliances');
  const [description, setDescription] = useState('Living room sofas, coffee table and 4 moving boxes');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [helpersCount, setHelpersCount] = useState<number>(1); // 0, 1 (+50 ZMW), or 2 (+100 ZMW)
  const [isFragile, setIsFragile] = useState(false);
  const [proposedPriceZMW, setProposedPriceZMW] = useState(MOCK_CARGO_TIERS[2].baseZMW + 50);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [cargoState, setCargoState] = useState<'form' | 'bidding' | 'booked'>('form');
  const quotes = MOCK_CARGO_QUOTES;
  const [selectedQuote, setSelectedQuote] = useState<CargoQuoteBid | null>(null);

  // Transporter Operator Mode State
  const [operatorBidsSubmitted, setOperatorBidsSubmitted] = useState<string[]>([]);
  const [operatorQuoteInput, setOperatorQuoteInput] = useState<number>(340);

  useEffect(() => {
    setPickup(country.defaultPickup);
    setDestination(country.defaultDestination);
  }, [country.code, country.defaultPickup, country.defaultDestination]);

  const categories = [
    'Household Furniture & Appliances',
    'Parcels, Boxes & Documents',
    'Farm Produce & Agricultural Bags (Maize, Soya)',
    'Building Materials, Cement & Timber',
    'Commercial Retail Stock & Electronics'
  ];

  const handleSelectTier = (tier: CargoVehicleTierOption) => {
    setSelectedTier(tier);
    setProposedPriceZMW(tier.baseZMW + (helpersCount * 50));
  };

  const handleHelperChange = (count: number) => {
    setHelpersCount(count);
    setProposedPriceZMW(selectedTier.baseZMW + (count * 50));
  };

  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setCargoState('bidding');
  };

  const handleAcceptQuote = (quote: CargoQuoteBid) => {
    setSelectedQuote(quote);
    setProposedPriceZMW(quote.quotedFareZMW);
    setCargoState('booked');
  };

  const isOperatorView = currentRole === 'cargo_operator';

  return (
    <div className="mride-service-view mride-cargo space-y-4">
      {/* Cargo Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-50 text-[#D96B24]">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold font-display text-slate-900">
              {isOperatorView ? 'Mride Transporter Dispatch' : 'Mride Cargo'}
            </h1>
            <span className="bg-[#FFF2E8] text-[#8A3F16] text-xs font-bold px-2.5 py-1 rounded-full">
              {isOperatorView ? 'Haulage Tender Board' : 'Freight & Multi-Tier Haulage'}
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            {isOperatorView 
              ? 'Review open cargo haulage jobs across Lusaka, inspect cargo tonnage and submit quotes.'
              : 'Choose the right vehicle, describe your goods and compare transporter quotes before confirming.'}
          </p>
        </div>

        {!isOperatorView && cargoState !== 'form' && (
          <button
            onClick={() => setCargoState('form')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-[#0F1E36] bg-[#F1F5F2] hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Cargo Request
          </button>
        )}
      </div>

      {/* OPERATOR ROLE DISPATCH VIEW */}
      {isOperatorView ? (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Open Lusaka Freight Haulage Jobs</h3>
              <p className="text-xs text-slate-500">Verified consignors seeking transport</p>
            </div>
            <span className="bg-[#FF7A00] text-[#0F1E36] text-xs font-bold px-2.5 py-1 rounded-full">
              2 Active Tenders
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#F1F5F2] border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Household Relocation (Sofas & Boxes)</span>
                    <span className="bg-[#0F1E36] text-[#FF7A00] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      1-Ton Pickup
                    </span>
                    <span className="bg-orange-100 text-orange-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      1 Porter Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Route: <strong>Woodlands Shopping Mall</strong> ➔ <strong>Matero Main Market</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Consignor: Chileshe Mulenga (+260 97 789 4432)
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Consignor Budget</span>
                  <span className="text-2xl font-extrabold text-[#0F1E36]">ZMW 370</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-semibold">Your Quote (ZMW):</span>
                  <input
                    type="number"
                    value={operatorQuoteInput}
                    onChange={(e) => setOperatorQuoteInput(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-xs"
                  />
                </div>

                {operatorBidsSubmitted.includes('job_1') ? (
                  <span className="text-xs font-bold text-orange-700 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
                    <Check className="w-3.5 h-3.5" /> Quote Submitted (ZMW {operatorQuoteInput})
                  </span>
                ) : (
                  <button
                    onClick={() => setOperatorBidsSubmitted([...operatorBidsSubmitted, 'job_1'])}
                    className="bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Submit Haulage Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CONSIGNOR ROLE WORKFLOW */
        <div className="space-y-3">
          {/* Top Map - Only opens when entering locations or active booking */}
          {cargoState !== 'booked' && (isMapOpen || cargoState === 'bidding') && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm relative animate-in fade-in duration-200" aria-label="Cargo route map">
              <CountryStreetMap
                country={country}
                activeCity={activeCity}
                pickupName={pickup}
                destinationName={destination}
                heightClass="h-44 sm:h-52"
              />
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white/95 border-t border-slate-100">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Cargo route</p>
                  <p className="truncate text-xs font-semibold text-slate-800">{pickup} <span className="text-[#D96B24]">to</span> {destination}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                >
                  Hide Map
                </button>
              </div>
            </section>
          )}

          {/* Quick Route Bar when Map is Closed */}
          {cargoState === 'form' && !isMapOpen && (
            <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-2xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-lg bg-[#FF7900] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-3 h-3" />
                </span>
                <span className="text-[11px] font-bold text-slate-800 truncate">{pickup} → {destination}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="text-[10px] font-bold text-[#FF7900] hover:underline shrink-0 pl-2"
              >
                Show Route Map
              </button>
            </div>
          )}

          {/* Cargo Configuration Form */}
          <div className="w-full space-y-3">
            <form onSubmit={handlePostRequest} className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#D96B24]" />
                    Cargo Shipment Details
                  </h2>
                  <span className="text-[10px] font-bold bg-[#FFF2E8] text-[#8A3F16] px-2 py-0.5 rounded-full">{activeCity}</span>
                </div>
                <div onFocus={() => setIsMapOpen(true)}>
                  <LocationSelector
                    pickup={pickup}
                    setPickup={(val) => {
                      setPickup(val);
                      setIsMapOpen(true);
                    }}
                    destination={destination}
                    setDestination={(val) => {
                      setDestination(val);
                      setIsMapOpen(true);
                    }}
                    hasIntermediateStop={hasIntermediateStop}
                    setHasIntermediateStop={setHasIntermediateStop}
                    intermediateStop={intermediateStop}
                    setIntermediateStop={setIntermediateStop}
                    activeCity={activeCity}
                    country={country}
                    disabled={cargoState !== 'form'}
                  />
                </div>

                {/* Sender & Receiver Info (Compact 2-col) */}
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-[#FAFAFA] p-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 block">Sender</label>
                    <input
                      type="text"
                      required
                      disabled={cargoState !== 'form'}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Sender Name"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium"
                    />
                    <input
                      type="tel"
                      required
                      disabled={cargoState !== 'form'}
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600 block">Receiver</label>
                    <input
                      type="text"
                      required
                      disabled={cargoState !== 'form'}
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Receiver Name"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium"
                    />
                    <input
                      type="tel"
                      required
                      disabled={cargoState !== 'form'}
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="Phone"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Vehicle Sizing Tiers (Compact horizontal grid) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Select Vehicle Capacity Tier
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {MOCK_CARGO_TIERS.map((tier) => {
                      const isSelected = selectedTier.tier === tier.tier;
                      return (
                        <button
                          type="button"
                          key={tier.tier}
                          disabled={cargoState !== 'form'}
                          onClick={() => cargoState === 'form' && handleSelectTier(tier)}
                          className={`p-2 rounded-xl border transition-all text-left flex flex-col justify-between ${
                            isSelected 
                              ? 'bg-[#FFF7F0] text-slate-900 border-[#FF7900] ring-1 ring-[#FF7900]' 
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-[#D96B24]' : 'text-slate-500'}`} />
                            <span className="text-[9px] font-bold text-slate-500">{tier.payloadCapacity}</span>
                          </div>
                          <div className="mt-1">
                            <h4 className="text-[11px] font-bold truncate leading-tight">{tier.title}</h4>
                            <span className="text-[10px] font-extrabold text-[#D96B24] block mt-0.5">
                              K{tier.baseZMW}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category & Description (Compact row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Commodity Category</label>
                    <select
                      disabled={cargoState !== 'form'}
                      value={cargoCategory}
                      onChange={(e) => setCargoCategory(e.target.value)}
                      className="w-full bg-[#F1F5F2] border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Goods Description</label>
                    <input
                      type="text"
                      disabled={cargoState !== 'form'}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#F1F5F2] border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium"
                      placeholder="e.g. 10 bags maize, bed frame..."
                    />
                  </div>
                </div>

                {/* Helper Porters & Fragile */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-600 mr-1">Helpers:</span>
                    {[0, 1, 2].map((count) => (
                      <button
                        key={count}
                        type="button"
                        disabled={cargoState !== 'form'}
                        onClick={() => handleHelperChange(count)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                          helpersCount === count 
                            ? 'bg-[#FFF2E8] text-[#8A3F16] border-orange-300' 
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {count === 0 ? '0' : `+${count}`}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-700">
                    <input
                      type="checkbox"
                      disabled={cargoState !== 'form'}
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-orange-500"
                    />
                    <span>Fragile</span>
                  </label>
                </div>

                {/* Haulage Rate Proposal inline */}
                <div className="bg-[#FFF7F0] p-2 rounded-xl border border-orange-100 flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-extrabold text-slate-800 block">Proposed Haulage Rate</label>
                    <span className="text-[9px] text-slate-500">{selectedTier.title} • {helpersCount} helper(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={cargoState !== 'form' || proposedPriceZMW <= selectedTier.baseZMW}
                      onClick={() => setProposedPriceZMW((p) => Math.max(selectedTier.baseZMW, p - 20))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="text-base font-black text-slate-900 min-w-[60px] text-center">
                      K{proposedPriceZMW}
                    </span>
                    <button
                      type="button"
                      disabled={cargoState !== 'form'}
                      onClick={() => setProposedPriceZMW((p) => p + 20)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>

                {cargoState === 'form' && (
                  <button
                    type="submit"
                    className="w-full bg-[#FF7900] hover:bg-[#E96B00] text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    Request Quotes (ZMW {proposedPriceZMW})
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Transporter Quotes & Digital Waybill (Shown below form when bidding or booked) */}
            {cargoState !== 'form' && (
              <div className="w-full space-y-4 pt-2">
                {cargoState === 'bidding' && (
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Transporter Quotes Received</h3>
                        <p className="text-xs text-slate-500">Pick the best truck rating or arrival time</p>
                      </div>
                      <span className="bg-[#FF7A00] text-[#0F1E36] text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Live Bidding
                      </span>
                    </div>

                    <div className="space-y-3">
                      {quotes.map((quote) => (
                        <div 
                          key={quote.id} 
                          className="p-4 rounded-2xl border border-slate-200 bg-[#F1F5F2] hover:bg-slate-100 transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{quote.operatorName}</h4>
                              <p className="text-xs text-slate-600">
                                {quote.vehicleType} • <strong className="text-slate-800">{quote.truckPlate}</strong>
                              </p>
                              <p className="text-[11px] text-orange-800 font-medium mt-0.5">
                                {quote.etaToPickupMins} mins away • Includes {quote.includesHelpersCount} porter
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-extrabold text-[#0F1E36]">
                                ZMW {quote.quotedFareZMW}
                              </span>
                            </div>
                          </div>

                          {quote.message && (
                            <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-200">
                              "{quote.message}"
                            </p>
                          )}

                          <button
                            onClick={() => handleAcceptQuote(quote)}
                            className="w-full bg-[#0F1E36] hover:bg-[#0A1526] text-[#FF7A00] font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept Quote & Dispatch (ZMW {quote.quotedFareZMW})
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cargoState === 'booked' && (
                  <div className="bg-[#0F1E36] text-white rounded-3xl p-6 shadow-xl space-y-5 border border-orange-800">
                    <div className="flex items-center justify-between pb-3 border-b border-orange-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#FF7A00]" />
                        <span className="font-bold text-sm tracking-wide text-[#FF7A00]">
                          WAYBILL CONSIGNMENT ISSUED
                        </span>
                      </div>
                      <span className="text-xs font-semibold bg-[#FF7A00] text-[#0F1E36] px-2.5 py-0.5 rounded-full">
                        Hauler Dispatched
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold">
                        {selectedQuote?.operatorName || 'Lusaka Swift Haulers'}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Vehicle: <strong className="text-[#FF7A00]">{selectedQuote?.truckPlate || 'BAH 9012 ZM'}</strong>
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        Route: {pickup} ➔ {destination}
                      </p>
                    </div>

                    {/* Real Google Map Truck Haulage Telemetry */}
                    <CountryStreetMap
                      country={country}
                      activeCity={activeCity}
                      pickupName={pickup}
                      destinationName={destination}
                      heightClass="h-56 sm:h-64"
                    />

                    {/* Digital Waybill Details Box */}
                    <div className="bg-[#0A1526] p-4 rounded-2xl border border-orange-950 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-orange-800">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Waybill Tracking ID</span>
                        <span className="font-mono font-extrabold text-[#FF7A00] text-sm">TWD-CRG-8812</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Commodity:</span>
                        <strong className="text-white">{cargoCategory}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Receiver:</span>
                        <strong className="text-white">{receiverName} ({receiverPhone})</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Helpers / Porters:</span>
                        <strong className="text-white">{helpersCount} Assigned</strong>
                      </div>
                      <div className="flex justify-between text-slate-300 pt-1 border-t border-orange-950">
                        <span>Locked Settlement:</span>
                        <strong className="text-lg font-extrabold text-white">ZMW {proposedPriceZMW}</strong>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <a 
                        href="tel:+260977894432"
                        className="flex-1 bg-white hover:bg-slate-100 text-[#0F1E36] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-orange-800" />
                        Call Transporter
                      </a>
                      <button
                        onClick={() => setCargoState('form')}
                        className="bg-orange-950/60 hover:bg-orange-950 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-semibold"
                      >
                        Close Waybill
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

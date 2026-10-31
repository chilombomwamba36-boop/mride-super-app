import React, { useState } from 'react';
import {
  ArrowRight,
  Bike,
  MapPin,
  Truck,
  Volume2,
  Play,
  ShoppingBag,
  Building2
} from 'lucide-react';
import { CountryConfig } from '../../data/africanCountries';
import { ServiceType } from '../../types';
import { AiVoiceCopilotService } from '../../services/aiVoiceCopilotService';
import { MrideWaitTimeReelsModal } from '../common/MrideWaitTimeReelsModal';

interface HomeScreenProps {
  onSelectService: (service: ServiceType) => void;
  onOpenBooking: (destination?: string) => void;
  onOpenHistory: () => void;
  country: CountryConfig;
  activeCity: string;
  welcomeText: string;
  disabledServices?: string[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectService,
  onOpenBooking,
  country: _country,
  activeCity
}) => {
  const [destinationInput, setDestinationInput] = useState('');
  const [isReelsPreviewOpen, setIsReelsPreviewOpen] = useState(false);

  const savedLocations = [
    {
      id: 'loc_1',
      name: 'Limson House',
      address: 'Freedom Way, 131, Lusaka CBD',
      eta: '8 min',
      icon: ShoppingBag
    },
    {
      id: 'loc_2',
      name: 'Levy Junction Shopping Mall',
      address: 'Independence Ave & Church Rd, Lusaka',
      eta: '7 min',
      icon: MapPin
    },
    {
      id: 'loc_3',
      name: 'EastPark Mall',
      address: 'Great East Road, Lusaka',
      eta: '12 min',
      icon: Building2
    }
  ];

  const handleWhereToSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onOpenBooking(destinationInput.trim() || undefined);
  };

  return (
    <div className="relative mx-auto w-full max-w-lg space-y-4 pb-2 animate-in fade-in duration-300">
      {/* Top Status Header matching Yango screenshot style */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black italic tracking-tighter text-[#FF6500] font-display">
              MRIDE
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500">Checking nearest drivers...</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              AiVoiceCopilotService.speakGuidance(
                `Welcome to Mrides ${activeCity}. Where would you like to go today? Tap Where to or select Rides, Delivery, or Cargo.`,
                true
              )
            }
            className="flex items-center gap-1 rounded-full bg-[#15191C] px-2.5 py-1 text-[10px] font-extrabold text-white hover:bg-[#FF6500] transition-colors"
          >
            <Volume2 className="h-3 w-3 text-[#FF6500]" />
            <span>AI Voice</span>
          </button>
          <button
            type="button"
            onClick={() => setIsReelsPreviewOpen(true)}
            className="flex items-center gap-1 rounded-full bg-[#FFF0E6] border border-[#FF6500]/30 px-2.5 py-1 text-[10px] font-extrabold text-[#FF6500] hover:bg-[#FF6500] hover:text-white transition-colors"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Reels</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Services Grid - Focused exclusively on MRIDE services (Rides, Boda Delivery, Cargo) */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Boda Delivery Express */}
          <button
            type="button"
            onClick={() => onSelectService('boda')}
            className="bg-[#F3F4F6] hover:bg-[#E5E7EB] active:scale-[0.98] transition-all rounded-3xl p-3.5 flex flex-col items-center justify-between min-h-[115px] border border-slate-200/60 shadow-2xs group"
          >
            <div className="relative w-full flex items-center justify-center py-1">
              <div className="w-16 h-12 bg-white rounded-2xl shadow-xs flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                <Bike className="w-7 h-7 text-[#FF6500]" />
              </div>
            </div>
            <div className="text-center">
              <span className="font-extrabold text-xs text-[#15191C] block">Boda Delivery</span>
              <span className="text-[10px] text-slate-500 font-bold">Fast parcels & docs</span>
            </div>
          </button>

          {/* 2. Cargo Freight & Haulage */}
          <button
            type="button"
            onClick={() => onSelectService('cargo')}
            className="bg-[#F3F4F6] hover:bg-[#E5E7EB] active:scale-[0.98] transition-all rounded-3xl p-3.5 flex flex-col items-center justify-between min-h-[115px] border border-slate-200/60 shadow-2xs group"
          >
            <div className="relative w-full flex items-center justify-center py-1">
              <div className="w-16 h-12 bg-white rounded-2xl shadow-xs flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                <Truck className="w-7 h-7 text-[#FF6500]" />
              </div>
            </div>
            <div className="text-center">
              <span className="font-extrabold text-xs text-[#15191C] block">Cargo Freight</span>
              <span className="text-[10px] text-slate-500 font-bold">Pickups, Canters & Trucks</span>
            </div>
          </button>
        </div>

        {/* 3. Featured White Sedan Ride Card (Yango Style) */}
        <button
          type="button"
          onClick={() => onOpenBooking()}
          className="w-full bg-[#E5E7EB] hover:bg-[#D1D5DB] active:scale-[0.98] transition-all rounded-3xl p-4 flex items-center justify-between relative overflow-hidden border border-slate-300 shadow-sm group text-left"
        >
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-[#15191C]">Passenger Rides</span>
              <span className="bg-[#FF6500] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                FairFare
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600">Economy from K28 • Comfort from K40</p>
            <span className="text-[11px] font-extrabold text-[#FF6500] block pt-1">Nearest car from 3 min →</span>
          </div>

          <div className="relative w-36 h-20 flex items-center justify-end shrink-0">
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80"
              alt="Mride Sedan"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-md rounded-xl"
            />
          </div>
        </button>
      </div>

      {/* Big "Where to?" Search Pill Button (Exactly matching screenshot) */}
      <form onSubmit={handleWhereToSubmit} className="pt-1">
        <div
          onClick={() => onOpenBooking(destinationInput.trim() || undefined)}
          className="w-full bg-[#E5E7EB] hover:bg-[#DCDFE4] active:scale-[0.99] transition-all rounded-3xl p-4 flex items-center justify-between cursor-pointer border border-slate-300/80 shadow-2xs"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-base font-black text-[#15191C]">Where to?</span>
            <input
              type="text"
              value={destinationInput}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDestinationInput(e.target.value)}
              placeholder="Enter destination..."
              className="bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none flex-1 truncate"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-[#15191C] text-white flex items-center justify-center shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </form>

      {/* Saved & Recent Locations List (Limson House, Levy Junction, etc. as in screenshot) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs space-y-3">
        {savedLocations.map((loc, idx) => {
          const Icon = loc.icon;
          return (
            <button
              key={loc.id}
              type="button"
              onClick={() => onOpenBooking(loc.name)}
              className={`w-full flex items-center justify-between text-left py-2.5 hover:bg-slate-50 rounded-2xl px-2 transition-colors ${
                idx !== savedLocations.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-[#F3F4F6] text-slate-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-black text-[#15191C] truncate">{loc.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{loc.address}</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-2">
                <span className="text-xs font-bold text-slate-400">{loc.eta}</span>
              </div>
            </button>
          );
        })}
      </div>

      <MrideWaitTimeReelsModal
        isOpen={isReelsPreviewOpen}
        onClose={() => setIsReelsPreviewOpen(false)}
        driverName="Chanda M."
        driverPhoto="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        vehicleModel="Toyota Corolla Axio"
        vehiclePlate="BAC 1234"
        pickupName="Lusaka CBD"
        destinationName="EastPark Mall"
        initialEtaMinutes={4}
      />
    </div>
  );
};

import React from 'react';
import { 
  Car, 
  Truck, 
  UtensilsCrossed, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Banknote, 
  Clock, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { ServiceType } from '../types';

interface ServiceSelectorProps {
  onSelectService: (service: ServiceType) => void;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ onSelectService }) => {
  const serviceCards = [
    {
      id: 'rides' as ServiceType,
      title: 'Mride Cabs & Moto',
      tagline: 'Passenger transport with negotiated fares from K22',
      description: 'Offer your own fare or accept driver counter-offers across Lusaka & Africa. Strict K22 baseline for nearby hops. Moto passenger is Coming Soon (Deliveries active today).',
      icon: Car,
      accent: 'from-[#252A34] to-[#162A45]',
      badge: 'Price Lock Guaranteed',
      badgeColor: 'bg-[#FF7A00] text-[#252A34]',
      stats: 'Average response: < 2 min'
    },
    {
      id: 'cargo' as ServiceType,
      title: 'Mride Cargo',
      tagline: 'Parcels, furniture, goods & freight delivery',
      description: 'Book instant courier bodas, pickup vans, 3.5-ton Canters or heavy commercial flatbeds with competitive bids.',
      icon: Truck,
      accent: 'from-[#303744] to-[#1E3A5F]',
      badge: 'Waybill Guarded',
      badgeColor: 'bg-blue-100 text-blue-900',
      stats: 'Payload: 20kg to 10 tons'
    },
    {
      id: 'food' as ServiceType,
      title: 'Mride Food',
      tagline: 'Lusaka restaurants & traditional Zambian cuisine',
      description: 'From sizzling Village Chicken & Kariba Bream with Nshima, to flame braai grills and fresh bakeries.',
      icon: UtensilsCrossed,
      accent: 'from-[#0F1E36] to-[#162A45]',
      badge: 'Fast Delivery',
      badgeColor: 'bg-amber-100 text-amber-950',
      stats: 'Delivery from ZMW 20'
    },
    {
      id: 'market' as ServiceType,
      title: 'Mride Market',
      tagline: 'Local commerce: electronics, farm produce & fashion',
      description: 'Discover trusted Zambian sellers, buy directly with secure delivery or list your own inventory across Lusaka.',
      icon: ShoppingBag,
      accent: 'from-[#162A45] to-[#1E3A5F]',
      badge: 'MoMo Escrow',
      badgeColor: 'bg-purple-100 text-purple-950',
      stats: '1,400+ active listings'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Super App Banner - Royal Navy and Solar Orange */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1E36] via-[#162A45] to-[#171B22] text-white p-6 sm:p-10 shadow-xl border border-slate-700/80">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#FF6A00] text-[#0F1E36] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Pan-African Super Mobility Ecosystem
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
            One App. <br className="hidden sm:inline" />
            <span className="text-[#FF7A00]">Your Ride. Your Way.</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl">
            Whether you need a quick short trip from strictly K22, an air-conditioned cab with Price Lock Guarantee, on-demand parcel courier, or local market goods—Mride brings it all together with fair 5% platform fees and automated win-win benefits.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectService('rides')}
              className="bg-[#FF7A00] hover:bg-[#E85D00] text-[#0F1E36] font-extrabold px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm sm:text-base group active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>Book a Ride from K22</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onSelectService('cargo')}
              className="bg-white/10 hover:bg-white/20 text-[#FF7A00] font-bold px-4 py-3 rounded-xl transition-colors border border-orange-400/30 text-sm sm:text-base flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-[#FF7A00]" />
              <span>Moto & Cargo Deliveries</span>
            </button>
          </div>
        </div>

        {/* Decorative background accents */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-[#FF7A00]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <div className="w-72 h-72 border-4 border-[#FF7A00] rounded-full flex items-center justify-center">
            <Car className="w-32 h-32 text-[#FF7A00]" />
          </div>
        </div>
      </div>

      {/* Trust & Local Features Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#0F1E36]/10 text-[#0F1E36] shrink-0">
            <Banknote className="w-5 h-5 text-[#0F1E36]" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">Strict K22 Minimum</p>
            <p className="text-[11px] text-slate-500">Short nearby hops from K22</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-orange-100 text-[#0F1E36] shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">Price Lock Guarantee</p>
            <p className="text-[11px] text-slate-500">Zero off-app cash haggling</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#FF7A00]/20 text-[#0F1E36] shrink-0">
            <MapPin className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">Upfront Destinations</p>
            <p className="text-[11px] text-slate-500">Zero blind cancellations</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-100 text-[#0F1E36] shrink-0">
            <Clock className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">Fair 5% Driver Fee</p>
            <p className="text-[11px] text-slate-500">Drivers keep 95% of fare</p>
          </div>
        </div>
      </div>

      {/* 4 Pillars Super App Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              Explore Mride Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select any service to begin a negotiated ride, cargo dispatch, food order, or product inquiry
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {serviceCards.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => onSelectService(service.id)}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl border border-slate-200/90 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0F1E36] text-[#FF7A00] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0F1E36] transition-colors flex items-center gap-2">
                    {service.title}
                  </h3>
                  <p className="text-sm font-semibold text-amber-700 mt-0.5">
                    {service.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    {service.stats}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F1E36] group-hover:text-amber-600 group-hover:translate-x-1 transition-all">
                    <span>Open Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

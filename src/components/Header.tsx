import React from 'react';
import {
  Bike,
  Car,
  Truck,
  Menu,
  X,
  Receipt,
  UserRound,
  LogOut,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { ServiceType, UserRole, UserProfile } from '../types';

interface HeaderProps {
  currentService: ServiceType;
  onSelectService: (service: ServiceType) => void;
  disabledServices?: string[];
  brandName?: string;
  brandLogoUrl?: string;
  currentUser: UserProfile;
  currentRole: UserRole;
  onOpenAuth: () => void;
  onOpenHistory: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentService,
  onSelectService,
  brandName = 'Mrides',
  brandLogoUrl = '/mride-mark.svg',
  currentUser,
  currentRole,
  onOpenAuth,
  onOpenHistory,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isDriverSession = currentRole === 'driver';

  // Strictly Passenger services when signed in as a Passenger
  const passengerServices: Array<{
    id: ServiceType;
    label: string;
    icon: React.FC<{ className?: string }> | null;
  }> = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'rides', label: 'Rides', icon: Car },
    { id: 'cargo', label: 'Cargo', icon: Truck },
    { id: 'boda', label: 'Boda Delivery', icon: Bike }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white text-[#15191C] border-b border-slate-200 shadow-2xs">
      {/* Anti-Theft & Role-Lock Identity Banner at the Very Top */}
      <div
        className={`w-full px-3 py-1 flex items-center justify-between text-[10px] font-extrabold tracking-wider uppercase ${
          isDriverSession
            ? 'bg-emerald-700 text-white'
            : 'bg-[#FF6500] text-white'
        }`}
      >
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>
            {isDriverSession
              ? 'DRIVER • VERIFIED SESSION'
              : 'PASSENGER • VERIFIED SESSION'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-bold bg-black/20 px-2 py-0.5 rounded-full">
          <Lock className="w-2.5 h-2.5" />
          <span className="truncate max-w-[140px] sm:max-w-none">
            {currentUser.name} ({currentUser.city || 'Lusaka'})
          </span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-3 lg:px-6 py-1.5 flex items-center justify-between gap-2">
        {/* Official Mrides Brand Identity */}
        <div
          onClick={() => {
            if (!isDriverSession) onSelectService('home');
          }}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <img
            src={brandLogoUrl || '/mride-mark.svg'}
            alt="Mrides logo"
            className="h-7 w-7 rounded-lg object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-base tracking-tight text-[#15191C] group-hover:text-[#FF6500] transition-colors leading-none">
                {brandName}
              </span>
              <span
                className={`text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded-md tracking-wider ${
                  isDriverSession
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#FFF0E6] text-[#FF6500] border border-[#FF6500]/20'
                }`}
              >
                {isDriverSession ? 'DRIVER' : 'PASSENGER'}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase leading-none mt-0.5">
              Your Ride. Your Way.
            </p>
          </div>
        </div>

        {/* Desktop Service Navigation (Only for Passenger session; Driver has dedicated Driver UI) */}
        {!isDriverSession && (
          <nav className="hidden md:flex items-center gap-1 bg-[#F7F7F5] p-1 rounded-xl border border-slate-200">
            {passengerServices.map((svc) => {
              const Icon = svc.icon;
              const isActive = currentService === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => onSelectService(svc.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF6500] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#15191C] hover:bg-white'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {svc.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Side: Locked Role Status Pill + Account + Sign Out */}
        <div className="flex items-center gap-1.5">
          <div
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-extrabold flex items-center gap-1.5 ${
              isDriverSession
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-[#FFF0E6] text-[#FF6500] border-[#FF6500]/30'
            }`}
            title="Role locked from intro login to prevent unauthorized account switching"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDriverSession ? 'bg-emerald-600' : 'bg-[#FF6500]'
              }`}
            />
            <span>{isDriverSession ? 'DRIVER' : 'PASSENGER'}</span>
          </div>

          {!isDriverSession && (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-colors"
              title="Passenger Profile & Verification"
            >
              <div className="w-6 h-6 rounded-full bg-[#FFF0E6] text-[#FF6500] flex items-center justify-center text-xs font-extrabold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold leading-none text-[#15191C]">
                  {currentUser.name}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">Verified Passenger</p>
              </div>
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-[#FF6500] hover:border-[#FF6500]"
              title="Log out to Intro Screen"
              aria-label="Log out to Intro Screen"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {!isDriverSession && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#F7F7F5] text-[#15191C] hover:bg-slate-200 md:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Passenger Session Only) */}
      {mobileMenuOpen && !isDriverSession && (
        <div className="bg-white border-t border-slate-200 px-4 py-3 space-y-2.5 md:hidden">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            {passengerServices.map((svc) => {
              const Icon = svc.icon;
              const isActive = currentService === svc.id;
              return (
                <button
                  key={svc.id}
                  onClick={() => {
                    onSelectService(svc.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-[#FF6500] text-white' : 'text-[#15191C] bg-[#F7F7F5]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{svc.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenHistory();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-[#15191C]"
            >
              <Receipt className="h-4 w-4 text-[#FF6500]" /> Trips
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-[#15191C]"
            >
              <UserRound className="h-4 w-4 text-[#FF6500]" /> Profile
            </button>
            {onSignOut && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-bold text-red-700"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

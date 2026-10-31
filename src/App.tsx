import React, { useState } from 'react';
import {
  Bike,
  Car,
  Truck,
  Home,
  Receipt,
  UserRound,
  Globe2,
  Volume2,
  Sparkles
} from 'lucide-react';
import { Header } from './components/Header';
import { RidesView } from './components/rides/RidesView';
import { CargoView } from './components/cargo/CargoView';
import { BodaDeliveryView } from './components/boda/BodaDeliveryView';
import { DriverDedicatedApp } from './components/driver/DriverDedicatedApp';
import { MMDriveStandaloneWebsite } from './components/website/MMDriveStandaloneWebsite';
import { MockNotice } from './components/common/MockNotice';
import { ServiceType, UserRole, UserProfile, RideHistoryItem } from './types';
import { AuthService } from './services/authService';
import { AuthModal } from './components/auth/AuthModal';
import { WelcomeOnboardingGate } from './components/auth/WelcomeOnboardingGate';
import { NotificationToast } from './components/common/NotificationToast';
import { DeviceSimulatorFrame } from './components/common/DeviceSimulatorFrame';
import { RideHistoryModal } from './components/rides/RideHistoryModal';
import { HomeScreen } from './components/home/HomeScreen';
import { AFRICAN_COUNTRIES, CountryConfig, DEFAULT_COUNTRY } from './data/africanCountries';
import { INITIAL_RIDE_HISTORY } from './data/mockData';
import {
  isMrideLocationAvailable,
  MrideContentSettings,
  readMrideContent
} from './services/contentSettings';
import { AiVoiceCopilotService } from './services/aiVoiceCopilotService';

export const App: React.FC = () => {
  const authService = AuthService.getInstance();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<UserProfile>(authService.getCurrentUser());
  const [contentSettings, setContentSettings] = useState<MrideContentSettings>(readMrideContent);
  const [currentService, setCurrentService] = useState<ServiceType>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser.role);
  const [country, setCountry] = useState<CountryConfig>(() =>
    AFRICAN_COUNTRIES.find((candidate) => candidate.code === currentUser.countryCode) || DEFAULT_COUNTRY
  );
  const [activeCity, setActiveCity] = useState<string>(() =>
    country.cities.includes(currentUser.city) ? currentUser.city : country.defaultCity
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bookingDestination, setBookingDestination] = useState<string | undefined>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rideHistory, setRideHistory] = useState<RideHistoryItem[]>(() => {
    try {
      const stored = window.localStorage.getItem('mrides-ride-history');
      if (stored) {
        const parsed = JSON.parse(stored) as RideHistoryItem[];
        if (Array.isArray(parsed)) {
          return [
            ...parsed,
            ...INITIAL_RIDE_HISTORY.filter((item) => !parsed.some((ride) => ride.id === item.id))
          ];
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_RIDE_HISTORY;
  });

  const [appMode, setAppMode] = useState<'mobile_app' | 'admin_website'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'website') return 'admin_website';
    }
    return 'mobile_app';
  });
  const [reportTripRef, setReportTripRef] = useState<string | undefined>();
  const [showOpeningSplash, setShowOpeningSplash] = useState<boolean>(true);
  const [aiLiveCaption, setAiLiveCaption] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowOpeningSplash(false);
    }, 1900);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const unsubVoice = AiVoiceCopilotService.subscribe((caption) => {
      setAiLiveCaption(caption);
    });
    return () => unsubVoice();
  }, []);

  React.useEffect(() => {
    const unsubscribe = authService.subscribe((session) => {
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        setCurrentRole(session.user.role);
        if (session.user.role === 'customer' && currentService === 'admin') {
          setCurrentService('home');
        }
        const userCountry = AFRICAN_COUNTRIES.find(
          (candidate) => candidate.code === session.user.countryCode
        );
        if (userCountry) {
          setCountry(userCountry);
          setActiveCity(
            userCountry.cities.includes(session.user.city)
              ? session.user.city
              : userCountry.defaultCity
          );
        } else if (session.user.city && country.cities.includes(session.user.city)) {
          setActiveCity(session.user.city);
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, [authService]);

  React.useEffect(() => {
    const handleContentUpdate = (event: Event) => {
      const settings = (event as CustomEvent<MrideContentSettings>).detail;
      if (settings) setContentSettings(settings);
    };
    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key) setContentSettings(readMrideContent());
    };
    window.addEventListener('mride:content-updated', handleContentUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('mride:content-updated', handleContentUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  const handleCountryChange = (newCountry: CountryConfig) => {
    setCountry(newCountry);
    setActiveCity(newCountry.defaultCity);
  };

  const handleRideCompleted = (ride: RideHistoryItem) => {
    setRideHistory((previous) => {
      const updated = [ride, ...previous];
      try {
        window.localStorage.setItem('mrides-ride-history', JSON.stringify(updated));
      } catch {
        // ignore storage error
      }
      return updated;
    });
  };

  const handleOpenBooking = (destination?: string) => {
    setBookingDestination(destination);
    setCurrentService('rides');
  };

  const handleSignOutToIntro = () => {
    authService.signOut();
    setIsAuthenticated(false);
  };

  const bottomNavItems = [
    { id: 'home' as ServiceType, label: 'Home', icon: Home },
    { id: 'rides' as ServiceType, label: 'Rides', icon: Car },
    { id: 'cargo' as ServiceType, label: 'Cargo', icon: Truck },
    { id: 'boda' as ServiceType, label: 'Boda', icon: Bike }
  ];

  return (
    <DeviceSimulatorFrame appMode={appMode} onAppModeChange={setAppMode}>
      {appMode === 'admin_website' ? (
        <MMDriveStandaloneWebsite
          onSwitchToMobileApp={() => setAppMode('mobile_app')}
          country={country}
          onCountryChange={handleCountryChange}
          activeCity={activeCity}
          onCityChange={setActiveCity}
          initialReportTripRef={reportTripRef}
        />
      ) : showOpeningSplash ? (
        /* PROFESSIONAL CINEMATIC APP LAUNCH ANIMATION (FULL SCREEN MRIDE ORANGE) */
        <div
          onClick={() => {
            setShowOpeningSplash(false);
            AiVoiceCopilotService.speakGuidance(
              `Welcome to Mrides ${activeCity}. Your Ride, Your Way.`,
              true
            );
          }}
          className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#FF6500] via-[#F35800] to-[#E04E00] text-white flex flex-col items-center justify-between p-6 sm:p-8 select-none cursor-pointer overflow-hidden animate-in fade-in duration-300"
        >
          {/* Subtle Ambient Rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-72 h-72 rounded-full border border-white/20 animate-ping" style={{ animationDuration: '2.4s' }} />
            <div className="absolute w-96 h-96 rounded-full border border-white/10 animate-pulse" />
          </div>

          <div className="relative z-10 pt-8 flex items-center gap-1.5 bg-black/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
            <span className="text-[11px] uppercase tracking-widest text-white font-black">
              Mrides Zambia
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 my-auto">
            <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-2xl p-3 transform transition-transform duration-500 scale-105">
              <img src="/mride-mark.svg" alt="Mrides Logo" className="w-16 h-16" />
            </div>

            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display text-white drop-shadow-sm">
                Mrides
              </h1>
              <p className="text-xs font-black tracking-[0.25em] text-white/90 uppercase">
                YOUR RIDE. YOUR WAY.
              </p>
            </div>

            {/* Service Pills */}
            <div className="flex items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#FFE500]" /> Rides
              </span>
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-white" /> Cargo
              </span>
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-white" /> Boda
              </span>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-xs space-y-2 pb-6 text-center">
            <div className="w-full h-1.5 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full w-4/5 bg-white rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-white/90 font-bold block">
              Connecting Lusaka 3D Vector Map • Tap to skip
            </span>
          </div>
        </div>
      ) : !isAuthenticated ? (
        /* APP OPENING INTRO & SEPARATE PASSENGER / DRIVER LOGIN & SIGN-UP GATE */
        <WelcomeOnboardingGate
          onAuthenticated={(user) => {
            setCurrentUser(user);
            setCurrentRole(user.role);
            setIsAuthenticated(true);
            if (user.role === 'admin') {
              setCurrentService('admin');
            } else {
              setCurrentService('home');
            }
          }}
        />
      ) : (
        <div
          className="mmrides-app min-h-full bg-[#F7F7F5] flex flex-col justify-between text-[#15191C] pb-2"
          style={{ '--mmrides-primary': '#FF6500' } as React.CSSProperties}
        >
          <div className="flex-1">
            <Header
              currentService={currentService}
              onSelectService={setCurrentService}
              disabledServices={contentSettings.disabledServices}
              brandName="Mrides"
              brandLogoUrl={contentSettings.brandLogoUrl}
              currentUser={currentUser}
              currentRole={currentRole}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onSignOut={handleSignOutToIntro}
            />

            <main className="max-w-7xl mx-auto px-2.5 lg:px-6 pt-2">
              <MockNotice message={contentSettings.appAnnouncement} />

              {!isMrideLocationAvailable(contentSettings, country.code, activeCity) ? (
                <section className="mx-auto mt-6 max-w-xl rounded-2xl border border-orange-200 bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E6] text-[#FF6500]">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <h1 className="text-lg font-bold text-[#15191C]">
                    Mrides is coming soon in {activeCity}
                  </h1>
                  <p className="mt-1.5 text-xs text-slate-600">
                    We are not accepting bookings in {activeCity}, {country.name} yet.
                  </p>
                </section>
              ) : currentRole === 'driver' ? (
                <DriverDedicatedApp
                  activeCity={activeCity}
                  onCityChange={setActiveCity}
                  country={country}
                />
              ) : (
                <>
                  {currentService === 'home' && (
                    <HomeScreen
                      onSelectService={setCurrentService}
                      onOpenBooking={handleOpenBooking}
                      onOpenHistory={() => setIsHistoryOpen(true)}
                      country={country}
                      activeCity={activeCity}
                      welcomeText={contentSettings.appWelcomeText}
                      disabledServices={contentSettings.disabledServices}
                    />
                  )}

                  {currentService === 'rides' && (
                    <RidesView
                      currentRole={currentRole}
                      activeCity={activeCity}
                      country={country}
                      onRideCompleted={handleRideCompleted}
                      initialDestination={bookingDestination}
                      onInitialDestinationApplied={() => setBookingDestination(undefined)}
                    />
                  )}

                  {currentService === 'cargo' && (
                    <CargoView
                      currentRole={currentRole}
                      activeCity={activeCity}
                      country={country}
                    />
                  )}

                  {currentService === 'boda' && (
                    <BodaDeliveryView
                      activeCity={activeCity}
                      country={country}
                      onDeliveryCompleted={handleRideCompleted}
                    />
                  )}
                </>
              )}
            </main>
          </div>

          {/* Bottom Sticky Passenger Navigation - Locked solidly at screen bottom across all content lengths */}
          {currentRole !== 'driver' && (
            <nav className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 flex justify-around items-center shadow-[0_-4px_16px_rgba(21,25,28,0.06)] shrink-0">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentService === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentService(item.id)}
                    className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'text-[#FF6500] font-extrabold'
                        : 'text-slate-500 font-semibold hover:text-[#15191C]'
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-[#FFF0E6] text-[#FF6500]' : ''}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] mt-0.5">{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 font-semibold hover:text-[#15191C]"
              >
                <div className="p-1 rounded-lg">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5">My Trips</span>
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 font-semibold hover:text-[#15191C]"
              >
                <div className="p-1 rounded-lg">
                  <UserRound className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5">Profile</span>
              </button>
            </nav>
          )}

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            currentUser={currentUser}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onSwitchToDriver={handleSignOutToIntro}
            onSignOut={handleSignOutToIntro}
            onOpenWebsiteSupport={(tripRef) => {
              setReportTripRef(tripRef);
              setAppMode('admin_website');
            }}
            onUserChange={(updatedUser) => {
              setCurrentUser(updatedUser);
              setCurrentRole(updatedUser.role);
              const userCountry = AFRICAN_COUNTRIES.find(
                (candidate) => candidate.code === updatedUser.countryCode
              );
              if (userCountry) {
                setCountry(userCountry);
                setActiveCity(
                  userCountry.cities.includes(updatedUser.city)
                    ? updatedUser.city
                    : userCountry.defaultCity
                );
              }
            }}
          />

          <RideHistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            country={country}
            historyItems={rideHistory}
            onTrackOnWebsite={(ticketNum) => {
              setReportTripRef(ticketNum);
              setAppMode('admin_website');
            }}
          />

          <NotificationToast />

          {/* Live AI Voice Co-Pilot Spoken Caption & Sound Indicator */}
          {aiLiveCaption && (
            <div
              onClick={() => AiVoiceCopilotService.speakGuidance(aiLiveCaption, true)}
              className="fixed bottom-16 inset-x-3 sm:max-w-sm sm:mx-auto z-50 cursor-pointer rounded-2xl bg-[#0B1528]/95 backdrop-blur-md text-white px-3.5 py-2.5 shadow-2xl border border-[#FF6500]/50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
              title="Tap to replay AI Voice audio"
            >
              <div className="h-8 w-8 rounded-xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 animate-pulse">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#FFE500] block">
                  Mride AI Voice Co-Pilot Speaking • Tap to Replay
                </span>
                <p className="text-[11px] font-bold text-white leading-snug line-clamp-2">
                  “{aiLiveCaption}”
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </DeviceSimulatorFrame>
  );
};

export default App;

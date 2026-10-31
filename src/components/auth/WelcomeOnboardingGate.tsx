import React, { useEffect, useState } from 'react';
import {
  Car,
  Truck,
  Bike,
  Trophy,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  UserRound,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  MapPin,
  FileCheck
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { AuthService } from '../../services/authService';
import { ZAMBIAN_CITIES } from '../../data/mockData';

interface WelcomeOnboardingGateProps {
  onAuthenticated: (user: UserProfile) => void;
}

export const WelcomeOnboardingGate: React.FC<WelcomeOnboardingGateProps> = ({
  onAuthenticated
}) => {
  const authService = AuthService.getInstance();

  // Stage: 'splash' -> 'welcome' -> 'auth'
  const [stage, setStage] = useState<'splash' | 'welcome' | 'auth'>('splash');
  const [slideIndex, setSlideIndex] = useState<number>(0);

  // Separate Role: 'customer' (Passenger) vs 'driver' (Driver Partner)
  const [selectedRole, setSelectedRole] = useState<'customer' | 'driver'>('customer');
  // Auth Mode: 'login' vs 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  // Login method: 'phone' vs 'email'
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+260 97 ');
  const [otpCode, setOtpCode] = useState('1234');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Lusaka');

  // Driver-specific registration fields
  const [vehicleModel, setVehicleModel] = useState('Toyota Axio • White');
  const [vehiclePlate, setVehiclePlate] = useState('BAC 1234');
  const [licenseNumber, setLicenseNumber] = useState('ZM-PSV-884120');
  const [driverServices, setDriverServices] = useState<Array<'rides' | 'cargo' | 'boda'>>([
    'rides',
    'cargo'
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStage((current) => (current === 'splash' ? 'welcome' : current));
    }, 1100);
    return () => window.clearTimeout(timer);
  }, []);

  const onboardingSlides = [
    {
      badge: 'FairFare Negotiation',
      title: 'Welcome to Mrides',
      subtitle: 'Safe, affordable and reliable transportation, delivery and more across Zambia.',
      icon: Sparkles
    },
    {
      badge: 'Rides • Cargo • Boda',
      title: 'More than just a ride',
      subtitle: 'Book everyday passenger rides, heavy cargo trucks or fast boda-boda parcel delivery in one app.',
      icon: Car
    },
    {
      badge: 'Driver Goals & Rewards',
      title: 'Built for Passengers & Drivers',
      subtitle: 'Transparent fares for passengers and weekly cash bonus challenges for verified Zambian drivers.',
      icon: Trophy
    }
  ];

  const handleToggleDriverService = (svc: 'rides' | 'cargo' | 'boda') => {
    setDriverServices((prev) =>
      prev.includes(svc) ? prev.filter((item) => item !== svc) : [...prev, svc]
    );
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (authMode === 'login') {
        if (loginMethod === 'phone') {
          if (!otpSent) {
            setOtpSent(true);
            setInfoMsg('Verification code sent via SMS! Enter 1234 to continue.');
            return;
          }
          const user = await authService.signInWithPhoneOTP(phone, otpCode, selectedRole);
          onAuthenticated(user);
        } else {
          const user = await authService.signInWithEmail(email, password, selectedRole);
          onAuthenticated(user);
        }
      } else {
        if (!otpSent) {
          if (!fullName.trim()) {
            setErrorMsg(
              selectedRole === 'driver'
                ? 'Please enter your full legal name as shown on your RTSA license.'
                : 'Please enter your full name.'
            );
            return;
          }
          setOtpSent(true);
          setInfoMsg('SMS verification code sent to ' + phone + '! Use test OTP 1234 to verify.');
          return;
        }

        if (otpCode !== '1234' && otpCode.length < 4) {
          setErrorMsg('Invalid OTP code. Please enter 1234.');
          return;
        }

        const user = await authService.registerAccount({
          name: fullName,
          phone,
          email,
          role: selectedRole as UserRole,
          city,
          countryCode: 'ZM',
          vehicleModel: selectedRole === 'driver' ? vehicleModel : undefined,
          vehiclePlate: selectedRole === 'driver' ? vehiclePlate : undefined,
          licenseNumber: selectedRole === 'driver' ? licenseNumber : undefined,
          eligibleServices: selectedRole === 'driver' ? driverServices : undefined
        });

        onAuthenticated(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your details.');
    }
  };

  const handleQuickDemoLogin = async (role: 'customer' | 'driver') => {
    setErrorMsg(null);
    const demoPhone = role === 'driver' ? '+260977812940' : '+26097789452';
    const user = await authService.signInWithPhoneOTP(demoPhone, '1234', role);
    onAuthenticated(user);
  };

  // ================= 1. ANIMATED SPLASH SCREEN =================
  if (stage === 'splash') {
    return (
      <div
        onClick={() => setStage('welcome')}
        className="min-h-full bg-[#15191C] text-white flex flex-col items-center justify-between p-8 select-none cursor-pointer"
        style={{ minHeight: '760px' }}
      >
        <div className="pt-8 text-center">
          <span className="text-[10px] uppercase tracking-widest text-[#FFE500] font-extrabold">
            Made for Zambia
          </span>
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#FF6500] flex items-center justify-center shadow-[0_12px_40px_rgba(255,101,0,0.45)] animate-bounce">
            <img src="/mride-mark.svg" alt="Mrides" className="w-16 h-16" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display">Mrides</h1>
            <p className="text-xs font-bold tracking-[0.22em] text-slate-400 uppercase mt-1">
              YOUR RIDE. YOUR WAY.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 pt-2">
            <span>Rides</span>
            <span className="text-[#FF6500]">•</span>
            <span>Cargo</span>
            <span className="text-[#FF6500]">•</span>
            <span>Boda Delivery</span>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-2 pb-4 text-center">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-2/3 bg-[#FF6500] rounded-full animate-pulse" />
          </div>
          <span className="text-[11px] text-slate-400 block">Opening Mrides... Tap to skip</span>
        </div>
      </div>
    );
  }

  // ================= 2. WELCOME INTRO SCREEN (First Clean Layout + Lusaka Driver & Skyline Photo) =================
  if (stage === 'welcome') {
    const activeSlide = onboardingSlides[slideIndex];

    return (
      <div
        className="min-h-full bg-white flex flex-col justify-between text-[#15191C] overflow-hidden"
        style={{ minHeight: '760px' }}
      >
        {/* Top Hero Visual with Lusaka Driver & Lusaka Buildings + Centered Official Mrides Logo */}
        <div className="relative h-[420px] w-full overflow-hidden bg-[#FFF0E6]">
          <img
            src="/lusaka-driver-hero.jpg"
            alt="Lusaka Taxi Driver and Skyline"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF0E6]/85 via-transparent to-white" />

          {/* Centered Official Mrides Brand Mark & Tagline */}
          <div className="absolute inset-x-0 top-6 flex flex-col items-center text-center px-6">
            <div className="w-15 h-15 rounded-2xl bg-[#FF6500] shadow-lg flex items-center justify-center mb-2 p-1">
              <img src="/mride-mark.svg" alt="Mrides Logo" className="w-13 h-13" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#15191C] font-display drop-shadow-2xs">
              Mrides
            </h1>
            <p className="text-[10px] font-extrabold tracking-[0.2em] text-slate-800 uppercase mt-0.5">
              YOUR RIDE. YOUR WAY.
            </p>
          </div>

          {/* Floating Service Pill Badges at Bottom of Photo */}
          <div className="absolute bottom-3 inset-x-4 flex justify-center gap-2">
            <span className="bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1 rounded-full text-[11px] font-extrabold text-[#15191C] shadow-xs flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#FF6500]" /> Rides
            </span>
            <span className="bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1 rounded-full text-[11px] font-extrabold text-[#15191C] shadow-xs flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#FF6500]" /> Cargo
            </span>
            <span className="bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1 rounded-full text-[11px] font-extrabold text-[#15191C] shadow-xs flex items-center gap-1">
              <Bike className="w-3.5 h-3.5 text-[#FF6500]" /> Boda
            </span>
          </div>
        </div>

        {/* Bottom Welcome Content & Actions */}
        <div className="px-6 pt-3 pb-7 space-y-4 bg-white flex-1 flex flex-col justify-between">
          <div className="text-center space-y-1.5">
            <span className="inline-block bg-[#FFF0E6] text-[#FF6500] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              {activeSlide.badge}
            </span>
            <h2 className="text-2xl font-extrabold text-[#15191C]">{activeSlide.title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
              {activeSlide.subtitle}
            </p>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1.5">
              {onboardingSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    slideIndex === idx ? 'w-6 bg-[#FF6500]' : 'w-2 bg-slate-200'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Choose Experience: Passenger vs Driver */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5 bg-[#F7F7F5] p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'customer'
                    ? 'bg-white text-[#FF6500] shadow-xs border border-[#FF6500]/30'
                    : 'text-slate-600 hover:text-[#15191C]'
                }`}
              >
                <UserRound className="w-4 h-4" />
                <span>I'm a Passenger</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'driver'
                    ? 'bg-white text-[#FF6500] shadow-xs border border-[#FF6500]/30'
                    : 'text-slate-600 hover:text-[#15191C]'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>I'm a Driver</span>
              </button>
            </div>

            {/* Get Started Primary Orange Button */}
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setOtpSent(false);
                setErrorMsg(null);
                setStage('auth');
              }}
              className="w-full rounded-2xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-sm shadow-md transition-colors"
            >
              Get Started as {selectedRole === 'driver' ? 'Driver' : 'Passenger'}
            </button>

            {/* Log In Button */}
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setOtpSent(false);
                setErrorMsg(null);
                setStage('auth');
              }}
              className="w-full py-2 text-sm font-extrabold text-[#15191C] hover:text-[#FF6500] transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= 3. SEPARATE PASSENGER & DRIVER LOGIN / SIGN-UP SCREEN =================
  return (
    <div
      className="min-h-full bg-[#F7F7F5] flex flex-col justify-between p-4 sm:p-6 text-[#15191C]"
      style={{ minHeight: '760px' }}
    >
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Top Back & Brand Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setStage('welcome');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="flex items-center gap-1 text-xs font-extrabold text-[#15191C] hover:text-[#FF6500]"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Intro
          </button>
          <div className="flex items-center gap-1.5">
            <img src="/mride-mark.svg" alt="Mrides" className="w-6 h-6 rounded-md" />
            <span className="font-display font-extrabold text-sm">Mrides</span>
          </div>
        </div>

        {/* Separate Role Selector: Passenger Portal vs Driver Portal */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 grid grid-cols-2 gap-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('customer');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'customer'
                ? 'bg-[#FF6500] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#15191C]'
            }`}
          >
            <UserRound className="w-4 h-4" />
            <span>Passenger Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('driver');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              selectedRole === 'driver'
                ? 'bg-[#FF6500] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#15191C]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Driver Portal</span>
          </button>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6500] block">
                {selectedRole === 'driver' ? 'Mrides Driver Partner' : 'Mrides Passenger'}
              </span>
              <h2 className="text-lg font-extrabold text-[#15191C]">
                {authMode === 'signup'
                  ? selectedRole === 'driver'
                    ? 'Driver Sign Up'
                    : 'Passenger Sign Up'
                  : selectedRole === 'driver'
                  ? 'Driver Log In'
                  : 'Passenger Log In'}
              </h2>
            </div>

            <div className="flex bg-[#F7F7F5] p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setOtpSent(false);
                  setErrorMsg(null);
                }}
                className={`px-2.5 py-1 rounded-lg ${
                  authMode === 'signup' ? 'bg-white text-[#FF6500] shadow-2xs' : 'text-slate-500'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setOtpSent(false);
                  setErrorMsg(null);
                }}
                className={`px-2.5 py-1 rounded-lg ${
                  authMode === 'login' ? 'bg-white text-[#FF6500] shadow-2xs' : 'text-slate-500'
                }`}
              >
                Log In
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-700 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="rounded-xl bg-[#FFF0E6] border border-[#FF6500]/30 p-3 flex items-center gap-2 text-xs text-[#15191C] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {authMode === 'login' && (
            <div className="flex gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                  loginMethod === 'phone'
                    ? 'border-[#FF6500] bg-[#FFF0E6] text-[#15191C]'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-[#FF6500]" /> Phone OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                  loginMethod === 'email'
                    ? 'border-[#FF6500] bg-[#FFF0E6] text-[#15191C]'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-[#FF6500]" /> Email
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitAuth} className="space-y-3 text-xs">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {selectedRole === 'driver' ? 'Driver Full Legal Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedRole === 'driver' ? 'e.g. Chanda Mwamba' : 'e.g. Mutinta Mwanza'}
                    className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-semibold text-[#15191C] outline-none focus:border-[#FF6500]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City (Zambia)</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6500] absolute left-2.5 top-3" />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] pl-8 pr-2 py-2.5 text-xs font-bold text-[#15191C]"
                      >
                        {ZAMBIAN_CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@mrides.co.zm"
                      className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-xs font-semibold text-[#15191C]"
                    />
                  </div>
                </div>
              </>
            )}

            {(authMode === 'signup' || loginMethod === 'phone') && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Zambian Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+260 97 789 452"
                    className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-bold text-[#15191C] outline-none focus:border-[#FF6500]"
                    required
                  />
                </div>

                {otpSent && (
                  <div className="rounded-2xl bg-[#FFF0E6] border border-[#FF6500]/30 p-3 space-y-1.5">
                    <label className="block font-extrabold text-[#15191C] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#FF6500]" /> Enter 4-Digit SMS OTP
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-mono font-extrabold tracking-widest text-center text-[#15191C]"
                      maxLength={6}
                      required
                    />
                    <span className="text-[10px] text-slate-500 block text-center">
                      SMS verification code sent to {phone}
                    </span>
                  </div>
                )}
              </>
            )}

            {authMode === 'login' && loginMethod === 'email' && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'driver'
                        ? 'driver.chanda@mrides.co.zm'
                        : 'chanda.m@mrides.co.zm'
                    }
                    className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-semibold text-[#15191C]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-[#F7F7F5] px-3 py-2.5 text-sm font-semibold text-[#15191C]"
                    required
                  />
                </div>
              </>
            )}

            {authMode === 'signup' && selectedRole === 'driver' && (
              <div className="rounded-2xl bg-[#F7F7F5] border border-slate-200 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-[#15191C] font-extrabold">
                  <FileCheck className="w-4 h-4 text-[#FF6500]" />
                  <span>Vehicle & RTSA Verification Details</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Vehicle Make & Color
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Toyota Axio • White"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Zambian Plate #
                    </label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="BAC 1234"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-mono font-bold uppercase"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    RTSA PSV / Driving License Number
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="ZM-PSV-884120"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-600 mb-1.5">
                    Select Services You Want to Drive For:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { id: 'rides', label: 'Rides' },
                      { id: 'cargo', label: 'Cargo' },
                      { id: 'boda', label: 'Boda' }
                    ] as const).map((svc) => {
                      const active = driverServices.includes(svc.id);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => handleToggleDriverService(svc.id)}
                          className={`py-1.5 rounded-lg text-[11px] font-extrabold border transition-colors ${
                            active
                              ? 'bg-[#FF6500] text-white border-[#FF6500]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {svc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white font-extrabold py-3.5 text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>
                {authMode === 'signup'
                  ? otpSent
                    ? `Verify OTP & Enter ${selectedRole === 'driver' ? 'Driver' : 'Passenger'} App`
                    : `Send Verification Code`
                  : loginMethod === 'phone' && !otpSent
                  ? 'Send Login OTP'
                  : `Log In to ${selectedRole === 'driver' ? 'Driver' : 'Passenger'} App`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* One-Tap Quick Verified Access for Passengers & Drivers Only */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 text-center shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            1-Tap Verified Account Switch (Passenger or Driver)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('customer')}
              className="rounded-xl bg-[#FFF0E6] hover:bg-[#FF6500] text-[#FF6500] hover:text-white font-extrabold py-2.5 px-3 text-xs transition-colors"
            >
              Passenger Account (Chanda M.)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('driver')}
              className="rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-extrabold py-2.5 px-3 text-xs transition-colors"
            >
              Driver Account (BAC 1234)
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 pt-4">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF6500]" /> Verified Zambian Mobility • Mrides
        </span>
      </div>
    </div>
  );
};

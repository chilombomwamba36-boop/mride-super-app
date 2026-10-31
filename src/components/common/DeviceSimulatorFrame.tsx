import React, { useEffect, useRef, useState } from 'react';
import {
  Smartphone,
  Monitor,
  Wifi,
  BatteryMedium,
  Building2,
  Globe2,
  Signal,
  MoreVertical,
  Check,
  X
} from 'lucide-react';

interface DeviceSimulatorFrameProps {
  children: React.ReactNode;
  appMode: 'mobile_app' | 'admin_website';
  onAppModeChange: (mode: 'mobile_app' | 'admin_website') => void;
}

export const DeviceSimulatorFrame: React.FC<DeviceSimulatorFrameProps> = ({
  children,
  appMode,
  onAppModeChange
}) => {
  const [isRealMobileViewport, setIsRealMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(true);
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Automatically adapt to real iPhone / Android / Desktop screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsRealMobileViewport(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close the 3-dot switcher menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSimulatedBezel = appMode === 'mobile_app' && isPhoneMode && !isRealMobileViewport;
  const isManagementPortalActive =
    appMode === 'admin_website' &&
    typeof window !== 'undefined' &&
    window.location.hash === '#management-portal';

  return (
    <div
      className={`w-full bg-[#F7F7F5] flex flex-col items-center relative ${
        showSimulatedBezel ? 'h-[100dvh] overflow-hidden justify-center' : 'min-h-[100dvh]'
      }`}
    >
      {/* Discreet Floating 3-Dot Menu Trigger (Replaces the bulky top switcher bar for a clean app experience) */}
      <div
        ref={menuContainerRef}
        className="fixed top-2.5 right-2.5 z-[9990] flex flex-col items-end"
      >
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="h-9 w-9 rounded-full bg-[#0B1528]/90 hover:bg-[#0B1528] text-white border border-white/20 shadow-lg backdrop-blur-md flex items-center justify-center transition-all active:scale-95"
          title="Switch Mode (Mobile App / Public Website / Staff Portal)"
          aria-label="Open Mode & Device Switcher Menu"
        >
          {isMenuOpen ? <X className="w-4 h-4 text-[#FF6500]" /> : <MoreVertical className="w-4 h-4" />}
        </button>

        {isMenuOpen && (
          <div className="mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 space-y-3 text-xs text-[#15191C] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/mride-mark.svg" alt="Mrides" className="h-6 w-6 rounded-lg" />
                <div>
                  <span className="font-extrabold text-xs text-[#15191C] block leading-none">
                    Mrides Platform
                  </span>
                  <span className="text-[10px] text-slate-500">Switch Experience</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-[#FFF0E6] text-[#FF6500] px-2 py-0.5 rounded-full">
                Zambia
              </span>
            </div>

            {/* 1. Experience / Portal Switcher */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 block">
                Select Experience
              </span>

              <button
                type="button"
                onClick={() => {
                  onAppModeChange('mobile_app');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl font-extrabold flex items-center justify-between transition-all ${
                  appMode === 'mobile_app'
                    ? 'bg-[#FF6500] text-white shadow-xs'
                    : 'hover:bg-[#F7F7F5] text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mrides Mobile App</span>
                </span>
                {appMode === 'mobile_app' && <Check className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#public-website';
                  onAppModeChange('admin_website');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl font-extrabold flex items-center justify-between transition-all ${
                  appMode === 'admin_website' && !isManagementPortalActive
                    ? 'bg-[#FF6500] text-white shadow-xs'
                    : 'hover:bg-[#F7F7F5] text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4" />
                  <span>Public Customer Website</span>
                </span>
                {appMode === 'admin_website' && !isManagementPortalActive && (
                  <Check className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#management-portal';
                  onAppModeChange('admin_website');
                  setIsMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl font-extrabold flex items-center justify-between transition-all ${
                  isManagementPortalActive
                    ? 'bg-[#0B1528] text-white shadow-xs'
                    : 'hover:bg-[#F7F7F5] text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FF6500]" />
                  <span>Private Management Portal</span>
                </span>
                {isManagementPortalActive && <Check className="w-4 h-4 text-[#FF6500]" />}
              </button>
            </div>

            {/* 2. Desktop Display Frame Options (Only shown on Desktop screens when viewing Mobile App) */}
            {appMode === 'mobile_app' && !isRealMobileViewport && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 block">
                  Display Layout
                </span>
                <div className="grid grid-cols-2 gap-1.5 bg-[#F7F7F5] p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhoneMode(true);
                      setIsMenuOpen(false);
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
                      isPhoneMode
                        ? 'bg-white text-[#FF6500] shadow-2xs'
                        : 'text-slate-600 hover:text-[#15191C]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPhoneMode(false);
                      setIsMenuOpen(false);
                    }}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all ${
                      !isPhoneMode
                        ? 'bg-white text-[#FF6500] shadow-2xs'
                        : 'text-slate-600 hover:text-[#15191C]'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Full Screen</span>
                  </button>
                </div>

                {isPhoneMode && (
                  <div className="grid grid-cols-2 gap-1.5 bg-[#F7F7F5] p-1 rounded-xl border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setDeviceType('iphone')}
                      className={`py-1 rounded-lg font-bold transition-all ${
                        deviceType === 'iphone'
                          ? 'bg-white text-[#15191C] shadow-2xs'
                          : 'text-slate-500 hover:text-[#15191C]'
                      }`}
                    >
                      iPhone
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceType('android')}
                      className={`py-1 rounded-lg font-bold transition-all ${
                        deviceType === 'android'
                          ? 'bg-white text-[#15191C] shadow-2xs'
                          : 'text-slate-500 hover:text-[#15191C]'
                      }`}
                    >
                      Android
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Viewport: Auto-fitting Phone Frame on Desktop OR Native Full-Screen on Real iOS/Android */}
      {showSimulatedBezel ? (
        <div className="relative z-10 flex justify-center items-center w-full h-full p-2 sm:p-3">
          <div className="relative flex items-center justify-center h-full max-h-[820px]">
            <div className="absolute -left-[12px] top-24 w-[3px] h-10 bg-slate-700 rounded-l-md" />
            <div className="absolute -left-[12px] top-36 w-[3px] h-10 bg-slate-700 rounded-l-md" />
            <div className="absolute -right-[12px] top-28 w-[3px] h-14 bg-slate-700 rounded-r-md" />

            <div
              className={`relative bg-[#F7F7F5] border-[10px] border-slate-900 shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col transition-all duration-200 ${
                deviceType === 'iphone'
                  ? 'rounded-[44px] ring-2 ring-slate-700/80'
                  : 'rounded-[34px] ring-2 ring-slate-700/80'
              }`}
              style={{
                width: 'min(384px, 94vw)',
                height: 'min(812px, calc(100dvh - 20px))'
              }}
            >
              {/* Compact Status Bar */}
              <div className="shrink-0 z-40 h-9 px-6 flex items-center justify-between text-[#15191C] select-none pointer-events-none text-[11px] font-bold bg-white border-b border-slate-100">
                <span className="font-extrabold">9:41</span>
                <div className="w-20 h-4 rounded-full bg-black flex items-center justify-between px-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6500]" />
                </div>
                <div className="flex items-center gap-1">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <BatteryMedium className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Scrollable App Interior with Transform Context so Expanded Map Stays Inside Phone */}
              <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden bg-[#F7F7F5] no-scrollbar">
                {children}
              </div>

              {/* Home Indicator Bar */}
              <div className="shrink-0 h-4 bg-white flex items-center justify-center pointer-events-none">
                <div className="w-28 h-1 bg-slate-900/50 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full min-h-[100dvh] flex-1 relative z-10 flex flex-col">
          {children}
        </div>
      )}
    </div>
  );
};

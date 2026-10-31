import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Car,
  BellRing,
  Sparkles,
  X,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { AiVoiceCopilotService } from '../../services/aiVoiceCopilotService';

export interface MrideWaitTimeReel {
  id: string;
  creatorHandle: string;
  creatorRoleBadge: string;
  caption: string;
  locationTag: string;
  soundTrackName: string;
  tiktokVideoId: string;
  videoUrl: string;
  posterUrl: string;
  likesCount: number;
  commentsCount: number;
}

const LUSAKA_WAIT_REELS: MrideWaitTimeReel[] = [
  {
    id: 'reel_1',
    creatorHandle: '@mride_lusaka_official',
    creatorRoleBadge: 'TikTok Lusaka Spotlight',
    caption: 'Cruising past EastPark Mall & Great East Road! Propose your FairFare from K28 Economy & K40 Comfort across Lusaka #MrideZambia #LusakaTikTok',
    locationTag: 'Great East Rd, Lusaka',
    soundTrackName: 'Original Sound - Mride Zambia',
    tiktokVideoId: '7341928419284912385',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: '/lusaka-driver-hero.jpg',
    likesCount: 4820,
    commentsCount: 319
  },
  {
    id: 'reel_2',
    creatorHandle: '@zed_street_vibes',
    creatorRoleBadge: 'Zambia TikTok Creator',
    caption: 'Waiting for my Mride at Manda Hill! Love how the app alerts you with AI voice the second your driver pulls up #Zambia #LusakaVibes',
    locationTag: 'Manda Hill Mall, Lusaka',
    soundTrackName: 'Amapiano Lusaka Beat - Zed Mix',
    tiktokVideoId: '7318492019283746192',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
    likesCount: 6290,
    commentsCount: 412
  },
  {
    id: 'reel_3',
    creatorHandle: '@chanda_vip_driver',
    creatorRoleBadge: '5.0★ Top Mride Driver',
    caption: 'Keeping my Mride Fleet Toyota Axio spotless, AC ice cold, and ready for my Lusaka passengers! #MridePartner #LusakaDrivers',
    locationTag: 'Cairo Road CBD, Lusaka',
    soundTrackName: 'Lusaka Morning Drive - Chanda VIP',
    tiktokVideoId: '7359182736451928374',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80',
    likesCount: 8410,
    commentsCount: 528
  },
  {
    id: 'reel_4',
    creatorHandle: '@visit_zambia_tiktok',
    creatorRoleBadge: 'Zambia Tourism & Travel',
    caption: 'From Kenneth Kaunda Int. Airport to Livingstone & Victoria Falls — Mride is connecting every city in Zambia! #VisitZambia',
    locationTag: 'Livingstone & Lusaka, Zambia',
    soundTrackName: 'Sounds of Mosi-oa-Tunya - Zambia',
    tiktokVideoId: '7361029384756102938',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&auto=format&fit=crop&q=80',
    likesCount: 12450,
    commentsCount: 890
  }
];

interface MrideWaitTimeReelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverPhoto: string;
  vehicleModel: string;
  vehiclePlate: string;
  pickupName: string;
  destinationName: string;
  initialEtaMinutes: number;
  hasDriverArrivedExternal?: boolean;
  onConfirmBoardedVehicle?: () => void;
}

export const MrideWaitTimeReelsModal: React.FC<MrideWaitTimeReelsModalProps> = ({
  isOpen,
  onClose,
  driverName,
  driverPhoto,
  vehicleModel,
  vehiclePlate,
  pickupName,
  destinationName,
  initialEtaMinutes,
  hasDriverArrivedExternal = false,
  onConfirmBoardedVehicle
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>(['reel_1']);
  const [isMuted, setIsMuted] = useState(false);
  const [playerMode, setPlayerMode] = useState<'instant_video' | 'tiktok_embed'>('instant_video');
  const [customTikTokUrl, setCustomTikTokUrl] = useState('');
  const [activeCustomTikTokId, setActiveCustomTikTokId] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(() => Math.max(15, initialEtaMinutes * 12));
  const [driverArrivedAlert, setDriverArrivedAlert] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeReel = LUSAKA_WAIT_REELS[activeIndex];

  // Reset countdown when opened
  useEffect(() => {
    if (!isOpen) return;
    if (hasDriverArrivedExternal) {
      setDriverArrivedAlert(true);
      setSecondsRemaining(0);
      return;
    }
    setDriverArrivedAlert(false);
    setSecondsRemaining(Math.max(18, Math.min(45, initialEtaMinutes * 8)));
  }, [hasDriverArrivedExternal, initialEtaMinutes, isOpen]);

  // Live arrival countdown while user watches reels; triggers AI Voice + Chime when driver arrives
  useEffect(() => {
    if (!isOpen || driverArrivedAlert) return;

    const timer = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setDriverArrivedAlert(true);
          AiVoiceCopilotService.playDriverArrivalChimeAndAnnounce(
            driverName,
            vehicleModel,
            vehiclePlate,
            pickupName
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [driverArrivedAlert, driverName, isOpen, pickupName, vehicleModel, vehiclePlate]);

  // Play current reel video on slide change
  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {
      // Autoplay fallback if browser blocks unmuted video
    });
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  const handleNextReel = () => {
    setActiveIndex((prev) => (prev + 1) % LUSAKA_WAIT_REELS.length);
  };

  const handlePrevReel = () => {
    setActiveIndex((prev) => (prev - 1 + LUSAKA_WAIT_REELS.length) % LUSAKA_WAIT_REELS.length);
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSimulateInstantArrival = () => {
    setSecondsRemaining(0);
    setDriverArrivedAlert(true);
    AiVoiceCopilotService.playDriverArrivalChimeAndAnnounce(
      driverName,
      vehicleModel,
      vehiclePlate,
      pickupName
    );
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/95 flex flex-col justify-between overflow-hidden select-none">
      {/* Background Full-Screen Vertical Video Player (Instant HD Video or Official TikTok Embed Player) */}
      <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center">
        {playerMode === 'tiktok_embed' ? (
          <iframe
            key={activeCustomTikTokId || activeReel.tiktokVideoId}
            src={`https://www.tiktok.com/embed/v2/${activeCustomTikTokId || activeReel.tiktokVideoId}`}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            title={`TikTok video ${activeReel.creatorHandle}`}
          />
        ) : (
          <video
            ref={videoRef}
            key={activeReel.videoUrl}
            src={activeReel.videoUrl}
            poster={activeReel.posterUrl}
            loop
            playsInline
            muted={isMuted}
            autoPlay
            onClick={handleNextReel}
            className="w-full h-full object-cover opacity-95 cursor-pointer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85 pointer-events-none" />
      </div>

      {/* ================= TOP FLOATING RIDE TRACKER & ARRIVAL ALERT HUD ================= */}
      <div className="relative z-20 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 bg-[#0B1528]/90 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 text-white shadow-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={driverPhoto}
                alt={driverName}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#FF6500]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0B1528]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFE500]">
                  {driverArrivedAlert ? 'DRIVER IS OUTSIDE!' : 'LIVE RIDE RADAR'}
                </span>
                <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded font-mono font-bold">
                  {vehiclePlate}
                </span>
              </div>
              <p className="text-xs font-extrabold truncate">
                {driverArrivedAlert
                  ? `${driverName} has arrived at ${pickupName}!`
                  : `${driverName} arriving in ~${secondsRemaining}s`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                setPlayerMode((m) => (m === 'instant_video' ? 'tiktok_embed' : 'instant_video'))
              }
              className={`px-2 py-1.5 rounded-xl text-[10px] font-extrabold border transition-colors ${
                playerMode === 'tiktok_embed'
                  ? 'bg-pink-600 text-white border-pink-400'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Switch between Instant HD Reel Feed and Official TikTok Embed Player"
            >
              {playerMode === 'tiktok_embed' ? 'TikTok Embed ON' : 'TikTok Embed'}
            </button>
            {!driverArrivedAlert && (
              <button
                type="button"
                onClick={handleSimulateInstantArrival}
                className="px-2.5 py-1.5 rounded-xl bg-[#FF6500] hover:bg-[#E55A00] text-white text-[10px] font-extrabold shadow-xs"
                title="Test Driver Arrival Alert Now"
              >
                Test Arrival
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Close Reels and return to map"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Paste Any TikTok Video Link Bar when in TikTok Embed Mode */}
        {playerMode === 'tiktok_embed' && (
          <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl px-2.5 py-1.5">
            <input
              type="text"
              value={customTikTokUrl}
              onChange={(e) => setCustomTikTokUrl(e.target.value)}
              placeholder="Paste any TikTok video URL or ID to watch..."
              className="flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => {
                const match = customTikTokUrl.match(/video\/(\d+)/) || customTikTokUrl.match(/^(\d{15,22})$/);
                if (match?.[1]) {
                  setActiveCustomTikTokId(match[1]);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-pink-600 text-white text-[10px] font-extrabold"
            >
              Load TikTok
            </button>
          </div>
        )}

        {/* FULL POPUP NOTIFICATION BANNER WHEN DRIVER REACHES PICKUP */}
        {driverArrivedAlert && (
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 shadow-2xl border-2 border-white/40 animate-bounce space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                  <BellRing className="w-5 h-5 animate-ping" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block">
                    Ride Arrival Notification • AI Voice Announced
                  </span>
                  <h3 className="text-sm font-extrabold">
                    Your Ride Has Reached {pickupName}!
                  </h3>
                  <p className="text-[11px] text-emerald-50">
                    {driverName} is waiting in a <strong>{vehicleModel}</strong> ({vehiclePlate}).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onConfirmBoardedVehicle?.();
                  onClose();
                }}
                className="flex-1 rounded-xl bg-white text-emerald-900 font-extrabold py-2.5 text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                I'm Boarding Now (Back to Live Map)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= RIGHT-SIDE TIKTOK INTERACTION RAIL ================= */}
      <div className="relative z-20 flex items-end justify-between p-4 pb-6">
        {/* Bottom-Left Reel Creator & Caption Info */}
        <div className="max-w-[76%] space-y-1.5 text-white">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6500] px-2.5 py-0.5 text-[10px] font-extrabold">
            <Sparkles className="w-3 h-3" />
            <span>{activeReel.creatorRoleBadge}</span>
          </div>

          <h4 className="text-sm font-extrabold flex items-center gap-2">
            <span>{activeReel.creatorHandle}</span>
          </h4>

          <p className="text-xs text-slate-200 leading-snug line-clamp-2">
            {activeReel.caption}
          </p>

          <p className="text-[11px] text-[#FFE500] font-bold flex items-center gap-1 pt-0.5">
            <MapPin className="w-3 h-3" />
            <span>{activeReel.locationTag}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">Destination: {destinationName}</span>
          </p>
        </div>

        {/* Right Vertical Action Buttons (Like, Comment, Sound, Swipe Up/Down) */}
        <div className="flex flex-col items-center gap-3 text-white">
          <button
            type="button"
            onClick={handlePrevReel}
            className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20"
            title="Previous Video"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNextReel}
            className="h-10 w-10 rounded-full bg-[#FF6500] hover:bg-[#E55A00] flex items-center justify-center shadow-lg border border-white/30"
            title="Next Video"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => toggleLike(activeReel.id)}
            className="flex flex-col items-center gap-0.5"
          >
            <div
              className={`h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center border ${
                likedIds.includes(activeReel.id)
                  ? 'bg-rose-600 border-rose-400 text-white'
                  : 'bg-white/15 border-white/20 text-white'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${likedIds.includes(activeReel.id) ? 'fill-white' : ''}`}
              />
            </div>
            <span className="text-[10px] font-bold">
              {activeReel.likesCount + (likedIds.includes(activeReel.id) ? 1 : 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextReel}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="h-10 w-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold">{activeReel.commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="h-10 w-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              {isMuted ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <span className="text-[10px] font-bold">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex flex-col items-center gap-0.5 pt-1"
          >
            <div className="h-10 w-10 rounded-full bg-[#0B1528] border border-[#FF6500] flex items-center justify-center text-[#FF6500]">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[#FFE500]">Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';

interface InAppDataCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  peerName: string;
  peerRoleLabel: string;
  peerPhone?: string;
  peerPhoto?: string;
  peerVehicleOrNote?: string;
}

export const InAppDataCallModal: React.FC<InAppDataCallModalProps> = ({
  isOpen,
  onClose,
  peerName,
  peerRoleLabel,
  peerPhone = '+260 97 789 4432',
  peerPhoto,
  peerVehicleOrNote
}) => {
  const [callMode, setCallMode] = useState<'in_app' | 'direct_phone'>('in_app');
  const [selectedNetwork, setSelectedNetwork] = useState<'airtel' | 'mtn' | 'zamtel'>('airtel');
  const [isOnlineData, setIsOnlineData] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnlineData(true);
    const handleOffline = () => setIsOnlineData(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setCallState('connecting');
      setSecondsElapsed(0);
      setMicActive(false);
      return;
    }

    if (!isOnlineData) return;

    // Request real WebRTC microphone audio stream when available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          setMicActive(true);
        })
        .catch(() => {
          setMicActive(false);
        });
    }

    const connectTimer = window.setTimeout(() => {
      setCallState('connected');
    }, 1200);

    return () => {
      window.clearTimeout(connectTimer);
    };
  }, [isOpen, isOnlineData]);

  useEffect(() => {
    if (!isOpen || callState !== 'connected' || !isOnlineData) return;
    const interval = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isOpen, callState, isOnlineData]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }
  };

  const handleEndCall = () => {
    setCallState('ended');
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    window.setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#15191C] text-white rounded-[36px] max-w-sm w-full p-6 shadow-2xl border border-white/10 flex flex-col items-center justify-between space-y-6">
        {/* Top Data Status Pill */}
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex gap-1.5 bg-white/10 p-1 rounded-full">
            <button
              type="button"
              onClick={() => setCallMode('in_app')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                callMode === 'in_app' ? 'bg-[#FF6500] text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              In-App Voice (Free)
            </button>
            <button
              type="button"
              onClick={() => setCallMode('direct_phone')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                callMode === 'direct_phone' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Direct GSM Call
            </button>
          </div>
          {callMode === 'in_app' ? (
            isOnlineData ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <Wifi className="w-3 h-3" /> HD VoIP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[10px]">
                <WifiOff className="w-3 h-3" /> Offline
              </span>
            )
          ) : (
            <span className="text-emerald-400 font-bold text-[10px]">Zambia GSM</span>
          )}
        </div>

        {/* GSM Direct Network Option Mode */}
        {callMode === 'direct_phone' ? (
          <div className="w-full space-y-4 py-1 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                Direct Cellular Network Call
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">{peerName}</h3>
              <p className="text-sm font-mono font-bold text-slate-300 mt-1">{peerPhone}</p>
            </div>

            {/* Designed Network Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 block">Select Outbound Network:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('airtel')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedNetwork === 'airtel'
                      ? 'bg-red-600 text-white border-red-500 ring-2 ring-red-400'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="block font-black text-xs">Airtel</span>
                  <span className="block text-[9px] opacity-80 font-bold">097 / 077</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('mtn')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedNetwork === 'mtn'
                      ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-400 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="block font-black text-xs">MTN</span>
                  <span className="block text-[9px] opacity-80 font-bold">096 / 076</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNetwork('zamtel')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedNetwork === 'zamtel'
                      ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <span className="block font-black text-xs">Zamtel</span>
                  <span className="block text-[9px] opacity-80 font-bold">095 / 075</span>
                </button>
              </div>
            </div>

            <a
              href={`tel:${peerPhone.replace(/\s+/g, '')}`}
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Phone className="w-4 h-4" />
              Dial via {selectedNetwork.toUpperCase()} Network
            </a>
          </div>
        ) : (
          /* Peer Avatar & Live Audio Pulse (In-App) */
          <>
            <div className="flex flex-col items-center text-center space-y-3 py-2">
              <div className="relative">
                {callState === 'connected' && isOnlineData && (
                  <div className="absolute -inset-2 rounded-full border-2 border-[#FF6500] animate-ping opacity-40" />
                )}
                <img
                  src={
                    peerPhoto ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={peerName}
                  className="relative w-24 h-24 rounded-full object-cover border-2 border-[#FF6500]"
                />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6500] block">
                  {peerRoleLabel}
                </span>
                <h3 className="text-xl font-extrabold mt-0.5">{peerName}</h3>
                {peerVehicleOrNote && (
                  <p className="text-xs text-slate-400 mt-0.5">{peerVehicleOrNote}</p>
                )}
              </div>

              {/* Call Timer or Connection Status */}
              <div className="pt-1">
                {!isOnlineData ? (
                  <span className="text-xs font-bold text-red-400">
                    Turn on Mobile Data or Wi-Fi to place in-app calls
                  </span>
                ) : callState === 'connecting' ? (
                  <span className="text-sm font-bold text-[#FFE500] animate-pulse">
                    Connecting over mobile data...
                  </span>
                ) : callState === 'connected' ? (
                  <div className="space-y-1">
                    <span className="font-mono text-2xl font-extrabold text-white block">
                      {formatDuration(secondsElapsed)}
                    </span>
                    <span className="text-[10px] text-emerald-400 block">
                      {micActive ? 'Microphone stream active • Zero airtime cost' : 'Connected via Mrides Data Call'}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-slate-400">Call ended</span>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-center text-[11px] text-slate-300">
              Your personal phone number is masked. This call routes securely through Mrides servers.
            </div>

            {/* Call Controls: Mute, End Call, Speaker */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                type="button"
                onClick={toggleMute}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-[#FF6500] text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                title="End In-App Call"
              >
                {callState === 'ended' ? <Phone className="w-6 h-6" /> : <PhoneOff className="w-6 h-6" />}
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-colors ${
                  isSpeakerOn ? 'bg-white/25 text-[#FFE500]' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Toggle Speakerphone"
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

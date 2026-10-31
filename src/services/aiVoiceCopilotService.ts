export class AiVoiceCopilotService {
  private static isVoiceEnabled = true;
  private static lastSpokenText = '';
  private static lastSpokenTimestamp = 0;
  private static listeners: Array<(caption: string | null, isSpeaking: boolean) => void> = [];
  private static clearCaptionTimer: number | null = null;

  public static getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  public static setVoiceEnabled(enabled: boolean): void {
    this.isVoiceEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.notifyListeners(null, false);
    }
  }

  public static subscribe(listener: (caption: string | null, isSpeaking: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(caption: string | null, isSpeaking: boolean): void {
    for (const listener of this.listeners) {
      try {
        listener(caption, isSpeaking);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Play a crisp futuristic AI activation chime so the user always hears audio feedback immediately
   */
  public static playActivationTone(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.14); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // ignore if audio context restricted
    }
  }

  /**
   * Speak natural AI voice guidance for drivers or passengers using Web Speech Synthesis
   */
  public static speakGuidance(text: string, force = false): void {
    if (!this.isVoiceEnabled && !force) return;
    if (typeof window === 'undefined') return;

    const clean = text.trim();
    if (!clean) return;

    const now = Date.now();
    // Avoid repeating the exact same instruction within 6 seconds unless forced
    if (!force && clean === this.lastSpokenText && now - this.lastSpokenTimestamp < 6000) {
      return;
    }

    this.lastSpokenText = clean;
    this.lastSpokenTimestamp = now;

    if (this.clearCaptionTimer) {
      window.clearTimeout(this.clearCaptionTimer);
    }
    this.notifyListeners(clean, true);
    this.clearCaptionTimer = window.setTimeout(() => {
      this.notifyListeners(null, false);
    }, 6500);

    this.playActivationTone();

    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const speakNow = () => {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'en-US';
        utterance.rate = 1.02;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Siri') ||
                v.name.includes('Microsoft'))
          ) || voices.find((v) => v.lang.startsWith('en'));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          this.notifyListeners(null, false);
        };

        window.speechSynthesis.speak(utterance);
      };

      const existingVoices = window.speechSynthesis.getVoices();
      if (existingVoices.length > 0) {
        speakNow();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          speakNow();
        };
        // Also attempt directly in case onvoiceschanged doesn't fire
        window.setTimeout(speakNow, 80);
      }
    } catch {
      // Ignore if browser blocks un-interacted audio
    }
  }

  /**
   * Play a two-tone arrival chime + spoken arrival alert when the driver reaches the passenger
   * (especially while watching the TikTok-style Mride Reels feed).
   */
  public static playDriverArrivalChimeAndAnnounce(
    driverName: string,
    vehicleModel: string,
    vehiclePlate: string,
    pickupName: string
  ): void {
    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const playTone = (freq: number, startOffset: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + startOffset);
          osc.stop(ctx.currentTime + startOffset + duration);
        };
        playTone(587.33, 0, 0.22); // D5
        playTone(880.0, 0.24, 0.35); // A5
      }
    } catch {
      // Ignore audio context restriction
    }

    this.speakGuidance(
      `Attention passenger! Your Mride driver ${driverName} has arrived at ${pickupName} in a ${vehicleModel}, plate number ${vehiclePlate}.`,
      true
    );
  }
}

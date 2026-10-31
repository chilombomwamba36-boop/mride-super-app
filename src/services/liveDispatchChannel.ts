import { RideRequest } from '../types';
import { MOCK_OPEN_RIDE_REQUESTS } from '../data/mockData';
import { publishDriverLocation } from './driverLocationChannel';

const LIVE_REQUESTS_KEY = 'mrides_live_open_requests_v1';
const CHANNEL_NAME = 'mrides_live_dispatch_channel_v1';

export type DispatchEventMessage =
  | { type: 'NEW_RIDE_REQUEST'; request: RideRequest }
  | { type: 'DRIVER_COUNTER_OFFER'; requestId: string; driverName: string; amountZMW: number }
  | { type: 'DRIVER_ACCEPTED_REQUEST'; requestId: string; driverName: string; agreedFareZMW: number };

export class LiveDispatchChannelService {
  private static channel: BroadcastChannel | null =
    typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel(CHANNEL_NAME)
      : null;

  public static getOpenRequests(): RideRequest[] {
    try {
      const raw = localStorage.getItem(LIVE_REQUESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RideRequest[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [...MOCK_OPEN_RIDE_REQUESTS];
  }

  public static broadcastPassengerRequest(request: RideRequest): void {
    try {
      const current = this.getOpenRequests().filter((r) => r.id !== request.id);
      const updated = [request, ...current];
      localStorage.setItem(LIVE_REQUESTS_KEY, JSON.stringify(updated));
      this.channel?.postMessage({ type: 'NEW_RIDE_REQUEST', request } as DispatchEventMessage);
      window.dispatchEvent(
        new CustomEvent('mrides:live-dispatch', {
          detail: { type: 'NEW_RIDE_REQUEST', request }
        })
      );
    } catch {
      // ignore
    }
  }

  public static broadcastDriverAction(msg: DispatchEventMessage): void {
    try {
      if (msg.type === 'DRIVER_ACCEPTED_REQUEST') {
        const remaining = this.getOpenRequests().filter((r) => r.id !== msg.requestId);
        localStorage.setItem(LIVE_REQUESTS_KEY, JSON.stringify(remaining));
      }
      this.channel?.postMessage(msg);
      window.dispatchEvent(new CustomEvent('mrides:live-dispatch', { detail: msg }));
    } catch {
      // ignore
    }
  }

  public static subscribe(callback: (msg: DispatchEventMessage) => void): () => void {
    const handleBroadcast = (event: MessageEvent<DispatchEventMessage>) => {
      if (event.data) callback(event.data);
    };
    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<DispatchEventMessage>).detail;
      if (detail) callback(detail);
    };
    this.channel?.addEventListener('message', handleBroadcast);
    window.addEventListener('mrides:live-dispatch', handleCustom);
    return () => {
      this.channel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('mrides:live-dispatch', handleCustom);
    };
  }

  /**
   * Start real HTML5 Geolocation telemetry stream and broadcast live coordinates,
   * heading bearing, and speed to the map and connected passenger/driver clients.
   */
  public static startLiveGpsTelemetry(
    onCoordinate?: (coord: { lat: number; lng: number; headingDegrees?: number | null }) => void
  ): () => void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coord = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        const headingDegrees =
          typeof pos.coords.heading === 'number' && !Number.isNaN(pos.coords.heading)
            ? pos.coords.heading
            : null;
        publishDriverLocation(coord, {
          headingDegrees,
          speedMetersPerSecond: pos.coords.speed,
          accuracyMeters: pos.coords.accuracy
        });
        onCoordinate?.({ ...coord, headingDegrees });
      },
      () => {
        // Fallback if indoor GPS signal is acquiring
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 12000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }
}

import { MapCoordinate, computeBearingDegrees, computeDistanceMeters } from './mapRouting';

export interface DriverLocationUpdate {
  coordinate: MapCoordinate;
  headingDegrees: number | null;
  speedMetersPerSecond: number | null;
  accuracyMeters: number | null;
  timestamp: number;
}

const CHANNEL_NAME = 'mride-driver-location-preview';
const listeners = new Set<(location: DriverLocationUpdate | null) => void>();
let latestLocation: DriverLocationUpdate | null = null;
let channel: BroadcastChannel | null = null;

function notify(location: DriverLocationUpdate | null) {
  latestLocation = location;
  listeners.forEach((listener) => listener(location));
}

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<DriverLocationUpdate | null>) => {
      notify(event.data);
    };
  }
  return channel;
}

export function publishDriverLocation(
  coordinate: MapCoordinate,
  telemetry?: {
    headingDegrees?: number | null;
    speedMetersPerSecond?: number | null;
    accuracyMeters?: number | null;
  }
) {
  let resolvedHeading =
    telemetry?.headingDegrees !== undefined &&
    telemetry.headingDegrees !== null &&
    !Number.isNaN(telemetry.headingDegrees)
      ? telemetry.headingDegrees
      : null;

  // If browser/device GPS did not supply a compass heading, compute real course-over-ground
  // bearing from the previous real GPS coordinate when the vehicle moved >= 3 meters.
  if (resolvedHeading === null && latestLocation) {
    const movedMeters = computeDistanceMeters(latestLocation.coordinate, coordinate);
    if (movedMeters >= 3) {
      resolvedHeading = computeBearingDegrees(latestLocation.coordinate, coordinate);
    } else {
      resolvedHeading = latestLocation.headingDegrees;
    }
  }

  const update: DriverLocationUpdate = {
    coordinate,
    headingDegrees: resolvedHeading,
    speedMetersPerSecond: telemetry?.speedMetersPerSecond ?? null,
    accuracyMeters: telemetry?.accuracyMeters ?? null,
    timestamp: Date.now()
  };

  notify(update);
  getChannel()?.postMessage(update);
}

export function clearDriverLocation() {
  notify(null);
  getChannel()?.postMessage(null);
}

export function subscribeToDriverLocation(
  listener: (location: DriverLocationUpdate | null) => void
) {
  listeners.add(listener);
  listener(latestLocation);
  getChannel();
  return () => {
    listeners.delete(listener);
  };
}

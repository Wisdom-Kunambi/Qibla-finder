import { useMemo } from "react";
import { useDeviceOrientation } from "./useDeviceOrientation";
import { useQiblaCalculation } from "./useQiblaCalculation";
import { angleDifference } from "../utils/qiblaCalculations";

/**
 * Main compass hook that combines device orientation with Qibla calculation
 *
 * On mobile (with compass): provides real-time rotation data
 * On desktop (no compass): provides static bearing for a fixed compass display
 */
export function useCompass(position) {
  // Get device orientation (compass heading)
  const {
    heading: deviceHeading,
    error: orientationError,
    isSupported,
    permissionState,
    requestPermission: requestOrientationPermission,
  } = useDeviceOrientation();

  // Calculate Qibla direction and distance
  const { qiblaDirection, distance, userLocation } =
    useQiblaCalculation(position);

  // Check if we have working compass sensor (heading data received)
  const hasCompassData = deviceHeading !== null;

  /**
   * Calculate angle for display
   * Mobile (with heading): relative angle from current heading
   * Desktop (no heading): absolute Qibla bearing (for static compass, North at top)
   */
  const qiblaAngle = useMemo(() => {
    if (qiblaDirection === null) return null;

    if (deviceHeading !== null) {
      // Mobile: relative angle from current device heading
      return angleDifference(deviceHeading, qiblaDirection);
    }

    // Desktop: return absolute Qibla bearing (static compass)
    return qiblaDirection;
  }, [qiblaDirection, deviceHeading]);

  return {
    qiblaAngle,
    deviceHeading,
    qiblaDirection,
    distance,
    userLocation,
    hasCompassData, // true if real-time compass available
    error: orientationError,
    isSupported,
    permissionState,
    requestOrientationPermission,
  };
}

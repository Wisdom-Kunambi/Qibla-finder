import { useMemo } from "react";
import {
  calculateQiblaDirection,
  calculateDistance,
} from "../utils/qiblaCalculations";
import { MECCA_COORDINATES } from "../constants/locations";

/**
 * Custom hook for calculating Qibla direction and distance
 *
 * Takes a geolocation position and returns calculated Qibla data
 *
 * @param position - Geolocation position object
 * @returns Qibla direction, distance, and user location
 *
 * @example
 * const { position } = useGeolocation();
 * const { qiblaDirection, distance } = useQiblaCalculation(position);
 *
 * if (qiblaDirection !== null) {
 *   console.log(`Qibla is at ${qiblaDirection}°`);
 *   console.log(`Mecca is ${distance} km away`);
 * }
 */
export function useQiblaCalculation(position) {
  /**
   * Memoize calculations to avoid unnecessary recalculations
   * Only recalculate when position coordinates change significantly
   */
  const result = useMemo(() => {
    if (!position) {
      return {
        qiblaDirection: null,
        distance: null,
        userLocation: null,
      };
    }

    const { latitude, longitude } = position.coords;

    // Calculate Qibla direction
    const qiblaDirection = calculateQiblaDirection(latitude, longitude);

    // Calculate distance to Mecca
    const distance = calculateDistance(
      latitude,
      longitude,
      MECCA_COORDINATES.lat,
      MECCA_COORDINATES.lng
    );

    return {
      qiblaDirection,
      distance,
      userLocation: {
        lat: latitude,
        lng: longitude,
      },
    };
  }, [position?.coords.latitude, position?.coords.longitude]);

  return result;
}

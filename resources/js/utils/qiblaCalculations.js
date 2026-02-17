/**
 * Core Qibla calculation utilities using spherical trigonometry
 */

import { MECCA_COORDINATES } from "../constants/locations";

/**
 * Convert degrees to radians
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate the Qibla direction from a given location to Mecca
 *
 * Uses the spherical law of sines formula for bearing calculation:
 * bearing = atan2(sin(Δλ) × cos(φ2), cos(φ1) × sin(φ2) - sin(φ1) × cos(φ2) × cos(Δλ))
 *
 * Where:
 * - φ1, λ1 = user's latitude and longitude (in radians)
 * - φ2, λ2 = Mecca's latitude and longitude (in radians)
 * - Δλ = difference in longitude
 *
 * @param userLat - User's latitude in degrees (-90 to 90)
 * @param userLng - User's longitude in degrees (-180 to 180)
 * @returns Qibla direction in degrees (0-360), where 0° is North, 90° is East
 *
 * @example
 * // New York City
 * const qibla = calculateQiblaDirection(40.7128, -74.0060);
 * console.log(qibla); // ~58° (Northeast)
 */
export function calculateQiblaDirection(userLat, userLng) {
  // Convert to radians
  const φ1 = toRadians(userLat);
  const φ2 = toRadians(MECCA_COORDINATES.lat);
  const Δλ = toRadians(MECCA_COORDINATES.lng - userLng);

  // Calculate bearing using spherical trigonometry
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = Math.atan2(y, x);

  // Convert from radians to degrees
  bearing = toDegrees(bearing);

  // Normalize to 0-360
  return (bearing + 360) % 360;
}

/**
 * Calculate the great-circle distance between two points on Earth
 * Uses the Haversine formula for accuracy
 *
 * Formula:
 * a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
 * c = 2 × atan2(√a, √(1-a))
 * d = R × c
 *
 * Where:
 * - R = Earth's radius (6371 km)
 * - φ = latitude, λ = longitude
 * - Δφ = difference in latitude
 * - Δλ = difference in longitude
 *
 * @param lat1 - First point latitude in degrees
 * @param lng1 - First point longitude in degrees
 * @param lat2 - Second point latitude in degrees
 * @param lng2 - Second point longitude in degrees
 * @param radiusKm - Earth's radius in kilometers (default: 6371)
 * @returns Distance in kilometers
 *
 * @example
 * // Distance from New York to Mecca
 * const distance = calculateDistance(40.7128, -74.0060, 21.4225, 39.8262);
 * console.log(distance); // ~9,364 km
 */
export function calculateDistance(lat1, lng1, lat2, lng2, radiusKm = 6371) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radiusKm * c;
}

/**
 * Normalize an angle to the range 0-360 degrees
 */
export function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculate the shortest angular difference between two angles
 * Returns a value between -180 and 180
 *
 * @param angle1 - First angle in degrees (0-360)
 * @param angle2 - Second angle in degrees (0-360)
 * @returns Angular difference (-180 to 180), positive means angle2 is clockwise from angle1
 */
export function angleDifference(angle1, angle2) {
  let diff = angle2 - angle1;

  // Normalize to -180 to +180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return diff;
}

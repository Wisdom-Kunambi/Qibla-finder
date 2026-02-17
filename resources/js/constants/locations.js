/**
 * Geographic constants for Qibla calculation
 */

/**
 * Kaaba coordinates in Mecca, Saudi Arabia
 * These are the precise coordinates of the Kaaba
 */
export const MECCA_COORDINATES = {
  lat: 21.4225, // Latitude in degrees
  lng: 39.8262, // Longitude in degrees
  name: "Mecca (Kaaba)",
};

/**
 * Earth's mean radius in kilometers
 * Used for distance calculations
 */
export const EARTH_RADIUS_KM = 6371;

/**
 * Earth's mean radius in miles
 */
export const EARTH_RADIUS_MI = 3959;

/**
 * Conversion factor from kilometers to miles
 */
export const KM_TO_MILES = 0.621371;

/**
 * Conversion factor from miles to kilometers
 */
export const MILES_TO_KM = 1.60934;

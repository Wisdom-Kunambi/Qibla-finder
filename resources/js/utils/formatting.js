/**
 * Formatting utilities for displaying geographic and compass data
 */

import { KM_TO_MILES } from "../constants/locations";

/**
 * Format a degree value for display
 */
export function formatDegrees(degrees, decimals = 1) {
  return `${degrees.toFixed(decimals)}°`;
}

/**
 * Format distance for display with appropriate unit
 */
export function formatDistance(distanceKm, unit = "km", decimals = 0) {
  const distance = unit === "mi" ? distanceKm * KM_TO_MILES : distanceKm;
  const formatted = distance.toFixed(decimals);

  // Add thousands separator
  const withSeparator = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${withSeparator} ${unit}`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lng, decimals = 4) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";

  const latAbs = Math.abs(lat).toFixed(decimals);
  const lngAbs = Math.abs(lng).toFixed(decimals);

  return `${latAbs}°${latDir}, ${lngAbs}°${lngDir}`;
}

/**
 * Get cardinal direction from degrees
 */
export function getCardinalDirection(degrees) {
  const normalized = ((degrees % 360) + 360) % 360;

  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/**
 * Get full cardinal direction name from degrees
 */
export function getCardinalDirectionFull(degrees) {
  const normalized = ((degrees % 360) + 360) % 360;

  const directions = [
    "North",
    "North-Northeast",
    "Northeast",
    "East-Northeast",
    "East",
    "East-Southeast",
    "Southeast",
    "South-Southeast",
    "South",
    "South-Southwest",
    "Southwest",
    "West-Southwest",
    "West",
    "West-Northwest",
    "Northwest",
    "North-Northwest",
  ];

  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/**
 * Format relative direction instruction
 */
export function formatRelativeDirection(angle) {
  const absAngle = Math.abs(angle);

  if (absAngle < 5) {
    return "You are facing the Qibla";
  }

  const direction = angle > 0 ? "right" : "left";
  return `Turn ${absAngle.toFixed(0)}° to your ${direction}`;
}

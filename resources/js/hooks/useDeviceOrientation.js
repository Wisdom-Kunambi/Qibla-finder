import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook for accessing device orientation (compass)
 * Provides smooth, real-time compass heading with jitter reduction
 */
export function useDeviceOrientation() {
  const [state, setState] = useState({
    heading: null,
    error: null,
    isAbsolute: false,
    isSupported: false,
    permissionState: "unknown",
  });

  const previousHeadingRef = useRef(null);
  const bufferRef = useRef([]);
  const animFrameRef = useRef(null);
  const latestRawRef = useRef(null);

  const checkSupport = useCallback(() => {
    return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
  }, []);

  /**
   * Smooth heading using weighted moving average + exponential smoothing
   * Handles 0/360 wraparound correctly
   */
  const smoothHeading = useCallback((newHeading) => {
    const buffer = bufferRef.current;
    buffer.push(newHeading);
    if (buffer.length > 5) buffer.shift();

    // Weighted moving average (recent values weigh more)
    let sinSum = 0, cosSum = 0;
    const weights = [1, 2, 3, 4, 5];
    buffer.forEach((h, i) => {
      const w = weights[i] || 1;
      sinSum += Math.sin((h * Math.PI) / 180) * w;
      cosSum += Math.cos((h * Math.PI) / 180) * w;
    });
    const avgAngle = ((Math.atan2(sinSum, cosSum) * 180) / Math.PI + 360) % 360;

    // Exponential smoothing on top
    if (previousHeadingRef.current === null) {
      previousHeadingRef.current = avgAngle;
      return avgAngle;
    }

    const alpha = 0.25;
    let diff = avgAngle - previousHeadingRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const smoothed = ((previousHeadingRef.current + alpha * diff) % 360 + 360) % 360;
    previousHeadingRef.current = smoothed;
    return smoothed;
  }, []);

  /**
   * Use requestAnimationFrame for smooth 60fps updates
   */
  const tick = useCallback(() => {
    if (latestRawRef.current !== null) {
      const smoothed = smoothHeading(latestRawRef.current);
      setState((prev) => ({
        ...prev,
        heading: smoothed,
        error: null,
      }));
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, [smoothHeading]);

  const handleOrientation = useCallback((event) => {
    let heading = null;

    if (event.webkitCompassHeading !== undefined) {
      heading = event.webkitCompassHeading;
    } else if (event.absolute && event.alpha !== null) {
      heading = 360 - event.alpha;
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    }

    if (heading !== null) {
      latestRawRef.current = ((heading % 360) + 360) % 360;
      setState((prev) => ({
        ...prev,
        isAbsolute: event.absolute ?? false,
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!checkSupport()) {
      setState((prev) => ({
        ...prev,
        error: "Device orientation is not supported on this device",
        isSupported: false,
        permissionState: "denied",
      }));
      return;
    }

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          setState((prev) => ({ ...prev, permissionState: "granted", error: null }));
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          setState((prev) => ({
            ...prev,
            permissionState: "denied",
            error: "Permission to access device orientation was denied",
          }));
        }
      } else {
        setState((prev) => ({ ...prev, permissionState: "granted" }));
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Error requesting device orientation permission: ${error}`,
        permissionState: "denied",
      }));
    }
  }, [checkSupport, handleOrientation]);

  useEffect(() => {
    const isSupported = checkSupport();

    setState((prev) => ({
      ...prev,
      isSupported,
      permissionState:
        typeof DeviceOrientationEvent.requestPermission === "function"
          ? "prompt"
          : "unknown",
    }));

    if (isSupported && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    // Start animation frame loop for smooth updates
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [checkSupport, handleOrientation, tick]);

  return {
    ...state,
    requestPermission,
  };
}

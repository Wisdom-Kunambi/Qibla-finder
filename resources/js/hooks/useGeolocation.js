import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Fetch approximate location from IP-based geolocation APIs
 * Used as fallback when device GPS/CoreLocation fails
 */
async function getLocationFromIP() {
  const apis = [
    {
      url: "https://ipapi.co/json/",
      parse: (d) => ({ lat: d.latitude, lng: d.longitude }),
    },
    {
      url: "https://ip-api.com/json/?fields=lat,lon",
      parse: (d) => ({ lat: d.lat, lng: d.lon }),
    },
  ];

  for (const api of apis) {
    try {
      const res = await fetch(api.url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      const loc = api.parse(data);
      if (loc.lat && loc.lng) return loc;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Create a position-like object from lat/lng
 */
function makePosition(lat, lng) {
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy: 5000,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
    isApproximate: true,
  };
}

/**
 * Custom hook for accessing browser geolocation
 * Features: retry with backoff, low-accuracy fallback, IP-based fallback
 */
export function useGeolocation() {
  const [state, setState] = useState({
    position: null,
    error: null,
    loading: false,
    source: null, // "gps" | "ip" | null
  });

  const watchIdRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const onSuccess = useCallback((position) => {
    if (!mountedRef.current) return;
    retryCountRef.current = 0;
    setState({
      position,
      error: null,
      loading: false,
      source: "gps",
    });
  }, []);

  /**
   * Try IP-based geolocation as last resort
   */
  const tryIPFallback = useCallback(async () => {
    if (!mountedRef.current) return;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    const loc = await getLocationFromIP();
    if (!mountedRef.current) return;

    if (loc) {
      setState({
        position: makePosition(loc.lat, loc.lng),
        error: null,
        loading: false,
        source: "ip",
      });
    } else {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: {
          code: 2,
          message:
            "Unable to determine your location. Please check your location settings and try again.",
        },
      }));
    }
  }, []);

  /**
   * Handle geolocation errors with retry strategy:
   * 1. First fail (high accuracy) → retry with low accuracy
   * 2. Second fail → retry with longer timeout + cached position
   * 3. Third fail → fall back to IP-based geolocation
   */
  const onError = useCallback(
    (error) => {
      if (!mountedRef.current) return;
      const attempt = retryCountRef.current;

      // Permission denied — don't retry, show error immediately
      if (error.code === 1) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: {
            code: 1,
            message:
              "Location permission denied. Please allow location access in your browser settings.",
          },
        }));
        return;
      }

      if (attempt === 0) {
        // Retry with low accuracy (WiFi/cell tower instead of GPS)
        retryCountRef.current = 1;
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        });
        return;
      }

      if (attempt === 1) {
        // One more try with longer timeout and accept cached position
        retryCountRef.current = 2;
        retryTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 300000,
          });
        }, 1000);
        return;
      }

      // All device attempts failed → try IP fallback
      retryCountRef.current = 3;
      tryIPFallback();
    },
    [onSuccess, tryIPFallback]
  );

  /**
   * Request geolocation permission and start tracking
   */
  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        position: null,
        error: {
          code: 0,
          message: "Geolocation is not supported by your browser",
        },
        loading: false,
        source: null,
      });
      return;
    }

    retryCountRef.current = 0;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Start with high accuracy
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Also start watching for continuous updates (silently)
    watchIdRef.current = navigator.geolocation.watchPosition(
      onSuccess,
      () => {},
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      }
    );
  }, [onSuccess, onError]);

  const refresh = useCallback(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    ...state,
    requestPermission,
    refresh,
  };
}

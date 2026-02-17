import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useCompass } from "../hooks/useCompass";
import { CompassRose } from "../Components/compass/CompassRose";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function SplashLoader({ visible }) {
  return (
    <div className={`splash-loader ${!visible ? "fade-out" : ""}`}>
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer spinning ring */}
        <svg className="splash-compass-ring" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" />
          <circle cx="50" cy="50" r="45" className="dash" />
        </svg>
        {/* Swinging needle inside */}
        <div className="absolute top-[10px]">
          <div className="splash-needle" />
        </div>
        {/* Center dot */}
        <div className="absolute w-3 h-3 rounded-full bg-white shadow-lg" />
      </div>
      <h2 className="splash-title text-white text-2xl font-bold tracking-wide mb-3">
        Qibla Finder
      </h2>
      <div className="splash-dots mt-2">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const [compassPermissionRequested, setCompassPermissionRequested] =
    useState(false);

  // Splash loader timing
  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashVisible(false), 1800);
    const removeTimer = setTimeout(() => setShowSplash(false), 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Get user's geolocation
  const { position, error: geoError, loading, source: locationSource, requestPermission } = useGeolocation();

  // Get compass data
  const {
    qiblaAngle,
    deviceHeading,
    qiblaDirection,
    distance,
    hasCompassData,
    isSupported: compassSupported,
    permissionState,
    requestOrientationPermission,
  } = useCompass(position);

  // Handle location permission request
  const handleLocationRequest = () => {
    requestPermission();
    toast.success("Requesting location access...");
  };

  // Handle compass permission request
  const handleCompassRequest = async () => {
    setCompassPermissionRequested(true);
    try {
      await requestOrientationPermission();
      toast.success("Compass activated!");
    } catch (error) {
      toast.error("Failed to activate compass");
    }
  };

  // Show compass permission button if needed (iOS 13+)
  const showCompassPermission =
    compassSupported &&
    permissionState === "prompt" &&
    !compassPermissionRequested &&
    position !== null;

  return (
    <>
      <Head title="Qibla Finder - Find Prayer Direction" />

      {showSplash && <SplashLoader visible={splashVisible} />}

      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#059669",
            color: "#fff",
          },
        }}
      />

      <div className={`min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 ${!showSplash ? 'page-enter' : ''}`}>
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Navigation className="w-8 h-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Qibla Finder</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center">
          {/* No Location - Show Request Button */}
          {!position && !loading && !geoError && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Find the Qibla
                </h2>
                <p className="text-xl text-white/90 max-w-md mx-auto">
                  Allow location access to calculate the direction to the Kaaba
                  in Mecca
                </p>
              </div>
              <button
                onClick={handleLocationRequest}
                className="px-8 py-4 bg-white text-emerald-600 rounded-full font-semibold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
              >
                Enable Location
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-xl text-white">Detecting your location...</p>
              <p className="text-sm text-white/60">This may take a few seconds</p>
            </div>
          )}

          {/* Location Error */}
          {geoError && !loading && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-red-500/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">Location Error</h2>
                <p className="text-lg text-white/90 max-w-md mx-auto">
                  {geoError.message}
                </p>
              </div>
              <button
                onClick={handleLocationRequest}
                className="px-6 py-3 bg-white text-emerald-600 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Show Compass Permission Button (iOS 13+) */}
          {showCompassPermission && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Navigation className="w-12 h-12 text-white animate-spin-slow" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">
                  Enable Compass
                </h2>
                <p className="text-lg text-white/90 max-w-md mx-auto">
                  To show the Qibla direction, we need access to your device's
                  compass
                </p>
              </div>
              <button
                onClick={handleCompassRequest}
                className="px-8 py-4 bg-white text-emerald-600 rounded-full font-semibold text-lg hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
              >
                Activate Compass
              </button>
            </div>
          )}

          {/* Compass View */}
          {position && qiblaDirection !== null && (permissionState !== "prompt" || !compassSupported) && (
            <div className="w-full">
              {/* Approximate location notice */}
              {locationSource === "ip" && (
                <div className="mb-6 mx-auto max-w-md bg-amber-500/20 backdrop-blur-md rounded-xl px-4 py-3 border border-amber-400/30 text-center">
                  <p className="text-sm text-white/90">
                    Using approximate location based on your IP address.
                    Direction may vary slightly.
                  </p>
                </div>
              )}

              {/* Static mode notice (desktop without compass sensor) */}
              {!hasCompassData && (
                <div className="mb-6 mx-auto max-w-md bg-blue-500/20 backdrop-blur-md rounded-xl px-4 py-3 border border-blue-400/30 text-center">
                  <p className="text-sm text-white/90">
                    Static compass mode - North is at the top. Use a physical compass or mobile device to align yourself.
                  </p>
                </div>
              )}

              <CompassRose
                deviceHeading={deviceHeading}
                qiblaAngle={qiblaAngle}
                size={450}
              />

              {/* Info Cards */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Distance Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">
                    Distance to Mecca
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {distance ? `${Math.round(distance).toLocaleString()} km` : "-"}
                  </p>
                </div>

                {/* Direction Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <h3 className="text-sm font-semibold text-white/80 mb-2">
                    Qibla Direction
                  </h3>
                  <p className="text-3xl font-bold text-white">
                    {qiblaDirection !== null
                      ? `${Math.round(qiblaDirection)}°`
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {hasCompassData ? "Tips for Accuracy" : "How to Use"}
                </h3>
                <ul className="space-y-2 text-white/80">
                  {hasCompassData ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-white mt-1">•</span>
                        <span>Hold your device flat (parallel to the ground)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white mt-1">•</span>
                        <span>
                          Keep away from magnetic objects (speakers, magnets)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white mt-1">•</span>
                        <span>
                          Calibrate by moving device in a figure-8 motion
                        </span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-white mt-1">•</span>
                        <span>
                          The compass shows the Qibla direction from your current location
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white mt-1">•</span>
                        <span>
                          North is at the top - the green needle points to Qibla
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-white mt-1">•</span>
                        <span>
                          Use a physical compass or phone to align yourself with the direction shown
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

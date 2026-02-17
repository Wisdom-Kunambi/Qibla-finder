import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Professional Qibla compass
 * Mobile: real-time rotation with device movement
 * Desktop: static compass showing Qibla bearing from North
 */
export function CompassRose({ deviceHeading, qiblaAngle, size = 450 }) {
  const controls = useAnimation();
  const [wasAligned, setWasAligned] = useState(false);
  const alignedTimerRef = useRef(null);

  // Static mode: no device orientation sensor (desktop/laptop)
  const staticMode = deviceHeading === null;

  // Aligned within ±5 degrees (only meaningful in real-time mode)
  const isAligned = useMemo(() => {
    if (qiblaAngle === null || staticMode) return false;
    return Math.abs(qiblaAngle) < 5;
  }, [qiblaAngle, staticMode]);

  // Near aligned (within ±15 degrees)
  const isNear = useMemo(() => {
    if (qiblaAngle === null || staticMode) return false;
    return Math.abs(qiblaAngle) < 15;
  }, [qiblaAngle, staticMode]);

  // Trigger celebration on alignment
  useEffect(() => {
    if (isAligned && !wasAligned) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.5, times: [0, 0.5, 1] },
      });
      if (navigator.vibrate) {
        navigator.vibrate([150, 80, 150]);
      }
      setWasAligned(true);
    }
    if (!isAligned) {
      if (alignedTimerRef.current) clearTimeout(alignedTimerRef.current);
      alignedTimerRef.current = setTimeout(() => setWasAligned(false), 500);
    }
    return () => {
      if (alignedTimerRef.current) clearTimeout(alignedTimerRef.current);
    };
  }, [isAligned, wasAligned, controls]);

  // Responsive sizing
  const responsiveSize =
    typeof window !== "undefined" && window.innerWidth < 640
      ? Math.min(size, window.innerWidth * 0.88)
      : size;

  const r = responsiveSize / 2;

  // Cardinal and intercardinal directions
  const directions = [
    { label: "N", angle: 0, primary: true },
    { label: "NE", angle: 45, primary: false },
    { label: "E", angle: 90, primary: true },
    { label: "SE", angle: 135, primary: false },
    { label: "S", angle: 180, primary: true },
    { label: "SW", angle: 225, primary: false },
    { label: "W", angle: 270, primary: true },
    { label: "NW", angle: 315, primary: false },
  ];

  // Tick marks every 5 degrees
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

  // Spring config for smooth real-time rotation
  const springConfig = {
    type: "spring",
    stiffness: 120,
    damping: 20,
    mass: 0.8,
    restDelta: 0.001,
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Compass Container */}
      <div
        className="relative"
        style={{ width: responsiveSize, height: responsiveSize }}
      >
        {/* Outer glow when aligned */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: isAligned
              ? [
                  "0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.2)",
                  "0 0 50px rgba(16,185,129,0.6), 0 0 100px rgba(16,185,129,0.3)",
                  "0 0 30px rgba(16,185,129,0.4), 0 0 60px rgba(16,185,129,0.2)",
                ]
              : "0 0 0px transparent",
          }}
          transition={isAligned ? { duration: 1.5, repeat: Infinity } : { duration: 0.5 }}
        />

        {/* Compass body */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ${
            isAligned
              ? "bg-gradient-to-br from-emerald-50 via-white to-teal-50"
              : "bg-gradient-to-br from-white via-gray-50 to-gray-100"
          } shadow-2xl`}
        >
          {/* Bezel ring */}
          <div
            className={`absolute inset-0 rounded-full border-[6px] transition-colors duration-700 ${
              isAligned
                ? "border-emerald-400/80"
                : "border-gray-300/80"
            } shadow-[inset_0_2px_15px_rgba(0,0,0,0.08)]`}
          />

          {/* Inner face */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-[inset_0_3px_15px_rgba(0,0,0,0.06)]">

            {/* ===== ROTATING DIAL (rotates with device in real-time mode, static on desktop) ===== */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ rotate: staticMode ? 0 : -deviceHeading }}
              transition={springConfig}
            >
              {/* Tick marks */}
              {ticks.map((angle) => {
                const isMajor = angle % 90 === 0;
                const isMid = angle % 30 === 0 && !isMajor;
                const isMinor = angle % 10 === 0 && !isMajor && !isMid;
                return (
                  <div
                    key={angle}
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{
                      height: "50%",
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    <div
                      className="mx-auto rounded-full"
                      style={{
                        width: isMajor ? 3 : isMid ? 2 : isMinor ? 1.5 : 1,
                        height: isMajor ? 14 : isMid ? 10 : isMinor ? 7 : 4,
                        background: isMajor
                          ? "linear-gradient(to bottom, #374151, #6b7280)"
                          : isMid
                          ? "linear-gradient(to bottom, #9ca3af, #d1d5db)"
                          : "#d1d5db",
                      }}
                    />
                  </div>
                );
              })}

              {/* Direction labels */}
              {directions.map(({ label, angle, primary }) => (
                <div
                  key={label}
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${
                      r * 0.72
                    }px) rotate(-${angle}deg)`,
                  }}
                >
                  <span
                    className={`font-bold drop-shadow-sm ${
                      primary
                        ? label === "N"
                          ? "text-red-500 text-xl"
                          : "text-gray-700 text-lg"
                        : "text-gray-400 text-xs"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}

              {/* ===== KAABA ICON on the dial ===== */}
              {qiblaAngle !== null && (
                <div
                  className="absolute"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${qiblaAngle}deg) translateY(-${
                      r * 0.55
                    }px) rotate(-${qiblaAngle}deg)`,
                  }}
                >
                  <motion.div
                    animate={isAligned ? controls : {}}
                    className="relative"
                  >
                    {/* Glow ring behind Kaaba */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        scale: isAligned ? [1, 1.4, 1] : isNear ? [1, 1.2, 1] : 1,
                        opacity: isAligned ? [0.8, 0.3, 0.8] : isNear ? [0.4, 0.1, 0.4] : 0,
                      }}
                      transition={{
                        duration: isAligned ? 1.2 : 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div
                        className={`w-16 h-16 rounded-full ${
                          isAligned
                            ? "bg-emerald-400/40"
                            : "bg-emerald-400/20"
                        }`}
                      />
                    </motion.div>

                    {/* Second glow ring (staggered) */}
                    {isAligned && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          scale: [1.2, 1.8, 1.2],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.4,
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-300/30" />
                      </motion.div>
                    )}

                    {/* Kaaba emoji */}
                    <div
                      className={`relative z-10 text-4xl leading-none transition-all duration-500 ${
                        isAligned
                          ? "drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]"
                          : isNear
                          ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "drop-shadow-md"
                      }`}
                    >
                      🕋
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* ===== FIXED POINTER (top triangle indicator) ===== */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-50">
              <div
                className={`w-0 h-0 transition-all duration-500`}
                style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderTop: `16px solid ${isAligned ? "#10b981" : "#ef4444"}`,
                  filter: isAligned
                    ? "drop-shadow(0 0 6px rgba(16,185,129,0.6))"
                    : "drop-shadow(0 2px 3px rgba(0,0,0,0.3))",
                }}
              />
            </div>

            {/* ===== CENTER PIVOT ===== */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 via-white to-gray-300 shadow-xl border-2 border-gray-300/60">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-lg" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-600/40" />
                <div className="absolute top-[38%] left-[38%] w-[24%] h-[24%] rounded-full bg-white/25" />
              </div>
            </div>

            {/* ===== NORTH NEEDLE (red/white diamond, rotates with dial in real-time mode) ===== */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
              animate={{ rotate: staticMode ? 0 : -deviceHeading }}
              transition={springConfig}
            >
              <svg
                width={responsiveSize * 0.75}
                height={responsiveSize * 0.75}
                viewBox="0 0 200 200"
              >
                <defs>
                  <linearGradient id="nL" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient id="nR" x1="100%" y1="0%" x2="0%" y2="50%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>
                  <linearGradient id="sL" x1="0%" y1="100%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="100%" stopColor="#d1d5db" />
                  </linearGradient>
                  <linearGradient id="sR" x1="100%" y1="100%" x2="0%" y2="50%">
                    <stop offset="0%" stopColor="#d1d5db" />
                    <stop offset="100%" stopColor="#9ca3af" />
                  </linearGradient>
                  <filter id="ns">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3" />
                  </filter>
                </defs>
                {/* North - left */}
                <path d="M 100 40 L 94 100 L 100 100 Z" fill="url(#nL)" filter="url(#ns)" />
                {/* North - right */}
                <path d="M 100 40 L 106 100 L 100 100 Z" fill="url(#nR)" filter="url(#ns)" />
                {/* South - left */}
                <path d="M 100 160 L 94 100 L 100 100 Z" fill="url(#sL)" filter="url(#ns)" />
                {/* South - right */}
                <path d="M 100 160 L 106 100 L 100 100 Z" fill="url(#sR)" filter="url(#ns)" />
                {/* Center spine highlight */}
                <line x1="100" y1="43" x2="100" y2="157" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
              </svg>
            </motion.div>

            {/* ===== QIBLA NEEDLE (emerald, points to Qibla relative to device) ===== */}
            {qiblaAngle !== null && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35"
                style={{ zIndex: 35 }}
                animate={{ rotate: qiblaAngle }}
                transition={{
                  type: "spring",
                  stiffness: 130,
                  damping: 18,
                  mass: 0.6,
                  restDelta: 0.001,
                }}
              >
                <svg
                  width={responsiveSize * 0.65}
                  height={responsiveSize * 0.65}
                  viewBox="0 0 200 200"
                >
                  <defs>
                    <linearGradient id="qL" x1="0%" y1="0%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor={isAligned ? "#34d399" : "#10b981"} />
                      <stop offset="100%" stopColor={isAligned ? "#059669" : "#047857"} />
                    </linearGradient>
                    <linearGradient id="qR" x1="100%" y1="0%" x2="0%" y2="50%">
                      <stop offset="0%" stopColor={isAligned ? "#10b981" : "#059669"} />
                      <stop offset="100%" stopColor={isAligned ? "#047857" : "#064e3b"} />
                    </linearGradient>
                    <filter id="qg">
                      <feGaussianBlur stdDeviation="3" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Qibla pointer - left face */}
                  <path
                    d="M 100 48 L 92 100 L 100 100 Z"
                    fill="url(#qL)"
                    filter={isAligned ? "url(#qg)" : "url(#ns)"}
                  />
                  {/* Qibla pointer - right face */}
                  <path
                    d="M 100 48 L 108 100 L 100 100 Z"
                    fill="url(#qR)"
                    filter={isAligned ? "url(#qg)" : "url(#ns)"}
                  />
                  {/* Short tail */}
                  <path d="M 100 125 L 96 100 L 100 100 Z" fill="url(#qL)" opacity="0.4" />
                  <path d="M 100 125 L 104 100 L 100 100 Z" fill="url(#qR)" opacity="0.4" />
                  {/* Spine */}
                  <line x1="100" y1="51" x2="100" y2="122" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
                </svg>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Direction feedback text ===== */}
      {qiblaAngle !== null && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3 px-4"
        >
          {staticMode ? (
            // Static mode: show absolute bearing from North
            <div className="space-y-2">
              <div className="text-4xl">🕋</div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                Qibla at {Math.round(qiblaAngle)}° from North
              </h3>
              <p className="text-base text-white/70">
                Face the direction shown on the compass
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-white/60 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>North</span>
                </div>
                <span className="text-white/30">|</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Qibla</span>
                </div>
              </div>
            </div>
          ) : (
            // Real-time mode: show turn instructions or aligned state
            <AnimatePresence mode="wait">
              {isAligned ? (
                <motion.div
                  key="aligned"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-5xl"
                  >
                    🕋
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Facing the Kaaba
                  </h2>
                  <p className="text-base text-white/80 font-medium">
                    You are aligned — you can start praying
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="turning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    Turn {Math.abs(Math.round(qiblaAngle))}°{" "}
                    {qiblaAngle > 0 ? "right" : "left"}
                  </h3>
                  <p className="text-base text-white/70">to face the Kaaba</p>
                  <div className="flex items-center justify-center gap-3 text-sm text-white/60 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span>North</span>
                    </div>
                    <span className="text-white/30">|</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Qibla</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  );
}

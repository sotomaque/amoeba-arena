"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TimerProps {
  startTime: number | null;
  duration: number;
  pausedTimeRemaining?: number | null;
  isPaused?: boolean;
  onExpire?: () => void;
}

export function Timer({ startTime, duration, pausedTimeRemaining, isPaused, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasExpired, setHasExpired] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isPaused && pausedTimeRemaining !== null && pausedTimeRemaining !== undefined) {
      setTimeLeft(pausedTimeRemaining);
      return;
    }

    if (!startTime) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0 && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, onExpire, hasExpired, isPaused, pausedTimeRemaining]);

  const progress = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  // Animation helpers
  const criticalPulse = shouldReduceMotion
    ? {}
    : isCritical && !isPaused
      ? { animate: { scale: [1, 1.02, 1] }, transition: { duration: 0.5, repeat: Infinity } }
      : {};

  const pausePulse = shouldReduceMotion
    ? {}
    : { animate: { scale: [1, 1.2, 1] }, transition: { duration: 1, repeat: Infinity } };

  const clockSpin = shouldReduceMotion
    ? {}
    : { animate: { rotate: [0, 360] }, transition: { duration: 4, repeat: Infinity, ease: "linear" } };

  const timePulse = shouldReduceMotion
    ? {}
    : isLow && !isPaused
      ? { animate: { scale: [1, 1.1, 1] }, transition: { duration: 0.5, repeat: Infinity } }
      : {};

  const progressBarAnimation = shouldReduceMotion
    ? { style: { width: `${progress}%` } }
    : { initial: { width: "100%" }, animate: { width: `${progress}%` }, transition: { duration: 0.3 } };

  const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <motion.div
      className={`ghibli-card p-4 ${isPaused ? "ring-2 ring-sunset ring-offset-2" : ""}`}
      {...criticalPulse}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {isPaused ? (
            <>
              <motion.span {...pausePulse}>
                ⏸️
              </motion.span>
              <span className="text-sunset font-medium">PAUSED</span>
            </>
          ) : (
            <>
              <motion.span {...clockSpin}>
                ⏰
              </motion.span>
              Time Remaining
            </>
          )}
        </span>
        <motion.span
          className={`text-3xl font-bold font-mono ${
            isPaused
              ? "text-sunset"
              : isCritical
                ? "text-destructive"
                : isLow
                  ? "text-sunset"
                  : "text-forest"
          }`}
          {...timePulse}
        >
          {timeLeft}s
        </motion.span>
      </div>

      <div
        className="w-full bg-muted rounded-full h-4 overflow-hidden"
        role="progressbar"
        aria-valuenow={timeLeft}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-label={`${timeLeft} seconds remaining`}
      >
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${
            isPaused
              ? "bg-gradient-to-r from-sunset to-yellow-400"
              : isCritical
                ? "bg-gradient-to-r from-destructive to-red-400"
                : isLow
                  ? "bg-gradient-to-r from-sunset to-yellow-400"
                  : "bg-gradient-to-r from-forest to-meadow"
          }`}
          {...progressBarAnimation}
        />
      </div>

      {isPaused && (
        <motion.p
          className="text-center text-sm mt-2 text-sunset font-medium"
          {...fadeIn}
        >
          ⏸️ Host has paused the game
        </motion.p>
      )}

      {isLow && !isPaused && (
        <motion.p
          className="text-center text-sm mt-2 text-muted-foreground"
          {...fadeIn}
        >
          {isCritical ? "⚡ Hurry up!" : "🍃 Time is running out..."}
        </motion.p>
      )}
    </motion.div>
  );
}

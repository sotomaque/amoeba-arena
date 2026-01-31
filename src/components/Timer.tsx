"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Hoisted animation configs - avoids recreation on every render
const ANIMATIONS = {
  criticalPulse: {
    animate: { scale: [1, 1.02, 1] },
    transition: { duration: 0.5, repeat: Infinity },
  },
  pausePulse: {
    animate: { scale: [1, 1.2, 1] },
    transition: { duration: 1, repeat: Infinity },
  },
  clockSpin: {
    animate: { rotate: [0, 360] },
    transition: { duration: 4, repeat: Infinity, ease: "linear" as const },
  },
  timePulse: {
    animate: { scale: [1, 1.1, 1] },
    transition: { duration: 0.5, repeat: Infinity },
  },
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 } },
} as const;

const REDUCED_MOTION_EMPTY = {} as const;

interface TimerProps {
  startTime: number | null;
  duration: number;
  pausedTimeRemaining?: number | null;
  isPaused?: boolean;
  onExpire?: () => void;
}

export function Timer({ startTime, duration, pausedTimeRemaining, isPaused, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const hasExpiredRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  // Reset expired state when round changes
  useEffect(() => {
    hasExpiredRef.current = false;
  }, [startTime]);

  // Timer effect - handles all time updates
  useEffect(() => {
    // If paused, use the paused time
    if (isPaused && pausedTimeRemaining !== null && pausedTimeRemaining !== undefined) {
      setTimeLeft(pausedTimeRemaining);
      return;
    }

    // If no start time, use full duration
    if (!startTime) {
      setTimeLeft(duration);
      return;
    }

    // Calculate and set initial time, then start interval
    const calculateRemaining = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      return Math.max(0, duration - elapsed);
    };

    // Set initial value
    setTimeLeft(calculateRemaining());

    // Start interval for updates
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, duration, isPaused, pausedTimeRemaining]);

  const progress = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  // Animation helpers - use hoisted configs to avoid recreation
  const criticalPulse = shouldReduceMotion || !isCritical || isPaused
    ? REDUCED_MOTION_EMPTY
    : ANIMATIONS.criticalPulse;

  const pausePulse = shouldReduceMotion
    ? REDUCED_MOTION_EMPTY
    : ANIMATIONS.pausePulse;

  const clockSpin = shouldReduceMotion
    ? REDUCED_MOTION_EMPTY
    : ANIMATIONS.clockSpin;

  const timePulse = shouldReduceMotion || !isLow || isPaused
    ? REDUCED_MOTION_EMPTY
    : ANIMATIONS.timePulse;

  const progressBarAnimation = shouldReduceMotion
    ? { style: { width: `${progress}%` } }
    : { initial: { width: "100%" }, animate: { width: `${progress}%` }, transition: { duration: 0.3 } };

  const fadeIn = ANIMATIONS.fadeIn;

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

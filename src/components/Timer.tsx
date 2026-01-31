"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  startTime: number;
  duration: number;
  onExpire?: () => void;
}

export function Timer({ startTime, duration, onExpire }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
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
  }, [startTime, duration, onExpire, hasExpired]);

  const progress = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <motion.div
      className="ghibli-card p-4"
      animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            ⏰
          </motion.span>
          Time Remaining
        </span>
        <motion.span
          className={`text-3xl font-bold font-mono ${
            isCritical
              ? "text-destructive"
              : isLow
                ? "text-sunset"
                : "text-forest"
          }`}
          animate={isLow ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isLow ? Infinity : 0 }}
        >
          {timeLeft}s
        </motion.span>
      </div>

      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${
            isCritical
              ? "bg-gradient-to-r from-destructive to-red-400"
              : isLow
                ? "bg-gradient-to-r from-sunset to-yellow-400"
                : "bg-gradient-to-r from-forest to-meadow"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {isLow && (
        <motion.p
          className="text-center text-sm mt-2 text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isCritical ? "⚡ Hurry up!" : "🍃 Time is running out..."}
        </motion.p>
      )}
    </motion.div>
  );
}

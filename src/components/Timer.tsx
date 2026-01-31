"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface TimerProps {
  startTime: number;
  duration: number; // in seconds
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

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Time Remaining</span>
        <span
          className={`text-2xl font-bold ${isLow ? "text-red-500 animate-pulse" : ""}`}
        >
          {timeLeft}s
        </span>
      </div>
      <Progress
        value={progress}
        className={`h-3 ${isLow ? "[&>div]:bg-red-500" : ""}`}
      />
    </div>
  );
}

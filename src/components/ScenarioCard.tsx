"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Scenario } from "@/lib/types";

interface ScenarioCardProps {
  scenario: Scenario;
  roundNumber: number;
  totalRounds: number;
}

const scenarioIcons: Record<number, string> = {
  1: "☀️", // Sunlit Shallows
  2: "🏜️", // Drought
  3: "🌊", // Algae Bloom
  4: "🦠", // Bacterial Invasion
  5: "🌡️", // Temperature Spike
  6: "💨", // Flowing Current
  7: "🧪", // Chemical Runoff
  8: "⚔️", // Competitor Colony
  9: "🤝", // Symbiotic Opportunity
  10: "🍂", // Seasonal Change
  11: "💨", // Oxygen Levels
  12: "🧬", // Mutation Event
  13: "🪲", // New Food Source
  14: "⚗️", // pH Shift
  15: "⛈️", // Perfect Storm
};

export function ScenarioCard({ scenario, roundNumber, totalRounds }: ScenarioCardProps) {
  const icon = scenarioIcons[scenario.id] || "🌿";
  const shouldReduceMotion = useReducedMotion();

  const fadeInUp = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  const iconFloat = shouldReduceMotion
    ? {}
    : { animate: { y: [0, -5, 0], rotate: [0, 5, -5, 0] }, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } };

  const dotPulse = (isActive: boolean) => shouldReduceMotion
    ? {}
    : isActive
      ? { initial: { scale: 0 }, animate: { scale: [1, 1.3, 1] }, transition: { duration: 1, repeat: Infinity } }
      : {};

  const fadeIn = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 } };

  const decorFloat = (delay: number) => shouldReduceMotion
    ? {}
    : { animate: { y: [0, -3, 0] }, transition: { duration: 2, repeat: Infinity, delay } };

  return (
    <motion.div
      className="ghibli-card overflow-hidden"
      {...fadeInUp}
    >
      {/* Header with round info */}
      <div className="bg-gradient-to-r from-forest/10 to-pond/10 px-6 py-4 border-b border-border/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              {...iconFloat}
            >
              {icon}
            </motion.span>
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Round {roundNumber} of {totalRounds}
              </span>
              <h2 className="text-2xl font-bold gradient-text-nature">
                {scenario.title}
              </h2>
            </div>
          </div>

          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1" role="progressbar" aria-valuenow={roundNumber} aria-valuemin={1} aria-valuemax={totalRounds} aria-label={`Round ${roundNumber} of ${totalRounds}`}>
            {Array.from({ length: totalRounds }, (_, i) => (
              <motion.div
                key={`round-dot-${i + 1}`}
                className={`size-2 rounded-full ${
                  i < roundNumber
                    ? "bg-forest"
                    : i === roundNumber - 1
                      ? "bg-forest"
                      : "bg-muted"
                }`}
                {...dotPulse(i === roundNumber - 1)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scenario description */}
      <div className="p-6">
        <motion.p
          className="text-lg text-muted-foreground leading-relaxed"
          {...fadeIn}
        >
          {scenario.description}
        </motion.p>

        {/* Decorative elements */}
        <div className="flex justify-center mt-6 gap-2">
          <motion.span
            className="text-xl opacity-30"
            {...decorFloat(0)}
          >
            🌿
          </motion.span>
          <motion.span
            className="text-xl opacity-30"
            {...decorFloat(0.3)}
          >
            💧
          </motion.span>
          <motion.span
            className="text-xl opacity-30"
            {...decorFloat(0.6)}
          >
            🌿
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

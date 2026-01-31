"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeInDown = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: "easeOut" } };

  const blobPulse = shouldReduceMotion
    ? {}
    : { animate: { scale: [1, 1.05, 1] }, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } };

  return (
    <motion.div
      className="text-center mb-12 relative z-10"
      {...fadeInDown}
    >
      {/* Amoeba decoration */}
      <motion.div
        className="mx-auto mb-6 w-24 h-24 amoeba-blob flex items-center justify-center text-4xl"
        {...blobPulse}
      >
        🦠
      </motion.div>

      <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text-nature tracking-tight">
        Amoeba Arena
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
        A whimsical multiplayer journey through
        <br />
        <span className="text-forest font-medium">population dynamics</span>,{" "}
        <span className="text-pond font-medium">risk</span>, and{" "}
        <span className="text-sunset font-medium">survival</span>
      </p>
    </motion.div>
  );
}

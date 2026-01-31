"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HomeDecorations() {
  const shouldReduceMotion = useReducedMotion();

  const floatAnimation = (duration: number, delay: number = 0, rotate: boolean = false) =>
    shouldReduceMotion
      ? {}
      : {
          animate: rotate
            ? { y: [0, -15, 0], rotate: [0, 5, 0] }
            : { y: [0, -15, 0] },
          transition: { duration, repeat: Infinity, ease: "easeInOut", delay },
        };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute top-20 left-10 text-6xl opacity-20"
        {...floatAnimation(6, 0, true)}
      >
        🌿
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 text-5xl opacity-20"
        {...floatAnimation(7, 1, true)}
      >
        🍃
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-20 text-4xl opacity-20"
        {...floatAnimation(5, 2)}
      >
        🌱
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-5xl opacity-20"
        {...floatAnimation(8, 0.5, true)}
      >
        🌸
      </motion.div>
      <motion.div
        className="absolute top-1/3 left-1/4 text-3xl opacity-15"
        {...floatAnimation(4, 3)}
      >
        💧
      </motion.div>
    </div>
  );
}

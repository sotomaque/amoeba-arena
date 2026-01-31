"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CreateGameForm } from "@/components/CreateGameForm";
import { JoinGameForm } from "@/components/JoinGameForm";

export function HomeContent() {
  const shouldReduceMotion = useReducedMotion();

  const fadeInUp = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } };

  const fadeIn = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, delay: 0.4 } };

  return (
    <>
      <motion.div
        className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl relative z-10"
        {...fadeInUp}
      >
        <div className="flex-1">
          <CreateGameForm />
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border lg:h-12 lg:w-px lg:bg-gradient-to-b" />
            <span className="text-muted-foreground font-medium text-lg">or</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-border lg:h-12 lg:w-px lg:bg-gradient-to-t" />
          </div>
        </div>
        <div className="flex-1">
          <JoinGameForm />
        </div>
      </motion.div>

      <motion.div
        className="mt-16 text-center max-w-xl relative z-10"
        {...fadeIn}
      >
        <div className="ghibli-card p-6">
          <h3 className="font-semibold text-lg mb-3 text-forest flex items-center justify-center gap-2">
            <span>🌿</span> How to Play <span>🌿</span>
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Create a game to get a magical code, then share it with your class.
            Each round presents an environmental challenge — make wise choices
            to help your amoeba colony thrive in the pond!
          </p>
        </div>
      </motion.div>
    </>
  );
}

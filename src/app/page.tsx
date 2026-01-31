"use client";

import { motion } from "framer-motion";
import { CreateGameForm } from "@/components/CreateGameForm";
import { JoinGameForm } from "@/components/JoinGameForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 ghibli-bg relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 text-6xl opacity-20"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          🌿
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-5xl opacity-20"
          animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          🍃
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-20 text-4xl opacity-20"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          🌱
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-5xl opacity-20"
          animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🌸
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-1/4 text-3xl opacity-15"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          💧
        </motion.div>
      </div>

      {/* Main content */}
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Amoeba decoration */}
        <motion.div
          className="mx-auto mb-6 w-24 h-24 amoeba-blob flex items-center justify-center text-4xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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

      <motion.div
        className="flex flex-col lg:flex-row gap-8 w-full max-w-4xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
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
    </main>
  );
}

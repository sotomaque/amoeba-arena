"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { Leaderboard } from "./Leaderboard";
import { getLeaderboard } from "@/lib/gameLogic";

interface FinalResultsProps {
  gameState: GameState;
  playerId: string;
}

export function FinalResults({ gameState, playerId }: FinalResultsProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const leaderboard = getLeaderboard(gameState.players);
  const winner = leaderboard[0];
  const playerRank = leaderboard.findIndex((l) => l.player.id === playerId) + 1;
  const isWinner = playerId === winner?.player.id;

  const fireConfetti = useCallback(() => {
    // Skip confetti if user prefers reduced motion
    if (shouldReduceMotion) return;

    // Nature-themed confetti colors
    const colors = ["#4a7c59", "#87b5c9", "#a8c686", "#e8a87c", "#6b9b7a"];

    // Fire confetti from both sides
    const fireFromSide = (originX: number) => {
      confetti({
        particleCount: 50,
        angle: originX < 0.5 ? 60 : 120,
        spread: 55,
        origin: { x: originX, y: 0.7 },
        colors,
        shapes: ["circle", "square"],
        gravity: 0.8,
        scalar: 1.2,
        drift: originX < 0.5 ? 1 : -1,
      });
    };

    // Initial burst
    fireFromSide(0.1);
    fireFromSide(0.9);

    // Delayed bursts
    setTimeout(() => {
      fireFromSide(0.2);
      fireFromSide(0.8);
    }, 250);

    setTimeout(() => {
      fireFromSide(0.15);
      fireFromSide(0.85);
    }, 500);

    // Center celebration
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        colors,
        shapes: ["circle"],
        gravity: 0.6,
        scalar: 1.5,
      });
    }, 750);

    // Continuous gentle confetti
    const interval = setInterval(() => {
      confetti({
        particleCount: 10,
        angle: 60 + Math.random() * 60,
        spread: 45,
        origin: { x: Math.random(), y: -0.1 },
        colors,
        shapes: ["circle"],
        gravity: 1.2,
        scalar: 0.8,
        drift: Math.random() * 2 - 1,
      });
    }, 400);

    // Stop continuous confetti after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
  }, [shouldReduceMotion]);

  useEffect(() => {
    // Fire confetti when component mounts
    const timer = setTimeout(fireConfetti, 500);
    return () => clearTimeout(timer);
  }, [fireConfetti]);

  const handlePlayAgain = () => {
    router.push("/");
  };

  const handleFireMoreConfetti = () => {
    fireConfetti();
  };

  // Animation helpers
  const fadeInScale = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, type: "spring" } };

  const floatingElements = (index: number) => shouldReduceMotion
    ? {}
    : {
        animate: { y: [0, -30, 0], opacity: [0.3, 0.7, 0.3], rotate: [0, 10, -10, 0] },
        transition: { duration: 3 + index * 0.5, repeat: Infinity, delay: index * 0.3 },
      };

  const slideUp = (delay: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { y: 20 }, animate: { y: 0 }, transition: { delay } };

  const trophyAnimation = shouldReduceMotion
    ? {}
    : { animate: { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }, transition: { duration: 2, repeat: Infinity } };

  const fadeIn = (delay: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } };

  const fadeInUp = (delay: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay } };

  const hoverScale = shouldReduceMotion
    ? {}
    : { whileHover: { scale: 1.02 } };

  const pulseAnimation = shouldReduceMotion
    ? {}
    : { animate: { scale: [1, 1.2, 1] }, transition: { duration: 2, repeat: Infinity } };

  const confettiButtonHover = shouldReduceMotion
    ? {}
    : { whileHover: { rotate: [0, -10, 10, 0] }, transition: { duration: 0.3 } };

  const statFloat = (index: number) => shouldReduceMotion
    ? {}
    : { animate: { y: [0, -3, 0] }, transition: { duration: 2, repeat: Infinity, delay: index * 0.2 } };

  const decorFloat = (index: number) => shouldReduceMotion
    ? {}
    : { animate: { y: [0, -5, 0] }, transition: { duration: 2, repeat: Infinity, delay: index * 0.2 } };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Winner Announcement */}
      <motion.div
        className="ghibli-card p-8 text-center overflow-hidden relative"
        {...fadeInScale}
      >
        {/* Floating celebration elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {["🌸", "🍃", "✨", "🌿", "💫", "🌊", "🦠", "🌱"].map((emoji, i) => (
            <motion.span
              key={`celebration-${emoji}`}
              className="absolute text-2xl"
              style={{
                left: `${10 + i * 12}%`,
                top: "20%",
              }}
              {...floatingElements(i)}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        <motion.div className="relative z-10" {...slideUp(0.2)}>
          <motion.div className="text-8xl mb-6" {...trophyAnimation}>
            🏆
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold gradient-text-nature mb-2"
            {...fadeIn(0.3)}
          >
            Game Complete!
          </motion.h1>

          {winner && (
            <motion.div {...fadeInUp(0.4)}>
              <p className="text-xl text-muted-foreground mb-4">
                The pond has a new champion!
              </p>
              <motion.div
                className="inline-block px-8 py-4 bg-gradient-to-r from-forest/10 to-meadow/10 rounded-2xl border-2 border-forest/30"
                {...hoverScale}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-forest mb-2">
                  {winner.player.name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground">
                  <motion.span {...pulseAnimation}>
                    🦠
                  </motion.span>
                  <span className="font-bold text-forest font-mono">
                    {winner.player.population.toLocaleString()}
                  </span>
                  <span>amoebas</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Confetti button */}
          <motion.button
            type="button"
            onClick={handleFireMoreConfetti}
            className="mt-4 text-2xl hover:scale-110 transition-transform"
            {...confettiButtonHover}
            aria-label="Fire more confetti"
          >
            🎉
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Player's Final Rank (if not winner) */}
      {playerRank > 0 && !isWinner && (
        <motion.div className="ghibli-card p-6 text-center" {...fadeInUp(0.5)}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">
              {playerRank === 2 ? "🥈" : playerRank === 3 ? "🥉" : "🌟"}
            </span>
            <p className="text-xl">
              You finished in <span className="font-bold text-forest">#{playerRank}</span> place!
            </p>
          </div>
          <p className="text-muted-foreground mt-2">
            {playerRank <= 3 ? "Great job! You made it to the podium!" : "Keep practicing those survival skills!"}
          </p>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div {...fadeInUp(0.6)}>
        <Leaderboard players={gameState.players} currentPlayerId={playerId} />
      </motion.div>

      {/* Game Statistics */}
      <motion.div className="ghibli-card p-6" {...fadeInUp(0.7)}>
        <h2 className="font-semibold mb-6 flex items-center gap-2 text-lg">
          <span>📊</span> Game Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Rounds Played", value: gameState.totalRounds, icon: "🎯" },
            { label: "Total Players", value: gameState.players.filter(p => !p.isHost).length, icon: "👥" },
            { label: "Survivors", value: gameState.players.filter(p => !p.isEliminated && !p.isHost).length, icon: "🌿" },
            { label: "Highest Population", value: Math.max(...gameState.players.map(p => p.population)).toLocaleString(), icon: "📈" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 bg-muted/50 rounded-xl"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? undefined : { delay: 0.8 + index * 0.1 }}
            >
              <motion.div className="text-2xl mb-2" {...statFloat(index)}>
                {stat.icon}
              </motion.div>
              <div className="text-2xl font-bold text-forest">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Play Again Button */}
      <motion.div className="text-center" {...fadeInUp(0.9)}>
        <Button
          onClick={handlePlayAgain}
          className="h-14 px-12 text-xl font-semibold rounded-2xl ghibli-button bg-forest hover:bg-forest-dark"
        >
          <span className="flex items-center gap-3">
            <span>🌱</span> Play Again <span>🌱</span>
          </span>
        </Button>
      </motion.div>

      {/* Footer decoration */}
      <motion.div
        className="flex justify-center gap-4 pt-8 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={shouldReduceMotion ? undefined : { delay: 1 }}
        aria-hidden="true"
      >
        {["🌿", "🌸", "🦠", "💧", "🍃"].map((emoji, index) => (
          <motion.span
            key={`footer-${emoji}`}
            className="text-2xl"
            {...decorFloat(index)}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

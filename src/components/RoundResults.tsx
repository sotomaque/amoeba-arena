"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { Leaderboard } from "./Leaderboard";
import { trpc } from "@/lib/trpc";
import { getScenarioById } from "@/lib/scenarios";

interface RoundResultsProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onGameUpdate: (state: GameState) => void;
}

export function RoundResults({
  gameState,
  playerId,
  isHost,
  onGameUpdate,
}: RoundResultsProps) {
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const nextRound = trpc.game.nextRound.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const lastResult = gameState.roundResults[gameState.roundResults.length - 1];
  const scenario = lastResult ? getScenarioById(lastResult.scenarioId) : null;
  const playerResult = lastResult?.players.find((p) => p.playerId === playerId);
  const isLastRound = gameState.currentRound >= gameState.totalRounds;

  const handleNext = () => {
    setError(null);
    nextRound.mutate({ code: gameState.code, hostId: playerId });
  };

  // Animation helpers
  const fadeInScale = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } };

  const floatAnimation = shouldReduceMotion
    ? {}
    : { animate: { y: [0, -10, 0], rotate: [0, 5, -5, 0] }, transition: { duration: 3, repeat: Infinity } };

  const fadeInUp = (delay: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay } };

  const popIn = (delay: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay, type: "spring" } };

  const resultEmoji = (survived: boolean) => shouldReduceMotion
    ? { initial: { scale: 0 }, animate: { scale: 1 } }
    : {
        initial: { scale: 0 },
        animate: { scale: 1, rotate: survived ? [0, 10, -10, 0] : [0, -5, 5, 0] },
        transition: { duration: 0.5, type: "spring" },
      };

  const fadeIn = (delay: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } };

  const arrowBounce = shouldReduceMotion
    ? {}
    : { animate: { x: [0, 5, 0] }, transition: { duration: 1, repeat: Infinity } };

  const slideInLeft = (index: number) => shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.5 + index * 0.05 } };

  const pulseAnimation = shouldReduceMotion
    ? {}
    : { animate: { opacity: [1, 0.5, 1] }, transition: { duration: 1, repeat: Infinity } };

  const spinAnimation = shouldReduceMotion
    ? {}
    : { animate: { rotate: [0, 360] }, transition: { duration: 8, repeat: Infinity, ease: "linear" } };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-center"
        >
          {error}
        </div>
      )}

      {/* Round Results Header */}
      <motion.div
        className="ghibli-card p-6 text-center"
        {...fadeInScale}
      >
        <motion.div
          className="text-5xl mb-4"
          {...floatAnimation}
        >
          🌊
        </motion.div>
        <h1 className="text-3xl font-bold gradient-text-nature mb-2">
          Round {gameState.currentRound} Complete
        </h1>
        {scenario && (
          <p className="text-muted-foreground text-lg">{scenario.title}</p>
        )}
      </motion.div>

      {/* Player's Result */}
      {playerResult && !isHost && (
        <motion.div
          className={`ghibli-card p-8 text-center ${
            playerResult.survived
              ? "bg-gradient-to-br from-forest/5 to-meadow/10"
              : "bg-gradient-to-br from-destructive/5 to-sunset/10"
          }`}
          {...fadeInUp(0.2)}
        >
          <motion.div
            className="text-6xl mb-4"
            {...resultEmoji(playerResult.survived)}
          >
            {playerResult.survived ? "🌸" : "🥀"}
          </motion.div>

          <div className="mb-4">
            <span className="text-sm text-muted-foreground">You chose</span>
            <motion.div
              className={`inline-block mx-2 px-4 py-1 rounded-full text-sm font-medium ${
                playerResult.choice === "safe"
                  ? "bg-forest/20 text-forest"
                  : "bg-sunset/20 text-sunset"
              }`}
              {...popIn(0.3)}
            >
              {playerResult.choice === "safe" ? "🌿 SAFE" : "🔥 RISKY"}
            </motion.div>
          </div>

          <motion.h2
            className={`text-4xl font-bold mb-4 ${
              playerResult.survived ? "text-forest" : "text-destructive"
            }`}
            {...fadeIn(0.4)}
          >
            {playerResult.survived ? "Success!" : "Oh no!"}
          </motion.h2>

          <motion.div
            className="flex items-center justify-center gap-4 text-2xl"
            {...fadeIn(0.5)}
          >
            <span className="font-mono">{playerResult.populationBefore.toLocaleString()}</span>
            <motion.span {...arrowBounce}>
              →
            </motion.span>
            <span className={`font-bold font-mono ${
              playerResult.survived ? "text-forest" : "text-destructive"
            }`}>
              {playerResult.populationAfter.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              ({playerResult.survived ? `×${playerResult.multiplier}` : "×0.5"})
            </span>
          </motion.div>
        </motion.div>
      )}

      {/* Science Fact */}
      {scenario && (
        <motion.div
          className="ghibli-card p-6"
          {...fadeInUp(0.3)}
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-pond">
            <span>🔬</span> Science Fact
          </h2>
          <p className="text-muted-foreground leading-relaxed">{scenario.explanation}</p>
        </motion.div>
      )}

      {/* Round Breakdown */}
      <motion.div
        className="ghibli-card p-6"
        {...fadeInUp(0.4)}
      >
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span>📊</span> Round Breakdown
        </h2>
        <div className="space-y-2">
          {lastResult?.players.map((result, index) => (
            <motion.div
              key={result.playerId}
              className={`flex justify-between items-center p-3 rounded-xl text-sm ${
                result.survived
                  ? "bg-forest/5 border border-forest/20"
                  : "bg-destructive/5 border border-destructive/20"
              }`}
              {...slideInLeft(index)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{result.survived ? "✨" : "💫"}</span>
                <span className="font-medium">{result.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  result.choice === "safe"
                    ? "bg-forest/10 text-forest"
                    : "bg-sunset/10 text-sunset"
                }`}>
                  {result.choice}
                </span>
              </div>
              <span className="font-mono">
                {result.populationBefore.toLocaleString()} → {result.populationAfter.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div {...fadeInUp(0.5)}>
        <Leaderboard players={gameState.players} currentPlayerId={playerId} compact />
      </motion.div>

      {/* Next Button */}
      {isHost ? (
        <motion.div {...fadeInUp(0.6)}>
          <Button
            onClick={handleNext}
            disabled={nextRound.isPending}
            className="w-full h-14 text-xl font-semibold rounded-2xl ghibli-button bg-forest hover:bg-forest-dark"
          >
            {nextRound.isPending ? (
              <motion.span {...pulseAnimation}>
                Loading...
              </motion.span>
            ) : isLastRound ? (
              <span className="flex items-center gap-2">
                <span>🏆</span> Show Final Results <span>🏆</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🌸</span> Next Round ({gameState.currentRound + 1}/{gameState.totalRounds}) <span>🌸</span>
              </span>
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          className="ghibli-card p-6 text-center"
          {...fadeInUp(0.6)}
        >
          <motion.div
            {...spinAnimation}
            className="text-3xl mb-3"
          >
            🍃
          </motion.div>
          <p className="text-muted-foreground">Waiting for the host to continue...</p>
        </motion.div>
      )}
    </div>
  );
}

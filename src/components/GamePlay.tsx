"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { ScenarioCard } from "./ScenarioCard";
import { Timer } from "./Timer";
import { Leaderboard } from "./Leaderboard";
import { trpc } from "@/lib/trpc";

interface GamePlayProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onGameUpdate: (state: GameState) => void;
}

export function GamePlay({ gameState, playerId, isHost, onGameUpdate }: GamePlayProps) {
  const [selectedChoice, setSelectedChoice] = useState<"safe" | "risky" | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const scenario = gameState.currentScenario;
  const isPaused = gameState.phase === "paused";

  const makeChoice = trpc.game.choose.useMutation({
    onSuccess: (data) => {
      setHasSubmitted(true);
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const endRound = trpc.game.endRound.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const pauseRound = trpc.game.pause.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const resumeRound = trpc.game.resume.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleChoice = (choice: "safe" | "risky") => {
    setSelectedChoice(choice);
  };

  const handleSubmit = () => {
    if (!selectedChoice) return;
    makeChoice.mutate({
      code: gameState.code,
      playerId,
      choice: selectedChoice,
    });
  };

  const handleEndRound = useCallback(() => {
    if (isHost && !isPaused) {
      endRound.mutate({ code: gameState.code, hostId: playerId });
    }
  }, [isHost, isPaused, gameState.code, playerId, endRound]);

  const handlePause = () => {
    pauseRound.mutate({ code: gameState.code, hostId: playerId });
  };

  const handleResume = () => {
    resumeRound.mutate({ code: gameState.code, hostId: playerId });
  };

  const playersChosen = gameState.players.filter(
    (p) => !p.isHost && !p.isEliminated && p.hasChosen
  ).length;
  const totalActivePlayers = gameState.players.filter(
    (p) => !p.isHost && !p.isEliminated
  ).length;

  if (!scenario) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🌀
        </motion.div>
      </div>
    );
  }

  const isEliminated = currentPlayer?.isEliminated;
  const alreadyChosen = currentPlayer?.hasChosen || hasSubmitted;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Timer
          startTime={gameState.roundStartTime}
          duration={gameState.roundDuration}
          pausedTimeRemaining={gameState.pausedTimeRemaining}
          isPaused={isPaused}
          onExpire={handleEndRound}
        />
      </motion.div>

      {/* Scenario */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ScenarioCard
          scenario={scenario}
          roundNumber={gameState.currentRound}
          totalRounds={gameState.totalRounds}
        />
      </motion.div>

      {/* Paused Overlay for Players */}
      {isPaused && !isHost && (
        <motion.div
          className="ghibli-card p-6 text-center bg-sunset/10 border-sunset/30"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-4xl mb-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⏸️
          </motion.div>
          <h3 className="text-xl font-semibold text-sunset mb-2">Game Paused</h3>
          <p className="text-muted-foreground">
            The host has paused the game. Please wait for them to resume.
          </p>
        </motion.div>
      )}

      {/* Player Population */}
      {currentPlayer && !isHost && (
        <motion.div
          className="ghibli-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.span
                className="text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦠
              </motion.span>
              <span className="text-lg text-muted-foreground">Your Colony:</span>
            </div>
            <motion.span
              className="text-4xl font-bold text-forest"
              key={currentPlayer.population}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {currentPlayer.population.toLocaleString()}
            </motion.span>
          </div>
          {isEliminated && (
            <motion.div
              className="mt-4 p-3 bg-destructive/10 rounded-xl text-center text-destructive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Your colony has perished! 🥀
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Choice Buttons */}
      {!isHost && !isEliminated && !isPaused && (
        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {/* Safe Choice */}
            <motion.button
              className={`p-6 rounded-2xl text-left transition-all choice-safe ${
                selectedChoice === "safe" ? "selected" : ""
              } ${alreadyChosen ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => !alreadyChosen && handleChoice("safe")}
              disabled={alreadyChosen}
              whileHover={!alreadyChosen ? { y: -4 } : {}}
              whileTap={!alreadyChosen ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="text-3xl"
                  animate={selectedChoice === "safe" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  🌿
                </motion.span>
                <span className="text-xl font-semibold text-forest">SAFE</span>
              </div>
              <p className="text-muted-foreground mb-4">{scenario.choices.safe.label}</p>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-forest/10 text-forest rounded-full">
                  Risk: {Math.round(scenario.choices.safe.risk * 100)}%
                </span>
                <span className="px-3 py-1 bg-meadow/20 text-forest-dark rounded-full">
                  Reward: ×{scenario.choices.safe.multiplier}
                </span>
              </div>
            </motion.button>

            {/* Risky Choice */}
            <motion.button
              className={`p-6 rounded-2xl text-left transition-all choice-risky ${
                selectedChoice === "risky" ? "selected" : ""
              } ${alreadyChosen ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => !alreadyChosen && handleChoice("risky")}
              disabled={alreadyChosen}
              whileHover={!alreadyChosen ? { y: -4 } : {}}
              whileTap={!alreadyChosen ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  className="text-3xl"
                  animate={selectedChoice === "risky" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  🔥
                </motion.span>
                <span className="text-xl font-semibold text-sunset">RISKY</span>
              </div>
              <p className="text-muted-foreground mb-4">{scenario.choices.risky.label}</p>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-sunset/10 text-sunset rounded-full">
                  Risk: {Math.round(scenario.choices.risky.risk * 100)}%
                </span>
                <span className="px-3 py-1 bg-sunset/20 text-orange-700 dark:text-orange-300 rounded-full">
                  Reward: ×{scenario.choices.risky.multiplier}
                </span>
              </div>
            </motion.button>
          </AnimatePresence>
        </div>
      )}

      {/* Submit Button */}
      {!isHost && !isEliminated && !alreadyChosen && selectedChoice && !isPaused && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={makeChoice.isPending}
            className="w-full h-14 text-xl font-semibold rounded-2xl ghibli-button bg-forest hover:bg-forest-dark"
          >
            {makeChoice.isPending ? (
              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                Submitting...
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <span>✨</span> Lock In Choice <span>✨</span>
              </span>
            )}
          </Button>
        </motion.div>
      )}

      {/* Waiting State */}
      {!isHost && alreadyChosen && !isPaused && (
        <motion.div
          className="ghibli-card p-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="text-4xl mb-3"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <p className="text-lg text-forest font-medium">Choice submitted!</p>
          <p className="text-muted-foreground">Waiting for other players...</p>
        </motion.div>
      )}

      {/* Host View */}
      {isHost && (
        <motion.div
          className="ghibli-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold flex items-center gap-2">
              <span>📊</span> Players answered:
            </span>
            <span className="text-2xl font-bold text-forest">
              {playersChosen} / {totalActivePlayers}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-forest to-meadow rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(playersChosen / totalActivePlayers) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Host Control Buttons */}
          <div className="flex gap-3">
            {isPaused ? (
              <Button
                onClick={handleResume}
                disabled={resumeRound.isPending}
                className="flex-1 h-12 rounded-xl ghibli-button bg-forest hover:bg-forest-dark"
              >
                {resumeRound.isPending ? "Resuming..." : "▶️ Resume Round"}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                disabled={pauseRound.isPending}
                className="flex-1 h-12 rounded-xl ghibli-button bg-sunset hover:bg-sunset/90"
              >
                {pauseRound.isPending ? "Pausing..." : "⏸️ Pause Round"}
              </Button>
            )}
            <Button
              onClick={() => endRound.mutate({ code: gameState.code, hostId: playerId })}
              disabled={endRound.isPending}
              className="flex-1 h-12 rounded-xl ghibli-button bg-pond hover:bg-pond/90"
            >
              {endRound.isPending ? "Processing..." : "⏭️ End Round Now"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {isPaused
              ? "Game is paused. Players can still make choices."
              : "Players who haven't chosen will default to SAFE"}
          </p>
        </motion.div>
      )}

      {/* Mini Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Leaderboard players={gameState.players} currentPlayerId={playerId} compact />
      </motion.div>
    </div>
  );
}

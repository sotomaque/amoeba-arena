"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useGameState } from "@/hooks/useGameState";
import { Lobby } from "@/components/Lobby";
import { GamePlay } from "@/components/GamePlay";
import { RoundResults } from "@/components/RoundResults";
import { FinalResults } from "@/components/FinalResults";
import type { GameState } from "@/lib/types";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const [playerInfo, setPlayerInfo] = useState<{
    playerId: string;
    isHost: boolean;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`game_${code}`);
    if (stored) {
      setPlayerInfo(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [code, router]);

  const { data: initialState, isLoading, error } = trpc.game.getState.useQuery(
    { code },
    {
      enabled: !!playerInfo,
      refetchInterval: 2000,
    }
  );

  const { gameState, setGameState } = useGameState(code, initialState);

  useEffect(() => {
    if (initialState && !gameState) {
      setGameState(initialState);
    }
  }, [initialState, gameState, setGameState]);

  const handleGameUpdate = (newState: GameState) => {
    setGameState(newState);
  };

  // Loading states with Ghibli styling
  if (!playerInfo || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ghibli-bg">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌊
          </motion.div>
          <p className="text-lg text-muted-foreground">
            {!playerInfo ? "Preparing the pond..." : "Loading game..."}
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-6 ghibli-bg p-4">
        <motion.div
          className="ghibli-card p-8 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-4">🥀</div>
          <h2 className="text-xl font-semibold mb-2">Oops!</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <motion.button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-forest text-white rounded-xl font-medium ghibli-button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Pond
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentState = gameState || initialState;

  if (!currentState) {
    return (
      <div className="min-h-screen flex items-center justify-center ghibli-bg">
        <motion.div
          className="ghibli-card p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg text-muted-foreground">Game not found</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 ghibli-bg relative overflow-hidden">
      {/* Floating background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute top-10 left-5 text-4xl opacity-15"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          🌿
        </motion.div>
        <motion.div
          className="absolute top-1/4 right-10 text-3xl opacity-15"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
        >
          🍃
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-10 text-3xl opacity-15"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
        >
          💧
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-5 text-4xl opacity-15"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 0.5 }}
        >
          🌸
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {currentState.phase === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Lobby
              gameState={currentState}
              playerId={playerInfo.playerId}
              isHost={playerInfo.isHost}
              onGameUpdate={handleGameUpdate}
            />
          </motion.div>
        )}

        {(currentState.phase === "playing" || currentState.phase === "paused") && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GamePlay
              gameState={currentState}
              playerId={playerInfo.playerId}
              isHost={playerInfo.isHost}
              onGameUpdate={handleGameUpdate}
            />
          </motion.div>
        )}

        {currentState.phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RoundResults
              gameState={currentState}
              playerId={playerInfo.playerId}
              isHost={playerInfo.isHost}
              onGameUpdate={handleGameUpdate}
            />
          </motion.div>
        )}

        {currentState.phase === "finished" && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FinalResults
              gameState={currentState}
              playerId={playerInfo.playerId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

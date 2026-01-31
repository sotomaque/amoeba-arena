"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/types";
import { trpc } from "@/lib/trpc";

interface LobbyProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onGameUpdate: (state: GameState) => void;
}

export function Lobby({ gameState, playerId, isHost, onGameUpdate }: LobbyProps) {
  const startGame = trpc.game.start.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleStart = () => {
    startGame.mutate({ code: gameState.code, hostId: playerId });
  };

  const players = gameState.players.filter((p) => !p.isHost);
  const canStart = players.length >= 1;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Game Code Card */}
      <motion.div
        className="ghibli-card p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-5xl mb-4"
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌊
        </motion.div>
        <h1 className="text-3xl font-bold gradient-text-nature mb-2">Welcome to the Pond</h1>
        <p className="text-muted-foreground mb-6">Share this code with your class</p>

        <motion.div
          className="relative inline-block"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-6xl md:text-7xl font-bold tracking-[0.2em] text-forest bg-forest/5 py-6 px-8 rounded-2xl border-2 border-forest/20 font-mono">
            {gameState.code}
          </div>
          <motion.div
            className="absolute -top-2 -right-2 text-2xl"
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🍃
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Players List */}
      <motion.div
        className="ghibli-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <span>🦠</span> Amoebas in the Pond
            <span className="text-sm font-normal text-muted-foreground">
              ({players.length} {players.length === 1 ? "player" : "players"})
            </span>
          </h3>
          {players.length === 0 && (
            <motion.span
              className="text-sm text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Waiting for players...
            </motion.span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[100px]">
          <AnimatePresence mode="popLayout">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative"
              >
                <motion.div
                  className="p-4 bg-meadow/10 rounded-xl text-center border-2 border-meadow/20"
                  whileHover={{ y: -2, borderColor: "rgba(168, 198, 134, 0.5)" }}
                >
                  <motion.div
                    className="text-2xl mb-1"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    🦠
                  </motion.div>
                  <span className="font-medium text-sm">{player.name}</span>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {players.length === 0 && (
            <div className="col-span-full flex items-center justify-center">
              <motion.div
                className="text-center text-muted-foreground"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-4xl mb-2">🌿</div>
                <p>The pond is quiet...</p>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Start Button / Waiting Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isHost ? (
          <Button
            onClick={handleStart}
            disabled={!canStart || startGame.isPending}
            className="w-full h-16 text-xl font-semibold rounded-2xl ghibli-button bg-forest hover:bg-forest-dark disabled:opacity-50"
          >
            {startGame.isPending ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Starting adventure...
              </motion.span>
            ) : canStart ? (
              <span className="flex items-center gap-3">
                <span>🌸</span> Begin the Adventure <span>🌸</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>⏳</span> Waiting for players to join...
              </span>
            )}
          </Button>
        ) : (
          <div className="ghibli-card p-6 text-center">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-3xl mb-3"
            >
              🌀
            </motion.div>
            <p className="text-lg text-muted-foreground">
              Waiting for the host to start the game...
            </p>
          </div>
        )}
      </motion.div>

      {/* How to Play */}
      <motion.div
        className="ghibli-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-forest">
          <span>📖</span> How to Play
        </h3>
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="text-lg">🌿</span>
            <span>Each round presents an environmental scenario affecting your pond</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">⚖️</span>
            <span>Choose between <span className="text-forest font-medium">SAFE</span> (low risk, modest growth) or <span className="text-sunset font-medium">RISKY</span> (high risk, big rewards)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">📈</span>
            <span>Watch your amoeba population grow or shrink based on your choices</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-lg">🏆</span>
            <span>The player with the largest colony at the end wins!</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

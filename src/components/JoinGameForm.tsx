"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function JoinGameForm() {
  const [code, setCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const joinGame = trpc.game.join.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem(
        `game_${data.gameState.code}`,
        JSON.stringify({ playerId: data.playerId, isHost: false })
      );
      router.push(`/game/${data.gameState.code}`);
    },
    onError: (err) => {
      setError(err.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim() || !playerName.trim()) return;
    setIsLoading(true);
    joinGame.mutate({ code: code.trim().toUpperCase(), playerName: playerName.trim() });
  };

  const motionProps = shouldReduceMotion
    ? {}
    : { whileHover: { y: -4 }, transition: { duration: 0.2 } };

  const floatAnimation = shouldReduceMotion
    ? {}
    : { animate: { y: [0, -5, 0] }, transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } };

  const pulseAnimation = shouldReduceMotion
    ? {}
    : { animate: { opacity: [1, 0.5, 1] }, transition: { duration: 1, repeat: Infinity } };

  return (
    <motion.div
      className="ghibli-card p-6 w-full"
      {...motionProps}
    >
      <div className="text-center mb-6">
        <motion.div
          className="text-4xl mb-2"
          {...floatAnimation}
        >
          🦠
        </motion.div>
        <h2 className="text-xl font-semibold text-pond">Join Game</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter an existing pond</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-center"
          >
            {error}
          </div>
        )}
        <div>
          <label htmlFor="game-code" className="sr-only">
            Game code
          </label>
          <Input
            id="game-code"
            type="text"
            placeholder="Game code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="h-12 text-center text-2xl tracking-[0.3em] font-mono border-2 border-pond/20 focus:border-pond rounded-xl bg-background/50"
            disabled={isLoading}
            aria-describedby={error ? "join-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="player-name" className="sr-only">
            Your name
          </label>
          <Input
            id="player-name"
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            disabled={isLoading}
            className="h-12 text-center text-lg border-2 border-pond/20 focus:border-pond rounded-xl bg-background/50"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-medium rounded-xl ghibli-button bg-pond hover:bg-pond/90"
          disabled={isLoading || !code.trim() || !playerName.trim()}
        >
          {isLoading ? (
            <motion.span {...pulseAnimation}>
              Joining pond...
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🌿</span> Join Game
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

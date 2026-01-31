"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function JoinGameForm() {
  const [code, setCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const joinGame = trpc.game.join.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem(
        `game_${data.gameState.code}`,
        JSON.stringify({ playerId: data.playerId, isHost: false })
      );
      router.push(`/game/${data.gameState.code}`);
    },
    onError: (error) => {
      alert(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !playerName.trim()) return;
    setIsLoading(true);
    joinGame.mutate({ code: code.trim().toUpperCase(), playerName: playerName.trim() });
  };

  return (
    <motion.div
      className="ghibli-card p-6 w-full"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center mb-6">
        <motion.div
          className="text-4xl mb-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          🦠
        </motion.div>
        <h2 className="text-xl font-semibold text-pond">Join Game</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter an existing pond</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Game code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="h-12 text-center text-2xl tracking-[0.3em] font-mono border-2 border-pond/20 focus:border-pond rounded-xl bg-background/50"
            disabled={isLoading}
          />
        </div>
        <div>
          <Input
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
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
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

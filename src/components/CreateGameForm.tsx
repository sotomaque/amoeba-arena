"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function CreateGameForm() {
  const [hostName, setHostName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createGame = trpc.game.create.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem(
        `game_${data.code}`,
        JSON.stringify({ playerId: data.hostId, isHost: true })
      );
      router.push(`/game/${data.code}`);
    },
    onError: (error) => {
      alert(error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) return;
    setIsLoading(true);
    createGame.mutate({ hostName: hostName.trim() });
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
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🏡
        </motion.div>
        <h2 className="text-xl font-semibold text-forest">Create New Game</h2>
        <p className="text-sm text-muted-foreground mt-1">Start a new pond adventure</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Your name (as host)"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            maxLength={20}
            disabled={isLoading}
            className="h-12 text-center text-lg border-2 border-forest/20 focus:border-forest rounded-xl bg-background/50"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-12 text-lg font-medium rounded-xl ghibli-button bg-forest hover:bg-forest-dark"
          disabled={isLoading || !hostName.trim()}
        >
          {isLoading ? (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Creating pond...
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🌊</span> Create Game
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

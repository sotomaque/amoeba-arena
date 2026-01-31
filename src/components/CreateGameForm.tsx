"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const ROUND_OPTIONS = [
  { value: 5, label: "Quick (5 rounds)" },
  { value: 10, label: "Standard (10 rounds)" },
  { value: 15, label: "Extended (15 rounds)" },
];

export function CreateGameForm() {
  const [hostName, setHostName] = useState("");
  const [totalRounds, setTotalRounds] = useState(10);
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
    createGame.mutate({ hostName: hostName.trim(), totalRounds });
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

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2 text-center">
            Number of Rounds
          </label>
          <div className="flex gap-2">
            {ROUND_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => setTotalRounds(option.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  totalRounds === option.value
                    ? "bg-forest/10 border-forest text-forest"
                    : "border-muted hover:border-forest/30 text-muted-foreground"
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {option.value}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            {ROUND_OPTIONS.find((o) => o.value === totalRounds)?.label}
          </p>
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

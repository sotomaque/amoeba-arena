"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const createGame = trpc.game.create.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem(
        `game_${data.code}`,
        JSON.stringify({ playerId: data.hostId, isHost: true, secretToken: data.secretToken })
      );
      router.push(`/game/${data.code}`);
    },
    onError: (err) => {
      setError(err.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hostName.trim()) return;
    setIsLoading(true);
    createGame.mutate({ hostName: hostName.trim(), totalRounds });
  };

  const motionProps = shouldReduceMotion
    ? {}
    : { whileHover: { y: -4 }, transition: { duration: 0.2 } };

  const rotateAnimation = shouldReduceMotion
    ? {}
    : { animate: { rotate: [0, 10, -10, 0] }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } };

  const buttonMotionProps = shouldReduceMotion
    ? {}
    : { whileHover: { y: -1 }, whileTap: { scale: 0.98 } };

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
          {...rotateAnimation}
        >
          🏡
        </motion.div>
        <h2 className="text-xl font-semibold text-forest">Create New Game</h2>
        <p className="text-sm text-muted-foreground mt-1">Start a new pond adventure</p>
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
          <label htmlFor="host-name" className="sr-only">
            Your name (as host)
          </label>
          <Input
            id="host-name"
            type="text"
            placeholder="Your name (as host)"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            maxLength={20}
            disabled={isLoading}
            className="h-12 text-center text-lg border-2 border-forest/20 focus:border-forest rounded-xl bg-background/50"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-muted-foreground mb-2 text-center">
            Number of Rounds
          </legend>
          <div className="flex gap-2" role="radiogroup" aria-label="Number of rounds">
            {ROUND_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={totalRounds === option.value}
                onClick={() => setTotalRounds(option.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border-2 ${
                  totalRounds === option.value
                    ? "bg-forest/10 border-forest text-forest"
                    : "border-muted hover:border-forest/30 text-muted-foreground"
                }`}
                {...buttonMotionProps}
                disabled={isLoading}
              >
                {option.value}
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            {ROUND_OPTIONS.find((o) => o.value === totalRounds)?.label}
          </p>
        </fieldset>

        <Button
          type="submit"
          className="w-full h-12 text-lg font-medium rounded-xl ghibli-button bg-forest hover:bg-forest-dark"
          disabled={isLoading || !hostName.trim()}
        >
          {isLoading ? (
            <motion.span {...pulseAnimation}>
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

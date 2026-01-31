"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function JoinGameForm() {
  const [code, setCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const joinGame = trpc.game.join.useMutation({
    onSuccess: (data) => {
      // Store player info in sessionStorage
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Join Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Game code (e.g., ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-lg tracking-widest"
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
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !code.trim() || !playerName.trim()}
          >
            {isLoading ? "Joining..." : "Join Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

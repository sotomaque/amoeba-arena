"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function CreateGameForm() {
  const [hostName, setHostName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const createGame = trpc.game.create.useMutation({
    onSuccess: (data) => {
      // Store host info in sessionStorage
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Create New Game</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Your name (as host)"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              maxLength={20}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !hostName.trim()}>
            {isLoading ? "Creating..." : "Create Game"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

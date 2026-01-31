"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Game Lobby</CardTitle>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Share this code:</p>
            <div className="text-5xl font-bold tracking-[0.3em] text-primary bg-muted py-4 rounded-lg">
              {gameState.code}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Players ({players.length})</h3>
              <Badge variant="outline">Waiting for players...</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="p-3 bg-muted rounded-lg text-center"
                >
                  <span className="font-medium">{player.name}</span>
                </div>
              ))}
              {players.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  Waiting for players to join...
                </div>
              )}
            </div>

            {isHost && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleStart}
                  disabled={!canStart || startGame.isPending}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {startGame.isPending
                    ? "Starting..."
                    : canStart
                      ? "Start Game"
                      : "Need at least 1 player"}
                </Button>
              </div>
            )}

            {!isHost && (
              <div className="text-center text-muted-foreground pt-4 border-t">
                Waiting for the host to start the game...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How to Play:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Each round presents an environmental scenario</li>
            <li>Choose between a SAFE option (low risk, low reward) or RISKY option (high risk, high reward)</li>
            <li>Your amoeba population will grow or shrink based on your choices</li>
            <li>The player with the largest population at the end wins!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

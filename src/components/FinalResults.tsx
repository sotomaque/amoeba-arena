"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { GameState } from "@/lib/types";
import { Leaderboard } from "./Leaderboard";
import { getLeaderboard } from "@/lib/gameLogic";

interface FinalResultsProps {
  gameState: GameState;
  playerId: string;
}

export function FinalResults({ gameState, playerId }: FinalResultsProps) {
  const leaderboard = getLeaderboard(gameState.players);
  const winner = leaderboard[0];
  const playerRank = leaderboard.findIndex((l) => l.player.id === playerId) + 1;

  const handlePlayAgain = () => {
    window.location.href = "/";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-4xl">Game Over!</CardTitle>
        </CardHeader>
        <CardContent>
          {winner && (
            <div className="py-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-2">{winner.player.name} Wins!</h2>
              <p className="text-xl text-muted-foreground">
                Final population:{" "}
                <span className="font-bold text-primary">
                  {winner.player.population.toLocaleString()}
                </span>{" "}
                amoebas
              </p>
            </div>
          )}

          {playerRank > 0 && playerId !== winner?.player.id && (
            <div className="p-4 bg-muted rounded-lg mb-6">
              <p className="text-lg">
                You finished in <span className="font-bold">#{playerRank}</span> place!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Leaderboard players={gameState.players} currentPlayerId={playerId} />

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Game Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{gameState.totalRounds}</div>
              <div className="text-sm text-muted-foreground">Rounds Played</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{gameState.players.length}</div>
              <div className="text-sm text-muted-foreground">Total Players</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {gameState.players.filter((p) => !p.isEliminated && !p.isHost).length}
              </div>
              <div className="text-sm text-muted-foreground">Survivors</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {Math.max(...gameState.players.map((p) => p.population)).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Highest Population</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={handlePlayAgain} size="lg" className="text-lg px-8">
          Play Again
        </Button>
      </div>
    </div>
  );
}

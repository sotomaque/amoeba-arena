"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameState, RoundResult } from "@/lib/types";
import { Leaderboard } from "./Leaderboard";
import { trpc } from "@/lib/trpc";
import { getScenarioById } from "@/lib/scenarios";

interface RoundResultsProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onGameUpdate: (state: GameState) => void;
}

export function RoundResults({
  gameState,
  playerId,
  isHost,
  onGameUpdate,
}: RoundResultsProps) {
  const nextRound = trpc.game.nextRound.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const lastResult = gameState.roundResults[gameState.roundResults.length - 1];
  const scenario = lastResult ? getScenarioById(lastResult.scenarioId) : null;
  const playerResult = lastResult?.players.find((p) => p.playerId === playerId);
  const isLastRound = gameState.currentRound >= gameState.totalRounds;

  const handleNext = () => {
    nextRound.mutate({ code: gameState.code, hostId: playerId });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Round {gameState.currentRound} Results</CardTitle>
          {scenario && (
            <p className="text-muted-foreground">{scenario.title}</p>
          )}
        </CardHeader>
        <CardContent>
          {playerResult && !isHost && (
            <div
              className={`p-6 rounded-lg text-center mb-6 ${
                playerResult.survived
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <div className="text-lg font-medium mb-2">
                You chose: <Badge>{playerResult.choice === "safe" ? "SAFE" : "RISKY"}</Badge>
              </div>
              <div className="text-3xl font-bold mb-2">
                {playerResult.survived ? "✓ Success!" : "✗ Failed!"}
              </div>
              <div className="text-lg">
                {playerResult.populationBefore.toLocaleString()} →{" "}
                <span className="font-bold">
                  {playerResult.populationAfter.toLocaleString()}
                </span>{" "}
                amoebas
                <span className="text-sm text-muted-foreground ml-2">
                  ({playerResult.survived ? `×${playerResult.multiplier}` : "×0.5"})
                </span>
              </div>
            </div>
          )}

          {scenario && (
            <div className="p-4 bg-muted rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Science Fact:</h4>
              <p className="text-sm text-muted-foreground">{scenario.explanation}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3">Round Breakdown</h4>
              <div className="space-y-2">
                {lastResult?.players.map((result) => (
                  <div
                    key={result.playerId}
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      result.survived ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <span>
                      {result.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {result.choice}
                      </Badge>
                    </span>
                    <span className="font-mono">
                      {result.populationBefore} → {result.populationAfter}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Leaderboard players={gameState.players} currentPlayerId={playerId} compact />
          </div>

          {isHost && (
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={handleNext}
                disabled={nextRound.isPending}
                className="w-full text-lg py-6"
                size="lg"
              >
                {nextRound.isPending
                  ? "Loading..."
                  : isLastRound
                    ? "Show Final Results"
                    : `Next Round (${gameState.currentRound + 1}/${gameState.totalRounds})`}
              </Button>
            </div>
          )}

          {!isHost && (
            <div className="text-center text-muted-foreground mt-6 pt-4 border-t">
              Waiting for the host to continue...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

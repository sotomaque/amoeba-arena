"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameState } from "@/lib/types";
import { ScenarioCard } from "./ScenarioCard";
import { Timer } from "./Timer";
import { Leaderboard } from "./Leaderboard";
import { trpc } from "@/lib/trpc";

interface GamePlayProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onGameUpdate: (state: GameState) => void;
}

export function GamePlay({ gameState, playerId, isHost, onGameUpdate }: GamePlayProps) {
  const [selectedChoice, setSelectedChoice] = useState<"safe" | "risky" | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const scenario = gameState.currentScenario;

  const makeChoice = trpc.game.choose.useMutation({
    onSuccess: (data) => {
      setHasSubmitted(true);
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const endRound = trpc.game.endRound.useMutation({
    onSuccess: (data) => {
      onGameUpdate(data);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleChoice = (choice: "safe" | "risky") => {
    setSelectedChoice(choice);
  };

  const handleSubmit = () => {
    if (!selectedChoice) return;
    makeChoice.mutate({
      code: gameState.code,
      playerId,
      choice: selectedChoice,
    });
  };

  const handleEndRound = useCallback(() => {
    if (isHost) {
      endRound.mutate({ code: gameState.code, hostId: playerId });
    }
  }, [isHost, gameState.code, playerId, endRound]);

  const playersChosen = gameState.players.filter(
    (p) => !p.isHost && !p.isEliminated && p.hasChosen
  ).length;
  const totalActivePlayers = gameState.players.filter(
    (p) => !p.isHost && !p.isEliminated
  ).length;

  if (!scenario) {
    return <div>Loading scenario...</div>;
  }

  const isEliminated = currentPlayer?.isEliminated;
  const alreadyChosen = currentPlayer?.hasChosen || hasSubmitted;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Timer */}
      {gameState.roundStartTime && (
        <Timer
          startTime={gameState.roundStartTime}
          duration={gameState.roundDuration}
          onExpire={handleEndRound}
        />
      )}

      {/* Scenario */}
      <ScenarioCard
        scenario={scenario}
        roundNumber={gameState.currentRound}
        totalRounds={gameState.totalRounds}
      />

      {/* Player Population */}
      {currentPlayer && !isHost && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg">Your Population:</span>
              <span className="text-3xl font-bold text-primary">
                {currentPlayer.population.toLocaleString()}
              </span>
            </div>
            {isEliminated && (
              <Badge variant="destructive" className="mt-2">
                You&apos;ve been eliminated!
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Choice Buttons */}
      {!isHost && !isEliminated && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card
            className={`cursor-pointer transition-all ${
              selectedChoice === "safe"
                ? "ring-4 ring-green-500"
                : "hover:shadow-lg"
            } ${alreadyChosen ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => !alreadyChosen && handleChoice("safe")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="secondary" className="mb-3 bg-green-100 text-green-800">
                  SAFE
                </Badge>
                <p className="text-lg mb-3">{scenario.choices.safe.label}</p>
                <div className="text-sm text-muted-foreground">
                  <span className="block">Risk: {Math.round(scenario.choices.safe.risk * 100)}%</span>
                  <span className="block">
                    Reward: ×{scenario.choices.safe.multiplier}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              selectedChoice === "risky"
                ? "ring-4 ring-red-500"
                : "hover:shadow-lg"
            } ${alreadyChosen ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => !alreadyChosen && handleChoice("risky")}
          >
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="secondary" className="mb-3 bg-red-100 text-red-800">
                  RISKY
                </Badge>
                <p className="text-lg mb-3">{scenario.choices.risky.label}</p>
                <div className="text-sm text-muted-foreground">
                  <span className="block">
                    Risk: {Math.round(scenario.choices.risky.risk * 100)}%
                  </span>
                  <span className="block">
                    Reward: ×{scenario.choices.risky.multiplier}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Button */}
      {!isHost && !isEliminated && !alreadyChosen && selectedChoice && (
        <Button
          onClick={handleSubmit}
          disabled={makeChoice.isPending}
          className="w-full text-lg py-6"
          size="lg"
        >
          {makeChoice.isPending ? "Submitting..." : "Lock In Choice"}
        </Button>
      )}

      {/* Waiting State */}
      {!isHost && alreadyChosen && (
        <div className="text-center p-6 bg-muted rounded-lg">
          <span className="text-lg">✓ Choice submitted! Waiting for other players...</span>
        </div>
      )}

      {/* Host View */}
      {isHost && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Players answered:</span>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {playersChosen} / {totalActivePlayers}
              </Badge>
            </div>
            <Button
              onClick={handleEndRound}
              disabled={endRound.isPending}
              className="w-full"
              size="lg"
            >
              {endRound.isPending ? "Processing..." : "End Round Now"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Players who haven&apos;t chosen will default to SAFE
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mini Leaderboard */}
      <Leaderboard players={gameState.players} currentPlayerId={playerId} compact />
    </div>
  );
}

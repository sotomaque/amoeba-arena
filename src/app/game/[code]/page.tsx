"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useGameState } from "@/hooks/useGameState";
import { Lobby } from "@/components/Lobby";
import { GamePlay } from "@/components/GamePlay";
import { RoundResults } from "@/components/RoundResults";
import { FinalResults } from "@/components/FinalResults";
import type { GameState } from "@/lib/types";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const [playerInfo, setPlayerInfo] = useState<{
    playerId: string;
    isHost: boolean;
  } | null>(null);

  // Get player info from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(`game_${code}`);
    if (stored) {
      setPlayerInfo(JSON.parse(stored));
    } else {
      // Redirect to home if no player info
      router.push("/");
    }
  }, [code, router]);

  // Fetch initial game state
  const { data: initialState, isLoading, error } = trpc.game.getState.useQuery(
    { code },
    {
      enabled: !!playerInfo,
      refetchInterval: 2000, // Poll every 2 seconds as fallback
    }
  );

  // Real-time WebSocket updates
  const { gameState, setGameState } = useGameState(code, initialState);

  // Sync initial state
  useEffect(() => {
    if (initialState && !gameState) {
      setGameState(initialState);
    }
  }, [initialState, gameState, setGameState]);

  const handleGameUpdate = (newState: GameState) => {
    setGameState(newState);
  };

  if (!playerInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500">Error: {error.message}</p>
        <button
          onClick={() => router.push("/")}
          className="text-primary underline"
        >
          Return Home
        </button>
      </div>
    );
  }

  const currentState = gameState || initialState;

  if (!currentState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Game not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      {currentState.phase === "lobby" && (
        <Lobby
          gameState={currentState}
          playerId={playerInfo.playerId}
          isHost={playerInfo.isHost}
          onGameUpdate={handleGameUpdate}
        />
      )}

      {currentState.phase === "playing" && (
        <GamePlay
          gameState={currentState}
          playerId={playerInfo.playerId}
          isHost={playerInfo.isHost}
          onGameUpdate={handleGameUpdate}
        />
      )}

      {currentState.phase === "results" && (
        <RoundResults
          gameState={currentState}
          playerId={playerInfo.playerId}
          isHost={playerInfo.isHost}
          onGameUpdate={handleGameUpdate}
        />
      )}

      {currentState.phase === "finished" && (
        <FinalResults
          gameState={currentState}
          playerId={playerInfo.playerId}
        />
      )}
    </main>
  );
}

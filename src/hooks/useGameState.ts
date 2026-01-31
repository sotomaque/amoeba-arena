"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { GameState } from "@/lib/types";
import { getScenarioById } from "@/lib/scenarios";
import { ROUND_DURATION } from "@/lib/gameLogic";

export function useGameState(code: string, initialState?: GameState) {
  const [gameState, setGameState] = useState<GameState | null>(
    initialState || null
  );
  const [isConnected, setIsConnected] = useState(false);
  const supabaseRef = useRef(createClient());

  const fetchGameState = useCallback(async () => {
    if (!code) return;

    const supabase = supabaseRef.current;

    try {
      // Parallelize game and player fetches - they're independent
      const [gameResult, playersResult] = await Promise.all([
        supabase.from("games").select("*").eq("code", code).single(),
        supabase.from("players").select("*").eq("game_code", code).order("created_at", { ascending: true }),
      ]);

      const gameRow = gameResult.data;
      const playerRows = playersResult.data;

      if (!gameRow || !playerRows) return;

      const players = playerRows.map((p) => ({
        id: p.id,
        name: p.name,
        population: p.population,
        isHost: p.is_host,
        hasChosen: p.has_chosen,
        isEliminated: p.is_eliminated,
      }));

      const currentScenario = gameRow.current_scenario_id
        ? getScenarioById(gameRow.current_scenario_id)
        : null;

      const newState: GameState = {
        code: gameRow.code,
        hostId: playerRows.find((p) => p.is_host)?.id || "",
        phase: gameRow.phase as GameState["phase"],
        players,
        currentRound: gameRow.current_round,
        totalRounds: gameRow.total_rounds,
        currentScenario: currentScenario || null,
        scenarioOrder: gameRow.scenario_order || [],
        roundStartTime: gameRow.round_start_time
          ? new Date(gameRow.round_start_time).getTime()
          : null,
        roundDuration: ROUND_DURATION,
        roundResults: gameRow.round_results || [],
        pausedTimeRemaining: gameRow.paused_time_remaining,
      };

      setGameState(newState);
    } catch (e) {
      console.error("Failed to fetch game state:", e);
    }
  }, [code]);

  useEffect(() => {
    if (!code) return;

    const supabase = supabaseRef.current;

    // Initial fetch
    fetchGameState();

    // Subscribe to game changes
    const channel = supabase
      .channel(`game-realtime:${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `code=eq.${code}`,
        },
        () => {
          fetchGameState();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `game_code=eq.${code}`,
        },
        () => {
          fetchGameState();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, fetchGameState]);

  return { gameState, isConnected, setGameState };
}

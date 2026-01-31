import { createClient } from "@/utils/supabase/server";
import type { GameState, Player, GameUpdate } from "./types";
import {
  generateGameCode,
  processRound,
  INITIAL_POPULATION,
  ROUND_DURATION,
} from "./gameLogic";
import { getShuffledScenarioIds, getScenarioById } from "./scenarios";

// Helper to convert DB rows to GameState
function rowsToGameState(gameRow: any, playerRows: any[]): GameState {
  const players: Player[] = playerRows.map((p) => ({
    id: p.id,
    name: p.name,
    population: p.population,
    isHost: p.is_host,
    hasChosen: p.has_chosen,
    isEliminated: p.is_eliminated,
  }));

  const scenarioOrder = gameRow.scenario_order || [];
  const currentScenario = gameRow.current_scenario_id
    ? getScenarioById(gameRow.current_scenario_id)
    : null;

  return {
    code: gameRow.code,
    hostId: playerRows.find((p) => p.is_host)?.id || "",
    phase: gameRow.phase as GameState["phase"],
    players,
    currentRound: gameRow.current_round,
    totalRounds: gameRow.total_rounds,
    currentScenario: currentScenario || null,
    scenarioOrder,
    roundStartTime: gameRow.round_start_time
      ? new Date(gameRow.round_start_time).getTime()
      : null,
    roundDuration: ROUND_DURATION,
    roundResults: gameRow.round_results || [],
    pausedTimeRemaining: gameRow.paused_time_remaining,
  };
}

export async function createGame(
  hostName: string,
  totalRounds: number = 10
): Promise<{ code: string; hostId: string }> {
  const supabase = await createClient();
  let code = generateGameCode();

  // Ensure unique code
  let existing = await supabase.from("games").select("code").eq("code", code).single();
  while (existing.data) {
    code = generateGameCode();
    existing = await supabase.from("games").select("code").eq("code", code).single();
  }

  const hostId = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create game
  const { error: gameError } = await supabase.from("games").insert({
    code,
    phase: "lobby",
    current_round: 0,
    total_rounds: totalRounds,
    current_scenario_id: null,
    round_start_time: null,
    paused_time_remaining: null,
    scenario_order: [],
    round_results: [],
  });

  if (gameError) throw gameError;

  // Create host player
  const { error: playerError } = await supabase.from("players").insert({
    id: hostId,
    game_code: code,
    name: hostName,
    population: INITIAL_POPULATION,
    is_host: true,
    has_chosen: false,
    current_choice: null,
    is_eliminated: false,
  });

  if (playerError) throw playerError;

  return { code, hostId };
}

export async function getGame(code: string): Promise<GameState | null> {
  const supabase = await createClient();

  // Parallelize game and player fetches - they're independent
  const [gameResult, playersResult] = await Promise.all([
    supabase.from("games").select("*").eq("code", code).single(),
    supabase.from("players").select("*").eq("game_code", code).order("created_at", { ascending: true }),
  ]);

  if (gameResult.error || !gameResult.data) return null;
  if (playersResult.error) return null;

  return rowsToGameState(gameResult.data, playersResult.data || []);
}

export async function joinGame(
  code: string,
  playerName: string
): Promise<{ playerId: string; gameState: GameState } | null> {
  const supabase = await createClient();

  // Parallelize game and existing players fetch
  const [gameResult, playersResult] = await Promise.all([
    supabase.from("games").select("*").eq("code", code).single(),
    supabase.from("players").select("name").eq("game_code", code),
  ]);

  const gameRow = gameResult.data;
  if (!gameRow || gameRow.phase !== "lobby") return null;

  // Check for duplicate names
  const existingPlayers = playersResult.data;
  if (
    existingPlayers?.some(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    )
  ) {
    return null;
  }

  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { error } = await supabase.from("players").insert({
    id: playerId,
    game_code: code,
    name: playerName,
    population: INITIAL_POPULATION,
    is_host: false,
    has_chosen: false,
    current_choice: null,
    is_eliminated: false,
  });

  if (error) return null;

  const gameState = await getGame(code);
  return gameState ? { playerId, gameState } : null;
}

export async function removePlayer(
  code: string,
  playerId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId)
    .eq("game_code", code);

  return !error;
}

export async function startGame(
  code: string,
  hostId: string
): Promise<GameState | null> {
  const supabase = await createClient();
  const gameState = await getGame(code);

  if (!gameState || gameState.hostId !== hostId || gameState.phase !== "lobby") {
    return null;
  }

  const playerCount = gameState.players.filter((p) => !p.isHost).length;
  if (playerCount < 1) return null;

  const scenarioOrder = getShuffledScenarioIds().slice(0, gameState.totalRounds);
  const firstScenarioId = scenarioOrder[0];

  const { error } = await supabase
    .from("games")
    .update({
      phase: "playing",
      current_round: 1,
      scenario_order: scenarioOrder,
      current_scenario_id: firstScenarioId,
      round_start_time: new Date().toISOString(),
      paused_time_remaining: null,
    })
    .eq("code", code);

  if (error) return null;

  return await getGame(code);
}

export async function pauseRound(
  code: string,
  hostId: string
): Promise<GameState | null> {
  const supabase = await createClient();
  const gameState = await getGame(code);

  if (!gameState || gameState.hostId !== hostId || gameState.phase !== "playing") {
    return null;
  }

  const elapsed = Math.floor((Date.now() - gameState.roundStartTime!) / 1000);
  const remaining = Math.max(0, gameState.roundDuration - elapsed);

  const { error } = await supabase
    .from("games")
    .update({
      phase: "paused",
      paused_time_remaining: remaining,
      round_start_time: null,
    })
    .eq("code", code);

  if (error) return null;

  return await getGame(code);
}

export async function resumeRound(
  code: string,
  hostId: string
): Promise<GameState | null> {
  const supabase = await createClient();
  const gameState = await getGame(code);

  if (!gameState || gameState.hostId !== hostId || gameState.phase !== "paused") {
    return null;
  }

  const remaining = gameState.pausedTimeRemaining || ROUND_DURATION;
  const newStartTime = new Date(
    Date.now() - (gameState.roundDuration - remaining) * 1000
  );

  const { error } = await supabase
    .from("games")
    .update({
      phase: "playing",
      round_start_time: newStartTime.toISOString(),
      paused_time_remaining: null,
    })
    .eq("code", code);

  if (error) return null;

  return await getGame(code);
}

export async function makeChoice(
  code: string,
  playerId: string,
  choice: "safe" | "risky"
): Promise<GameState | null> {
  const supabase = await createClient();
  const gameState = await getGame(code);

  if (!gameState || (gameState.phase !== "playing" && gameState.phase !== "paused")) {
    return null;
  }

  const player = gameState.players.find((p) => p.id === playerId);
  if (!player || player.isEliminated || player.hasChosen) {
    return null;
  }

  const { error } = await supabase
    .from("players")
    .update({
      has_chosen: true,
      current_choice: choice,
    })
    .eq("id", playerId);

  if (error) return null;

  return await getGame(code);
}

export async function endRound(
  code: string,
  hostId: string
): Promise<GameState | null> {
  const supabase = await createClient();
  const gameState = await getGame(code);

  if (
    !gameState ||
    gameState.hostId !== hostId ||
    (gameState.phase !== "playing" && gameState.phase !== "paused")
  ) {
    return null;
  }

  // Get player choices
  const { data: playerRows } = await supabase
    .from("players")
    .select("*")
    .eq("game_code", code);

  if (!playerRows) return null;

  // Build choices map
  const choices = new Map<string, "safe" | "risky">();
  playerRows.forEach((p) => {
    if (p.current_choice) {
      choices.set(p.id, p.current_choice as "safe" | "risky");
    }
  });

  // Process the round
  const { updatedPlayers, roundResult } = processRound(
    gameState.players,
    gameState.currentScenario!,
    gameState.currentRound,
    choices
  );

  // Update game state
  const newRoundResults = [...gameState.roundResults, roundResult];
  const { error: gameError } = await supabase
    .from("games")
    .update({
      phase: "results",
      paused_time_remaining: null,
      round_results: newRoundResults,
    })
    .eq("code", code);

  if (gameError) return null;

  // Update all players in parallel
  await Promise.all(
    updatedPlayers.map((player) =>
      supabase
        .from("players")
        .update({
          population: player.population,
          is_eliminated: player.isEliminated,
          has_chosen: false,
          current_choice: null,
        })
        .eq("id", player.id)
    )
  );

  return await getGame(code);
}

export async function nextRound(
  code: string,
  hostId: string
): Promise<GameState | null> {
  const supabase = await createClient();
  const gameState = await getGame(code);

  if (!gameState || gameState.hostId !== hostId || gameState.phase !== "results") {
    return null;
  }

  if (gameState.currentRound >= gameState.totalRounds) {
    // Game is finished
    const { error } = await supabase
      .from("games")
      .update({ phase: "finished" })
      .eq("code", code);

    if (error) return null;
    return await getGame(code);
  }

  // Advance to next round
  const nextRoundNum = gameState.currentRound + 1;
  const nextScenarioId = gameState.scenarioOrder[nextRoundNum - 1];

  const { error } = await supabase
    .from("games")
    .update({
      phase: "playing",
      current_round: nextRoundNum,
      current_scenario_id: nextScenarioId,
      round_start_time: new Date().toISOString(),
      paused_time_remaining: null,
    })
    .eq("code", code);

  if (error) return null;

  return await getGame(code);
}

export async function deleteGame(code: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("games").delete().eq("code", code);
}

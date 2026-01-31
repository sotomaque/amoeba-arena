import type { GameState, Player, GameUpdate } from "./types";
import {
  createInitialGameState,
  generateGameCode,
  processRound,
  INITIAL_POPULATION,
} from "./gameLogic";
import { getShuffledScenarioIds, getScenarioById } from "./scenarios";

// In-memory storage for all games
const games = new Map<string, GameState>();
const playerChoices = new Map<string, Map<string, "safe" | "risky">>();

// WebSocket subscribers for each game
type UpdateCallback = (update: GameUpdate) => void;
const subscribers = new Map<string, Set<UpdateCallback>>();

export function subscribeToGame(
  code: string,
  callback: UpdateCallback
): () => void {
  if (!subscribers.has(code)) {
    subscribers.set(code, new Set());
  }
  subscribers.get(code)!.add(callback);

  return () => {
    subscribers.get(code)?.delete(callback);
  };
}

function broadcastUpdate(code: string, update: GameUpdate) {
  const subs = subscribers.get(code);
  if (subs) {
    subs.forEach((callback) => callback(update));
  }
}

export function createGame(hostName: string): { code: string; hostId: string } {
  let code = generateGameCode();
  // Ensure unique code
  while (games.has(code)) {
    code = generateGameCode();
  }

  const hostId = `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const gameState = createInitialGameState(code, hostId, hostName);
  games.set(code, gameState);
  playerChoices.set(code, new Map());

  return { code, hostId };
}

export function getGame(code: string): GameState | null {
  return games.get(code) || null;
}

export function joinGame(
  code: string,
  playerName: string
): { playerId: string; gameState: GameState } | null {
  const game = games.get(code);
  if (!game || game.phase !== "lobby") {
    return null;
  }

  // Check for duplicate names
  if (game.players.some((p) => p.name.toLowerCase() === playerName.toLowerCase())) {
    return null;
  }

  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    population: INITIAL_POPULATION,
    isHost: false,
    hasChosen: false,
    isEliminated: false,
  };

  game.players.push(newPlayer);

  broadcastUpdate(code, {
    type: "player_joined",
    gameState: game,
    message: `${playerName} joined the game`,
  });

  return { playerId, gameState: game };
}

export function removePlayer(code: string, playerId: string): boolean {
  const game = games.get(code);
  if (!game) return false;

  const playerIndex = game.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return false;

  const player = game.players[playerIndex];
  game.players.splice(playerIndex, 1);

  broadcastUpdate(code, {
    type: "player_left",
    gameState: game,
    message: `${player.name} left the game`,
  });

  return true;
}

export function startGame(code: string, hostId: string): GameState | null {
  const game = games.get(code);
  if (!game || game.hostId !== hostId || game.phase !== "lobby") {
    return null;
  }

  // Need at least 1 player besides host to start
  const playerCount = game.players.filter((p) => !p.isHost).length;
  if (playerCount < 1) {
    return null;
  }

  game.phase = "playing";
  game.currentRound = 1;
  game.scenarioOrder = getShuffledScenarioIds().slice(0, game.totalRounds);
  game.currentScenario = getScenarioById(game.scenarioOrder[0]) || null;
  game.roundStartTime = Date.now();

  broadcastUpdate(code, {
    type: "game_started",
    gameState: game,
    message: "Game started!",
  });

  return game;
}

export function makeChoice(
  code: string,
  playerId: string,
  choice: "safe" | "risky"
): GameState | null {
  const game = games.get(code);
  if (!game || game.phase !== "playing") {
    return null;
  }

  const player = game.players.find((p) => p.id === playerId);
  if (!player || player.isEliminated || player.hasChosen) {
    return null;
  }

  // Store the choice
  const choices = playerChoices.get(code)!;
  choices.set(playerId, choice);
  player.hasChosen = true;

  broadcastUpdate(code, {
    type: "player_chose",
    gameState: game,
  });

  return game;
}

export function endRound(code: string, hostId: string): GameState | null {
  const game = games.get(code);
  if (!game || game.hostId !== hostId || game.phase !== "playing") {
    return null;
  }

  const choices = playerChoices.get(code)!;

  // Process the round
  const { updatedPlayers, roundResult } = processRound(
    game.players,
    game.currentScenario!,
    game.currentRound,
    choices
  );

  game.players = updatedPlayers;
  game.roundResults.push(roundResult);
  game.phase = "results";

  // Clear choices for next round
  choices.clear();
  game.players.forEach((p) => (p.hasChosen = false));

  broadcastUpdate(code, {
    type: "round_ended",
    gameState: game,
  });

  return game;
}

export function nextRound(code: string, hostId: string): GameState | null {
  const game = games.get(code);
  if (!game || game.hostId !== hostId || game.phase !== "results") {
    return null;
  }

  if (game.currentRound >= game.totalRounds) {
    // Game is finished
    game.phase = "finished";
    broadcastUpdate(code, {
      type: "game_ended",
      gameState: game,
      message: "Game over!",
    });
    return game;
  }

  // Advance to next round
  game.currentRound++;
  game.currentScenario =
    getScenarioById(game.scenarioOrder[game.currentRound - 1]) || null;
  game.roundStartTime = Date.now();
  game.phase = "playing";

  broadcastUpdate(code, {
    type: "round_started",
    gameState: game,
  });

  return game;
}

export function deleteGame(code: string): void {
  games.delete(code);
  playerChoices.delete(code);
  subscribers.delete(code);
}

// For debugging
export function getAllGames(): string[] {
  return Array.from(games.keys());
}

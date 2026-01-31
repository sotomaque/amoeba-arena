import type { Scenario, Player, RoundResult, GameState } from "./types";

export const INITIAL_POPULATION = 100;
export const ROUND_DURATION = 30; // seconds

/**
 * Generate a 6-character game code (no confusing chars: O/0, I/1, L/l)
 */
export function generateGameCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Calculate outcome for a single player's choice
 */
export function calculateOutcome(
  population: number,
  choice: "safe" | "risky",
  scenario: Scenario
): { survived: boolean; newPopulation: number; multiplier: number } {
  const choiceData = scenario.choices[choice];
  const roll = Math.random();

  if (roll < choiceData.risk) {
    // Failed - lose 50% of population
    return {
      survived: false,
      newPopulation: Math.floor(population * 0.5),
      multiplier: 0.5,
    };
  } else {
    // Survived - apply multiplier
    return {
      survived: true,
      newPopulation: Math.floor(population * choiceData.multiplier),
      multiplier: choiceData.multiplier,
    };
  }
}

/**
 * Process all player choices for a round
 */
export function processRound(
  players: Player[],
  scenario: Scenario,
  roundNumber: number,
  choices: Map<string, "safe" | "risky">
): { updatedPlayers: Player[]; roundResult: RoundResult } {
  const results: RoundResult["players"] = [];

  const updatedPlayers = players.map((player) => {
    // Skip eliminated players
    if (player.isEliminated) {
      return player;
    }

    // If player didn't choose, default to safe
    const choice = choices.get(player.id) || "safe";
    const outcome = calculateOutcome(player.population, choice, scenario);

    results.push({
      playerId: player.id,
      name: player.name,
      choice,
      survived: outcome.survived,
      populationBefore: player.population,
      populationAfter: outcome.newPopulation,
      multiplier: outcome.multiplier,
    });

    const isEliminated = outcome.newPopulation < 1;

    return {
      ...player,
      population: Math.max(outcome.newPopulation, 0),
      lastChoice: choice,
      hasChosen: false,
      isEliminated,
    };
  });

  return {
    updatedPlayers,
    roundResult: {
      round: roundNumber,
      scenarioId: scenario.id,
      players: results,
    },
  };
}

/**
 * Get leaderboard sorted by population (descending)
 */
export function getLeaderboard(
  players: Player[]
): Array<{ rank: number; player: Player }> {
  const sorted = [...players]
    .filter((p) => !p.isHost || players.length === 1)
    .sort((a, b) => b.population - a.population);

  return sorted.map((player, index) => ({
    rank: index + 1,
    player,
  }));
}

/**
 * Check if all non-eliminated players have made their choice
 */
export function allPlayersChosen(players: Player[]): boolean {
  return players
    .filter((p) => !p.isEliminated && !p.isHost)
    .every((p) => p.hasChosen);
}

/**
 * Get active player count (non-eliminated, non-host)
 */
export function getActivePlayerCount(players: Player[]): number {
  return players.filter((p) => !p.isEliminated && !p.isHost).length;
}

/**
 * Create initial game state
 */
export function createInitialGameState(
  code: string,
  hostId: string,
  hostName: string,
  totalRounds: number = 10
): GameState {
  return {
    code,
    phase: "lobby",
    players: [
      {
        id: hostId,
        name: hostName,
        population: INITIAL_POPULATION,
        isHost: true,
        hasChosen: false,
        isEliminated: false,
      },
    ],
    currentRound: 0,
    totalRounds,
    scenarioOrder: [],
    currentScenario: null,
    roundStartTime: null,
    roundDuration: ROUND_DURATION,
    pausedTimeRemaining: null,
    roundResults: [],
    hostId,
  };
}

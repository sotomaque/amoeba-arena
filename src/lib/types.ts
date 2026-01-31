// Game-related types

export interface Scenario {
  id: number;
  title: string;
  description: string;
  choices: {
    safe: { label: string; risk: number; multiplier: number };
    risky: { label: string; risk: number; multiplier: number };
  };
  explanation: string;
}

export interface Player {
  id: string;
  name: string;
  population: number;
  isHost: boolean;
  hasChosen: boolean;
  lastChoice?: "safe" | "risky";
  isEliminated: boolean;
}

export interface RoundResult {
  round: number;
  scenarioId: number;
  players: {
    playerId: string;
    name: string;
    choice: "safe" | "risky";
    survived: boolean;
    populationBefore: number;
    populationAfter: number;
    multiplier: number;
  }[];
}

export type GamePhase = "lobby" | "playing" | "results" | "finished";

export interface GameState {
  code: string;
  phase: GamePhase;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  scenarioOrder: number[];
  currentScenario: Scenario | null;
  roundStartTime: number | null;
  roundDuration: number; // in seconds
  roundResults: RoundResult[];
  hostId: string;
}

export interface GameUpdate {
  type:
    | "connected"
    | "player_joined"
    | "player_left"
    | "game_started"
    | "round_started"
    | "player_chose"
    | "round_ended"
    | "game_ended";
  gameState: GameState;
  message?: string;
}

import { describe, expect, test } from "bun:test";
import {
  generateGameCode,
  calculateOutcome,
  createInitialGameState,
  getLeaderboard,
  INITIAL_POPULATION,
} from "../src/lib/gameLogic";
import { SCENARIOS, getScenarioById } from "../src/lib/scenarios";

describe("Game Code Generation", () => {
  test("generates a 6-character code", () => {
    const code = generateGameCode();
    expect(code).toHaveLength(6);
  });

  test("generates unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateGameCode());
    }
    // Should have mostly unique codes (allowing for some collisions)
    expect(codes.size).toBeGreaterThan(90);
  });

  test("excludes confusing characters (O, 0, I, 1, L)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateGameCode();
      expect(code).not.toMatch(/[O0I1L]/);
    }
  });
});

describe("Scenarios", () => {
  test("has 15 scenarios", () => {
    expect(SCENARIOS).toHaveLength(15);
  });

  test("each scenario has required fields", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.id).toBeGreaterThan(0);
      expect(scenario.title).toBeTruthy();
      expect(scenario.description).toBeTruthy();
      expect(scenario.choices.safe).toBeDefined();
      expect(scenario.choices.risky).toBeDefined();
      expect(scenario.explanation).toBeTruthy();
    }
  });

  test("risky choices have higher risk than safe choices", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.choices.risky.risk).toBeGreaterThan(scenario.choices.safe.risk);
    }
  });

  test("risky choices have higher multiplier than safe choices", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.choices.risky.multiplier).toBeGreaterThan(scenario.choices.safe.multiplier);
    }
  });

  test("getScenarioById returns correct scenario", () => {
    const scenario = getScenarioById(1);
    expect(scenario?.title).toBe("The Sunlit Shallows");
  });
});

describe("Initial Game State", () => {
  test("creates valid initial state", () => {
    const state = createInitialGameState("ABC123", "host_1", "TestHost");

    expect(state.code).toBe("ABC123");
    expect(state.phase).toBe("lobby");
    expect(state.players).toHaveLength(1);
    expect(state.players[0].isHost).toBe(true);
    expect(state.players[0].name).toBe("TestHost");
    expect(state.players[0].population).toBe(INITIAL_POPULATION);
    expect(state.currentRound).toBe(0);
    expect(state.totalRounds).toBe(10);
    expect(state.pausedTimeRemaining).toBe(null);
  });

  test("creates state with custom rounds", () => {
    const state = createInitialGameState("ABC123", "host_1", "TestHost", 5);
    expect(state.totalRounds).toBe(5);
  });

  test("creates state with 15 rounds", () => {
    const state = createInitialGameState("ABC123", "host_1", "TestHost", 15);
    expect(state.totalRounds).toBe(15);
  });
});

describe("Leaderboard", () => {
  test("sorts players by population descending", () => {
    const players = [
      { id: "1", name: "Low", population: 50, isHost: false, hasChosen: false, isEliminated: false },
      { id: "2", name: "High", population: 200, isHost: false, hasChosen: false, isEliminated: false },
      { id: "3", name: "Mid", population: 100, isHost: false, hasChosen: false, isEliminated: false },
    ];

    const leaderboard = getLeaderboard(players);

    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].player.name).toBe("High");
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].player.name).toBe("Mid");
    expect(leaderboard[2].rank).toBe(3);
    expect(leaderboard[2].player.name).toBe("Low");
  });
});

describe("Calculate Outcome", () => {
  const scenario = SCENARIOS[0]; // The Sunlit Shallows

  test("safe choice gives lower risk", () => {
    // Run many trials to check probability distribution
    let failures = 0;
    const trials = 1000;

    for (let i = 0; i < trials; i++) {
      const outcome = calculateOutcome(100, "safe", scenario);
      if (!outcome.survived) failures++;
    }

    // Safe risk is 5%, so failures should be around 50 +/- margin
    const expectedFailures = trials * scenario.choices.safe.risk;
    expect(failures).toBeLessThan(expectedFailures * 2);
    expect(failures).toBeGreaterThan(expectedFailures * 0.2);
  });

  test("failure halves population", () => {
    // Force a failure scenario by mocking
    const mockScenario = {
      ...scenario,
      choices: {
        safe: { ...scenario.choices.safe, risk: 1 }, // 100% risk = always fail
        risky: scenario.choices.risky,
      },
    };

    const outcome = calculateOutcome(100, "safe", mockScenario);
    expect(outcome.survived).toBe(false);
    expect(outcome.newPopulation).toBe(50);
    expect(outcome.multiplier).toBe(0.5);
  });

  test("success applies multiplier", () => {
    const mockScenario = {
      ...scenario,
      choices: {
        safe: { ...scenario.choices.safe, risk: 0 }, // 0% risk = always succeed
        risky: scenario.choices.risky,
      },
    };

    const outcome = calculateOutcome(100, "safe", mockScenario);
    expect(outcome.survived).toBe(true);
    expect(outcome.newPopulation).toBe(Math.floor(100 * mockScenario.choices.safe.multiplier));
  });
});

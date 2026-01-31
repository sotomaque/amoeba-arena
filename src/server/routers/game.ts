import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import {
  createGame,
  getGame,
  joinGame,
  startGame,
  makeChoice,
  endRound,
  nextRound,
  removePlayer,
  pauseRound,
  resumeRound,
} from "@/lib/gameStore";

export const gameRouter = router({
  create: publicProcedure
    .input(
      z.object({
        hostName: z.string().min(1).max(20),
        totalRounds: z.number().min(3).max(15).default(10),
      })
    )
    .mutation(async ({ input }) => {
      const result = await createGame(input.hostName, input.totalRounds);
      return result;
    }),

  join: publicProcedure
    .input(
      z.object({
        code: z.string().length(6),
        playerName: z.string().min(1).max(20),
      })
    )
    .mutation(async ({ input }) => {
      const result = await joinGame(input.code.toUpperCase(), input.playerName);
      if (!result) {
        throw new Error("Could not join game. Check the code and try again.");
      }
      return result;
    }),

  getState: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const game = await getGame(input.code.toUpperCase());
      if (!game) {
        throw new Error("Game not found");
      }
      return game;
    }),

  start: publicProcedure
    .input(z.object({ code: z.string(), hostId: z.string() }))
    .mutation(async ({ input }) => {
      const game = await startGame(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new Error("Could not start game");
      }
      return game;
    }),

  pause: publicProcedure
    .input(z.object({ code: z.string(), hostId: z.string() }))
    .mutation(async ({ input }) => {
      const game = await pauseRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new Error("Could not pause round");
      }
      return game;
    }),

  resume: publicProcedure
    .input(z.object({ code: z.string(), hostId: z.string() }))
    .mutation(async ({ input }) => {
      const game = await resumeRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new Error("Could not resume round");
      }
      return game;
    }),

  choose: publicProcedure
    .input(
      z.object({
        code: z.string(),
        playerId: z.string(),
        choice: z.enum(["safe", "risky"]),
      })
    )
    .mutation(async ({ input }) => {
      const game = await makeChoice(
        input.code.toUpperCase(),
        input.playerId,
        input.choice
      );
      if (!game) {
        throw new Error("Could not record choice");
      }
      return game;
    }),

  endRound: publicProcedure
    .input(z.object({ code: z.string(), hostId: z.string() }))
    .mutation(async ({ input }) => {
      const game = await endRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new Error("Could not end round");
      }
      return game;
    }),

  nextRound: publicProcedure
    .input(z.object({ code: z.string(), hostId: z.string() }))
    .mutation(async ({ input }) => {
      const game = await nextRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new Error("Could not advance to next round");
      }
      return game;
    }),

  leave: publicProcedure
    .input(z.object({ code: z.string(), playerId: z.string() }))
    .mutation(async ({ input }) => {
      const success = await removePlayer(input.code.toUpperCase(), input.playerId);
      return { success };
    }),
});

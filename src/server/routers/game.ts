import { z } from "zod";
import { TRPCError } from "@trpc/server";
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
  verifyPlayer,
} from "@/lib/gameStore";

// Helper to verify player authentication
async function requireAuth(playerId: string, secretToken: string) {
  const auth = await verifyPlayer(playerId, secretToken);
  if (!auth.valid) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
  }
  return auth;
}

// Helper to verify host authentication
async function requireHost(hostId: string, secretToken: string) {
  const auth = await requireAuth(hostId, secretToken);
  if (!auth.isHost) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Host access required" });
  }
  return auth;
}

export const gameRouter = router({
  // Public: Anyone can create a game
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

  // Public: Anyone can join a game (returns their credentials)
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
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not join game. Check the code and try again.",
        });
      }
      return result;
    }),

  // Public: Anyone can view game state (no sensitive data exposed)
  getState: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const game = await getGame(input.code.toUpperCase());
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });
      }
      return game;
    }),

  // Protected: Only authenticated host can start game
  start: publicProcedure
    .input(
      z.object({
        code: z.string(),
        hostId: z.string(),
        secretToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await requireHost(input.hostId, input.secretToken);
      const game = await startGame(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not start game" });
      }
      return game;
    }),

  // Protected: Only authenticated host can pause
  pause: publicProcedure
    .input(
      z.object({
        code: z.string(),
        hostId: z.string(),
        secretToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await requireHost(input.hostId, input.secretToken);
      const game = await pauseRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not pause round" });
      }
      return game;
    }),

  // Protected: Only authenticated host can resume
  resume: publicProcedure
    .input(
      z.object({
        code: z.string(),
        hostId: z.string(),
        secretToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await requireHost(input.hostId, input.secretToken);
      const game = await resumeRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not resume round" });
      }
      return game;
    }),

  // Protected: Only authenticated player can make their choice
  choose: publicProcedure
    .input(
      z.object({
        code: z.string(),
        playerId: z.string(),
        secretToken: z.string(),
        choice: z.enum(["safe", "risky"]),
      })
    )
    .mutation(async ({ input }) => {
      await requireAuth(input.playerId, input.secretToken);
      const game = await makeChoice(
        input.code.toUpperCase(),
        input.playerId,
        input.choice
      );
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not record choice" });
      }
      return game;
    }),

  // Protected: Only authenticated host can end round
  endRound: publicProcedure
    .input(
      z.object({
        code: z.string(),
        hostId: z.string(),
        secretToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await requireHost(input.hostId, input.secretToken);
      const game = await endRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not end round" });
      }
      return game;
    }),

  // Protected: Only authenticated host can advance to next round
  nextRound: publicProcedure
    .input(
      z.object({
        code: z.string(),
        hostId: z.string(),
        secretToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await requireHost(input.hostId, input.secretToken);
      const game = await nextRound(input.code.toUpperCase(), input.hostId);
      if (!game) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not advance to next round" });
      }
      return game;
    }),

  // Protected: Only authenticated player can leave (remove themselves)
  leave: publicProcedure
    .input(
      z.object({
        code: z.string(),
        playerId: z.string(),
        secretToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await requireAuth(input.playerId, input.secretToken);
      const success = await removePlayer(input.code.toUpperCase(), input.playerId);
      return { success };
    }),
});

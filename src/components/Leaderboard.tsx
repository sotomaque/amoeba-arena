"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/types";
import { getLeaderboard } from "@/lib/gameLogic";

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  compact?: boolean;
}

const rankEmojis = ["👑", "🥈", "🥉"];

export function Leaderboard({ players, currentPlayerId, compact = false }: LeaderboardProps) {
  const leaderboard = getLeaderboard(players);

  if (compact) {
    return (
      <motion.div
        className="ghibli-card p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span>🏆</span> Leaderboard
        </h4>
        <div className="space-y-2">
          {leaderboard.slice(0, 5).map(({ rank, player }, index) => (
            <motion.div
              key={player.id}
              className={`flex justify-between items-center text-sm px-3 py-2 rounded-lg ${
                player.id === currentPlayerId
                  ? "bg-forest/10 border border-forest/20"
                  : "bg-muted/50"
              } ${player.isEliminated ? "opacity-50" : ""}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-center">
                  {rank <= 3 ? rankEmojis[rank - 1] : `${rank}.`}
                </span>
                <span className={player.id === currentPlayerId ? "font-medium text-forest" : ""}>
                  {player.name}
                </span>
                {player.id === currentPlayerId && (
                  <span className="text-xs text-forest">(You)</span>
                )}
              </span>
              <span className="font-mono font-medium">
                {player.population.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="ghibli-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-gradient-to-r from-forest/10 to-meadow/10 px-6 py-4 border-b border-border/50">
        <h3 className="text-xl font-bold flex items-center gap-2 gradient-text-nature">
          <span>🏆</span> Leaderboard
        </h3>
      </div>

      <div className="p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {leaderboard.map(({ rank, player }, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex justify-between items-center p-4 rounded-xl transition-all ${
                rank === 1
                  ? "bg-gradient-to-r from-yellow-100 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 border-2 border-yellow-300/50"
                  : rank === 2
                    ? "bg-gradient-to-r from-gray-100 to-slate-50 dark:from-gray-800/30 dark:to-slate-800/20 border border-gray-300/50"
                    : rank === 3
                      ? "bg-gradient-to-r from-orange-100 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 border border-orange-300/50"
                      : "bg-muted/50"
              } ${player.id === currentPlayerId ? "ring-2 ring-forest ring-offset-2" : ""} ${
                player.isEliminated ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <motion.span
                  className="text-3xl w-10 text-center"
                  animate={rank === 1 ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {rank <= 3 ? rankEmojis[rank - 1] : (
                    <span className="text-xl font-bold text-muted-foreground">{rank}</span>
                  )}
                </motion.span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{player.name}</span>
                    {player.id === currentPlayerId && (
                      <span className="text-xs px-2 py-0.5 bg-forest/10 text-forest rounded-full">
                        You
                      </span>
                    )}
                    {player.isEliminated && (
                      <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                        Eliminated
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      🦠
                    </motion.span>
                    <span>amoeba colony</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <motion.div
                  className="text-2xl font-bold font-mono text-forest"
                  key={player.population}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {player.population.toLocaleString()}
                </motion.div>
                <div className="text-xs text-muted-foreground">population</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

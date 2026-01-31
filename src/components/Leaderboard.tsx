"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/lib/types";
import { getLeaderboard } from "@/lib/gameLogic";

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  compact?: boolean;
}

export function Leaderboard({ players, currentPlayerId, compact = false }: LeaderboardProps) {
  const leaderboard = getLeaderboard(players);

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Leaderboard</h4>
        <div className="space-y-1">
          {leaderboard.slice(0, 5).map(({ rank, player }) => (
            <div
              key={player.id}
              className={`flex justify-between items-center text-sm px-2 py-1 rounded ${
                player.id === currentPlayerId ? "bg-primary/10" : ""
              } ${player.isEliminated ? "opacity-50" : ""}`}
            >
              <span>
                {rank}. {player.name}
                {player.id === currentPlayerId && " (You)"}
              </span>
              <span className="font-mono">{player.population.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map(({ rank, player }) => (
            <div
              key={player.id}
              className={`flex justify-between items-center p-3 rounded-lg ${
                rank === 1 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-muted"
              } ${player.id === currentPlayerId ? "ring-2 ring-primary" : ""} ${
                player.isEliminated ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold w-8">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </span>
                <div>
                  <span className="font-medium">{player.name}</span>
                  {player.id === currentPlayerId && (
                    <Badge variant="secondary" className="ml-2">
                      You
                    </Badge>
                  )}
                  {player.isEliminated && (
                    <Badge variant="destructive" className="ml-2">
                      Eliminated
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono">
                  {player.population.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">amoebas</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

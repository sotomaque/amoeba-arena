-- Supabase Schema for Amoeba Arena
-- Run this in the Supabase SQL Editor

-- Games table
CREATE TABLE IF NOT EXISTS games (
  code TEXT PRIMARY KEY,
  phase TEXT NOT NULL DEFAULT 'lobby',
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 10,
  current_scenario_id INTEGER,
  round_start_time TIMESTAMPTZ,
  paused_time_remaining INTEGER,
  scenario_order INTEGER[] DEFAULT '{}',
  round_results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  game_code TEXT NOT NULL REFERENCES games(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  population INTEGER NOT NULL DEFAULT 100,
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  has_chosen BOOLEAN NOT NULL DEFAULT FALSE,
  current_choice TEXT,
  is_eliminated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster player lookups by game
CREATE INDEX IF NOT EXISTS idx_players_game_code ON players(game_code);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for anonymous users (game is public)
-- Games policies
CREATE POLICY "Allow anonymous read games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update games" ON games FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete games" ON games FOR DELETE USING (true);

-- Players policies
CREATE POLICY "Allow anonymous read players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete players" ON players FOR DELETE USING (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- Optional: Clean up old games (run periodically or set up a cron job)
-- DELETE FROM games WHERE created_at < NOW() - INTERVAL '24 hours';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          code: string;
          phase: string;
          current_round: number;
          total_rounds: number;
          current_scenario_id: number | null;
          round_start_time: string | null;
          paused_time_remaining: number | null;
          scenario_order: number[];
          round_results: Json;
          created_at: string;
        };
        Insert: {
          code: string;
          phase?: string;
          current_round?: number;
          total_rounds?: number;
          current_scenario_id?: number | null;
          round_start_time?: string | null;
          paused_time_remaining?: number | null;
          scenario_order?: number[];
          round_results?: Json;
          created_at?: string;
        };
        Update: {
          code?: string;
          phase?: string;
          current_round?: number;
          total_rounds?: number;
          current_scenario_id?: number | null;
          round_start_time?: string | null;
          paused_time_remaining?: number | null;
          scenario_order?: number[];
          round_results?: Json;
          created_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          game_code: string;
          name: string;
          population: number;
          is_host: boolean;
          has_chosen: boolean;
          current_choice: string | null;
          is_eliminated: boolean;
          secret_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_code: string;
          name: string;
          population?: number;
          is_host?: boolean;
          has_chosen?: boolean;
          current_choice?: string | null;
          is_eliminated?: boolean;
          secret_token?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_code?: string;
          name?: string;
          population?: number;
          is_host?: boolean;
          has_chosen?: boolean;
          current_choice?: string | null;
          is_eliminated?: boolean;
          secret_token?: string;
          created_at?: string;
        };
      };
    };
  };
}

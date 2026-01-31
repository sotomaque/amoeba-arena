"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { GameState, GameUpdate } from "@/lib/types";

export function useGameState(code: string, initialState?: GameState) {
  const [gameState, setGameState] = useState<GameState | null>(
    initialState || null
  );
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!code) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // WebSocket server runs on port + 1 (e.g., 3001 if Next.js is on 3000)
    const wsPort = parseInt(window.location.port || "3000", 10) + 1;
    const ws = new WebSocket(`${protocol}//${window.location.hostname}:${wsPort}/ws?code=${code}`);

    ws.onopen = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const update: GameUpdate = JSON.parse(event.data);
        setGameState(update.gameState);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  }, [code]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { gameState, isConnected, setGameState };
}

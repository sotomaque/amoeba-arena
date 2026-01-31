import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { parse } from "node:url";
import next from "next";
import { subscribeToGame, getGame } from "./src/lib/gameStore";
import type { GameUpdate } from "./src/lib/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port, turbopack: dev });
const handle = app.getRequestHandler();

interface WebSocketData {
  gameCode: string;
  unsubscribe?: () => void;
}

// Track connections per game using Bun's ServerWebSocket
const gameConnections = new Map<string, Set<any>>();

await app.prepare();

// Create Node.js HTTP server for Next.js
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const parsedUrl = parse(req.url || "", true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error handling request:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
});

httpServer.listen(port, hostname, () => {
  console.log(`> Next.js ready on http://${hostname}:${port}`);
});

// Separate Bun server for WebSocket on a different port
const wsPort = port + 1;

const wsServer = Bun.serve<WebSocketData>({
  port: wsPort,
  hostname,

  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const gameCode = url.searchParams.get("code");

      if (!gameCode) {
        return new Response("Missing game code", { status: 400 });
      }

      const upgraded = server.upgrade(req, {
        data: { gameCode },
      });

      if (upgraded) {
        return undefined;
      }

      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    return new Response("WebSocket server - connect to /ws", { status: 200 });
  },

  websocket: {
    open(ws) {
      const { gameCode } = ws.data;

      // Add connection to game
      if (!gameConnections.has(gameCode)) {
        gameConnections.set(gameCode, new Set());
      }
      gameConnections.get(gameCode)!.add(ws);

      // Send current game state
      const gameState = getGame(gameCode);
      if (gameState) {
        ws.send(
          JSON.stringify({
            type: "connected",
            gameState,
          } as GameUpdate)
        );
      }

      // Subscribe to game updates
      const unsubscribe = subscribeToGame(gameCode, (update: GameUpdate) => {
        const connections = gameConnections.get(gameCode);
        if (connections) {
          const message = JSON.stringify(update);
          connections.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        }
      });

      ws.data.unsubscribe = unsubscribe;
    },

    message(ws, message) {
      console.log("WebSocket message:", message);
    },

    close(ws) {
      const { gameCode, unsubscribe } = ws.data;

      const connections = gameConnections.get(gameCode);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          gameConnections.delete(gameCode);
        }
      }

      unsubscribe?.();
    },
  },
});

console.log(`> WebSocket server ready on ws://${hostname}:${wsPort}`);

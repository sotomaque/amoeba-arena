import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { subscribeToGame, getGame } from "./src/lib/gameStore";
import type { GameUpdate } from "./src/lib/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port, turbopack: dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  // Track connections per game
  const gameConnections = new Map<string, Set<WebSocket>>();

  server.on("upgrade", (request, socket, head) => {
    const { pathname, query } = parse(request.url!, true);

    if (pathname === "/ws") {
      const gameCode = query.code as string;

      if (!gameCode) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
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
            connections.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(update));
              }
            });
          }
        });

        ws.on("close", () => {
          const connections = gameConnections.get(gameCode);
          if (connections) {
            connections.delete(ws);
            if (connections.size === 0) {
              gameConnections.delete(gameCode);
            }
          }
          unsubscribe();
        });

        ws.on("error", console.error);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready`);
  });
});

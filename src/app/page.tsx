"use client";

import { CreateGameForm } from "@/components/CreateGameForm";
import { JoinGameForm } from "@/components/JoinGameForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
          Amoeba Arena
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          A multiplayer game about population dynamics, risk, and survival
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
        <div className="flex-1">
          <CreateGameForm />
        </div>
        <div className="flex items-center justify-center">
          <span className="text-muted-foreground font-medium">OR</span>
        </div>
        <div className="flex-1">
          <JoinGameForm />
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground max-w-lg">
        <p className="mb-2">
          <strong>How to play:</strong> Create a game to get a code, then share it
          with your class. Each round presents an environmental challenge - choose
          wisely to grow your amoeba population!
        </p>
      </div>
    </main>
  );
}

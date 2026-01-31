"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Scenario } from "@/lib/types";

interface ScenarioCardProps {
  scenario: Scenario;
  roundNumber: number;
  totalRounds: number;
}

export function ScenarioCard({ scenario, roundNumber, totalRounds }: ScenarioCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="secondary">
            Round {roundNumber} of {totalRounds}
          </Badge>
        </div>
        <CardTitle className="text-2xl">{scenario.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-muted-foreground">{scenario.description}</p>
      </CardContent>
    </Card>
  );
}

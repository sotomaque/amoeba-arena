import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "The Sunlit Shallows",
    description:
      "Your amoeba colony has discovered a sunny patch of water rich with bacteria. However, a fish occasionally swims through this area looking for food.",
    choices: {
      safe: {
        label: "Stay in the shadows - modest growth but safe",
        risk: 0.05,
        multiplier: 1.3,
      },
      risky: {
        label: "Move to the sunny patch - more food but predator risk",
        risk: 0.35,
        multiplier: 2.2,
      },
    },
    explanation:
      "Predation is a major factor in population dynamics. Organisms must balance resource acquisition with predation risk.",
  },
  {
    id: 2,
    title: "The Drought Begins",
    description:
      "Water levels are dropping in your pond. You can either stay put and hope for rain, or migrate to a deeper area which requires energy and crosses exposed territory.",
    choices: {
      safe: {
        label: "Stay and conserve energy - wait for rain",
        risk: 0.25,
        multiplier: 1.4,
      },
      risky: {
        label: "Migrate to deeper water - risky journey but safer destination",
        risk: 0.4,
        multiplier: 2.0,
      },
    },
    explanation:
      "Climate and environmental changes force organisms to make migration decisions that affect survival rates.",
  },
  {
    id: 3,
    title: "Algae Bloom",
    description:
      "A massive algae bloom has appeared! It provides abundant food but also depletes oxygen in the water at night.",
    choices: {
      safe: {
        label: "Feed cautiously at the edges",
        risk: 0.1,
        multiplier: 1.5,
      },
      risky: {
        label: "Dive into the bloom center for maximum feeding",
        risk: 0.45,
        multiplier: 2.5,
      },
    },
    explanation:
      "Algae blooms can be both beneficial (food source) and harmful (oxygen depletion, toxins). This is called eutrophication.",
  },
  {
    id: 4,
    title: "Bacterial Invasion",
    description:
      "Harmful bacteria have entered your area. You can develop resistance (which takes energy) or try to outrun the infection.",
    choices: {
      safe: {
        label: "Invest in resistance - slower growth but protection",
        risk: 0.15,
        multiplier: 1.2,
      },
      risky: {
        label: "Ignore the threat and focus on reproduction",
        risk: 0.5,
        multiplier: 2.3,
      },
    },
    explanation:
      "Disease resistance is a trade-off. Energy spent on immunity cannot be used for reproduction.",
  },
  {
    id: 5,
    title: "Temperature Spike",
    description:
      "A heat wave is raising water temperatures. Warmer water speeds up your metabolism but also stresses your cells.",
    choices: {
      safe: {
        label: "Slow down metabolism and wait it out",
        risk: 0.1,
        multiplier: 1.1,
      },
      risky: {
        label: "Take advantage of faster metabolism for rapid reproduction",
        risk: 0.35,
        multiplier: 2.4,
      },
    },
    explanation:
      "Temperature affects metabolic rates. Higher temperatures can increase growth but also increase mortality risk.",
  },
  {
    id: 6,
    title: "The Flowing Current",
    description:
      "A strong current is pushing through your area. It brings fresh nutrients but might scatter your colony.",
    choices: {
      safe: {
        label: "Anchor down and stay together",
        risk: 0.08,
        multiplier: 1.3,
      },
      risky: {
        label: "Ride the current to new territory with more resources",
        risk: 0.4,
        multiplier: 2.1,
      },
    },
    explanation:
      "Dispersal is a key survival strategy but carries risks. Staying together provides safety in numbers.",
  },
  {
    id: 7,
    title: "Chemical Runoff",
    description:
      "Agricultural runoff has entered the pond. It contains fertilizers (nutrients) but also pesticides (toxins).",
    choices: {
      safe: {
        label: "Retreat to cleaner water with less food",
        risk: 0.12,
        multiplier: 1.2,
      },
      risky: {
        label: "Stay and feast on the nutrient-rich but toxic water",
        risk: 0.55,
        multiplier: 2.8,
      },
    },
    explanation:
      "Pollution creates trade-offs between resource availability and toxicity. This affects many aquatic populations.",
  },
  {
    id: 8,
    title: "Competitor Colony",
    description:
      "Another amoeba species has moved into your territory. They compete for the same food sources.",
    choices: {
      safe: {
        label: "Share territory peacefully - reduced resources but stable",
        risk: 0.1,
        multiplier: 1.3,
      },
      risky: {
        label: "Compete aggressively for dominance",
        risk: 0.45,
        multiplier: 2.2,
      },
    },
    explanation:
      "Interspecific competition is a major factor in population dynamics and evolution.",
  },
  {
    id: 9,
    title: "Symbiotic Opportunity",
    description:
      "Beneficial bacteria offer a symbiotic relationship. They provide nutrients but take up space in your cells.",
    choices: {
      safe: {
        label: "Decline the partnership - maintain independence",
        risk: 0.08,
        multiplier: 1.2,
      },
      risky: {
        label: "Accept the symbiosis - potential for great benefits or harm",
        risk: 0.3,
        multiplier: 2.0,
      },
    },
    explanation:
      "Symbiosis can be mutualistic, parasitic, or commensal. Mitochondria originated from ancient symbiosis!",
  },
  {
    id: 10,
    title: "Seasonal Change",
    description:
      "Autumn is approaching. You can either form protective cysts now or continue growing until the last moment.",
    choices: {
      safe: {
        label: "Form cysts early - guaranteed survival through winter",
        risk: 0.05,
        multiplier: 1.0,
      },
      risky: {
        label: "Keep growing until conditions worsen",
        risk: 0.4,
        multiplier: 1.9,
      },
    },
    explanation:
      "Many organisms form dormant stages to survive harsh conditions. Timing this transition is critical.",
  },
  {
    id: 11,
    title: "Oxygen Levels Dropping",
    description:
      "Decomposing matter is consuming oxygen in the water. You can move to the surface or adapt to low oxygen.",
    choices: {
      safe: {
        label: "Move to oxygen-rich surface waters",
        risk: 0.15,
        multiplier: 1.4,
      },
      risky: {
        label: "Stay deep and adapt to low oxygen conditions",
        risk: 0.35,
        multiplier: 2.1,
      },
    },
    explanation:
      "Dissolved oxygen is crucial for aquatic life. Many organisms have adaptations for low-oxygen environments.",
  },
  {
    id: 12,
    title: "Mutation Event",
    description:
      "UV radiation has caused mutations in your colony. Most mutations are harmful, but some might be beneficial.",
    choices: {
      safe: {
        label: "Eliminate mutants to maintain genetic stability",
        risk: 0.1,
        multiplier: 1.2,
      },
      risky: {
        label: "Allow mutations - chance of beneficial adaptations",
        risk: 0.4,
        multiplier: 2.3,
      },
    },
    explanation:
      "Mutations are the raw material for evolution. While most are neutral or harmful, some provide advantages.",
  },
  {
    id: 13,
    title: "New Food Source",
    description:
      "A dead insect has fallen into the water, creating a feast. However, many organisms are competing for it.",
    choices: {
      safe: {
        label: "Wait for scraps after larger organisms finish",
        risk: 0.08,
        multiplier: 1.4,
      },
      risky: {
        label: "Rush in for the best nutrients despite competition",
        risk: 0.38,
        multiplier: 2.4,
      },
    },
    explanation:
      "Detritus (dead organic matter) is a major energy source in aquatic ecosystems. Competition for it can be fierce.",
  },
  {
    id: 14,
    title: "pH Shift",
    description:
      "Acid rain has lowered the water's pH. You can either tolerate the stress or seek neutral waters.",
    choices: {
      safe: {
        label: "Migrate to buffered zones near rocks",
        risk: 0.12,
        multiplier: 1.3,
      },
      risky: {
        label: "Adapt to acidic conditions - potential competitive advantage",
        risk: 0.42,
        multiplier: 2.2,
      },
    },
    explanation:
      "pH affects protein function and metabolism. Acid rain from pollution has devastated many aquatic ecosystems.",
  },
  {
    id: 15,
    title: "Final Challenge: The Perfect Storm",
    description:
      "Multiple stressors combine: temperature rise, predators active, and nutrients scarce. This is the ultimate test!",
    choices: {
      safe: {
        label: "Hunker down in a protected microhabitat",
        risk: 0.2,
        multiplier: 1.5,
      },
      risky: {
        label: "Take bold action to find the best remaining habitat",
        risk: 0.5,
        multiplier: 3.0,
      },
    },
    explanation:
      "In nature, organisms often face multiple simultaneous stressors. Surviving requires balancing many trade-offs.",
  },
];

export function getShuffledScenarioIds(): number[] {
  const ids = SCENARIOS.map((s) => s.id);
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

export function getScenarioById(id: number): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

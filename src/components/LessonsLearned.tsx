"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const LESSONS = [
  {
    id: 1,
    icon: "🔬",
    title: "Carrying Capacity",
    summary: "Every environment can only support a limited number of organisms.",
    detail:
      "Just like in our game, real populations face limits. When resources like food, water, and space run out, populations can't keep growing forever. This limit is called the carrying capacity of an environment.",
    realWorld:
      "Example: A pond can only support so many fish. If there are too many, they'll run out of food and oxygen!",
  },
  {
    id: 2,
    icon: "⚖️",
    title: "Risk vs. Reward",
    summary: "In nature, risky choices can lead to big rewards—or big losses.",
    detail:
      "Animals and microorganisms constantly make decisions about finding food, shelter, and mates. Taking risks can help them grow faster, but it can also expose them to predators or dangerous conditions.",
    realWorld:
      "Example: A deer that ventures into an open meadow finds more grass to eat, but is also more visible to predators.",
  },
  {
    id: 3,
    icon: "📈",
    title: "Exponential Growth",
    summary: "Populations can grow incredibly fast when conditions are good.",
    detail:
      "When organisms have plenty of resources, they reproduce quickly. One cell becomes two, two become four, four become eight... This rapid increase is called exponential growth. But it can't last forever!",
    realWorld:
      "Example: Bacteria can double every 20 minutes. One bacterium could become over 1 million in just 7 hours!",
  },
  {
    id: 4,
    icon: "🌊",
    title: "Environmental Factors",
    summary: "The environment directly affects population survival and growth.",
    detail:
      "Temperature, pH levels, available nutrients, and competition from other species all influence whether a population thrives or struggles. Organisms must adapt to their environment to survive.",
    realWorld:
      "Example: Coral reefs are dying because ocean temperatures are rising just a few degrees—small changes have big impacts!",
  },
  {
    id: 5,
    icon: "🎲",
    title: "Survival is Partly Random",
    summary: "Even well-adapted organisms can be affected by chance events.",
    detail:
      "In nature, unexpected events like storms, droughts, or disease outbreaks can dramatically affect populations. This is why genetic diversity is important—it gives species a better chance of some individuals surviving.",
    realWorld:
      "Example: A sudden freeze might kill most orange trees in Florida, but some varieties that handle cold better survive.",
  },
  {
    id: 6,
    icon: "🔄",
    title: "Population Cycles",
    summary: "Populations often go through boom and bust cycles.",
    detail:
      "Many populations grow when conditions are good, then crash when resources run out or predators increase. These cycles are natural and help maintain balance in ecosystems.",
    realWorld:
      "Example: Lemming populations boom every 3-4 years, then crash when they've eaten all the vegetation. Then the cycle starts again!",
  },
];

export function LessonsLearned() {
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const toggleLesson = (id: number) => {
    setExpandedLesson(expandedLesson === id ? null : id);
  };

  const containerAnimation = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 1.0 },
      };

  const itemAnimation = (index: number) =>
    shouldReduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, x: -10 },
          animate: { opacity: 1, x: 0 },
          transition: { delay: 1.1 + index * 0.1 },
        };

  return (
    <motion.div className="ghibli-card p-6" {...containerAnimation}>
      <h2 className="font-semibold mb-2 flex items-center gap-2 text-xl">
        <span>📚</span> Lessons Learned
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        What did this game teach us about population biology? Click each topic
        to learn more!
      </p>

      <div className="grid gap-3">
        {LESSONS.map((lesson, index) => (
          <motion.div key={lesson.id} {...itemAnimation(index)}>
            <button
              type="button"
              onClick={() => toggleLesson(lesson.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                expandedLesson === lesson.id
                  ? "bg-forest/10 dark:bg-forest/20 border-2 border-forest/30"
                  : "bg-muted/50 hover:bg-muted border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lesson.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lesson.summary}
                  </p>
                </div>
                <motion.span
                  className="text-muted-foreground"
                  animate={{ rotate: expandedLesson === lesson.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▼
                </motion.span>
              </div>
            </button>

            {expandedLesson === lesson.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4"
              >
                <div className="mt-3 p-4 bg-card rounded-lg border border-border/50">
                  <p className="text-foreground mb-3">{lesson.detail}</p>
                  <div className="p-3 bg-sky/10 dark:bg-sky/20 rounded-lg border border-sky/30">
                    <p className="text-sm">
                      <span className="font-semibold text-pond dark:text-sky">
                        🌍 Real World:{" "}
                      </span>
                      <span className="text-foreground">{lesson.realWorld}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Key Vocabulary */}
      <div className="mt-6 p-4 bg-meadow/10 dark:bg-meadow/20 rounded-xl border border-meadow/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>📖</span> Key Vocabulary
        </h3>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            {
              term: "Population",
              def: "A group of organisms of the same species living in an area",
            },
            {
              term: "Carrying Capacity",
              def: "Maximum population an environment can support",
            },
            {
              term: "Exponential Growth",
              def: "Rapid population increase when resources are abundant",
            },
            {
              term: "Limiting Factors",
              def: "Things that restrict population growth (food, space, etc.)",
            },
            {
              term: "Adaptation",
              def: "Traits that help organisms survive in their environment",
            },
            {
              term: "Competition",
              def: "When organisms struggle for the same limited resources",
            },
          ].map((vocab) => (
            <div key={vocab.term} className="flex gap-2">
              <span className="font-semibold text-forest dark:text-meadow whitespace-nowrap">
                {vocab.term}:
              </span>
              <span className="text-muted-foreground">{vocab.def}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discussion Questions */}
      <div className="mt-4 p-4 bg-sunset/10 dark:bg-sunset/20 rounded-xl border border-sunset/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>💬</span> Discussion Questions
        </h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex gap-2">
            <span className="text-sunset">1.</span>
            Why did some players&apos; populations grow while others shrank?
          </li>
          <li className="flex gap-2">
            <span className="text-sunset">2.</span>
            What strategy worked best—playing it safe or taking risks? Why?
          </li>
          <li className="flex gap-2">
            <span className="text-sunset">3.</span>
            How is this game similar to what happens with real animal populations?
          </li>
          <li className="flex gap-2">
            <span className="text-sunset">4.</span>
            What would happen if there was no limit to population growth?
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

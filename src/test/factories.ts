import { type Match } from "@/domain/match/match";

let seq = 0;

export function makeMatch(overrides: Partial<Match> = {}): Match {
  seq += 1;
  return {
    id: `m_${seq}`,
    careerId: "c_1",
    season: "2026/27",
    date: `2026-09-${String((seq % 28) + 1).padStart(2, "0")}`,
    competition: "Liga",
    opponent: "Rival FC",
    venue: "home",
    goalsFor: 1,
    goalsAgainst: 0,
    role: "starter",
    minutes: 90,
    goals: 0,
    assists: 0,
    rating: 7,
    yellowCards: 0,
    redCard: false,
    ...overrides,
  };
}

export function sequentialIds(): (prefix: string) => string {
  let n = 0;
  return (prefix) => `${prefix}_${++n}`;
}

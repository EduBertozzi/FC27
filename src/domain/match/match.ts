export type Venue = "home" | "away" | "neutral";
export type MatchRole = "starter" | "substitute";
export type MatchResult = "W" | "D" | "L";

export const RESULT_LABEL: Record<MatchResult, string> = {
  W: "Vitória",
  D: "Empate",
  L: "Derrota",
};
export const RESULT_SHORT: Record<MatchResult, string> = { W: "V", D: "E", L: "D" };
export const VENUE_LABEL: Record<Venue, string> = { home: "Casa", away: "Fora", neutral: "Neutro" };
export const ROLE_LABEL: Record<MatchRole, string> = { starter: "Titular", substitute: "Reserva" };

export interface Match {
  id: string;
  careerId: string;
  season: string;
  date: string; // ISO yyyy-mm-dd
  competition: string;
  opponent: string;
  venue: Venue;
  goalsFor: number;
  goalsAgainst: number;
  role: MatchRole;
  minutes: number;
  goals: number;
  assists: number;
  /** Nota 1–10 com uma casa decimal; `null` quando o usuário não informou. */
  rating: number | null;
  yellowCards: number;
  redCard: boolean;
  /** Minuto em que entrou (reserva) ou saiu (titular substituído). */
  substitutionMinute?: number;
  notes?: string;
}

export interface Fixture {
  id: string;
  date: string;
  competition: string;
  opponent: string;
  venue: Venue;
  note?: string;
}

export function resultOf(match: Pick<Match, "goalsFor" | "goalsAgainst">): MatchResult {
  if (match.goalsFor > match.goalsAgainst) return "W";
  if (match.goalsFor < match.goalsAgainst) return "L";
  return "D";
}

export function scoreline(match: Pick<Match, "goalsFor" | "goalsAgainst">): string {
  return `${match.goalsFor}–${match.goalsAgainst}`;
}

export function sortByDateDesc<T extends { date: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export function sortByDateAsc<T extends { date: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.date.localeCompare(b.date));
}

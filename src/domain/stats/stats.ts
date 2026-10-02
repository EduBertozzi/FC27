import { type SeasonSummary } from "../career/career";
import {
  type Match,
  type MatchResult,
  resultOf,
  sortByDateAsc,
  sortByDateDesc,
} from "../match/match";

export interface StatLine {
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  /** Média das notas informadas; `null` se nenhuma partida tiver nota. */
  averageRating: number | null;
  yellowCards: number;
  redCards: number;
  wins: number;
  draws: number;
  losses: number;
}

export const EMPTY_STAT_LINE: StatLine = {
  appearances: 0,
  starts: 0,
  minutes: 0,
  goals: 0,
  assists: 0,
  averageRating: null,
  yellowCards: 0,
  redCards: 0,
  wins: 0,
  draws: 0,
  losses: 0,
};

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Média aritmética das notas, ignorando partidas sem nota (nunca as trata como zero). */
export function averageRating(matches: readonly Pick<Match, "rating">[]): number | null {
  const rated = matches.map((m) => m.rating).filter((r): r is number => r !== null);
  if (rated.length === 0) return null;
  return round(rated.reduce((sum, r) => sum + r, 0) / rated.length, 2);
}

export function aggregate(matches: readonly Match[]): StatLine {
  if (matches.length === 0) return { ...EMPTY_STAT_LINE };
  const line = matches.reduce<StatLine>(
    (acc, m) => {
      const result = resultOf(m);
      return {
        ...acc,
        appearances: acc.appearances + 1,
        starts: acc.starts + (m.role === "starter" ? 1 : 0),
        minutes: acc.minutes + m.minutes,
        goals: acc.goals + m.goals,
        assists: acc.assists + m.assists,
        yellowCards: acc.yellowCards + m.yellowCards,
        redCards: acc.redCards + (m.redCard ? 1 : 0),
        wins: acc.wins + (result === "W" ? 1 : 0),
        draws: acc.draws + (result === "D" ? 1 : 0),
        losses: acc.losses + (result === "L" ? 1 : 0),
      };
    },
    { ...EMPTY_STAT_LINE },
  );
  return { ...line, averageRating: averageRating(matches) };
}

/**
 * Soma linhas de estatística. A média de notas é ponderada pelo número de jogos
 * de cada linha que possui nota.
 */
export function combine(lines: readonly StatLine[]): StatLine {
  let ratedApps = 0;
  let ratingSum = 0;
  const total = lines.reduce<StatLine>(
    (acc, l) => {
      if (l.averageRating !== null) {
        ratedApps += l.appearances;
        ratingSum += l.averageRating * l.appearances;
      }
      return {
        appearances: acc.appearances + l.appearances,
        starts: acc.starts + l.starts,
        minutes: acc.minutes + l.minutes,
        goals: acc.goals + l.goals,
        assists: acc.assists + l.assists,
        averageRating: null,
        yellowCards: acc.yellowCards + l.yellowCards,
        redCards: acc.redCards + l.redCards,
        wins: acc.wins + l.wins,
        draws: acc.draws + l.draws,
        losses: acc.losses + l.losses,
      };
    },
    { ...EMPTY_STAT_LINE },
  );
  return { ...total, averageRating: ratedApps > 0 ? round(ratingSum / ratedApps, 2) : null };
}

export function summaryToStatLine(summary: SeasonSummary): StatLine {
  const { season: _season, club: _club, ...line } = summary;
  return line;
}

export function per90(value: number, minutes: number): number {
  if (minutes <= 0) return 0;
  return round((value / minutes) * 90, 2);
}

export function winRate(line: Pick<StatLine, "wins" | "appearances">): number {
  if (line.appearances === 0) return 0;
  return round(line.wins / line.appearances, 3);
}

/** Últimos `n` resultados, do mais antigo para o mais recente (leitura natural da esquerda p/ direita). */
export function recentForm(
  matches: readonly Match[],
  n = 5,
): { matchId: string; result: MatchResult }[] {
  return sortByDateDesc(matches)
    .slice(0, n)
    .reverse()
    .map((m) => ({ matchId: m.id, result: resultOf(m) }));
}

export interface MonthlyBucket {
  month: string; // yyyy-mm
  goals: number;
  assists: number;
  appearances: number;
}

export function monthlyContributions(matches: readonly Match[]): MonthlyBucket[] {
  const buckets = new Map<string, MonthlyBucket>();
  for (const m of sortByDateAsc(matches)) {
    const month = m.date.slice(0, 7);
    const b = buckets.get(month) ?? { month, goals: 0, assists: 0, appearances: 0 };
    b.goals += m.goals;
    b.assists += m.assists;
    b.appearances += 1;
    buckets.set(month, b);
  }
  return [...buckets.values()];
}

export interface RatingPoint {
  matchId: string;
  date: string;
  opponent: string;
  rating: number;
}

export function ratingSeries(matches: readonly Match[]): RatingPoint[] {
  return sortByDateAsc(matches)
    .filter((m): m is Match & { rating: number } => m.rating !== null)
    .map((m) => ({ matchId: m.id, date: m.date, opponent: m.opponent, rating: m.rating }));
}

/** Maior sequência de jogos consecutivos (ordem cronológica) com gol. */
export function longestScoringStreak(matches: readonly Match[]): number {
  let best = 0;
  let current = 0;
  for (const m of sortByDateAsc(matches)) {
    current = m.goals > 0 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}

export interface MatchHighlights {
  bestRating?: Match;
  mostGoals?: Match;
  mostContributions?: Match;
}

export function matchHighlights(matches: readonly Match[]): MatchHighlights {
  const byRating = matches.filter((m) => m.rating !== null);
  const maxBy = (list: readonly Match[], score: (m: Match) => number) =>
    list.reduce<Match | undefined>(
      (best, m) => (!best || score(m) > score(best) ? m : best),
      undefined,
    );
  return {
    bestRating: maxBy(byRating, (m) => m.rating ?? 0),
    mostGoals: maxBy(
      matches.filter((m) => m.goals > 0),
      (m) => m.goals,
    ),
    mostContributions: maxBy(
      matches.filter((m) => m.goals + m.assists > 0),
      (m) => m.goals + m.assists,
    ),
  };
}

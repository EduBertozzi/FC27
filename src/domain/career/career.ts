import { type Fixture, type Match } from "../match/match";
import { type NewsArticle } from "../news/news";
import { type Player } from "../player/player";
import { type TimelineEvent } from "../timeline/events";

export interface ClubSpell {
  club: string;
  country: string;
  from: string; // temporada inicial, ex.: "2024/25"
  to?: string; // ausente = clube atual
  kind: "youth" | "permanent" | "loan";
  fee?: number;
}

export interface Trophy {
  id: string;
  name: string;
  season: string;
  club: string;
  kind: "league" | "cup" | "continental" | "national-team" | "other";
}

export interface Award {
  id: string;
  name: string;
  season: string;
  detail?: string;
}

export interface CareerRecord {
  id: string;
  label: string;
  value: string;
  context?: string;
}

/** Resumo de temporadas encerradas (as partidas individuais podem não existir no app). */
export interface SeasonSummary {
  season: string;
  club: string;
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  averageRating: number | null;
  yellowCards: number;
  redCards: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface OverallPoint {
  date: string;
  overall: number;
}

export type ObjectiveStatus = "active" | "done" | "failed";

/** Métricas que o app sabe recalcular automaticamente a partir das partidas. */
export type ObjectiveMetric =
  "season-goals" | "season-assists" | "season-appearances" | "season-contributions";

export interface Objective {
  id: string;
  title: string;
  /** Métrica de progresso opcional: alvo numérico e valor atual. */
  target?: number;
  current?: number;
  metric?: ObjectiveMetric;
  unit?: string;
  deadline?: string;
  status: ObjectiveStatus;
  source: "player" | "challenge";
}

export interface Career {
  id: string;
  createdAt: string;
  player: Player;
  currentClub: string;
  currentClubCountry: string;
  league: string;
  currentSeason: string;
  marketValue: number;
  contractUntil?: string;
  concept?: string;
  challenge?: string;
  clubHistory: ClubSpell[];
  trophies: Trophy[];
  awards: Award[];
  records: CareerRecord[];
  pastSeasons: SeasonSummary[];
  overallHistory: OverallPoint[];
  objectives: Objective[];
  matches: Match[];
  fixtures: Fixture[];
  events: TimelineEvent[];
  news: NewsArticle[];
}

export function currentSeasonMatches(career: Pick<Career, "matches" | "currentSeason">): Match[] {
  return career.matches.filter((m) => m.season === career.currentSeason);
}

export function nextFixture(
  career: Pick<Career, "fixtures">,
  afterDate: string,
): Fixture | undefined {
  return [...career.fixtures]
    .filter((f) => f.date >= afterDate)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function objectiveProgress(objective: Objective): number | null {
  if (objective.target === undefined || objective.current === undefined || objective.target <= 0)
    return null;
  return Math.min(1, Math.max(0, objective.current / objective.target));
}

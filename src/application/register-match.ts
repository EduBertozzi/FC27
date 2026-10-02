import {
  type Career,
  type Objective,
  type ObjectiveMetric,
  currentSeasonMatches,
} from "@/domain/career/career";
import { type Match } from "@/domain/match/match";
import { type MatchInput, matchInputSchema } from "@/domain/match/schema";
import { generateMatchNews } from "@/domain/news/generate";
import { displayName } from "@/domain/player/player";
import { POSITIONS } from "@/domain/player/positions";
import { type StatLine, aggregate, combine, summaryToStatLine } from "@/domain/stats/stats";
import { deriveMilestones } from "@/domain/timeline/milestones";
import { type TimelineEvent } from "@/domain/timeline/events";
import { type NewsArticle } from "@/domain/news/news";
import { type Result, AppError, err, ok } from "@/lib/result";

export function careerTotals(career: Pick<Career, "matches" | "pastSeasons">): StatLine {
  return combine([...career.pastSeasons.map(summaryToStatLine), aggregate(career.matches)]);
}

function metricValue(metric: ObjectiveMetric, season: StatLine): number {
  switch (metric) {
    case "season-goals":
      return season.goals;
    case "season-assists":
      return season.assists;
    case "season-appearances":
      return season.appearances;
    case "season-contributions":
      return season.goals + season.assists;
  }
}

/** Recalcula objetivos com métrica automática; objetivos manuais não são tocados. */
export function refreshObjectives(objectives: readonly Objective[], season: StatLine): Objective[] {
  return objectives.map((o) => {
    if (!o.metric || o.status !== "active") return o;
    const current = metricValue(o.metric, season);
    const done = o.target !== undefined && current >= o.target;
    return { ...o, current, status: done ? "done" : o.status };
  });
}

export interface RegisterMatchOutcome {
  career: Career;
  match: Match;
  events: TimelineEvent[];
  news: NewsArticle | null;
}

/**
 * Caso de uso: registrar partida.
 * Valida a entrada, cria a partida, deriva marcos e notícia, e recalcula objetivos.
 * Função pura — a persistência fica a cargo de quem chama (store/repositório).
 */
export function registerMatch(
  career: Career,
  rawInput: unknown,
  createId: (prefix: string) => string,
): Result<RegisterMatchOutcome, AppError> {
  const parsed = matchInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(
      new AppError("VALIDATION", "Dados da partida inválidos", {
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      }),
    );
  }
  const input: MatchInput = parsed.data;
  const match: Match = {
    ...input,
    id: createId("match"),
    careerId: career.id,
    season: career.currentSeason,
  };

  const before = careerTotals(career);
  const events = deriveMilestones(match, before, createId);
  const news = generateMatchNews(
    match,
    {
      name: displayName(career.player),
      club: career.currentClub,
      positionName: POSITIONS[career.player.position].name.toLowerCase(),
    },
    createId("news"),
  );

  const matches = [...career.matches, match];
  const seasonLine = aggregate(
    currentSeasonMatches({ matches, currentSeason: career.currentSeason }),
  );

  const updated: Career = {
    ...career,
    matches,
    fixtures: career.fixtures.filter(
      (f) => !(f.date === match.date && f.opponent.toLowerCase() === match.opponent.toLowerCase()),
    ),
    events: [...career.events, ...events],
    news: news ? [news, ...career.news] : career.news,
    objectives: refreshObjectives(career.objectives, seasonLine),
  };
  return ok({ career: updated, match, events, news });
}

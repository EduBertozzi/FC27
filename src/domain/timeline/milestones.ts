import { type Match } from "../match/match";
import { type StatLine } from "../stats/stats";
import { type TimelineEvent } from "./events";

const GOAL_MILESTONES = [10, 25, 50, 100, 150, 200, 300];
const APPEARANCE_MILESTONES = [50, 100, 200, 300, 500];

function crossed(before: number, after: number, marks: readonly number[]): number | undefined {
  return marks.find((mark) => before < mark && after >= mark);
}

/**
 * Deriva marcos da carreira gerados por uma nova partida.
 * `before` são os totais de carreira ANTES da partida (temporadas passadas + partidas registradas).
 * Usa apenas fatos da partida — nunca inventa contexto.
 */
export function deriveMilestones(
  match: Match,
  before: StatLine,
  createId: (prefix: string) => string,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const base = { date: match.date, season: match.season, matchId: match.id };
  const vs = `contra o ${match.opponent}`;

  if (before.appearances === 0) {
    events.push({
      ...base,
      id: createId("evt"),
      type: "debut",
      title: `Estreia profissional ${vs}`,
      highlight: true,
    });
  }
  if (before.goals === 0 && match.goals > 0) {
    events.push({
      ...base,
      id: createId("evt"),
      type: "first-goal",
      title: `Primeiro gol da carreira, ${vs}`,
      highlight: true,
    });
  }
  if (before.assists === 0 && match.assists > 0) {
    events.push({
      ...base,
      id: createId("evt"),
      type: "first-assist",
      title: `Primeira assistência da carreira, ${vs}`,
    });
  }
  if (match.goals >= 3) {
    const label = match.goals === 3 ? "Hat-trick" : `${match.goals} gols em um jogo`;
    events.push({
      ...base,
      id: createId("evt"),
      type: "record",
      title: `${label} ${vs}`,
      highlight: true,
    });
  }
  const goalMark = crossed(before.goals, before.goals + match.goals, GOAL_MILESTONES);
  if (goalMark) {
    events.push({
      ...base,
      id: createId("evt"),
      type: "milestone",
      title: `${goalMark}º gol na carreira`,
      description: `Marca alcançada ${vs}.`,
    });
  }
  const appMark = crossed(before.appearances, before.appearances + 1, APPEARANCE_MILESTONES);
  if (appMark) {
    events.push({
      ...base,
      id: createId("evt"),
      type: "milestone",
      title: `${appMark}º jogo como profissional`,
    });
  }
  if (match.rating !== null && match.rating >= 10) {
    events.push({
      ...base,
      id: createId("evt"),
      type: "special",
      title: `Atuação perfeita ${vs}`,
      description: "Nota 10 registrada.",
      highlight: true,
    });
  }
  if (match.redCard) {
    events.push({ ...base, id: createId("evt"), type: "special", title: `Expulso ${vs}` });
  }
  return events;
}

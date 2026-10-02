export const EVENT_TYPES = [
  "debut",
  "first-goal",
  "first-assist",
  "milestone",
  "transfer",
  "renewal",
  "call-up",
  "injury",
  "title",
  "award",
  "record",
  "rivalry",
  "interview",
  "special",
] as const;

export type TimelineEventType = (typeof EVENT_TYPES)[number];

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  season: string;
  title: string;
  description?: string;
  /** Destaque visual na timeline (capítulos da carreira). */
  highlight?: boolean;
  matchId?: string;
}

export const EVENT_TYPE_LABEL: Record<TimelineEventType, string> = {
  debut: "Estreia",
  "first-goal": "Primeiro gol",
  "first-assist": "Primeira assistência",
  milestone: "Marca histórica",
  transfer: "Transferência",
  renewal: "Renovação",
  "call-up": "Convocação",
  injury: "Lesão",
  title: "Título",
  award: "Prêmio",
  record: "Recorde",
  rivalry: "Rivalidade",
  interview: "Entrevista",
  special: "Momento especial",
};

/** Agrupa por temporada mantendo a ordem cronológica decrescente. */
export function groupBySeason(
  events: readonly TimelineEvent[],
): { season: string; events: TimelineEvent[] }[] {
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));
  const groups = new Map<string, TimelineEvent[]>();
  for (const event of sorted) {
    const list = groups.get(event.season) ?? [];
    list.push(event);
    groups.set(event.season, list);
  }
  return [...groups.entries()].map(([season, list]) => ({ season, events: list }));
}

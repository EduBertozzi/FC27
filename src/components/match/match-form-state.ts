import { type MatchRole, type Venue } from "@/domain/match/match";
import { type MatchInput } from "@/domain/match/schema";

/** Estado do formulário: números sempre definidos para os steppers; nota pode ficar vazia. */
export interface MatchFormValues {
  date: string;
  competition: string;
  opponent: string;
  venue: Venue | undefined;
  goalsFor: number;
  goalsAgainst: number;
  role: MatchRole | undefined;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
  hasRating: boolean;
  yellowCards: number;
  redCard: boolean;
  substitutionMinute: string;
  notes: string;
}

export function initialValues(
  date: string,
  prefill: Partial<MatchFormValues> = {},
): MatchFormValues {
  return {
    date,
    competition: "",
    opponent: "",
    venue: undefined,
    goalsFor: 0,
    goalsAgainst: 0,
    role: "starter",
    minutes: 90,
    goals: 0,
    assists: 0,
    rating: 7,
    hasRating: true,
    yellowCards: 0,
    redCard: false,
    substitutionMinute: "",
    notes: "",
    ...prefill,
  };
}

export function toMatchInput(v: MatchFormValues): Record<string, unknown> {
  const sub = v.substitutionMinute.trim() ? Number(v.substitutionMinute) : undefined;
  return {
    date: v.date,
    competition: v.competition,
    opponent: v.opponent,
    venue: v.venue,
    goalsFor: v.goalsFor,
    goalsAgainst: v.goalsAgainst,
    role: v.role,
    minutes: v.minutes,
    goals: v.goals,
    assists: v.assists,
    rating: v.hasRating ? v.rating : null,
    yellowCards: v.yellowCards,
    redCard: v.redCard,
    substitutionMinute: Number.isFinite(sub) ? sub : undefined,
    notes: v.notes.trim() || undefined,
  };
}

/** Aplica somente os campos extraídos da voz — nunca preenche o que não foi dito. */
export function applyExtraction(v: MatchFormValues, fields: Partial<MatchInput>): MatchFormValues {
  const next = { ...v };
  if (fields.competition !== undefined) next.competition = fields.competition;
  if (fields.opponent !== undefined) next.opponent = fields.opponent;
  if (fields.venue !== undefined) next.venue = fields.venue;
  if (fields.goalsFor !== undefined) next.goalsFor = fields.goalsFor;
  if (fields.goalsAgainst !== undefined) next.goalsAgainst = fields.goalsAgainst;
  if (fields.role !== undefined) next.role = fields.role;
  if (fields.minutes !== undefined) next.minutes = fields.minutes;
  if (fields.goals !== undefined) next.goals = fields.goals;
  if (fields.assists !== undefined) next.assists = fields.assists;
  if (fields.rating !== undefined && fields.rating !== null) {
    next.rating = fields.rating;
    next.hasRating = true;
  } else {
    next.hasRating = false;
  }
  if (fields.yellowCards !== undefined) next.yellowCards = fields.yellowCards;
  if (fields.redCard !== undefined) next.redCard = fields.redCard;
  return next;
}

export type FieldErrors = Partial<Record<keyof MatchInput, string>>;

export function issuesToErrors(issues: unknown): FieldErrors {
  const errors: FieldErrors = {};
  if (!Array.isArray(issues)) return errors;
  for (const issue of issues as { path: string; message: string }[]) {
    const key = issue.path.split(".")[0] as keyof MatchInput;
    errors[key] ??= issue.message;
  }
  return errors;
}

export const FIELD_LABELS: Partial<Record<keyof MatchInput, string>> = {
  date: "Data",
  competition: "Competição",
  opponent: "Adversário",
  venue: "Casa/fora",
  goalsFor: "Placar",
  goalsAgainst: "Placar",
  role: "Titular/reserva",
  minutes: "Minutos",
  goals: "Gols",
  assists: "Assistências",
  rating: "Nota",
  substitutionMinute: "Minuto da substituição",
  notes: "Observações",
};

import { type MatchInput } from "@/domain/match/schema";

import {
  type ExtractableField,
  type ExtractionContext,
  type ExtractionResult,
  type MatchExtractor,
} from "./types";

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  nenhum: 0,
  nenhuma: 0,
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  três: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
};

const NUM = "(\\d+|zero|nenhuma?|uma?|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)";

function toNumber(token: string | undefined): number | undefined {
  if (!token) return undefined;
  const t = token.toLowerCase();
  if (/^\d+$/.test(t)) return Number(t);
  return NUMBER_WORDS[t];
}

const COMPETITION_ALIASES: { pattern: RegExp; name: string }[] = [
  { pattern: /champions/i, name: "Champions League" },
  { pattern: /liga europa|europa league/i, name: "Liga Europa" },
  { pattern: /conference/i, name: "Conference League" },
  { pattern: /ta[çc]a da liga/i, name: "Taça da Liga" },
  { pattern: /ta[çc]a de portugal/i, name: "Taça de Portugal" },
  { pattern: /copa do brasil/i, name: "Copa do Brasil" },
  { pattern: /libertadores/i, name: "Libertadores" },
  { pattern: /brasileir[ãa]o/i, name: "Brasileirão" },
  { pattern: /premier league/i, name: "Premier League" },
  { pattern: /amistoso/i, name: "Amistoso" },
];

const REQUIRED: ExtractableField[] = [
  "competition",
  "opponent",
  "venue",
  "goalsFor",
  "goalsAgainst",
  "role",
  "minutes",
];

const FIELD_LABEL: Partial<Record<ExtractableField, string>> = {
  competition: "a competição",
  opponent: "o adversário",
  venue: "se o jogo foi em casa ou fora",
  goalsFor: "o placar",
  goalsAgainst: "o placar",
  role: "se você foi titular ou reserva",
  minutes: "quantos minutos jogou",
};

/**
 * Extrator determinístico para pt-BR. Reconhece somente o que foi dito; campos
 * não mencionados ficam ausentes e viram perguntas. Serve como implementação de
 * referência (e fallback offline) do futuro extrator baseado em LLM.
 */
export function extractMatchFromText(
  transcript: string,
  context: ExtractionContext,
): ExtractionResult {
  const text = transcript.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const fields: Partial<MatchInput> = {};

  // Adversário: "contra o Arsenal", "com o Benfica", "para o Porto"
  // Pontuação encerra o nome ("…o Porto. Fui titular" → "Porto").
  const opp = text.match(
    /\b(?:contra|com|para)\s+(?:o|a|os|as)\s+([A-ZÀ-Ý][\wÀ-ÿ'-]*(?:\s+(?:(?:de|da|do|del)\s+)?[A-ZÀ-Ý][\wÀ-ÿ'-]*)*)/,
  );
  if (opp?.[1]) fields.opponent = opp[1].trim();

  // Placar com verbo de resultado
  const score = lower.match(
    new RegExp(`(ganhamos|vencemos|perdemos|empatamos)\\s+(?:de|por|em)?\\s*${NUM}\\s+a\\s+${NUM}`),
  );
  if (score) {
    const a = toNumber(score[2]);
    const b = toNumber(score[3]);
    if (a !== undefined && b !== undefined) {
      const high = Math.max(a, b);
      const low = Math.min(a, b);
      if (score[1] === "perdemos") {
        fields.goalsFor = low;
        fields.goalsAgainst = high;
      } else {
        fields.goalsFor = high;
        fields.goalsAgainst = low;
      }
    }
  }

  // Gols e assistências
  const hatTrick = /hat[- ]?trick/.test(lower);
  const goals = lower.match(new RegExp(`(?:fiz|marquei|anotei)\\s+${NUM}\\s+gols?`));
  if (hatTrick) fields.goals = 3;
  else if (goals) fields.goals = toNumber(goals[1]);
  else if (/n[ãa]o (?:fiz|marquei) (?:nenhum )?gol/.test(lower)) fields.goals = 0;

  const assists = lower.match(new RegExp(`(?:dei|fiz)\\s+${NUM}\\s+assist[eê]ncias?`));
  if (assists) fields.assists = toNumber(assists[1]);
  else if (/n[ãa]o dei (?:nenhuma )?assist/.test(lower)) fields.assists = 0;

  // Nota: "nota nove", "nota 8,5", "nota seis e meio"
  const rating = lower.match(
    new RegExp(`nota\\s+(\\d+(?:[.,]\\d)?|${NUM.slice(1, -1)})(\\s+e\\s+meio)?`),
  );
  if (rating?.[1]) {
    const base =
      rating[1].includes(",") || rating[1].includes(".")
        ? Number(rating[1].replace(",", "."))
        : toNumber(rating[1]);
    if (base !== undefined) fields.rating = Math.min(10, base + (rating[2] ? 0.5 : 0));
  }

  // Minutos
  const minutes = lower.match(new RegExp(`${NUM}\\s+minutos`));
  if (minutes) fields.minutes = toNumber(minutes[1]);
  else if (/(jogo|partida) (?:inteir[oa]|tod[oa])/.test(lower)) fields.minutes = 90;

  // Titular / reserva
  if (/(entrei|sa[ií] do banco|vim do banco|reserva)/.test(lower)) fields.role = "substitute";
  else if (/(titular|comecei jogando|comecei como titular)/.test(lower)) fields.role = "starter";

  // Mando
  if (/fora de casa|\bfora\b|como visitante/.test(lower)) fields.venue = "away";
  else if (/em casa|nosso est[áa]dio|como mandante/.test(lower)) fields.venue = "home";

  // Cartões
  if (/(dois amarelos|segundo amarelo)/.test(lower)) {
    fields.yellowCards = 2;
    fields.redCard = true;
  } else if (/amarelo/.test(lower)) fields.yellowCards = 1;
  if (/(vermelho|expuls)/.test(lower)) fields.redCard = true;

  // Competição: conhecidas na carreira primeiro, depois apelidos comuns
  const known = context.knownCompetitions.find((c) => lower.includes(c.toLowerCase()));
  const alias = COMPETITION_ALIASES.find((a) => a.pattern.test(text));
  if (known) fields.competition = known;
  else if (alias) fields.competition = alias.name;

  const missing = REQUIRED.filter((f) => fields[f] === undefined);
  return { transcript: text, fields, missing, questions: buildQuestions(fields, missing) };
}

function buildQuestions(fields: Partial<MatchInput>, missing: ExtractableField[]): string[] {
  const informed = [
    fields.opponent ? "o adversário" : null,
    fields.goalsFor !== undefined ? "o resultado" : null,
  ].filter(Boolean);
  const labels = [...new Set(missing.map((f) => FIELD_LABEL[f]).filter(Boolean))] as string[];
  const questions: string[] = [];
  if (labels.length > 0) {
    const prefix =
      informed.length > 0
        ? `Você informou ${informed.join(" e ")}, mas não informou `
        : "Não identifiquei ";
    questions.push(`${prefix}${joinPt(labels)}. Complete antes de salvar.`);
  }
  if (fields.rating === undefined)
    questions.push("Você não informou a nota. Deseja deixar esse campo vazio?");
  return questions;
}

function joinPt(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`;
}

export class RuleBasedMatchExtractor implements MatchExtractor {
  readonly id = "rule-based";
  async extract(transcript: string, context: ExtractionContext): Promise<ExtractionResult> {
    return extractMatchFromText(transcript, context);
  }
}

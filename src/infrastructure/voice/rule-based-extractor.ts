import { type MatchInput } from "@/domain/match/schema";

import {
  buildIndex,
  CLUBS,
  COMPETITIONS,
  findMentions,
  fuzzyMatch,
  type LexiconHit,
} from "./football-lexicon";
import { fold, normalizeSpoken } from "./spoken-text";
import {
  type ExtractableField,
  type ExtractionContext,
  type ExtractionResult,
  type MatchExtractor,
} from "./types";

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

/** Palavras que encerram um nome de adversário falado ("contra o porto em casa"). */
const NAME_STOP = new Set(
  (
    "e de do da dos das em no na nos nas pelo pela por fora casa ganhamos vencemos perdemos " +
    "empatamos ganhei perdi fiz foi com pra pro para que o a os as nota jogando jogo hoje ontem " +
    "aqui la eu ele mas porque quando onde gol gols"
  ).split(" "),
);

const WIN = /\b(ganh(?:amos|ei|ou)|venc(?:emos|i|eu)|vitoria|golea(?:mos|da)|batemos|metemos)\b/g;
const LOSS = /\b(perd(?:emos|i|eu)|derrota|tomamos|levamos|fomos (?:derrotados|goleados))\b/g;

function titleCase(words: string[]): string {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function lastMatch(re: RegExp, text: string): RegExpMatchArray | undefined {
  return [...text.matchAll(re)].at(-1);
}

/**
 * Extrator determinístico para pt-BR que entende o jeito de falar de futebol:
 * números por extenso ("três a um"), placar com "x", apelidos e erros comuns
 * de clubes ("baiern", "barça"), gírias ("hat-trick", "passei em branco"),
 * entrada e saída do banco ("entrei aos 60"). Só preenche o que foi dito;
 * o que faltar vira pergunta. É também o fallback offline de um extrator com LLM.
 */
export function extractMatchFromText(
  transcript: string,
  context: ExtractionContext,
): ExtractionResult {
  const text = transcript.replace(/\s+/g, " ").trim();
  const n = normalizeSpoken(text);
  const fields: Partial<MatchInput> = {};
  const extraQuestions: string[] = [];

  // ── Clubes ────────────────────────────────────────────────────────────────
  const ownClub = context.ownClub?.trim() || undefined;
  const clubIndex = buildIndex(CLUBS, [
    ...(context.knownOpponents ?? []),
    ...(ownClub ? [ownClub] : []),
  ]);
  const ownName = ownClub ? clubIndex.get(fold(ownClub)) : undefined;
  const isOwn = (name: string) => ownName !== undefined && name === ownName;
  const clubs = findMentions(n, clubIndex);

  fields.opponent = pickOpponent(n, clubs, clubIndex, isOwn);

  // ── Placar ────────────────────────────────────────────────────────────────
  const score = readScore(n, clubs, isOwn);
  if (score.kind === "known") {
    fields.goalsFor = score.goalsFor;
    fields.goalsAgainst = score.goalsAgainst;
  } else if (score.kind === "ambiguous") {
    extraQuestions.push(
      `Ouvi o placar ${score.a} a ${score.b}, mas não ficou claro quem venceu. Diga “ganhamos” ou “perdemos”, ou ajuste no formulário.`,
    );
  }

  // ── Gols do jogador ───────────────────────────────────────────────────────
  const goals = readGoals(n);
  if (goals !== undefined) fields.goals = goals;

  // ── Assistências ──────────────────────────────────────────────────────────
  const assists = readAssists(n);
  if (assists !== undefined) fields.assists = assists;

  // ── Nota ──────────────────────────────────────────────────────────────────
  const rating = readRating(n);
  if (rating !== undefined) fields.rating = rating;

  // ── Titular/reserva, minutos e substituição ───────────────────────────────
  Object.assign(fields, readParticipation(n));

  // ── Mando ─────────────────────────────────────────────────────────────────
  if (/\b(campo|estadio) neutro\b/.test(n)) fields.venue = "neutral";
  else if (
    /\b(fora de casa|visitantes?|casa deles|estadio deles|campo deles|(?:jog\w+|partida|jogo|foi|era) (?:la )?fora)\b/.test(
      n,
    )
  )
    fields.venue = "away";
  else if (
    /\b(em casa|nossa casa|nosso estadio|nosso campo|mandantes?|nossa torcida|jogamos em casa)\b/.test(
      n,
    )
  )
    fields.venue = "home";

  // ── Cartões (só os do jogador, em primeira pessoa) ────────────────────────
  if (/\b(nao (?:levei|tomei|recebi) (?:nenhum )?cart\w*|sem cart\w*)\b/.test(n)) {
    fields.yellowCards = 0;
    fields.redCard = false;
  }
  if (/\b(?:levei|tomei|recebi) (?:os )?2 (?:cartoes )?amarelos\b|\bsegundo amarelo\b/.test(n)) {
    fields.yellowCards = 2;
    fields.redCard = true;
  } else if (
    /\b(?:levei|tomei|recebi) (?:o |um |1 )?(?:cartao )?amarelo\b|\b(?:fui )?amarelado\b/.test(n)
  ) {
    fields.yellowCards = 1;
  }
  if (
    /\b(fui expulso|me expulsaram|(?:levei|tomei|recebi) (?:o |um |1 )?(?:cartao )?vermelho)\b/.test(
      n,
    )
  )
    fields.redCard = true;

  // ── Competição ────────────────────────────────────────────────────────────
  const compIndex = buildIndex(COMPETITIONS, [
    ...context.knownCompetitions,
    ...(context.league ? [context.league] : []),
  ]);
  const competition = findMentions(n, compIndex)[0];
  if (competition) fields.competition = competition.name;
  else if (context.league && /\b(?:pela|pelo|na|no|da|do) (?:liga|campeonato)\b|\brodada\b/.test(n))
    fields.competition = context.league;

  if (fields.opponent === undefined) delete fields.opponent;
  const missing = REQUIRED.filter((f) => fields[f] === undefined);
  return {
    transcript: text,
    fields,
    missing,
    questions: [...extraQuestions, ...buildQuestions(fields, missing)],
  };
}

function pickOpponent(
  n: string,
  clubs: LexiconHit[],
  index: Map<string, string>,
  isOwn: (name: string) => boolean,
): string | undefined {
  // "gol contra" não é adversário
  const cueRe =
    /(?<!gol )\b(?:contra|enfrent\w+|diante d[oa]s?|versus|vs|x|pegamos)\s+(?:(?:o|a|os|as)\s+)?/g;
  const cues = [...n.matchAll(cueRe)].map((m) => m.index + m[0].length);
  const others = clubs.filter((c) => !isOwn(c.name));
  const afterCue = others.find((c) => cues.some((pos) => c.index >= pos && c.index - pos <= 2));
  if (afterCue) return afterCue.name;
  if (others[0]) return others[0].name;

  // Sem nome conhecido: aproxima a palavra logo após "contra" ou usa o que foi dito.
  for (const pos of cues) {
    const words: string[] = [];
    for (const word of n.slice(pos).split(" ")) {
      if (!word || NAME_STOP.has(word) || /\d/.test(word) || words.length === 3) break;
      words.push(word);
    }
    if (words.length === 0) continue;
    const fuzzy = fuzzyMatch(words[0]!, index);
    if (fuzzy && !isOwn(fuzzy)) return fuzzy;
    const raw = titleCase(words);
    if (!isOwn(raw)) return raw;
  }
  return undefined;
}

type ScoreReading =
  | { kind: "none" }
  | { kind: "known"; goalsFor: number; goalsAgainst: number }
  | { kind: "ambiguous"; a: number; b: number };

function readScore(n: string, clubs: LexiconHit[], isOwn: (name: string) => boolean): ScoreReading {
  if (/\b(empat\w+|empate) (?:sem gols|de 0 a 0|0 a 0)\b|\b0 a 0\b/.test(n)) {
    return { kind: "known", goalsFor: 0, goalsAgainst: 0 };
  }
  const m = [...n.matchAll(/\b(\d{1,2}) a (\d{1,2})\b(?! minutos)/g)].find(
    (x) => Number(x[1]) <= 30 && Number(x[2]) <= 30,
  );
  if (!m) return { kind: "none" };
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === b) return { kind: "known", goalsFor: a, goalsAgainst: b };
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  const won = { kind: "known", goalsFor: high, goalsAgainst: low } as const;
  const lost = { kind: "known", goalsFor: low, goalsAgainst: high } as const;

  const start = m.index;
  const end = start + m[0].length;
  const before = n.slice(Math.max(0, start - 60), start);
  const after = n.slice(end, end + 30);

  // Verbo de resultado mais próximo antes do placar
  const win = lastMatch(WIN, before);
  const loss = lastMatch(LOSS, before);
  const verb = win && loss ? ((win.index ?? 0) > (loss.index ?? 0) ? win : loss) : (win ?? loss);
  if (verb) {
    const isWin = verb === win;
    // "o Porto ganhou de 2 a 1" — sujeito é o adversário
    const thirdPerson = /(ou|eu)$/.test(verb[1] ?? "");
    const verbPos = start - before.length + (verb.index ?? 0);
    const subject = [...clubs].reverse().find((c) => c.index < verbPos && verbPos - c.index < 30);
    const opponentDidIt = thirdPerson && subject !== undefined && !isOwn(subject.name);
    return isWin !== opponentDidIt ? won : lost;
  }

  // "3 a 1 pra gente" / "3 a 1 pra eles" / "3 a 1 pro Porto"
  if (/^ (?:pra|para|a favor d)(?:a|o)? (?:gente|nos|nosso time|o nosso time)\b/.test(after))
    return won;
  if (/^ (?:pra|para|pro)(?: o| a)? (?:eles|adversario|time deles)\b/.test(after)) return lost;
  const club = clubs.find((c) => c.index >= end && c.index - end <= 12);
  if (club && /^ (?:pra|para|pro)\b/.test(after)) return isOwn(club.name) ? won : lost;

  // "Sporting 3 a 1 Porto": o time citado logo antes do placar é o dono do primeiro número
  const leading = [...clubs].reverse().find((c) => c.index < start && start - c.index <= 25);
  if (leading) {
    return isOwn(leading.name)
      ? { kind: "known", goalsFor: a, goalsAgainst: b }
      : { kind: "known", goalsFor: b, goalsAgainst: a };
  }
  return { kind: "ambiguous", a, b };
}

function readGoals(n: string): number | undefined {
  if (
    /\b(nao (?:fiz|marquei|anotei)(?: nenhum)? gol|nao marquei|passei em branco|nao balancei a rede|sem marcar)\b/.test(
      n,
    )
  )
    return 0;
  if (/\b[hr][ae]t ?tri(?:ck|k|que|qui)\b|\btriplet[ae]\b/.test(n)) return 3;
  if (/\bpoker\b/.test(n)) return 4;
  if (/\b(doblete|dobradinha)\b/.test(n)) return 2;

  const verb = "(?:fiz|marquei|anotei|meti|deixei|guardei|botei|coloquei|balancei a rede)";
  const counted = n.match(
    new RegExp(`\\b${verb} (?:os |mais )?(\\d{1,2}) (?:gols?|golacos?|vezes)\\b`),
  );
  const plusOther = /\b(?:e|mais) (?:o )?outro(?: gol)?\b/.test(n);
  if (counted) return Number(counted[1]);
  // "fiz 2 e dei 1 assistência"
  const pair = n.match(new RegExp(`\\b${verb} (\\d{1,2}) e (?:dei |fiz )?\\d{1,2} assist`));
  if (pair) return Number(pair[1]);
  const mine = n.match(/\b(\d{1,2}) gols? (?:meus|pra mim|na minha conta)\b/);
  if (mine) return Number(mine[1]);
  // "fiz o gol", "fiz gol", "marquei de cabeça", "meti um golaço" ("1" já normalizado)
  if (
    new RegExp(
      `\\b${verb} (?:o |1 )?(?:gol|golaco)\\b|\\bmarquei (?:de|na|no) (?:cabeca|falta|penalti|bicicleta|voleio|fora)`,
    ).test(n)
  )
    return plusOther ? 2 : 1;
  return undefined;
}

function readAssists(n: string): number | undefined {
  if (/\bnao (?:dei|fiz|tive)(?: nenhuma)? assistencias?\b|\bsem assistencias?\b/.test(n)) return 0;
  const counted = n.match(
    /\b(\d{1,2}) (?:assistencias?|passes? (?:pra|para|de) gol|passes? decisivos?)\b/,
  );
  if (counted) return Number(counted[1]);
  if (
    /\b(?:dei|fiz|tive|com) (?:a |uma )?assistencia\b|\bdei o passe (?:pro|para o|pra) gol\b|\bdei (?:a|o) assistencia\b/.test(
      n,
    )
  )
    return 1;
  return undefined;
}

function readRating(n: string): number | undefined {
  const tryValue = (raw: string | undefined, extra?: string) => {
    if (!raw) return undefined;
    let value = Number(raw);
    // "nota 7 8" = 7,8 (como aparece no jogo)
    if (extra !== undefined && !raw.includes(".") && value < 10) value = Number(`${raw}.${extra}`);
    return value >= 1 && value <= 10 ? Math.round(value * 10) / 10 : undefined;
  };
  const m = n.match(
    /\b(?:nota|avaliacao|rating)(?: (?:foi|de|final|do jogo|minha|ficou|deu|em|um|uma))* (\d{1,2}(?:\.\d)?)(?: (\d)\b(?! (?:gols?|assist|minutos|amarel)))?/,
  );
  if (m) return tryValue(m[1], m[2]);
  const t = n.match(
    /\b(?:tirei|fiquei com|recebi) (\d{1,2}(?:\.\d)?)\b(?! (?:gols?|assist|minutos))/,
  );
  return t ? tryValue(t[1]) : undefined;
}

function readParticipation(n: string): Partial<MatchInput> {
  const out: Partial<MatchInput> = {};
  const subIn = n.match(/\bentrei (?:aos|ao|com|no minuto|no|na|em) ?(?:minuto )?(\d{1,3})\b/);
  const subOut = n.match(
    /\b(?:sai|fui substituido|fui sacado|me tiraram|me substituiram) (?:aos|ao|com|no minuto|no|na) ?(?:minuto )?(\d{1,3})\b/,
  );

  if (/\bnao (?:fui|comecei) (?:como )?titular\b/.test(n)) out.role = "substitute";
  else if (/\b(titular|comecei jogando|comecei o jogo)\b/.test(n)) out.role = "starter";
  else if (/\b(reserva|banco|entrei)\b/.test(n)) out.role = "substitute";
  else if (subOut) out.role = "starter";

  if (subIn && Number(subIn[1]) < 120) {
    const minute = Number(subIn[1]);
    out.role = "substitute";
    out.substitutionMinute = minute;
    out.minutes = Math.max(1, 90 - minute);
  } else if (/\bentrei no intervalo\b/.test(n)) {
    out.role = "substitute";
    out.minutes = 45;
  }
  if (subOut && Number(subOut[1]) <= 130) {
    out.substitutionMinute = Number(subOut[1]);
    out.minutes = Number(subOut[1]);
  }

  // Minutos ditos explicitamente prevalecem ("joguei 30 minutos")
  const explicit =
    n.match(/\bjoguei (?:uns |os )?(\d{1,3})(?: minutos)?\b/) ??
    n.match(/(?<!\b(?:aos|ao|com|minuto) )\b(\d{1,3}) minutos\b/);
  if (explicit && Number(explicit[1]) >= 1 && Number(explicit[1]) <= 130) {
    out.minutes = Number(explicit[1]);
  } else if (
    out.minutes === undefined &&
    /\b(jogo|partida) (inteir[oa]|tod[oa])\b|\bjoguei tudo\b|\bos 90\b/.test(n)
  ) {
    out.minutes = 90;
  }
  return out;
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

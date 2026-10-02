import { editDistance, fold } from "./spoken-text";

/**
 * Vocabulário de futebol para entender fala transcrita: nomes de clubes e
 * competições com apelidos e erros comuns do reconhecimento de voz
 * ("baiern" → Bayern, "liga dos campeões" → Champions League).
 * Só nomes — nenhum escudo, logo ou marca é usado.
 */

export interface LexiconEntry {
  name: string;
  /** Formas faladas, já sem acento e em minúsculas. O próprio nome entra automaticamente. */
  aliases: string[];
}

export const CLUBS: LexiconEntry[] = [
  // Inglaterra
  { name: "Arsenal", aliases: ["arsenau", "gunners"] },
  { name: "Aston Villa", aliases: ["aston vila", "villa"] },
  { name: "Chelsea", aliases: ["chelsi", "tchelsi", "chelse"] },
  { name: "Everton", aliases: [] },
  { name: "Liverpool", aliases: ["liverpul", "liverpoll", "liverpol"] },
  { name: "Manchester City", aliases: ["man city", "city", "manchester siti", "siti"] },
  {
    name: "Manchester United",
    aliases: ["man united", "united", "manchester iunaited", "manchester unaited", "manchester u"],
  },
  { name: "Newcastle", aliases: ["newcastle united", "niucastle", "nilcastle"] },
  { name: "Tottenham", aliases: ["spurs", "totenham", "totem", "totten"] },
  { name: "West Ham", aliases: ["uest ham", "west hem"] },
  { name: "Brighton", aliases: ["braiton"] },
  { name: "Leicester", aliases: ["leicester city", "lester"] },
  { name: "Nottingham Forest", aliases: ["nottingham", "forest"] },
  // Espanha
  { name: "Real Madrid", aliases: ["real madri", "real", "merengue"] },
  { name: "Barcelona", aliases: ["barca", "barsa", "barcelo", "barselona"] },
  { name: "Atlético de Madrid", aliases: ["atletico de madri", "atletico madrid", "atleti"] },
  { name: "Sevilla", aliases: ["sevilha"] },
  { name: "Valencia", aliases: ["valencia cf"] },
  { name: "Villarreal", aliases: ["villareal", "vila real", "vilarreal"] },
  { name: "Real Sociedad", aliases: ["sociedad"] },
  { name: "Real Betis", aliases: ["betis"] },
  { name: "Athletic Bilbao", aliases: ["athletic club", "bilbao"] },
  { name: "Girona", aliases: [] },
  // Itália
  { name: "Juventus", aliases: ["juve", "juventos"] },
  { name: "Milan", aliases: ["ac milan", "mila"] },
  { name: "Inter de Milão", aliases: ["inter de milao", "internazionale", "inter milan", "inter"] },
  { name: "Napoli", aliases: ["napoles"] },
  { name: "Roma", aliases: ["as roma"] },
  { name: "Lazio", aliases: ["lacio"] },
  { name: "Atalanta", aliases: [] },
  { name: "Fiorentina", aliases: [] },
  // Alemanha
  { name: "Bayern de Munique", aliases: ["bayern", "baiern", "bairen", "baien", "bayern munique"] },
  { name: "Borussia Dortmund", aliases: ["dortmund", "borussia", "dortimund"] },
  { name: "Bayer Leverkusen", aliases: ["leverkusen", "leverkuzen"] },
  { name: "RB Leipzig", aliases: ["leipzig", "laipzig", "laiptzig"] },
  { name: "Stuttgart", aliases: ["estugarte", "stutgart"] },
  { name: "Eintracht Frankfurt", aliases: ["frankfurt", "eintracht"] },
  // França
  { name: "Paris Saint-Germain", aliases: ["psg", "paris saint germain", "paris", "pe esse ge"] },
  { name: "Olympique de Marseille", aliases: ["marseille", "marselha", "olympique"] },
  { name: "Lyon", aliases: ["olympique lyon", "lion", "olympique de lyon"] },
  { name: "Monaco", aliases: [] },
  { name: "Lille", aliases: ["lil"] },
  // Portugal
  { name: "Benfica", aliases: ["benfika", "bemfica"] },
  { name: "FC Porto", aliases: ["porto"] },
  { name: "Sporting", aliases: ["sporting cp", "sporting de lisboa", "esporting"] },
  { name: "Braga", aliases: ["sporting de braga", "sc braga"] },
  { name: "Vitória de Guimarães", aliases: ["vitoria de guimaraes", "guimaraes"] },
  // Holanda / outros europeus
  { name: "Ajax", aliases: ["ajacs", "aiax"] },
  { name: "PSV", aliases: ["psv eindhoven", "pe esse ve"] },
  { name: "Feyenoord", aliases: ["feyenord", "feienord"] },
  { name: "Celtic", aliases: ["celtics", "seltic"] },
  { name: "Rangers", aliases: [] },
  { name: "Galatasaray", aliases: ["galatasarai"] },
  { name: "Fenerbahçe", aliases: ["fenerbahce", "fenerbace"] },
  { name: "Club Brugge", aliases: ["brugge", "bruges"] },
  // Brasil
  { name: "Flamengo", aliases: ["mengao", "fla"] },
  { name: "Palmeiras", aliases: ["verdao", "palmeira"] },
  { name: "Corinthians", aliases: ["corintians", "corinthians paulista", "timao"] },
  { name: "São Paulo", aliases: ["sao paulo", "tricolor paulista"] },
  { name: "Santos", aliases: ["peixe"] },
  { name: "Fluminense", aliases: ["flu"] },
  { name: "Vasco", aliases: ["vasco da gama"] },
  { name: "Botafogo", aliases: ["fogao"] },
  { name: "Grêmio", aliases: ["gremio"] },
  { name: "Internacional", aliases: ["colorado"] },
  { name: "Atlético Mineiro", aliases: ["atletico mineiro", "galo", "atletico mg"] },
  { name: "Cruzeiro", aliases: [] },
  { name: "Bahia", aliases: [] },
  { name: "Athletico Paranaense", aliases: ["athletico paranaense", "atletico paranaense"] },
  { name: "Fortaleza", aliases: [] },
  // Argentina e outros
  { name: "Boca Juniors", aliases: ["boca junior"] },
  { name: "River Plate", aliases: ["river", "river pleite"] },
  { name: "Al-Hilal", aliases: ["al hilal", "hilal"] },
  { name: "Al-Nassr", aliases: ["al nassr", "al nasser", "nassr"] },
  { name: "Inter Miami", aliases: ["inter miame"] },
];

export const COMPETITIONS: LexiconEntry[] = [
  {
    name: "Champions League",
    aliases: ["liga dos campeoes", "uefa champions", "champions", "champion", "tchampions"],
  },
  { name: "Liga Europa", aliases: ["europa league", "uefa europa"] },
  { name: "Conference League", aliases: ["conference", "liga conferencia"] },
  { name: "Premier League", aliases: ["premier", "premiere league", "campeonato ingles"] },
  { name: "La Liga", aliases: ["laliga", "campeonato espanhol"] },
  { name: "Serie A", aliases: ["calcio", "campeonato italiano", "serie a italiana"] },
  { name: "Bundesliga", aliases: ["bundes", "campeonato alemao"] },
  { name: "Ligue 1", aliases: ["ligue un", "liga francesa", "campeonato frances"] },
  {
    name: "Liga Portugal",
    aliases: ["primeira liga", "liga betclic", "campeonato portugues", "liga portuguesa"],
  },
  { name: "Eredivisie", aliases: ["campeonato holandes"] },
  { name: "Brasileirão", aliases: ["brasileirao", "campeonato brasileiro", "serie a do brasil"] },
  { name: "Copa do Brasil", aliases: [] },
  { name: "Libertadores", aliases: ["copa libertadores", "liberta"] },
  { name: "Sul-Americana", aliases: ["sul americana", "copa sul americana", "sulamericana"] },
  { name: "Copa do Rei", aliases: ["copa del rey"] },
  { name: "FA Cup", aliases: ["copa da inglaterra", "efe a cup"] },
  { name: "Carabao Cup", aliases: ["carabao", "copa da liga inglesa", "efl cup"] },
  { name: "Copa da Itália", aliases: ["copa da italia", "coppa italia"] },
  { name: "Copa da Alemanha", aliases: ["dfb pokal", "pokal"] },
  { name: "Taça de Portugal", aliases: ["taca de portugal"] },
  { name: "Taça da Liga", aliases: ["taca da liga"] },
  { name: "Supercopa", aliases: ["supertaca", "super copa"] },
  { name: "Mundial de Clubes", aliases: ["mundial", "copa do mundo de clubes"] },
  { name: "MLS", aliases: ["eme ele esse", "major league soccer"] },
  { name: "Saudi Pro League", aliases: ["liga saudita", "saudi league"] },
  { name: "Amistoso", aliases: ["pre temporada", "jogo treino"] },
];

export interface LexiconHit {
  name: string;
  /** Posição (em caracteres) no texto normalizado. */
  index: number;
}

/** Monta o índice alias → nome, incluindo nomes extras (ex.: adversários da carreira). */
export function buildIndex(entries: LexiconEntry[], extraNames: readonly string[] = []) {
  const index = new Map<string, string>();
  for (const name of extraNames) {
    if (name.trim()) index.set(fold(name), name.trim());
  }
  for (const entry of entries) {
    // um nome já usado na carreira tem prioridade sobre a grafia do léxico
    const display =
      extraNames.find((n) => fold(n) === fold(entry.name)) ??
      extraNames.find((n) => entry.aliases.includes(fold(n))) ??
      entry.name;
    for (const alias of [fold(entry.name), ...entry.aliases.map(fold)]) {
      if (!index.has(alias)) index.set(alias, display);
    }
  }
  return index;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Todas as menções exatas (por palavra inteira) no texto já normalizado, aliases mais longos primeiro. */
export function findMentions(normalized: string, index: Map<string, string>): LexiconHit[] {
  const hits: LexiconHit[] = [];
  const taken: [number, number][] = [];
  const aliases = [...index.keys()].sort((a, b) => b.length - a.length);
  for (const alias of aliases) {
    const re = new RegExp(`\\b${escapeRegex(alias)}\\b`, "g");
    for (const m of normalized.matchAll(re)) {
      const start = m.index;
      const end = start + alias.length;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      hits.push({ name: index.get(alias)!, index: start });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

/**
 * Aproximação tolerante para uma palavra (≥ 5 letras) com aliases de uma palavra:
 * cobre erros como "liverpul" ou "barselona". Use só onde já se espera um nome.
 */
export function fuzzyMatch(word: string, index: Map<string, string>): string | undefined {
  if (word.length < 5) return undefined;
  let best: { name: string; distance: number } | undefined;
  for (const [alias, name] of index) {
    if (alias.includes(" ") || alias.length < 5) continue;
    const limit = alias.length >= 8 ? 2 : 1;
    const distance = editDistance(word, alias);
    if (distance <= limit && (!best || distance < best.distance)) best = { name, distance };
  }
  return best?.name;
}

const FOOTBALL_TERMS =
  /\b(gols?|golaco|assistencias?|passe|nota|titular|reserva|banco|placar|ganhamos|vencemos|perdemos|empatamos|empate|vitoria|derrota|minutos?|amarelo|vermelho|expuls\w*|casa|fora|contra|penalti|falta|cabeca|hat trick|campeonato|liga|copa|taca|jogo|partida)\b/g;

/**
 * Pontua quão "de futebol" é uma transcrição. O reconhecimento de voz devolve
 * várias alternativas; escolhemos a que mais soa como relato de partida.
 */
export function footballRelevance(text: string): number {
  const t = fold(text);
  const terms = t.match(FOOTBALL_TERMS)?.length ?? 0;
  const clubs = findMentions(t, CLUB_INDEX).length;
  const comps = findMentions(t, COMPETITION_INDEX).length;
  const numbers = t.match(/\b\d+\b/g)?.length ?? 0;
  return terms + clubs * 2 + comps * 2 + numbers * 0.5;
}

export const CLUB_INDEX = buildIndex(CLUBS);
export const COMPETITION_INDEX = buildIndex(COMPETITIONS);

import { type Rng, intBetween, pick, pickMany } from "@/lib/random";

import { ARCHETYPES, PERSONALITIES, type Archetype } from "../player/archetypes";
import { NATIONALITIES, type Nationality } from "../player/nationalities";
import { type PreferredFoot } from "../player/player";
import { POSITIONS, type PositionCode, type PositionInfo } from "../player/positions";
import {
  CHALLENGES,
  CLUBS,
  INSPIRATIONS,
  NAME_POOLS,
  NICKNAMES,
  type ChallengeIdea,
  type ClubIdea,
  type ClubTier,
  type InspirationIdea,
} from "./catalog";

const FALLBACK_NAMES = {
  first: ["Leo", "Max", "Alex", "Noah", "Adam"],
  last: ["Silva", "Costa", "Novak", "Petrov", "Reyes"],
};

export function generateName(
  rng: Rng,
  nationalityCode: string,
): { firstName: string; lastName: string } {
  const pool = NAME_POOLS[nationalityCode] ?? FALLBACK_NAMES;
  return { firstName: pick(rng, pool.first), lastName: pick(rng, pool.last) };
}

export function suggestClubs(
  rng: Rng,
  count = 4,
  filter?: { tier?: ClubTier; region?: ClubIdea["region"] },
): ClubIdea[] {
  const pool = CLUBS.filter(
    (c) =>
      (!filter?.tier || c.tier === filter.tier) && (!filter?.region || c.region === filter.region),
  );
  return pickMany(rng, pool.length > 0 ? pool : CLUBS, count);
}

export function suggestNationalities(rng: Rng, count = 4): Nationality[] {
  return pickMany(rng, NATIONALITIES, count);
}

export interface PositionIdea {
  position: PositionInfo;
  archetype: Archetype;
  pitch: string;
}

const POSITION_PITCHES: Partial<Record<PositionCode, string>> = {
  GOL: "Poucos jogam de goleiro no modo carreira. Cada defesa difícil vira manchete.",
  ZAG: "Gols de cabeça em escanteio e o peso de ser o líder da linha.",
  LE: "Corredor livre para quem gosta de ir e voltar o jogo todo.",
  VOL: "Menos holofote, mais controle: você decide o ritmo do time.",
  MEI: "A camisa 10 que pensa o jogo e decide no último passe.",
  PE: "Corta para o meio e bate no canto — a jogada da sua carreira.",
  ATA: "Ser medido apenas por gols: simples, cruel e viciante.",
  ADD: "Ala em esquema de três zagueiros: campo inteiro para explorar.",
};

export function suggestPositions(rng: Rng, count = 3): PositionIdea[] {
  const codes = pickMany(rng, Object.keys(POSITIONS) as PositionCode[], count);
  return codes.map((code) => {
    const position = POSITIONS[code];
    const archetypes = ARCHETYPES.filter((a) => a.lines.includes(position.line));
    return {
      position,
      archetype: pick(rng, archetypes.length > 0 ? archetypes : ARCHETYPES),
      pitch:
        POSITION_PITCHES[code] ?? `Uma carreira como ${position.name.toLowerCase()} foge do óbvio.`,
    };
  });
}

export function suggestChallenges(rng: Rng, count = 3): ChallengeIdea[] {
  return pickMany(rng, CHALLENGES, count);
}

export function suggestInspirations(rng: Rng, count = 3): InspirationIdea[] {
  return pickMany(rng, INSPIRATIONS, count);
}

export interface PlayerConcept {
  firstName: string;
  lastName: string;
  nickname?: string;
  nationality: Nationality;
  age: number;
  position: PositionInfo;
  preferredFoot: PreferredFoot;
  heightCm: number;
  overall: number;
  archetype: Archetype;
  personality: string;
}

const HEIGHT_BY_LINE: Record<PositionInfo["line"], [number, number]> = {
  goalkeeper: [185, 198],
  defense: [176, 194],
  midfield: [168, 188],
  attack: [167, 192],
};

export function generatePlayerConcept(rng: Rng): PlayerConcept {
  const nationality = pick(rng, NATIONALITIES);
  const { firstName, lastName } = generateName(rng, nationality.code);
  const position = pick(rng, Object.values(POSITIONS));
  const archetypes = ARCHETYPES.filter((a) => a.lines.includes(position.line));
  const [minH, maxH] = HEIGHT_BY_LINE[position.line];
  const footRoll = rng();
  return {
    firstName,
    lastName,
    nickname: rng() < 0.3 ? pick(rng, NICKNAMES) : undefined,
    nationality,
    age: intBetween(rng, 16, 21),
    position,
    preferredFoot: footRoll < 0.7 ? "right" : footRoll < 0.95 ? "left" : "both",
    heightCm: intBetween(rng, minH, maxH),
    overall: intBetween(rng, 52, 68),
    archetype: pick(rng, archetypes.length > 0 ? archetypes : ARCHETYPES),
    personality: pick(rng, PERSONALITIES),
  };
}

export interface CareerConcept extends PlayerConcept {
  club: ClubIdea;
  objective: string;
  challenge: ChallengeIdea;
  inspiration: InspirationIdea;
  story: string;
}

const OBJECTIVES = [
  "Chegar à seleção principal",
  "Ser vendido para uma das cinco grandes ligas",
  "Virar o maior artilheiro da história do clube",
  "Conquistar a liga nacional",
  "Atingir overall 85",
  "Disputar uma Champions League",
];

function storyFor(c: Omit<CareerConcept, "story">): string {
  const who = c.nickname
    ? `${c.firstName} "${c.nickname}" ${c.lastName}`
    : `${c.firstName} ${c.lastName}`;
  const tierLine: Record<ClubTier, string> = {
    gigante: `chega ao ${c.club.name} sob a pressão de quem não pode errar`,
    tradicional: `desembarca no ${c.club.name} com a missão de devolver o clube às grandes noites`,
    emergente: `é a nova aposta do ${c.club.name}, um projeto que cresce a cada temporada`,
    modesto: `começa no ${c.club.name}, longe dos holofotes e perto da torcida`,
  };
  return `${who}, ${c.nationality.demonym} de ${c.age} anos, ${tierLine[c.club.tier]}. ${c.personality} dentro e fora de campo, joga como ${c.archetype.name.toLowerCase()}: ${c.archetype.description.toLowerCase()}`;
}

export function generateCareerConcept(rng: Rng): CareerConcept {
  const player = generatePlayerConcept(rng);
  const inspirations = INSPIRATIONS.filter((i) => i.archetypeId === player.archetype.id);
  const draft = {
    ...player,
    club: pick(rng, CLUBS),
    objective: pick(rng, OBJECTIVES),
    challenge: pick(rng, CHALLENGES),
    inspiration: pick(rng, inspirations.length > 0 ? inspirations : INSPIRATIONS),
  };
  return { ...draft, story: storyFor(draft) };
}

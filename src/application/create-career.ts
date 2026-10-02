import { type Career } from "@/domain/career/career";
import { type NewCareerInput, newCareerSchema, splitObjectives } from "@/domain/player/schema";
import { type Result, AppError, err, ok } from "@/lib/result";

/** Valor de mercado inicial estimado só a partir do overall (heurística de protótipo). */
export function estimateMarketValue(overall: number): number {
  const value = 50_000 * Math.pow(1.17, Math.max(0, overall - 50));
  const rounded = Math.round(value / 50_000) * 50_000;
  return Math.max(50_000, rounded);
}

export function seasonLabelFor(dateIso: string): string {
  const year = Number(dateIso.slice(0, 4));
  const month = Number(dateIso.slice(5, 7));
  const start = month >= 7 ? year : year - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

export function createCareer(
  rawInput: unknown,
  options: { today: string; createId: (prefix: string) => string },
): Result<Career, AppError> {
  const parsed = newCareerSchema.safeParse(rawInput);
  if (!parsed.success) {
    return err(
      new AppError("VALIDATION", "Dados da carreira inválidos", {
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      }),
    );
  }
  const input: NewCareerInput = parsed.data;
  const season = seasonLabelFor(options.today);
  const careerId = options.createId("career");

  return ok({
    id: careerId,
    createdAt: options.today,
    player: {
      id: options.createId("player"),
      firstName: input.firstName,
      lastName: input.lastName,
      nickname: input.nickname || undefined,
      nationalityCode: input.nationalityCode,
      birthDate: input.birthDate,
      position: input.position,
      preferredFoot: input.preferredFoot,
      heightCm: input.heightCm,
      shirtNumber: input.shirtNumber,
      overall: input.overall,
      archetypeId: input.archetypeId,
    },
    currentClub: input.club,
    currentClubCountry: "",
    league: "",
    currentSeason: season,
    marketValue: estimateMarketValue(input.overall),
    challenge: input.challenge || undefined,
    clubHistory: [{ club: input.club, country: "", from: season, kind: "permanent" }],
    trophies: [],
    awards: [],
    records: [],
    pastSeasons: [],
    overallHistory: [{ date: options.today, overall: input.overall }],
    objectives: [
      ...splitObjectives(input.objective).map((title) => ({
        id: options.createId("obj"),
        title,
        status: "active" as const,
        source: "player" as const,
      })),
      ...(input.challenge
        ? [
            {
              id: options.createId("obj"),
              title: input.challenge,
              status: "active" as const,
              source: "challenge" as const,
            },
          ]
        : []),
    ],
    matches: [],
    fixtures: [],
    events: [
      {
        id: options.createId("evt"),
        type: "special",
        date: options.today,
        season,
        title: `Começa a carreira no ${input.club}`,
        description: `Objetivos: ${splitObjectives(input.objective).join(", ")}.`,
        highlight: true,
      },
    ],
    news: [],
  });
}

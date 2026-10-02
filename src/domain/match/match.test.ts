import { resultOf, scoreline } from "./match";
import { matchInputSchema } from "./schema";

const valid = {
  date: "2026-10-01",
  competition: "Champions League",
  opponent: "Arsenal",
  venue: "home",
  goalsFor: 3,
  goalsAgainst: 1,
  role: "starter",
  minutes: 90,
  goals: 2,
  assists: 1,
  rating: 9,
  yellowCards: 0,
  redCard: false,
};

describe("resultOf", () => {
  it.each([
    [2, 1, "W"],
    [1, 1, "D"],
    [0, 3, "L"],
  ] as const)("%i x %i → %s", (goalsFor, goalsAgainst, expected) => {
    expect(resultOf({ goalsFor, goalsAgainst })).toBe(expected);
  });

  it("formata placar com travessão", () => {
    expect(scoreline({ goalsFor: 3, goalsAgainst: 1 })).toBe("3–1");
  });
});

describe("matchInputSchema", () => {
  it("aceita uma partida válida", () => {
    expect(matchInputSchema.safeParse(valid).success).toBe(true);
  });

  it("aceita partida sem nota (null)", () => {
    expect(matchInputSchema.safeParse({ ...valid, rating: null }).success).toBe(true);
  });

  it("rejeita mais gols do jogador do que do time", () => {
    const r = matchInputSchema.safeParse({ ...valid, goals: 4, assists: 0 });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["goals"]);
  });

  it("rejeita gols + assistências acima do placar do time", () => {
    const r = matchInputSchema.safeParse({ ...valid, goals: 2, assists: 2 });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["assists"]);
  });

  it("rejeita nota fora de 1–10 e minutos inválidos", () => {
    expect(matchInputSchema.safeParse({ ...valid, rating: 11 }).success).toBe(false);
    expect(matchInputSchema.safeParse({ ...valid, minutes: 0 }).success).toBe(false);
  });

  it("exige competição e adversário", () => {
    const r = matchInputSchema.safeParse({ ...valid, competition: " ", opponent: "" });
    expect(r.error?.issues.map((i) => i.path[0]).sort()).toEqual(["competition", "opponent"]);
  });

  it("mensagens de campos ausentes saem em português", () => {
    const r = matchInputSchema.safeParse({
      ...valid,
      venue: undefined,
      role: undefined,
      goals: 99,
    });
    const messages = r.error?.issues.map((i) => i.message) ?? [];
    expect(messages).toEqual(
      expect.arrayContaining([
        "Escolha casa, fora ou neutro",
        "Informe se foi titular ou reserva",
        "Máximo de 15 gols",
      ]),
    );
  });
});

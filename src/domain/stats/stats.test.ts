import { makeMatch } from "@/test/factories";

import {
  aggregate,
  averageRating,
  combine,
  longestScoringStreak,
  matchHighlights,
  monthlyContributions,
  per90,
  recentForm,
  winRate,
} from "./stats";

describe("averageRating", () => {
  it("ignora partidas sem nota em vez de contá-las como zero", () => {
    const matches = [
      makeMatch({ rating: 8 }),
      makeMatch({ rating: null }),
      makeMatch({ rating: 6 }),
    ];
    expect(averageRating(matches)).toBe(7);
  });

  it("retorna null quando nenhuma partida tem nota", () => {
    expect(averageRating([makeMatch({ rating: null })])).toBeNull();
  });

  it("arredonda para duas casas", () => {
    expect(
      averageRating([
        makeMatch({ rating: 7 }),
        makeMatch({ rating: 7.5 }),
        makeMatch({ rating: 8 }),
      ]),
    ).toBe(7.5);
    expect(
      averageRating([
        makeMatch({ rating: 7.1 }),
        makeMatch({ rating: 7.2 }),
        makeMatch({ rating: 7.2 }),
      ]),
    ).toBe(7.17);
  });
});

describe("aggregate", () => {
  it("soma jogos, gols, assistências, minutos e resultados", () => {
    const line = aggregate([
      makeMatch({ goalsFor: 3, goalsAgainst: 1, goals: 2, assists: 1, minutes: 90 }),
      makeMatch({ goalsFor: 1, goalsAgainst: 1, role: "substitute", minutes: 20, yellowCards: 1 }),
      makeMatch({ goalsFor: 0, goalsAgainst: 2, minutes: 90, redCard: true }),
    ]);
    expect(line).toMatchObject({
      appearances: 3,
      starts: 2,
      minutes: 200,
      goals: 2,
      assists: 1,
      wins: 1,
      draws: 1,
      losses: 1,
      yellowCards: 1,
      redCards: 1,
    });
  });

  it("retorna linha zerada para lista vazia", () => {
    expect(aggregate([])).toMatchObject({ appearances: 0, goals: 0, averageRating: null });
  });
});

describe("combine", () => {
  it("pondera a média de notas pelo número de jogos", () => {
    const a = { ...aggregate([makeMatch({ rating: 8 })]) }; // 1 jogo, 8.0
    const b = {
      ...aggregate([makeMatch({ rating: 6 }), makeMatch({ rating: 6 }), makeMatch({ rating: 6 })]),
    }; // 3 jogos, 6.0
    expect(combine([a, b]).averageRating).toBe(6.5);
    expect(combine([a, b]).appearances).toBe(4);
  });

  it("ignora linhas sem nota na ponderação", () => {
    const rated = aggregate([makeMatch({ rating: 7 })]);
    const unrated = aggregate([makeMatch({ rating: null })]);
    expect(combine([rated, unrated]).averageRating).toBe(7);
  });
});

describe("indicadores derivados", () => {
  it("per90 normaliza por 90 minutos e protege divisão por zero", () => {
    expect(per90(3, 270)).toBe(1);
    expect(per90(1, 0)).toBe(0);
  });

  it("winRate calcula aproveitamento de vitórias", () => {
    expect(winRate({ wins: 3, appearances: 4 })).toBe(0.75);
    expect(winRate({ wins: 0, appearances: 0 })).toBe(0);
  });

  it("recentForm retorna os últimos N em ordem cronológica", () => {
    const matches = [
      makeMatch({ date: "2026-09-01", goalsFor: 1, goalsAgainst: 0 }),
      makeMatch({ date: "2026-09-08", goalsFor: 0, goalsAgainst: 0 }),
      makeMatch({ date: "2026-09-15", goalsFor: 0, goalsAgainst: 1 }),
    ];
    expect(recentForm(matches, 2).map((f) => f.result)).toEqual(["D", "L"]);
  });

  it("longestScoringStreak considera a ordem das datas", () => {
    const matches = [
      makeMatch({ date: "2026-09-03", goals: 1 }),
      makeMatch({ date: "2026-09-01", goals: 1 }),
      makeMatch({ date: "2026-09-02", goals: 1 }),
      makeMatch({ date: "2026-09-04", goals: 0 }),
      makeMatch({ date: "2026-09-05", goals: 2 }),
    ];
    expect(longestScoringStreak(matches)).toBe(3);
  });

  it("monthlyContributions agrupa por mês", () => {
    const buckets = monthlyContributions([
      makeMatch({ date: "2026-09-01", goals: 1, assists: 1 }),
      makeMatch({ date: "2026-09-20", goals: 2 }),
      makeMatch({ date: "2026-10-02", assists: 1 }),
    ]);
    expect(buckets).toEqual([
      { month: "2026-09", goals: 3, assists: 1, appearances: 2 },
      { month: "2026-10", goals: 0, assists: 1, appearances: 1 },
    ]);
  });

  it("matchHighlights encontra melhor nota e mais gols", () => {
    const best = makeMatch({ rating: 9.4, goals: 1 });
    const most = makeMatch({ rating: 8, goals: 3 });
    const h = matchHighlights([best, most, makeMatch({ rating: null })]);
    expect(h.bestRating?.id).toBe(best.id);
    expect(h.mostGoals?.id).toBe(most.id);
  });
});

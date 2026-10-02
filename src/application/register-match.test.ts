import { currentSeasonMatches } from "@/domain/career/career";
import { aggregate } from "@/domain/stats/stats";
import { createDemoCareer } from "@/data/mock-career";
import { sequentialIds } from "@/test/factories";

import { careerTotals, registerMatch } from "./register-match";

const input = {
  date: "2027-01-18",
  competition: "Liga Portugal",
  opponent: "FC Porto",
  venue: "away",
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

describe("registerMatch (integração domínio + caso de uso)", () => {
  it("adiciona a partida e atualiza as estatísticas da temporada", () => {
    const career = createDemoCareer();
    const before = aggregate(currentSeasonMatches(career));
    const result = registerMatch(career, input, sequentialIds());
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const after = aggregate(currentSeasonMatches(result.value.career));
    expect(after.appearances).toBe(before.appearances + 1);
    expect(after.goals).toBe(before.goals + 2);
    expect(after.assists).toBe(before.assists + 1);
    expect(after.wins).toBe(before.wins + 1);
    expect(result.value.match.season).toBe(career.currentSeason);
  });

  it("recalcula objetivos automáticos e preserva os manuais", () => {
    const career = createDemoCareer();
    const result = registerMatch(career, input, sequentialIds());
    if (!result.ok) throw result.error;
    const goalsObjective = result.value.career.objectives.find((o) => o.metric === "season-goals");
    const manual = result.value.career.objectives.find((o) => o.id === "obj_3");
    expect(goalsObjective?.current).toBe(20);
    expect(manual).toEqual(career.objectives.find((o) => o.id === "obj_3"));
  });

  it("gera notícia e remove o compromisso correspondente da agenda", () => {
    const career = createDemoCareer();
    const result = registerMatch(career, input, sequentialIds());
    if (!result.ok) throw result.error;
    expect(result.value.news?.headline).toContain("Dois gols");
    expect(result.value.career.news[0]).toBe(result.value.news);
    expect(result.value.career.fixtures.some((f) => f.opponent === "FC Porto")).toBe(false);
  });

  it("não altera a carreira original (imutabilidade)", () => {
    const career = createDemoCareer();
    const snapshot = JSON.stringify(career);
    registerMatch(career, input, sequentialIds());
    expect(JSON.stringify(career)).toBe(snapshot);
  });

  it("retorna erro de validação com caminhos dos campos", () => {
    const result = registerMatch(createDemoCareer(), { ...input, goals: 5 }, sequentialIds());
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("VALIDATION");
    expect(result.error.details?.issues).toEqual([expect.objectContaining({ path: "goals" })]);
  });

  it("totais de carreira somam temporadas passadas e partidas registradas", () => {
    const totals = careerTotals(createDemoCareer());
    expect(totals.goals).toBe(2 + 11 + 19 + 18);
    expect(totals.appearances).toBe(9 + 38 + 41 + 24);
  });
});

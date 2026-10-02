import { sequentialIds } from "@/test/factories";

import { createCareer, estimateMarketValue, seasonLabelFor } from "./create-career";

const input = {
  firstName: "Kauã",
  lastName: "Siqueira",
  nickname: "",
  nationalityCode: "BRA",
  birthDate: "2008-05-02",
  position: "MEI",
  preferredFoot: "left",
  heightCm: 174,
  shirtNumber: 10,
  club: "Mirassol",
  overall: 58,
  archetypeId: "camisa-10",
  objective: "Chegar à seleção principal",
  challenge: "Ficar 8 temporadas no mesmo clube",
};

describe("createCareer", () => {
  it("cria carreira vazia com objetivo, desafio e evento inicial", () => {
    const result = createCareer(input, { today: "2026-10-02", createId: sequentialIds() });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const career = result.value;
    expect(career.currentSeason).toBe("2026/27");
    expect(career.player.nickname).toBeUndefined();
    expect(career.matches).toEqual([]);
    expect(career.objectives.map((o) => o.source)).toEqual(["player", "challenge"]);
    expect(career.events[0]?.title).toBe("Começa a carreira no Mirassol");
  });

  it("cria um objetivo para cada item listado", () => {
    const result = createCareer(
      {
        ...input,
        objective: "Conquistar a Champions League, virar ídolo do clube; ganhar uma Copa do Mundo",
        challenge: "",
      },
      { today: "2026-10-02", createId: sequentialIds() },
    );
    if (!result.ok) throw result.error;
    expect(result.value.objectives.map((o) => o.title)).toEqual([
      "Conquistar a Champions League",
      "Virar ídolo do clube",
      "Ganhar uma Copa do Mundo",
    ]);
  });

  it("valida campos obrigatórios", () => {
    const result = createCareer(
      { ...input, firstName: "K", archetypeId: "inexistente" },
      { today: "2026-10-02", createId: sequentialIds() },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const paths = (result.error.details?.issues as { path: string }[]).map((i) => i.path);
    expect(paths).toEqual(expect.arrayContaining(["firstName", "archetypeId"]));
  });
});

describe("helpers", () => {
  it("rótulo da temporada vira em julho", () => {
    expect(seasonLabelFor("2026-06-30")).toBe("2025/26");
    expect(seasonLabelFor("2026-07-01")).toBe("2026/27");
  });

  it("valor de mercado cresce com o overall e nunca é menor que 50 mil", () => {
    expect(estimateMarketValue(40)).toBe(50_000);
    expect(estimateMarketValue(80)).toBeGreaterThan(estimateMarketValue(70));
  });
});

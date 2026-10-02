import { createDemoCareer } from "@/data/mock-career";
import { sequentialIds } from "@/test/factories";

import { updateOverall } from "./update-overall";

describe("updateOverall", () => {
  it("atualiza o jogador, o histórico e cria evento na timeline", () => {
    const career = createDemoCareer();
    const r = updateOverall(career, { overall: 78, date: "2027-02-01" }, sequentialIds());
    if (!r.ok) throw r.error;
    expect(r.value.previous).toBe(76);
    expect(r.value.career.player.overall).toBe(78);
    expect(r.value.career.overallHistory.at(-1)).toEqual({ date: "2027-02-01", overall: 78 });
    expect(r.value.event?.title).toBe("Overall sobe para 78");
    expect(r.value.event?.season).toBe("2026/27");
    expect(r.value.career.events).toContain(r.value.event);
  });

  it("substitui o ponto da mesma data e destaca quando cruza uma marca", () => {
    const career = createDemoCareer();
    const r = updateOverall(career, { overall: 80, date: "2027-01-01" }, sequentialIds());
    if (!r.ok) throw r.error;
    expect(r.value.career.overallHistory.filter((p) => p.date === "2027-01-01")).toEqual([
      { date: "2027-01-01", overall: 80 },
    ]);
    expect(r.value.event?.highlight).toBe(true);
  });

  it("registra queda e atualiza valor de mercado quando informado", () => {
    const r = updateOverall(
      createDemoCareer(),
      { overall: 74, date: "2027-02-01", marketValue: 30_000_000 },
      sequentialIds(),
    );
    if (!r.ok) throw r.error;
    expect(r.value.event?.title).toBe("Overall cai para 74");
    expect(r.value.career.marketValue).toBe(30_000_000);
  });

  it("sem mudança de valor não cria evento", () => {
    const r = updateOverall(
      createDemoCareer(),
      { overall: 76, date: "2027-02-01" },
      sequentialIds(),
    );
    if (!r.ok) throw r.error;
    expect(r.value.event).toBeNull();
  });

  it("valida limites em português", () => {
    const r = updateOverall(
      createDemoCareer(),
      { overall: 120, date: "2027-02-01" },
      sequentialIds(),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.details?.issues).toEqual([{ path: "overall", message: "Máximo 99" }]);
  });
});

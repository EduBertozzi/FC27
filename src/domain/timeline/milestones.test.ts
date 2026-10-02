import { EMPTY_STAT_LINE } from "@/domain/stats/stats";
import { makeMatch, sequentialIds } from "@/test/factories";

import { groupBySeason } from "./events";
import { deriveMilestones } from "./milestones";

describe("deriveMilestones", () => {
  it("gera estreia, primeiro gol e primeira assistência na primeira partida", () => {
    const events = deriveMilestones(
      makeMatch({ goals: 1, assists: 1, goalsFor: 2 }),
      EMPTY_STAT_LINE,
      sequentialIds(),
    );
    expect(events.map((e) => e.type)).toEqual(["debut", "first-goal", "first-assist"]);
  });

  it("detecta hat-trick e marca de gols cruzada", () => {
    const before = { ...EMPTY_STAT_LINE, appearances: 30, goals: 8, assists: 3 };
    const events = deriveMilestones(makeMatch({ goals: 3, goalsFor: 4 }), before, sequentialIds());
    expect(events.map((e) => e.title)).toEqual(
      expect.arrayContaining([expect.stringContaining("Hat-trick"), "10º gol na carreira"]),
    );
  });

  it("não gera nada para uma partida comum", () => {
    const before = { ...EMPTY_STAT_LINE, appearances: 12, goals: 3, assists: 2 };
    expect(deriveMilestones(makeMatch(), before, sequentialIds())).toEqual([]);
  });

  it("marca 50º jogo", () => {
    const before = { ...EMPTY_STAT_LINE, appearances: 49, goals: 1, assists: 1 };
    expect(deriveMilestones(makeMatch(), before, sequentialIds())[0]?.title).toBe(
      "50º jogo como profissional",
    );
  });
});

describe("groupBySeason", () => {
  it("agrupa em ordem decrescente", () => {
    const groups = groupBySeason([
      { id: "a", type: "debut", date: "2024-01-01", season: "2023/24", title: "A" },
      { id: "b", type: "title", date: "2026-05-01", season: "2025/26", title: "B" },
      { id: "c", type: "award", date: "2026-06-01", season: "2025/26", title: "C" },
    ]);
    expect(groups.map((g) => g.season)).toEqual(["2025/26", "2023/24"]);
    expect(groups[0]?.events.map((e) => e.id)).toEqual(["c", "b"]);
  });
});

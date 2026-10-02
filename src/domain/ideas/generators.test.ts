import { createRng } from "@/lib/random";

import { generateCareerConcept, suggestClubs, suggestPositions } from "./generators";

describe("geradores de ideias", () => {
  it("são determinísticos para a mesma semente", () => {
    expect(generateCareerConcept(createRng(42))).toEqual(generateCareerConcept(createRng(42)));
  });

  it("produzem conceitos coerentes em muitas sementes", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const c = generateCareerConcept(createRng(seed));
      expect(c.archetype.lines).toContain(c.position.line);
      expect(c.overall).toBeGreaterThanOrEqual(52);
      expect(c.overall).toBeLessThanOrEqual(68);
      expect(c.age).toBeGreaterThanOrEqual(16);
      expect(c.story).toContain(c.club.name);
    }
  });

  it("filtra clubes por perfil sem repetir", () => {
    const clubs = suggestClubs(createRng(7), 3, { tier: "modesto" });
    expect(clubs.every((c) => c.tier === "modesto")).toBe(true);
    expect(new Set(clubs.map((c) => c.name)).size).toBe(clubs.length);
  });

  it("sugere arquétipo compatível com a posição", () => {
    for (const idea of suggestPositions(createRng(3), 5)) {
      expect(idea.archetype.lines).toContain(idea.position.line);
    }
  });
});

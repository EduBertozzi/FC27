import { createDemoCareer } from "@/data/mock-career";

import { MockCareerAssistant } from "./mock-assistant";

const ask = (content: string) =>
  new MockCareerAssistant().reply({
    career: createDemoCareer(),
    messages: [{ id: "1", role: "user", content, createdAt: "2027-01-14" }],
  });

describe("MockCareerAssistant", () => {
  it("responde sobre a temporada usando os números reais da carreira", async () => {
    const reply = await ask("Como está minha temporada?");
    expect(reply.content).toContain("24 jogos, 18 gols e 10 assistências");
  });

  it("escreve notícia sobre a última partida", async () => {
    const reply = await ask("Crie uma notícia sobre minha última partida");
    expect(reply.content).toContain("Braga");
  });

  it("oferece atalhos quando não entende", async () => {
    const reply = await ask("qual a capital da França?");
    expect(reply.suggestions?.length).toBeGreaterThan(0);
  });
});

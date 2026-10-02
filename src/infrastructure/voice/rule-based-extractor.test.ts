import { extractMatchFromText } from "./rule-based-extractor";

const ctx = {
  knownCompetitions: ["Liga Portugal", "Champions League", "Taça de Portugal"],
  today: "2027-01-14",
};

describe("extractMatchFromText", () => {
  it("extrai o exemplo de referência sem inventar campos ausentes", () => {
    const r = extractMatchFromText(
      "Joguei contra o Arsenal, ganhamos de três a um, fiz dois gols e dei uma assistência. Tirei nota nove.",
      ctx,
    );
    expect(r.fields).toEqual({
      opponent: "Arsenal",
      goalsFor: 3,
      goalsAgainst: 1,
      goals: 2,
      assists: 1,
      rating: 9,
    });
    expect(r.fields.competition).toBeUndefined();
    expect(r.fields.venue).toBeUndefined();
    expect(r.missing).toEqual(expect.arrayContaining(["competition", "venue", "role", "minutes"]));
    expect(r.questions[0]).toMatch(
      /^Você informou o adversário e o resultado, mas não informou a competição/,
    );
  });

  it("inverte o placar em derrotas", () => {
    const r = extractMatchFromText(
      "Perdemos de dois a zero para o Porto. Fui titular e joguei 90 minutos, nota seis e meio.",
      ctx,
    );
    expect(r.fields).toMatchObject({
      opponent: "Porto",
      goalsFor: 0,
      goalsAgainst: 2,
      role: "starter",
      minutes: 90,
      rating: 6.5,
    });
  });

  it("reconhece reserva, fora de casa, cartão e competição conhecida", () => {
    const r = extractMatchFromText(
      "Empatamos em um a um com o Benfica fora de casa pela Liga Portugal. Entrei no segundo tempo, joguei 30 minutos e levei amarelo.",
      ctx,
    );
    expect(r.fields).toMatchObject({
      competition: "Liga Portugal",
      opponent: "Benfica",
      venue: "away",
      goalsFor: 1,
      goalsAgainst: 1,
      role: "substitute",
      minutes: 30,
      yellowCards: 1,
    });
    expect(r.missing).toEqual([]);
    expect(r.questions).toEqual(["Você não informou a nota. Deseja deixar esse campo vazio?"]);
  });

  it("aceita nota decimal com vírgula e hat-trick", () => {
    const r = extractMatchFromText("Vencemos por 4 a 0, fiz hat-trick, nota 9,5", ctx);
    expect(r.fields).toMatchObject({ goalsFor: 4, goalsAgainst: 0, goals: 3, rating: 9.5 });
  });

  it("texto sem informação não gera dados", () => {
    const r = extractMatchFromText("Foi um jogo difícil.", ctx);
    expect(r.fields).toEqual({});
    expect(r.questions[0]).toMatch(/^Não identifiquei/);
  });
});

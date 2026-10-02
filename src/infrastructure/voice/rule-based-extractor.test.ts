import { extractMatchFromText } from "./rule-based-extractor";

const ctx = {
  knownCompetitions: ["Liga Portugal", "Champions League", "Taça de Portugal"],
  knownOpponents: ["Porto", "Benfica", "Arsenal"],
  ownClub: "Sporting CP",
  league: "Liga Portugal",
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

  describe("fala real (minúsculas, sem pontuação, gírias)", () => {
    it("entende um relato corrido como o navegador transcreve", () => {
      const r = extractMatchFromText(
        "joguei contra o porto em casa pela liga ganhamos de 3x1 fiz um gol e dei duas assistencias minha nota foi 8,7 joguei os 90",
        ctx,
      );
      expect(r.fields).toMatchObject({
        opponent: "Porto",
        venue: "home",
        competition: "Liga Portugal",
        goalsFor: 3,
        goalsAgainst: 1,
        goals: 1,
        assists: 2,
        rating: 8.7,
        minutes: 90,
      });
    });

    it("reconhece apelidos e erros comuns de clubes e competições", () => {
      const r = extractMatchFromText(
        "foi contra o baiern na liga dos campeões perdemos de dois a um fora de casa",
        ctx,
      );
      expect(r.fields).toMatchObject({
        opponent: "Bayern de Munique",
        competition: "Champions League",
        goalsFor: 1,
        goalsAgainst: 2,
        venue: "away",
      });
    });

    it("aproxima nomes mal transcritos depois de 'contra'", () => {
      const r = extractMatchFromText("jogamos contra o liverpul e empatamos 2 a 2", ctx);
      expect(r.fields).toMatchObject({ opponent: "Liverpool", goalsFor: 2, goalsAgainst: 2 });
    });

    it("nunca toma o próprio clube como adversário e lê o placar pelo lado certo", () => {
      const r = extractMatchFromText("sporting 1 a 3 benfica, que pena", ctx);
      expect(r.fields).toMatchObject({ opponent: "Benfica", goalsFor: 1, goalsAgainst: 3 });

      const r2 = extractMatchFromText("o benfica ganhou da gente de 2 a 0", ctx);
      expect(r2.fields).toMatchObject({ opponent: "Benfica", goalsFor: 0, goalsAgainst: 2 });
    });

    it("pergunta quando não dá para saber quem venceu", () => {
      const r = extractMatchFromText("foi 3 a 1 contra o arsenal", ctx);
      expect(r.fields.goalsFor).toBeUndefined();
      expect(r.questions[0]).toMatch(/Ouvi o placar 3 a 1, mas não ficou claro quem venceu/);
    });

    it("entende entrada do banco, nota no formato do jogo e cartão", () => {
      const r = extractMatchFromText(
        "comecei no banco entrei aos sessenta e cinco marquei de cabeça tirei nota sete oito levei cartão amarelo",
        ctx,
      );
      expect(r.fields).toMatchObject({
        role: "substitute",
        substitutionMinute: 65,
        minutes: 25,
        goals: 1,
        rating: 7.8,
        yellowCards: 1,
      });
    });

    it("entende gírias de gols e quem passou em branco", () => {
      expect(extractMatchFromText("fiz um doblete", ctx).fields.goals).toBe(2);
      expect(extractMatchFromText("meti um rat trick", ctx).fields.goals).toBe(3);
      expect(extractMatchFromText("passei em branco hoje", ctx).fields.goals).toBe(0);
      expect(extractMatchFromText("fui titular e saí aos 70", ctx).fields).toMatchObject({
        role: "starter",
        minutes: 70,
        substitutionMinute: 70,
      });
    });

    it("não confunde gol contra nem cartão do adversário", () => {
      const r = extractMatchFromText(
        "teve um gol contra deles e o zagueiro deles levou vermelho",
        ctx,
      );
      expect(r.fields.opponent).toBeUndefined();
      expect(r.fields.redCard).toBeUndefined();
    });
  });
});

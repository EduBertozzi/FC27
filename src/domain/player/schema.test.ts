import { goalStepSchema, identityStepSchema, splitObjectives } from "./schema";

const USER_TEXT =
  "Conquistar a Champions League, ser vendido para uma das 5 ligas grandes, virar idolo de algum clube, bater recorde de assistencias, chegar na selação principal e ganhar uma copa do mundo";

describe("objetivos múltiplos", () => {
  it("aceita vários objetivos em um texto longo", () => {
    expect(goalStepSchema.safeParse({ objective: USER_TEXT }).success).toBe(true);
  });

  it("separa por vírgula, ponto e vírgula e quebra de linha, capitalizando cada item", () => {
    expect(splitObjectives(USER_TEXT)).toEqual([
      "Conquistar a Champions League",
      "Ser vendido para uma das 5 ligas grandes",
      "Virar idolo de algum clube",
      "Bater recorde de assistencias",
      "Chegar na selação principal e ganhar uma copa do mundo",
    ]);
    expect(splitObjectives("a artilharia;\nb título.\n\n")).toEqual(["A artilharia", "B título"]);
  });

  it("explica em português quando um único objetivo é longo demais", () => {
    const r = goalStepSchema.safeParse({ objective: "x".repeat(130) });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toMatch(/^Cada objetivo pode ter até 120 caracteres/);
  });

  it("limita a quantidade de objetivos", () => {
    const r = goalStepSchema.safeParse({
      objective: Array.from({ length: 9 }, (_, i) => `Objetivo ${i}`).join(", "),
    });
    expect(r.error?.issues[0]?.message).toBe("Escolha até 8 objetivos (você listou 9)");
  });
});

describe("mensagens em português", () => {
  it("nenhuma mensagem de validação sai em inglês", () => {
    const r = identityStepSchema.safeParse({
      firstName: "x".repeat(40),
      lastName: "y".repeat(40),
      nickname: "z".repeat(30),
      nationalityCode: "",
      birthDate: "",
    });
    const messages = r.error?.issues.map((i) => i.message) ?? [];
    expect(messages.length).toBeGreaterThan(0);
    for (const m of messages) expect(m).not.toMatch(/too big|too small|expected|invalid/i);
  });
});

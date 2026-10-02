import { applyExtraction, initialValues, issuesToErrors, toMatchInput } from "./match-form-state";

describe("match form state", () => {
  it("converte valores do formulário em entrada do caso de uso", () => {
    const input = toMatchInput({
      ...initialValues("2027-01-18"),
      hasRating: false,
      notes: "  ",
      substitutionMinute: "70",
    });
    expect(input).toMatchObject({ rating: null, notes: undefined, substitutionMinute: 70 });
  });

  it("aplica somente campos extraídos e limpa a nota quando não foi dita", () => {
    const base = initialValues("2027-01-18", { competition: "Liga Portugal" });
    const next = applyExtraction(base, { opponent: "Arsenal", goals: 2 });
    expect(next.competition).toBe("Liga Portugal");
    expect(next.opponent).toBe("Arsenal");
    expect(next.goals).toBe(2);
    expect(next.hasRating).toBe(false);
  });

  it("mapeia issues de validação para o primeiro erro de cada campo", () => {
    expect(
      issuesToErrors([
        { path: "goals", message: "a" },
        { path: "goals", message: "b" },
      ]),
    ).toEqual({ goals: "a" });
  });
});

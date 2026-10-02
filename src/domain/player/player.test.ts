import { ageAt, displayName, initials } from "./player";

describe("player", () => {
  it("calcula idade considerando se já fez aniversário", () => {
    expect(ageAt("2005-03-14", "2027-01-14")).toBe(21);
    expect(ageAt("2005-03-14", "2027-03-14")).toBe(22);
    expect(ageAt("2005-03-14", "2027-03-13")).toBe(21);
  });

  it("usa apelido quando houver", () => {
    expect(displayName({ firstName: "Rafael", lastName: "Monteiro", nickname: "Rafa" })).toBe(
      "Rafa",
    );
    expect(displayName({ firstName: "Rafael", lastName: "Monteiro", nickname: "  " })).toBe(
      "Rafael Monteiro",
    );
  });

  it("gera iniciais", () => {
    expect(initials({ firstName: "rafael", lastName: "monteiro" })).toBe("RM");
  });
});

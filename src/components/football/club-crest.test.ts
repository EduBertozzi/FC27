import { clubColors, readableOn } from "./club-crest";

describe("cores de clube", () => {
  it("usa as cores tradicionais conhecidas", () => {
    expect(clubColors("Sporting CP")[0]).toBe("#0f7a45");
  });

  it("escolhe texto legível para o fundo", () => {
    expect(readableOn("#ffd200")).toBe("#0b0f19");
    expect(readableOn("#1d4e9c")).toBe("#ffffff");
  });
});

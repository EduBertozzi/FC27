export const POSITION_CODES = [
  "GOL",
  "LD",
  "ZAG",
  "LE",
  "ADD",
  "ADE",
  "VOL",
  "MC",
  "MEI",
  "MD",
  "ME",
  "PD",
  "PE",
  "SA",
  "ATA",
] as const;

export type PositionCode = (typeof POSITION_CODES)[number];
export type PositionLine = "goalkeeper" | "defense" | "midfield" | "attack";

export interface PositionInfo {
  code: PositionCode;
  name: string;
  line: PositionLine;
  /** Coordenadas no campo (0–100), ataque para cima. */
  pitch: { x: number; y: number };
}

export const POSITIONS: Record<PositionCode, PositionInfo> = {
  GOL: { code: "GOL", name: "Goleiro", line: "goalkeeper", pitch: { x: 50, y: 92 } },
  LD: { code: "LD", name: "Lateral-direito", line: "defense", pitch: { x: 86, y: 72 } },
  ZAG: { code: "ZAG", name: "Zagueiro", line: "defense", pitch: { x: 50, y: 76 } },
  LE: { code: "LE", name: "Lateral-esquerdo", line: "defense", pitch: { x: 14, y: 72 } },
  ADD: { code: "ADD", name: "Ala direito", line: "defense", pitch: { x: 88, y: 56 } },
  ADE: { code: "ADE", name: "Ala esquerdo", line: "defense", pitch: { x: 12, y: 56 } },
  VOL: { code: "VOL", name: "Volante", line: "midfield", pitch: { x: 50, y: 60 } },
  MC: { code: "MC", name: "Meio-campista", line: "midfield", pitch: { x: 50, y: 47 } },
  MEI: { code: "MEI", name: "Meia ofensivo", line: "midfield", pitch: { x: 50, y: 34 } },
  MD: { code: "MD", name: "Meia direita", line: "midfield", pitch: { x: 84, y: 40 } },
  ME: { code: "ME", name: "Meia esquerda", line: "midfield", pitch: { x: 16, y: 40 } },
  PD: { code: "PD", name: "Ponta-direita", line: "attack", pitch: { x: 82, y: 21 } },
  PE: { code: "PE", name: "Ponta-esquerda", line: "attack", pitch: { x: 18, y: 21 } },
  SA: { code: "SA", name: "Segundo atacante", line: "attack", pitch: { x: 50, y: 22 } },
  ATA: { code: "ATA", name: "Centroavante", line: "attack", pitch: { x: 50, y: 10 } },
};

export const LINE_LABEL: Record<PositionLine, string> = {
  goalkeeper: "Goleiro",
  defense: "Defesa",
  midfield: "Meio-campo",
  attack: "Ataque",
};

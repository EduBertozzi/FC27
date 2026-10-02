import { type PositionLine } from "./positions";

export interface Archetype {
  id: string;
  name: string;
  description: string;
  lines: readonly PositionLine[];
}

export const ARCHETYPES: readonly Archetype[] = [
  {
    id: "finalizador",
    name: "Finalizador",
    description: "Vive dentro da área. Um toque, um gol.",
    lines: ["attack"],
  },
  {
    id: "pivo",
    name: "Pivô",
    description: "Segura a bola de costas e faz o time respirar.",
    lines: ["attack"],
  },
  {
    id: "driblador",
    name: "Driblador",
    description: "Encara o marcador no um contra um, sempre.",
    lines: ["attack", "midfield"],
  },
  {
    id: "velocista",
    name: "Velocista",
    description: "Ataca o espaço nas costas da defesa.",
    lines: ["attack", "defense"],
  },
  {
    id: "camisa-10",
    name: "Camisa 10 clássico",
    description: "Visão, passe e pausa. Joga de cabeça erguida.",
    lines: ["midfield", "attack"],
  },
  {
    id: "box-to-box",
    name: "Box-to-box",
    description: "Fôlego infinito, de área a área.",
    lines: ["midfield"],
  },
  {
    id: "regista",
    name: "Regista",
    description: "Dita o ritmo a partir da primeira fase.",
    lines: ["midfield"],
  },
  {
    id: "destruidor",
    name: "Destruidor",
    description: "Desarma, cobre e protege a defesa.",
    lines: ["midfield", "defense"],
  },
  {
    id: "zagueiro-construtor",
    name: "Zagueiro construtor",
    description: "Começa a jogada com passes longos e precisos.",
    lines: ["defense"],
  },
  {
    id: "xerife",
    name: "Xerife",
    description: "Líder da defesa, forte no jogo aéreo.",
    lines: ["defense"],
  },
  {
    id: "lateral-ofensivo",
    name: "Lateral apoiador",
    description: "Corredor inteiro é dele, do desarme ao cruzamento.",
    lines: ["defense"],
  },
  {
    id: "goleiro-libero",
    name: "Goleiro líbero",
    description: "Sai do gol, joga com os pés, adianta a linha.",
    lines: ["goalkeeper"],
  },
  {
    id: "paredao",
    name: "Paredão",
    description: "Reflexo puro debaixo das traves.",
    lines: ["goalkeeper"],
  },
];

export function findArchetype(id: string): Archetype | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}

export const PERSONALITIES: readonly string[] = [
  "Líder silencioso",
  "Showman",
  "Trabalhador incansável",
  "Temperamental",
  "Frio sob pressão",
  "Ídolo da torcida",
  "Estudioso do jogo",
  "Rebelde com causa",
];

export interface Nationality {
  /** Código FIFA de três letras — exibido como selo, sem bandeiras proprietárias. */
  code: string;
  name: string;
  demonym: string;
  region: "América do Sul" | "Europa" | "África" | "América do Norte" | "Ásia" | "Oceania";
}

export const NATIONALITIES: readonly Nationality[] = [
  { code: "BRA", name: "Brasil", demonym: "brasileiro", region: "América do Sul" },
  { code: "ARG", name: "Argentina", demonym: "argentino", region: "América do Sul" },
  { code: "URU", name: "Uruguai", demonym: "uruguaio", region: "América do Sul" },
  { code: "COL", name: "Colômbia", demonym: "colombiano", region: "América do Sul" },
  { code: "ECU", name: "Equador", demonym: "equatoriano", region: "América do Sul" },
  { code: "POR", name: "Portugal", demonym: "português", region: "Europa" },
  { code: "ESP", name: "Espanha", demonym: "espanhol", region: "Europa" },
  { code: "FRA", name: "França", demonym: "francês", region: "Europa" },
  { code: "ENG", name: "Inglaterra", demonym: "inglês", region: "Europa" },
  { code: "GER", name: "Alemanha", demonym: "alemão", region: "Europa" },
  { code: "ITA", name: "Itália", demonym: "italiano", region: "Europa" },
  { code: "NED", name: "Países Baixos", demonym: "neerlandês", region: "Europa" },
  { code: "BEL", name: "Bélgica", demonym: "belga", region: "Europa" },
  { code: "CRO", name: "Croácia", demonym: "croata", region: "Europa" },
  { code: "NOR", name: "Noruega", demonym: "norueguês", region: "Europa" },
  { code: "SCO", name: "Escócia", demonym: "escocês", region: "Europa" },
  { code: "ISL", name: "Islândia", demonym: "islandês", region: "Europa" },
  { code: "SEN", name: "Senegal", demonym: "senegalês", region: "África" },
  { code: "NGA", name: "Nigéria", demonym: "nigeriano", region: "África" },
  { code: "MAR", name: "Marrocos", demonym: "marroquino", region: "África" },
  { code: "GHA", name: "Gana", demonym: "ganês", region: "África" },
  { code: "CPV", name: "Cabo Verde", demonym: "cabo-verdiano", region: "África" },
  { code: "ANG", name: "Angola", demonym: "angolano", region: "África" },
  { code: "MEX", name: "México", demonym: "mexicano", region: "América do Norte" },
  { code: "USA", name: "Estados Unidos", demonym: "estadunidense", region: "América do Norte" },
  { code: "CAN", name: "Canadá", demonym: "canadense", region: "América do Norte" },
  { code: "JPN", name: "Japão", demonym: "japonês", region: "Ásia" },
  { code: "KOR", name: "Coreia do Sul", demonym: "sul-coreano", region: "Ásia" },
  { code: "AUS", name: "Austrália", demonym: "australiano", region: "Oceania" },
];

export function findNationality(code: string): Nationality | undefined {
  return NATIONALITIES.find((n) => n.code === code);
}

/**
 * Catálogos para geração de ideias. Nomes de clubes aparecem apenas como texto
 * (uso nominativo) — nenhum escudo, logo ou asset proprietário é utilizado.
 */
export type ClubTier = "gigante" | "tradicional" | "emergente" | "modesto";

export interface ClubIdea {
  name: string;
  country: string;
  league: string;
  region:
    | "América do Sul"
    | "Europa Ocidental"
    | "Europa Central"
    | "Leste Europeu"
    | "Escandinávia"
    | "Ilhas Britânicas"
    | "Outros";
  tier: ClubTier;
  hook: string;
}

export const CLUB_TIER_LABEL: Record<ClubTier, string> = {
  gigante: "Gigante",
  tradicional: "Tradicional",
  emergente: "Em ascensão",
  modesto: "Modesto",
};

export const CLUBS: readonly ClubIdea[] = [
  {
    name: "Brighton",
    country: "Inglaterra",
    league: "Premier League",
    region: "Ilhas Britânicas",
    tier: "emergente",
    hook: "Vitrine de jovens: brilhe e o mercado vem até você.",
  },
  {
    name: "Brentford",
    country: "Inglaterra",
    league: "Premier League",
    region: "Ilhas Britânicas",
    tier: "emergente",
    hook: "Clube de dados e bolas paradas — encaixe ideal para um especialista.",
  },
  {
    name: "Sunderland",
    country: "Inglaterra",
    league: "Premier League",
    region: "Ilhas Britânicas",
    tier: "tradicional",
    hook: "Torcida gigante esperando um novo ídolo.",
  },
  {
    name: "Wrexham",
    country: "País de Gales",
    league: "Championship",
    region: "Ilhas Britânicas",
    tier: "modesto",
    hook: "Suba divisões com o clube e vire lenda local.",
  },
  {
    name: "Celtic",
    country: "Escócia",
    league: "Premiership",
    region: "Ilhas Britânicas",
    tier: "tradicional",
    hook: "Títulos todo ano e Champions League como palco.",
  },
  {
    name: "Real Sociedad",
    country: "Espanha",
    league: "LaLiga",
    region: "Europa Ocidental",
    tier: "tradicional",
    hook: "Base forte e futebol de posse.",
  },
  {
    name: "Girona",
    country: "Espanha",
    league: "LaLiga",
    region: "Europa Ocidental",
    tier: "emergente",
    hook: "Projeto ousado que adora apostar em jovens.",
  },
  {
    name: "Rayo Vallecano",
    country: "Espanha",
    league: "LaLiga",
    region: "Europa Ocidental",
    tier: "modesto",
    hook: "Bairro operário, estádio pequeno, coração enorme.",
  },
  {
    name: "Atalanta",
    country: "Itália",
    league: "Serie A",
    region: "Europa Ocidental",
    tier: "emergente",
    hook: "Intensidade máxima e marcação individual.",
  },
  {
    name: "Bologna",
    country: "Itália",
    league: "Serie A",
    region: "Europa Ocidental",
    tier: "tradicional",
    hook: "Tradição antiga voltando a sonhar alto.",
  },
  {
    name: "Como",
    country: "Itália",
    league: "Serie A",
    region: "Europa Ocidental",
    tier: "emergente",
    hook: "Projeto novo, à beira do lago, querendo crescer rápido.",
  },
  {
    name: "Lens",
    country: "França",
    league: "Ligue 1",
    region: "Europa Ocidental",
    tier: "tradicional",
    hook: "Uma das atmosferas mais quentes da França.",
  },
  {
    name: "Lille",
    country: "França",
    league: "Ligue 1",
    region: "Europa Ocidental",
    tier: "tradicional",
    hook: "Celeiro de talentos vendidos para gigantes.",
  },
  {
    name: "Freiburg",
    country: "Alemanha",
    league: "Bundesliga",
    region: "Europa Central",
    tier: "tradicional",
    hook: "Estabilidade rara: técnicos ficam, jogadores evoluem.",
  },
  {
    name: "Union Berlin",
    country: "Alemanha",
    league: "Bundesliga",
    region: "Europa Central",
    tier: "emergente",
    hook: "Clube de torcida, nascido da resistência.",
  },
  {
    name: "St. Pauli",
    country: "Alemanha",
    league: "Bundesliga",
    region: "Europa Central",
    tier: "modesto",
    hook: "Identidade forte e cultura única no futebol.",
  },
  {
    name: "Feyenoord",
    country: "Países Baixos",
    league: "Eredivisie",
    region: "Europa Central",
    tier: "tradicional",
    hook: "Roterdã operária e um estádio que treme.",
  },
  {
    name: "AZ Alkmaar",
    country: "Países Baixos",
    league: "Eredivisie",
    region: "Europa Central",
    tier: "emergente",
    hook: "Academia moderna, ótima para jovens.",
  },
  {
    name: "Club Brugge",
    country: "Bélgica",
    league: "Pro League",
    region: "Europa Central",
    tier: "tradicional",
    hook: "Trampolim clássico para as grandes ligas.",
  },
  {
    name: "Sporting CP",
    country: "Portugal",
    league: "Liga Portugal",
    region: "Europa Ocidental",
    tier: "gigante",
    hook: "Academia lendária e títulos nacionais.",
  },
  {
    name: "SC Braga",
    country: "Portugal",
    league: "Liga Portugal",
    region: "Europa Ocidental",
    tier: "tradicional",
    hook: "Quebre a hegemonia dos três grandes.",
  },
  {
    name: "Vitória SC",
    country: "Portugal",
    league: "Liga Portugal",
    region: "Europa Ocidental",
    tier: "tradicional",
    hook: "Guimarães vive futebol 24 horas por dia.",
  },
  {
    name: "Bodø/Glimt",
    country: "Noruega",
    league: "Eliteserien",
    region: "Escandinávia",
    tier: "emergente",
    hook: "Do círculo polar para noites europeias históricas.",
  },
  {
    name: "Malmö FF",
    country: "Suécia",
    league: "Allsvenskan",
    region: "Escandinávia",
    tier: "tradicional",
    hook: "Domine a Suécia e chame a atenção da Europa.",
  },
  {
    name: "FC Copenhague",
    country: "Dinamarca",
    league: "Superliga",
    region: "Escandinávia",
    tier: "tradicional",
    hook: "Champions League quase todo ano.",
  },
  {
    name: "Dinamo Zagreb",
    country: "Croácia",
    league: "HNL",
    region: "Leste Europeu",
    tier: "tradicional",
    hook: "Fábrica de craques croatas.",
  },
  {
    name: "Slavia Praga",
    country: "Tchéquia",
    league: "Chance Liga",
    region: "Leste Europeu",
    tier: "tradicional",
    hook: "Força física e noites europeias frias.",
  },
  {
    name: "Red Star Belgrado",
    country: "Sérvia",
    league: "SuperLiga",
    region: "Leste Europeu",
    tier: "tradicional",
    hook: "Pressão e paixão em doses extremas.",
  },
  {
    name: "Palmeiras",
    country: "Brasil",
    league: "Brasileirão",
    region: "América do Sul",
    tier: "gigante",
    hook: "Pressão por títulos desde o primeiro dia.",
  },
  {
    name: "Athletico Paranaense",
    country: "Brasil",
    league: "Brasileirão",
    region: "América do Sul",
    tier: "tradicional",
    hook: "Estrutura moderna e vitrine para a Europa.",
  },
  {
    name: "Fortaleza",
    country: "Brasil",
    league: "Brasileirão",
    region: "América do Sul",
    tier: "emergente",
    hook: "Projeto que cresceu rápido e quer mais.",
  },
  {
    name: "Mirassol",
    country: "Brasil",
    league: "Brasileirão",
    region: "América do Sul",
    tier: "modesto",
    hook: "Interior paulista surpreendendo o país.",
  },
  {
    name: "Vasco da Gama",
    country: "Brasil",
    league: "Brasileirão",
    region: "América do Sul",
    tier: "tradicional",
    hook: "Gigante adormecido esperando seu salvador.",
  },
  {
    name: "Boca Juniors",
    country: "Argentina",
    league: "Liga Profesional",
    region: "América do Sul",
    tier: "gigante",
    hook: "A Bombonera não perdoa — nem esquece.",
  },
  {
    name: "Racing Club",
    country: "Argentina",
    league: "Liga Profesional",
    region: "América do Sul",
    tier: "tradicional",
    hook: "Avellaneda e o clássico mais quente da cidade.",
  },
  {
    name: "Peñarol",
    country: "Uruguai",
    league: "Liga AUF",
    region: "América do Sul",
    tier: "tradicional",
    hook: "Garra charrua e história continental.",
  },
  {
    name: "Independiente del Valle",
    country: "Equador",
    league: "LigaPro",
    region: "América do Sul",
    tier: "emergente",
    hook: "Melhor formação da América do Sul.",
  },
  {
    name: "LAFC",
    country: "Estados Unidos",
    league: "MLS",
    region: "Outros",
    tier: "emergente",
    hook: "Mercado novo, holofote garantido.",
  },
  {
    name: "Kashima Antlers",
    country: "Japão",
    league: "J1 League",
    region: "Outros",
    tier: "tradicional",
    hook: "Disciplina japonesa e herança brasileira.",
  },
];

export const NAME_POOLS: Record<string, { first: readonly string[]; last: readonly string[] }> = {
  BRA: {
    first: [
      "Rafael",
      "João Pedro",
      "Kauã",
      "Matheus",
      "Gabriel",
      "Vinícius",
      "Davi",
      "Luan",
      "Caio",
      "Thiago",
    ],
    last: [
      "Monteiro",
      "Albuquerque",
      "Siqueira",
      "Teixeira",
      "Barros",
      "Nogueira",
      "Prado",
      "Rezende",
      "Falcão",
      "Moura",
    ],
  },
  ARG: {
    first: ["Santiago", "Facundo", "Thiago", "Lautaro", "Joaquín", "Valentín", "Bautista"],
    last: ["Ferreyra", "Acosta", "Benítez", "Quiroga", "Sosa", "Ledesma", "Villalba"],
  },
  URU: {
    first: ["Federico", "Agustín", "Nicolás", "Facundo", "Rodrigo"],
    last: ["Olivera", "Cáceres", "De León", "Píriz", "Techera"],
  },
  POR: {
    first: ["Tiago", "Rúben", "Diogo", "Gonçalo", "Afonso", "Rodrigo"],
    last: ["Valente", "Carvalho", "Mendes", "Sequeira", "Lobo", "Antunes"],
  },
  ESP: {
    first: ["Pablo", "Álvaro", "Hugo", "Iker", "Marcos", "Adrián"],
    last: ["Herrera", "Navarro", "Iglesias", "Ortega", "Castaño", "Prieto"],
  },
  FRA: {
    first: ["Mathis", "Lucas", "Enzo", "Nolan", "Théo", "Yanis"],
    last: ["Laurent", "Moreau", "Dubois", "Fontaine", "Girard", "Mercier"],
  },
  ENG: {
    first: ["Harry", "Callum", "Jude", "Archie", "Mason", "Freddie"],
    last: ["Whitmore", "Ashworth", "Holloway", "Pembroke", "Calloway", "Rowe"],
  },
  GER: {
    first: ["Lukas", "Jonas", "Felix", "Leon", "Niklas"],
    last: ["Brandt", "Hoffmann", "Krämer", "Vogel", "Lindner"],
  },
  ITA: {
    first: ["Lorenzo", "Matteo", "Federico", "Davide", "Tommaso"],
    last: ["Rinaldi", "Ferraro", "Colombo", "Vitale", "Mancini"],
  },
  NED: {
    first: ["Daan", "Sem", "Milan", "Thijs", "Jesse"],
    last: ["de Groot", "van Dijkstra", "Visser", "Bakker", "Mulder"],
  },
  NOR: {
    first: ["Erling", "Sander", "Magnus", "Jonas", "Even"],
    last: ["Haugen", "Solbakken", "Lund", "Strand", "Dahl"],
  },
  SEN: {
    first: ["Moussa", "Ibrahima", "Cheikh", "Pape", "Lamine"],
    last: ["Diallo", "Ndiaye", "Sarr", "Faye", "Cissé"],
  },
  NGA: {
    first: ["Chukwuemeka", "Tobi", "Samuel", "Victor", "Ademola"],
    last: ["Okafor", "Adeyemi", "Eze", "Balogun", "Nwosu"],
  },
  MAR: {
    first: ["Youssef", "Achraf", "Bilal", "Ilias", "Amine"],
    last: ["El Idrissi", "Benali", "Ziyech", "Amrani", "Tahiri"],
  },
  JPN: {
    first: ["Takumi", "Kaoru", "Ritsu", "Daichi", "Yuto"],
    last: ["Nakamura", "Sato", "Kobayashi", "Morita", "Ishikawa"],
  },
  COL: {
    first: ["Juan Camilo", "Jhon", "Santiago", "Andrés", "Yerson"],
    last: ["Valencia", "Mosquera", "Arboleda", "Cuesta", "Rentería"],
  },
};

export const NICKNAMES: readonly string[] = [
  "Rafa",
  "Tito",
  "Dudu",
  "Neno",
  "Kiko",
  "Juju",
  "Zeca",
  "Lelo",
  "Bebeto",
  "Tico",
  "Guga",
  "Pepo",
];

export type ChallengeDifficulty = "leve" | "médio" | "brutal";

export interface ChallengeIdea {
  id: string;
  title: string;
  rule: string;
  difficulty: ChallengeDifficulty;
}

export const CHALLENGES: readonly ChallengeIdea[] = [
  {
    id: "pequeno",
    title: "Do zero ao topo",
    rule: "Comece em um clube modesto da segunda divisão e só aceite propostas de clubes maiores que o atual.",
    difficulty: "médio",
  },
  {
    id: "ovr-baixo",
    title: "Patinho feio",
    rule: "Comece com overall 55 ou menos e chegue a 80 antes dos 24 anos.",
    difficulty: "brutal",
  },
  {
    id: "one-club",
    title: "Bandeira",
    rule: "Fique 8 temporadas no mesmo clube, recusando todas as propostas.",
    difficulty: "médio",
  },
  {
    id: "titulo",
    title: "Orelhuda ou nada",
    rule: "Conquiste a Champions League por um clube fora das cinco grandes ligas.",
    difficulty: "brutal",
  },
  {
    id: "artilheiro",
    title: "Faro de gol",
    rule: "Seja artilheiro da liga em três temporadas diferentes.",
    difficulty: "médio",
  },
  {
    id: "selecao",
    title: "Camisa da seleção",
    rule: "Seja convocado para a seleção principal antes dos 21 anos.",
    difficulty: "médio",
  },
  {
    id: "regiao",
    title: "Rota escandinava",
    rule: "Construa toda a carreira em clubes da Escandinávia.",
    difficulty: "leve",
  },
  {
    id: "evitar",
    title: "Sem Premier League",
    rule: "Recuse qualquer proposta da Inglaterra durante toda a carreira.",
    difficulty: "leve",
  },
  {
    id: "idade",
    title: "Relógio correndo",
    rule: "Conquiste uma liga nacional antes de completar 22 anos.",
    difficulty: "médio",
  },
  {
    id: "mochileiro",
    title: "Mochileiro",
    rule: "Jogue em cinco países diferentes, uma temporada completa em cada.",
    difficulty: "leve",
  },
  {
    id: "garcom",
    title: "Garçom",
    rule: "Termine uma temporada com mais assistências do que gols e pelo menos 15 assistências.",
    difficulty: "médio",
  },
  {
    id: "disciplina",
    title: "Fair play",
    rule: "Passe uma temporada inteira sem receber cartões.",
    difficulty: "leve",
  },
];

export const CHALLENGE_DIFFICULTY_TONE: Record<ChallengeDifficulty, "win" | "accent" | "loss"> = {
  leve: "win",
  médio: "accent",
  brutal: "loss",
};

export interface InspirationIdea {
  id: string;
  era: string;
  archetypeId: string;
  title: string;
  traits: readonly string[];
  /** Referência histórica de estilo de jogo — o conceito gerado é sempre um personagem novo. */
  reference: string;
}

export const INSPIRATIONS: readonly InspirationIdea[] = [
  {
    id: "fenomeno",
    era: "Anos 90",
    archetypeId: "driblador",
    title: "Arrancada imparável",
    traits: [
      "Explosão em velocidade com bola",
      "Drible curto em alta rotação",
      "Finalização de bico, sem aviso",
    ],
    reference: "Centroavantes brasileiros dos anos 90, como Ronaldo Nazário",
  },
  {
    id: "maestro",
    era: "Anos 2000",
    archetypeId: "camisa-10",
    title: "Maestro de pausa",
    traits: ["Controle orientado", "Giro de 360° sob pressão", "Passe que quebra linhas"],
    reference: "Meias franceses da virada do século, como Zinédine Zidane",
  },
  {
    id: "regista",
    era: "Anos 2000",
    archetypeId: "regista",
    title: "Relojoeiro",
    traits: ["Lançamentos de 40 metros", "Cobranças de falta", "Joga sem correr"],
    reference: "Volantes construtores italianos, como Andrea Pirlo",
  },
  {
    id: "capitao",
    era: "Anos 90",
    archetypeId: "xerife",
    title: "Capitão eterno",
    traits: ["Antecipação", "Elegância no desarme", "Uma carreira, um clube"],
    reference: "Defensores italianos como Paolo Maldini",
  },
  {
    id: "lateral",
    era: "Anos 90",
    archetypeId: "lateral-ofensivo",
    title: "Corredor infinito",
    traits: ["Ida e volta 90 minutos", "Cruzamento de primeira", "Liderança silenciosa"],
    reference: "Laterais brasileiros campeões do mundo, como Cafu",
  },
  {
    id: "baixinho",
    era: "Anos 90",
    archetypeId: "finalizador",
    title: "Artilheiro de área pequena",
    traits: ["Toque de categoria", "Movimentação curta", "Sangue frio diante do goleiro"],
    reference: "Atacantes de área como Romário",
  },
  {
    id: "elegancia",
    era: "Anos 2000",
    archetypeId: "velocista",
    title: "Elegância em velocidade",
    traits: ["Parte da esquerda para o meio", "Chute colocado no canto", "Contra-ataque letal"],
    reference: "Atacantes como Thierry Henry",
  },
  {
    id: "enganche",
    era: "Anos 2000",
    archetypeId: "camisa-10",
    title: "Enganche cerebral",
    traits: ["Protege a bola com o corpo", "Ritmo próprio", "Passe sem olhar"],
    reference: "Meias argentinos como Juan Román Riquelme",
  },
  {
    id: "carrilero",
    era: "Anos 2000",
    archetypeId: "destruidor",
    title: "Muralha do meio",
    traits: ["Leitura de jogo", "Desarme limpo", "Passe simples e seguro"],
    reference: "Volantes de contenção como Claude Makélélé",
  },
  {
    id: "kaka",
    era: "Anos 2000",
    archetypeId: "box-to-box",
    title: "Arrancada vertical",
    traits: ["Condução em linha reta", "Chegada à área", "Chute de média distância"],
    reference: "Meias de infiltração como Kaká",
  },
];

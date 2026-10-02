export type NewsCategory = "match" | "transfer" | "national-team" | "feature" | "rumor";

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  match: "Jogo",
  transfer: "Mercado",
  "national-team": "Seleção",
  feature: "Reportagem",
  rumor: "Bastidores",
};

export interface NewsArticle {
  id: string;
  date: string;
  outlet: string;
  category: NewsCategory;
  headline: string;
  standfirst: string;
  body: string[];
  matchId?: string;
  /** Gerada automaticamente pelo app (templates hoje, IA no futuro). */
  generated?: boolean;
}

/** Veículos fictícios — nenhum nome de imprensa real. */
export const OUTLETS = [
  "Diário da Bola",
  "Gazeta do Gramado",
  "Radar de Mercado",
  "A Tribuna Esportiva",
] as const;

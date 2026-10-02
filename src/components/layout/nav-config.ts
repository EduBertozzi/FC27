import {
  BookOpen,
  CalendarClock,
  Home,
  type LucideIcon,
  MessageCircle,
  Newspaper,
  Palette,
  Sparkles,
  Trophy,
  UserRound,
  Waypoints,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Rotas filhas que também marcam o item como ativo. */
  match?: RegExp;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Início", icon: Home, match: /^\/$/ },
  { href: "/carreira", label: "Carreira", icon: Trophy },
  { href: "/partidas", label: "Partidas", icon: CalendarClock, match: /^\/partidas(?!\/nova)/ },
  { href: "/timeline", label: "Timeline", icon: Waypoints },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/jogador", label: "Perfil", icon: UserRound },
];

export const COMPANION_NAV: NavItem[] = [
  { href: "/assistente", label: "Assistente", icon: MessageCircle },
  { href: "/ideias", label: "Estou sem ideia", icon: Sparkles },
];

export const META_NAV: NavItem[] = [
  { href: "/design-system", label: "Design System", icon: Palette },
];

/** Barra inferior do mobile: no máximo 5 destinos, ação principal no centro. */
export const MOBILE_TABS: NavItem[] = [
  { href: "/", label: "Início", icon: Home, match: /^\/$/ },
  { href: "/carreira", label: "Carreira", icon: Trophy },
  { href: "/timeline", label: "Timeline", icon: Waypoints },
];

export const MORE_NAV: NavItem[] = [
  { href: "/partidas", label: "Partidas", icon: CalendarClock, match: /^\/partidas(?!\/nova)/ },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/jogador", label: "Perfil do jogador", icon: UserRound },
  { href: "/assistente", label: "Assistente", icon: MessageCircle },
  { href: "/ideias", label: "Estou sem ideia", icon: Sparkles },
  { href: "/design-system", label: "Design System", icon: BookOpen },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.match) return item.match.test(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

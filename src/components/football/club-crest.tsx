import { cn } from "@/lib/cn";
import { hashString } from "@/lib/random";

/** Pares de cores genéricas — escudos são monogramas ilustrativos, nunca os oficiais. */
const KITS: readonly [string, string][] = [
  ["#1f6b4a", "#f1f4fa"],
  ["#a3262a", "#f1f4fa"],
  ["#1f4e9c", "#f1f4fa"],
  ["#e6e1d3", "#14223d"],
  ["#5b2d8c", "#f1f4fa"],
  ["#c4621c", "#f1f4fa"],
  ["#0f7c8c", "#f1f4fa"],
  ["#b8932f", "#14223d"],
  ["#3a4150", "#f6b940"],
];

const IGNORED = new Set(["fc", "sc", "cf", "ac", "de", "da", "do", "del", "the", "club"]);

export function monogram(name: string): string {
  const words = name.split(/[\s/.-]+/).filter(Boolean);
  const significant = words.filter((w) => !IGNORED.has(w.toLowerCase()));
  const base = significant.length > 0 ? significant : words;
  if (base.length === 1) return (base[0] ?? "?").slice(0, 3).toUpperCase();
  return base
    .slice(0, 3)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();
}

const SIZES = {
  sm: "size-7 text-[0.6rem]",
  md: "size-10 text-[0.7rem]",
  lg: "size-14 text-sm",
  xl: "size-20 text-lg",
} as const;

/** Monograma circular nas cores genéricas do clube — nunca o escudo oficial. */
export function ClubCrest({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [bg, fg] = clubColors(name);
  return (
    <span
      role="img"
      aria-label={`Escudo ilustrativo: ${name}`}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-bold tracking-tight shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_12px_rgb(0_0_0/0.25)]",
        SIZES[size],
        className,
      )}
      style={{ background: bg, color: fg }}
    >
      <span aria-hidden="true">{monogram(name)}</span>
    </span>
  );
}

/** Cores tradicionais de alguns clubes (apenas cores, nenhum escudo ou marca). */
const KNOWN: Record<string, [string, string]> = {
  "sporting cp": ["#0f7a45", "#ffffff"],
  benfica: ["#d0102e", "#ffffff"],
  "fc porto": ["#1d4e9c", "#ffffff"],
  "sc braga": ["#c8102e", "#ffffff"],
  arsenal: ["#db0007", "#ffffff"],
  juventus: ["#1a1a1a", "#ffffff"],
  psv: ["#e30613", "#ffffff"],
  "club brugge": ["#0a3d91", "#ffffff"],
  "athletico paranaense": ["#c8102e", "#111111"],
  palmeiras: ["#006437", "#ffffff"],
  "boca juniors": ["#0b3b8c", "#ffd200"],
  mirassol: ["#ffd200", "#0b5d2b"],
};

/** Cor principal e de contraste do clube: tradicional quando conhecida, senão genérica pelo nome. */
export function clubColors(name: string): [string, string] {
  const [bg] = KNOWN[name.trim().toLowerCase()] ?? KITS[hashString(name) % KITS.length] ?? KITS[0]!;
  return [bg, readableOn(bg)];
}

/** Texto branco ou quase-preto, o que tiver mais contraste com o fundo (WCAG). */
export function readableOn(hex: string): string {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  const onWhite = 1.05 / (lum + 0.05);
  const onDark = (lum + 0.05) / 0.0615;
  return onWhite >= onDark ? "#ffffff" : "#0b0f19";
}

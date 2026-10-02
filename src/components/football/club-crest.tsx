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
  sm: "size-7 text-[0.625rem]",
  md: "size-10 text-xs",
  lg: "size-14 text-base",
  xl: "size-20 text-xl",
} as const;

export function ClubCrest({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [bg, fg] = KITS[hashString(name) % KITS.length] ?? KITS[0]!;
  const letters = monogram(name);
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", SIZES[size], className)}
      role="img"
      aria-label={`Escudo ilustrativo: ${name}`}
    >
      <svg viewBox="0 0 40 46" className="absolute inset-0 size-full" aria-hidden="true">
        <path
          d="M20 1.5 37.5 7v15.5c0 10.6-7.3 18.6-17.5 22-10.2-3.4-17.5-11.4-17.5-22V7z"
          fill={bg}
          stroke="rgb(255 255 255 / 0.18)"
          strokeWidth="1.5"
        />
        <path d="M2.5 15h35" stroke={fg} strokeOpacity="0.18" strokeWidth="1.5" />
      </svg>
      <span
        className="relative mt-[8%] font-display leading-none font-bold tracking-tight"
        style={{ color: fg }}
        aria-hidden="true"
      >
        {letters}
      </span>
    </span>
  );
}

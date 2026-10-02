import { cn } from "@/lib/cn";

const SIZES = {
  sm: "size-10 text-sm",
  md: "size-14 text-xl",
  lg: "size-24 text-4xl",
  xl: "size-36 text-6xl",
} as const;

/** Avatar do jogador: camisa com o número (sem fotos de pessoas reais). */
export function PlayerShirt({
  number,
  size = "md",
  className,
  label,
}: {
  number: number;
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", SIZES[size], className)}
      role="img"
      aria-label={label ?? `Camisa ${number}`}
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full" aria-hidden="true">
        <path
          d="M22 6h20l4 3 12 6-5 13-7-3v33H18V25l-7 3L6 15l12-6z"
          fill="var(--surface-3)"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M26 6c1.5 4 10.5 4 12 0" fill="none" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <span
        className="tabular relative mt-[18%] font-display leading-none font-bold text-fg"
        aria-hidden="true"
      >
        {number}
      </span>
    </span>
  );
}

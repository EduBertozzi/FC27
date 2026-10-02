import { findNationality } from "@/domain/player/nationalities";
import { cn } from "@/lib/cn";

/** Seleção representada pelo código de três letras (sem bandeiras). */
export function NationTag({
  code,
  showName,
  className,
}: {
  code: string;
  showName?: boolean;
  className?: string;
}) {
  const nation = findNationality(code);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <abbr
        title={nation?.name ?? code}
        className="inline-grid h-5 min-w-9 place-items-center rounded-xs border border-line-strong px-1 font-display text-xs font-bold tracking-wider text-fg-2 no-underline"
      >
        {code}
      </abbr>
      {showName && nation ? <span>{nation.name}</span> : null}
    </span>
  );
}

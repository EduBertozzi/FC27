import { RESULT_SHORT, type MatchResult } from "@/domain/match/match";
import { cn } from "@/lib/cn";

import { ResultBadge } from "../ui/badge";

export function FormGuide({
  results,
  size = "md",
  className,
}: {
  results: readonly MatchResult[];
  size?: "sm" | "md";
  className?: string;
}) {
  if (results.length === 0) return <span className="text-sm text-fg-3">Sem jogos</span>;
  return (
    <span
      role="img"
      aria-label={`Forma recente, do mais antigo ao mais recente: ${results.map((r) => RESULT_SHORT[r]).join(" ")}`}
      className={cn("inline-flex items-center gap-1", className)}
    >
      {results.map((r, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            i === results.length - 1 &&
              "rounded-xs ring-2 ring-fg/60 ring-offset-2 ring-offset-surface-1",
          )}
        >
          <ResultBadge result={r} size={size} />
        </span>
      ))}
    </span>
  );
}

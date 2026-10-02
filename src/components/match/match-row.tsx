import { Goal, Footprints } from "lucide-react";

import { type Match, resultOf, ROLE_LABEL, VENUE_LABEL } from "@/domain/match/match";
import { cn } from "@/lib/cn";
import { formatDate, formatRating } from "@/lib/format";

import { ClubCrest } from "../football/club-crest";
import { ResultBadge } from "../ui/badge";

export function ratingTone(rating: number | null): string {
  if (rating === null) return "text-fg-3";
  if (rating >= 8) return "text-win";
  if (rating < 6.5) return "text-loss";
  return "text-fg";
}

/** Linha de partida: resultado, adversário, contribuição e nota — escaneável em uma olhada. */
export function MatchRow({ match, className }: { match: Match; className?: string }) {
  const result = resultOf(match);
  return (
    <div className={cn("flex items-center gap-3 py-3", className)}>
      <ResultBadge result={result} />
      <ClubCrest name={match.opponent} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fg">
          <span className="sr-only">{VENUE_LABEL[match.venue]} contra </span>
          {match.venue === "away" ? "@ " : ""}
          {match.opponent}
          <span className="tabular ml-2 font-display text-lg text-fg-2">
            {match.goalsFor}–{match.goalsAgainst}
          </span>
        </p>
        <p className="truncate text-xs text-fg-3">
          {formatDate(match.date)} · {match.competition}
          {match.role === "substitute" ? ` · ${ROLE_LABEL.substitute}, ${match.minutes}'` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        {match.goals > 0 ? (
          <span
            className="inline-flex items-center gap-1 font-semibold text-fg"
            title={`${match.goals} gol(s)`}
          >
            <Goal className="size-4 text-chart-1" aria-hidden="true" />
            {match.goals}
            <span className="sr-only"> gols</span>
          </span>
        ) : null}
        {match.assists > 0 ? (
          <span
            className="inline-flex items-center gap-1 font-semibold text-fg"
            title={`${match.assists} assistência(s)`}
          >
            <Footprints className="size-4 text-chart-2" aria-hidden="true" />
            {match.assists}
            <span className="sr-only"> assistências</span>
          </span>
        ) : null}
        <span
          className={cn(
            "tabular w-9 text-right font-display text-xl font-bold",
            ratingTone(match.rating),
          )}
        >
          <span className="sr-only">Nota </span>
          {formatRating(match.rating)}
        </span>
      </div>
    </div>
  );
}

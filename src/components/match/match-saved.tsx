"use client";

import { LayoutDashboard, Plus, Waypoints } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { type RegisterMatchOutcome } from "@/application/register-match";
import { resultOf, RESULT_LABEL } from "@/domain/match/match";
import { cn } from "@/lib/cn";
import { formatRating } from "@/lib/format";

import { NewsCard } from "../news/news-card";
import { EVENT_META, TONE_CLASSES } from "../timeline/event-meta";
import { ResultBadge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardBody, CardHeader } from "../ui/card";

/** Feedback de sucesso: mostra o que a partida mudou na carreira. */
export function MatchSaved({
  outcome,
  onAnother,
}: {
  outcome: RegisterMatchOutcome;
  onAnother: () => void;
}) {
  const { match, events, news } = outcome;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  const result = resultOf(match);

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-3 bg-win-soft px-5 py-8 text-center">
          <ResultBadge result={result} />
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-3xl font-bold focus:outline-none sm:text-4xl"
          >
            Partida registrada
          </h1>
          <p className="text-fg-2">
            {RESULT_LABEL[result]} por {match.goalsFor}–{match.goalsAgainst} contra o{" "}
            {match.opponent}. {match.goals} gol(s), {match.assists} assistência(s), nota{" "}
            {formatRating(match.rating)}.
          </p>
        </div>
      </Card>

      {events.length > 0 ? (
        <Card>
          <CardHeader title="Novos marcos na timeline" icon={<Waypoints />} />
          <CardBody>
            <ul className="flex flex-col gap-3">
              {events.map((e) => {
                const meta = EVENT_META[e.type];
                const Icon = meta.icon;
                return (
                  <li key={e.id} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full",
                        TONE_CLASSES[meta.tone],
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="font-medium">{e.title}</span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      ) : null}

      {news ? (
        <Card>
          <CardHeader title="Virou notícia" />
          <CardBody>
            <NewsCard article={news} featured />
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        <Button asChild>
          <Link href="/carreira">
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Ver painel da carreira
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/timeline">
            <Waypoints className="size-4" aria-hidden="true" />
            Abrir timeline
          </Link>
        </Button>
        <Button variant="secondary" onClick={onAnother}>
          <Plus className="size-4" aria-hidden="true" />
          Registrar outra
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Waypoints } from "lucide-react";
import { useMemo, useState } from "react";

import { type Career } from "@/domain/career/career";
import { EVENT_TYPE_LABEL, groupBySeason, type TimelineEventType } from "@/domain/timeline/events";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { useActiveCareer } from "@/state/career-store";

import { ClubCrest } from "../football/club-crest";
import { CareerGate, PageContainer, PageHeader } from "../layout/page";
import { Card } from "../ui/card";
import { EmptyState } from "../ui/feedback";
import { EVENT_META, TONE_CLASSES } from "./event-meta";

const FILTERS: { id: string; label: string; types: TimelineEventType[] | null }[] = [
  { id: "all", label: "Tudo", types: null },
  { id: "glory", label: "Conquistas", types: ["title", "award", "record", "milestone"] },
  { id: "path", label: "Trajetória", types: ["debut", "transfer", "renewal", "call-up"] },
  { id: "pitch", label: "Em campo", types: ["first-goal", "first-assist", "special"] },
  { id: "drama", label: "Bastidores", types: ["injury", "rivalry", "interview"] },
];

function clubForSeason(career: Career, season: string): string | undefined {
  if (season === career.currentSeason) return career.currentClub;
  const summary = career.pastSeasons.find((s) => s.season === season);
  if (summary) return summary.club;
  return [...career.clubHistory]
    .reverse()
    .find((c) => c.from <= season && (!c.to || c.to >= season))?.club;
}

function Timeline() {
  const career = useActiveCareer();
  const [filter, setFilter] = useState("all");
  const types = FILTERS.find((f) => f.id === filter)?.types ?? null;
  const groups = useMemo(
    () => groupBySeason(career.events.filter((e) => !types || types.includes(e.type))),
    [career.events, types],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timeline"
        description="A história da carreira, capítulo por capítulo. Marcos de partidas entram aqui automaticamente."
      />

      <div
        className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        role="group"
        aria-label="Filtrar acontecimentos"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
              filter === f.id
                ? "border-accent bg-accent text-on-accent"
                : "border-line text-fg-2 hover:border-line-strong hover:text-fg",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Waypoints />}
            title="Nada por aqui ainda"
            description="Nenhum acontecimento neste filtro. Registre partidas para gerar marcos automaticamente."
          />
        </Card>
      ) : (
        <ol className="flex flex-col gap-10">
          {groups.map(({ season, events }) => {
            const club = clubForSeason(career, season);
            return (
              <li key={season}>
                <section aria-labelledby={`season-${season}`}>
                  <header className="mb-5 flex items-center gap-3">
                    {club ? <ClubCrest name={club} /> : null}
                    <div>
                      <h2
                        id={`season-${season}`}
                        className="font-display text-3xl leading-none font-bold"
                      >
                        {season}
                      </h2>
                      {club ? <p className="text-sm text-fg-3">{club}</p> : null}
                    </div>
                  </header>
                  <ol className="relative ml-5 border-l border-line-strong pl-8">
                    {events.map((e) => {
                      const meta = EVENT_META[e.type];
                      const Icon = meta.icon;
                      return (
                        <li key={e.id} className="relative pb-6 last:pb-0">
                          <span
                            className={cn(
                              "absolute -left-[3.05rem] grid place-items-center rounded-full ring-4 ring-bg",
                              e.highlight ? "top-3 size-10" : "top-0.5 size-8",
                              TONE_CLASSES[meta.tone],
                            )}
                            aria-hidden="true"
                          >
                            <Icon className={e.highlight ? "size-5" : "size-4"} />
                          </span>
                          <article
                            className={cn(
                              e.highlight
                                ? "rounded-md border border-accent/30 bg-surface-1 p-4"
                                : "py-0.5",
                            )}
                          >
                            <p className="text-xs text-fg-3">
                              <span className="font-semibold text-fg-2">
                                {EVENT_TYPE_LABEL[e.type]}
                              </span>{" "}
                              · <time dateTime={e.date}>{formatDate(e.date, "long")}</time>
                            </p>
                            <h3
                              className={cn(
                                "mt-0.5 font-semibold text-fg",
                                e.highlight ? "font-display text-2xl leading-tight" : "text-base",
                              )}
                            >
                              {e.title}
                            </h3>
                            {e.description ? (
                              <p className="mt-1 text-sm text-fg-2">{e.description}</p>
                            ) : null}
                          </article>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function TimelineView() {
  return (
    <PageContainer width="narrow">
      <CareerGate>
        <Timeline />
      </CareerGate>
    </PageContainer>
  );
}

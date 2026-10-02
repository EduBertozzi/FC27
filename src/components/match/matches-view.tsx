"use client";

import { CalendarClock, Mic, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { type MatchResult, resultOf, sortByDateDesc, VENUE_LABEL } from "@/domain/match/match";
import { aggregate } from "@/domain/stats/stats";
import { formatDate, formatRating } from "@/lib/format";
import { useActiveCareer } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

import { ClubCrest } from "../football/club-crest";
import { CareerGate, PageContainer, PageHeader } from "../layout/page";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import { EmptyState } from "../ui/feedback";
import { Select } from "../ui/field";
import { SegmentedControl } from "../ui/segmented-control";
import { MatchRow } from "./match-row";

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function Matches() {
  const career = useActiveCareer();
  const { seasonMatches, today } = useCareerOverview(career);
  const [competition, setCompetition] = useState("all");
  const [result, setResult] = useState<MatchResult | "all">("all");

  const competitions = useMemo(
    () => [...new Set(seasonMatches.map((m) => m.competition))],
    [seasonMatches],
  );
  const filtered = useMemo(
    () =>
      sortByDateDesc(seasonMatches).filter(
        (m) =>
          (competition === "all" || m.competition === competition) &&
          (result === "all" || resultOf(m) === result),
      ),
    [seasonMatches, competition, result],
  );
  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const m of filtered)
      map.set(m.date.slice(0, 7), [...(map.get(m.date.slice(0, 7)) ?? []), m]);
    return [...map.entries()];
  }, [filtered]);
  const line = aggregate(filtered);
  const fixtures = career.fixtures
    .filter((f) => f.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Partidas"
        description={`Temporada ${career.currentSeason} no ${career.currentClub}.`}
        actions={
          <>
            <Button asChild variant="ai">
              <Link href="/partidas/nova?modo=voz">
                <Mic className="size-4" aria-hidden="true" />
                Por voz
              </Link>
            </Button>
            <Button asChild>
              <Link href="/partidas/nova">
                <Plus className="size-4" aria-hidden="true" />
                Registrar partida
              </Link>
            </Button>
          </>
        }
      />

      {fixtures.length > 0 ? (
        <Card>
          <CardHeader title="Próximos jogos" icon={<CalendarClock />} />
          <ul className="flex scrollbar-none gap-3 overflow-x-auto px-4 pt-3 pb-4 sm:px-5">
            {fixtures.map((f) => (
              <li
                key={f.id}
                className="w-60 shrink-0 rounded-md border border-line bg-surface-2 p-3"
              >
                <div className="flex items-center gap-2.5">
                  <ClubCrest name={f.opponent} size="sm" />
                  <span className="truncate font-semibold">
                    {f.venue === "away" ? "@ " : ""}
                    {f.opponent}
                  </span>
                </div>
                <p className="mt-2 text-sm text-fg-2 capitalize">{formatDate(f.date, "weekday")}</p>
                <p className="text-xs text-fg-3">
                  {f.competition} · {VENUE_LABEL[f.venue]}
                </p>
                <Link
                  href={`/partidas/nova?adversario=${encodeURIComponent(f.opponent)}&competicao=${encodeURIComponent(f.competition)}&mando=${f.venue}&data=${f.date}`}
                  className="mt-2 inline-flex h-9 items-center text-sm font-semibold text-accent hover:underline"
                >
                  Registrar resultado
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {seasonMatches.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock />}
            title="Nenhuma partida registrada"
            description="Cada jogo registrado alimenta estatísticas, timeline e notícias da sua carreira."
            action={
              <Button asChild>
                <Link href="/partidas/nova">Registrar primeira partida</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select
                aria-label="Competição"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className="sm:w-56"
              >
                <option value="all">Todas as competições</option>
                {competitions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <SegmentedControl
                aria-label="Resultado"
                value={result}
                onValueChange={setResult}
                className="sm:w-64"
                options={[
                  { value: "all", label: "Todos" },
                  { value: "W", label: "V" },
                  { value: "D", label: "E" },
                  { value: "L", label: "D" },
                ]}
              />
            </div>
            <p className="text-sm text-fg-3" aria-live="polite">
              {line.appearances} jogos · {line.goals} G · {line.assists} A · nota{" "}
              {formatRating(line.averageRating)}
            </p>
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<SearchX />}
              title="Nenhum jogo com esses filtros"
              description="Tente outra competição ou resultado."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setCompetition("all");
                    setResult("all");
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <div className="px-4 pb-2 sm:px-5">
              {groups.map(([month, matches]) => (
                <section
                  key={month}
                  aria-label={`${MONTHS[Number(month.slice(5)) - 1]} de ${month.slice(0, 4)}`}
                >
                  <h2 className="sticky top-14 z-10 -mx-4 bg-surface-1/95 px-4 pt-4 pb-1 text-xs font-semibold text-fg-3 capitalize backdrop-blur sm:-mx-5 sm:px-5 lg:top-0">
                    {MONTHS[Number(month.slice(5)) - 1]} {month.slice(0, 4)}
                  </h2>
                  <ul className="divide-y divide-line">
                    {matches.map((m) => (
                      <li key={m.id}>
                        <MatchRow match={m} />
                        {m.notes ? (
                          <p className="-mt-2 pb-3 pl-10 text-sm text-fg-3 italic">{m.notes}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export function MatchesView() {
  return (
    <PageContainer>
      <CareerGate>
        <Matches />
      </CareerGate>
    </PageContainer>
  );
}

"use client";

import { BarChart3, LineChart, ListOrdered, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { type Career } from "@/domain/career/career";
import {
  aggregate,
  monthlyContributions,
  per90,
  ratingSeries,
  summaryToStatLine,
  type StatLine,
} from "@/domain/stats/stats";
import { formatMarketValue, formatNumber, formatRating } from "@/lib/format";
import { useActiveCareer } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

import { ContributionsChart } from "../charts/contributions-chart";
import { OverallChart } from "../charts/overall-chart";
import { RatingChart } from "../charts/rating-chart";
import { ResultsBar } from "../charts/results-bar";
import { CareerGate, PageContainer, PageHeader } from "../layout/page";
import { Button } from "../ui/button";
import { Card, CardBody, CardHeader } from "../ui/card";
import { EmptyState } from "../ui/feedback";
import { SegmentedControl } from "../ui/segmented-control";
import { Stat, StatGrid } from "../ui/stat";
import { AwardsCard, RecordsCard, TrophiesCard } from "./honours";

type Scope = "season" | "career";

function KpiCard({ line, career, scope }: { line: StatLine; career: Career; scope: Scope }) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-6 sm:py-6">
        <StatGrid className="grid-cols-2 gap-y-6 sm:grid-cols-4">
          <Stat label="Jogos" value={line.appearances} />
          <Stat label="Titular" value={line.starts} />
          <Stat label="Minutos" value={formatNumber(line.minutes)} />
          <Stat
            label="Gols"
            value={line.goals}
            emphasis
            sub={`${formatNumber(per90(line.goals, line.minutes), 2)} por 90'`}
          />
          <Stat
            label="Assistências"
            value={line.assists}
            sub={`${formatNumber(per90(line.assists, line.minutes), 2)} por 90'`}
          />
          <Stat label="Nota média" value={formatRating(line.averageRating)} />
          <Stat
            label="Cartões"
            value={
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="h-5 w-3.5 rounded-[3px] bg-card-yellow" aria-hidden="true" />
                  {line.yellowCards}
                  <span className="sr-only"> amarelos,</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-5 w-3.5 rounded-[3px] bg-card-red" aria-hidden="true" />
                  {line.redCards}
                  <span className="sr-only"> vermelhos</span>
                </span>
              </span>
            }
          />
          <Stat
            label={scope === "season" ? "Valor de mercado" : "Overall atual"}
            value={
              scope === "season" ? formatMarketValue(career.marketValue) : career.player.overall
            }
          />
        </StatGrid>
        <ResultsBar wins={line.wins} draws={line.draws} losses={line.losses} />
      </CardBody>
    </Card>
  );
}

function CompetitionTable({ career }: { career: Career }) {
  const rows = useMemo(() => {
    const byComp = new Map<string, typeof career.matches>();
    for (const m of career.matches.filter((m) => m.season === career.currentSeason))
      byComp.set(m.competition, [...(byComp.get(m.competition) ?? []), m]);
    return [...byComp.entries()]
      .map(([competition, ms]) => ({ competition, line: aggregate(ms) }))
      .sort((a, b) => b.line.appearances - a.line.appearances);
  }, [career]);
  return (
    <Card>
      <CardHeader
        title="Por competição"
        icon={<ListOrdered />}
        description={`Temporada ${career.currentSeason}`}
      />
      <div
        className="overflow-x-auto px-1 pb-2"
        tabIndex={0}
        role="region"
        aria-label="Tabela por competição"
      >
        <table className="tabular w-full min-w-[28rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-fg-3">
              <th scope="col" className="px-4 py-2 font-medium">
                Competição
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">
                J
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">
                G
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">
                A
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Nota
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ competition, line }) => (
              <tr key={competition} className="border-t border-line">
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {competition}
                </th>
                <td className="px-2 py-2.5 text-right text-fg-2">{line.appearances}</td>
                <td className="px-2 py-2.5 text-right font-semibold">{line.goals}</td>
                <td className="px-2 py-2.5 text-right text-fg-2">{line.assists}</td>
                <td className="px-4 py-2.5 text-right text-fg-2">
                  {formatRating(line.averageRating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SeasonsTable({ career, current }: { career: Career; current: StatLine }) {
  const rows = [
    ...career.pastSeasons.map((s) => ({
      season: s.season,
      club: s.club,
      line: summaryToStatLine(s),
    })),
    { season: career.currentSeason, club: career.currentClub, line: current, current: true },
  ].reverse();
  return (
    <Card>
      <CardHeader title="Por temporada" icon={<BarChart3 />} />
      <div
        className="overflow-x-auto px-1 pb-2"
        tabIndex={0}
        role="region"
        aria-label="Tabela por temporada"
      >
        <table className="tabular w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-fg-3">
              <th scope="col" className="px-4 py-2 font-medium">
                Temporada
              </th>
              <th scope="col" className="px-2 py-2 font-medium">
                Clube
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">
                J
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">
                G
              </th>
              <th scope="col" className="px-2 py-2 text-right font-medium">
                A
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Nota
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.season} className="border-t border-line">
                <th scope="row" className="px-4 py-2.5 text-left font-medium">
                  {r.season}
                  {"current" in r ? (
                    <span className="ml-2 text-xs font-normal text-accent">atual</span>
                  ) : null}
                </th>
                <td className="px-2 py-2.5 text-fg-2">{r.club}</td>
                <td className="px-2 py-2.5 text-right text-fg-2">{r.line.appearances}</td>
                <td className="px-2 py-2.5 text-right font-semibold">{r.line.goals}</td>
                <td className="px-2 py-2.5 text-right text-fg-2">{r.line.assists}</td>
                <td className="px-4 py-2.5 text-right text-fg-2">
                  {formatRating(r.line.averageRating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CareerDashboard() {
  const career = useActiveCareer();
  const { season, totals, seasonMatches } = useCareerOverview(career);
  const [scope, setScope] = useState<Scope>("season");
  const ratings = useMemo(() => ratingSeries(seasonMatches), [seasonMatches]);
  const monthly = useMemo(() => monthlyContributions(seasonMatches), [seasonMatches]);
  const hasMatches = seasonMatches.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Painel da carreira"
        eyebrow={`${career.currentClub} · ${career.player.position} · camisa ${career.player.shirtNumber}`}
        actions={
          <SegmentedControl
            aria-label="Período"
            value={scope}
            onValueChange={setScope}
            className="w-full sm:w-64"
            options={[
              { value: "season", label: career.currentSeason },
              { value: "career", label: "Carreira" },
            ]}
          />
        }
      />

      <KpiCard line={scope === "season" ? season : totals} career={career} scope={scope} />

      {hasMatches ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader
              title="Nota por partida"
              icon={<LineChart />}
              description={`${ratings.length} jogos com nota`}
            />
            <CardBody>
              <RatingChart points={ratings} average={season.averageRating} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Gols e assistências por mês" icon={<BarChart3 />} />
            <CardBody>
              <ContributionsChart data={monthly} />
            </CardBody>
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<LineChart />}
            title="Os gráficos aparecem com as partidas"
            description="Registre seus jogos para acompanhar nota, gols e assistências ao longo da temporada."
            action={
              <Button asChild>
                <Link href="/partidas/nova">Registrar partida</Link>
              </Button>
            }
          />
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader
            title="Evolução do overall"
            icon={<TrendingUp />}
            description={`De ${career.overallHistory[0]?.overall ?? career.player.overall} para ${career.player.overall}${career.player.potential ? `, potencial ${career.player.potential}` : ""}`}
          />
          <CardBody>
            <OverallChart points={career.overallHistory} potential={career.player.potential} />
          </CardBody>
        </Card>
        <RecordsCard career={career} matches={seasonMatches} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {hasMatches ? <CompetitionTable career={career} /> : null}
        <SeasonsTable career={career} current={season} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TrophiesCard career={career} />
        <AwardsCard career={career} />
      </div>
    </div>
  );
}

export function CareerView() {
  return (
    <PageContainer>
      <CareerGate>
        <CareerDashboard />
      </CareerGate>
    </PageContainer>
  );
}

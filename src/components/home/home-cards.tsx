import {
  ArrowUpRight,
  CalendarClock,
  Flag,
  Mic,
  Newspaper,
  Plus,
  Target,
  Waypoints,
} from "lucide-react";
import Link from "next/link";

import { type Career, type Objective, objectiveProgress } from "@/domain/career/career";
import {
  type Fixture,
  type Match,
  resultOf,
  RESULT_LABEL,
  VENUE_LABEL,
} from "@/domain/match/match";
import { EVENT_TYPE_LABEL } from "@/domain/timeline/events";
import { cn } from "@/lib/cn";
import { formatDate, formatRating } from "@/lib/format";

import { ClubCrest } from "../football/club-crest";
import { NewsCard } from "../news/news-card";
import { EVENT_META, TONE_CLASSES } from "../timeline/event-meta";
import { Badge, ResultBadge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardBody, CardHeader } from "../ui/card";
import { EmptyState } from "../ui/feedback";
import { ProgressBar } from "../ui/progress";
import { ratingTone } from "../match/match-row";

function CardLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center gap-1 rounded-sm px-2 text-sm font-medium text-fg-2 hover:bg-surface-2 hover:text-fg"
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function NextMatchCard({ fixture, club }: { fixture?: Fixture; club: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader title="Próximo jogo" icon={<CalendarClock />} />
      {fixture ? (
        <CardBody className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <ClubCrest name={fixture.venue === "away" ? fixture.opponent : club} size="lg" />
              <span className="w-full truncate text-sm font-semibold">
                {fixture.venue === "away" ? fixture.opponent : club}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-fg-3">x</span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <ClubCrest name={fixture.venue === "away" ? club : fixture.opponent} size="lg" />
              <span className="w-full truncate text-sm font-semibold">
                {fixture.venue === "away" ? club : fixture.opponent}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-semibold capitalize">
              {formatDate(fixture.date, "weekday")}
            </p>
            <p className="text-sm text-fg-3">
              {fixture.competition} · {VENUE_LABEL[fixture.venue]}
            </p>
            {fixture.note ? <p className="mt-2 text-sm text-accent">{fixture.note}</p> : null}
          </div>
          <div className="mt-auto grid grid-cols-[1fr_auto] gap-2">
            <Button asChild variant="secondary">
              <Link
                href={`/partidas/nova?adversario=${encodeURIComponent(fixture.opponent)}&competicao=${encodeURIComponent(fixture.competition)}&mando=${fixture.venue}&data=${fixture.date}`}
              >
                <Plus className="size-4" aria-hidden="true" />
                Registrar resultado
              </Link>
            </Button>
            <Button asChild variant="ai" className="px-3" aria-label="Registrar por voz">
              <Link href="/partidas/nova?modo=voz">
                <Mic className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardBody>
      ) : (
        <EmptyState
          icon={<CalendarClock />}
          title="Agenda livre"
          description="Nenhum jogo marcado. Registre a próxima partida assim que ela acontecer no jogo."
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/partidas/nova">Registrar partida</Link>
            </Button>
          }
        />
      )}
    </Card>
  );
}

export function LastResultCard({ match, club }: { match?: Match; club: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Último resultado"
        icon={<Flag />}
        action={match ? <CardLink href="/partidas">Partidas</CardLink> : undefined}
      />
      {match ? (
        <CardBody className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-3">
            <ResultBadge result={resultOf(match)} />
            <p className="text-sm text-fg-2">
              {RESULT_LABEL[resultOf(match)]} · {formatDate(match.date)} · {match.competition}
            </p>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <ClubCrest name={club} />
              <span className="w-full text-sm leading-tight font-semibold text-balance">
                {club}
              </span>
            </div>
            <span className="tabular font-display text-5xl font-bold">
              {match.goalsFor}
              <span className="px-1.5 text-fg-3">–</span>
              {match.goalsAgainst}
            </span>
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <ClubCrest name={match.opponent} />
              <span className="w-full text-sm leading-tight font-semibold text-balance">
                {match.opponent}
              </span>
            </div>
          </div>
          <dl className="mt-auto grid grid-cols-4 gap-2 rounded-md bg-surface-2 p-3 text-center">
            {[
              { label: "Gols", value: match.goals },
              { label: "Assist.", value: match.assists },
              { label: "Min.", value: match.minutes },
              { label: "Nota", value: formatRating(match.rating), cls: ratingTone(match.rating) },
            ].map((s) => (
              <div key={s.label} className="flex flex-col">
                <dt className="order-2 text-xs text-fg-3">{s.label}</dt>
                <dd className={cn("tabular order-1 font-display text-2xl font-bold", s.cls)}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      ) : (
        <EmptyState
          icon={<Flag />}
          title="Nenhuma partida ainda"
          description="Registre o primeiro jogo para ver estatísticas, notícias e marcos da carreira."
          action={
            <Button asChild size="sm">
              <Link href="/partidas/nova">Registrar primeira partida</Link>
            </Button>
          }
        />
      )}
    </Card>
  );
}

function ObjectiveItem({ objective }: { objective: Objective }) {
  const progress = objectiveProgress(objective);
  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-sm font-medium",
            objective.status === "done" ? "text-fg-3 line-through" : "text-fg",
          )}
        >
          {objective.title}
        </p>
        {objective.source === "challenge" ? <Badge tone="ai">desafio</Badge> : null}
        {objective.status === "done" ? <Badge tone="win">concluído</Badge> : null}
      </div>
      {progress !== null ? (
        <div className="flex items-center gap-3">
          <ProgressBar
            value={progress}
            label={objective.title}
            tone={objective.status === "done" ? "win" : "accent"}
            className="flex-1"
          />
          <span className="tabular shrink-0 text-xs font-semibold text-fg-2">
            {objective.current}/{objective.target}
          </span>
        </div>
      ) : objective.deadline ? (
        <p className="text-xs text-fg-3">Prazo: {formatDate(objective.deadline, "long")}</p>
      ) : null}
    </li>
  );
}

export function ObjectivesCard({ objectives }: { objectives: Objective[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader title="Objetivos" icon={<Target />} />
      <CardBody>
        {objectives.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {objectives.slice(0, 4).map((o) => (
              <ObjectiveItem key={o.id} objective={o} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-3">Nenhum objetivo definido.</p>
        )}
      </CardBody>
    </Card>
  );
}

export function NewsPreviewCard({ career }: { career: Career }) {
  const [featured, ...rest] = career.news;
  return (
    <Card>
      <CardHeader
        title="Notícias"
        icon={<Newspaper />}
        action={featured ? <CardLink href="/noticias">Todas</CardLink> : undefined}
      />
      <CardBody>
        {featured ? (
          <div className="flex flex-col divide-y divide-line">
            <NewsCard article={featured} featured className="pb-5" />
            {rest.slice(0, 2).map((a) => (
              <NewsCard key={a.id} article={a} className="py-4 last:pb-0" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Newspaper />}
            title="Sem manchetes por enquanto"
            description="Cada partida registrada pode virar notícia. Grandes atuações sempre viram."
            className="py-6"
          />
        )}
      </CardBody>
    </Card>
  );
}

export function RecentEventsCard({ career }: { career: Career }) {
  const events = [...career.events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  return (
    <Card>
      <CardHeader
        title="Acontecimentos recentes"
        icon={<Waypoints />}
        action={<CardLink href="/timeline">Timeline</CardLink>}
      />
      <CardBody>
        <ol className="flex flex-col gap-4">
          {events.map((e) => {
            const meta = EVENT_META[e.type];
            const Icon = meta.icon;
            return (
              <li key={e.id} className="flex gap-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    TONE_CLASSES[meta.tone],
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">{e.title}</p>
                  <p className="text-xs text-fg-3">
                    {EVENT_TYPE_LABEL[e.type]} · {formatDate(e.date, "long")}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardBody>
    </Card>
  );
}

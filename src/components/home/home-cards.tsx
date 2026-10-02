import { ArrowUpRight, Mic, Plus } from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { type Career, type Objective, objectiveProgress } from "@/domain/career/career";
import {
  type Fixture,
  type Match,
  type MatchResult,
  resultOf,
  RESULT_LABEL,
  RESULT_SHORT,
  VENUE_LABEL,
} from "@/domain/match/match";
import { EVENT_TYPE_LABEL } from "@/domain/timeline/events";
import { cn } from "@/lib/cn";
import { formatDate, formatRating } from "@/lib/format";

import { ClubCrest } from "../football/club-crest";
import { ratingTone } from "../match/match-row";
import { AnimatedNumber } from "../motion/animated-number";
import { RevealItem } from "../motion/reveal";
import { EVENT_META, TONE_CLASSES } from "../timeline/event-meta";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ProgressBar } from "../ui/progress";

function Widget({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <RevealItem className={cn("glass flex flex-col gap-4 rounded-lg p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-fg-2">{title}</h2>
        {action}
      </div>
      {children}
    </RevealItem>
  );
}

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-fg-2 hover:bg-surface-2 hover:text-fg"
    >
      {children}
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

export function StatWidget({
  label,
  value,
  decimals = 0,
  goal,
  sub,
}: {
  label: string;
  value: number | null;
  decimals?: number;
  goal?: Objective;
  sub?: string;
}) {
  const progress = goal ? objectiveProgress(goal) : null;
  return (
    <RevealItem className="glass flex min-h-36 flex-col gap-1.5 rounded-lg p-5">
      <span className="text-sm font-semibold text-fg-2">{label}</span>
      <span className="tabular text-5xl leading-none font-bold tracking-tight">
        {value === null ? "–" : <AnimatedNumber value={value} decimals={decimals} />}
      </span>
      <div className="mt-auto flex flex-col gap-2 pt-2">
        {progress !== null && goal ? <ProgressBar value={progress} label={goal.title} /> : null}
        {goal?.target !== undefined ? (
          <span className="text-xs text-fg-3">Meta: {goal.target}</span>
        ) : sub ? (
          <span className="text-xs text-fg-3">{sub}</span>
        ) : null}
      </div>
    </RevealItem>
  );
}

const FORM_STYLE: Record<MatchResult, string> = {
  W: "bg-white text-on-accent",
  D: "bg-white/25 text-fg",
  L: "bg-loss text-on-accent",
};

export function FormWidget({ results }: { results: MatchResult[] }) {
  const wins = results.filter((r) => r === "W").length;
  return (
    <RevealItem className="glass flex min-h-36 flex-col gap-1.5 rounded-lg p-5">
      <span className="text-sm font-semibold text-fg-2">Forma</span>
      {results.length > 0 ? (
        <>
          <span
            role="img"
            aria-label={`Do mais antigo ao mais recente: ${results.map((r) => RESULT_LABEL[r]).join(", ")}`}
            className="mt-auto flex gap-1.5"
          >
            {results.map((r, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn(
                  "grid size-7 place-items-center rounded-full text-xs font-bold",
                  FORM_STYLE[r],
                )}
              >
                {RESULT_SHORT[r]}
              </span>
            ))}
          </span>
          <span className="text-xs text-fg-3">
            {wins} {wins === 1 ? "vitória" : "vitórias"} nos últimos {results.length}
          </span>
        </>
      ) : (
        <span className="mt-auto text-sm text-fg-3">Sem jogos ainda</span>
      )}
    </RevealItem>
  );
}

export function NextMatchCard({
  fixture,
  club,
  today,
  className,
}: {
  fixture?: Fixture;
  club: string;
  today: string;
  className?: string;
}) {
  if (!fixture) {
    return (
      <Widget title="Próximo jogo" className={className}>
        <p className="text-lg font-semibold">Agenda livre</p>
        <p className="text-sm text-fg-2">
          Registre a próxima partida assim que ela acontecer no jogo.
        </p>
        <Button asChild variant="secondary" className="mt-auto self-start">
          <Link href="/partidas/nova">Registrar partida</Link>
        </Button>
      </Widget>
    );
  }
  const days = Math.max(0, Math.round((Date.parse(fixture.date) - Date.parse(today)) / 86_400_000));
  const href = `/partidas/nova?adversario=${encodeURIComponent(fixture.opponent)}&competicao=${encodeURIComponent(fixture.competition)}&mando=${fixture.venue}&data=${fixture.date}`;
  return (
    <Widget
      title="Próximo jogo"
      className={className}
      action={
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          {days === 0 ? "hoje" : days === 1 ? "amanhã" : `em ${days} dias`}
        </span>
      }
    >
      <div className="flex items-center gap-4">
        <ClubCrest name={fixture.opponent} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight">
            {fixture.venue === "away" ? "@ " : fixture.venue === "home" ? "vs " : ""}
            {fixture.opponent}
          </p>
          <p className="text-sm text-fg-2 first-letter:uppercase">
            {formatDate(fixture.date, "weekday")} · {fixture.competition} ·{" "}
            {VENUE_LABEL[fixture.venue]}
          </p>
        </div>
      </div>
      {fixture.note ? <p className="text-sm font-medium text-gold">{fixture.note}</p> : null}
      <div className="mt-auto flex gap-2">
        <Button asChild className="flex-1">
          <Link href={href}>
            <Plus className="size-4" aria-hidden="true" />
            Registrar resultado
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="w-11 px-0"
          aria-label={`Registrar por voz contra ${club === fixture.opponent ? "adversário" : fixture.opponent}`}
        >
          <Link href="/partidas/nova?modo=voz">
            <Mic className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </Widget>
  );
}

export function LastResultCard({
  match,
  club,
  className,
}: {
  match?: Match;
  club: string;
  className?: string;
}) {
  if (!match) {
    return (
      <Widget title="Último resultado" className={className}>
        <p className="text-lg font-semibold">Nenhuma partida ainda</p>
        <p className="text-sm text-fg-2">
          Registre o primeiro jogo para ver estatísticas, notícias e marcos da carreira.
        </p>
        <Button asChild className="mt-auto self-start">
          <Link href="/partidas/nova">Registrar primeira partida</Link>
        </Button>
      </Widget>
    );
  }
  const result = resultOf(match);
  return (
    <Widget
      title="Último resultado"
      className={className}
      action={<MoreLink href="/partidas">Partidas</MoreLink>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex min-w-0 flex-col items-center gap-2 text-center">
          <ClubCrest name={club} size="lg" />
          <span className="w-full truncate text-sm font-semibold">{club}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="tabular text-5xl leading-none font-bold tracking-tight">
            {match.goalsFor}
            <span className="px-1 text-fg-3">–</span>
            {match.goalsAgainst}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              result === "W"
                ? "bg-win-soft text-win"
                : result === "L"
                  ? "bg-loss-soft text-loss"
                  : "bg-draw-soft text-draw",
            )}
          >
            {RESULT_LABEL[result]}
          </span>
        </div>
        <div className="flex min-w-0 flex-col items-center gap-2 text-center">
          <ClubCrest name={match.opponent} size="lg" />
          <span className="w-full truncate text-sm font-semibold">{match.opponent}</span>
        </div>
      </div>
      <p className="text-center text-xs text-fg-3">
        {formatDate(match.date)} · {match.competition}
      </p>
      <dl className="mt-auto grid grid-cols-4 gap-1 rounded-md bg-white/6 p-3 text-center">
        {[
          { label: "Gols", value: String(match.goals) },
          { label: "Assist.", value: String(match.assists) },
          { label: "Min.", value: String(match.minutes) },
          { label: "Nota", value: formatRating(match.rating), cls: ratingTone(match.rating) },
        ].map((s) => (
          <div key={s.label} className="flex flex-col">
            <dt className="order-2 text-xs text-fg-3">{s.label}</dt>
            <dd className={cn("tabular order-1 text-2xl font-bold", s.cls)}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </Widget>
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

export function ObjectivesCard({
  objectives,
  className,
}: {
  objectives: Objective[];
  className?: string;
}) {
  return (
    <Widget title="Objetivos" className={className}>
      {objectives.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {objectives.slice(0, 4).map((o) => (
            <ObjectiveItem key={o.id} objective={o} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-3">Nenhum objetivo definido.</p>
      )}
      {objectives.length > 4 ? (
        <details className="group">
          <summary className="inline-flex min-h-9 items-center text-sm font-semibold text-fg-2 hover:text-fg">
            <span className="group-open:hidden">Ver mais {objectives.length - 4}</span>
            <span className="hidden group-open:inline">Mostrar menos</span>
          </summary>
          <ul className="mt-3 flex flex-col gap-4">
            {objectives.slice(4).map((o) => (
              <ObjectiveItem key={o.id} objective={o} />
            ))}
          </ul>
        </details>
      ) : null}
    </Widget>
  );
}

export function NewsPreviewCard({ career, className }: { career: Career; className?: string }) {
  const [featured, ...rest] = career.news;
  return (
    <Widget
      title="Manchetes"
      className={className}
      action={featured ? <MoreLink href="/noticias">Todas</MoreLink> : undefined}
    >
      {featured ? (
        <div className="flex flex-col gap-4">
          <Link
            href={`/noticias/${featured.id}`}
            className="group flex flex-col gap-1.5 rounded-md"
          >
            <span className="text-xs font-medium text-fg-3">
              {featured.outlet} · {formatDate(featured.date)}
            </span>
            <span className="text-2xl leading-tight font-bold tracking-tight group-hover:underline">
              {featured.headline}
            </span>
            <span className="text-sm text-fg-2">{featured.standfirst}</span>
          </Link>
          {rest.slice(0, 2).map((a) => (
            <Link
              key={a.id}
              href={`/noticias/${a.id}`}
              className="group flex flex-col gap-0.5 border-t border-line pt-3"
            >
              <span className="text-xs text-fg-3">
                {a.outlet} · {formatDate(a.date)}
              </span>
              <span className="font-semibold group-hover:underline">{a.headline}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-2">
          Sem manchetes por enquanto. Grandes atuações sempre viram notícia.
        </p>
      )}
    </Widget>
  );
}

export function RecentEventsCard({ career, className }: { career: Career; className?: string }) {
  const events = [...career.events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  return (
    <Widget
      title="Acontecimentos"
      className={className}
      action={<MoreLink href="/timeline">Timeline</MoreLink>}
    >
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
                <p className="text-sm font-semibold">{e.title}</p>
                <p className="text-xs text-fg-3">
                  {EVENT_TYPE_LABEL[e.type]} · {formatDate(e.date, "long")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Widget>
  );
}

import { CalendarDays, FileSignature, TrendingUp } from "lucide-react";
import Link from "next/link";

import { type Career } from "@/domain/career/career";
import { type MatchResult } from "@/domain/match/match";
import { ageAt, displayName, fullName } from "@/domain/player/player";
import { POSITIONS } from "@/domain/player/positions";
import { findArchetype } from "@/domain/player/archetypes";
import { type StatLine } from "@/domain/stats/stats";
import { formatMarketValue, formatRating } from "@/lib/format";

import { ClubCrest } from "../football/club-crest";
import { FormGuide } from "../football/form-guide";
import { NationTag } from "../football/nation-tag";
import { OverallSeal } from "../football/overall-seal";
import { Badge } from "../ui/badge";

interface PlayerHeroProps {
  career: Career;
  season: StatLine;
  form: MatchResult[];
  today: string;
}

/** O cartão do jogador: o elemento mais marcante do app (camisa gigante + linhas do campo). */
export function PlayerHero({ career, season, form, today }: PlayerHeroProps) {
  const { player } = career;
  const archetype = findArchetype(player.archetypeId);
  const hasNickname = !!player.nickname && player.nickname !== fullName(player);
  const ovrDelta = (() => {
    const history = career.overallHistory;
    if (history.length < 2) return 0;
    return (history.at(-1)?.overall ?? 0) - (history.at(-2)?.overall ?? 0);
  })();

  return (
    <section
      aria-labelledby="hero-name"
      className="relative overflow-hidden rounded-lg border border-line bg-surface-1"
    >
      <div className="pitch-lines absolute inset-0" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-24 -right-6 font-display text-[11rem] leading-none font-bold text-transparent select-none [-webkit-text-stroke:2px_rgb(246_185_64/0.22)] sm:-top-12 sm:right-40 sm:text-[17rem]"
      >
        {player.shirtNumber}
      </span>

      <div className="relative flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-fg-2">
              <NationTag code={player.nationalityCode} />
              <Badge tone="accent">{player.position}</Badge>
              <span>{POSITIONS[player.position].name}</span>
              <span className="text-fg-3" aria-hidden="true">
                /
              </span>
              <span>{ageAt(player.birthDate, today)} anos</span>
            </div>
            <h1
              id="hero-name"
              className="mt-3 font-display text-5xl leading-[0.9] font-bold tracking-tight text-fg sm:text-6xl"
            >
              {displayName(player)}
            </h1>
            <p className="mt-2 text-fg-2">
              {hasNickname ? `${fullName(player)}, ` : ""}
              {archetype ? archetype.name.toLowerCase() : "jogador"} com a camisa{" "}
              {player.shirtNumber}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <OverallSeal value={player.overall} size="lg" />
            {ovrDelta > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-win">
                <TrendingUp className="size-3.5" aria-hidden="true" />+{ovrDelta}
                <span className="sr-only"> desde a última atualização</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/jogador" className="flex items-center gap-3 rounded-sm">
            <ClubCrest name={career.currentClub} size="lg" />
            <span>
              <span className="block font-display text-2xl leading-tight font-semibold text-fg">
                {career.currentClub}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-fg-3">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Temporada {career.currentSeason}
              </span>
            </span>
          </Link>
          <dl className="flex gap-6 text-sm">
            <div>
              <dt className="text-fg-3">Valor de mercado</dt>
              <dd className="tabular font-display text-xl font-semibold text-fg">
                {formatMarketValue(career.marketValue)}
              </dd>
            </div>
            {career.contractUntil ? (
              <div className="hidden sm:block">
                <dt className="flex items-center gap-1 text-fg-3">
                  <FileSignature className="size-3.5" aria-hidden="true" />
                  Contrato
                </dt>
                <dd className="tabular font-display text-xl font-semibold text-fg">
                  até {career.contractUntil.slice(0, 4)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-5">
          {[
            { label: "Jogos", value: season.appearances },
            { label: "Gols", value: season.goals, accent: true },
            { label: "Assistências", value: season.assists },
            { label: "Nota média", value: formatRating(season.averageRating) },
          ].map((s) => (
            <div key={s.label} className="flex flex-col bg-surface-1/95 px-4 py-3">
              <dt className="order-2 text-xs text-fg-3">{s.label}</dt>
              <dd
                className={`tabular order-1 font-display text-4xl leading-none font-bold ${s.accent ? "text-accent" : "text-fg"}`}
              >
                {s.value}
              </dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col justify-center gap-1.5 bg-surface-1/95 px-4 py-3 sm:col-span-1">
            <dt className="order-2 text-xs text-fg-3">Forma recente</dt>
            <dd className="order-1">
              <FormGuide results={form} size="sm" />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

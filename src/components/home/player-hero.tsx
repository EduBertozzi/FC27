import { TrendingUp } from "lucide-react";
import Link from "next/link";

import { type Career } from "@/domain/career/career";
import { ageAt, displayName, fullName } from "@/domain/player/player";
import { POSITIONS } from "@/domain/player/positions";
import { formatMarketValue } from "@/lib/format";

import { UpdateOverallDialog } from "../career/update-overall-dialog";
import { ClubCrest } from "../football/club-crest";
import { NationTag } from "../football/nation-tag";
import { AnimatedNumber } from "../motion/animated-number";
import { RevealItem } from "../motion/reveal";
import { Sparkline } from "../motion/sparkline";

/** Cabeçalho da carreira: nome grande e o cartão de overall com a evolução. */
export function PlayerHero({ career, today }: { career: Career; today: string }) {
  const { player } = career;
  const history = career.overallHistory.map((p) => p.overall);
  const delta = history.length > 1 ? (history.at(-1) ?? 0) - (history.at(-2) ?? 0) : 0;
  const hasNickname = !!player.nickname && player.nickname !== fullName(player);

  return (
    <>
      <RevealItem className="col-span-2 flex flex-col gap-1 px-1 pb-2 lg:col-span-12">
        <Link
          href="/jogador"
          className="flex w-fit items-center gap-2 rounded-full text-sm font-medium text-fg-2 hover:text-fg"
        >
          <ClubCrest name={career.currentClub} size="sm" />
          {career.currentClub} · Temporada {career.currentSeason}
        </Link>
        <h1 id="hero-name" className="text-4xl font-bold tracking-tight sm:text-5xl">
          {displayName(player)}
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-fg-2">
          <NationTag code={player.nationalityCode} />
          {POSITIONS[player.position].name} · camisa {player.shirtNumber} ·{" "}
          {ageAt(player.birthDate, today)} anos
          {hasNickname ? <span className="text-fg-3">({fullName(player)})</span> : null}
        </p>
      </RevealItem>

      <RevealItem className="glass pitch-lines relative col-span-2 flex flex-col justify-between gap-5 overflow-hidden rounded-lg p-6 lg:col-span-5 lg:row-span-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-fg-2">Overall</p>
            <p className="tabular text-7xl leading-none font-bold tracking-tighter">
              <AnimatedNumber value={player.overall} />
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <UpdateOverallDialog />
            <p className="pb-1 text-right text-sm text-fg-2">
              de{" "}
              <span className="tabular font-semibold text-fg">{history[0] ?? player.overall}</span>
              <br />
              em {career.overallHistory[0]?.date.slice(0, 4) ?? ""}
            </p>
          </div>
        </div>
        <Sparkline
          values={history}
          width={420}
          height={96}
          className="h-auto w-full"
          label={`Overall de ${history[0] ?? player.overall} para ${player.overall}`}
        />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <dl className="flex gap-6 text-sm">
            {player.potential ? (
              <div>
                <dt className="text-fg-3">Potencial</dt>
                <dd className="tabular text-xl font-semibold">{player.potential}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-fg-3">Valor</dt>
              <dd className="tabular text-xl font-semibold">
                {formatMarketValue(career.marketValue)}
              </dd>
            </div>
            {career.contractUntil ? (
              <div>
                <dt className="text-fg-3">Contrato</dt>
                <dd className="tabular text-xl font-semibold">
                  {career.contractUntil.slice(0, 4)}
                </dd>
              </div>
            ) : null}
          </dl>
          {delta > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-win-soft px-2.5 py-1 text-xs font-semibold text-win">
              <TrendingUp className="size-3.5" aria-hidden="true" />+{delta} recente
            </span>
          ) : null}
        </div>
      </RevealItem>
    </>
  );
}

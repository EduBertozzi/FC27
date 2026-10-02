"use client";

import { History } from "lucide-react";

import { findArchetype } from "@/domain/player/archetypes";
import { findNationality } from "@/domain/player/nationalities";
import { ageAt, displayName, FOOT_LABEL, fullName } from "@/domain/player/player";
import { POSITIONS } from "@/domain/player/positions";
import {
  formatDate,
  formatHeight,
  formatMarketValue,
  formatNumber,
  formatRating,
} from "@/lib/format";
import { useActiveCareer } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

import { AwardsCard, RecordsCard, TrophiesCard } from "../career/honours";
import { UpdateOverallDialog } from "../career/update-overall-dialog";
import { ClubCrest } from "../football/club-crest";
import { NationTag } from "../football/nation-tag";
import { OverallSeal } from "../football/overall-seal";
import { PlayerShirt } from "../football/player-shirt";
import { CareerGate, PageContainer } from "../layout/page";
import { Badge } from "../ui/badge";
import { Card, CardBody, CardHeader } from "../ui/card";
import { Stat, StatGrid } from "../ui/stat";

const SPELL_KIND = { youth: "Base", permanent: "Profissional", loan: "Empréstimo" } as const;

function Profile() {
  const career = useActiveCareer();
  const { totals, today, seasonMatches } = useCareerOverview(career);
  const { player } = career;
  const nation = findNationality(player.nationalityCode);
  const archetype = findArchetype(player.archetypeId);

  const bio: [string, React.ReactNode][] = [
    ["Nome completo", fullName(player)],
    ["Apelido", player.nickname ?? "—"],
    ["Nacionalidade", nation ? <NationTag code={nation.code} showName /> : player.nationalityCode],
    [
      "Nascimento",
      `${formatDate(player.birthDate, "long")} (${ageAt(player.birthDate, today)} anos)`,
    ],
    [
      "Posição",
      `${POSITIONS[player.position].name}${player.secondaryPositions?.length ? ` · também ${player.secondaryPositions.join(", ")}` : ""}`,
    ],
    ["Clube", career.currentClub],
    ["Número", player.shirtNumber],
    ["Pé dominante", FOOT_LABEL[player.preferredFoot]],
    ["Altura", formatHeight(player.heightCm)],
    ["Arquétipo", archetype?.name ?? "—"],
    ["Personalidade", player.personality ?? "—"],
    ["Valor de mercado", formatMarketValue(career.marketValue)],
    ["Contrato até", career.contractUntil ? formatDate(career.contractUntil, "long") : "—"],
  ];

  return (
    <div className="flex flex-col gap-5">
      <section
        className="relative overflow-hidden rounded-lg border border-line bg-surface-1"
        aria-labelledby="profile-name"
      >
        <div className="pitch-lines absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:items-center sm:text-left">
          <PlayerShirt number={player.shirtNumber} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <NationTag code={player.nationalityCode} />
              <Badge tone="accent">{player.position}</Badge>
              {archetype ? <Badge>{archetype.name}</Badge> : null}
            </div>
            <h1
              id="profile-name"
              className="mt-2 font-display text-5xl leading-none font-bold sm:text-6xl"
            >
              {displayName(player)}
            </h1>
            <p className="mt-2 flex items-center justify-center gap-2 text-fg-2 sm:justify-start">
              <ClubCrest name={career.currentClub} size="sm" />
              {career.currentClub} · camisa {player.shirtNumber}
            </p>
            {career.concept ? (
              <p className="mt-3 max-w-xl text-sm text-fg-3">{career.concept}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <div className="flex items-end gap-4">
              <OverallSeal value={player.overall} size="lg" />
              {player.potential ? (
                <div className="pb-1 text-left">
                  <p className="text-xs text-fg-3">Potencial</p>
                  <p className="tabular font-display text-3xl font-bold text-fg-2">
                    {player.potential}
                  </p>
                </div>
              ) : null}
            </div>
            <UpdateOverallDialog />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader title="Ficha" />
          <CardBody>
            <dl className="divide-y divide-line">
              {bio.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                >
                  <dt className="shrink-0 text-fg-3">{label}</dt>
                  <dd className="text-right font-medium text-fg">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader title="Números da carreira" description="Todas as temporadas" />
            <CardBody>
              <StatGrid className="grid-cols-3 sm:grid-cols-4">
                <Stat label="Jogos" value={totals.appearances} />
                <Stat label="Gols" value={totals.goals} emphasis />
                <Stat label="Assistências" value={totals.assists} />
                <Stat label="Nota média" value={formatRating(totals.averageRating)} />
                <Stat label="Minutos" value={formatNumber(totals.minutes)} />
                <Stat label="Vitórias" value={totals.wins} />
                <Stat label="Títulos" value={career.trophies.length} />
                <Stat label="Prêmios" value={career.awards.length} />
              </StatGrid>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Histórico de clubes" icon={<History />} />
            <CardBody>
              <ol className="flex flex-col gap-4">
                {[...career.clubHistory].reverse().map((spell, i) => (
                  <li key={`${spell.club}-${spell.from}-${i}`} className="flex items-center gap-3">
                    <ClubCrest name={spell.club} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{spell.club}</p>
                      <p className="text-sm text-fg-3">
                        {spell.from} – {spell.to ?? "atual"}
                        {spell.country ? ` · ${spell.country}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge tone={spell.to ? "neutral" : "accent"}>{SPELL_KIND[spell.kind]}</Badge>
                      {spell.fee ? (
                        <p className="tabular mt-1 text-xs text-fg-3">
                          {formatMarketValue(spell.fee)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <TrophiesCard career={career} />
        <AwardsCard career={career} />
        <RecordsCard career={career} matches={seasonMatches} />
      </div>
    </div>
  );
}

export function ProfileView() {
  return (
    <PageContainer>
      <CareerGate>
        <Profile />
      </CareerGate>
    </PageContainer>
  );
}

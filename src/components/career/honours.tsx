import { Award, Medal, Trophy } from "lucide-react";

import { type Career } from "@/domain/career/career";
import { type Match } from "@/domain/match/match";
import { longestScoringStreak, matchHighlights } from "@/domain/stats/stats";
import { formatRating } from "@/lib/format";

import { Card, CardBody, CardHeader } from "../ui/card";
import { EmptyState } from "../ui/feedback";

export function TrophiesCard({ career }: { career: Career }) {
  return (
    <Card>
      <CardHeader
        title="Títulos"
        icon={<Trophy />}
        description={`${career.trophies.length} na carreira`}
      />
      <CardBody>
        {career.trophies.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {[...career.trophies].reverse().map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"
                  aria-hidden="true"
                >
                  <Trophy className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-fg-3">
                    {t.season} · {t.club}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Trophy />}
            title="Estante vazia"
            description="O primeiro título vai aparecer aqui."
            className="py-4"
          />
        )}
      </CardBody>
    </Card>
  );
}

export function AwardsCard({ career }: { career: Career }) {
  return (
    <Card>
      <CardHeader title="Prêmios" icon={<Medal />} />
      <CardBody>
        {career.awards.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {[...career.awards].reverse().map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-3 text-fg-2"
                  aria-hidden="true"
                >
                  <Medal className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-fg-3">
                    {a.season}
                    {a.detail ? ` · ${a.detail}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Medal />}
            title="Nenhum prêmio ainda"
            description="Prêmios individuais registrados aparecem aqui."
            className="py-4"
          />
        )}
      </CardBody>
    </Card>
  );
}

export function RecordsCard({ career, matches }: { career: Career; matches: Match[] }) {
  const h = matchHighlights(matches);
  const streak = longestScoringStreak(matches);
  const computed = [
    h.mostGoals
      ? {
          label: "Mais gols em um jogo",
          value: String(h.mostGoals.goals),
          context: `vs ${h.mostGoals.opponent}`,
        }
      : null,
    h.bestRating
      ? {
          label: "Melhor nota",
          value: formatRating(h.bestRating.rating),
          context: `vs ${h.bestRating.opponent}`,
        }
      : null,
    streak > 1
      ? { label: "Sequência marcando", value: `${streak} jogos`, context: "maior da temporada" }
      : null,
  ].filter((r): r is { label: string; value: string; context: string } => r !== null);
  const all = [
    ...computed,
    ...career.records.map((r) => ({ label: r.label, value: r.value, context: r.context ?? "" })),
  ];

  return (
    <Card>
      <CardHeader title="Recordes" icon={<Award />} />
      <CardBody>
        {all.length > 0 ? (
          <dl className="grid grid-cols-2 gap-4">
            {all.map((r) => (
              <div key={r.label}>
                <dt className="text-xs text-fg-3">{r.label}</dt>
                <dd className="tabular font-display text-2xl font-bold text-fg">{r.value}</dd>
                <dd className="text-xs text-fg-3">{r.context}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EmptyState
            icon={<Award />}
            title="Recordes a conquistar"
            description="Registre partidas e o app calcula seus recordes automaticamente."
            className="py-4"
          />
        )}
      </CardBody>
    </Card>
  );
}

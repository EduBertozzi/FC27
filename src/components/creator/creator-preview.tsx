import { findArchetype } from "@/domain/player/archetypes";
import { FOOT_LABEL } from "@/domain/player/player";
import { POSITIONS } from "@/domain/player/positions";
import { formatHeight } from "@/lib/format";

import { ClubCrest } from "../football/club-crest";
import { NationTag } from "../football/nation-tag";
import { OverallSeal } from "../football/overall-seal";
import { PlayerShirt } from "../football/player-shirt";
import { type CreatorValues } from "./creator-state";

/** Pré-visualização do cartão do jogador enquanto o usuário preenche. */
export function CreatorPreview({ values, age }: { values: CreatorValues; age: number | null }) {
  const name =
    values.nickname ||
    [values.firstName, values.lastName].filter(Boolean).join(" ") ||
    "Seu jogador";
  const archetype = findArchetype(values.archetypeId);
  const position = values.position ? POSITIONS[values.position] : undefined;
  return (
    <div
      className="relative overflow-hidden rounded-lg border border-line-strong bg-surface-1"
      aria-label="Pré-visualização do jogador"
    >
      <div className="pitch-lines absolute inset-0" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <PlayerShirt number={values.shirtNumber} size="lg" />
          <OverallSeal value={values.overall} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-fg-2">
            {values.nationalityCode ? <NationTag code={values.nationalityCode} /> : null}
            {position ? (
              <span>{position.name}</span>
            ) : (
              <span className="text-fg-3">Posição a definir</span>
            )}
            {age !== null ? <span>· {age} anos</span> : null}
          </div>
          <p className="mt-1.5 font-display text-4xl leading-none font-bold break-words">{name}</p>
          {archetype ? <p className="mt-1 text-sm text-fg-2">{archetype.name}</p> : null}
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-sm bg-surface-2/80 p-2.5">
            <dt className="text-xs text-fg-3">Pé dominante</dt>
            <dd className="font-semibold">{FOOT_LABEL[values.preferredFoot]}</dd>
          </div>
          <div className="rounded-sm bg-surface-2/80 p-2.5">
            <dt className="text-xs text-fg-3">Altura</dt>
            <dd className="tabular font-semibold">{formatHeight(values.heightCm)}</dd>
          </div>
        </dl>
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <ClubCrest name={values.club || "?"} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{values.club || "Clube inicial"}</p>
            <p className="truncate text-sm text-fg-3">{values.objective || "Objetivo a definir"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Footprints, Quote, Ruler, Target, Swords } from "lucide-react";
import { type CSSProperties } from "react";

import { CHALLENGE_DIFFICULTY_TONE } from "@/domain/ideas/catalog";
import { type CareerConcept } from "@/domain/ideas/generators";
import { FOOT_LABEL } from "@/domain/player/player";
import { formatHeight } from "@/lib/format";
import { cn } from "@/lib/cn";

import { ClubCrest } from "../football/club-crest";
import { NationTag } from "../football/nation-tag";
import { OverallSeal } from "../football/overall-seal";
import { Badge } from "../ui/badge";

/** Revelação em sequência: cada bloco entra com atraso crescente (uma única coreografia). */
function reveal(step: number): CSSProperties {
  return { animationDelay: `${step * 90}ms` };
}

const REVEAL = "animate-sheet-up [animation-fill-mode:both]";

export function ConceptCard({
  concept,
  className,
}: {
  concept: CareerConcept;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-lg border border-line-strong bg-surface-2",
        className,
      )}
      aria-live="polite"
    >
      <div className="pitch-lines absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 p-5 sm:p-6">
        <header className={cn("flex items-start gap-4", REVEAL)} style={reveal(0)}>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-fg-2">
              <NationTag code={concept.nationality.code} />
              <span>{concept.age} anos</span>
              <Badge tone="accent">{concept.position.code}</Badge>
            </div>
            <h3 className="mt-2 font-display text-4xl leading-none font-bold text-fg sm:text-5xl">
              {concept.firstName} {concept.lastName}
            </h3>
            {concept.nickname ? (
              <p className="mt-1 text-fg-2">conhecido como &ldquo;{concept.nickname}&rdquo;</p>
            ) : null}
          </div>
          <OverallSeal value={concept.overall} />
        </header>

        <dl
          className={cn("grid grid-cols-2 gap-3 text-sm sm:grid-cols-4", REVEAL)}
          style={reveal(1)}
        >
          <div className="rounded-sm bg-surface-1/70 p-2.5">
            <dt className="text-xs text-fg-3">Posição</dt>
            <dd className="font-semibold text-fg">{concept.position.name}</dd>
          </div>
          <div className="rounded-sm bg-surface-1/70 p-2.5">
            <dt className="text-xs text-fg-3">Arquétipo</dt>
            <dd className="font-semibold text-fg">{concept.archetype.name}</dd>
          </div>
          <div className="rounded-sm bg-surface-1/70 p-2.5">
            <dt className="flex items-center gap-1 text-xs text-fg-3">
              <Footprints className="size-3" aria-hidden="true" />
              Pé
            </dt>
            <dd className="font-semibold text-fg">{FOOT_LABEL[concept.preferredFoot]}</dd>
          </div>
          <div className="rounded-sm bg-surface-1/70 p-2.5">
            <dt className="flex items-center gap-1 text-xs text-fg-3">
              <Ruler className="size-3" aria-hidden="true" />
              Altura
            </dt>
            <dd className="tabular font-semibold text-fg">{formatHeight(concept.heightCm)}</dd>
          </div>
        </dl>

        <div
          className={cn(
            "flex items-center gap-3 rounded-md border border-line bg-surface-1/80 p-3",
            REVEAL,
          )}
          style={reveal(2)}
        >
          <ClubCrest name={concept.club.name} size="lg" />
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold text-fg">{concept.club.name}</p>
            <p className="text-sm text-fg-3">
              {concept.club.league}, {concept.club.country}
            </p>
            <p className="mt-0.5 text-sm text-fg-2">{concept.club.hook}</p>
          </div>
        </div>

        <p className={cn("text-base leading-relaxed text-fg-2", REVEAL)} style={reveal(3)}>
          {concept.story}
        </p>

        <div className={cn("grid gap-3 sm:grid-cols-2", REVEAL)} style={reveal(4)}>
          <div className="rounded-md border border-line p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-fg-3">
              <Target className="size-3.5" aria-hidden="true" /> Objetivo
            </p>
            <p className="mt-1 font-semibold text-fg">{concept.objective}</p>
            <p className="mt-1 text-sm text-fg-3">Personalidade: {concept.personality}</p>
          </div>
          <div className="rounded-md border border-line p-3">
            <p className="flex items-center justify-between gap-2 text-xs font-medium text-fg-3">
              <span className="flex items-center gap-1.5">
                <Swords className="size-3.5" aria-hidden="true" /> Desafio:{" "}
                {concept.challenge.title}
              </span>
              <Badge tone={CHALLENGE_DIFFICULTY_TONE[concept.challenge.difficulty]}>
                {concept.challenge.difficulty}
              </Badge>
            </p>
            <p className="mt-1 text-sm text-fg-2">{concept.challenge.rule}</p>
          </div>
        </div>

        <footer className={cn("flex gap-2.5 text-sm text-fg-3", REVEAL)} style={reveal(5)}>
          <Quote className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden="true" />
          <p>
            <span className="font-semibold text-fg-2">
              Inspiração: {concept.inspiration.title}.
            </span>{" "}
            {concept.inspiration.traits.join(", ")}. Referência de estilo:{" "}
            {concept.inspiration.reference}.
          </p>
        </footer>
      </div>
    </article>
  );
}

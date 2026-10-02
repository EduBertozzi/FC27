"use client";

import {
  Building2,
  Compass,
  Flag,
  Lightbulb,
  MapPin,
  RefreshCw,
  Shirt,
  Swords,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import {
  CHALLENGE_DIFFICULTY_TONE,
  CLUB_TIER_LABEL,
  type ClubIdea,
  type ClubTier,
} from "@/domain/ideas/catalog";
import {
  generatePlayerConcept,
  suggestChallenges,
  suggestClubs,
  suggestInspirations,
  suggestNationalities,
  suggestPositions,
} from "@/domain/ideas/generators";
import { findArchetype } from "@/domain/player/archetypes";
import { FOOT_LABEL } from "@/domain/player/player";
import { formatHeight } from "@/lib/format";
import { createRng, randomSeed } from "@/lib/random";
import { type CareerDraft, useCareerDraft } from "@/state/career-draft";

import { ClubCrest } from "../football/club-crest";
import { NationTag } from "../football/nation-tag";
import { OverallSeal } from "../football/overall-seal";
import { PageContainer, PageHeader } from "../layout/page";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { SegmentedControl } from "../ui/segmented-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { SurpriseTrigger } from "./surprise-dialog";

/** Semente fixa no primeiro render (SSR e cliente iguais); novas sementes a cada "Gerar novas". */
const INITIAL_SEED = 2027;

const TIER_TONE = {
  gigante: "accent",
  tradicional: "ai",
  emergente: "win",
  modesto: "neutral",
} as const;

function useSeed() {
  const [seed, setSeed] = useState(INITIAL_SEED);
  return { seed, reroll: () => setSeed(randomSeed()) };
}

function useUseIdea() {
  const router = useRouter();
  const setDraft = useCareerDraft((s) => s.setDraft);
  return (draft: CareerDraft) => {
    setDraft(draft, "ideas");
    router.push("/nova-carreira?origem=ideias");
  };
}

function IdeaCard({
  children,
  onUse,
  useLabel = "Usar esta ideia",
}: {
  children: ReactNode;
  onUse: () => void;
  useLabel?: string;
}) {
  return (
    <Card className="flex flex-col gap-4 p-4 transition-colors hover:border-line-strong">
      <div className="flex-1">{children}</div>
      <Button variant="secondary" size="sm" onClick={onUse} className="self-start">
        {useLabel}
      </Button>
    </Card>
  );
}

function RerollButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <RefreshCw className="size-4" aria-hidden="true" />
      Gerar novas
    </Button>
  );
}

function TabIntro({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-fg-2">{text}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function ClubsTab() {
  const { seed, reroll } = useSeed();
  const [tier, setTier] = useState<ClubTier | "all">("all");
  const use = useUseIdea();
  const clubs = suggestClubs(createRng(seed), 6, tier === "all" ? undefined : { tier });
  return (
    <>
      <TabIntro text="Onde começar? Cada clube tem uma história pronta para ser contada.">
        <SegmentedControl
          aria-label="Perfil do clube"
          value={tier}
          onValueChange={setTier}
          className="w-full sm:w-auto"
          options={[
            { value: "all", label: "Todos" },
            { value: "modesto", label: "Modesto" },
            { value: "emergente", label: "Ascensão" },
            { value: "gigante", label: "Gigante" },
          ]}
        />
        <RerollButton onClick={reroll} />
      </TabIntro>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c: ClubIdea) => (
          <IdeaCard key={c.name} onUse={() => use({ club: c.name })} useLabel="Começar neste clube">
            <div className="flex items-start gap-3">
              <ClubCrest name={c.name} size="lg" />
              <div className="min-w-0">
                <h3 className="font-display text-xl font-semibold">{c.name}</h3>
                <p className="flex items-center gap-1 text-sm text-fg-3">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {c.league}, {c.country}
                </p>
              </div>
            </div>
            <Badge className="mt-3" tone={TIER_TONE[c.tier]}>
              {CLUB_TIER_LABEL[c.tier]}
            </Badge>
            <p className="mt-2 text-sm text-fg-2">{c.hook}</p>
          </IdeaCard>
        ))}
      </div>
    </>
  );
}

function PlayersTab() {
  const { seed, reroll } = useSeed();
  const use = useUseIdea();
  const rng = createRng(seed + 1);
  const players = Array.from({ length: 4 }, () => generatePlayerConcept(rng));
  return (
    <>
      <TabIntro text="Conceitos de jogador prontos: nome, origem, posição e estilo.">
        <RerollButton onClick={reroll} />
      </TabIntro>
      <div className="grid gap-3 md:grid-cols-2">
        {players.map((p) => (
          <IdeaCard
            key={p.firstName + p.lastName + p.position.code}
            onUse={() =>
              use({
                firstName: p.firstName,
                lastName: p.lastName,
                nickname: p.nickname,
                nationalityCode: p.nationality.code,
                birthDate: `${new Date().getUTCFullYear() - p.age}-03-01`,
                position: p.position.code,
                preferredFoot: p.preferredFoot,
                heightCm: p.heightCm,
                overall: p.overall,
                archetypeId: p.archetype.id,
              })
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-fg-2">
                  <NationTag code={p.nationality.code} />
                  <span>{p.age} anos</span>
                  <Badge tone="accent">{p.position.code}</Badge>
                </div>
                <h3 className="mt-2 font-display text-2xl leading-tight font-semibold">
                  {p.firstName} {p.lastName}
                  {p.nickname ? (
                    <span className="font-medium text-fg-3"> &ldquo;{p.nickname}&rdquo;</span>
                  ) : null}
                </h3>
                <p className="mt-1 text-sm text-fg-2">
                  {p.archetype.name}, {p.personality.toLowerCase()}. Pé{" "}
                  {FOOT_LABEL[p.preferredFoot].toLowerCase()}, {formatHeight(p.heightCm)}.
                </p>
              </div>
              <OverallSeal value={p.overall} size="sm" />
            </div>
          </IdeaCard>
        ))}
      </div>
    </>
  );
}

function PositionsTab() {
  const { seed, reroll } = useSeed();
  const use = useUseIdea();
  const ideas = suggestPositions(createRng(seed + 2), 3);
  return (
    <>
      <TabIntro text="Fuja do óbvio: uma posição diferente muda toda a experiência da carreira.">
        <RerollButton onClick={reroll} />
      </TabIntro>
      <div className="grid gap-3 md:grid-cols-3">
        {ideas.map((i) => (
          <IdeaCard
            key={i.position.code}
            onUse={() => use({ position: i.position.code, archetypeId: i.archetype.id })}
          >
            <span className="inline-grid h-12 min-w-14 place-items-center rounded-sm bg-accent px-2 font-display text-2xl font-bold text-on-accent">
              {i.position.code}
            </span>
            <h3 className="mt-3 font-display text-xl font-semibold">{i.position.name}</h3>
            <p className="text-sm text-fg-3">como {i.archetype.name.toLowerCase()}</p>
            <p className="mt-2 text-sm text-fg-2">{i.pitch}</p>
          </IdeaCard>
        ))}
      </div>
    </>
  );
}

function NationalitiesTab() {
  const { seed, reroll } = useSeed();
  const use = useUseIdea();
  const nations = suggestNationalities(createRng(seed + 3), 6);
  return (
    <>
      <TabIntro text="Representar outra seleção abre caminhos (e convocações) bem diferentes.">
        <RerollButton onClick={reroll} />
      </TabIntro>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {nations.map((n) => (
          <IdeaCard key={n.code} onUse={() => use({ nationalityCode: n.code })} useLabel="Escolher">
            <span className="font-display text-4xl font-bold tracking-wider text-fg-2">
              {n.code}
            </span>
            <h3 className="mt-1 font-semibold">{n.name}</h3>
            <p className="text-sm text-fg-3">{n.region}</p>
          </IdeaCard>
        ))}
      </div>
    </>
  );
}

function ChallengesTab() {
  const { seed, reroll } = useSeed();
  const use = useUseIdea();
  const challenges = suggestChallenges(createRng(seed + 4), 6);
  return (
    <>
      <TabIntro text="Regras extras que transformam uma carreira comum em uma história para contar.">
        <RerollButton onClick={reroll} />
      </TabIntro>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => (
          <IdeaCard key={c.id} onUse={() => use({ challenge: c.rule })} useLabel="Aceitar desafio">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-xl font-semibold">{c.title}</h3>
              <Badge tone={CHALLENGE_DIFFICULTY_TONE[c.difficulty]}>{c.difficulty}</Badge>
            </div>
            <p className="mt-2 text-sm text-fg-2">{c.rule}</p>
          </IdeaCard>
        ))}
      </div>
    </>
  );
}

function InspirationsTab() {
  const { seed, reroll } = useSeed();
  const use = useUseIdea();
  const ideas = suggestInspirations(createRng(seed + 5), 4);
  return (
    <>
      <TabIntro text="Estilos de jogo de outras épocas para um personagem totalmente novo. Nada de copiar identidade: só a inspiração.">
        <RerollButton onClick={reroll} />
      </TabIntro>
      <div className="grid gap-3 md:grid-cols-2">
        {ideas.map((i) => (
          <IdeaCard
            key={i.id}
            onUse={() => use({ archetypeId: i.archetypeId })}
            useLabel="Usar este estilo"
          >
            <p className="text-sm text-fg-3">{i.era}</p>
            <h3 className="font-display text-2xl font-semibold">{i.title}</h3>
            <p className="text-sm text-fg-2">Arquétipo: {findArchetype(i.archetypeId)?.name}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-fg-2">
              {i.traits.map((t) => (
                <li key={t} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-fg-3">Referência de estilo: {i.reference}</p>
          </IdeaCard>
        ))}
      </div>
    </>
  );
}

const TABS = [
  { id: "clubes", label: "Clubes", icon: Building2, Component: ClubsTab },
  { id: "jogadores", label: "Jogadores", icon: UserRound, Component: PlayersTab },
  { id: "posicoes", label: "Posições", icon: Shirt, Component: PositionsTab },
  { id: "nacionalidades", label: "Nacionalidades", icon: Flag, Component: NationalitiesTab },
  { id: "desafios", label: "Desafios", icon: Swords, Component: ChallengesTab },
  { id: "inspiracoes", label: "Inspirações", icon: Compass, Component: InspirationsTab },
];

export function IdeasView() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Estou sem ideia"
          description="Explore clubes, jogadores, posições e desafios. Ou deixe o app montar tudo por você."
        />

        <section
          className="relative overflow-hidden rounded-lg border border-accent/40 bg-surface-1"
          aria-labelledby="surprise-title"
        >
          <div className="pitch-lines absolute inset-0" aria-hidden="true" />
          <div className="relative flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-xl">
              <Lightbulb className="size-8 text-accent" aria-hidden="true" />
              <h2 id="surprise-title" className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Uma carreira inteira em um clique
              </h2>
              <p className="mt-2 text-fg-2">
                Nome, origem, posição, clube, personalidade, objetivo, desafio e uma história para
                começar.
              </p>
            </div>
            <SurpriseTrigger size="lg" className="h-16 w-full px-8 text-xl sm:w-auto" />
          </div>
        </section>

        <Tabs defaultValue="clubes">
          <TabsList aria-label="Tipos de ideia">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id}>
                <Icon aria-hidden="true" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map(({ id, Component }) => (
            <TabsContent key={id} value={id}>
              <Component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageContainer>
  );
}

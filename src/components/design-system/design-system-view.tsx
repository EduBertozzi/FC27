"use client";

import { Bell, ChevronDown, Goal, Inbox, Plus, Settings, Trophy } from "lucide-react";
import { useState, type ReactNode } from "react";

import { createDemoCareer } from "@/data/mock-career";
import { monthlyContributions, ratingSeries, averageRating } from "@/domain/stats/stats";

import { ContributionsChart } from "../charts/contributions-chart";
import { RatingChart } from "../charts/rating-chart";
import { ResultsBar } from "../charts/results-bar";
import { ClubCrest } from "../football/club-crest";
import { FormGuide } from "../football/form-guide";
import { NationTag } from "../football/nation-tag";
import { OverallSeal } from "../football/overall-seal";
import { PitchPositionPicker } from "../football/pitch-position-picker";
import { PlayerShirt } from "../football/player-shirt";
import { PageContainer, PageHeader } from "../layout/page";
import { MatchRow } from "../match/match-row";
import { Badge, ResultBadge } from "../ui/badge";
import { Button, IconButton } from "../ui/button";
import { Card, CardBody, CardHeader } from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EmptyState, ErrorState, InlineAlert, Skeleton, Spinner } from "../ui/feedback";
import { Field, Input, Select, Textarea } from "../ui/field";
import { NumberStepper } from "../ui/number-stepper";
import { ProgressBar } from "../ui/progress";
import { SegmentedControl } from "../ui/segmented-control";
import { Stat, StatGrid } from "../ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "../ui/toast";
import { Tooltip } from "../ui/tooltip";
import { type PositionCode } from "@/domain/player/positions";

const demo = createDemoCareer();

const COLORS: { group: string; tokens: { name: string; value: string; use: string }[] }[] = [
  {
    group: "Superfícies",
    tokens: [
      { name: "bg", value: "#0e1930", use: "Fundo do app" },
      { name: "surface-1", value: "#14223d", use: "Cards" },
      { name: "surface-2", value: "#1a2c4d", use: "Controles, itens" },
      { name: "surface-3", value: "#22385f", use: "Hover, selecionado" },
      { name: "line", value: "#2a4069", use: "Bordas" },
      { name: "line-strong", value: "#3b5687", use: "Bordas em foco/hover" },
    ],
  },
  {
    group: "Texto",
    tokens: [
      { name: "fg", value: "#f1f4fa", use: "Texto principal (14,4:1)" },
      { name: "fg-2", value: "#b4c0d6", use: "Secundário (8,6:1)" },
      { name: "fg-3", value: "#8e9fbf", use: "Terciário (5,9:1)" },
    ],
  },
  {
    group: "Marca e semântica",
    tokens: [
      { name: "accent", value: "#f6b940", use: "Ação principal, OVR, conquista" },
      { name: "win", value: "#34c27f", use: "Vitória, forma positiva" },
      { name: "draw", value: "#9aa8c2", use: "Empate" },
      { name: "loss", value: "#f4737c", use: "Derrota, erro" },
      { name: "ai", value: "#8fa2ff", use: "Companion de IA, voz" },
      { name: "chart-1", value: "#c07c0c", use: "Série: gols" },
      { name: "chart-2", value: "#6577e6", use: "Série: assistências" },
    ],
  },
];

const TYPE_SCALE = [
  { cls: "text-6xl", label: "6xl · 95px · display", font: "font-display font-bold" },
  { cls: "text-4xl", label: "4xl · 49px · título de página", font: "font-display font-bold" },
  { cls: "text-2xl", label: "2xl · 31px · seção", font: "font-display font-semibold" },
  { cls: "text-lg", label: "lg · 20px · título de card", font: "font-display font-semibold" },
  { cls: "text-base", label: "base · 16px · corpo", font: "" },
  { cls: "text-sm", label: "sm · 14px · apoio", font: "" },
  { cls: "text-xs", label: "xs · 13px · legenda", font: "" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {description ? <p className="text-sm text-fg-3">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DesignSystemView() {
  const [segment, setSegment] = useState<"home" | "away">("home");
  const [stepper, setStepper] = useState(2);
  const [position, setPosition] = useState<PositionCode | undefined>("ATA");
  const seasonMatches = demo.matches;

  return (
    <PageContainer>
      <div className="flex flex-col gap-12">
        <PageHeader
          title="Design System"
          description="Floodlit: tokens e componentes do FC Career Companion. Todas as telas são compostas a partir destas peças."
        />

        <Section
          title="Cores"
          description="Base azul-estádio, dourado de refletor como acento único. Contraste conferido contra as superfícies (WCAG AA)."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {COLORS.map((g) => (
              <Card key={g.group}>
                <CardHeader title={g.group} as="h3" />
                <CardBody>
                  <ul className="flex flex-col gap-3">
                    {g.tokens.map((t) => (
                      <li key={t.name} className="flex items-center gap-3">
                        <span
                          className="size-10 shrink-0 rounded-sm border border-line-strong"
                          style={{ background: t.value }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 text-sm">
                          <p className="font-semibold">
                            {t.name} <span className="font-normal text-fg-3">{t.value}</span>
                          </p>
                          <p className="text-fg-3">{t.use}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="Tipografia"
          description="Barlow Condensed para display e números (placar); Barlow para texto. Escala 1,25."
        >
          <Card>
            <CardBody className="flex flex-col gap-4">
              {TYPE_SCALE.map((t) => (
                <div
                  key={t.cls}
                  className="flex flex-col gap-1 border-b border-line pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-56 shrink-0 text-xs text-fg-3">{t.label}</span>
                  <span className={`${t.cls} ${t.font} truncate leading-tight`}>
                    Rafa Monteiro 19
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>
        </Section>

        <Section
          title="Espaço, raio e elevação"
          description="Base de 4px. Raio cresce com a hierarquia. Sombra só em camadas flutuantes."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader title="Espaçamento" as="h3" />
              <CardBody className="flex flex-col gap-2">
                {[1, 2, 3, 4, 6, 8, 12].map((n) => (
                  <div key={n} className="flex items-center gap-3 text-xs text-fg-3">
                    <span className="tabular w-10">{n * 4}px</span>
                    <span className="h-3 rounded-xs bg-accent" style={{ width: n * 4 }} />
                  </div>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Raio" as="h3" />
              <CardBody className="grid grid-cols-2 gap-3 text-xs text-fg-3">
                {[
                  ["xs · 4px", "rounded-xs", "badges"],
                  ["sm · 8px", "rounded-sm", "controles"],
                  ["md · 12px", "rounded-md", "cards"],
                  ["lg · 20px", "rounded-lg", "herói, modais"],
                ].map(([label, cls, use]) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <span className={`h-12 border border-line-strong bg-surface-2 ${cls}`} />
                    {label} — {use}
                  </div>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Elevação" as="h3" />
              <CardBody className="flex flex-col gap-3 text-xs text-fg-3">
                <div className="rounded-md border border-line bg-surface-1 p-3">
                  0 · card: borda + superfície
                </div>
                <div className="rounded-md bg-surface-2 p-3 shadow-(--shadow-pop)">
                  1 · pop: dropdown, tooltip, toast
                </div>
                <div className="rounded-md bg-surface-1 p-3 shadow-(--shadow-overlay)">
                  2 · overlay: modal, sheet
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>

        <Section
          title="Botões"
          description="Uma ação primária por contexto. Ícone sozinho sempre com nome acessível."
        >
          <Card>
            <CardBody className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <Plus className="size-4" aria-hidden="true" />
                  Primário
                </Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="ghost">Fantasma</Button>
                <Button variant="ai">Assistente</Button>
                <Button variant="danger">Perigo</Button>
                <Button disabled>Desabilitado</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Pequeno</Button>
                <Button size="md">Médio</Button>
                <Button size="lg">Grande</Button>
                <IconButton label="Notificações" variant="secondary">
                  <Bell className="size-5" aria-hidden="true" />
                </IconButton>
                <IconButton label="Configurações">
                  <Settings className="size-5" aria-hidden="true" />
                </IconButton>
              </div>
            </CardBody>
          </Card>
        </Section>

        <Section
          title="Formulários"
          description="Rótulo sempre visível, dica abaixo, erro no próprio campo."
        >
          <Card>
            <CardBody className="grid gap-5 md:grid-cols-2">
              <Field label="Adversário" hint="Sugestões aparecem ao digitar.">
                <Input placeholder="Ex.: Benfica" />
              </Field>
              <Field label="Competição" error="Informe a competição">
                <Input />
              </Field>
              <Field label="Nacionalidade">
                <Select defaultValue="BRA">
                  <option value="BRA">Brasil</option>
                  <option value="POR">Portugal</option>
                </Select>
              </Field>
              <Field label="Observações" optional>
                <Textarea placeholder="Gol de falta no último minuto…" />
              </Field>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fg-2">Controle segmentado</span>
                <SegmentedControl
                  aria-label="Mando"
                  value={segment}
                  onValueChange={setSegment}
                  options={[
                    { value: "home", label: "Casa" },
                    { value: "away", label: "Fora" },
                  ]}
                />
              </div>
              <NumberStepper label="Gols" value={stepper} onChange={setStepper} />
            </CardBody>
          </Card>
        </Section>

        <Section title="Navegação e sobreposições">
          <Card>
            <CardBody className="flex flex-col gap-6">
              <Tabs defaultValue="a">
                <TabsList aria-label="Exemplo de abas">
                  <TabsTrigger value="a">Temporada</TabsTrigger>
                  <TabsTrigger value="b">Carreira</TabsTrigger>
                  <TabsTrigger value="c">Seleção</TabsTrigger>
                </TabsList>
                <TabsContent value="a" className="text-sm text-fg-2">
                  Conteúdo da aba Temporada.
                </TabsContent>
                <TabsContent value="b" className="text-sm text-fg-2">
                  Conteúdo da aba Carreira.
                </TabsContent>
                <TabsContent value="c" className="text-sm text-fg-2">
                  Conteúdo da aba Seleção.
                </TabsContent>
              </Tabs>
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary">Abrir modal</Button>
                  </DialogTrigger>
                  <DialogContent
                    title="Modal / bottom sheet"
                    description="No mobile vira uma folha que sobe da base da tela."
                    footer={<Button>Confirmar</Button>}
                  >
                    <p className="text-sm text-fg-2">
                      Foco preso no diálogo, Esc fecha e o foco volta ao botão que abriu.
                    </p>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary">
                      Dropdown
                      <ChevronDown className="size-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Goal aria-hidden="true" />
                      Registrar gol
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trophy aria-hidden="true" />
                      Adicionar título
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Configurações</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Tooltip content="Overall: nota geral do jogador no jogo.">
                  <Button variant="ghost">Tooltip</Button>
                </Tooltip>
                <Button
                  variant="secondary"
                  onClick={() => toast("Partida registrada", "Estatísticas atualizadas.")}
                >
                  Disparar toast
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        <Section title="Badges e dados">
          <Card>
            <CardBody className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Neutro</Badge>
                <Badge tone="accent">Acento</Badge>
                <Badge tone="win">Vitória</Badge>
                <Badge tone="draw">Empate</Badge>
                <Badge tone="loss">Derrota</Badge>
                <Badge tone="ai">IA</Badge>
                <ResultBadge result="W" />
                <ResultBadge result="D" />
                <ResultBadge result="L" />
                <FormGuide results={["W", "W", "D", "L", "W"]} />
              </div>
              <StatGrid className="grid-cols-2 sm:grid-cols-4">
                <Stat label="Gols" value={18} emphasis sub="0,87 por 90'" />
                <Stat label="Assistências" value={10} />
                <Stat label="Nota média" value="7,5" />
                <Stat label="Minutos" value="1.866" />
              </StatGrid>
              <ProgressBar value={0.72} label="Exemplo de progresso" />
              <ResultsBar wins={15} draws={4} losses={5} />
            </CardBody>
          </Card>
        </Section>

        <Section
          title="Componentes de futebol"
          description="Escudos são monogramas genéricos; nenhum asset oficial de clubes ou do jogo é usado."
        >
          <Card>
            <CardBody className="grid gap-6 md:grid-cols-[1fr_18rem]">
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-end gap-4">
                  <ClubCrest name="Sporting CP" size="xl" />
                  <ClubCrest name="FC Porto" size="lg" />
                  <ClubCrest name="Benfica" />
                  <PlayerShirt number={19} size="lg" />
                  <OverallSeal value={76} size="lg" />
                  <OverallSeal value={64} />
                  <NationTag code="BRA" showName />
                </div>
                <div className="divide-y divide-line rounded-md border border-line px-4">
                  {seasonMatches.slice(-3).map((m) => (
                    <MatchRow key={m.id} match={m} />
                  ))}
                </div>
              </div>
              <PitchPositionPicker value={position} onValueChange={setPosition} />
            </CardBody>
          </Card>
        </Section>

        <Section
          title="Gráficos"
          description="Seguem a skill dataviz: marcas finas, eixo único, legenda com 2+ séries, tooltip e tabela acessível."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader title="Linha (uma série)" as="h3" />
              <CardBody>
                <RatingChart
                  points={ratingSeries(seasonMatches)}
                  average={averageRating(seasonMatches)}
                />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Barras agrupadas" as="h3" />
              <CardBody>
                <ContributionsChart data={monthlyContributions(seasonMatches)} />
              </CardBody>
            </Card>
          </div>
        </Section>

        <Section title="Estados" description="Toda tela trata carregando, vazio, erro e sucesso.">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader title="Carregando" as="h3" />
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-fg-2">
                  <Spinner className="text-accent" /> Interpretando áudio…
                </div>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-20 w-full" />
              </CardBody>
            </Card>
            <Card>
              <EmptyState
                icon={<Inbox />}
                title="Nenhuma partida ainda"
                description="Estados vazios convidam à próxima ação."
                action={<Button size="sm">Registrar partida</Button>}
              />
            </Card>
            <Card>
              <ErrorState
                title="Não foi possível carregar"
                description="Erros explicam o que houve e como resolver."
                onRetry={() => toast("Tentando de novo")}
              />
            </Card>
            <Card>
              <CardBody className="flex flex-col gap-3">
                <InlineAlert tone="success" title="Partida registrada">
                  Estatísticas atualizadas.
                </InlineAlert>
                <InlineAlert tone="warning">
                  Você não informou a nota. Deseja deixar esse campo vazio?
                </InlineAlert>
                <InlineAlert tone="info">
                  Protótipo: respostas do assistente são simuladas.
                </InlineAlert>
                <InlineAlert tone="error" title="Corrija 1 campo">
                  Gols não podem passar do placar do time.
                </InlineAlert>
              </CardBody>
            </Card>
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

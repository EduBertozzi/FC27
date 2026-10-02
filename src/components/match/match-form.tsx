"use client";

import { ChevronDown, Mic, Save } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useRef, useState } from "react";

import { type RegisterMatchOutcome } from "@/application/register-match";
import { type Career } from "@/domain/career/career";
import { resultOf, RESULT_LABEL } from "@/domain/match/match";
import { cn } from "@/lib/cn";
import { formatRating } from "@/lib/format";
import { useCareerStore } from "@/state/career-store";

import { ClubCrest } from "../football/club-crest";
import { ResultBadge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { InlineAlert } from "../ui/feedback";
import { Field, Input, Textarea } from "../ui/field";
import { NumberStepper } from "../ui/number-stepper";
import { SegmentedControl } from "../ui/segmented-control";
import {
  applyExtraction,
  FIELD_LABELS,
  type FieldErrors,
  initialValues,
  issuesToErrors,
  type MatchFormValues,
  toMatchInput,
} from "./match-form-state";
import { VoiceCapture } from "./voice-capture";

interface MatchFormProps {
  career: Career;
  today: string;
  prefill?: Partial<MatchFormValues>;
  startWithVoice?: boolean;
  onSaved: (outcome: RegisterMatchOutcome) => void;
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <h2 className="mb-4 font-display text-lg font-semibold tracking-wide">{title}</h2>
      {children}
    </Card>
  );
}

export function MatchForm({ career, today, prefill, startWithVoice, onSaved }: MatchFormProps) {
  const register = useCareerStore((s) => s.registerMatch);
  const reduceMotion = useReducedMotion();
  const [values, setValues] = useState(() => initialValues(today, prefill));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [voiceOpen, setVoiceOpen] = useState(!!startWithVoice);
  const [showDetails, setShowDetails] = useState(false);
  const [voiceApplied, setVoiceApplied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const ids = { venue: useId(), role: useId(), cards: useId(), comp: useId(), opp: useId() };

  const knownCompetitions = useMemo(
    () => [...new Set(career.matches.map((m) => m.competition))],
    [career.matches],
  );
  const knownOpponents = useMemo(
    () => [...new Set(career.matches.map((m) => m.opponent))].sort(),
    [career.matches],
  );
  const voiceOpponents = useMemo(
    () => [...new Set([...knownOpponents, ...career.fixtures.map((f) => f.opponent)])],
    [knownOpponents, career.fixtures],
  );
  const result = resultOf(values);

  const set = <K extends keyof MatchFormValues>(key: K, value: MatchFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as keyof FieldErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const outcome = register(toMatchInput(values));
    if (outcome.ok) {
      onSaved(outcome.value);
      return;
    }
    setErrors(issuesToErrors(outcome.error.details?.issues));
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const errorList = Object.entries(errors).filter(([, msg]) => msg) as [
    keyof FieldErrors,
    string,
  ][];

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <section
        aria-labelledby="voice-cta"
        className="glass pitch-lines flex flex-col items-center gap-4 rounded-lg px-5 py-7 text-center"
      >
        <motion.button
          type="button"
          onClick={() => setVoiceOpen(true)}
          aria-label="Registrar por voz"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          animate={
            reduceMotion
              ? undefined
              : {
                  boxShadow: [
                    "0 0 0 0px rgb(170 184 255 / 0.28)",
                    "0 0 0 18px rgb(170 184 255 / 0)",
                  ],
                }
          }
          transition={{ boxShadow: { duration: 2.2, repeat: Infinity, ease: "easeOut" } }}
          className="grid size-24 place-items-center rounded-full border border-white/40 text-white [background:radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.7)_0%,rgb(150_170_255/0.6)_45%,rgb(80_100_230/0.75)_100%)]"
        >
          <Mic className="size-10" strokeWidth={1.8} aria-hidden="true" />
        </motion.button>
        <div>
          <h2 id="voice-cta" className="text-xl font-bold">
            Conta como foi
          </h2>
          <p className="mt-1 text-sm text-fg-2">
            Fale do jeito que contaria a um amigo. Você confere tudo antes de salvar.
          </p>
        </div>
        <span className="text-xs font-medium text-fg-3">ou preencha abaixo</span>
      </section>

      {voiceApplied ? (
        <InlineAlert tone="success" title="Dados da voz aplicados">
          Confira os campos abaixo. Nada é salvo até você tocar em &ldquo;Salvar partida&rdquo;.
        </InlineAlert>
      ) : null}

      {errorList.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} className="focus:outline-none">
          <InlineAlert
            tone="error"
            title={`Corrija ${errorList.length === 1 ? "1 campo" : `${errorList.length} campos`} para salvar`}
          >
            <ul className="mt-1 list-disc pl-4">
              {errorList.map(([key, msg]) => (
                <li key={key}>
                  {FIELD_LABELS[key]}: {msg}
                </li>
              ))}
            </ul>
          </InlineAlert>
        </div>
      ) : null}

      <Section title="Jogo">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Adversário" error={errors.opponent}>
            <Input
              value={values.opponent}
              onChange={(e) => set("opponent", e.target.value)}
              list={ids.opp}
              autoComplete="off"
              placeholder="Ex.: Benfica"
            />
          </Field>
          <datalist id={ids.opp}>
            {knownOpponents.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
          <Field label="Competição" error={errors.competition}>
            <Input
              value={values.competition}
              onChange={(e) => set("competition", e.target.value)}
              list={ids.comp}
              autoComplete="off"
              placeholder="Ex.: Liga Portugal"
            />
          </Field>
          <datalist id={ids.comp}>
            {knownCompetitions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <Field label="Data" error={errors.date}>
            <Input type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <div className="flex flex-col gap-1.5">
            <span id={ids.venue} className="text-sm font-medium text-fg-2">
              Mando
            </span>
            <SegmentedControl
              aria-labelledby={ids.venue}
              value={values.venue}
              onValueChange={(v) => set("venue", v)}
              invalid={!!errors.venue}
              options={[
                { value: "home", label: "Casa" },
                { value: "away", label: "Fora" },
                { value: "neutral", label: "Neutro" },
              ]}
            />
            {errors.venue ? (
              <p className="text-xs font-medium text-loss">Escolha casa, fora ou neutro</p>
            ) : null}
          </div>
        </div>
      </Section>

      <Section title="Placar">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 sm:gap-3">
          <div className="flex flex-col items-center gap-2">
            <ClubCrest name={career.currentClub} />
            <NumberStepper
              label={career.currentClub}
              accessibleLabel={`Gols do ${career.currentClub}`}
              value={values.goalsFor}
              onChange={(v) => set("goalsFor", v)}
              max={30}
              size="sm"
              className="w-full [&>span]:truncate [&>span]:text-center"
            />
          </div>
          <div className="flex h-16 flex-col items-center justify-center pb-1">
            <ResultBadge result={result} />
            <span className="mt-1 text-xs text-fg-3" aria-live="polite">
              {RESULT_LABEL[result]}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ClubCrest name={values.opponent || "Adversário"} />
            <NumberStepper
              label={values.opponent || "Adversário"}
              accessibleLabel={`Gols do ${values.opponent || "adversário"}`}
              value={values.goalsAgainst}
              onChange={(v) => set("goalsAgainst", v)}
              max={30}
              size="sm"
              className="w-full [&>span]:truncate [&>span]:text-center"
            />
          </div>
        </div>
      </Section>

      <Section title="Sua atuação">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span id={ids.role} className="text-sm font-medium text-fg-2">
              Começou como
            </span>
            <SegmentedControl
              aria-labelledby={ids.role}
              value={values.role}
              onValueChange={(v) => {
                set("role", v);
                if (v === "substitute" && values.minutes === 90) set("minutes", 30);
                if (v === "starter" && values.minutes === 30) set("minutes", 90);
              }}
              options={[
                { value: "starter", label: "Titular" },
                { value: "substitute", label: "Reserva" },
              ]}
            />
          </div>
          <NumberStepper
            label="Minutos"
            value={values.minutes}
            onChange={(v) => set("minutes", v)}
            min={1}
            max={130}
            step={5}
            error={errors.minutes}
          />
          <NumberStepper
            label="Gols"
            value={values.goals}
            onChange={(v) => set("goals", v)}
            max={15}
            error={errors.goals}
          />
          <NumberStepper
            label="Assistências"
            value={values.assists}
            onChange={(v) => set("assists", v)}
            max={15}
            error={errors.assists}
          />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <NumberStepper
              label="Nota"
              value={values.rating}
              onChange={(v) => set("rating", v)}
              min={1}
              max={10}
              step={0.1}
              format={(v) => (values.hasRating ? formatRating(v) : "–")}
              error={errors.rating}
              className={cn(!values.hasRating && "opacity-50")}
            />
            <label className="inline-flex items-center gap-2 text-sm text-fg-2">
              <input
                type="checkbox"
                checked={!values.hasRating}
                onChange={(e) => set("hasRating", !e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Não sei a nota (deixar em branco)
            </label>
          </div>
        </div>

        <button
          type="button"
          aria-expanded={showDetails}
          onClick={() => setShowDetails((s) => !s)}
          className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-sm text-sm font-semibold text-fg-2 hover:text-fg"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", showDetails && "rotate-180")}
            aria-hidden="true"
          />
          Cartões, substituição e observações
        </button>

        {showDetails ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span id={ids.cards} className="text-sm font-medium text-fg-2">
                Cartões amarelos
              </span>
              <SegmentedControl
                aria-labelledby={ids.cards}
                value={String(values.yellowCards) as "0" | "1" | "2"}
                onValueChange={(v) => set("yellowCards", Number(v))}
                options={[
                  { value: "0", label: "Nenhum" },
                  {
                    value: "1",
                    label: (
                      <>
                        <span
                          className="h-3.5 w-2.5 rounded-[2px] bg-card-yellow"
                          aria-hidden="true"
                        />
                        1
                      </>
                    ),
                  },
                  {
                    value: "2",
                    label: (
                      <>
                        <span
                          className="h-3.5 w-2.5 rounded-[2px] bg-card-yellow"
                          aria-hidden="true"
                        />
                        2
                      </>
                    ),
                  },
                ]}
              />
            </div>
            <label className="flex items-center gap-3 self-end rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={values.redCard}
                onChange={(e) => set("redCard", e.target.checked)}
                className="size-4 accent-[var(--card-red)]"
              />
              <span className="h-3.5 w-2.5 rounded-[2px] bg-card-red" aria-hidden="true" />
              Expulso (cartão vermelho)
            </label>
            <Field
              label={
                values.role === "substitute" ? "Entrou aos (minuto)" : "Substituído aos (minuto)"
              }
              optional
              error={errors.substitutionMinute}
            >
              <Input
                inputMode="numeric"
                value={values.substitutionMinute}
                onChange={(e) => set("substitutionMinute", e.target.value.replace(/\D/g, ""))}
                placeholder="Ex.: 72"
              />
            </Field>
            <Field label="Observações" optional error={errors.notes} className="sm:col-span-2">
              <Textarea
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Gol de falta, discussão com o rival, estreia de chuteira nova…"
              />
            </Field>
          </div>
        ) : null}
      </Section>

      <div className="sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-20 sm:static">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Save className="size-5" aria-hidden="true" />
          Salvar partida
        </Button>
      </div>

      <VoiceCapture
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        knownCompetitions={knownCompetitions}
        knownOpponents={voiceOpponents}
        ownClub={career.currentClub}
        league={career.league}
        today={today}
        onConfirm={(fields) => {
          setValues((v) => applyExtraction(v, fields));
          setErrors({});
          setVoiceApplied(true);
          if (fields.yellowCards || fields.redCard) setShowDetails(true);
        }}
      />
    </form>
  );
}

"use client";

import { useId } from "react";

import { ARCHETYPES } from "@/domain/player/archetypes";
import { CHALLENGES, CLUBS } from "@/domain/ideas/catalog";
import { NATIONALITIES } from "@/domain/player/nationalities";
import { POSITIONS } from "@/domain/player/positions";
import { MAX_OBJECTIVE_LENGTH, MAX_OBJECTIVES, splitObjectives } from "@/domain/player/schema";
import { cn } from "@/lib/cn";
import { formatHeight } from "@/lib/format";

import { PitchPositionPicker } from "../football/pitch-position-picker";
import { Field, Input, Select, Textarea } from "../ui/field";
import { NumberStepper } from "../ui/number-stepper";
import { SegmentedControl } from "../ui/segmented-control";
import { type CreatorValues, type StepErrors } from "./creator-state";

export interface StepProps {
  values: CreatorValues;
  errors: StepErrors;
  set: <K extends keyof CreatorValues>(key: K, value: CreatorValues[K]) => void;
}

const REGIONS = [...new Set(NATIONALITIES.map((n) => n.region))];

export function IdentityStep({ values, errors, set }: StepProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome" error={errors.firstName}>
        <Input
          value={values.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label="Sobrenome" error={errors.lastName}>
        <Input
          value={values.lastName}
          onChange={(e) => set("lastName", e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field
        label="Apelido"
        optional
        hint="Como a torcida e a imprensa vão chamar você."
        error={errors.nickname}
      >
        <Input
          value={values.nickname}
          onChange={(e) => set("nickname", e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label="Nacionalidade" error={errors.nationalityCode}>
        <Select
          value={values.nationalityCode}
          onChange={(e) => set("nationalityCode", e.target.value)}
        >
          <option value="">Escolha um país</option>
          {REGIONS.map((region) => (
            <optgroup key={region} label={region}>
              {NATIONALITIES.filter((n) => n.region === region).map((n) => (
                <option key={n.code} value={n.code}>
                  {n.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>
      <Field
        label="Data de nascimento"
        hint="A idade é calculada automaticamente."
        error={errors.birthDate}
      >
        <Input
          type="date"
          value={values.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          min="1980-01-01"
          max="2012-12-31"
        />
      </Field>
    </div>
  );
}

export function ProfileStep({ values, errors, set }: StepProps) {
  const posLabel = useId();
  const footLabel = useId();
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
      <div className="flex flex-col gap-2">
        <span id={posLabel} className="text-sm font-medium text-fg-2">
          Posição{" "}
          {values.position ? (
            <span className="text-fg">— {POSITIONS[values.position].name}</span>
          ) : null}
        </span>
        <PitchPositionPicker
          aria-labelledby={posLabel}
          value={values.position}
          onValueChange={(v) => set("position", v)}
          invalid={!!errors.position}
        />
        {errors.position ? (
          <p className="text-xs font-medium text-loss" role="alert">
            {errors.position}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span id={footLabel} className="text-sm font-medium text-fg-2">
            Pé dominante
          </span>
          <SegmentedControl
            aria-labelledby={footLabel}
            value={values.preferredFoot}
            onValueChange={(v) => set("preferredFoot", v)}
            options={[
              { value: "right", label: "Direito" },
              { value: "left", label: "Esquerdo" },
              { value: "both", label: "Ambos" },
            ]}
          />
        </div>
        <NumberStepper
          label="Altura"
          value={values.heightCm}
          onChange={(v) => set("heightCm", v)}
          min={150}
          max={210}
          format={formatHeight}
          error={errors.heightCm}
        />
        <NumberStepper
          label="Número da camisa"
          value={values.shirtNumber}
          onChange={(v) => set("shirtNumber", v)}
          min={1}
          max={99}
          error={errors.shirtNumber}
        />
      </div>
    </div>
  );
}

export function ClubStep({ values, errors, set }: StepProps) {
  const listId = useId();
  const archLabel = useId();
  const line = values.position ? POSITIONS[values.position].line : undefined;
  const archetypes = ARCHETYPES.filter((a) => !line || a.lines.includes(line));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Clube inicial"
          hint="Qualquer clube do jogo. Sugestões aparecem ao digitar."
          error={errors.club}
        >
          <Input
            value={values.club}
            onChange={(e) => set("club", e.target.value)}
            list={listId}
            autoComplete="off"
          />
        </Field>
        <datalist id={listId}>
          {CLUBS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.league}
            </option>
          ))}
        </datalist>
        <Field
          label={`Overall inicial: ${values.overall}`}
          hint="No modo carreira, jovens costumam começar entre 55 e 70."
          error={errors.overall}
        >
          <input
            type="range"
            min={40}
            max={90}
            value={values.overall}
            onChange={(e) => set("overall", Number(e.target.value))}
            className="h-11 w-full cursor-pointer accent-[var(--accent)]"
          />
        </Field>
      </div>
      <fieldset>
        <legend id={archLabel} className="text-sm font-medium text-fg-2">
          Arquétipo{" "}
          {line ? <span className="text-fg-3">(compatíveis com a posição escolhida)</span> : null}
        </legend>
        <div
          role="radiogroup"
          aria-labelledby={archLabel}
          className="mt-2 grid gap-2 sm:grid-cols-2"
        >
          {archetypes.map((a) => {
            const checked = values.archetypeId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => set("archetypeId", a.id)}
                className={cn(
                  "rounded-md border p-3 text-left transition-colors",
                  checked
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface-2 hover:border-line-strong",
                )}
              >
                <span className={cn("block font-semibold", checked ? "text-accent" : "text-fg")}>
                  {a.name}
                </span>
                <span className="block text-sm text-fg-3">{a.description}</span>
              </button>
            );
          })}
        </div>
        {errors.archetypeId ? (
          <p className="mt-1.5 text-xs font-medium text-loss" role="alert">
            {errors.archetypeId}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}

const OBJECTIVE_PRESETS = [
  "Chegar à seleção principal",
  "Ser vendido para uma das cinco grandes ligas",
  "Virar ídolo do clube",
  "Conquistar a Champions League",
  "Ser artilheiro da liga",
  "Bater o recorde de assistências",
  "Ganhar uma Copa do Mundo",
];

export function GoalStep({ values, errors, set }: StepProps) {
  const objectives = splitObjectives(values.objective);
  const has = (o: string) => objectives.some((item) => item.toLowerCase() === o.toLowerCase());
  const toggle = (o: string) => {
    const next = has(o)
      ? objectives.filter((item) => item.toLowerCase() !== o.toLowerCase())
      : [...objectives, o];
    set("objective", next.join(", "));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Sugestões de objetivo (pode escolher várias)"
        >
          {OBJECTIVE_PRESETS.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={has(o)}
              onClick={() => toggle(o)}
              className={cn(
                "min-h-9 rounded-full border px-3.5 text-sm transition-colors",
                has(o)
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-fg-2 hover:border-line-strong hover:text-fg",
              )}
            >
              {o}
            </button>
          ))}
        </div>
        <Field
          label="Objetivos"
          hint={`Um ou vários, até ${MAX_OBJECTIVES}. Separe por vírgula ou em linhas diferentes.`}
          error={errors.objective}
        >
          <Textarea
            value={values.objective}
            onChange={(e) => set("objective", e.target.value)}
            placeholder="Conquistar a Champions League, chegar à seleção principal, ganhar uma Copa do Mundo"
          />
        </Field>
        {objectives.length > 0 ? (
          <div aria-live="polite">
            <p className="text-xs font-medium text-fg-3">
              {objectives.length === 1
                ? "1 objetivo será criado"
                : `${objectives.length} objetivos serão criados`}
            </p>
            <ol className="mt-2 flex flex-col gap-1.5">
              {objectives.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className={cn(
                    "flex items-start gap-2 text-sm",
                    item.length > MAX_OBJECTIVE_LENGTH ? "text-loss" : "text-fg-2",
                  )}
                >
                  <span className="tabular mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-semibold text-fg-2">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
      <Field
        label="Desafio"
        optional
        hint="Regras extras para deixar a carreira mais interessante."
        error={errors.challenge}
      >
        <Select value={values.challenge} onChange={(e) => set("challenge", e.target.value)}>
          <option value="">Sem desafio</option>
          {CHALLENGES.map((c) => (
            <option key={c.id} value={c.rule}>
              {c.title} ({c.difficulty})
            </option>
          ))}
          {values.challenge && !CHALLENGES.some((c) => c.rule === values.challenge) ? (
            <option value={values.challenge}>{values.challenge}</option>
          ) : null}
        </Select>
      </Field>
    </div>
  );
}

"use client";

import { ArrowLeft, ArrowRight, Check, Dices, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ageAt } from "@/domain/player/player";
import { cn } from "@/lib/cn";
import { useCareerStore } from "@/state/career-store";
import { useCareerDraft } from "@/state/career-draft";

import { SurpriseTrigger } from "../ideas/surprise-dialog";
import { PageContainer, PageHeader } from "../layout/page";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { InlineAlert } from "../ui/feedback";
import { toast } from "../ui/toast";
import { CreatorPreview } from "./creator-preview";
import {
  EMPTY_CREATOR,
  STEPS,
  type CreatorValues,
  type StepErrors,
  toCareerInput,
  validateStep,
} from "./creator-state";
import { ClubStep, GoalStep, IdentityStep, ProfileStep } from "./creator-steps";

const STEP_COMPONENTS = [IdentityStep, ProfileStep, ClubStep, GoalStep];

function Creator() {
  const router = useRouter();
  const createCareer = useCareerStore((s) => s.createCareer);
  const draft = useCareerDraft((s) => s.draft);
  const draftSource = useCareerDraft((s) => s.source);
  const clearDraft = useCareerDraft((s) => s.clear);
  const [values, setValues] = useState<CreatorValues>(() => ({
    ...EMPTY_CREATOR,
    ...stripUndefined(draft ?? {}),
  }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const today = new Date().toISOString().slice(0, 10);
  const age = /^\d{4}-\d{2}-\d{2}$/.test(values.birthDate) ? ageAt(values.birthDate, today) : null;
  const StepComponent = STEP_COMPONENTS[step] ?? IdentityStep;
  const isLast = step === STEPS.length - 1;

  const set = <K extends keyof CreatorValues>(key: K, value: CreatorValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const stepErrors = validateStep(step, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    if (!isLast) {
      goTo(step + 1);
      return;
    }
    const result = createCareer(toCareerInput(values));
    if (!result.ok) {
      setSubmitError("Alguns dados ficaram inválidos. Revise as etapas anteriores.");
      return;
    }
    clearDraft();
    toast("Carreira criada", `Bem-vindo ao ${values.club}. Boa sorte!`);
    router.push("/");
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Nova carreira"
          description="Monte seu jogador do zero. Tudo pode ser ajustado depois."
          actions={
            <>
              <Button asChild variant="ghost">
                <Link href="/ideias">
                  <Sparkles className="size-4" aria-hidden="true" />
                  Estou sem ideia
                </Link>
              </Button>
              <SurpriseTrigger variant="secondary" />
            </>
          }
        />

        {draft ? (
          <InlineAlert
            tone="info"
            title={draftSource === "surprise" ? "Carreira sorteada carregada" : "Ideia carregada"}
          >
            Os campos já vêm preenchidos com a ideia escolhida. Revise cada etapa e ajuste o que
            quiser.
          </InlineAlert>
        ) : null}

        <ol className="grid grid-cols-4 gap-2" aria-label="Etapas">
          {STEPS.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => (i < step ? goTo(i) : undefined)}
                disabled={i > step}
                aria-current={i === step ? "step" : undefined}
                className="flex w-full flex-col gap-2 text-left disabled:cursor-default"
              >
                <span
                  className={cn("h-1 rounded-full", i <= step ? "bg-accent" : "bg-surface-3")}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:block",
                    i === step ? "text-fg" : "text-fg-3",
                  )}
                >
                  {i + 1}. {s.title}
                </span>
                <span className="sr-only sm:hidden">
                  Etapa {i + 1}: {s.title}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Card className="p-4 sm:p-6">
            <p className="text-sm text-fg-3">
              Etapa {step + 1} de {STEPS.length}
            </p>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="mb-5 font-display text-2xl font-semibold focus:outline-none"
            >
              {STEPS[step]?.title}
            </h2>
            <StepComponent values={values} errors={errors} set={set} />
            {submitError ? (
              <InlineAlert tone="error" className="mt-5">
                {submitError}
              </InlineAlert>
            ) : null}
            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-between">
              <Button
                variant="ghost"
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                className={cn(step === 0 && "invisible")}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Voltar
              </Button>
              <Button onClick={next} size="lg">
                {isLast ? (
                  <>
                    <Check className="size-5" aria-hidden="true" />
                    Começar carreira
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </Card>
          <aside
            className={cn(
              "lg:sticky lg:top-10 lg:block lg:self-start",
              isLast ? "block" : "hidden",
            )}
            aria-label="Resumo do jogador"
          >
            <CreatorPreview values={values} age={age} />
            <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-3">
              <Dices className="size-3.5" aria-hidden="true" />
              Escudos são monogramas ilustrativos.
            </p>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function CreatorView() {
  const version = useCareerDraft((s) => s.version);
  return <Creator key={version} />;
}

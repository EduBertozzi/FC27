"use client";

import { Check, CircleHelp, Keyboard, Mic, RotateCcw, Square, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ROLE_LABEL, VENUE_LABEL } from "@/domain/match/match";
import { type MatchInput } from "@/domain/match/schema";
import { getServices } from "@/infrastructure/registry";
import { type ExtractionResult } from "@/infrastructure/voice/types";
import { cn } from "@/lib/cn";
import { formatRating } from "@/lib/format";
import { logger } from "@/lib/logger";

import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { InlineAlert, Spinner } from "../ui/feedback";
import { Field, Textarea } from "../ui/field";
import { FIELD_LABELS } from "./match-form-state";

type Step = "idle" | "recording" | "typing" | "processing" | "review" | "error";

interface VoiceCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knownCompetitions: string[];
  today: string;
  onConfirm: (fields: Partial<MatchInput>) => void;
}

const PREVIEW_ORDER: (keyof MatchInput)[] = [
  "opponent",
  "competition",
  "venue",
  "goalsFor",
  "role",
  "minutes",
  "goals",
  "assists",
  "rating",
  "yellowCards",
];

function describe(field: keyof MatchInput, fields: Partial<MatchInput>): string | undefined {
  switch (field) {
    case "goalsFor":
      return fields.goalsFor !== undefined && fields.goalsAgainst !== undefined
        ? `${fields.goalsFor}–${fields.goalsAgainst}`
        : undefined;
    case "venue":
      return fields.venue ? VENUE_LABEL[fields.venue] : undefined;
    case "role":
      return fields.role ? ROLE_LABEL[fields.role] : undefined;
    case "rating":
      return fields.rating !== undefined && fields.rating !== null
        ? formatRating(fields.rating)
        : undefined;
    case "yellowCards":
      return fields.yellowCards !== undefined ? String(fields.yellowCards) : undefined;
    default: {
      const value = fields[field];
      return value === undefined ? undefined : String(value);
    }
  }
}

/**
 * Fluxo de voz (Fase 1 simulada): gravar → transcrever → interpretar → prévia → confirmar.
 * Nenhum áudio é captado nem armazenado neste protótipo; a transcrição vem do provedor mock.
 */
export function VoiceCapture({
  open,
  onOpenChange,
  knownCompetitions,
  today,
  onConfirm,
}: VoiceCaptureProps) {
  const [step, setStep] = useState<Step>("idle");
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    setStep("idle");
    setSeconds(0);
    setText("");
    setResult(null);
  };

  const interpret = async (transcript: string) => {
    setStep("processing");
    try {
      const extraction = await getServices().matchExtractor.extract(transcript, {
        knownCompetitions,
        today,
      });
      setText(extraction.transcript);
      setResult(extraction);
      setStep("review");
    } catch (error) {
      logger.error("voice.extraction_failed", error);
      setStep("error");
    }
  };

  const startRecording = () => {
    setStep("recording");
    setSeconds(0);
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const stopRecording = async () => {
    if (timer.current) clearInterval(timer.current);
    setStep("processing");
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const { text: transcript } = await getServices().transcription.transcribe(new Blob());
      await interpret(transcript);
    } catch (error) {
      logger.error("voice.transcription_failed", error);
      setStep("error");
    }
  };

  const fieldsFound = result
    ? PREVIEW_ORDER.filter((f) => describe(f, result.fields) !== undefined)
    : [];
  const fieldsMissing = result
    ? PREVIEW_ORDER.filter((f) => describe(f, result.fields) === undefined)
    : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent
        title="Registrar por voz"
        description="Conte a partida como contaria a um amigo. Você revisa tudo antes de salvar."
        footer={
          step === "review" && result ? (
            <>
              <Button variant="secondary" onClick={reset}>
                <RotateCcw className="size-4" aria-hidden="true" />
                Recomeçar
              </Button>
              <Button
                onClick={() => {
                  onConfirm(result.fields);
                  onOpenChange(false);
                  reset();
                }}
                disabled={fieldsFound.length === 0}
              >
                <Check className="size-4" aria-hidden="true" />
                Usar no formulário
              </Button>
            </>
          ) : undefined
        }
      >
        {step === "idle" ? (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <button
              type="button"
              onClick={startRecording}
              className="grid size-24 place-items-center rounded-full bg-ai text-on-accent shadow-[0_0_0_10px_var(--ai-soft)] transition-transform active:scale-95"
            >
              <Mic className="size-10" aria-hidden="true" />
              <span className="sr-only">Começar a gravar</span>
            </button>
            <p className="max-w-sm text-sm text-fg-2">
              Ex.: &ldquo;Joguei contra o Arsenal, ganhamos de três a um, fiz dois gols e dei uma
              assistência. Tirei nota nove.&rdquo;
            </p>
            <Button variant="ghost" size="sm" onClick={() => setStep("typing")}>
              <Keyboard className="size-4" aria-hidden="true" />
              Prefiro digitar
            </Button>
            <InlineAlert tone="info" className="text-left">
              Protótipo: a gravação é simulada e nenhum áudio é captado ou armazenado.
            </InlineAlert>
          </div>
        ) : null}

        {step === "recording" ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center" role="status">
            <div className="flex h-16 items-center gap-1" aria-hidden="true">
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  className="w-1.5 animate-pulse rounded-full bg-ai"
                  style={{
                    height: `${20 + ((i * 37) % 44)}px`,
                    animationDelay: `${(i % 6) * 120}ms`,
                  }}
                />
              ))}
            </div>
            <p className="tabular font-display text-3xl font-semibold">
              0:{String(seconds).padStart(2, "0")}
              <span className="sr-only"> segundos gravando</span>
            </p>
            <Button variant="danger" size="lg" onClick={stopRecording}>
              <Square className="size-5" aria-hidden="true" />
              Parar e transcrever
            </Button>
          </div>
        ) : null}

        {step === "typing" ? (
          <div className="flex flex-col gap-4">
            <Field label="Como foi a partida?">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder="Joguei contra o Arsenal, ganhamos de três a um…"
              />
            </Field>
            <Button onClick={() => interpret(text)} disabled={text.trim().length < 5}>
              <Wand2 className="size-4" aria-hidden="true" />
              Interpretar
            </Button>
          </div>
        ) : null}

        {step === "processing" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-fg-2" role="status">
            <Spinner className="size-8 text-ai" label="Interpretando" />
            Transcrevendo e interpretando…
          </div>
        ) : null}

        {step === "error" ? (
          <InlineAlert tone="error" title="Não deu para interpretar agora">
            O serviço de voz não respondeu. Tente de novo ou preencha o formulário manualmente.
            <Button variant="secondary" size="sm" className="mt-3" onClick={reset}>
              Tentar de novo
            </Button>
          </InlineAlert>
        ) : null}

        {step === "review" && result ? (
          <div className="flex flex-col gap-4">
            <Field
              label="Transcrição"
              hint="Corrija se algo foi entendido errado e interprete de novo."
            >
              <Textarea value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => interpret(text)}
            >
              <Wand2 className="size-4" aria-hidden="true" />
              Interpretar de novo
            </Button>

            <section aria-labelledby="voice-found">
              <h3 id="voice-found" className="text-sm font-semibold text-fg">
                Entendi
              </h3>
              {fieldsFound.length > 0 ? (
                <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {fieldsFound.map((f) => (
                    <div key={f} className="rounded-sm border border-win/30 bg-win-soft px-3 py-2">
                      <dt className="text-xs text-fg-3">{FIELD_LABELS[f]}</dt>
                      <dd className="font-semibold text-fg">{describe(f, result.fields)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-1 text-sm text-fg-3">Nada foi identificado.</p>
              )}
            </section>

            {fieldsMissing.length > 0 ? (
              <section aria-labelledby="voice-missing">
                <h3
                  id="voice-missing"
                  className="flex items-center gap-1.5 text-sm font-semibold text-fg"
                >
                  <CircleHelp className="size-4 text-accent" aria-hidden="true" />
                  Não foi dito — fica em branco
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {fieldsMissing.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "rounded-sm border border-dashed border-line-strong px-2.5 py-1 text-sm text-fg-3",
                      )}
                    >
                      {FIELD_LABELS[f]}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {result.questions.map((q) => (
              <InlineAlert key={q} tone="warning">
                {q}
              </InlineAlert>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Check, CircleHelp, Keyboard, Mic, RotateCcw, Square, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ROLE_LABEL, VENUE_LABEL } from "@/domain/match/match";
import { type MatchInput } from "@/domain/match/schema";
import { getServices } from "@/infrastructure/registry";
import { type ExtractionResult, type LiveTranscriptionError } from "@/infrastructure/voice/types";
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
const VOICE_ERROR_MESSAGE: Record<LiveTranscriptionError, string> = {
  "not-supported": "Este navegador não reconhece fala. Digite o relato abaixo.",
  "permission-denied":
    "O microfone foi bloqueado. Libere o acesso ao microfone para este site nas configurações do navegador e tente de novo.",
  "no-microphone": "Nenhum microfone encontrado. Conecte um microfone ou digite o relato.",
  "no-speech": "Não ouvi nada. Toque no microfone e fale mais perto do aparelho.",
  network:
    "O serviço de fala do navegador está sem conexão. Verifique a internet ou digite o relato.",
  unknown: "O reconhecimento de fala falhou. Tente de novo ou digite o relato.",
};

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
  const [live, setLive] = useState("");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [voiceError, setVoiceError] = useState<LiveTranscriptionError | null>(null);
  const [supported, setSupported] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedByUser = useRef(false);

  useEffect(() => {
    // Detectado só no cliente: o servidor não sabe qual navegador será usado.
    const id = requestAnimationFrame(() =>
      setSupported(getServices().liveTranscriber.isSupported()),
    );
    return () => {
      cancelAnimationFrame(id);
      if (timer.current) clearInterval(timer.current);
      getServices().liveTranscriber.abort();
    };
  }, []);

  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const reset = () => {
    clearTimer();
    getServices().liveTranscriber.abort();
    setStep("idle");
    setSeconds(0);
    setText("");
    setLive("");
    setResult(null);
    setVoiceError(null);
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
    setVoiceError(null);
    setLive("");
    setSeconds(0);
    stoppedByUser.current = false;
    setStep("recording");
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    getServices().liveTranscriber.start(
      {
        onText: setLive,
        onError: (error) => {
          clearTimer();
          logger.warn("voice.live_error", { error });
          setVoiceError(error);
          setStep(error === "not-supported" ? "typing" : "idle");
        },
        onEnd: (finalText) => {
          clearTimer();
          const transcript = finalText.trim();
          if (transcript) void interpret(transcript);
          else if (stoppedByUser.current) {
            setVoiceError("no-speech");
            setStep("idle");
          }
        },
      },
      { language: "pt-BR" },
    );
  };

  const stopRecording = () => {
    stoppedByUser.current = true;
    getServices().liveTranscriber.stop();
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
              disabled={!supported}
              className="grid size-28 place-items-center rounded-full border border-white/40 text-white shadow-[0_0_0_14px_rgb(170_184_255/0.12),0_0_0_32px_rgb(170_184_255/0.06)] transition-transform [background:radial-gradient(circle_at_35%_30%,rgb(255_255_255/0.7)_0%,rgb(150_170_255/0.6)_45%,rgb(80_100_230/0.75)_100%)] active:scale-95 disabled:opacity-40"
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
            {voiceError ? (
              <InlineAlert tone="error" className="text-left">
                {VOICE_ERROR_MESSAGE[voiceError]}
              </InlineAlert>
            ) : null}
            {!supported ? (
              <InlineAlert tone="warning" className="text-left">
                Este navegador não reconhece fala. Use Chrome, Edge ou Safari, ou digite o relato.
              </InlineAlert>
            ) : (
              <p className="max-w-sm text-xs text-fg-3">
                Usa o reconhecimento de fala do seu navegador. O app não grava nem guarda o áudio.
              </p>
            )}
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
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
              <span className="sr-only"> ouvindo</span>
            </p>
            <p className="min-h-16 max-w-md text-lg leading-relaxed text-fg" aria-live="polite">
              {live || <span className="text-fg-3">Pode falar…</span>}
            </p>
            <Button variant="danger" size="lg" onClick={stopRecording}>
              <Square className="size-5" aria-hidden="true" />
              Parar e interpretar
            </Button>
          </div>
        ) : null}

        {step === "typing" ? (
          <div className="flex flex-col gap-4">
            {voiceError ? (
              <InlineAlert tone="warning">{VOICE_ERROR_MESSAGE[voiceError]}</InlineAlert>
            ) : null}
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

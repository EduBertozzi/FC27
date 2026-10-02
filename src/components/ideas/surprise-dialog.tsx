"use client";

import { Dices, Shuffle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { generateCareerConcept, type CareerConcept } from "@/domain/ideas/generators";
import { cn } from "@/lib/cn";
import { createRng, randomSeed } from "@/lib/random";
import { conceptToDraft, useCareerDraft } from "@/state/career-draft";

import { Button, type ButtonProps } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { ConceptCard } from "./concept-card";

const SHUFFLE_MS = 900;

function useSurprise() {
  const [concept, setConcept] = useState<CareerConcept | null>(null);
  const [rolling, setRolling] = useState(false);
  const [ticker, setTicker] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const roll = () => {
    timers.current.forEach(clearTimeout);
    setRolling(true);
    const final = generateCareerConcept(createRng(randomSeed()));
    // Prévia "girando" com nomes aleatórios antes da revelação.
    for (let i = 0; i < 8; i++) {
      timers.current.push(
        setTimeout(
          () => {
            const c = generateCareerConcept(createRng(randomSeed()));
            setTicker(`${c.firstName} ${c.lastName} · ${c.club.name}`);
          },
          i * (SHUFFLE_MS / 8),
        ),
      );
    }
    timers.current.push(
      setTimeout(() => {
        setConcept(final);
        setRolling(false);
      }, SHUFFLE_MS),
    );
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { concept, rolling, ticker, roll };
}

interface SurpriseTriggerProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  compact?: boolean;
  className?: string;
  onOpen?: () => void;
}

/** Botão "Surpreenda-me" + diálogo de revelação. Pode ser usado em qualquer tela. */
export function SurpriseTrigger({
  variant = "primary",
  size = "md",
  compact,
  className,
  onOpen,
}: SurpriseTriggerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const setDraft = useCareerDraft((s) => s.setDraft);
  const { concept, rolling, ticker, roll } = useSurprise();

  const start = () => {
    onOpen?.();
    setOpen(true);
    roll();
  };

  const accept = () => {
    if (!concept) return;
    setDraft(conceptToDraft(concept), "surprise");
    setOpen(false);
    router.push("/nova-carreira?origem=surpresa");
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={start} className={className}>
        <Dices className={size === "lg" ? "size-6" : "size-4"} aria-hidden="true" />
        {compact ? "Surpreenda" : "Surpreenda-me"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          title="Sua próxima carreira"
          description="Uma carreira completa gerada na hora. Gostou? Leve para o criador e ajuste o que quiser."
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={roll} disabled={rolling}>
                <Shuffle className="size-4" aria-hidden="true" />
                Gerar outra
              </Button>
              <Button onClick={accept} disabled={rolling || !concept}>
                <Sparkles className="size-4" aria-hidden="true" />
                Começar esta carreira
              </Button>
            </>
          }
        >
          {rolling || !concept ? (
            <div
              className="flex min-h-80 flex-col items-center justify-center gap-4 text-center"
              aria-busy="true"
            >
              <Dices className="size-10 animate-bounce text-accent" aria-hidden="true" />
              <p
                className="tabular font-display text-2xl font-semibold text-fg-2"
                aria-hidden="true"
              >
                {ticker || "Sorteando…"}
              </p>
              <p className="sr-only" role="status">
                Gerando carreira
              </p>
            </div>
          ) : (
            <ConceptCard
              key={concept.firstName + concept.lastName + concept.club.name}
              concept={concept}
              className={cn("mb-1")}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

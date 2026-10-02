"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { formatMarketValue } from "@/lib/format";
import { useActiveCareer, useCareerStore } from "@/state/career-store";
import { useCareerOverview } from "@/state/selectors";

import { Button, type ButtonProps } from "../ui/button";
import { Dialog, DialogClose, DialogContent } from "../ui/dialog";
import { InlineAlert } from "../ui/feedback";
import { Field, Input } from "../ui/field";
import { NumberStepper } from "../ui/number-stepper";
import { toast } from "../ui/toast";

interface UpdateOverallDialogProps {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

/** "Subi de overall": atualiza overall (e, se quiser, valor de mercado) a partir do jogo. */
export function UpdateOverallDialog({
  variant = "secondary",
  size = "sm",
  className,
}: UpdateOverallDialogProps) {
  const career = useActiveCareer();
  const { today } = useCareerOverview(career);
  const update = useCareerStore((s) => s.updateOverall);
  const [open, setOpen] = useState(false);
  const [overall, setOverall] = useState(career.player.overall);
  const [date, setDate] = useState(today);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const current = career.player.overall;
  const delta = overall - current;

  const reset = () => {
    setOverall(career.player.overall);
    setDate(today);
    setValue("");
    setError(null);
  };

  const save = () => {
    const millions = value.trim() ? Number(value.replace(",", ".")) : undefined;
    if (millions !== undefined && !Number.isFinite(millions)) {
      setError("Valor de mercado inválido. Use números, ex.: 42,5");
      return;
    }
    const result = update({
      overall,
      date,
      marketValue: millions !== undefined ? Math.round(millions * 1_000_000) : undefined,
    });
    if (!result.ok) {
      const issues = result.error.details?.issues as { message: string }[] | undefined;
      setError(issues?.[0]?.message ?? "Não foi possível salvar");
      return;
    }
    setOpen(false);
    toast(
      delta === 0 ? "Dados atualizados" : `Overall ${delta > 0 ? "subiu" : "caiu"} para ${overall}`,
      result.value.event ? "Registrado na timeline e no gráfico de evolução." : undefined,
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) reset();
        setOpen(o);
      }}
    >
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <TrendingUp className="size-4" aria-hidden="true" />
        Atualizar overall
      </Button>
      <DialogContent
        title="Atualizar overall"
        description="Mudou no jogo? Registre aqui. Entra no gráfico de evolução e na timeline."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button onClick={save}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <NumberStepper
              label="Novo overall"
              value={overall}
              onChange={setOverall}
              min={40}
              max={99}
              size="lg"
              className="w-full max-w-72"
            />
            <span
              aria-live="polite"
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
                delta > 0
                  ? "bg-win-soft text-win"
                  : delta < 0
                    ? "bg-loss-soft text-loss"
                    : "bg-surface-2 text-fg-2",
              )}
            >
              {delta > 0 ? (
                <TrendingUp className="size-4" aria-hidden="true" />
              ) : delta < 0 ? (
                <TrendingDown className="size-4" aria-hidden="true" />
              ) : null}
              {delta === 0
                ? `Atual: ${current}`
                : `${delta > 0 ? "+" : ""}${delta} (era ${current})`}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data no jogo">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field
              label="Valor de mercado (€ mi)"
              optional
              hint={`Atual: ${formatMarketValue(career.marketValue)}`}
            >
              <Input
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex.: 42,5"
              />
            </Field>
          </div>
          {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

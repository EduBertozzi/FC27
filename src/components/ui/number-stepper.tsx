"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/cn";

interface NumberStepperProps {
  label: string;
  /** Nome acessível mais específico que o rótulo visível (ex.: "Gols do Benfica"). */
  accessibleLabel?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Formata o valor exibido (ex.: nota com vírgula). */
  format?: (value: number) => string;
  size?: "sm" | "md" | "lg";
  className?: string;
  error?: string;
}

/** Contador com botões grandes — rápido no toque, acessível como spinbutton. */
export function NumberStepper({
  label,
  accessibleLabel,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  format,
  size = "md",
  className,
  error,
}: NumberStepperProps) {
  const id = useId();
  const name = accessibleLabel ?? label;
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 10) / 10));
  const btn = cn(
    "grid place-items-center rounded-full bg-surface-2 text-fg transition-colors hover:bg-surface-3 hover:text-fg active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent",
    size === "lg" ? "size-12" : size === "sm" ? "size-9" : "size-10",
  );
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span id={`${id}-label`} className="text-sm font-medium text-fg-2">
        {label}
      </span>
      <div
        className={cn(
          "flex items-center justify-between rounded-full border bg-surface-1 p-1",
          error ? "border-loss" : "border-line",
        )}
      >
        <button
          type="button"
          className={btn}
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Diminuir ${name.toLowerCase()}`}
        >
          <Minus className="size-5" aria-hidden="true" />
        </button>
        <div
          role="spinbutton"
          tabIndex={0}
          aria-label={accessibleLabel}
          aria-labelledby={accessibleLabel ? undefined : `${id}-label`}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={format ? format(value) : String(value)}
          aria-invalid={!!error || undefined}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
              e.preventDefault();
              onChange(clamp(value + step));
            }
            if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
              e.preventDefault();
              onChange(clamp(value - step));
            }
            if (e.key === "Home") {
              e.preventDefault();
              onChange(min);
            }
            if (e.key === "End") {
              e.preventDefault();
              onChange(max);
            }
          }}
          className={cn(
            "tabular min-w-12 rounded-xs text-center font-display font-bold text-fg",
            size === "lg" ? "text-3xl" : "text-2xl",
          )}
        >
          {format ? format(value) : value}
        </div>
        <button
          type="button"
          className={btn}
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Aumentar ${name.toLowerCase()}`}
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <p className="text-xs font-medium text-loss" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

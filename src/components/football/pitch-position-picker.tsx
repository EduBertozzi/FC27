"use client";

import { RadioGroup } from "radix-ui";

import { POSITIONS, type PositionCode } from "@/domain/player/positions";
import { cn } from "@/lib/cn";

interface PitchPositionPickerProps {
  value: PositionCode | undefined;
  onValueChange: (value: PositionCode) => void;
  invalid?: boolean;
  "aria-labelledby"?: string;
}

/** Escolha de posição sobre o campo — radio group acessível por teclado. */
export function PitchPositionPicker({
  value,
  onValueChange,
  invalid,
  ...aria
}: PitchPositionPickerProps) {
  return (
    <RadioGroup.Root
      value={value ?? ""}
      onValueChange={(v) => onValueChange(v as PositionCode)}
      className={cn(
        "relative mx-auto aspect-[68/90] w-full max-w-80 overflow-hidden rounded-md border bg-[#173a2c]",
        invalid ? "border-loss" : "border-line",
      )}
      {...aria}
    >
      <svg viewBox="0 0 68 90" className="absolute inset-0 size-full" aria-hidden="true">
        <g fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="0.4">
          <rect x="3" y="3" width="62" height="84" />
          <line x1="3" y1="45" x2="65" y2="45" />
          <circle cx="34" cy="45" r="7.5" />
          <rect x="17" y="3" width="34" height="13" />
          <rect x="17" y="74" width="34" height="13" />
          <rect x="26" y="3" width="16" height="5" />
          <rect x="26" y="82" width="16" height="5" />
        </g>
        {Array.from({ length: 6 }, (_, i) => (
          <rect
            key={i}
            x="3"
            y={3 + i * 14}
            width="62"
            height="7"
            fill="rgb(255 255 255 / 0.025)"
          />
        ))}
      </svg>
      {Object.values(POSITIONS).map((p) => (
        <RadioGroup.Item
          key={p.code}
          value={p.code}
          aria-label={p.name}
          title={p.name}
          style={{ left: `${p.pitch.x}%`, top: `${p.pitch.y}%` }}
          className={cn(
            "absolute grid h-8 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border px-1.5 font-display text-sm font-bold transition-[background-color,transform]",
            "border-white/30 bg-[#0e1930]/80 text-fg-2 hover:scale-105 hover:border-white/60 hover:text-fg",
            "data-[state=checked]:scale-110 data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-on-accent",
          )}
        >
          {p.code}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

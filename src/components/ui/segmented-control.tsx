"use client";

import { RadioGroup } from "radix-ui";
import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Classes literais aplicadas quando selecionado, ex.: "data-[state=checked]:bg-win". */
  activeClassName?: string;
}

interface SegmentedControlProps<T extends string> {
  value: T | undefined;
  onValueChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  invalid?: boolean;
}

/** Escolha exclusiva com poucas opções — navegável por setas (roving focus). */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  invalid,
  ...aria
}: SegmentedControlProps<T>) {
  return (
    <RadioGroup.Root
      value={value ?? ""}
      onValueChange={(v) => onValueChange(v as T)}
      orientation="horizontal"
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-1 rounded-sm border border-line bg-surface-2 p-1",
        invalid && "border-loss",
        className,
      )}
      {...aria}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "flex h-9 items-center justify-center gap-1.5 rounded-xs px-2 text-sm font-semibold text-fg-2 transition-colors",
            "hover:text-fg data-[state=checked]:bg-surface-3 data-[state=checked]:text-fg data-[state=checked]:shadow-[inset_0_0_0_1px_var(--line-strong)]",
            option.activeClassName,
            "[&_svg]:size-4",
          )}
        >
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

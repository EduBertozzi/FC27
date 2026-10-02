import { type ComponentProps } from "react";

import { RESULT_LABEL, RESULT_SHORT, type MatchResult } from "@/domain/match/match";
import { cn } from "@/lib/cn";

const TONES = {
  neutral: "bg-surface-3 text-fg-2",
  accent: "bg-accent-soft text-accent",
  win: "bg-win-soft text-win",
  draw: "bg-draw-soft text-draw",
  loss: "bg-loss-soft text-loss",
  ai: "bg-ai-soft text-ai",
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}

const RESULT_TONE: Record<MatchResult, string> = {
  W: "bg-win text-on-accent",
  D: "bg-draw text-on-accent",
  L: "bg-loss text-on-accent",
};

/** Resultado V/E/D: cor + letra + nome acessível (nunca só cor). */
export function ResultBadge({
  result,
  size = "md",
  className,
}: {
  result: MatchResult;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={RESULT_LABEL[result]}
      title={RESULT_LABEL[result]}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-display font-bold",
        size === "md" ? "size-7 text-base" : "size-5 text-xs",
        RESULT_TONE[result],
        className,
      )}
    >
      {RESULT_SHORT[result]}
    </span>
  );
}

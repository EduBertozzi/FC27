import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number; // 0–1
  label: string;
  tone?: "accent" | "win" | "ai";
  className?: string;
}

const FILL = { accent: "bg-accent", win: "bg-win", ai: "bg-ai" } as const;

export function ProgressBar({ value, label, tone = "accent", className }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn("h-2 overflow-hidden rounded-full bg-surface-3", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", FILL[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
